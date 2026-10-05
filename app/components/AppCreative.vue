<template lang="pug">
SketchToScreen(
  index="03"
  accent="blue"
  title="Atelier — Araya & A SCENT"
  description="The hidden gem: brand identities drawn to the anchor point in Illustrator. The same obsession with spacing and typography that makes web UI land pixel-perfect."
  :techStack="['Illustrator', 'Figma', 'Vector', 'Type', 'Packaging', 'Grid']"
  :scrub="700"
)
  //- Sketch: raw vector paths + anchor points
  template(#sketch)
    .vec.bp-grid
      .vec__label PATHS · anchor points
      .vec__grid
        .vec__cell(v-for="b in brands" :key="b.key")
          svg.vec__svg(viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet")
            path.animate-dash(:d="b.path" fill="none" style="stroke: var(--sketch-strong)" stroke-width="1.4" stroke-dasharray="4 4")
            g(fill="none" style="stroke: var(--sketch-strong)" stroke-width="1.2")
              rect(v-for="(p, n) in b.anchors" :key="n" :x="p[0] - 3" :y="p[1] - 3" width="6" height="6")
            line(:x1="b.handle[0]" :y1="b.handle[1]" :x2="b.handle[2]" :y2="b.handle[3]" style="stroke: var(--sketch-dim)" stroke-width="1")

  //- Final: rendered packaging / logo layout
  template(#final)
    .pack
      .pack__label IDENTITY · rendered
      .pack__grid
        .pack__cell(v-for="b in brands" :key="b.key" :class="`pack__cell--${b.key}`")
          span.pack__mark {{ b.mark }}
          span.pack__name {{ b.name }}
          span.pack__sub {{ b.sub }}
      p.pack__note A keen eye for spatial design is the foundation for flawless web interfaces.
</template>

<script setup lang="ts">
const brands = [
  {
    key: 'araya',
    name: 'Araya',
    sub: 'Logotype · grid-built',
    mark: 'A',
    path: 'M40 160 L100 40 L160 160 M64 112 L136 112',
    anchors: [
      [40, 160],
      [100, 40],
      [160, 160],
      [64, 112],
      [136, 112],
    ],
    handle: [100, 40, 100, 80],
  },
  {
    key: 'scent',
    name: 'A SCENT',
    sub: 'Sea Mist · packaging',
    mark: '≈',
    path: 'M40 120 C70 90 90 150 120 120 S170 90 160 120 M40 150 C70 120 90 180 120 150',
    anchors: [
      [40, 120],
      [120, 120],
      [160, 120],
      [40, 150],
      [120, 150],
    ],
    handle: [120, 120, 145, 100],
  },
] as const
</script>

<style scoped>
/* Vectors */
.vec { position: absolute; inset: 0; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.6rem; }
.vec__label,
.pack__label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.16em; color: var(--sketch); }
.vec__grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; min-height: 0; }
.vec__cell { border: 1px dashed var(--hairline-2); border-radius: 0.6rem; display: flex; align-items: center; justify-content: center; }
.vec__svg { width: 100%; height: 100%; padding: 14%; }

/* Rendered packaging */
.pack {
  position: absolute;
  inset: 0;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, var(--color-blue) 18%, transparent), transparent 60%), var(--color-ink-soft);
}
.pack__label { color: var(--color-blue); }
.pack__grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; min-height: 0; }
.pack__cell {
  border-radius: 0.7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  border: 1px solid var(--hairline);
}
.pack__cell--araya { background: linear-gradient(160deg, #14241a, #0c140f); color: #eafff2; }
.pack__cell--araya .pack__mark { color: var(--color-neon); text-shadow: 0 0 22px color-mix(in srgb, var(--color-neon) 55%, transparent); }
.pack__cell--scent { background: linear-gradient(160deg, #181233, #0c0a18); color: #f1ecff; }
.pack__cell--scent .pack__mark { color: #c9bdf0; text-shadow: 0 0 22px color-mix(in srgb, var(--color-purple) 55%, transparent); }
.pack__mark { font-size: clamp(1.8rem, 6vw, 2.8rem); font-weight: 800; line-height: 1; }
.pack__name { font-size: 0.95rem; font-weight: 700; letter-spacing: 0.04em; }
.pack__sub { font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.75; }
.pack__note { font-size: 0.72rem; line-height: 1.5; color: var(--color-muted); text-align: center; max-width: 46ch; margin: 0 auto; }
</style>
