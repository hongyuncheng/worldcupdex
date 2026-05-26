/**
 * Composable for setting up SEO meta tags, hreflang links, OG tags, and Twitter Cards.
 */
export function useSeoConfig(options: {
  title: string | Ref<string> | ComputedRef<string>
  description: string | Ref<string> | ComputedRef<string>
  ogImage?: string | Ref<string> | ComputedRef<string>
  ogType?: string
  path?: string
  noindex?: boolean
}) {
  const { locale } = useI18n()
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const baseUrl = (runtimeConfig.public?.siteUrl as string) || 'https://worldcupdex.org'

  // Strip any existing locale prefix from the path to get the "bare" path
  const currentPath = options.path || route.path
  const barePath = currentPath.replace(/^\/(zh|en|es)\b/, '') || '/'

  // Generate URLs for each locale
  const zhUrl = `${baseUrl}${barePath}`
  const enUrl = `${baseUrl}/en${barePath === '/' ? '' : barePath}`
  const esUrl = `${baseUrl}/es${barePath === '/' ? '' : barePath}`

  const canonicalUrl = `${baseUrl}${currentPath}`

  const ogImageComputed = computed(() => {
    const img = toValue(options.ogImage)
    if (!img) return `${baseUrl}/images/og-default.png`
    return img.startsWith('http') ? img : `${baseUrl}${img}`
  })

  const titleComputed = computed(() => toValue(options.title))
  const descComputed = computed(() => toValue(options.description))

  const metaTags: any[] = [
    { name: 'description', content: descComputed },
    // Open Graph
    { property: 'og:title', content: titleComputed },
    { property: 'og:description', content: descComputed },
    { property: 'og:image', content: ogImageComputed },
    { property: 'og:type', content: options.ogType || 'website' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'WorldCupDex' },
    { property: 'og:locale', content: computed(() => locale.value === 'en' ? 'en_US' : locale.value === 'es' ? 'es_ES' : 'zh_CN') },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: titleComputed },
    { name: 'twitter:description', content: descComputed },
    { name: 'twitter:image', content: ogImageComputed },
    { name: 'twitter:site', content: '@worldcupdex' },
  ]

  if (options.noindex) {
    metaTags.push({ name: 'robots', content: 'noindex, nofollow' })
  }

  useHead({
    title: titleComputed,
    meta: metaTags,
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
  const runtimeConfig = useRuntimeConfig()
  const baseUrl = (runtimeConfig.public?.siteUrl as string) || 'https://worldcupdex.org'

  const currentPath = path || route.path
  const barePath = currentPath.replace(/^\/(zh|en|es)\b/, '') || '/'

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
