<template lang="pug">
.ident
  .ident__term
    .ident__body
      //- Value card — visible immediately, no waiting on the animation.
      .ident__card
        .ident__status
          span.ident__status-dot
          span Open to Frontend opportunities
        h2.ident__name LÊ THỊ MINH NGUYỆT
        p.ident__alias // a.k.a. Anna
        p.ident__role
          span.ident__role-a Frontend Developer
          span.ident__amp  ·
          span.ident__role-b  System Architect
        p.ident__stack Vue · Nuxt · React · TypeScript · Web3 · Real-time
        p.ident__bio
          | I translate complex architectural flows into stable, user-centric
          | products — real-time data layers, deterministic state machines and
          | interfaces measured to the pixel.
        ul.ident__stats
          li.ident__stat(v-for="s in stats" :key="s.label")
            strong.ident__stat-num {{ s.value }}
            span.ident__stat-label {{ s.label }}

      //- Terminal boot — supporting accent, plays fast under the card.
      .ident__boot
        template(v-for="(ln, i) in shown" :key="i")
          p.ident__line(:class="ln.cls")
            span.ident__prompt(v-if="ln.prompt") {{ ln.prompt }}
            span {{ ln.text }}
        p.ident__line(v-if="!done")
          span.ident__prompt(v-if="current.prompt") {{ current.prompt }}
          span {{ buffer }}
          span.ident__caret ▋
        p.ident__line.ident__final(v-else)
          span.ident__prompt guest@anna-os:~$
          span.ident__caret.is-idle ▋
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'

interface Line {
  prompt?: string
  text: string
  cls?: string
}

const stats = [
  { value: '3+', label: 'years experience' },
  { value: '1M+', label: 'users served' },
  { value: '$1M+', label: 'revenue driven' },
]

const SCRIPT: Line[] = [
  { prompt: 'guest@anna-os:~$', text: 'whoami', cls: 'is-cmd' },
  { text: 'Lê Thị Minh Nguyệt (Anna)', cls: 'is-out' },
  { prompt: 'guest@anna-os:~$', text: './build --target=production', cls: 'is-cmd' },
  { text: 'compiling identity… ok · 0 warnings', cls: 'is-ok' },
]

const shown = reactive<Line[]>([])
const buffer = ref('')
const current = ref<Line>({ text: '' })
const done = ref(false)

let cancelled = false
const timers: ReturnType<typeof setTimeout>[] = []

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    timers.push(setTimeout(resolve, ms))
  })
}

async function run() {
  for (const line of SCRIPT) {
    if (cancelled) return
    current.value = line
    buffer.value = ''
    // Faster than before so value lands first, animation is just flavour.
    const speed = line.cls === 'is-cmd' ? 26 : 10
    for (const ch of line.text) {
      if (cancelled) return
      buffer.value += ch
      await sleep(speed)
    }
    await sleep(line.cls === 'is-cmd' ? 130 : 80)
    shown.push({ ...line })
  }
  if (!cancelled) done.value = true
}

onMounted(run)
onUnmounted(() => {
  cancelled = true
  timers.forEach(clearTimeout)
})
</script>

<style scoped>
.ident { height: 100%; padding: clamp(0.75rem, 2vw, 1.25rem); display: flex; }
.ident__term {
  flex: 1;
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--color-surface) 55%, transparent);
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.07);
  overflow-y: auto;
}
.ident__body { padding: clamp(1rem, 3vw, 1.8rem); font-family: var(--font-mono); }

/* Value card */
.ident__card {
  padding: 1.3rem 1.3rem 1.4rem;
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.ident__status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.32rem 0.7rem;
  border-radius: 999px;
  font-family: var(--font-sans);
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--color-neon);
  background: color-mix(in srgb, var(--color-neon) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-neon) 30%, transparent);
}
.ident__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--color-neon);
  box-shadow: 0 0 10px var(--color-neon);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.ident__name {
  font-family: var(--font-sans);
  font-size: clamp(1.4rem, 4.5vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.04;
  background: linear-gradient(120deg, #fff 10%, #cfcfd6 55%, #8b8b95 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.ident__alias { margin-top: 0.3rem; font-size: 0.78rem; color: var(--color-muted); }
.ident__role { margin-top: 0.9rem; font-family: var(--font-sans); font-size: 1rem; font-weight: 600; }
.ident__role-a { color: var(--color-neon); }
.ident__role-b { color: var(--color-purple); }
.ident__amp { color: var(--color-muted); font-weight: 400; }
.ident__stack { margin-top: 0.5rem; font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-purple); }
.ident__bio {
  margin-top: 0.9rem;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  line-height: 1.65;
  color: #c4c4cc;
  max-width: 52ch;
}
.ident__stats { display: flex; flex-wrap: wrap; gap: 1.6rem; margin-top: 1.2rem; padding-top: 1.1rem; border-top: 1px solid rgba(255, 255, 255, 0.07); }
.ident__stat { display: flex; flex-direction: column; }
.ident__stat-num { font-family: var(--font-sans); font-size: 1.4rem; font-weight: 800; color: var(--color-fog); line-height: 1; }
.ident__stat-label { margin-top: 0.3rem; font-size: 0.64rem; color: var(--color-muted); }

/* Terminal boot strip */
.ident__boot { margin-top: 1.3rem; }
.ident__line { font-size: 0.84rem; line-height: 1.7; word-break: break-word; }
.ident__prompt { color: var(--color-neon); margin-right: 0.5rem; }
.is-cmd { color: var(--color-fog); }
.is-out { color: var(--color-muted); }
.is-ok { color: var(--color-neon); }
.ident__caret { color: var(--color-neon); }
.ident__caret.is-idle { animation: blink 1.1s steps(1) infinite; }
.ident__final { margin-top: 0.2rem; }

@media (prefers-reduced-motion: reduce) {
  .ident__status-dot { animation: none; }
}
</style>
