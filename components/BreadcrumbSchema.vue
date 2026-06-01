<script setup lang="ts">
interface BreadcrumbItem {
  name: string
  path: string
}

const props = withDefaults(defineProps<{
  items: BreadcrumbItem[]
  navClass?: string
  separator?: string
}>(), {
  navClass: 'breadcrumb-schema',
  separator: '/',
})

const { locale } = useI18n()
const runtimeConfig = useRuntimeConfig()
const siteUrl = ((runtimeConfig.public?.siteUrl as string) || 'https://worldcupdex.org').replace(/\/+$/, '')

function getLocalizedPath(path: string) {
  if (/^https?:\/\//.test(path)) return path

  const barePath = path.replace(/^\/(zh|en|es)\b/, '') || '/'
  if (locale.value === 'en') return barePath
  return `/${locale.value}${barePath === '/' ? '' : barePath}`
}

const schemaData = computed(() => ({
  itemListElement: props.items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: /^https?:\/\//.test(item.path)
      ? item.path
      : `${siteUrl}${getLocalizedPath(item.path)}`,
  })),
}))
</script>

<template>
  <nav :class="navClass" aria-label="Breadcrumb">
    <template v-for="(item, index) in items" :key="`${item.path}-${index}`">
      <span v-if="index > 0" aria-hidden="true">{{ separator }}</span>
      <NuxtLinkLocale v-if="index < items.length - 1" :to="item.path">
        {{ item.name }}
      </NuxtLinkLocale>
      <span v-else aria-current="page">{{ item.name }}</span>
    </template>
  </nav>
  <SchemaOrg type="BreadcrumbList" :data="schemaData" />
</template>

<style scoped>
.breadcrumb-schema {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  color: #6b7280;
  font-size: 13px;
}

.breadcrumb-schema a {
  color: #000f49;
  font-weight: 600;
  text-decoration: none;
}

.breadcrumb-schema a:hover {
  text-decoration: underline;
}
</style>
