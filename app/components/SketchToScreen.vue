<template lang="pug">
section.s2s(ref="root" :class="`s2s--${accent}`")
  //- Pinned stage — stays in view while the spacer below scrolls past it
  .s2s__stage(ref="stage")
    header.s2s__head
      .s2s__lead
        span.s2s__index {{ index }}
        .s2s__titles
          h3.s2s__title {{ title }}
          p.s2s__desc(v-if="description") {{ description }}
      ul.s2s__tech
        li.s2s__chip(v-for="t in techStack" :key="t") {{ t }}

    .s2s__frame
      .s2s__aura(:style="auraStyle")
      //- Layer A — monochrome wireframe / blueprint
      .s2s__layer.s2s__sketch(:style="sketchStyle")
        slot(name="sketch")
          .s2s__fallback.bp-grid Wireframe
      //- Layer B — polished UI, wiped in on scroll
      .s2s__layer.s2s__final(:style="finalStyle")
        .s2s__scan.scanlines
        slot(name="final")
          .s2s__fallback Final UI
      //- Reveal seam rides the wipe edge
      .s2s__seam(:style="seamStyle")
        span.s2s__seam-dot
        span.s2s__seam-flag {{ progressPct }}%

    footer.s2s__foot
      .s2s__track
        .s2s__fill(:style="{ width: `${progressPct}%` }")
      .s2s__phase
        span(:class="{ 's2s__phase--on': progress < 0.5 }") SKETCH
        span.s2s__phase-arrow →
        span(:class="{ 's2s__phase--on': progress >= 0.5 }") SCREEN

  //- Scroll runway that drives the reveal
  .s2s__spacer(:style="{ height: `${scrub}px` }")
    span.s2s__hint ↓ scroll to render
  slot(name="epilogue")
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useScroll } from '@vueuse/core'
import type { Accent } from '~/composables/useOS'

interface Props {
  title: string
  description?: string
  techStack?: string[]
  accent?: Accent
  index?: string
  /** Pixels of scroll runway that map to the 0→1 reveal. */
  scrub?: number
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  techStack: () => [],
  accent: 'neon',
  index: '01',
  scrub: 620,
})

const root = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)

// The app scrolls inside this component; the stage is sticky-pinned to the top.
const { y } = useScroll(root)

const progress = computed(() => {
  const range = props.scrub || 1
  return Math.min(1, Math.max(0, y.value / range))
})
const progressPct = computed(() => Math.round(progress.value * 100))

const sketchStyle = computed(() => ({
  opacity: String(Math.max(0, 1 - progress.value * 1.15)),
  transform: `scale(${1 + progress.value * 0.015})`,
}))
const finalStyle = computed(() => ({
  clipPath: `inset(0 ${(1 - progress.value) * 100}% 0 0)`,
  opacity: String(Math.min(1, progress.value * 1.4)),
}))
const seamStyle = computed(() => ({
  left: `${progress.value * 100}%`,
  opacity: progress.value > 0.02 && progress.value < 0.99 ? '1' : '0',
}))
const auraStyle = computed(() => ({
  opacity: String(0.12 + progress.value * 0.5),
}))
</script>

<style scoped>
.s2s {
  position: relative;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
}

.s2s__stage {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: clamp(0.9rem, 2.5vw, 1.6rem);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  background: linear-gradient(180deg, var(--color-ink-soft) 70%, transparent);
}

