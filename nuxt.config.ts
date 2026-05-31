import tailwindcss from '@tailwindcss/vite'
import matchesData from './data/matches.json'
import teamsData from './data/teams.json'

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

// 注入 Skimlinks 脚本
const skimlinksId = process.env.NUXT_PUBLIC_SKIMLINKS_ID || '303414X1791459'
const skimlinksScripts = skimlinksId && process.env.NODE_ENV === 'production'
  ? [
      {
        type: 'text/javascript',
        src: `https://s.skimresources.com/js/${skimlinksId}.skimlinks.js`,
        async: true,
      },
    ]
  : []

// 注入 Ko-fi Widget 脚本
const kofiScripts = [
  {
    src: 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js',
    defer: true,
  },
  {
    innerHTML: `
      let kofiAttempts = 0;
      const kofiStorageKey = 'wcd_kofi_position_v1';
      function getKofiButtonText() {
        const path = window.location.pathname;
        if (path.startsWith('/zh')) return '支持我们';
        if (path.startsWith('/es')) return 'Apoyar';
        return 'Support us';
      }
      function injectCompactKofiStyle() {
        if (document.getElementById('wcd-kofi-style')) return;
        const style = document.createElement('style');
        style.id = 'wcd-kofi-style';
        style.textContent = \`
          .floatingchat-container-wrap {
            z-index: 80 !important;
            cursor: grab !important;
            touch-action: none !important;
            transform-origin: left bottom !important;
          }
          .floatingchat-container-wrap:active {
            cursor: grabbing !important;
          }
          .floatingchat-container-wrap iframe,
          .floatingchat-container-wrap button,
          .floatingchat-container-wrap a {
            transform: scale(0.82) !important;
            transform-origin: left bottom !important;
          }
          .floating-chat-kofi-popup-iframe,
          .floating-chat-kofi-popup-iframe-closer {
            z-index: 10000 !important;
          }
          @media (max-width: 768px) {
            .floatingchat-container-wrap iframe,
            .floatingchat-container-wrap button,
            .floatingchat-container-wrap a {
              transform: scale(0.72) !important;
            }
          }
        \`;
        document.head.appendChild(style);
      }
      function getKofiPosition() {
        try {
          const saved = JSON.parse(localStorage.getItem(kofiStorageKey) || 'null');
          if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.bottom)) {
            return saved;
          }
        } catch (e) {}
        return { left: 14, bottom: 18 };
      }
      function applyKofiPosition(element, position) {
        const width = element.offsetWidth || 150;
        const height = element.offsetHeight || 48;
        const left = Math.max(8, Math.min(position.left, window.innerWidth - width - 8));
        const bottom = Math.max(8, Math.min(position.bottom, window.innerHeight - height - 8));
        element.style.position = 'fixed';
        element.style.left = left + 'px';
        element.style.right = 'auto';
        element.style.bottom = bottom + 'px';
        element.style.top = 'auto';
        return { left, bottom };
      }
      function setupDraggableKofiWidget() {
        injectCompactKofiStyle();
        const element = document.querySelector('.floatingchat-container-wrap');
        if (!element || element.dataset.wcdDraggable === 'true') return;
        element.dataset.wcdDraggable = 'true';

        let position = applyKofiPosition(element, getKofiPosition());
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startBottom = 0;
        let moved = false;

        function onPointerMove(event) {
          const dx = event.clientX - startX;
          const dy = event.clientY - startY;
          if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
          if (!moved) return;
          event.preventDefault();
          position = applyKofiPosition(element, {
            left: startLeft + dx,
            bottom: startBottom - dy,
          });
        }

        function onPointerUp(event) {
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
          if (moved) {
            event.preventDefault();
            event.stopPropagation();
            localStorage.setItem(kofiStorageKey, JSON.stringify(position));
            element.dataset.wcdMovedAt = String(Date.now());
          }
        }

        element.addEventListener('pointerdown', function(event) {
          if (event.button !== undefined && event.button !== 0) return;
          startX = event.clientX;
          startY = event.clientY;
          startLeft = position.left;
          startBottom = position.bottom;
          moved = false;
          window.addEventListener('pointermove', onPointerMove, { passive: false });
          window.addEventListener('pointerup', onPointerUp, { capture: true });
        });

        element.addEventListener('click', function(event) {
          const movedAt = Number(element.dataset.wcdMovedAt || 0);
          if (Date.now() - movedAt < 250) {
            event.preventDefault();
            event.stopPropagation();
          }
        }, true);

        window.addEventListener('resize', function() {
          position = applyKofiPosition(element, position);
          localStorage.setItem(kofiStorageKey, JSON.stringify(position));
        });
      }
      const kofiInterval = setInterval(function() {
        if (typeof kofiWidgetOverlay !== 'undefined') {
          clearInterval(kofiInterval);
          try {
            kofiWidgetOverlay.draw('worldcupdex', {
              'type': 'floating-chat',
              'floating-chat.donateButton.text': getKofiButtonText(),
              'floating-chat.donateButton.background-color': '#000F49',
              'floating-chat.donateButton.text-color': '#FFD700'
            });
            setTimeout(setupDraggableKofiWidget, 300);
            setTimeout(setupDraggableKofiWidget, 1000);
          } catch (e) {
            console.error('Ko-fi Widget initialization failed:', e);
          }
        }
        if (++kofiAttempts > 100) clearInterval(kofiInterval); // 10秒后放弃
      }, 100);
    `,
  }
]

