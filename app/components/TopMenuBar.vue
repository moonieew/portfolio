<template lang="pug">
header.bar
  .bar__left
    span.bar__logo ⌘
    span.bar__os Anna OS
    span.bar__app {{ activeName }}
    span.bar__menu(v-for="m in menus" :key="m") {{ m }}
  .bar__right
    a.bar__link(
      v-for="s in socials"
      :key="s.label"
      :href="s.href"
      target="_blank"
      rel="noopener noreferrer"
      :title="s.title"
    ) {{ s.label }}
    span.bar__sep
    span.bar__stat(title="Wi-Fi connected")
      svg.bar__icon(viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round")
        path(d="M1 4C4 1 12 1 15 4")
        path(d="M3.2 6.4C5.4 4.5 10.6 4.5 12.8 6.4")
        path(d="M5.5 8.8C6.8 7.7 9.2 7.7 10.5 8.8")
        circle(cx="8" cy="10.6" r="0.7" fill="currentColor" stroke="none")
    span.bar__stat.bar__battery(title="Battery")
      svg.bar__icon(viewBox="0 0 27 12" fill="none")
        rect(x="0.5" y="1" width="22" height="10" rx="2.6" stroke="currentColor")
        rect(x="2" y="2.5" width="17" height="7" rx="1" fill="currentColor")
        rect(x="24" y="4" width="2" height="4" rx="1" fill="currentColor")
      span.bar__batt 100%
    span.bar__clock {{ stamp }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '@vueuse/core'
import { useOS } from '~/composables/useOS'

const { activeId, getApp } = useOS()

const activeName = computed(() => {
  const a = activeId.value ? getApp(activeId.value) : null
  return a ? a.name : 'Finder'
})

const menus = ['File', 'Edit', 'View', 'Window']

// Replace hrefs with your real profiles.
const socials = [
  { label: 'GitHub', title: 'GitHub profile', href: 'https://github.com/' },
  { label: 'LinkedIn', title: 'LinkedIn profile', href: 'https://www.linkedin.com/' },
]

const now = useNow({ interval: 1000 })
const stamp = computed(() => {
  const d = now.value.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
  const t = now.value.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${d}  ${t}`
})
</script>

<style scoped>
.bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 8000;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.9rem;
  font-size: 0.74rem;
  background: rgba(18, 18, 18, 0.72);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.bar__left { display: flex; align-items: center; gap: 1.05rem; }
.bar__logo { font-size: 0.85rem; }
.bar__os { font-weight: 700; }
.bar__app { font-weight: 600; color: var(--color-fog); }
.bar__menu { color: var(--color-muted); }
@media (max-width: 920px) {
  .bar__menu { display: none; }
}

.bar__right { display: flex; align-items: center; gap: 0.85rem; font-family: var(--font-mono); font-size: 0.7rem; }
.bar__link {
  color: var(--color-fog);
  text-decoration: none;
  transition: color 0.15s ease;
}
.bar__link:hover { color: var(--color-neon); }
.bar__sep { width: 1px; height: 14px; background: rgba(255, 255, 255, 0.12); }
.bar__stat { display: inline-flex; align-items: center; gap: 0.3rem; color: var(--color-fog); }
.bar__icon { height: 12px; width: auto; display: block; }
.bar__battery .bar__icon { width: 26px; }
.bar__batt { font-size: 0.66rem; }
.bar__clock { color: var(--color-fog); }
</style>