/* Header */
.s2s__head {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  align-items: flex-start;
  justify-content: space-between;
}
.s2s__lead { display: flex; gap: 0.7rem; align-items: baseline; }
.s2s__index {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  color: var(--color-muted);
}
.s2s__title { font-size: clamp(1.05rem, 2.4vw, 1.45rem); font-weight: 700; line-height: 1.1; }
.s2s__desc { margin-top: 0.3rem; max-width: 48ch; font-size: 0.85rem; line-height: 1.5; color: var(--color-muted); }
.s2s__tech { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.s2s__chip {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  padding: 0.24rem 0.55rem;
  border-radius: 999px;
  color: var(--color-fog);
  background: var(--veil-1);
  border: 1px solid var(--hairline);
}
.s2s--neon .s2s__chip { border-color: color-mix(in srgb, var(--color-neon) 18%, transparent); }
.s2s--purple .s2s__chip { border-color: color-mix(in srgb, var(--color-purple) 22%, transparent); }
.s2s--blue .s2s__chip { border-color: color-mix(in srgb, var(--color-blue) 22%, transparent); }

/* Frame */
.s2s__frame {
  position: relative;
  aspect-ratio: 16 / 9;
  max-height: 56vh;
  border-radius: 0.85rem;
  overflow: hidden;
  border: 1px solid var(--hairline);
  background: var(--color-ink);
}
.s2s__aura {
  position: absolute;
  inset: -45% -20% auto -20%;
  height: 70%;
  filter: blur(70px);
  pointer-events: none;
  transition: opacity 0.2s linear;
}
.s2s--neon .s2s__aura { background: radial-gradient(60% 100% at 50% 0%, var(--color-neon), transparent 70%); }
.s2s--purple .s2s__aura { background: radial-gradient(60% 100% at 50% 0%, var(--color-purple), transparent 70%); }
.s2s--blue .s2s__aura { background: radial-gradient(60% 100% at 50% 0%, var(--color-blue), transparent 70%); }

.s2s__layer { position: absolute; inset: 0; }
.s2s__sketch { filter: grayscale(1) contrast(1.05); }
.s2s__final { will-change: clip-path, opacity; }
.s2s__scan { position: absolute; inset: 0; pointer-events: none; opacity: 0.5; }
.s2s__fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-muted);
}

/* Seam */
.s2s__seam { position: absolute; top: 0; bottom: 0; width: 2px; transform: translateX(-1px); pointer-events: none; transition: opacity 0.2s linear; }
.s2s--neon .s2s__seam { background: linear-gradient(var(--color-neon), transparent); box-shadow: 0 0 16px var(--color-neon); }
.s2s--purple .s2s__seam { background: linear-gradient(var(--color-purple), transparent); box-shadow: 0 0 16px var(--color-purple); }
.s2s--blue .s2s__seam { background: linear-gradient(var(--color-blue), transparent); box-shadow: 0 0 16px var(--color-blue); }
.s2s__seam-dot { position: absolute; top: 0; left: 50%; width: 9px; height: 9px; border-radius: 999px; transform: translateX(-50%); }
.s2s--neon .s2s__seam-dot { background: var(--color-neon); box-shadow: 0 0 12px var(--color-neon); }
.s2s--purple .s2s__seam-dot { background: var(--color-purple); box-shadow: 0 0 12px var(--color-purple); }
.s2s--blue .s2s__seam-dot { background: var(--color-blue); box-shadow: 0 0 12px var(--color-blue); }
.s2s__seam-flag {
  position: absolute;
  top: 8px;
  left: 8px;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 0.3rem;
  color: var(--color-ink);
}
.s2s--neon .s2s__seam-flag { background: var(--color-neon); }
.s2s--purple .s2s__seam-flag { background: var(--color-purple); }
.s2s--blue .s2s__seam-flag { background: var(--color-blue); }

/* Footer */
.s2s__foot { display: flex; align-items: center; gap: 0.8rem; }
.s2s__track { flex: 1; height: 3px; border-radius: 999px; background: var(--veil-3); overflow: hidden; }
.s2s__fill { height: 100%; border-radius: 999px; transition: width 0.08s linear; }
.s2s--neon .s2s__fill { background: var(--color-neon); box-shadow: 0 0 12px var(--color-neon); }
.s2s--purple .s2s__fill { background: var(--color-purple); box-shadow: 0 0 12px var(--color-purple); }
.s2s--blue .s2s__fill { background: var(--color-blue); box-shadow: 0 0 12px var(--color-blue); }
.s2s__phase { display: flex; align-items: center; gap: 0.4rem; font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.1em; color: var(--color-muted); }
.s2s__phase-arrow { opacity: 0.5; }
.s2s__phase--on { color: var(--color-fog); }
.s2s--neon .s2s__phase--on { color: var(--color-neon); }
.s2s--purple .s2s__phase--on { color: var(--color-purple); }
.s2s--blue .s2s__phase--on { color: var(--color-blue); }

/* Scroll runway */
.s2s__spacer { display: flex; align-items: flex-start; justify-content: center; }
.s2s__hint {
  margin-top: 1.2rem;
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-muted);
  animation: floaty 2.4s ease-in-out infinite;
}
@keyframes floaty {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(6px); opacity: 1; }
}
</style>
