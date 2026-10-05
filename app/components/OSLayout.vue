<template lang="pug">
.os
  ClientOnly
    DesktopEnvironment(v-if="isDesktop")
    MobileEnvironment(v-else)
    //- macOS-style lock screen shown on every boot (sits above everything)
    LockScreen
    //- Server / pre-hydration boot screen (avoids breakpoint hydration fl... mismatch)
    template(#fallback)
      .os__boot
        .os__boot-mark
          LogoMark(:size="44")
        p.os__boot-name MN OS
        .os__boot-bar
          span.os__boot-fill
        p.os__boot-text booting environment…
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

// Desktop ≥ 768px → macOS-like windows; below → iOS-like home screen.
const isDesktop = useMediaQuery('(min-width: 768px)')
</script>

<style scoped>
.os {
  position: fixed;
  inset: 0;
  background: var(--color-ink);
  font-family: var(--font-sans);
}

.os__boot {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
}
.os__boot-mark {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  background: var(--veil-2);
  border: 1px solid color-mix(in srgb, var(--color-neon) 30%, transparent);
}
.os__boot-name { font-weight: 700; letter-spacing: 0.02em; }
.os__boot-bar { width: 180px; height: 3px; border-radius: 999px; background: var(--veil-3); overflow: hidden; }
.os__boot-fill { display: block; height: 100%; width: 40%; border-radius: 999px; background: var(--color-neon); animation: boot 1.1s ease-in-out infinite; }
@keyframes boot {
  0% { transform: translateX(-120%); }
  100% { transform: translateX(360%); }
}
.os__boot-text { font-family: var(--font-mono); font-size: 0.7rem; color: var(--color-muted); }
</style>
