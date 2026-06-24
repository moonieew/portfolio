<template lang="pug">
.win(
  v-if="win"
  ref="el"
  v-show="!win.minimized"
  :class="[`win--${app?.accent}`, { 'win--active': isActive, 'win--max': win.maximized }]"
  :style="winStyle"
  @mousedown="focusApp(appId)"
)
  //- Title bar (drag handle)
  header.win__bar(ref="handle" @dblclick="toggleMaximize(appId)")
    .win__lights
      button.win__light.is-close(type="button" title="Close" @click.stop="closeApp(appId)")
        span ✕
      button.win__light.is-min(type="button" title="Minimize" @click.stop="minimizeApp(appId)")
        span ─
      button.win__light.is-max(type="button" title="Maximize" @click.stop="toggleMaximize(appId)")
        span ＋
    .win__title
      span.win__title-icon {{ app?.icon }}
      span {{ app?.name }}
    .win__meta {{ app?.blurb }}

  //- App content (manages its own internal scroll)
  .win__body
    component(:is="app?.component")

  //- Resize handles — 4 edges + 4 corners (hidden while maximized)
  template(v-if="!win.maximized")
    .win__rs(
      v-for="d in RESIZE_DIRS"
      :key="d"
      :class="`win__rs--${d}`"
      @pointerdown="startResize(d, $event)"
      @pointermove="onResize"
      @pointerup="endResize"
      @pointercancel="endResize"
    )
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDraggable } from '@vueuse/core'
import { useOS } from '~/composables/useOS'

const props = defineProps<{ appId: string }>()

const { windows, activeId, getApp, focusApp, closeApp, minimizeApp, toggleMaximize } =
  useOS()

const app = getApp(props.appId)
const win = computed(() => windows[props.appId])
const isActive = computed(() => activeId.value === props.appId)

const el = ref<HTMLElement | null>(null)
const handle = ref<HTMLElement | null>(null)

// Free-floating drag, grabbed only by the title bar.
const { x, y } = useDraggable(el, {
  handle,
  initialValue: { x: win.value?.x ?? 120, y: win.value?.y ?? 90 },
  preventDefault: true,
  onStart: () => focusApp(props.appId),
})

/* ----- Edge / corner resize ----------------------------------------
 * Position (x/y) is owned by useDraggable; size (w/h) lives in the OS
 * store. Dragging a west/north handle changes both — we pin the opposite
 * edge so the box grows from the grabbed side. */
const RESIZE_DIRS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const
const MIN_W = 320
const MIN_H = 200

let rs = { dir: '', mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 }

function startResize(dir: string, e: PointerEvent) {
  const w = win.value
  if (!w || w.maximized) return
  e.preventDefault()
  e.stopPropagation()
  focusApp(props.appId)
  rs = { dir, mx: e.clientX, my: e.clientY, x: x.value, y: y.value, w: w.w, h: w.h }
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

function onResize(e: PointerEvent) {
  const w = win.value
  if (!rs.dir || !w) return
  const dx = e.clientX - rs.mx
  const dy = e.clientY - rs.my
  let nx = rs.x
  let ny = rs.y
  let nw = rs.w
  let nh = rs.h
  if (rs.dir.includes('e')) nw = Math.max(MIN_W, rs.w + dx)
  if (rs.dir.includes('s')) nh = Math.max(MIN_H, rs.h + dy)
  if (rs.dir.includes('w')) {
    nw = Math.max(MIN_W, rs.w - dx)
    nx = rs.x + rs.w - nw // keep the right edge fixed
  }
  if (rs.dir.includes('n')) {
    nh = Math.max(MIN_H, rs.h - dy)
    ny = rs.y + rs.h - nh // keep the bottom edge fixed
  }
  w.w = nw
  w.h = nh
  x.value = nx
  y.value = ny
}

function endResize(e: PointerEvent) {
  if (!rs.dir) return
  rs.dir = ''
  // Persist the final position back into the store so a reopen restores it.
  const w = win.value
  if (w) {
    w.x = x.value
    w.y = y.value
  }
  try {
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  } catch {
    /* pointer already released */
  }
}

const winStyle = computed(() => {
  const w = win.value
  if (!w) return {}
  if (w.maximized) {
    return {
      left: '10px',
      top: '46px',
      width: 'calc(100% - 20px)',
      height: 'calc(100% - 130px)',
      zIndex: w.z,
    }
  }
  return {
    left: `${x.value}px`,
    top: `${y.value}px`,
    width: `${w.w}px`,
    height: `${w.h}px`,
    zIndex: w.z,
  }
})
</script>

<style scoped>
.win {
  position: absolute;
  display: flex;
  flex-direction: column;
  max-width: calc(100vw - 20px);
  border-radius: 0.85rem;
  overflow: hidden;
  background: color-mix(in srgb, var(--color-surface) 78%, transparent);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 80px -40px rgba(0, 0, 0, 0.9), 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}
.win--active { box-shadow: 0 40px 110px -40px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.06); }
.win--neon.win--active { border-color: color-mix(in srgb, var(--color-neon) 30%, transparent); }
.win--purple.win--active { border-color: color-mix(in srgb, var(--color-purple) 32%, transparent); }
.win--blue.win--active { border-color: color-mix(in srgb, #3b82f6 32%, transparent); }
.win--max { transition: none; }

/* Title bar */
.win__bar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  height: 38px;
  padding: 0 0.8rem;
  cursor: grab;
  user-select: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
}
.win__bar:active { cursor: grabbing; }
.win__lights { display: flex; gap: 0.5rem; }
.win__light {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 7px;
  line-height: 1;
  color: transparent;
  transition: color 0.15s ease;
}
.win__light span { transform: translateY(-0.5px); }
.win__light.is-close { background: #ff5f57; }
.win__light.is-min { background: #febc2e; }
.win__light.is-max { background: #28c840; }
.win__lights:hover .win__light { color: rgba(0, 0, 0, 0.55); }

.win__title { display: flex; align-items: center; gap: 0.45rem; font-size: 0.8rem; font-weight: 600; }
.win__title-icon { color: var(--color-muted); }
.win--neon .win__title-icon { color: var(--color-neon); }
.win--purple .win__title-icon { color: var(--color-purple); }
.win--blue .win__title-icon { color: #3b82f6; }
.win__meta {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--color-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* position: relative → containing block for apps whose root is absolute,
 * so their content can't escape over the title bar. */
.win__body { position: relative; flex: 1; min-height: 0; overflow: hidden; background: var(--color-ink-soft); }

/* Resize handles — invisible hit zones hugging each edge / corner.
 * Edges sit at z 5, corners at z 6 so the corner always wins the overlap. */
.win__rs { position: absolute; z-index: 5; touch-action: none; }
.win__rs--n { top: 0; left: 0; right: 0; height: 7px; cursor: ns-resize; }
.win__rs--s { bottom: 0; left: 0; right: 0; height: 7px; cursor: ns-resize; }
.win__rs--e { top: 0; bottom: 0; right: 0; width: 7px; cursor: ew-resize; }
.win__rs--w { top: 0; bottom: 0; left: 0; width: 7px; cursor: ew-resize; }
.win__rs--ne,
.win__rs--nw,
.win__rs--se,
.win__rs--sw { width: 16px; height: 16px; z-index: 6; }
.win__rs--ne { top: 0; right: 0; cursor: nesw-resize; }
.win__rs--nw { top: 0; left: 0; cursor: nwse-resize; }
.win__rs--se { bottom: 0; right: 0; cursor: nwse-resize; }
.win__rs--sw { bottom: 0; left: 0; cursor: nesw-resize; }
</style>
