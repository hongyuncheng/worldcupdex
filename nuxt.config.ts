import tailwindcss from '@tailwindcss/vite'

// 注入 GA4 gtag.js 脚本（仅当 NUXT_PUBLIC_GA_ID 存在时）
const gaId = process.env.NUXT_PUBLIC_GA_ID || ''
const gaScripts = gaId
  ? [
      { src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`, async: true },
      {
        innerHTML: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config','${gaId}',{ send_page_view: false });`,
      },
    ]
  : []

// 注入 Google AdSense 脚本（仅在生产环境且 publisher ID 存在时）
const adsenseClient = process.env.NUXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-1445960722760802'
const adsenseScripts = adsenseClient && process.env.NODE_ENV === 'production'
  ? [
      {
        async: true,
        src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`,
        crossorigin: 'anonymous',
      },
    ]
  : []

export default defineNuxtConfig({
  compatibilityDate: '2025-05-16',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      gaId: '',
      adsenseClient: process.env.NUXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-1445960722760802',
      kickiqUrl: 'https://kickiq.app',
      siteUrl: 'https://worldcupdex.org',
    },
  },

  modules: [
    '@nuxtjs/i18n',
    '@nuxt/content',
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
    detectBrowserLanguage: false,
  },

  pwa: {
    selfDestroying: true, // 注销旧SW并清除所有缓存，解决缓存导致的更新问题
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
  },

  content: {
    database: {
      type: 'sqlite',
    },
    experimental: {
      sqliteConnector: 'native',
    },
  },

  site: {
    url: 'https://worldcupdex.org',
  },

  sitemap: {
    autoI18n: true,
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/blog',
        '/en/blog',
        '/es/blog',
        '/blog/road-to-2026-world-cup-host-cities',
        '/en/blog/road-to-2026-world-cup-host-cities',
        '/blog/2026-shijiebei-zhubanchengshi',
      ],
    },
    hooks: {
      'render:html': (html) => {
        html.head.push(`<meta name="impact-site-verification" value="ea35b5b0-59ab-4f17-9d42-d7c5d2f6c20f">`)
      },
    },
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
        { name: 'impact-site-verification', value: 'ea35b5b0-59ab-4f17-9d42-d7c5d2f6c20f' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800;900&display=swap' },
        { rel: 'preload', as: 'image', href: '/images/index_bg.png', fetchpriority: 'high' },
      ],
      script: [...gaScripts, ...adsenseScripts],
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
