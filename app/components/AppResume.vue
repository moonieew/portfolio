<template lang="pug">
.cv
  //- Document toolbar
  .cv__toolbar
    .cv__crumb
      span.cv__crumb-seg Documents
      span.cv__crumb-sep ›
      span.cv__crumb-seg.is-current Résumé.pdf
    .cv__actions
      a.cv__btn(:href="profile.github" target="_blank" rel="noopener noreferrer") GitHub
      a.cv__btn(:href="profile.linkedin" target="_blank" rel="noopener noreferrer") LinkedIn
      a.cv__btn.is-primary(:href="profile.resumePdf" download)
        span ↓
        span Download PDF

  //- Paper
  .cv__scroll
    article.cv__paper
      header.cv__head
        .cv__head-main
          h1.cv__name {{ profile.name }}
          p.cv__role {{ profile.title }} · System Architect
        ul.cv__contact
          li
            a(:href="`mailto:${profile.email}`") {{ profile.email }}
          li {{ profile.phone }}
          li {{ profile.location }}
          li
            a(:href="profile.github" target="_blank" rel="noopener noreferrer") github.com/moonieew
          li
            a(:href="profile.linkedin" target="_blank" rel="noopener noreferrer") linkedin.com/in/mooniee

      section.cv__section
        h2.cv__h2 Summary
        p.cv__lead
          | Frontend developer focused on intuitive, high-quality web products. I
          | turn complex flows into stable, user-centric interfaces — real-time
          | data layers, multi-chain Web3 surfaces and pixel-accurate, Figma-faithful UI.

      section.cv__section
        h2.cv__h2 Highlights
        ul.cv__stats
          li
            strong 3+
            span Years experience
          li
            strong 1M+
            span Users served (Datagram)
          li
            strong $1M+
            span Node Sale revenue driven

      section.cv__section
        h2.cv__h2 Experience
        .cv__job(v-for="job in experience" :key="job.company")
          .cv__job-head
            h3.cv__job-co {{ job.company }}
            span.cv__job-role {{ job.role }}
            span.cv__job-when {{ job.when }}
          ul.cv__job-points
            li(v-for="p in job.points" :key="p") {{ p }}

      section.cv__section
        h2.cv__h2 Skills
        .cv__skills
          .cv__skill-group(v-for="g in skills" :key="g.label")
            p.cv__skill-label {{ g.label }}
            ul.cv__skill-tags
              li(v-for="t in g.items" :key="t") {{ t }}

      .cv__two
        section.cv__section
          h2.cv__h2 Education
          p.cv__edu-school HCMC University of Technology and Education
          p.cv__edu-meta Software Engineering · GPA 7.9/10 · 2019 — 2023
        section.cv__section
          h2.cv__h2 Languages
          p.cv__edu-meta English — Professional Working Proficiency (TOEIC 565)

      section.cv__section
        h2.cv__h2 Activities &amp; Awards
        ul.cv__job-points
          li(v-for="a in awards" :key="a") {{ a }}

      footer.cv__foot
        span Full formatted PDF available via Download.
        a.cv__foot-link(:href="profile.resumePdf" download) Download résumé →
</template>

<script setup lang="ts">
import { profile } from '~/composables/useProfile'

const experience = [
  {
    company: 'Beowulf Blockchain',
    role: 'Frontend Developer',
    when: 'May 2023 — present',
    points: [
      'Datagram (DePIN): architected a real-time node-monitoring dashboard serving 1M+ users — thousands of concurrent node streams with zero dropped frames via virtual scrolling and WebSocket batching.',
      'Datagram: delivered a multi-chain wallet (Viem/Wagmi) letting users execute smart contracts in 3 steps — directly enabling a Node Sale that generated $1M+ in revenue.',
      'Quickom.net (Ticketing SaaS): built event admin dashboards, the ticketing system and Stripe payment flows, partnering closely with design on UX.',
      'Chat3.one (SocialFi): multi-chain wallet + core Web3 logic, real-time chat & interactions over WebSocket, and MetaDefender (Opswat) threat scanning with smart caching.',
      'Saros (outsource for Coin98): DeFi super-app on Solana — Next.js Server Components for performance, Zustand for complex trading/agent state.',
    ],
  },
  {
    company: 'Kyanon Digital',
    role: 'Intern / Fresher Frontend Developer',
    when: 'Aug 2022 — Mar 2023',
    points: [
      'Bipbip (e-commerce for Tops Market): built responsive product listing, cart and profile UI in React, TypeScript and Chakra UI.',
      'Integrated RESTful APIs with the backend team and resolved UI/UX bugs with QA before deployment, working in a professional Git Flow / Agile environment.',
    ],
  },
]

