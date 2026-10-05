<template lang="pug">
Teleport(to="body")
  Transition(name="cmd")
    .cmd(v-if="open" @click.self="hide")
      .cmd__panel(role="dialog" aria-modal="true" aria-label="Command palette")
        .cmd__search
          span.cmd__search-ico ⌘
          input.cmd__input(
            ref="inputEl"
            v-model="q"
            type="text"
            placeholder="Search apps, projects, links…"
            aria-label="Search"
            @keydown.down.prevent="move(1)"
            @keydown.up.prevent="move(-1)"
            @keydown.enter.prevent="run(results[cursor])"
          )
          kbd.cmd__hint esc
        ul.cmd__list(role="listbox")
          li.cmd__item(
            v-for="(r, i) in results"
            :key="r.id"
            role="option"
            :aria-selected="i === cursor"
            :class="{ 'is-active': i === cursor }"
            @click="run(r)"
            @mousemove="cursor = i"
          )
            span.cmd__item-ico(:class="`is-${r.accent}`") {{ r.icon }}
            span.cmd__item-label {{ r.label }}
            span.cmd__item-kind {{ r.kind }}
          li.cmd__empty(v-if="!results.length") No matches for “{{ q }}”
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useCommandPalette } from '~/composables/useCommandPalette'
import { useOS } from '~/composables/useOS'
import { useTheme } from '~/composables/useTheme'
import { profile } from '~/composables/useProfile'

interface Command {
  id: string
  icon: string
  accent: 'neon' | 'purple' | 'blue'
  label: string
  kind: string
  run: () => void
}

const { open, hide } = useCommandPalette()
const { apps, openApp } = useOS()
const { theme, toggle: toggleTheme } = useTheme()

function go(href: string, sameTab = false) {
  window.open(href, sameTab ? '_self' : '_blank', 'noopener,noreferrer')
}

const links: Command[] = [
  { id: 'lnk:github', icon: '⌥', accent: 'neon', label: 'Open GitHub', kind: 'link', run: () => go(profile.github) },
  { id: 'lnk:linkedin', icon: 'in', accent: 'blue', label: 'Open LinkedIn', kind: 'link', run: () => go(profile.linkedin) },
  { id: 'lnk:email', icon: '✉', accent: 'purple', label: 'Email me', kind: 'link', run: () => go(`mailto:${profile.email}`, true) },
]

const commands = computed<Command[]>(() => [
  ...apps.map((a) => ({
    id: `app:${a.id}`,
    icon: a.icon,
    accent: a.accent === 'mono' ? 'neon' : a.accent,
    label: `Open ${a.name}`,
    kind: 'app',
    run: () => openApp(a.id),
  })),
  {
    id: 'sys:theme',
    icon: theme.value === 'dark' ? '☀' : '☾',
    accent: 'neon',
    label: theme.value === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
    kind: 'system',
    run: toggleTheme,
  },
  ...links,
])

const q = ref('')
const cursor = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)

const results = computed(() => {
  const t = q.value.trim().toLowerCase()
  if (!t) return commands.value
  return commands.value.filter((c) => c.label.toLowerCase().includes(t))
})

function move(d: number) {
  const n = results.value.length
  if (n) cursor.value = (cursor.value + d + n) % n
}
function run(r?: Command) {
  if (!r) return
  r.run()
  hide()
}

watch(open, async (v) => {
  if (v) {
    q.value = ''
    cursor.value = 0
    await nextTick()
    inputEl.value?.focus()
  }
})
watch(results, () => (cursor.value = 0))
</script>

<style scoped>
.cmd {
  position: fixed;
  inset: 0;
  z-index: 12000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 14vh;
  background: var(--scrim);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.cmd__panel {
  width: min(620px, 92vw);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--color-surface) 86%, transparent);
  backdrop-filter: blur(30px) saturate(160%);
  -webkit-backdrop-filter: blur(30px) saturate(160%);
  border: 1px solid var(--hairline-2);
  box-shadow: 0 40px 120px -30px var(--shadow-strong);
  overflow: hidden;
}
.cmd__search { display: flex; align-items: center; gap: 0.7rem; padding: 0.9rem 1rem; border-bottom: 1px solid var(--hairline); }
.cmd__search-ico { color: var(--color-neon); font-size: 0.95rem; }
.cmd__input { flex: 1; min-width: 0; background: none; border: none; outline: none; color: var(--color-fog); font-size: 1rem; font-family: var(--font-sans); }
.cmd__input::placeholder { color: var(--placeholder); }
.cmd__hint { font-family: var(--font-mono); font-size: 0.6rem; color: var(--color-muted); border: 1px solid var(--hairline-2); border-radius: 0.35rem; padding: 0.1rem 0.4rem; }

.cmd__list { max-height: 48vh; overflow-y: auto; padding: 0.4rem; margin: 0; list-style: none; }
.cmd__item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.7rem; border-radius: 0.6rem; cursor: pointer; }
.cmd__item.is-active { background: color-mix(in srgb, var(--color-neon) 14%, transparent); }
.cmd__item-ico { flex: none; width: 26px; text-align: center; color: var(--color-neon); font-family: var(--font-mono); font-size: 0.85rem; }
.cmd__item-ico.is-purple { color: var(--color-purple); }
.cmd__item-ico.is-blue { color: var(--color-blue); }
.cmd__item-label { flex: 1; font-size: 0.9rem; }
.cmd__item-kind { font-family: var(--font-mono); font-size: 0.6rem; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.1em; }
.cmd__empty { padding: 1.4rem; text-align: center; color: var(--color-muted); font-size: 0.85rem; }

.cmd-enter-active,
.cmd-leave-active { transition: opacity 0.18s ease; }
.cmd-enter-active .cmd__panel,
.cmd-leave-active .cmd__panel { transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1); }
.cmd-enter-from,
.cmd-leave-to { opacity: 0; }
.cmd-enter-from .cmd__panel { transform: translateY(-12px) scale(0.97); }

@media (prefers-reduced-motion: reduce) {
  .cmd-enter-active .cmd__panel,
  .cmd-leave-active .cmd__panel { transition: none; }
}
</style>
