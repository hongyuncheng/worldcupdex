<template>
  <div>
    <!-- 404 / not found -->
    <div v-if="!page" class="max-w-3xl mx-auto px-4 py-20 text-center">
      <p style="font-size: 64px; line-height: 1;">⚽</p>
      <h1 class="font-bold mt-4 mb-2" style="font-size: 28px; color: #000F49;">Article not found</h1>
      <NuxtLinkLocale to="/blog" style="color: #000F49; font-weight: 600;">{{ $t('blog.backToList') }}</NuxtLinkLocale>
    </div>

    <template v-else>
      <!-- Hero / Cover -->
      <div
        class="w-full"
        style="max-height: 400px; overflow: hidden; background: linear-gradient(135deg, #000F49 0%, #1A237E 100%);"
      >
        <img
          v-if="page.cover"
          :src="page.cover"
          :alt="page.title"
          class="w-full object-cover"
          style="max-height: 400px; opacity: 0.85;"
        />
        <div v-else class="flex items-center justify-center" style="height: 240px;">
          <span style="font-size: 80px;">⚽</span>
        </div>
      </div>

      <!-- Article -->
      <div class="max-w-3xl mx-auto px-4 lg:px-6 py-8">
        <BreadcrumbSchema v-if="page" :items="breadcrumbItems" nav-class="breadcrumb-schema mb-6" />

        <!-- Tags -->
        <div v-if="page.tags?.length" class="flex flex-wrap gap-1.5 mb-4">
          <span
            v-for="tag in page.tags"
            :key="tag"
            class="px-2.5 py-0.5 rounded-full text-xs font-medium"
            style="background: #F0F4FF; color: #000F49;"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="font-bold mb-4" style="font-family: 'Montserrat', sans-serif; font-size: 32px; color: #000F49; line-height: 1.25;">
          {{ page.title }}
        </h1>

        <!-- Meta row -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mb-8 pb-6" style="border-bottom: 1px solid #eee; font-size: 14px; color: #999;">
          <span>{{ $t('blog.publishedOn') }} {{ formatDate(page.publishedAt) }}</span>
          <span v-if="page.updatedAt">{{ $t('blog.updatedOn') }} {{ formatDate(page.updatedAt) }}</span>
          <span v-if="page.author">{{ $t('blog.by') }} <strong style="color: #555;">{{ page.author }}</strong></span>
        </div>

        <!-- Body -->
        <div class="prose prose-lg max-w-none" style="color: #374151; line-height: 1.8;">
          <ContentRenderer :value="page" />
        </div>

        <!-- CTA section -->
        <div class="mt-12 pt-8" style="border-top: 1px solid #eee;">
          <h2 class="font-bold mb-4" style="font-family: 'Montserrat', sans-serif; font-size: 20px; color: #000F49;">
            {{ $t('blog.relatedTitle') }}
          </h2>
          <div class="flex flex-wrap gap-3">
            <NuxtLinkLocale
              to="/blog"
              class="inline-flex items-center px-5 py-2.5 rounded-full font-semibold transition-all duration-200"
              style="background: #F0F4FF; color: #000F49; font-size: 15px;"
            >
              {{ $t('blog.backToList') }}
            </NuxtLinkLocale>
            <NuxtLinkLocale
              to="/teams"
              class="inline-flex items-center px-5 py-2.5 rounded-full font-semibold transition-all duration-200"
              style="background: #000F49; color: white; font-size: 15px;"
            >
              {{ $t('blog.exploreTeams') }}
            </NuxtLinkLocale>
          </div>
        </div>
      </div>
    </template>

    <!-- Article Schema -->
    <SchemaOrg
      v-if="page"
      type="Article"
      :data="articleSchema"
    />
  </div>
</template>

<script setup lang="ts">
import { getArticleSchema } from '~/components/SchemaOrg.vue'

const { t, locale } = useI18n()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public?.siteUrl as string) || 'https://worldcupdex.org'

// Build the content path from the route.
// Since files are placed in `content/{locale}/blog/...`, the DB path is `/{locale}/blog/{slug}`
const contentPath = computed(() => {
  return `/${locale.value}/blog/${route.params.slug}`
})

const blogLocales = ['en', 'zh', 'es'] as const
const { data: availableLocales } = await useAsyncData(
  `blog-locales-${route.params.slug}`,
  async () => {
    const localePages = await Promise.all(
      blogLocales.map(async (localeCode) => ({
        localeCode,
        page: await queryCollection('blog')
          .path(`/${localeCode}/blog/${route.params.slug}`)
          .first(),
      })),
    )

    return localePages
      .filter(({ page }) => page && !page.draft)
      .map(({ localeCode }) => localeCode)
  },
)

const { data: page } = await useAsyncData(
  `blog-${route.params.slug}`,
  () => queryCollection('blog').path(contentPath.value).first(),
)

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : locale.value === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Build Article schema
const articleSchema = computed(() => {
  if (!page.value) return {}
  return getArticleSchema({
    siteUrl,
    headline: page.value.title,
    description: page.value.description,
    url: `${siteUrl}${route.path}`,
    image: page.value.cover,
    datePublished: page.value.publishedAt,
    dateModified: page.value.updatedAt || page.value.publishedAt,
    author: page.value.author,
  })
})

const breadcrumbItems = computed(() => page.value ? [
  { name: t('nav.home'), path: '/' },
  { name: 'Blog', path: '/blog' },
  { name: page.value.title, path: `/blog/${route.params.slug}` },
] : [])

// SEO
if (page.value) {
  useSeoConfig({
    title: `${page.value.title} - WorldCupDex`,
    description: page.value.description || t('blog.metaDescription'),
    ogImage: page.value.cover,
    ogType: 'article',
    path: route.path,
    availableLocales: availableLocales.value || [],
  })
} else {
  useSeoConfig({
    title: `Blog - WorldCupDex`,
    description: t('blog.metaDescription'),
    path: route.path,
    availableLocales: availableLocales.value || [],
  })
}
</script>
