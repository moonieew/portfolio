<template lang="pug">
canvas.wallfx(ref="cv" aria-hidden="true")
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTheme } from '~/composables/useTheme'

/**
 * Interactive wallpaper — a Maizzle-style perspective grid on a flat
 * background. At rest the lines are a quiet gray; around the cursor they
 * bend in a smooth water-ripple and tint to purple, easing back when the
 * pointer leaves. Clicking fires a purple shockwave ring through the grid.
 * The rAF loop self-suspends when everything has settled.
 */

const cv = ref<HTMLCanvasElement | null>(null)
const { theme } = useTheme()

const HORIZON = 0.38 // vanishing line, as a fraction of height
const SEG = 14 // polyline sampling step (px)
const R_WARP = 260 // bend radius around the cursor
const R_TINT = 300 // purple tint radius around the cursor
const WAVE_SPEED = 10
const WAVE_BAND = 70

let ctx: CanvasRenderingContext2D | null = null
let W = 0
let H = 0
let rectLeft = 0
let rectTop = 0
let raf = 0
let reduced = false

// Each line is a flat [x0,y0,x1,y1,…] polyline in base (unwarped) coords.
let lines: Float32Array[] = []
let staticPath: Path2D | null = null
let grayGrad: CanvasGradient | null = null

// Pointer + eased "lens" that trails it for a fluid feel.
let mx = 0
let my = 0
let lx = 0
let ly = 0
let hasLens = false
let pointerOn = false
let power = 0 // eased 0..1 hover intensity

interface Wave { x: number; y: number; r: number; life: number }
let waves: Wave[] = []

let fogRgb: [number, number, number] = [233, 237, 242]
let purpleRgb: [number, number, number] = [139, 92, 246]

