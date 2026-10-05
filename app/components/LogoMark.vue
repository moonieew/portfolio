<template lang="pug">
svg.logo(
  :class="{ 'is-animated': animated }"
  :width="size"
  :height="size"
  viewBox="0 0 120 120"
  fill="none"
  role="img"
  aria-label="MN OS logo"
)
  defs
    linearGradient(:id="gradId" x1="0" y1="0" x2="1" y2="1")
      stop(offset="0%" style="stop-color: color-mix(in srgb, var(--color-neon) 55%, #d7ffe9)")
      stop(offset="100%" style="stop-color: var(--color-neon)")
  //- Orbit ring — open arc, the gap holds the "moon" dot (Nguyệt = moon)
  path.logo__ring(
    d="M83.6 13.7 A52 52 0 1 0 106.3 36.4"
    style="stroke: color-mix(in srgb, var(--color-fog) 40%, transparent)"
    stroke-width="3"
    stroke-linecap="round"
    pathLength="1"
  )
  //- M
  path.logo__m(
    d="M28 79 L28 42 L46 67 L64 42 L64 79"
    :stroke="`url(#${gradId})`"
    stroke-width="6"
    stroke-linecap="round"
    stroke-linejoin="round"
    pathLength="1"
  )
  //- N (shares the M's right stem)
  path.logo__n(
    d="M64 42 L92 79 L92 42"
    :stroke="`url(#${gradId})`"
    stroke-width="6"
    stroke-linecap="round"
    stroke-linejoin="round"
    pathLength="1"
  )
  //- Moon dot sitting in the orbit gap
  circle.logo__dot(cx="96.8" cy="23.2" r="4.5" style="fill: var(--color-purple)")
</template>

<script setup lang="ts">
import { useId } from 'vue'

withDefaults(
  defineProps<{
    /** Rendered square size in px. */
    size?: number
    /** Play the one-shot "drawing" stroke animation on mount. */
    animated?: boolean
  }>(),
  { size: 64, animated: false },
)

// SSR-safe unique id so several logos on one page don't share a gradient.
const gradId = `logo-grad-${useId()}`
</script>

<style scoped>
.logo {
  display: block;
  filter: drop-shadow(0 0 12px color-mix(in srgb, var(--color-neon) 30%, transparent));
}

/* ---- One-shot draw-on animation ---- */
.is-animated .logo__ring,
.is-animated .logo__m,
.is-animated .logo__n {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: logo-draw ease forwards;
}
.is-animated .logo__ring { animation-duration: 0.9s; animation-delay: 0.15s; }
.is-animated .logo__m { animation-duration: 0.6s; animation-delay: 1s; }
.is-animated .logo__n { animation-duration: 0.45s; animation-delay: 1.55s; }

.is-animated .logo__dot {
  opacity: 0;
  transform-origin: 96.8px 23.2px;
  transform: scale(0);
  animation: logo-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) 1.95s forwards;
}

@keyframes logo-draw {
  to { stroke-dashoffset: 0; }
}
@keyframes logo-pop {
  to { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .is-animated .logo__ring,
  .is-animated .logo__m,
  .is-animated .logo__n {
    animation: none;
    stroke-dasharray: none;
    stroke-dashoffset: 0;
  }
  .is-animated .logo__dot {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
