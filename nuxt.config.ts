import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@vueuse/nuxt'],
  css: ['./app/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en', class: 'dark' },
      title: 'Lê Thị Minh Nguyệt — System Architect & UI Developer',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#121212' },
        {
          name: 'description',
          content:
            'Portfolio of Lê Thị Minh Nguyệt (Anna) — System Architect & Pixel-Perfect UI Developer. From architecture blueprints to flawless, high-performance interfaces.',
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap',
        },
      ],
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
