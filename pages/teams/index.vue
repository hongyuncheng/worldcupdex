<template>
  <div class="max-w-7xl mx-auto px-4 lg:px-8 py-6">
    <!-- Breadcrumb -->
    <nav class="mb-4" style="font-size: 13px; color: #999;">
      <NuxtLinkLocale to="/" class="hover:text-[#000F49] transition-colors">{{ $t('nav.home') }}</NuxtLinkLocale>
      <span class="mx-1.5">&gt;</span>
      <span style="color: #666;">{{ $t('teams.title') }}</span>
    </nav>

    <!-- Title -->
    <h1 class="font-bold mb-1" style="font-family: 'Montserrat', sans-serif; font-size: 32px; color: #000F49;">
      {{ $t('teams.title') }}
    </h1>
    <p class="mb-6" style="font-size: 16px; color: #666;">
      {{ $t('teams.subtitle') }}
    </p>

    <!-- Group Tabs -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="tab in groupTabs"
        :key="tab.value"
        class="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
        :style="selectedGroup === tab.value
          ? 'background: #000F49; color: white; border: 1px solid #000F49;'
          : 'background: white; color: #333; border: 1px solid #ddd;'"
        @click="selectedGroup = tab.value; currentPage = 1"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Confederation + Search + Sort -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <div class="flex flex-wrap gap-2 flex-1">
        <button
          v-for="conf in confederationTabs"
          :key="conf.value"
          class="px-3 py-1.5 rounded-full text-sm transition-all duration-200 cursor-pointer"
          :style="selectedConfederation === conf.value
            ? 'background: #000F49; color: white;'
            : 'background: #F0F0F0; color: #555;'"
          @click="toggleConfederation(conf.value)"
        >
          {{ conf.label }}
        </button>
      </div>
      <div class="flex items-center gap-3 flex-shrink-0">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('teams.searchPlaceholder')"
            class="pl-3 pr-9 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#000F49]/20"
            style="border: 1px solid #ddd; width: 200px;"
            @input="currentPage = 1"
          />
          <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div class="relative">
          <select
            v-model="sortBy"
            class="pl-3 pr-8 py-2 rounded-lg text-sm outline-none cursor-pointer appearance-none"
            style="border: 1px solid #ddd; color: #333; background: white; min-width: 130px;"
            @change="currentPage = 1"
          >
            <option value="group">{{ $t('teams.sortByGroup') }}</option>
            <option value="rank">{{ $t('teams.sortByRank') }}</option>
          </select>
          <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- No results -->
    <div v-if="filteredTeams.length === 0" class="text-center py-16">
      <p style="color: #999; font-size: 16px;">{{ $t('teams.noResults') }}</p>
    </div>

    <!-- Team Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <NuxtLinkLocale
        v-for="team in paginatedTeams"
        :key="team.id"
        :to="`/teams/${team.id}`"
        class="bg-white py-6 px-4 text-center card-hover cursor-pointer"
        style="box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-radius: 12px; text-decoration: none; display: block;"
      >
        <img
          :src="`https://flagcdn.com/w160/${team.code}.png`"
          :alt="team.nameEn"
          class="mx-auto mb-3"
          style="width: 80px; height: 55px; object-fit: contain;"
          loading="lazy"
        />
        <h3 class="font-bold mb-0.5" style="font-family: 'Montserrat', sans-serif; font-size: 16px; color: #000F49;">
          {{ locale === 'en' ? team.nameEn : team.nameZh }}
        </h3>
        <p class="mb-3" style="font-size: 13px; color: #666;">
          {{ locale === 'en' ? team.nameZh : team.nameEn }}
        </p>
        <div class="flex items-center justify-center gap-2 mb-2">
          <span
            class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold"
            style="background: #FFD700; color: #000F49; min-width: 36px;"
          >
            #{{ team.fifaRank }}
          </span>
          <span
            class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold"
            style="background: #000F49; color: white; min-width: 36px;"
          >
            {{ locale === 'en' ? `Group ${team.group}` : `${team.group}${$t('teams.groupSuffix')}` }}
          </span>
        </div>
        <p style="font-size: 12px; color: #999;">{{ team.confederation }}</p>
      </NuxtLinkLocale>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-1.5 pb-8">
      <button
        v-for="item in paginationItems"
        :key="item.key"
        :disabled="item.disabled"
        class="min-w-[36px] h-9 px-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
        :class="item.disabled ? 'cursor-default' : 'cursor-pointer'"
        :style="item.active
          ? 'background: #000F49; color: white; border: 1px solid #000F49;'
          : item.disabled
            ? 'background: transparent; color: #999; border: none;'
            : 'background: white; color: #333; border: 1px solid #ddd;'"
        @click="!item.disabled && (currentPage = item.page)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

