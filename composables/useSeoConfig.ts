/**
 * Composable for setting up SEO meta tags, hreflang links, and OG tags.
 */
export function useSeoConfig(options: {
  title: string
  description: string
  ogImage?: string
  ogType?: string
  path?: string
}) {
  const { locale } = useI18n()
  const route = useRoute()
  const baseUrl = 'https://worldcupdex.org'

  // Strip any existing locale prefix from the path to get the "bare" path
  const currentPath = options.path || route.path
  const barePath = currentPath.replace(/^\/(en|es)/, '') || '/'

  // Generate URLs for each locale
  const zhUrl = `${baseUrl}${barePath}`
  const enUrl = `${baseUrl}/en${barePath === '/' ? '' : barePath}`
  const esUrl = `${baseUrl}/es${barePath === '/' ? '' : barePath}`

  const canonicalUrl = `${baseUrl}${currentPath}`
  const ogImage = options.ogImage || `${baseUrl}/images/og-default.png`

  useHead({
    title: options.title,
    meta: [
      { name: 'description', content: options.description },
      // Open Graph
      { property: 'og:title', content: options.title },
      { property: 'og:description', content: options.description },
      { property: 'og:image', content: ogImage },
      { property: 'og:type', content: options.ogType || 'website' },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:site_name', content: 'WorldCupDex' },
      { property: 'og:locale', content: locale.value === 'en' ? 'en_US' : locale.value === 'es' ? 'es_ES' : 'zh_CN' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: options.title },
      { name: 'twitter:description', content: options.description },
      { name: 'twitter:image', content: ogImage },
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl },
      { rel: 'alternate', hreflang: 'zh', href: zhUrl },
      { rel: 'alternate', hreflang: 'en', href: enUrl },
      { rel: 'alternate', hreflang: 'es', href: esUrl },
      { rel: 'alternate', hreflang: 'x-default', href: zhUrl },
    ],
  })
}

/**
 * Lightweight helper that only adds hreflang alternate links.
 * Use this for pages that already have their own SEO meta setup (e.g. result pages).
 */
export function useHreflang(path?: string) {
  const route = useRoute()
  const baseUrl = 'https://worldcupdex.org'

  const currentPath = path || route.path
  const barePath = currentPath.replace(/^\/(en|es)/, '') || '/'

  const zhUrl = `${baseUrl}${barePath}`
  const enUrl = `${baseUrl}/en${barePath === '/' ? '' : barePath}`
  const esUrl = `${baseUrl}/es${barePath === '/' ? '' : barePath}`

  useHead({
    link: [
      { rel: 'alternate', hreflang: 'zh', href: zhUrl },
      { rel: 'alternate', hreflang: 'en', href: enUrl },
      { rel: 'alternate', hreflang: 'es', href: esUrl },
      { rel: 'alternate', hreflang: 'x-default', href: zhUrl },
    ],
  })
}