const isProduction = process.env.NODE_ENV === 'production'

const productionCacheRouteRules = isProduction
  ? {
      '/': { swr: 3600 },
      '/teams/**': { swr: 86400 },
      '/fan-card': { swr: 86400 },
      '/quiz/**': { swr: 86400 },
    }
  : {}

const teamScheduleRoutes = (teamsData as Array<{ id: string }>).flatMap(team => [
  `/teams/${team.id}/schedule`,
  `/zh/teams/${team.id}/schedule`,
  `/es/teams/${team.id}/schedule`,
])

const teamRouteTeamIds = new Set([
  ...(teamsData as Array<{ id: string }>).map(team => team.id),
  ...(matchesData as Array<{ stage: string; homeTeam: { id: string }; awayTeam: { id: string } }>).flatMap(match => (
    match.stage === 'GROUP_STAGE'
      ? [match.homeTeam.id, match.awayTeam.id]
      : []
  )),
])

const teamRouteRoutes = Array.from(teamRouteTeamIds)
  .filter(id => id && id !== 'tbd')
  .flatMap((id) => {
  return [
    `/teams/${id}/world-cup-2026-route`,
    `/zh/teams/${id}/world-cup-2026-route`,
    `/es/teams/${id}/world-cup-2026-route`,
  ]
})

export default defineNuxtConfig({
  compatibilityDate: '2025-05-16',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      gaId: '',
      adsenseClient: process.env.NUXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-1445960722760802',
      kickiqUrl: 'https://kickiq.app',
      siteUrl: 'https://worldcupdex.org',
      discordUrl: process.env.NUXT_PUBLIC_DISCORD_URL || 'https://discord.gg/zpCBfUZbUn',
    },
  },

  modules: [
    '@nuxtjs/i18n',
    '@nuxt/content',
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
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
      { code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json' },
    ],
    defaultLocale: 'en',
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

  experimental: {
    appManifest: false,
  },

  site: {
    url: 'https://worldcupdex.org',
  },

  sitemap: {
    autoI18n: true,
    urls: [
      ...teamScheduleRoutes,
      ...teamRouteRoutes,
    ],
  },

  nitro: {
    experimental: {
      tasks: true
    },
    prerender: {
      crawlLinks: true,
      routes: [
        '/blog',
        '/es/blog',
        '/zh/blog',
        ...teamScheduleRoutes,
        ...teamRouteRoutes,
      ],
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
        { name: 'google-site-verification', content: process.env.NUXT_PUBLIC_GSC_VERIFICATION || '' },
        { name: 'theme-color', content: '#1A237E' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'WorldCupDex' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800;900&display=swap' },
        { rel: 'preload', as: 'image', href: '/images/index_bg.png', fetchpriority: 'high' },
      ],
      script: [...gaScripts, ...adsenseScripts, ...skimlinksScripts, ...kofiScripts],
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
    '/images/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    '/favicon.svg': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    '/robots.txt': { headers: { 'Cache-Control': 'public, max-age=86400' } },
    
    // 页面与 API 的边缘缓存 (SWR) 提升缓存命中率
    ...productionCacheRouteRules,
  },
})
