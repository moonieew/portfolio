<template lang="pug">
SketchToScreen(
  index="02"
  accent="purple"
  title="Saros & Chat3.one"
  description="Web3 messaging and DeFi surface — multi-chain wallet orchestration with a Zustand-driven state core and a sleek, gradient-forward interface."
  :techStack="['React', 'Zustand', 'Web3', 'Multi-chain', 'wagmi', 'viem']"
)
  //- Sketch: low-fidelity user flow
  template(#sketch)
    .flow.bp-grid
      .flow__label USER FLOW · low-fi
      .flow__row
        .flow__box
          .flow__box-bar
          .flow__box-line
          .flow__box-line.is-short
        .flow__arrow →
        .flow__box
          .flow__box-bar
          .flow__box-grid
            span(v-for="n in 4" :key="n")
        .flow__arrow →
        .flow__box
          .flow__box-bar
          .flow__box-pill
          .flow__box-pill.is-wide
      .flow__caption connect · select chain · sign

  //- Final: sleek Web3 interface
  template(#final)
    .w3
      .w3__head
        span.w3__title Saros Wallet
        span.w3__chain
          span.w3__chain-dot
          | Multi-chain
      .w3__balance
        span.w3__balance-k Aggregated balance
        span.w3__balance-v $48,920.74
        span.w3__balance-sub +3.2% · 4 chains synced
      .w3__chains
        span.w3__chip(v-for="c in chains" :key="c") {{ c }}
      .w3__actions
        button.w3__btn.is-primary(type="button") Send
        button.w3__btn(type="button") Swap
        button.w3__btn(type="button") Bridge
</template>

<script setup lang="ts">
const chains = ['Ethereum', 'Solana', 'Base', 'Arbitrum']
</script>

<style scoped>
/* User flow */
.flow { position: absolute; inset: 0; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.75rem; }
.flow__label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.16em; color: var(--sketch); }
.flow__row { flex: 1; display: flex; align-items: center; gap: 0.5rem; }
.flow__box { flex: 1; align-self: stretch; max-height: 78%; margin: auto 0; border: 1.4px dashed var(--sketch); border-radius: 8px; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem; }
.flow__box-bar { height: 8px; width: 60%; border-radius: 3px; background: var(--sketch-dim); }
.flow__box-line { height: 6px; border-radius: 3px; background: var(--veil-3); }
.flow__box-line.is-short { width: 50%; }
.flow__box-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
.flow__box-grid span { height: 16px; border-radius: 4px; border: 1px solid var(--hairline-3); }
.flow__box-pill { height: 11px; border-radius: 999px; background: var(--veil-3); width: 70%; }
.flow__box-pill.is-wide { width: 100%; }
.flow__arrow { color: var(--sketch); font-size: 1.1rem; }
.flow__caption { font-family: var(--font-mono); font-size: 0.6rem; color: var(--color-muted); text-align: center; }

/* Web3 UI */
.w3 {
  position: absolute;
  inset: 0;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  background:
    radial-gradient(120% 100% at 0% 0%, color-mix(in srgb, var(--color-purple) 35%, transparent), transparent 55%),
    radial-gradient(120% 100% at 100% 100%, color-mix(in srgb, var(--color-blue) 30%, transparent), transparent 55%),
    var(--color-ink-soft);
}
.w3__head { display: flex; align-items: center; justify-content: space-between; }
.w3__title { font-weight: 700; font-size: 0.88rem; }
.w3__chain {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  color: color-mix(in srgb, var(--color-purple) 30%, var(--color-fog));
  background: color-mix(in srgb, var(--color-purple) 22%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-purple) 45%, transparent);
}
.w3__chain-dot { width: 7px; height: 7px; border-radius: 999px; background: var(--color-purple); box-shadow: 0 0 10px var(--color-purple); }
.w3__balance { display: flex; flex-direction: column; gap: 0.12rem; padding: 0.75rem 0.85rem; border-radius: 0.75rem; background: var(--veil-2); border: 1px solid var(--hairline-2); backdrop-filter: blur(6px); }
.w3__balance-k { font-size: 0.56rem; letter-spacing: 0.1em; text-transform: uppercase; color: color-mix(in srgb, var(--color-purple) 35%, var(--color-fog)); }
.w3__balance-v {
  font-size: clamp(1.2rem, 4vw, 1.8rem);
  font-weight: 800;
  letter-spacing: -0.01em;
  background: linear-gradient(100deg, var(--title-a), color-mix(in srgb, var(--color-purple) 35%, var(--title-a)));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.w3__balance-sub { font-family: var(--font-mono); font-size: 0.6rem; color: var(--color-neon); }
.w3__chains { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.w3__chip { font-family: var(--font-mono); font-size: 0.6rem; padding: 0.2rem 0.5rem; border-radius: 999px; color: color-mix(in srgb, var(--color-purple) 18%, var(--color-fog)); background: var(--veil-2); border: 1px solid var(--hairline-2); }
.w3__actions { margin-top: auto; display: flex; gap: 0.45rem; }
.w3__btn {
  flex: 1;
  padding: 0.5rem 0;
  border-radius: 0.6rem;
  font-size: 0.76rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--color-purple) 18%, var(--color-fog));
  background: var(--veil-2);
  border: 1px solid var(--hairline-2);
  cursor: pointer;
  transition: transform 0.15s ease;
}
.w3__btn:hover { transform: translateY(-1px); }
.w3__btn.is-primary {
  color: #150a2e;
  background: linear-gradient(100deg, var(--color-purple), var(--purple-2));
  border-color: transparent;
  box-shadow: 0 8px 24px -10px var(--color-purple);
}
</style>
