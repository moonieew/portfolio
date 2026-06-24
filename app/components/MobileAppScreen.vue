<template lang="pug">
.screen(:class="`screen--${app.accent}`" :style="dragStyle")
  //- Grab bar — swipe down here to dismiss
  header.screen__bar(ref="bar")
    span.screen__grab
    .screen__id
      span.screen__id-icon {{ app.icon }}
      .screen__id-text
        span.screen__name {{ app.name }}
        span.screen__blurb {{ app.blurb }}
    button.screen__back(type="button" @click="closeMobile") Done

  .screen__body
    component(:is="app.component")

  footer.screen__foot
    span.screen__hint ⌄ Swipe down or tap Done to close
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSwipe } from '@vueuse/core'
import { useOS, type AppDef } from '~/composables/useOS'

defineProps<{ app: AppDef }>()

const { closeMobile } = useOS()

const bar = ref<HTMLElement | null>(null)
const dragY = ref(0)

// Rubber-band the sheet as the user drags the grab bar down, dismiss past 90px.
const { isSwiping, lengthY } = useSwipe(bar, {
  onSwipe() {
    // lengthY is positive when swiping up; we only follow downward drags.
    dragY.value = Math.max(0, -lengthY.value)
  },
  onSwipeEnd() {
    if (dragY.value > 90) closeMobile()
    dragY.value = 0
  },
})

const dragStyle = computed(() => ({
  transform: dragY.value ? `translateY(${dragY.value}px)` : '',
  transition: isSwiping.value ? 'none' : 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
}))
</script>

<style scoped>
.screen {
  position: absolute;
  inset: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  background: var(--color-ink);
  overflow: hidden;
}
.screen::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 40%;
  pointer-events: none;
  opacity: 0.5;
}
.screen--neon::before { background: radial-gradient(80% 100% at 50% 0%, color-mix(in srgb, var(--color-neon) 16%, transparent), transparent 70%); }
.screen--purple::before { background: radial-gradient(80% 100% at 50% 0%, color-mix(in srgb, var(--color-purple) 18%, transparent), transparent 70%); }
.screen--blue::before { background: radial-gradient(80% 100% at 50% 0%, color-mix(in srgb, #3b82f6 18%, transparent), transparent 70%); }

.screen__bar {
  position: relative;
  flex: none;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.5rem 1rem 0.7rem;
  touch-action: none;
  cursor: grab;
}
.screen__grab {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 38px;
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
}
.screen__id { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.5rem; }
.screen__id-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 0.6rem;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.screen--neon .screen__id-icon { color: var(--color-neon); }
.screen--purple .screen__id-icon { color: var(--color-purple); }
.screen--blue .screen__id-icon { color: #3b82f6; }
.screen__id-text { display: flex; flex-direction: column; }
.screen__name { font-size: 0.92rem; font-weight: 700; }
.screen__blurb { font-family: var(--font-mono); font-size: 0.62rem; color: var(--color-muted); }
.screen__back {
  margin-left: auto;
  margin-top: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-fog);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
}

.screen__body { position: relative; flex: 1; min-height: 0; overflow: hidden; }
.screen__foot { flex: none; padding: 0.5rem; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05); }
.screen__hint { font-family: var(--font-mono); font-size: 0.62rem; color: var(--color-muted); }
</style>
