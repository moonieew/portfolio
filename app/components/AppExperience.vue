<template lang="pug">
.fx
  //- Finder toolbar
  .fx__toolbar
    .fx__nav
      button.fx__navbtn(type="button" disabled) ‹
      button.fx__navbtn(type="button" disabled) ›
    .fx__crumb
      span.fx__crumb-seg Work
      span.fx__crumb-sep ›
      span.fx__crumb-seg.is-current {{ active.name }}
    .fx__view
      span.fx__view-dot(v-for="n in 3" :key="n")

  .fx__main
    //- Sidebar: companies as directories
    aside.fx__side
      p.fx__side-label Companies
      button.fx__dir(
        v-for="c in companies"
        :key="c.id"
        type="button"
        :class="{ 'is-active': c.id === activeId }"
        @click="activeId = c.id"
      )
        span.fx__dir-icon ▤
        span.fx__dir-name {{ c.name }}
      p.fx__side-label Smart
      .fx__dir.is-static
        span.fx__dir-icon ✦
        span.fx__dir-name All Projects

    //- Content: role + project "files"
    section.fx__content
      header.fx__head
        .fx__head-row
          h3.fx__company {{ active.name }}
          span.fx__role {{ active.role }}
        p.fx__focus {{ active.focus }}
      .fx__files
        article.fx__file(v-for="p in active.projects" :key="p.name")
          .fx__file-ico(:class="`is-${p.tone}`")
            span {{ p.glyph }}
          .fx__file-name {{ p.name }}
          ul.fx__file-tech
            li(v-for="t in p.tech" :key="t") {{ t }}
          p.fx__file-impact {{ p.impact }}
      footer.fx__statusbar
        span {{ active.projects.length }} items
        span.fx__statusbar-role {{ active.name }} — {{ active.role }}
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Project {
  name: string
  glyph: string
  tone: 'neon' | 'purple' | 'blue'
  tech: string[]
  impact: string
}
interface Company {
  id: string
  name: string
  role: string
  focus: string
  projects: Project[]
}

const companies: Company[] = [
  {
    id: 'beowulf',
    name: 'Beowulf Blockchain',
    role: 'Frontend Developer · May 2023 — present',
    focus: 'Real-time DePIN, Web3 and SaaS products built for global scale.',
    projects: [
      {
        name: 'Datagram',
        glyph: '◢',
        tone: 'neon',
        tech: ['Nuxt', 'WebSocket', 'Viem/Wagmi', 'TypeScript'],
        impact: 'Real-time node-monitoring dashboard for a DePIN network serving 1M+ users — thousands of concurrent streams, zero frame drops via virtual scrolling + WS batching. Wallet flow drove a $1M+ Node Sale.',
      },
      {
        name: 'Quickom.net',
        glyph: '✆',
        tone: 'blue',
        tech: ['Nuxt', 'GraphQL', 'Stripe', 'TypeScript'],
        impact: 'Ticketing SaaS — event admin dashboard, ticketing system and Stripe payment flows, built closely with the design team.',
      },
      {
        name: 'Chat3.one',
        glyph: '✶',
        tone: 'purple',
        tech: ['Vue 3', 'WebSocket', 'GraphQL', 'MetaDefender'],
        impact: 'SocialFi platform — multi-chain wallet + Web3 logic, real-time chat/like/gift over WebSocket, and MetaDefender (Opswat) threat scanning with smart caching.',
      },
      {
        name: 'Saros',
        glyph: '◈',
        tone: 'neon',
        tech: ['Next.js', 'Zustand', 'Tailwind', 'Solana'],
        impact: 'DeFi super-app on Solana (outsource for Coin98) — AMM DEX, farming, staking & launchpad. Next.js Server Components + Zustand for smooth, deterministic trading.',
      },
      {
        name: 'Internal LMS',
        glyph: '❖',
        tone: 'blue',
        tech: ['Frappe', 'Vue 3', 'Docker', 'WSL'],
        impact: 'Provisioned a Frappe LMS via Docker/WSL and engineered custom UI + features around internal business workflows.',
      },
    ],
  },
  {
    id: 'kyanon',
    name: 'Kyanon Digital',
    role: 'Intern / Fresher Frontend Developer · Aug 2022 — Mar 2023',
    focus: 'First professional role — production e-commerce UI in an Agile team.',
    projects: [
      {
        name: 'Bipbip',
        glyph: '⌖',
        tone: 'purple',
        tech: ['React', 'TypeScript', 'Chakra UI', 'REST'],
        impact: 'E-commerce platform for Tops Market — responsive product listing, cart and profile UI; REST integration and QA-hardened stability shipped in a Git Flow / Agile environment.',
      },
    ],
  },
]