interface Team {
  id: string
  nameZh: string
  nameEn: string
  code: string
  group: string
  confederation: string
  fifaRank: number
}

const allTeams: Team[] = [
  // Group A
  { id: 'mx-a', nameZh: '墨西哥', nameEn: 'Mexico', code: 'mx', group: 'A', confederation: 'CONCACAF', fifaRank: 15 },
  { id: 'ar-a', nameZh: '阿根廷', nameEn: 'Argentina', code: 'ar', group: 'A', confederation: 'CONMEBOL', fifaRank: 1 },
  { id: 'pl-a', nameZh: '波兰', nameEn: 'Poland', code: 'pl', group: 'A', confederation: 'UEFA', fifaRank: 28 },
  { id: 'sa-a', nameZh: '沙特阿拉伯', nameEn: 'Saudi Arabia', code: 'sa', group: 'A', confederation: 'AFC', fifaRank: 56 },
  // Group B
  { id: 'fr-b', nameZh: '法国', nameEn: 'France', code: 'fr', group: 'B', confederation: 'UEFA', fifaRank: 2 },
  { id: 'us-b', nameZh: '美国', nameEn: 'USA', code: 'us', group: 'B', confederation: 'CONCACAF', fifaRank: 11 },
  { id: 'en-b', nameZh: '英格兰', nameEn: 'England', code: 'gb-eng', group: 'B', confederation: 'UEFA', fifaRank: 4 },
  { id: 'ir-b', nameZh: '伊朗', nameEn: 'Iran', code: 'ir', group: 'B', confederation: 'AFC', fifaRank: 22 },
  // Group C
  { id: 'br-c', nameZh: '巴西', nameEn: 'Brazil', code: 'br', group: 'C', confederation: 'CONMEBOL', fifaRank: 5 },
  { id: 'de-c', nameZh: '德国', nameEn: 'Germany', code: 'de', group: 'C', confederation: 'UEFA', fifaRank: 12 },
  { id: 'jp-c', nameZh: '日本', nameEn: 'Japan', code: 'jp', group: 'C', confederation: 'AFC', fifaRank: 18 },
  { id: 'ma-c', nameZh: '摩洛哥', nameEn: 'Morocco', code: 'ma', group: 'C', confederation: 'CAF', fifaRank: 14 },
  // Group D
  { id: 'es-d', nameZh: '西班牙', nameEn: 'Spain', code: 'es', group: 'D', confederation: 'UEFA', fifaRank: 8 },
  { id: 'nl-d', nameZh: '荷兰', nameEn: 'Netherlands', code: 'nl', group: 'D', confederation: 'UEFA', fifaRank: 7 },
  { id: 'ec-d', nameZh: '厄瓜多尔', nameEn: 'Ecuador', code: 'ec', group: 'D', confederation: 'CONMEBOL', fifaRank: 32 },
  { id: 'sn-d', nameZh: '塞内加尔', nameEn: 'Senegal', code: 'sn', group: 'D', confederation: 'CAF', fifaRank: 20 },
  // Group E
  { id: 'pt-e', nameZh: '葡萄牙', nameEn: 'Portugal', code: 'pt', group: 'E', confederation: 'UEFA', fifaRank: 6 },
  { id: 'be-e', nameZh: '比利时', nameEn: 'Belgium', code: 'be', group: 'E', confederation: 'UEFA', fifaRank: 3 },
  { id: 'kr-e', nameZh: '韩国', nameEn: 'South Korea', code: 'kr', group: 'E', confederation: 'AFC', fifaRank: 25 },
  { id: 'gh-e', nameZh: '加纳', nameEn: 'Ghana', code: 'gh', group: 'E', confederation: 'CAF', fifaRank: 36 },
  // Group F
  { id: 'hr-f', nameZh: '克罗地亚', nameEn: 'Croatia', code: 'hr', group: 'F', confederation: 'UEFA', fifaRank: 10 },
  { id: 'uy-f', nameZh: '乌拉圭', nameEn: 'Uruguay', code: 'uy', group: 'F', confederation: 'CONMEBOL', fifaRank: 16 },
  { id: 'ca-f', nameZh: '加拿大', nameEn: 'Canada', code: 'ca', group: 'F', confederation: 'CONCACAF', fifaRank: 43 },
  { id: 'cm-f', nameZh: '喀麦隆', nameEn: 'Cameroon', code: 'cm', group: 'F', confederation: 'CAF', fifaRank: 45 },
  // Group G
  { id: 'it-g', nameZh: '意大利', nameEn: 'Italy', code: 'it', group: 'G', confederation: 'UEFA', fifaRank: 9 },
  { id: 'co-g', nameZh: '哥伦比亚', nameEn: 'Colombia', code: 'co', group: 'G', confederation: 'CONMEBOL', fifaRank: 17 },
  { id: 'au-g', nameZh: '澳大利亚', nameEn: 'Australia', code: 'au', group: 'G', confederation: 'AFC', fifaRank: 27 },
  { id: 'ng-g', nameZh: '尼日利亚', nameEn: 'Nigeria', code: 'ng', group: 'G', confederation: 'CAF', fifaRank: 30 },
  // Group H
  { id: 'dk-h', nameZh: '丹麦', nameEn: 'Denmark', code: 'dk', group: 'H', confederation: 'UEFA', fifaRank: 19 },
  { id: 'ch-h', nameZh: '瑞士', nameEn: 'Switzerland', code: 'ch', group: 'H', confederation: 'UEFA', fifaRank: 13 },
  { id: 'tn-h', nameZh: '突尼斯', nameEn: 'Tunisia', code: 'tn', group: 'H', confederation: 'CAF', fifaRank: 35 },
  { id: 'cr-h', nameZh: '哥斯达黎加', nameEn: 'Costa Rica', code: 'cr', group: 'H', confederation: 'CONCACAF', fifaRank: 40 },
  // Group I
  { id: 'rs-i', nameZh: '塞尔维亚', nameEn: 'Serbia', code: 'rs', group: 'I', confederation: 'UEFA', fifaRank: 24 },
  { id: 'wl-i', nameZh: '威尔士', nameEn: 'Wales', code: 'gb-wls', group: 'I', confederation: 'UEFA', fifaRank: 26 },
  { id: 'id-i', nameZh: '印度尼西亚', nameEn: 'Indonesia', code: 'id', group: 'I', confederation: 'AFC', fifaRank: 134 },
  { id: 'nz-i', nameZh: '新西兰', nameEn: 'New Zealand', code: 'nz', group: 'I', confederation: 'OFC', fifaRank: 93 },
  // Group J
  { id: 'se-j', nameZh: '瑞典', nameEn: 'Sweden', code: 'se', group: 'J', confederation: 'UEFA', fifaRank: 21 },
  { id: 'cl-j', nameZh: '智利', nameEn: 'Chile', code: 'cl', group: 'J', confederation: 'CONMEBOL', fifaRank: 34 },
  { id: 'tr-j', nameZh: '土耳其', nameEn: 'Turkey', code: 'tr', group: 'J', confederation: 'AFC', fifaRank: 38 },
  { id: 'gn-j', nameZh: '几内亚', nameEn: 'Guinea', code: 'gn', group: 'J', confederation: 'CAF', fifaRank: 76 },
  // Group K
  { id: 'no-k', nameZh: '挪威', nameEn: 'Norway', code: 'no', group: 'K', confederation: 'UEFA', fifaRank: 47 },
  { id: 'py-k', nameZh: '巴拉圭', nameEn: 'Paraguay', code: 'py', group: 'K', confederation: 'CONMEBOL', fifaRank: 50 },
  { id: 'sau-k', nameZh: '沙特阿拉伯U23', nameEn: 'Saudi Arabia U23', code: 'sa', group: 'K', confederation: 'AFC', fifaRank: 60 },
  { id: 'tz-k', nameZh: '坦桑尼亚', nameEn: 'Tanzania', code: 'tz', group: 'K', confederation: 'CAF', fifaRank: 108 },
  // Group L
  { id: 'sc-l', nameZh: '苏格兰', nameEn: 'Scotland', code: 'gb-sct', group: 'L', confederation: 'UEFA', fifaRank: 39 },
  { id: 'pe-l', nameZh: '秘鲁', nameEn: 'Peru', code: 'pe', group: 'L', confederation: 'CONMEBOL', fifaRank: 31 },
  { id: 'bh-l', nameZh: '巴林', nameEn: 'Bahrain', code: 'bh', group: 'L', confederation: 'AFC', fifaRank: 86 },
  { id: 'ml-l', nameZh: '马里', nameEn: 'Mali', code: 'ml', group: 'L', confederation: 'CAF', fifaRank: 48 },
]