function hexToRgb(hex: string, fb: [number, number, number]): [number, number, number] {
  const h = hex.trim().replace('#', '')
  const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const n = Number.parseInt(f, 16)
  if (Number.isNaN(n) || f.length !== 6) return fb
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgba(c: [number, number, number], a: number) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`
}

function readPalette() {
  const css = getComputedStyle(document.documentElement)
  fogRgb = hexToRgb(css.getPropertyValue('--color-fog') || '', [233, 237, 242])
  purpleRgb = hexToRgb(css.getPropertyValue('--color-purple') || '', [139, 92, 246])
  if (ctx) buildGrayGradient()
}

function buildGrayGradient() {
  const g = ctx!.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, rgba(fogRgb, 0.1)) // faint ceiling
  g.addColorStop(HORIZON, rgba(fogRgb, 0)) // dissolve at the horizon
  g.addColorStop(1, rgba(fogRgb, 0.22)) // strongest at the bottom
  grayGrad = g
}

/** Sample a straight segment into a polyline so it can bend later. */
function sampleLine(x0: number, y0: number, x1: number, y1: number): Float32Array {
  const len = Math.hypot(x1 - x0, y1 - y0)
  const n = Math.max(2, Math.ceil(len / SEG) + 1)
  const pts = new Float32Array(n * 2)
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    pts[i * 2] = x0 + (x1 - x0) * t
    pts[i * 2 + 1] = y0 + (y1 - y0) * t
  }
  return pts
}

function buildGeometry() {
  lines = []
  const yh = H * HORIZON
  const cx = W / 2

  // Depth rows mirrored around the horizon (denser as they approach it).
  const ROWS = 6
  for (let j = 1; j <= ROWS; j++) {
    const f = (j / ROWS) ** 2.1
    lines.push(sampleLine(0, yh + (H - yh) * f, W, yh + (H - yh) * f))
    lines.push(sampleLine(0, yh - yh * f, W, yh - yh * f))
  }

  // Rays fanning out of the vanishing point, floor + ceiling.
  const S = 170 // spacing at the bottom edge
  const kF = Math.ceil(W / 2 / S) + 1
  for (let k = -kF; k <= kF; k++)
    lines.push(sampleLine(cx + k * S * 0.02, yh + (H - yh) * 0.02, cx + k * S, H))
  const S2 = S * (yh / (H - yh)) // same slope spread at the top edge
  const kC = Math.ceil(W / 2 / S2) + 1
  for (let k = -kC; k <= kC; k++)
    lines.push(sampleLine(cx + k * S2 * 0.02, yh - yh * 0.02, cx + k * S2, 0))

  staticPath = buildPath(0, false)
}

/** Build the (optionally warped) grid path for this frame. */
function buildPath(t: number, warped: boolean): Path2D {
  const p = new Path2D()
  const rw2 = R_WARP * R_WARP
  for (const ln of lines) {
    const n = ln.length >> 1
    for (let i = 0; i < n; i++) {
      let x = ln[i * 2]!
      let y = ln[i * 2 + 1]!
      if (warped) {
        // Water-ripple bend around the eased lens position.
        const dx = x - lx
        const dy = y - ly
        const r2 = dx * dx + dy * dy
        if (r2 < rw2 && power > 0.004) {
          const r = Math.sqrt(r2) || 1
          let fall = 1 - r / R_WARP
          fall = fall * fall * (3 - 2 * fall) // smoothstep
          const a = Math.sin(r * 0.045 - t * 3.4) * 13 * power * fall
          x += (dx / r) * a
          y += (dy / r) * a
        }
        for (const w of waves) {
          const wdx = x - w.x
          const wdy = y - w.y
          const wr = Math.sqrt(wdx * wdx + wdy * wdy) || 1
          const b = Math.abs(wr - w.r)
          if (b < WAVE_BAND) {
            const k = (1 - b / WAVE_BAND) * w.life
            const push = k * k * 16
            x += (wdx / wr) * push
            y += (wdy / wr) * push
          }
        }
      }
      if (i === 0) p.moveTo(x, y)
      else p.lineTo(x, y)
    }
  }
  return p
}

function drawFrame(t: number) {
  const c = ctx
  if (!c || !grayGrad) return
  const active = power > 0.004 || waves.length > 0
  const path = active ? buildPath(t, true) : staticPath!

  c.clearRect(0, 0, W, H)
  c.lineWidth = 1
  c.strokeStyle = grayGrad
  c.stroke(path)

  // Purple tint pooling under the cursor (per-pixel falloff via gradient).
  if (power > 0.01 && hasLens) {
    const g = c.createRadialGradient(lx, ly, 0, lx, ly, R_TINT)
    g.addColorStop(0, rgba(purpleRgb, 0.9 * power))
    g.addColorStop(0.55, rgba(purpleRgb, 0.38 * power))
    g.addColorStop(1, rgba(purpleRgb, 0))
    c.lineWidth = 1.25
    c.strokeStyle = g
    c.stroke(path)
  }

  // Expanding shockwave rings.
  for (const w of waves) {
    const inner = Math.max(0, w.r - WAVE_BAND)
    const g = c.createRadialGradient(w.x, w.y, inner, w.x, w.y, w.r + WAVE_BAND)
    g.addColorStop(0, rgba(purpleRgb, 0))
    g.addColorStop(0.5, rgba(purpleRgb, 0.75 * w.life))
    g.addColorStop(1, rgba(purpleRgb, 0))
    c.lineWidth = 1.25
    c.strokeStyle = g
    c.stroke(path)
  }
}

function frame(now: number) {
  raf = requestAnimationFrame(frame)
  const t = now * 0.001

  power += ((pointerOn ? 1 : 0) - power) * 0.08
  if (hasLens) {
    lx += (mx - lx) * 0.12
    ly += (my - ly) * 0.12
  }
  const maxR = Math.hypot(W, H)
  for (const w of waves) {
    w.r += WAVE_SPEED
    w.life = Math.max(0, 1 - w.r / 900)
  }
  waves = waves.filter(w => w.r < maxR + WAVE_BAND && w.life > 0)

  drawFrame(t)

  // Fully settled → park the loop (restarted by the next pointer event).
  if (!pointerOn && power < 0.004 && waves.length === 0) stop()
}

function start() {
  if (reduced || raf) return
  raf = requestAnimationFrame(frame)
}

function stop() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

function build() {
  const canvas = cv.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  rectLeft = rect.left
  rectTop = rect.top
  W = rect.width
  H = rect.height
  if (W === 0 || H === 0) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  buildGrayGradient()
  buildGeometry()
  if (reduced) drawFrame(0)
  else start()
}

function onMove(e: PointerEvent) {
  mx = e.clientX - rectLeft
  my = e.clientY - rectTop
  if (!hasLens) {
    lx = mx
    ly = my
    hasLens = true
  }
  pointerOn = true
  start()
}

function onDown(e: PointerEvent) {
  waves.push({ x: e.clientX - rectLeft, y: e.clientY - rectTop, r: 0, life: 1 })
  start()
}

function onLeave() {
  pointerOn = false
  start() // let the warp ease back out before the loop parks itself
}

function onVisibility() {
  if (document.hidden) stop()
  else start()
}

let ro: ResizeObserver | null = null

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  readPalette()
  build()
  ro = new ResizeObserver(() => build())
  if (cv.value) ro.observe(cv.value)
  if (!reduced) {
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('blur', onLeave)
    document.documentElement.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)
  }
})

onBeforeUnmount(() => {
  stop()
  ro?.disconnect()
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerdown', onDown)
  window.removeEventListener('blur', onLeave)
  document.documentElement.removeEventListener('pointerleave', onLeave)
  document.removeEventListener('visibilitychange', onVisibility)
})

// Re-read colors once the `html.light` class has flipped.
watch(theme, async () => {
  await nextTick()
  readPalette()
  if (reduced) drawFrame(0)
  else start()
})
</script>

<style scoped>
.wallfx {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}
</style>
