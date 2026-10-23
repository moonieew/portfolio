<template lang="pug">
.tl
  //- Toolbar — keeps the OS window vibe
  .tl__toolbar
    .tl__crumb
      span.tl__crumb-seg Work
      span.tl__crumb-sep ›
      span.tl__crumb-seg.is-current Timeline
    span.tl__hint scroll ↓

  .tl__scroll(ref="scrollEl")
    header.tl__intro
      h3.tl__intro-title The road so far
      p.tl__intro-sub Where I am today — scroll down to rewind back to where it all began.

    .tl__track(ref="trackEl")
      //- Spine + animated progress fill
      .tl__spine
        .tl__spine-fill(:style="{ height: fillPx + 'px' }")

      article.tl__item(
        v-for="(e, i) in entries"
        :key="e.id"
        :ref="(el) => setItemRef(el, i)"
        :class="[`is-${e.tone}`, { 'is-in': revealed[i], 'is-active': actives[i] }]"
      )
        .tl__dot(:class="{ 'is-pulse': e.current }")
          span.tl__dot-glyph {{ e.glyph }}
        .tl__year {{ e.year }}
        .tl__card
          span.tl__period {{ e.period }}
          h4.tl__title {{ e.title }}
          p.tl__role {{ e.role }}
          p.tl__desc {{ e.desc }}
          ul.tl__points
            li(v-for="p in e.points" :key="p") {{ p }}
          ul.tl__tags
            li(v-for="t in e.tags" :key="t") {{ t }}

      //- End cap
      .tl__cap(:class="{ 'is-active': capActive }")
        .tl__cap-dot
        p.tl__cap-text 2019 — where it all began. rewind complete ◂

    footer.tl__statusbar
      span {{ entries.length }} milestones
      span present → 2019
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'

interface Entry {
  id: string
  year: string
  period: string
  title: string
  role: string
  desc: string
  points: string[]
  tags: string[]
  tone: 'blue' | 'purple' | 'neon'
  glyph: string
  current?: boolean
}

const entries: Entry[] = [
  {
    id: 'beowulf',
    year: 'now',
    period: 'May 2023 — Present',
    title: 'Beowulf Blockchain',
    role: 'Frontend Developer',
    desc: 'Real-time DePIN, Web3 and SaaS products built for global scale — Datagram, Quickom, Chat3, Saros & an internal LMS.',
    points: [
      'Real-time node dashboard for a network of 1M+ users — zero frame drops via virtual scrolling + WS batching',
      'Multi-chain wallet flows (Viem/Wagmi) behind a $1M+ Node Sale',
    ],
    tags: ['Nuxt', 'TypeScript', 'GraphQL', 'WebSocket', 'Viem/Wagmi'],
    tone: 'neon',
    glyph: '◢',
    current: true,
  },
  {
    id: 'kyanon',
    year: '2022',
    period: 'Aug 2022 — Mar 2023',
    title: 'Kyanon Digital',
    role: 'Intern / Fresher Frontend Developer',
    desc: 'First professional role — production e-commerce UI for Bipbip (Tops Market) in an Agile team.',
    points: [
      'Responsive product listing, cart & profile UI — React, TypeScript, Chakra UI',
      'REST integration with Backend; QA-hardened stability in a Git Flow workflow',
    ],
    tags: ['React', 'TypeScript', 'Chakra UI', 'REST', 'Agile'],
    tone: 'purple',
    glyph: '⌖',
  },
  {
    id: 'hcmute',
    year: '2019',
    period: 'Oct 2019 — Jul 2023',
    title: 'HCMC University of Technology and Education',
    role: 'B.Eng — Software Engineering · GPA 7.9/10',
    desc: 'Four years of fundamentals — and the habit of shipping things beyond the classroom.',
    points: [
      'Consolation prize — HCMUTE Open Hackathon (2023)',
      'IT Faculty Executive Board — academic competitions & volunteer campaigns',
    ],
    tags: ['Software Engineering', 'Hackathon', 'Student leadership'],
    tone: 'blue',
    glyph: '✎',
  },
]

const scrollEl = ref<HTMLElement | null>(null)
const trackEl = ref<HTMLElement | null>(null)
const itemEls: (HTMLElement | null)[] = []

const fillPx = ref(0)
const actives = ref<boolean[]>(entries.map(() => false))
const revealed = ref<boolean[]>(entries.map(() => false))
const capActive = ref(false)

const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')