const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
const confederations = ['UEFA', 'CONMEBOL', 'CAF', 'AFC', 'CONCACAF', 'OFC']

// State
const selectedGroup = ref<string | null>(null)
const selectedConfederation = ref<string | null>(null)
const searchQuery = ref('')
const sortBy = ref('group')
const currentPage = ref(1)
const perPage = 12

// Group tabs with counts
const groupTabs = computed(() => {
  const all = { value: null as string | null, label: `${t('teams.all')} (${allTeams.length})` }
  const groupItems = groups.map(g => ({
    value: g,
    label: locale.value === 'en' ? `Group ${g}` : `${g}${t('teams.groupSuffix')}`
  }))
  return [all, ...groupItems]
})

// Confederation tabs with counts
const confederationTabs = computed(() => {
  return confederations.map(c => {
    const count = allTeams.filter(team => team.confederation === c).length
    return { value: c, label: `${c}(${count})` }
  })
})

function toggleConfederation(value: string) {
  selectedConfederation.value = selectedConfederation.value === value ? null : value
  currentPage.value = 1
}

// Filtered and sorted teams
const filteredTeams = computed(() => {
  let result = [...allTeams]

  // Group filter
  if (selectedGroup.value) {
    result = result.filter(t => t.group === selectedGroup.value)
  }

  // Confederation filter
  if (selectedConfederation.value) {
    result = result.filter(t => t.confederation === selectedConfederation.value)
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    result = result.filter(t =>
      t.nameZh.toLowerCase().includes(q) ||
      t.nameEn.toLowerCase().includes(q)
    )
  }

  // Sort
  if (sortBy.value === 'rank') {
    result.sort((a, b) => a.fifaRank - b.fifaRank)
  } else {
    result.sort((a, b) => {
      if (a.group !== b.group) return a.group.localeCompare(b.group)
      return a.fifaRank - b.fifaRank
    })
  }

  return result
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredTeams.value.length / perPage))

