import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/* ------------------------------------------------------------------ *
 *  useThreeMug — a thin imperative wrapper around a Three.js scene.
 *
 *  Design rule: NOTHING here is Vue-reactive. The scene graph,
 *  renderer, materials and textures live in plain closure variables so
 *  Vue never proxies a WebGL object. The component drives the scene by
 *  calling these methods inside watchers — a one-way reactive → 3D
 *  bridge that keeps the render loop allocation-free and predictable.
 * ------------------------------------------------------------------ */

export type MugMaterial = 'matte' | 'glass'

export interface MugHandle {
  /** Boot the renderer + scene against a canvas; `decal` feeds CanvasTexture. */
  mount: (canvas: HTMLCanvasElement, decal: HTMLCanvasElement) => void
  /** Swap the body material between matte plastic and iridescent glass. */
  setMaterial: (kind: MugMaterial) => void
  /** Reposition the key light on the X / Z plane (Y stays fixed, overhead). */
  setLight: (x: number, z: number) => void
  /** Flag the CanvasTexture for re-upload after the 2D canvas changed. */
  markDecalDirty: () => void
  /** Toggle the gentle idle turntable (off when the user prefers reduced motion). */
  setAutoRotate: (on: boolean) => void
  /** Tear everything down — GPU resources, observers, RAF. */
  dispose: () => void
}

const BODY_TINT = 0xbfe9ff // cool tint that the iridescence rides on top of

