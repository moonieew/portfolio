<template lang="pug">
Transition(name="lock")
  .lock(v-if="locked")
    //- Wallpaper
    .lock__wall
      .lock__orb.lock__orb--neon
      .lock__orb.lock__orb--purple
      .lock__grid.bp-grid
      .lock__vignette

    //- Theme switch (top-right, like a lock-screen control)
    button.lock__theme(
      type="button"
      :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="toggleTheme"
    )
      svg.lock__theme-ico(v-if="theme === 'dark'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round")
        circle(cx="8" cy="8" r="3.2")
        path(d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1")
      svg.lock__theme-ico(v-else viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round")
        path(d="M13.5 9.8A6 6 0 1 1 6.2 2.5a4.8 4.8 0 0 0 7.3 7.3z")

    //- Centered stack: logo draws itself first, then the rest fades in
    .lock__stack(:class="{ 'is-in': introDone }")
      LogoMark.lock__logo(:size="96" animated)

      .lock__clock
        p.lock__time {{ time }}
        p.lock__date {{ date }}

      .lock__user
        .lock__avatar
          img(src="/me.jpg" alt="Portrait of Minh Nguyệt" draggable="false")
        p.lock__name Minh Nguyệt
        p.lock__role Frontend Developer · MN OS

      button.lock__cta(type="button" @click="unlock")
        span Get Started
        span.lock__cta-arrow →

      p.lock__hint press Enter ↵
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useNow } from '@vueuse/core'
import { useLockScreen } from '~/composables/useLockScreen'
import { useTheme } from '~/composables/useTheme'

const { locked, unlock } = useLockScreen()
const { theme, toggle: toggleTheme } = useTheme()

// Reveal the clock/user/CTA once the logo finishes drawing (~2.4s).
const introDone = ref(false)

const now = useNow({ interval: 1000 })
const time = computed(() =>
  now.value.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
)
const date = computed(() =>
  now.value.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }),
)

function onKeydown(e: KeyboardEvent) {
  // Ignore Enter on focused buttons (e.g. the theme switch) — it already clicks them.
  if (e.key === 'Enter' && locked.value && !(e.target instanceof HTMLButtonElement))
    unlock()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) introDone.value = true
  else setTimeout(() => (introDone.value = true), 2400)
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.lock {
  position: absolute;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  background: var(--color-ink);
  overflow: hidden;
}

/* ---- Wallpaper ---- */
.lock__wall { position: absolute; inset: 0; }
.lock__orb { position: absolute; width: 40rem; height: 40rem; border-radius: 999px; filter: blur(130px); opacity: 0.2; }
.lock__orb--neon { top: -16rem; left: -10rem; background: var(--color-neon); }
.lock__orb--purple { bottom: -18rem; right: -10rem; background: var(--color-purple); }
.lock__grid { position: absolute; inset: 0; opacity: 0.2; mask-image: radial-gradient(60% 55% at 50% 45%, #000 25%, transparent 75%); }
.lock__vignette { position: absolute; inset: 0; background: radial-gradient(120% 100% at 50% 50%, transparent 55%, var(--vignette)); }

/* ---- Theme switch ---- */
.lock__theme {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  color: var(--color-muted);
  background: var(--veil-2);
  border: 1px solid var(--hairline);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}
.lock__theme:hover { color: var(--color-fog); background: var(--veil-3); }
.lock__theme-ico { width: 15px; height: 15px; }

/* ---- Stack ---- */
.lock__stack {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
  text-align: center;
}

.lock__logo { flex: none; }

/* Hidden until the logo finishes drawing, then staggered in */
.lock__clock,
.lock__user,
.lock__cta,
.lock__hint {
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 0.8s ease,
    transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.lock__stack.is-in .lock__clock { opacity: 1; transform: none; transition-delay: 0.05s; }
.lock__stack.is-in .lock__user { opacity: 1; transform: none; transition-delay: 0.2s; }
.lock__stack.is-in .lock__cta { opacity: 1; transform: none; transition-delay: 0.4s; }
.lock__stack.is-in .lock__hint { opacity: 1; transform: none; transition-delay: 0.55s; }

/* ---- Clock ---- */
.lock__clock { margin-top: 1.4rem; }
.lock__time {
  font-size: clamp(2.8rem, 8vw, 4.4rem);
  font-weight: 300;
  letter-spacing: -0.03em;
  line-height: 1;
  background: linear-gradient(120deg, var(--title-a), var(--title-c));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.lock__date {
  margin-top: 0.45rem;
  font-size: 0.86rem;
  color: var(--color-muted);
}

/* ---- User ---- */
.lock__user { margin-top: 2.4rem; display: flex; flex-direction: column; align-items: center; }
.lock__avatar {
  width: 96px;
  height: 96px;
  padding: 3px;
  border-radius: 999px;
  background: linear-gradient(140deg, var(--color-neon), var(--color-purple));
  box-shadow:
    0 0 40px -10px color-mix(in srgb, var(--color-neon) 55%, transparent),
    0 18px 50px -20px var(--shadow-mid);
}
.lock__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 999px;
  border: 3px solid var(--color-ink);
  user-select: none;
}
.lock__name {
  margin-top: 0.9rem;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.lock__role {
  margin-top: 0.3rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-muted);
}

/* ---- CTA ---- */
.lock__cta {
  margin-top: 1.8rem;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.68rem 1.7rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-fog);
  background: color-mix(in srgb, var(--color-surface) 70%, transparent);
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid color-mix(in srgb, var(--color-neon) 35%, transparent);
  cursor: pointer;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
.lock__cta:hover {
  background: color-mix(in srgb, var(--color-neon) 14%, var(--color-surface));
  box-shadow: 0 0 30px -8px color-mix(in srgb, var(--color-neon) 60%, transparent);
  transform: translateY(-1px);
}
.lock__cta:active { transform: translateY(0); }
.lock__cta-arrow { transition: transform 0.2s ease; }
.lock__cta:hover .lock__cta-arrow { transform: translateX(3px); }

.lock__hint {
  margin-top: 1rem;
  font-family: var(--font-mono);
  font-size: 0.66rem;
  color: var(--color-muted);
}
@media (max-width: 767px) {
  .lock__hint { display: none; }
}

/* ---- Unlock transition (macOS-style zoom + fade) ---- */
.lock-leave-active { transition: opacity 0.65s ease, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1); }
.lock-leave-to { opacity: 0; transform: scale(1.06); }

@media (prefers-reduced-motion: reduce) {
  .lock__clock,
  .lock__user,
  .lock__cta,
  .lock__hint { transition: opacity 0.3s ease; transform: none; }
  .lock-leave-active { transition: opacity 0.3s ease; }
  .lock-leave-to { transform: none; }
}
</style>