function setItemRef(el: unknown, i: number) {
  itemEls[i] = (el as HTMLElement | null) ?? null
}

let raf = 0
function update() {
  raf = 0
  const sc = scrollEl.value
  const tr = trackEl.value
  if (!sc || !tr) return
  const scRect = sc.getBoundingClientRect()
  const trRect = tr.getBoundingClientRect()
  // "Playhead": the point (45% down the viewport) the spine fill grows toward.
  const playhead = scRect.top + sc.clientHeight * 0.45
  const atEnd = sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4

  fillPx.value = Math.max(0, Math.min(playhead - trRect.top, trRect.height))
  entries.forEach((_, i) => {
    const el = itemEls[i]
    if (!el) return
    if (el.getBoundingClientRect().top <= playhead) actives.value[i] = true
  })
  if (atEnd || fillPx.value >= trRect.height - 8) capActive.value = true
}

function onScroll() {
  if (!raf) raf = requestAnimationFrame(update)
}

let io: IntersectionObserver | null = null
let ro: ResizeObserver | null = null

onMounted(() => {
  const sc = scrollEl.value
  if (!sc) return

  if (reduced.value) {
    // No motion: show everything lit up immediately.
    revealed.value = entries.map(() => true)
    actives.value = entries.map(() => true)
    capActive.value = true
    fillPx.value = trackEl.value?.getBoundingClientRect().height ?? 0
    return
  }

  io = new IntersectionObserver(
    (obs) => {
      for (const o of obs) {
        if (!o.isIntersecting) continue
        const i = itemEls.indexOf(o.target as HTMLElement)
        if (i >= 0) {
          revealed.value[i] = true
          io?.unobserve(o.target)
        }
      }
    },
    { root: sc, threshold: 0.15 },
  )
  for (const el of itemEls) if (el) io.observe(el)

  sc.addEventListener('scroll', onScroll, { passive: true })
  ro = new ResizeObserver(onScroll)
  ro.observe(sc)
  update()
})

onBeforeUnmount(() => {
  scrollEl.value?.removeEventListener('scroll', onScroll)
  io?.disconnect()
  ro?.disconnect()
  if (raf) cancelAnimationFrame(raf)
})
</script>

<style scoped>
.tl { height: 100%; display: flex; flex-direction: column; background: var(--color-ink-soft); }

/* Toolbar */
.tl__toolbar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  height: 40px;
  padding: 0 0.9rem;
  border-bottom: 1px solid var(--hairline);
  background: var(--veil-1);
}
.tl__crumb { display: flex; align-items: center; gap: 0.4rem; font-size: 0.76rem; }
.tl__crumb-seg { color: var(--color-muted); }
.tl__crumb-seg.is-current { color: var(--color-fog); font-weight: 600; }
.tl__crumb-sep { color: var(--color-muted); opacity: 0.6; }
.tl__hint {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--color-muted);
  animation: tl-bob 2.2s ease-in-out infinite;
}
@keyframes tl-bob {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(3px); opacity: 1; }
}

/* Scroll area */
.tl__scroll { flex: 1; min-height: 0; overflow-y: auto; }

.tl__intro { padding: 1.6rem 1.4rem 0.4rem; }
.tl__intro-title { font-size: 1.25rem; font-weight: 700; }
.tl__intro-sub { margin-top: 0.35rem; font-size: 0.85rem; line-height: 1.5; color: var(--color-muted); max-width: 52ch; }

/* Track + spine */
.tl__track { position: relative; padding: 1.4rem 1.4rem 0.6rem 0; }
.tl__spine {
  position: absolute;
  top: 1.4rem;
  bottom: 0.6rem;
  left: 71px;
  width: 2px;
  border-radius: 999px;
  background: var(--hairline);
}
.tl__spine-fill {
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--color-neon), var(--color-purple), var(--color-blue));
  box-shadow: 0 0 10px color-mix(in srgb, var(--color-neon) 35%, transparent);
  transition: height 0.25s ease-out;
}

/* Item */
.tl__item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 0 0 2rem 36px;
}
.tl__item:last-of-type { padding-bottom: 1.4rem; }

/* Year marker (left of spine) */
.tl__year {
  position: absolute;
  left: 0;
  top: 7px;
  width: 58px;
  text-align: right;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-muted);
  opacity: 0;
  transform: translateX(-10px);
  transition: opacity 0.5s ease, transform 0.5s ease, color 0.3s ease;
}
.tl__item.is-in .tl__year { opacity: 1; transform: translateX(0); }

