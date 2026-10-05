<template lang="pug">
.dock
  .dock__inner
    button.dock__app(
      v-for="a in apps"
      :key="a.id"
      type="button"
      :class="[`dock__app--${a.accent}`, { 'is-open': isOpen(a.id), 'is-active': activeId === a.id }]"
      :aria-label="a.name"
      @click="dockToggle(a.id)"
    )
      span.dock__icon {{ a.icon }}
      span.dock__indicator
      span.dock__tip(role="tooltip") {{ a.name }}
</template>

<script setup lang="ts">
import { useOS } from '~/composables/useOS'

const { apps, isOpen, activeId, dockToggle } = useOS()
</script>

<style scoped>
.dock {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9000;
}
.dock__inner {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.5rem 0.7rem;
  border-radius: 1.1rem;
  background: color-mix(in srgb, var(--color-surface) 65%, transparent);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  border: 1px solid var(--hairline-2);
  box-shadow: 0 20px 50px -20px var(--shadow-mid);
}
.dock__app {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 0.8rem;
  display: grid;
  place-items: center;
  background: var(--veil-2);
  border: 1px solid var(--hairline);
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease;
}
.dock__app:hover { transform: translateY(-10px) scale(1.12); background: var(--veil-3); }
.dock__icon { font-size: 1.3rem; line-height: 1; }
.dock__app--neon .dock__icon { color: var(--color-neon); }
.dock__app--purple .dock__icon { color: var(--color-purple); }
.dock__app--blue .dock__icon { color: var(--color-blue); }

.dock__tip {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%) translateY(6px) scale(0.92);
  padding: 0.3rem 0.6rem;
  border-radius: 0.5rem;
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  color: var(--color-fog);
  background: var(--chrome-solid);
  border: 1px solid var(--hairline-2);
  box-shadow: 0 12px 30px -12px var(--shadow-strong);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.dock__tip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--chrome-solid);
}
.dock__app:hover .dock__tip,
.dock__app:focus-visible .dock__tip {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}
@media (prefers-reduced-motion: reduce) {
  .dock__tip { transition: opacity 0.16s ease; }
}

.dock__indicator {
  position: absolute;
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: var(--color-muted);
  opacity: 0;
  transition: opacity 0.2s ease;
}
.dock__app.is-open .dock__indicator { opacity: 1; }
.dock__app.is-active .dock__indicator { width: 14px; }
.dock__app--neon.is-active .dock__indicator { background: var(--color-neon); box-shadow: 0 0 8px var(--color-neon); }
.dock__app--purple.is-active .dock__indicator { background: var(--color-purple); box-shadow: 0 0 8px var(--color-purple); }
.dock__app--blue.is-active .dock__indicator { background: var(--color-blue); box-shadow: 0 0 8px var(--color-blue); }
</style>
