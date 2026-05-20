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

    <!-- Loading -->
    <div v-if="pending" class="text-center py-16">
      <p style="color: #999; font-size: 16px;">加载中...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16">
      <p style="color: #c00; font-size: 16px;">数据加载失败，请先运行 npm run fetch-data</p>
    </div>

    <!-- No results -->
    <div v-else-if="filteredTeams.length === 0" class="text-center py-16">
      <p style="color: #999; font-size: 16px;">{{ $t('teams.noResults') }}</p>
    </div>

    <!-- Team Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <NuxtLinkLocale
        v-for="team in paginatedTeams"
        :key="team.id"
        :to="`/teams/${team.id}`"
        class="bg-white py-6 px-4 text-center card-hover cursor-pointer relative"
        style="box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-radius: 12px; text-decoration: none; display: block;"
      >
        <button 
            v-if="isLoaded"
            class="absolute top-2 right-2 p-2 text-2xl hover:scale-110 transition-transform focus:outline-none"
            :class="isTeamFavorited(team.nameEn) ? 'text-yellow-500 drop-shadow-md' : 'text-gray-200 grayscale opacity-40 hover:opacity-80 hover:grayscale-0'"
            @click.prevent="toggleTeam(team.nameEn)"
            title="Favorite Team"
          >⭐</button>
        <img
          :src="team.flag"
          :alt="team.nameEn"
          class="mx-auto mb-3"
          style="width: 80px; height: 55px; object-fit: contain;"
          loading="lazy"
          decoding="async"
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
import type { TeamListItem } from '~/types'

const { t, locale } = useI18n()
const { isLoaded, toggleTeam, isTeamFavorited } = useFavorites()

// 从 API 获取全部球队数据
const { data: teamsResponse, pending, error } = useTeamList({ pageSize: 100 })

// 提取球队数组，保持与原来 allTeams 相同的使用方式
const allTeams = computed<TeamListItem[]>(() => teamsResponse.value?.data ?? [])

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
  const all = { value: null as string | null, label: `${t('teams.all')} (${allTeams.value.length})` }
  const groupItems = groups.map(g => ({
    value: g,
    label: locale.value === 'en' ? `Group ${g}` : `${g}${t('teams.groupSuffix')}`
  }))
  return [all, ...groupItems]
})

// Confederation tabs with counts
const confederationTabs = computed(() => {
  return confederations.map(c => {
    const count = allTeams.value.filter(team => team.confederation === c).length
    return { value: c, label: `${c}(${count})` }
  })
})

function toggleConfederation(value: string) {
  selectedConfederation.value = selectedConfederation.value === value ? null : value
  currentPage.value = 1
}

// Filtered and sorted teams
const filteredTeams = computed(() => {
  let result = [...allTeams.value]

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
useSeoConfig({
  title: `${t('teams.title')} - WorldCupDex`,
  description: '浏览2026世界杯所有参赛球队，了解阵容、历史战绩和小组赛分组。',
})
</script>
