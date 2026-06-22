<template lang="pug">
.dock
  .dock__inner
    button.dock__app(
      v-for="a in apps"
      :key="a.id"
      type="button"
      :class="[`dock__app--${a.accent}`, { 'is-open': isOpen(a.id), 'is-active': activeId === a.id }]"
      :title="a.name"
      @click="dockToggle(a.id)"
    )
      span.dock__icon {{ a.icon }}
      span.dock__tip {{ a.short }}
      span.dock__indicator
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px -20px rgba(0, 0, 0, 0.8);
}
.dock__app {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 0.8rem;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease;
}
.dock__app:hover { transform: translateY(-10px) scale(1.12); background: rgba(255, 255, 255, 0.08); }
.dock__icon { font-size: 1.3rem; line-height: 1; }
.dock__app--neon .dock__icon { color: var(--color-neon); }
.dock__app--purple .dock__icon { color: var(--color-purple); }
.dock__app--blue .dock__icon { color: #3b82f6; }

.dock__tip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  padding: 0.2rem 0.5rem;
  border-radius: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.64rem;
  white-space: nowrap;
  color: var(--color-fog);
  background: rgba(20, 20, 22, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dock__app:hover .dock__tip { opacity: 1; transform: translateX(-50%) translateY(0); }

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
.dock__app--blue.is-active .dock__indicator { background: #3b82f6; box-shadow: 0 0 8px #3b82f6; }
</style>