const paginatedTeams = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredTeams.value.slice(start, start + perPage)
})

// Pagination items
const paginationItems = computed(() => {
  const items: { key: string; label: string; page: number; active: boolean; disabled: boolean }[] = []
  const total = totalPages.value
  const current = currentPage.value

  // Previous button
  if (current > 1) {
    items.push({ key: 'prev', label: '<', page: current - 1, active: false, disabled: false })
  }

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      items.push({ key: `p${i}`, label: String(i), page: i, active: i === current, disabled: false })
    }
  } else {
    // Always show first page
    items.push({ key: 'p1', label: '1', page: 1, active: current === 1, disabled: false })

    if (current > 4) {
      items.push({ key: 'dots1', label: '...', page: 0, active: false, disabled: true })
    }

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) {
      items.push({ key: `p${i}`, label: String(i), page: i, active: i === current, disabled: false })
    }

    if (current < total - 3) {
      items.push({ key: 'dots2', label: '...', page: 0, active: false, disabled: true })
    }

    // Always show last page
    items.push({ key: `p${total}`, label: String(total), page: total, active: current === total, disabled: false })
  }

  // Next button
  if (current < total) {
    items.push({ key: 'next', label: '>', page: current + 1, active: false, disabled: false })
  }

  return items
})

// SEO
useHead({
  title: () => `${t('teams.title')} - WorldCupDex`,
})
</script>
