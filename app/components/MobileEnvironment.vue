<template lang="pug">
.mob
  .mob__wall
    .mob__orb.mob__orb--neon
    .mob__orb.mob__orb--purple

  //- Status bar
  header.mob__status
    span.mob__time {{ clock }}
    span.mob__sys
      span MN OS
      span.mob__sig ●●●●
      span 100%
      button.mob__theme(
        type="button"
        :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleTheme"
      ) {{ theme === 'dark' ? '☀' : '☾' }}

  //- Home screen
  .mob__home
    .mob__hero
      h1.mob__name LÊ THỊ MINH NGUYỆT
      p.mob__role Frontend Developer & System Architect
    .mob__grid
      button.mob__app(
        v-for="a in apps"
        :key="a.id"
        type="button"
        :class="`mob__app--${a.accent}`"
        @click="openMobile(a.id)"
      )
        span.mob__icon {{ a.icon }}
        span.mob__label {{ a.short }}

  //- Slide-up full-screen app
  Transition(name="slideup")
    MobileAppScreen(v-if="mobileApp" :key="mobileApp.id" :app="mobileApp")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '@vueuse/core'
import { useOS } from '~/composables/useOS'
import { useTheme } from '~/composables/useTheme'

const { apps, mobileApp, openMobile } = useOS()
const { theme, toggle: toggleTheme } = useTheme()

const now = useNow({ interval: 1000 })
const clock = computed(() =>
  now.value.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
)
</script>

<style scoped>
.mob { position: absolute; inset: 0; overflow: hidden; display: flex; flex-direction: column; }
.mob__wall { position: absolute; inset: 0; background: var(--color-ink); }
.mob__orb { position: absolute; width: 24rem; height: 24rem; border-radius: 999px; filter: blur(110px); opacity: 0.22; }
.mob__orb--neon { top: -8rem; left: -8rem; background: var(--color-neon); }
.mob__orb--purple { bottom: -8rem; right: -8rem; background: var(--color-purple); }

.mob__status {
  position: relative;
  z-index: 2;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 1.1rem 0.2rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
}
.mob__time { font-weight: 700; }
.mob__sys { display: flex; align-items: center; gap: 0.5rem; color: var(--color-muted); }
.mob__sig { letter-spacing: -1px; color: var(--color-neon); }
.mob__theme {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border-radius: 999px;
  font-size: 0.7rem;
  line-height: 1;
  color: var(--color-fog);
  background: var(--veil-2);
  border: 1px solid var(--hairline);
  cursor: pointer;
}

.mob__home { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; padding: 1.4rem 1.2rem 2rem; }
.mob__hero { margin: 1.5rem 0 2.2rem; }
.mob__name {
  font-size: clamp(1.5rem, 8vw, 2.1rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.05;
  background: linear-gradient(120deg, var(--title-a), var(--title-c));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.mob__role { margin-top: 0.5rem; font-size: 0.85rem; color: var(--color-muted); }

.mob__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.1rem 0.6rem; }
.mob__app { display: flex; flex-direction: column; align-items: center; gap: 0.45rem; background: none; border: none; cursor: pointer; }
.mob__icon {
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  font-size: 1.7rem;
  border-radius: 1.1rem;
  background: color-mix(in srgb, var(--color-surface) 75%, transparent);
  border: 1px solid var(--hairline-2);
  box-shadow: 0 12px 30px -16px var(--shadow-strong);
  transition: transform 0.15s ease;
}
.mob__app:active .mob__icon { transform: scale(0.92); }
.mob__app--neon .mob__icon { color: var(--color-neon); }
.mob__app--purple .mob__icon { color: var(--color-purple); }
.mob__app--blue .mob__icon { color: var(--color-blue); }
.mob__label { font-size: 0.72rem; color: var(--color-fog); }

/* Slide-up transition for the full-screen app */
.slideup-enter-from,
.slideup-leave-to { transform: translateY(100%); }
.slideup-enter-active,
.slideup-leave-active { transition: transform 0.42s cubic-bezier(0.32, 0.72, 0, 1); }
</style>