/* Dot on the spine */
.tl__dot {
  position: absolute;
  left: 58px;
  top: 2px;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  font-size: 0.72rem;
  color: var(--color-muted);
  background: var(--color-ink-soft);
  border: 1px solid var(--hairline-3);
  transform: scale(0.5);
  opacity: 0;
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease,
    color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  z-index: 1;
}
.tl__item.is-in .tl__dot { transform: scale(1); opacity: 1; }

/* Card */
.tl__card {
  flex: 1;
  min-width: 0;
  margin-left: 24px;
  padding: 0.95rem 1.05rem;
  border-radius: 0.8rem;
  background: var(--veil-1);
  border: 1px solid var(--hairline);
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s, border-color 0.3s ease;
}
.tl__item.is-in .tl__card { opacity: 1; transform: translateY(0); }

.tl__period {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  color: var(--color-muted);
  background: var(--veil-2);
  border: 1px solid var(--hairline);
  transition: color 0.3s ease, border-color 0.3s ease, background 0.3s ease;
}
.tl__title { margin-top: 0.5rem; font-size: 0.98rem; font-weight: 700; }
.tl__role { margin-top: 0.15rem; font-size: 0.78rem; font-weight: 600; color: var(--color-fog); }
.tl__desc { margin-top: 0.45rem; font-size: 0.8rem; line-height: 1.55; color: var(--color-muted); }

.tl__points { margin-top: 0.5rem; display: grid; gap: 0.3rem; }
.tl__points li {
  position: relative;
  padding-left: 0.9rem;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--color-muted);
}
.tl__points li::before { content: '›'; position: absolute; left: 0; color: var(--color-fog); }

.tl__tags { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.6rem; }
.tl__tags li {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  padding: 0.16rem 0.42rem;
  border-radius: 999px;
  color: var(--color-fog);
  background: var(--veil-2);
  border: 1px solid var(--hairline);
}

/* Tone accents — applied once the playhead reaches the dot */
.tl__item.is-neon { --tone: var(--color-neon); }
.tl__item.is-purple { --tone: var(--color-purple); }
.tl__item.is-blue { --tone: var(--color-blue); }

.tl__item.is-active .tl__year { color: var(--tone); }
.tl__item.is-active .tl__dot {
  color: var(--tone);
  border-color: color-mix(in srgb, var(--tone) 55%, transparent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--tone) 35%, transparent);
}
.tl__item.is-active .tl__card { border-color: color-mix(in srgb, var(--tone) 30%, var(--hairline)); }
.tl__item.is-active .tl__period {
  color: var(--tone);
  background: color-mix(in srgb, var(--tone) 12%, transparent);
  border-color: color-mix(in srgb, var(--tone) 28%, transparent);
}

.tl__dot.is-pulse::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  border: 1px solid color-mix(in srgb, var(--tone, var(--color-neon)) 60%, transparent);
  opacity: 0;
}
.tl__item.is-active .tl__dot.is-pulse::after { animation: tl-pulse 2s ease-out infinite; }
@keyframes tl-pulse {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.9); opacity: 0; }
}

/* End cap */
.tl__cap {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0 0 1.6rem 58px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.tl__cap.is-active { opacity: 1; transform: translateY(0); }
.tl__cap-dot {
  flex: none;
  width: 10px;
  height: 10px;
  margin-left: 9px;
  border-radius: 999px;
  background: var(--color-blue);
  box-shadow: 0 0 10px color-mix(in srgb, var(--color-blue) 55%, transparent);
}
.tl__cap-text { font-family: var(--font-mono); font-size: 0.68rem; color: var(--color-muted); }

/* Status bar */
.tl__statusbar {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.45rem 1.1rem;
  border-top: 1px solid var(--hairline);
  background: var(--veil-1);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--color-muted);
}

@media (prefers-reduced-motion: reduce) {
  .tl__hint { animation: none; }
  .tl__year,
  .tl__dot,
  .tl__card,
  .tl__cap { opacity: 1; transform: none; transition: none; }
  .tl__spine-fill { transition: none; }
  .tl__item.is-active .tl__dot.is-pulse::after { animation: none; }
}

@media (max-width: 560px) {
  .tl__year { display: none; }
  .tl__spine { left: 25px; }
  .tl__dot { left: 12px; }
  .tl__item { padding-left: 10px; }
  .tl__cap { padding-left: 12px; }
  .tl__card { margin-left: 32px; }
}
</style>
