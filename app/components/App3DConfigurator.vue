<template lang="pug">
.cfg(:class="{ 'cfg--sheet': !isWide }")
  //- ── Stage ─────────────────────────────────────────────────────
  .cfg__stage
    //- Desktop / WebGL-capable: live Three.js canvas
    template(v-if="use3D")
      canvas.cfg__canvas(ref="canvasEl")
      .cfg__vignette
      p.cfg__hint drag to orbit · scroll to zoom

    //- Mobile / no-WebGL: zero-cost SVG mug, swipe to spin
    template(v-else)
      .cfg__svgwrap(
        ref="svgWrap"
        @pointerdown="spinDown"
        @pointermove="spinMove"
        @pointerup="spinUp"
        @pointercancel="spinUp"
      )
        .cfg__svgrot(:style="{ transform: `rotateY(${rotY}deg)` }")
          svg.cfg__svg(viewBox="0 0 240 280" preserveAspectRatio="xMidYMid meet")
            defs
              linearGradient(:id="gid('body')" x1="0" y1="0" x2="1" y2="1")
                stop(offset="0" :stop-color="material === 'glass' ? '#cfeaff' : '#fbfbfd'")
                stop(offset="0.5" :stop-color="material === 'glass' ? '#9ec9ff' : '#dcdce2'")
                stop(offset="1" :stop-color="material === 'glass' ? '#6f8bd6' : '#a9a9b3'")
              radialGradient(:id="gid('spec')" :cx="highlight" cy="32%" r="42%")
                stop(offset="0" stop-color="#ffffff" stop-opacity="0.9")
                stop(offset="1" stop-color="#ffffff" stop-opacity="0")
              linearGradient(:id="gid('iris')" x1="0" y1="0" x2="1" y2="1")
                stop(offset="0" stop-color="#ff6ad5")
                stop(offset="0.5" stop-color="#7af9ff")
                stop(offset="1" stop-color="#a06bff")
              clipPath(:id="gid('clip')")
                path(:d="BODY_PATH")
            //- Cup body
            path.cfg__svgbody(:d="BODY_PATH" :fill="`url(#${gid('body')})`")
            //- The drawing, projected onto the body
            image(
              v-if="decalUrl"
              :href="decalUrl"
              x="56" y="70" width="128" height="150"
              preserveAspectRatio="xMidYMid slice"
              :clip-path="`url(#${gid('clip')})`"
              opacity="0.92"
            )
            //- Iridescent film (glass only)
            path(
              v-if="material === 'glass'"
              :d="BODY_PATH"
              :fill="`url(#${gid('iris')})`"
              opacity="0.28"
              style="mix-blend-mode: screen"
            )
            //- Specular highlight, steered by the light pad
            path(:d="BODY_PATH" :fill="`url(#${gid('spec')})`")
            //- Handle
            path.cfg__svghandle(
              d="M178 96 C 224 96 224 196 178 196"
              fill="none"
              :stroke="material === 'glass' ? '#9ec9ff' : '#c9c9d1'"
              stroke-width="15"
              stroke-linecap="round"
            )
            //- Rim opening
            ellipse(cx="120" cy="70" rx="64" ry="17" fill="#15151a")
            ellipse(cx="120" cy="68" rx="64" ry="17" fill="none" :stroke="material === 'glass' ? '#bfe9ff' : '#e8e8ec'" stroke-width="3")
        p.cfg__hint ↔ swipe to rotate

  //- ── Control panel (glassmorphism) ────────────────────────────
  .cfg__panel
    header.cfg__phead
      span.cfg__ptitle Configurator
      span.cfg__pmode {{ use3D ? 'WebGL · live' : 'SVG · lite' }}

    //- Material toggle
    section.cfg__sec
      span.cfg__lab Material
      .cfg__seg
        button.cfg__segbtn(
          type="button"
          :class="{ 'is-on': material === 'matte' }"
          @click="material = 'matte'"
        ) Matte Plastic
        button.cfg__segbtn(
          type="button"
          :class="{ 'is-on': material === 'glass' }"
          @click="material = 'glass'"
        ) Iridescent Glass

    //- Light controller (XY pad)
    section.cfg__sec
      span.cfg__lab Key light · X / Z
      .cfg__pad(
        ref="padEl"
        @pointerdown="padDown"
        @pointermove="padMove"
        @pointerup="padUp"
        @pointercancel="padUp"
      )
        .cfg__padgrid
        .cfg__knob(:style="{ left: `${padX}%`, top: `${padY}%` }")

    //- Draw / write surface → CanvasTexture
    section.cfg__sec
      .cfg__row
        span.cfg__lab Surface art
        .cfg__tools
          button.cfg__tool(
            v-for="c in SWATCHES"
            :key="c"
            type="button"
            :class="{ 'is-on': tool === 'draw' && brush === c }"
            :style="{ background: c }"
            :aria-label="`Brush ${c}`"
            @click="brush = c; tool = 'draw'"
          )
          button.cfg__tool.cfg__tool--erase(
            type="button"
            :class="{ 'is-on': tool === 'erase' }"
            aria-label="Eraser"
            @click="tool = 'erase'"
          ) ⌫
          button.cfg__tool.cfg__tool--clear(
            type="button"
            aria-label="Clear"
            @click="clearArt"
          ) ✕
      canvas.cfg__draw(
        ref="decalEl"
        :width="TEX_W"
        :height="TEX_H"
        @pointerdown="drawDown"
        @pointermove="drawMove"
        @pointerup="drawUp"
        @pointerleave="drawUp"
        @pointercancel="drawUp"
      )
      input.cfg__text(
        v-model="label"
        type="text"
        maxlength="14"
        placeholder="…or type a word"
      )
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useThreeMug, type MugHandle, type MugMaterial } from '~/composables/useThreeMug'

