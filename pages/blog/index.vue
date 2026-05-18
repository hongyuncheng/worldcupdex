<template>
  <div class="max-w-7xl mx-auto px-4 lg:px-8 py-6">
    <!-- Breadcrumb -->
    <nav class="mb-4" style="font-size: 13px; color: #999;">
      <NuxtLinkLocale to="/" class="hover:text-[#000F49] transition-colors">{{ $t('nav.home') }}</NuxtLinkLocale>
      <span class="mx-1.5">&gt;</span>
      <span style="color: #666;">{{ $t('blog.listTitle') }}</span>
    </nav>

    <!-- Title -->
    <h1 class="font-bold mb-1" style="font-family: 'Montserrat', sans-serif; font-size: 32px; color: #000F49;">
      {{ $t('blog.listTitle') }}
    </h1>
    <p class="mb-8" style="font-size: 16px; color: #666;">
      {{ $t('blog.listSubtitle') }}
    </p>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="text-center py-16">
      <p style="color: #999; font-size: 16px;">Loading...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!filteredPosts.length" class="text-center py-16">
      <p style="color: #999; font-size: 16px;">{{ $t('blog.emptyState') }}</p>
    </div>

    <!-- Article Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <NuxtLinkLocale
        v-for="post in filteredPosts"
        :key="post.path"
        :to="post.path"
        class="bg-white overflow-hidden card-hover cursor-pointer"
        style="box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-radius: 12px; text-decoration: none; display: block;"
      >
        <!-- Cover image -->
        <div
          v-if="post.cover"
          class="w-full h-48 bg-gray-100"
          style="overflow: hidden;"
        >
          <img
            :src="post.cover"
            :alt="post.title"
            class="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div v-else class="w-full h-48 flex items-center justify-center" style="background: linear-gradient(135deg, #000F49 0%, #1A237E 100%);">
          <span style="font-size: 48px;">⚽</span>
        </div>

        <!-- Content -->
        <div class="p-5">
          <!-- Tags -->
          <div v-if="post.tags?.length" class="flex flex-wrap gap-1.5 mb-3">
            <span
              v-for="tag in post.tags.slice(0, 3)"
              :key="tag"
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              style="background: #F0F4FF; color: #000F49;"
            >
              {{ tag }}
            </span>
          </div>

          <h2 class="font-bold mb-2 line-clamp-2" style="font-family: 'Montserrat', sans-serif; font-size: 18px; color: #000F49;">
            {{ post.title }}
          </h2>
          <p class="mb-3 line-clamp-3" style="font-size: 14px; color: #666; line-height: 1.6;">
            {{ post.description }}
          </p>

          <!-- Meta -->
          <div class="flex items-center justify-between" style="font-size: 12px; color: #999;">
            <span>{{ $t('blog.publishedOn') }} {{ formatDate(post.publishedAt) }}</span>
            <span style="color: #000F49; font-weight: 600;">{{ $t('blog.readMore') }}</span>
          </div>
        </div>
      </NuxtLinkLocale>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

// Query all blog posts
const { data: posts, status } = await useAsyncData('blog-list', () =>
  queryCollection('blog')
    .order('publishedAt', 'DESC')
    .all(),
)

// Filter by current locale + non-draft
const filteredPosts = computed(() => {
  if (!posts.value) return []
  return posts.value.filter(
    (p: any) => p.locale === locale.value && !p.draft,
  )
})

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : locale.value === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// SEO
useSeoConfig({
  title: `${t('blog.listTitle')} - WorldCupDex`,
  description: t('blog.metaDescription'),
  path: '/blog',
})
</script>