const skills = [
  { label: 'Frontend', items: ['Vue', 'Nuxt', 'React', 'Next.js', 'TypeScript'] },
  { label: 'Styling', items: ['Tailwind', 'Shadcn/ui', 'Chakra UI', 'Stylus'] },
  { label: 'Data & Realtime', items: ['REST', 'GraphQL', 'WebSocket'] },
  { label: 'Web3', items: ['Viem', 'Wagmi', 'MetaDefender'] },
  { label: 'Tooling', items: ['Vite', 'Git Flow', 'Docker / WSL', 'Figma-to-Code'] },
]

const awards = [
  'Consolation prize — Open Hackathon, HCMUTE (2023)',
  'Five-merit student (university level)',
  'IT Faculty Executive Board — organised academic competitions & volunteer campaigns (2019–2022)',
]
</script>

<style scoped>
.cv { height: 100%; display: flex; flex-direction: column; background: var(--color-ink-soft); }

/* Toolbar */
.cv__toolbar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 46px;
  padding: 0 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
}
.cv__crumb { display: flex; align-items: center; gap: 0.4rem; font-size: 0.76rem; }
.cv__crumb-seg { color: var(--color-muted); }
.cv__crumb-seg.is-current { color: var(--color-fog); font-weight: 600; }
.cv__crumb-sep { color: var(--color-muted); opacity: 0.6; }
.cv__actions { margin-left: auto; display: flex; gap: 0.4rem; }
.cv__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.34rem 0.7rem;
  border-radius: 0.5rem;
  font-size: 0.74rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--color-fog);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.18s ease, transform 0.15s ease;
}
.cv__btn:hover { transform: translateY(-1px); border-color: rgba(255, 255, 255, 0.22); }
.cv__btn.is-primary {
  color: #0a1f12;
  background: linear-gradient(100deg, var(--color-neon), #59ffa0);
  border-color: transparent;
}

/* Paper */
.cv__scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 1.4rem; }
.cv__paper {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 2.2rem 1.6rem;
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.cv__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; padding-bottom: 1.1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.cv__name {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(120deg, #fff 10%, #cfcfd6 55%, #8b8b95 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.cv__role { margin-top: 0.3rem; font-size: 0.9rem; color: var(--color-neon); font-weight: 600; }
.cv__contact { display: flex; flex-direction: column; gap: 0.25rem; font-family: var(--font-mono); font-size: 0.68rem; text-align: right; color: var(--color-muted); }
.cv__contact a { color: var(--color-muted); text-decoration: none; }
.cv__contact a:hover { color: var(--color-neon); }

.cv__section { margin-top: 1.5rem; }
.cv__h2 {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-purple);
  margin-bottom: 0.7rem;
}
.cv__lead { font-size: 0.9rem; line-height: 1.65; color: #c4c4cc; max-width: 60ch; }

.cv__stats { display: flex; flex-wrap: wrap; gap: 1.6rem; }
.cv__stats li { display: flex; flex-direction: column; }
.cv__stats strong { font-size: 1.4rem; font-weight: 800; color: var(--color-fog); }
.cv__stats span { font-size: 0.66rem; color: var(--color-muted); font-family: var(--font-mono); }

.cv__job { padding: 0.9rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.cv__job:last-child { border-bottom: none; }
.cv__job-head { display: flex; align-items: baseline; gap: 0.6rem; flex-wrap: wrap; }
.cv__job-co { font-size: 1rem; font-weight: 700; }
.cv__job-role {
  font-family: var(--font-mono);
  font-size: 0.64rem;
  padding: 0.16rem 0.5rem;
  border-radius: 999px;
  color: var(--color-neon);
  background: color-mix(in srgb, var(--color-neon) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-neon) 28%, transparent);
}
.cv__job-when { margin-left: auto; font-family: var(--font-mono); font-size: 0.66rem; color: var(--color-muted); }
.cv__job-points { margin-top: 0.6rem; display: flex; flex-direction: column; gap: 0.4rem; }
.cv__job-points li { position: relative; padding-left: 1rem; font-size: 0.84rem; line-height: 1.55; color: #c4c4cc; }
.cv__job-points li::before { content: '▸'; position: absolute; left: 0; color: var(--color-neon); }

.cv__skills { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.9rem; }
.cv__skill-label { font-size: 0.78rem; font-weight: 600; color: var(--color-fog); margin-bottom: 0.45rem; }
.cv__skill-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.cv__skill-tags li {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  padding: 0.18rem 0.46rem;
  border-radius: 999px;
  color: var(--color-fog);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cv__two { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem 1.6rem; }
.cv__edu-school { font-size: 0.88rem; font-weight: 700; color: var(--color-fog); }
.cv__edu-meta { margin-top: 0.3rem; font-size: 0.78rem; line-height: 1.5; color: var(--color-muted); }

.cv__foot { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-top: 1.6rem; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 0.78rem; color: var(--color-muted); }
.cv__foot-link { color: var(--color-neon); text-decoration: none; font-weight: 600; }
.cv__foot-link:hover { text-decoration: underline; }
</style>