/* Texture canvas is 2:1 — it wraps exactly once around the cylinder body. */
const TEX_W = 512
const TEX_H = 256
const SWATCHES = ['#00ff66', '#8b5cf6', '#3b82f6', '#ff5f57', '#ffffff', '#111114'] as const
const BODY_PATH =
  'M62 70 C62 70 58 210 70 232 C80 250 160 250 170 232 C182 210 178 70 178 70 Z'

/* ----- Capability gate: screen width OR WebGL support ----- */
const isWide = useMediaQuery('(min-width: 768px)')
const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
const webglOK = ref(true)
const use3D = computed(() => isWide.value && webglOK.value)

function detectWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext('webgl2') || c.getContext('webgl'))
    )
  } catch {
    return false
  }
}

/* ----- Reactive UI state (single source of truth) ----- */
const material = ref<MugMaterial>('matte')
const lightX = ref(3)
const lightZ = ref(4)
const brush = ref<string>(SWATCHES[0])
const tool = ref<'draw' | 'erase'>('draw')
const label = ref('')
const rotY = ref(-18) // SVG fallback spin

/* Unique gradient ids so multiple instances never collide. */
let uid = 0
const gid = (k: string) => `mug-${k}-${uidBase}`
const uidBase = (() => (uid += 1, uid))()

/* ----- DOM refs ----- */
const canvasEl = ref<HTMLCanvasElement | null>(null)
const decalEl = ref<HTMLCanvasElement | null>(null)
const padEl = ref<HTMLElement | null>(null)
const svgWrap = ref<HTMLElement | null>(null)

/* ----- Three.js handle (created lazily, only in 3D mode) ----- */
let mug: MugHandle | null = null

/* ----- Drawing pipeline -----
 * decalEl is WYSIWYG: it is both the on-screen pad AND the texture source.
 * Freehand strokes live on an offscreen paint layer so the live text can be
 * re-composited every frame without erasing them. */
let paint: HTMLCanvasElement
let pctx: CanvasRenderingContext2D
let dctx: CanvasRenderingContext2D
const decalUrl = ref('') // data-URL mirror used by the SVG fallback

function composite() {
  if (!dctx) return
  dctx.clearRect(0, 0, TEX_W, TEX_H)
  dctx.fillStyle = '#f4f4f6'
  dctx.fillRect(0, 0, TEX_W, TEX_H)
  dctx.drawImage(paint, 0, 0)
  if (label.value) {
    dctx.save()
    dctx.font = '700 58px Inter, ui-sans-serif, sans-serif'
    dctx.textAlign = 'center'
    dctx.textBaseline = 'middle'
    dctx.fillStyle = brush.value === '#ffffff' ? '#111114' : brush.value
    dctx.fillText(label.value, TEX_W / 2, TEX_H / 2)
    dctx.restore()
  }
  // 3D: flag the GPU texture. Lite: refresh the (expensive) data-URL only here.
  if (use3D.value) mug?.markDecalDirty()
  else decalUrl.value = decalEl.value!.toDataURL()
}

