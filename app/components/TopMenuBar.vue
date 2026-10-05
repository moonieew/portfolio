<template lang="pug">
header.bar
  .bar__left
    span.bar__logo
      LogoMark(:size="16")
    span.bar__os MN OS
    span.bar__app {{ activeName }}
    span.bar__menu(v-for="m in menus" :key="m") {{ m }}
  .bar__right
    button.bar__search(type="button" title="Search (⌘K)" @click="palette.show()")
      span.bar__search-ico ⌕
      span.bar__search-txt Search
      kbd.bar__search-kbd ⌘K
    button.bar__theme(
      type="button"
      :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="toggleTheme"
    )
      svg.bar__theme-ico(v-if="theme === 'dark'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round")
        circle(cx="8" cy="8" r="3.2")
        path(d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1")
      svg.bar__theme-ico(v-else viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round")
        path(d="M13.5 9.8A6 6 0 1 1 6.2 2.5a4.8 4.8 0 0 0 7.3 7.3z")
    span.bar__sep
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
import { useCommandPalette } from '~/composables/useCommandPalette'
import { useTheme } from '~/composables/useTheme'
import { profile } from '~/composables/useProfile'

const { activeId, getApp } = useOS()
const palette = useCommandPalette()
const { theme, toggle: toggleTheme } = useTheme()

const activeName = computed(() => {
  const a = activeId.value ? getApp(activeId.value) : null
  return a ? a.name : 'Finder'
})

const menus = ['File', 'Edit', 'View', 'Window']

const socials = [
  { label: 'GitHub', title: 'GitHub profile', href: profile.github },
  { label: 'LinkedIn', title: 'LinkedIn profile', href: profile.linkedin },
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
  background: var(--chrome);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border-bottom: 1px solid var(--hairline);
}
.bar__left { display: flex; align-items: center; gap: 1.05rem; }
.bar__logo { display: inline-flex; align-items: center; }
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
.bar__search {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.15rem 0.5rem;
  border-radius: 0.45rem;
  color: var(--color-muted);
  background: var(--veil-2);
  border: 1px solid var(--hairline);
  cursor: pointer;
  font-family: var(--font-mono);
  transition: border-color 0.15s ease, color 0.15s ease;
}
.bar__search:hover { color: var(--color-fog); border-color: color-mix(in srgb, var(--color-neon) 35%, transparent); }
.bar__search-ico { font-size: 0.8rem; }
.bar__search-txt { font-size: 0.66rem; }
@media (max-width: 720px) { .bar__search-txt { display: none; } }
.bar__search-kbd { font-size: 0.58rem; padding: 0.05rem 0.3rem; border-radius: 0.3rem; background: var(--veil-2); border: 1px solid var(--hairline-2); }
.bar__sep { width: 1px; height: 14px; background: var(--hairline-2); }
.bar__theme {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 20px;
  padding: 0;
  border-radius: 0.4rem;
  color: var(--color-muted);
  background: var(--veil-2);
  border: 1px solid var(--hairline);
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}
.bar__theme:hover { color: var(--color-fog); background: var(--veil-3); }
.bar__theme-ico { width: 13px; height: 13px; }
.bar__stat { display: inline-flex; align-items: center; gap: 0.3rem; color: var(--color-fog); }
.bar__icon { height: 12px; width: auto; display: block; }
.bar__battery .bar__icon { width: 26px; }
.bar__batt { font-size: 0.66rem; }
.bar__clock { color: var(--color-fog); }
</style>
