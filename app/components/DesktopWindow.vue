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

.win__body { flex: 1; min-height: 0; overflow: hidden; background: var(--color-ink-soft); }
</style>
