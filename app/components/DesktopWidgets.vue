<template lang="pug">
//- Ambient right-rail. Decorative; only shown on wide canvases where it
//- won't overlap windows (windows open from the left).
aside.wid(aria-hidden="true")
  //- Availability
  .wid__card.wid__card--status
    .wid__head
      span.wid__dot
      span.wid__head-label Status
    p.wid__status-line Open to Frontend opportunities
    p.wid__status-sub Full-time · Remote / Hybrid · Ho Chi Minh City

  //- Currently building (now-playing style)
  .wid__card
    .wid__head
      span.wid__head-ico ◢
      span.wid__head-label Currently building
    p.wid__now-title Real-time DePIN interfaces
    .wid__bars
      span.wid__bar(v-for="n in 5" :key="n" :style="{ animationDelay: `${n * 0.12}s` }")

  //- Stack ticker
  .wid__card
    .wid__head
      span.wid__head-ico ❖
      span.wid__head-label Stack
    .wid__tags
      span.wid__tag(v-for="t in stack" :key="t") {{ t }}

  //- Local time
  .wid__card.wid__card--clock
    .wid__head
      span.wid__head-ico ◷
      span.wid__head-label Local time
    p.wid__clock {{ clock }}
    p.wid__clock-zone {{ zone }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '@vueuse/core'

const stack = ['Vue', 'Nuxt', 'TypeScript', 'WebSocket', 'wagmi', 'Figma']

const now = useNow({ interval: 1000 })
const clock = computed(() =>
  now.value.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
)
const zone = 'GMT+7 · Indochina'
</script>

<style scoped>
.wid {
  position: absolute;
  top: 56px;
  right: 22px;
  z-index: 10;
  width: 230px;
  display: none;
  flex-direction: column;
  gap: 0.7rem;
  pointer-events: none;
}
/* Only when there's room to the right of a typical window. */
@media (min-width: 1280px) { .wid { display: flex; } }

.wid__card {
  padding: 0.85rem 0.95rem;
  border-radius: 0.85rem;
  background: color-mix(in srgb, var(--color-surface) 50%, transparent);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  border: 1px solid var(--hairline);
  box-shadow: 0 20px 50px -30px var(--shadow-mid);
}
.wid__card--status { border-color: color-mix(in srgb, var(--color-neon) 22%, transparent); }

.wid__head { display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.55rem; }
.wid__head-label { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-muted); }
.wid__head-ico { color: var(--color-purple); font-size: 0.8rem; }
.wid__dot { width: 8px; height: 8px; border-radius: 999px; background: var(--color-neon); box-shadow: 0 0 10px var(--color-neon); animation: pulse 2s ease-in-out infinite; }

.wid__status-line { font-size: 0.85rem; font-weight: 700; color: var(--color-fog); }
.wid__status-sub { margin-top: 0.3rem; font-size: 0.68rem; line-height: 1.5; color: var(--color-muted); }

.wid__now-title { font-size: 0.82rem; font-weight: 600; color: var(--color-fog); }
.wid__bars { display: flex; align-items: flex-end; gap: 3px; height: 18px; margin-top: 0.55rem; }
.wid__bar { width: 3px; height: 100%; border-radius: 999px; background: var(--color-neon); transform-origin: bottom; animation: eq 1.1s ease-in-out infinite; opacity: 0.85; }
@keyframes eq { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }

.wid__tags { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.wid__tag {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  padding: 0.16rem 0.42rem;
  border-radius: 999px;
  color: var(--color-fog);
  background: var(--veil-2);
  border: 1px solid var(--hairline);
}

.wid__clock { font-family: var(--font-mono); font-size: 1.3rem; font-weight: 700; color: var(--color-fog); letter-spacing: 0.02em; }
.wid__clock-zone { margin-top: 0.2rem; font-family: var(--font-mono); font-size: 0.62rem; color: var(--color-muted); }

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

@media (prefers-reduced-motion: reduce) {
  .wid__dot, .wid__bar { animation: none; }
  .wid__bar { transform: scaleY(0.6); }
}
</style>