let drawing = false
let last = { x: 0, y: 0 }

function posFrom(e: PointerEvent) {
  const r = decalEl.value!.getBoundingClientRect()
  return {
    x: ((e.clientX - r.left) / r.width) * TEX_W,
    y: ((e.clientY - r.top) / r.height) * TEX_H,
  }
}
function stroke(a: { x: number; y: number }, b: { x: number; y: number }) {
  pctx.lineCap = 'round'
  pctx.lineJoin = 'round'
  if (tool.value === 'erase') {
    pctx.globalCompositeOperation = 'destination-out'
    pctx.lineWidth = 30
    pctx.strokeStyle = 'rgba(0,0,0,1)'
  } else {
    pctx.globalCompositeOperation = 'source-over'
    pctx.lineWidth = 11
    pctx.strokeStyle = brush.value
  }
  pctx.beginPath()
  pctx.moveTo(a.x, a.y)
  pctx.lineTo(b.x, b.y)
  pctx.stroke()
}
function drawDown(e: PointerEvent) {
  drawing = true
  decalEl.value!.setPointerCapture(e.pointerId)
  last = posFrom(e)
  stroke(last, last)
  composite()
}
function drawMove(e: PointerEvent) {
  if (!drawing) return
  const p = posFrom(e)
  stroke(last, p)
  last = p
  composite()
}
function drawUp() {
  drawing = false
}
function clearArt() {
  pctx.clearRect(0, 0, TEX_W, TEX_H)
  label.value = ''
  composite()
}

/* ----- Light XY pad (maps a unit square → ±6 on X/Z) ----- */
const padX = computed(() => ((lightX.value + 6) / 12) * 100)
const padY = computed(() => ((lightZ.value + 6) / 12) * 100)
let padding = false
function padFrom(e: PointerEvent) {
  const r = padEl.value!.getBoundingClientRect()
  const nx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  const ny = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
  lightX.value = nx * 12 - 6
  lightZ.value = ny * 12 - 6
}
function padDown(e: PointerEvent) {
  padding = true
  padEl.value!.setPointerCapture(e.pointerId)
  padFrom(e)
}
function padMove(e: PointerEvent) {
  if (padding) padFrom(e)
}
function padUp() {
  padding = false
}
// SVG highlight tracks the light's X for a coherent fallback.
const highlight = computed(() => `${50 + (lightX.value / 6) * 26}%`)

/* ----- SVG spin (touch 360 illusion) ----- */
let spinning = false
let spinStartX = 0
let spinStartRot = 0
function spinDown(e: PointerEvent) {
  spinning = true
  svgWrap.value!.setPointerCapture(e.pointerId)
  spinStartX = e.clientX
  spinStartRot = rotY.value
}
function spinMove(e: PointerEvent) {
  if (spinning) rotY.value = spinStartRot + (e.clientX - spinStartX) * 0.6
}
function spinUp() {
  spinning = false
}

/* ----- Scene lifecycle ----- */
function startScene() {
  if (mug || !canvasEl.value || !decalEl.value) return
  mug = useThreeMug()
  mug.mount(canvasEl.value, decalEl.value)
  mug.setMaterial(material.value)
  mug.setLight(lightX.value, lightZ.value)
  mug.setAutoRotate(!reduced.value)
  mug.markDecalDirty()
}
function stopScene() {
  mug?.dispose()
  mug = null
}

watch(material, (m) => mug?.setMaterial(m))
watch([lightX, lightZ], ([x, z]) => mug?.setLight(x, z))
watch(label, composite)
watch(reduced, (r) => mug?.setAutoRotate(!r))
// React to crossing the breakpoint / capability gate at runtime.
watch(use3D, async (on) => {
  await nextTick()
  if (on) startScene()
  else {
    stopScene()
    composite() // refresh the data-URL the SVG path now needs
  }
})

onMounted(async () => {
  paint = document.createElement('canvas')
  paint.width = TEX_W
  paint.height = TEX_H
  pctx = paint.getContext('2d')!
  dctx = decalEl.value!.getContext('2d')!
  webglOK.value = detectWebGL()
  composite()
  await nextTick()
  if (use3D.value) startScene()
})

onBeforeUnmount(stopScene)
</script>

