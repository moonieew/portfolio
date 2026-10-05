<template lang="pug">
.desk
  //- Wallpaper
  .desk__wall
    .desk__orb.desk__orb--neon
    .desk__orb.desk__orb--purple
    .desk__grid.bp-grid

  //- Menu bar (desktop only — lives in the desktop shell)
  TopMenuBar

  //- Ambient system widgets (wide screens only; sits behind windows)
  DesktopWidgets

  //- Welcome hint when nothing is open
  Transition(name="fade")
    .desk__welcome(v-if="openWindowIds.length === 0")
      h1.desk__welcome-title Lê Thị Minh Nguyệt — MN OS
      p.desk__welcome-sub Frontend Developer & System Architect
      p.desk__welcome-hint Open an app from the dock to explore the work ↓

  //- Floating windows
  DesktopWindow(v-for="id in openWindowIds" :key="id" :app-id="id")

  //- Dock
  OSDock

  //- First-run welcome + Spotlight command palette (⌘K)
  Onboarding
  CommandPalette
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useOS } from '~/composables/useOS'
import { useShortcuts } from '~/composables/useShortcuts'

const { openWindowIds, openApp } = useOS()

// Global keymap: ⌘K palette, Esc, ⌘W.
useShortcuts()

// Only boot Identity when there's no restored session (first-ever visit).
onMounted(() => {
  if (openWindowIds.value.length === 0) openApp('identity')
})
</script>

<style scoped>
.desk { position: absolute; inset: 0; overflow: hidden; }

/* Wallpaper */
.desk__wall { position: absolute; inset: 0; background: var(--color-ink); }
.desk__orb { position: absolute; width: 46rem; height: 46rem; border-radius: 999px; filter: blur(140px); opacity: 0.18; }
.desk__orb--neon { top: -18rem; left: -12rem; background: var(--color-neon); }
.desk__orb--purple { bottom: -20rem; right: -12rem; background: var(--color-purple); }
.desk__grid { position: absolute; inset: 0; opacity: 0.25; mask-image: radial-gradient(70% 60% at 50% 40%, #000 30%, transparent 78%); }

/* Welcome */
.desk__welcome {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -60%);
  text-align: center;
  pointer-events: none;
}
.desk__welcome-title {
  font-size: clamp(1.6rem, 5vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(120deg, var(--title-a), var(--title-c));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.desk__welcome-sub { margin-top: 0.5rem; font-size: 1rem; color: var(--color-muted); }
.desk__welcome-hint { margin-top: 1.4rem; font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-neon); }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
