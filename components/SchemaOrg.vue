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
</script>

<script setup lang="ts">
const props = defineProps<{
  type: 'Organization' | 'WebSite' | 'SportsTeam' | 'SportsEvent' | 'Quiz'
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
  <!-- Renderless: JSON-LD injected via useHead -->
</template>
