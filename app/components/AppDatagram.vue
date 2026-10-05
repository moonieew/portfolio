<template lang="pug">
SketchToScreen(
  index="01"
  accent="neon"
  title="Datagram Network (DePIN)"
  description="Real-time engine for a decentralized infrastructure network — architected for 1M+ concurrent users with zero frame drops under sustained load."
  :techStack="['Vue 3', 'WebSocket', 'Web Workers', 'DePIN', 'Canvas', 'RxJS']"
)
  //- Sketch: system architecture blueprint
  template(#sketch)
    .blueprint.bp-grid
      .blueprint__label SYSTEM ARCHITECTURE · v0
      svg.blueprint__svg(viewBox="0 0 480 230" preserveAspectRatio="xMidYMid meet")
        g(style="stroke: var(--sketch)" fill="none" stroke-width="1.4")
          path.animate-dash(d="M90 56 L240 56" stroke-dasharray="5 5")
          path.animate-dash(d="M240 56 L240 112" stroke-dasharray="5 5")
          path.animate-dash(d="M240 112 L120 172" stroke-dasharray="5 5")
          path.animate-dash(d="M240 112 L360 172" stroke-dasharray="5 5")
          path.animate-dash(d="M370 56 L240 56" stroke-dasharray="5 5")
          rect(x="40" y="40" width="100" height="32" rx="6")
          rect(x="190" y="40" width="100" height="32" rx="6")
          rect(x="320" y="40" width="100" height="32" rx="6")
          rect(x="190" y="98" width="100" height="32" rx="6")
          rect(x="70" y="158" width="100" height="32" rx="6")
          rect(x="310" y="158" width="100" height="32" rx="6")
        g(style="fill: var(--sketch-strong)" font-family="monospace" font-size="11")
          text(x="90" y="60" text-anchor="middle") Clients
          text(x="240" y="60" text-anchor="middle") Gateway
          text(x="370" y="60" text-anchor="middle") Auth
          text(x="240" y="118" text-anchor="middle") Batch Engine
          text(x="120" y="178" text-anchor="middle") WS Pool
          text(x="360" y="178" text-anchor="middle") Metrics
      .blueprint__note ws.batch(window=16ms) → frame-safe render

  //- Final: high-performance neon dashboard
  template(#final)
    .dash
      .dash__topbar
        span.dash__brand
          span.dash__brand-dot
          | Datagram · Live
        span.dash__pill 1,042,318 nodes online
      .dash__stats
        .dash__stat(v-for="s in stats" :key="s.k")
          span.dash__stat-k {{ s.k }}
          span.dash__stat-v {{ s.v }}
          span.dash__stat-d(:class="s.up ? 'is-up' : 'is-down'") {{ s.d }}
      .dash__chart
        .dash__bars
          span.dash__bar(v-for="(h, i) in bars" :key="i" :style="{ height: `${h}%` }")
        span.dash__chart-tag 0 dropped frames · 60fps
      .dash__ticker
        span.dash__tick(v-for="t in ticks" :key="t") {{ t }}
</template>

<script setup lang="ts">
const stats = [
  { k: 'Throughput', v: '2.4M', d: '+12%', up: true },
  { k: 'p99 latency', v: '38ms', d: '-6ms', up: true },
  { k: 'Frame drops', v: '0', d: 'stable', up: true },
]
// Deterministic heights — SSR/hydration-safe (no Math.random).
const bars = [34, 52, 41, 63, 48, 71, 58, 80, 66, 88, 74, 92, 60, 78, 84]
const ticks = [
  'batch#48201 flushed · 16ms',
  'pool +1,204 sockets',
  'gateway healthy',
  'metrics ✓',
]
</script>

<style scoped>
/* Blueprint */
.blueprint { position: absolute; inset: 0; padding: 0.85rem; display: flex; flex-direction: column; }
.blueprint__label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.16em; color: var(--sketch); }
.blueprint__svg { flex: 1; width: 100%; min-height: 0; }
.blueprint__note { font-family: var(--font-mono); font-size: 0.6rem; color: var(--color-muted); text-align: right; }

/* Dashboard */
.dash {
  position: absolute;
  inset: 0;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  background: radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--color-neon) 14%, transparent), transparent 60%), var(--color-ink-soft);
}
.dash__topbar { display: flex; align-items: center; justify-content: space-between; }
.dash__brand { display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 700; font-size: 0.8rem; }
.dash__brand-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--color-neon); box-shadow: 0 0 10px var(--color-neon); }
.dash__pill {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  color: var(--color-neon);
  background: color-mix(in srgb, var(--color-neon) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-neon) 30%, transparent);
}
.dash__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.45rem; }
.dash__stat { display: flex; flex-direction: column; gap: 0.08rem; padding: 0.45rem 0.55rem; border-radius: 0.5rem; background: var(--veil-1); border: 1px solid var(--hairline); }
.dash__stat-k { font-size: 0.56rem; letter-spacing: 0.08em; color: var(--color-muted); text-transform: uppercase; }
.dash__stat-v { font-size: 1rem; font-weight: 700; font-family: var(--font-mono); }
.dash__stat-d { font-size: 0.58rem; font-family: var(--font-mono); }
.dash__stat-d.is-up { color: var(--color-neon); }
.dash__stat-d.is-down { color: var(--color-red); }
.dash__chart { position: relative; flex: 1; min-height: 0; border-radius: 0.5rem; background: var(--veil-1); border: 1px solid var(--hairline); padding: 0.5rem; overflow: hidden; }
.dash__bars { display: flex; align-items: flex-end; gap: 4px; height: 100%; }
.dash__bar { flex: 1; border-radius: 3px 3px 0 0; background: linear-gradient(to top, color-mix(in srgb, var(--color-neon) 30%, transparent), var(--color-neon)); opacity: 0.85; }
.dash__chart-tag { position: absolute; top: 0.4rem; right: 0.5rem; font-family: var(--font-mono); font-size: 0.56rem; color: var(--color-neon); }
.dash__ticker { display: flex; gap: 0.85rem; overflow: hidden; }
.dash__tick { font-family: var(--font-mono); font-size: 0.56rem; color: var(--color-muted); white-space: nowrap; }
</style>