const activeId = ref(companies[0]!.id)
const active = computed(() => companies.find((c) => c.id === activeId.value) ?? companies[0]!)
</script>

<style scoped>
.fx { height: 100%; display: flex; flex-direction: column; background: var(--color-ink-soft); }

/* Toolbar */
.fx__toolbar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  height: 40px;
  padding: 0 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
}
.fx__nav { display: flex; gap: 0.3rem; }
.fx__navbtn {
  width: 22px;
  height: 22px;
  border-radius: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--color-muted);
  font-size: 0.8rem;
  cursor: default;
}
.fx__crumb { display: flex; align-items: center; gap: 0.4rem; font-size: 0.76rem; }
.fx__crumb-seg { color: var(--color-muted); }
.fx__crumb-seg.is-current { color: var(--color-fog); font-weight: 600; }
.fx__crumb-sep { color: var(--color-muted); opacity: 0.6; }
.fx__view { margin-left: auto; display: flex; gap: 4px; }
.fx__view-dot { width: 5px; height: 5px; border-radius: 999px; background: rgba(255, 255, 255, 0.18); }

/* Main split */
.fx__main { flex: 1; min-height: 0; display: flex; }

/* Sidebar */
.fx__side {
  flex: none;
  width: 184px;
  padding: 0.7rem 0.6rem;
  overflow-y: auto;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.015);
}
.fx__side-label {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin: 0.4rem 0.4rem 0.35rem;
}
.fx__dir {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  border-radius: 0.5rem;
  border: none;
  background: none;
  color: var(--color-fog);
  font-size: 0.8rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}
.fx__dir:hover { background: rgba(255, 255, 255, 0.04); }
.fx__dir.is-active { background: color-mix(in srgb, var(--color-neon) 16%, transparent); }
.fx__dir.is-static { color: var(--color-muted); cursor: default; }
.fx__dir-icon { color: var(--color-neon); font-size: 0.85rem; }
.fx__dir.is-static .fx__dir-icon { color: var(--color-purple); }
.fx__dir-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Content */
.fx__content { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.fx__head { flex: none; padding: 1rem 1.1rem 0.8rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.fx__head-row { display: flex; align-items: baseline; gap: 0.7rem; flex-wrap: wrap; }
.fx__company { font-size: 1.1rem; font-weight: 700; }
.fx__role {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  color: var(--color-neon);
  background: color-mix(in srgb, var(--color-neon) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-neon) 28%, transparent);
}
.fx__focus { margin-top: 0.5rem; font-size: 0.85rem; line-height: 1.5; color: var(--color-muted); max-width: 60ch; }

.fx__files {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1rem 1.1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 0.8rem;
  align-content: start;
}
.fx__file {
  padding: 0.85rem;
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition: transform 0.18s ease, border-color 0.2s ease;
}
.fx__file:hover { transform: translateY(-3px); border-color: rgba(255, 255, 255, 0.16); }
.fx__file-ico {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 0.55rem;
  font-size: 1.15rem;
  margin-bottom: 0.6rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.fx__file-ico.is-neon { color: var(--color-neon); }
.fx__file-ico.is-purple { color: var(--color-purple); }
.fx__file-ico.is-blue { color: #3b82f6; }
.fx__file-name { font-weight: 700; font-size: 0.92rem; }
.fx__file-tech { display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0.5rem 0; }
.fx__file-tech li {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  padding: 0.16rem 0.42rem;
  border-radius: 999px;
  color: var(--color-fog);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.fx__file-impact { font-size: 0.78rem; line-height: 1.5; color: var(--color-muted); }

.fx__statusbar {
  flex: none;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.45rem 1.1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--color-muted);
}
.fx__statusbar-role { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