<style scoped>
.cfg {
  position: absolute;
  inset: 0;
  display: flex;
  background:
    radial-gradient(120% 90% at 50% 18%, #202028 0%, transparent 55%),
    radial-gradient(80% 60% at 80% 100%, color-mix(in srgb, var(--color-purple) 20%, transparent), transparent 60%),
    var(--color-ink);
  overflow: hidden;
}

/* Stage */
.cfg__stage { position: relative; flex: 1; min-width: 0; }
.cfg__canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; }
.cfg__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(70% 70% at 50% 45%, transparent 55%, rgba(0, 0, 0, 0.55) 100%);
}
.cfg__hint {
  position: absolute;
  bottom: 0.7rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted);
  pointer-events: none;
}

/* SVG fallback */
.cfg__svgwrap {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  perspective: 900px;
  touch-action: none;
  cursor: grab;
}
.cfg__svgwrap:active { cursor: grabbing; }
.cfg__svgrot { width: min(62%, 240px); transform-style: preserve-3d; will-change: transform; }
.cfg__svg { width: 100%; height: auto; filter: drop-shadow(0 26px 30px rgba(0, 0, 0, 0.6)); }
.cfg__svghandle { filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.35)); }

/* Control panel — floats over the stage, but is bounded to it so a short
 * window can never clip it: overflow scrolls inside the panel instead. */
.cfg__panel {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  width: 270px;
  max-width: calc(100% - 2rem);
  max-height: calc(100% - 2rem);
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.9rem;
  border-radius: 0.95rem;
  background: color-mix(in srgb, var(--color-surface) 62%, transparent);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 24px 60px -28px rgba(0, 0, 0, 0.9);
}
.cfg__phead { display: flex; align-items: baseline; justify-content: space-between; }
.cfg__ptitle { font-size: 0.82rem; font-weight: 700; letter-spacing: 0.01em; }
.cfg__pmode {
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.08em;
  color: var(--color-neon);
}
.cfg__sec { display: flex; flex-direction: column; gap: 0.45rem; }
.cfg__row { display: flex; align-items: center; justify-content: space-between; }
.cfg__lab {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-muted);
}

/* Segmented material toggle */
.cfg__seg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem;
  padding: 0.22rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
.cfg__segbtn {
  padding: 0.4rem 0.3rem;
  border-radius: 0.45rem;
  border: none;
  cursor: pointer;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--color-muted);
  background: transparent;
  transition: color 0.18s ease, background 0.18s ease;
}
.cfg__segbtn.is-on { color: #0a0a0c; background: var(--color-neon); }

/* Light XY pad */
.cfg__pad {
  position: relative;
  height: 76px;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: crosshair;
  touch-action: none;
  overflow: hidden;
}
.cfg__padgrid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 18px 18px;
}
.cfg__knob {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  transform: translate(-50%, -50%);
  background: var(--color-neon);
  box-shadow: 0 0 14px var(--color-neon), 0 0 0 4px rgba(0, 255, 102, 0.18);
  pointer-events: none;
}

/* Draw surface + tools */
.cfg__tools { display: flex; gap: 0.28rem; }
.cfg__tool {
  width: 18px;
  height: 18px;
  border-radius: 0.3rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  cursor: pointer;
  padding: 0;
  font-size: 0.6rem;
  line-height: 1;
  color: var(--color-fog);
  display: grid;
  place-items: center;
}
.cfg__tool.is-on { box-shadow: 0 0 0 2px var(--color-fog); }
.cfg__tool--erase, .cfg__tool--clear { background: rgba(255, 255, 255, 0.06); }
.cfg__draw {
  width: 100%;
  aspect-ratio: 2 / 1;
  height: auto;
  border-radius: 0.5rem;
  background: #f4f4f6;
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: crosshair;
  touch-action: none;
}
.cfg__text {
  width: 100%;
  padding: 0.4rem 0.55rem;
  border-radius: 0.45rem;
  font-size: 0.72rem;
  color: var(--color-fog);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  outline: none;
}
.cfg__text:focus { border-color: color-mix(in srgb, var(--color-neon) 50%, transparent); }

/* ── Mobile: panel becomes a bottom sheet ───────────────────── */
.cfg--sheet { flex-direction: column; }
.cfg--sheet .cfg__stage { flex: 1; min-height: 0; }
.cfg--sheet .cfg__panel {
  position: relative;
  inset: auto;
  flex: none;
  width: 100%;
  max-width: 100%;
  max-height: 52%;
  border-radius: 1.1rem 1.1rem 0 0;
  border-bottom: none;
}

@media (prefers-reduced-motion: reduce) {
  .cfg__svgrot { transition: none; }
}
</style>
