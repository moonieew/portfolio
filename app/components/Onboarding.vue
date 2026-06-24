<template lang="pug">
Transition(name="onb")
  aside.onb(v-if="visible" role="status" aria-live="polite")
    .onb__head
      span.onb__mark A
      .onb__titles
        p.onb__title Welcome to Anna OS
        p.onb__sub A portfolio you can actually use
      button.onb__x(type="button" aria-label="Dismiss welcome" @click="dismiss") ✕
    ul.onb__list
      li.onb__row
        span.onb__key Dock
        span.onb__txt Open apps from the dock below
      li.onb__row
        span.onb__key Drag
        span.onb__txt Move any window by its title bar
      li.onb__row
        span.onb__key 2×
        span.onb__txt Double-click a title bar to maximize
      li.onb__row
        span.onb__key ⌘K
        span.onb__txt Search &amp; jump anywhere — try it
    button.onb__cta(type="button" @click="dismiss") Got it
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const KEY = 'anna-os:onboarded'
const visible = ref(false)

onMounted(() => {
  let seen = false
  try {
    seen = !!localStorage.getItem(KEY)
  } catch {
    /* storage unavailable → treat as first visit */
  }
  if (!seen) setTimeout(() => (visible.value = true), 900)
})

function dismiss() {
  visible.value = false
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.onb {
  position: absolute;
  top: 42px;
  right: 16px;
  z-index: 9500;
  width: 300px;
  padding: 1rem;
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--color-surface) 82%, transparent);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid color-mix(in srgb, var(--color-neon) 22%, transparent);
  box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.9);
}
.onb__head { display: flex; align-items: center; gap: 0.6rem; }
.onb__mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 0.6rem;
  font-weight: 800;
  color: var(--color-neon);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid color-mix(in srgb, var(--color-neon) 30%, transparent);
}
.onb__titles { flex: 1; min-width: 0; }
.onb__title { font-weight: 700; font-size: 0.92rem; }
.onb__sub { font-size: 0.72rem; color: var(--color-muted); }
.onb__x {
  flex: none;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  font-size: 0.78rem;
  line-height: 1;
  transition: color 0.15s ease;
}
.onb__x:hover { color: var(--color-fog); }

.onb__list { margin: 0.9rem 0; display: flex; flex-direction: column; gap: 0.55rem; }
.onb__row { display: flex; align-items: center; gap: 0.7rem; font-size: 0.8rem; }
.onb__key {
  flex: none;
  min-width: 40px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.64rem;
  padding: 0.2rem 0.42rem;
  border-radius: 0.4rem;
  color: var(--color-neon);
  background: color-mix(in srgb, var(--color-neon) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-neon) 26%, transparent);
}
.onb__txt { color: var(--color-fog); }

.onb__cta {
  width: 100%;
  margin-top: 0.4rem;
  padding: 0.5rem;
  border-radius: 0.6rem;
  font-weight: 600;
  font-size: 0.82rem;
  color: #0a1f12;
  background: linear-gradient(100deg, var(--color-neon), #59ffa0);
  border: none;
  cursor: pointer;
  transition: filter 0.15s ease;
}
.onb__cta:hover { filter: brightness(1.05); }

.onb-enter-active,
.onb-leave-active { transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.onb-enter-from,
.onb-leave-to { opacity: 0; transform: translateY(-10px) scale(0.97); }

@media (prefers-reduced-motion: reduce) {
  .onb-enter-active,
  .onb-leave-active { transition: opacity 0.3s ease; }
  .onb-enter-from,
  .onb-leave-to { transform: none; }
}
</style>
