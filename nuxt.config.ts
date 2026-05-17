import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-16',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/i18n',
    // '@nuxt/content', // Requires better-sqlite3 native build; enable when C++ build tools are available
    '@nuxt/icon',
    '@vite-pwa/nuxt',
    '@nuxtjs/sitemap',
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  i18n: {
    lazy: true,
    locales: [
      { code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
    ],
    defaultLocale: 'zh',
    strategy: 'prefix_except_default',
    langDir: '.',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },

  pwa: {
    manifest: {
      name: 'WorldCupDex - 2026 FIFA World Cup Encyclopedia',
      short_name: 'WorldCupDex',
      theme_color: '#1A237E',
      background_color: '#F5F5F5',
      display: 'standalone',
      icons: [
        {
          src: '/images/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/images/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
    },
  },

  // content: {
  //   database: { type: 'sql.js' },
  // },

  site: {
    url: 'https://worldcupdex.org',
  },

  sitemap: {
    autoI18n: true,
  },

  app: {
    pageTransition: false,
    head: {
      title: 'WorldCupDex - 2026 FIFA World Cup Encyclopedia & Predictions',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '2026 FIFA World Cup encyclopedia, match schedules, team info, and predictions. Your ultimate guide to the 2026 World Cup.' },
        { name: 'theme-color', content: '#1A237E' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'WorldCupDex' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800;900&display=swap' },
      ],
    },
  },

  sourcemap: false,

  // nitro preset auto-detected by CF Pages framework preset

  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
    '/images/**': { headers: { 'Cache-Control': 'public, max-age=2592000' } },
    '/favicon.ico': { headers: { 'Cache-Control': 'public, max-age=2592000' } },
    '/robots.txt': { headers: { 'Cache-Control': 'public, max-age=86400' } },
  },
})
