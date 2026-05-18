<script lang="ts">
/**
 * Get Organization schema for WorldCupDex.
 */
export function getOrganizationSchema(siteUrl: string, kickiqUrl?: string) {
  return {
    name: 'WorldCupDex',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: kickiqUrl ? [kickiqUrl] : [],
  }
}

/**
 * Get WebSite schema for WorldCupDex.
 */
export function getWebSiteSchema(siteUrl: string) {
  return {
    name: 'WorldCupDex',
    url: siteUrl,
    description: '2026 FIFA World Cup Encyclopedia & Predictions',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/data?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Build Schema.org Article data for blog posts.
 * Reference: https://schema.org/Article
 */
export function getArticleSchema(opts: {
  siteUrl: string
  headline: string
  description?: string
  url: string
  image?: string
  datePublished: string
  dateModified?: string
  author?: string
}) {
  return {
    headline: opts.headline,
    description: opts.description || '',
    url: opts.url,
    image: opts.image ? [opts.image] : [`${opts.siteUrl}/images/og-default.png`],
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: {
      '@type': 'Organization',
      name: opts.author || 'WorldCupDex Editorial',
      url: opts.siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'WorldCupDex',
      logo: {
        '@type': 'ImageObject',
        url: `${opts.siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': opts.url,
    },
  }
}
</script>

<script setup lang="ts">
const props = defineProps<{
  type: 'Organization' | 'WebSite' | 'SportsTeam' | 'SportsEvent' | 'Quiz' | 'Article'
  data: Record<string, any>
}>()

useHead(computed(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': props.type,
        ...props.data,
      }),
    },
  ],
})))
</script>

<template>
  <div style="display: none" aria-hidden="true" data-nosnippet></div>
</template>