export function useThreeMug(): MugHandle {
  let renderer: THREE.WebGLRenderer | null = null
  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let controls: OrbitControls
  let pmrem: THREE.PMREMGenerator

  let group: THREE.Group
  let outer: THREE.Mesh
  let trims: THREE.Mesh[] = [] // bottom, inner wall, inner floor, rim, handle

  let keyLight: THREE.DirectionalLight
  let decalTex: THREE.CanvasTexture

  // Material variants are built once and swapped by reference — never rebuilt
  // on the hot path. Only the outer wall carries the decal map; the trim
  // (caps / handle / interior) is map-less so the drawing never smears, and
  // follows the same matte/glass choice so glass mode is glass all the way.
  let matteBody: THREE.MeshStandardMaterial
  let glassBody: THREE.MeshPhysicalMaterial
  let matteTrim: THREE.MeshStandardMaterial
  let glassTrim: THREE.MeshPhysicalMaterial

  let ro: ResizeObserver | null = null
  let raf = 0
  let disposed = false

  /* ----------------------------- build ----------------------------- */

  function buildMaterials() {
    matteBody = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.82,
      metalness: 0.02,
    })
    // DoubleSide on the trim: the sealed caps must render from whichever side
    // the camera ends up on, so no orientation leaves a see-through hole.
    matteTrim = new THREE.MeshStandardMaterial({
      color: 0xf2f2f4,
      roughness: 0.82,
      metalness: 0.02,
      side: THREE.DoubleSide,
    })

    const glassCommon = {
      color: BODY_TINT,
      roughness: 0.05,
      metalness: 0,
      transmission: 0.92, // < 1 so the drawing reads as "etched" tint
      thickness: 0.7,
      ior: 1.45,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      iridescence: 1,
      iridescenceIOR: 1.32,
      iridescenceThicknessRange: [120, 440] as [number, number],
      transparent: true,
      envMapIntensity: 1.1,
    }
    glassBody = new THREE.MeshPhysicalMaterial(glassCommon)
    glassTrim = new THREE.MeshPhysicalMaterial({ ...glassCommon, side: THREE.DoubleSide })
  }

  function buildMug(decal: HTMLCanvasElement) {
    decalTex = new THREE.CanvasTexture(decal)
    decalTex.colorSpace = THREE.SRGBColorSpace
    decalTex.anisotropy = renderer!.capabilities.getMaxAnisotropy()
    // The texture wraps once around the body; clamp avoids edge bleed at the seam.
    decalTex.wrapS = THREE.ClampToEdgeWrapping
    decalTex.wrapT = THREE.ClampToEdgeWrapping
    matteBody.map = decalTex
    glassBody.map = decalTex

    group = new THREE.Group()

    // Mug profile — every piece shares these radii / heights so the parts meet
    // flush and the body is watertight (no gap to see through from any angle).
    const H = 2.2 // wall height  → y ∈ [-1.1, 1.1]
    const R_TOP = 1.0
    const R_BOT = 0.9
    const R_IN = 0.84 // inner wall (gives the wall a visible thickness)
    const Y_TOP = H / 2
    const Y_BOT = -H / 2
    const Y_FLOOR = Y_BOT + 0.12 // cup floor sits just above the sealed base

    // Outer wall — open-ended so the UV runs cleanly 0→1 around the side.
    const outerGeo = new THREE.CylinderGeometry(R_TOP, R_BOT, H, 128, 1, true)
    outer = new THREE.Mesh(outerGeo, matteBody)
    outer.castShadow = true
    outer.receiveShadow = true

    // Sealed bottom — a disc flush with the wall's bottom edge. THIS is what
    // was missing/undersized before, which is why the base showed a hole.
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(R_BOT, 128), matteTrim)
    bottom.rotation.x = Math.PI / 2 // normal faces down
    bottom.position.y = Y_BOT
    bottom.receiveShadow = true

    // Top rim — a flat ring closing the wall thickness between outer and inner.
    const rim = new THREE.Mesh(new THREE.RingGeometry(R_IN, R_TOP, 128), matteTrim)
    rim.rotation.x = -Math.PI / 2 // normal faces up
    rim.position.y = Y_TOP

    // Inner wall — runs from the rim down to the cup floor.
    const innerGeo = new THREE.CylinderGeometry(R_IN, R_IN - 0.04, Y_TOP - Y_FLOOR, 128, 1, true)
    const inner = new THREE.Mesh(innerGeo, matteTrim)
    inner.position.y = (Y_TOP + Y_FLOOR) / 2

    // Cup floor — closes the cavity so you look into a cup, not a tube.
    const innerFloor = new THREE.Mesh(new THREE.CircleGeometry(R_IN - 0.04, 128), matteTrim)
    innerFloor.rotation.x = -Math.PI / 2 // normal faces up
    innerFloor.position.y = Y_FLOOR

    // Handle — a torus pushed into the wall on +X.
    const handleGeo = new THREE.TorusGeometry(0.55, 0.13, 24, 80)
    const handle = new THREE.Mesh(handleGeo, matteTrim)
    handle.position.set(1.42, 0.0, 0)
    handle.castShadow = true

    trims = [bottom, rim, inner, innerFloor, handle]
    group.add(outer, ...trims)
    group.position.y = 0.1
    scene.add(group)

    // Contact shadow catcher.
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 })
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), shadowMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.45
    floor.receiveShadow = true
    scene.add(floor)
  }

  /* ----------------------------- mount ----------------------------- */

  function mount(canvas: HTMLCanvasElement, decal: HTMLCanvasElement) {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    scene = new THREE.Scene()

    // Studio image-based lighting — soft reflections that sell the glass.
    pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 1.4, 6.2)

    // Dark studio fill + a steerable key light that casts the shadow.
    scene.add(new THREE.HemisphereLight(0x9fb6ff, 0x0a0a0c, 0.35))
    keyLight = new THREE.DirectionalLight(0xffffff, 3.0)
    keyLight.position.set(3, 4.5, 4)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.camera.near = 1
    keyLight.shadow.camera.far = 20
    keyLight.shadow.bias = -0.0004
    scene.add(keyLight)
    // Cool rim for the iridescent pop.
    const rim = new THREE.DirectionalLight(0x8b5cf6, 1.1)
    rim.position.set(-4, 2, -3)
    scene.add(rim)

    buildMaterials()
    buildMug(decal)

    controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.minDistance = 4
    controls.maxDistance = 9
    controls.minPolarAngle = 0.5
    controls.maxPolarAngle = Math.PI - 0.6
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.9
    controls.target.set(0, 0, 0)

    resize()
    ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const loop = () => {
      if (disposed) return
      raf = requestAnimationFrame(loop)
      controls.update()
      renderer!.render(scene, camera)
    }
    loop()
  }

  function resize() {
    if (!renderer) return
    const c = renderer.domElement
    const w = c.clientWidth || 1
    const h = c.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  /* --------------------------- public API --------------------------- */

  function setMaterial(kind: MugMaterial) {
    if (!outer) return
    outer.material = kind === 'glass' ? glassBody : matteBody
    const trim = kind === 'glass' ? glassTrim : matteTrim
    for (const m of trims) m.material = trim
  }

  function setLight(x: number, z: number) {
    if (keyLight) keyLight.position.set(x, 4.5, z)
  }

  function markDecalDirty() {
    if (decalTex) decalTex.needsUpdate = true
  }

  function setAutoRotate(on: boolean) {
    if (controls) controls.autoRotate = on
  }

  function dispose() {
    disposed = true
    cancelAnimationFrame(raf)
    ro?.disconnect()
    ro = null
    controls?.dispose()
    scene?.traverse((obj) => {
      const m = obj as THREE.Mesh
      if (m.geometry) m.geometry.dispose()
      const mat = m.material
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
      else if (mat) (mat as THREE.Material).dispose()
    })
    decalTex?.dispose()
    scene?.environment?.dispose()
    pmrem?.dispose()
    renderer?.dispose()
    renderer = null
  }

  return { mount, setMaterial, setLight, markDecalDirty, setAutoRotate, dispose }
}
