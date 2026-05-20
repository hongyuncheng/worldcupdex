<template>
  <div class="max-w-7xl mx-auto px-4 py-6" style="padding-left: 16px; padding-right: 16px;">
    <!-- JSON-LD SportsEvent Schemas (first 5 upcoming matches) -->
    <SchemaOrg
      v-for="m in upcomingMatchesForSchema"
      :key="'sch-' + m.id"
      type="SportsEvent"
      :data="buildSportsEventData(m)"
    />
    <!-- Breadcrumb -->
    <nav class="mb-4" style="font-size: 13px; color: #999;">
      <NuxtLinkLocale to="/" class="hover:text-[#000F49] transition-colors">{{ $t('nav.home') }}</NuxtLinkLocale>
      <span class="mx-1.5">&gt;</span>
      <span style="color: #888;">{{ $t('schedule.breadcrumbParent') }}</span>
      <span class="mx-1.5">&gt;</span>
      <span style="color: #666;">{{ $t('schedule.breadcrumb') }}</span>
    </nav>

    <!-- Title -->
    <h1 class="font-bold mb-1" style="font-family: 'Montserrat', sans-serif; font-size: 32px; color: #000F49;">
      {{ $t('schedule.title') }}
    </h1>
    <p class="mb-6" style="font-size: 16px; color: #666;">
      {{ $t('schedule.subtitle') }}
    </p>

    <!-- Loading -->
    <div v-if="pending" class="text-center py-16">
      <p style="color: #999; font-size: 16px;">加载中...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16">
      <p style="color: #c00; font-size: 16px;">数据加载失败，请先运行 npm run fetch-data</p>
    </div>

    <template v-else>
    <!-- Filter Bar -->
    <div class="filter-bar mb-6">
      <!-- Left Tabs -->
      <div class="filter-tabs" style="display: inline-flex; border: 1px solid #E0E0E0; border-radius: 8px; overflow: hidden;">
        <button
          v-for="(tab, index) in stageTabs"
          :key="tab.value"
          class="text-sm font-semibold transition-all duration-200 cursor-pointer"
          :style="[
            'padding: 10px 24px; border: none;',
            selectedStageTab === tab.value
              ? 'background: #000F49; color: white;'
              : 'background: white; color: #333;',
            index < stageTabs.length - 1 ? 'border-right: 1px solid #E0E0E0;' : ''
          ].join(' ')"
          @click="selectedStageTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Center Dropdowns -->
      <div class="filter-dropdowns">
        <!-- Date Select -->
        <div class="relative">
          <span class="dropdown-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#999" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          </span>
          <select
            v-model="selectedDate"
            class="filter-select"
            style="padding-left: 32px;"
          >
            <option value="">{{ $t('schedule.selectDate') }}</option>
            <option v-for="d in availableDates" :key="d" :value="d">{{ d }}</option>
          </select>
          <svg class="select-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <!-- Venue Select -->
        <div class="relative">
          <span class="dropdown-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#999" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
          </span>
          <select
            v-model="selectedVenue"
            class="filter-select"
            style="padding-left: 32px;"
          >
            <option value="">{{ $t('schedule.allVenues') }}</option>
            <option v-for="v in venues" :key="v" :value="v">{{ v }}</option>
          </select>
          <svg class="select-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <!-- Timezone Toggle -->
        <div class="relative flex items-center bg-white border border-gray-200 rounded-lg p-1">
          <button 
            @click="timezoneMode = 'venue'"
            :class="['px-3 py-1 text-xs font-semibold rounded-md transition-colors', timezoneMode === 'venue' ? 'bg-[#000F49] text-white' : 'text-gray-500 hover:bg-gray-100']"
          >
            {{ locale === 'zh' ? '举办地时间' : 'Venue Time' }}
          </button>
          <button 
            @click="timezoneMode = 'local'"
            :class="['px-3 py-1 text-xs font-semibold rounded-md transition-colors', timezoneMode === 'local' ? 'bg-[#000F49] text-white' : 'text-gray-500 hover:bg-gray-100']"
          >
            {{ locale === 'zh' ? '本地时间' : 'My Time' }}
          </button>
        </div>

        <!-- Group Select -->
        <div class="relative">
          <span class="dropdown-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#999" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
          </span>
          <select
            v-model="selectedGroup"
            class="filter-select"
            style="padding-left: 32px;"
          >
            <option value="">{{ $t('schedule.allGroups') }}</option>
            <option v-for="g in groups" :key="g" :value="g">{{ g }}{{ $t('schedule.groupSuffix') }}</option>
          </select>
          <svg class="select-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <!-- Export Button -->
      <button class="export-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="flex-shrink: 0;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {{ $t('schedule.exportSchedule') }}
      </button>
    </div>

    <!-- Two Column Layout -->
    <div class="schedule-layout">
      <!-- Left Sidebar -->
      <aside class="schedule-sidebar">
        <!-- Stages Card -->
        <div class="sidebar-card">
          <h3 class="sidebar-title">{{ $t('schedule.stages') }}</h3>
          <ul class="stage-list">
            <li
              v-for="stage in stages"
              :key="stage.key"
              class="stage-item"
              :class="{ 'stage-item--active': selectedSidebarStage === stage.key }"
              @click="selectedSidebarStage = stage.key"
            >
              <div class="stage-item-left">
                <div class="stage-name">{{ stage.name }}</div>
                <div class="stage-date">{{ stage.dateRange }}</div>
              </div>
              <span class="stage-badge">{{ stage.count }}{{ locale === 'zh' ? '场' : '' }}</span>
            </li>
          </ul>
        </div>

        <!-- Quick Jump Calendar -->
        <div class="sidebar-card">
          <h3 class="sidebar-title">{{ $t('schedule.quickJump') }}</h3>
          <div class="calendar">
            <div class="calendar-header">
              <button class="calendar-nav" @click="prevMonth">&lt;</button>
              <span class="calendar-month">
                {{ locale === 'zh' ? `${calendarYear}${$t('schedule.year')}${calendarMonth}${$t('schedule.month')}` : `${monthNames[calendarMonth - 1]} ${calendarYear}` }}
              </span>
              <button class="calendar-nav" @click="nextMonth">&gt;</button>
            </div>
            <div class="calendar-grid">
              <div v-for="(day, i) in weekdayLabels" :key="'w'+i" class="calendar-weekday">{{ day }}</div>
              <div
                v-for="(cell, i) in calendarCells"
                :key="'c'+i"
                class="calendar-cell"
                :class="{
                  'calendar-cell--empty': !cell.day,
                  'calendar-cell--match': cell.hasMatch,
                  'calendar-cell--selected': cell.isSelected,
                }"
                @click="cell.day && cell.hasMatch && selectCalendarDate(cell.day)"
              >
                {{ cell.day || '' }}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="schedule-main">
        <!-- Top Bar -->
        <div class="main-top">
          <div class="main-top-left">
            <h2 class="main-stage-title">{{ currentStageName }}</h2>
            <div class="main-stage-underline"></div>
          </div>
          <div class="main-top-right">
            <span style="font-size: 13px; color: #666;">{{ $t('schedule.totalMatches', { count: filteredMatches.length }) }}</span>
            <div class="relative">
              <select class="sort-select">
                <option>{{ $t('schedule.sortByTime') }}</option>
              </select>
              <svg class="select-arrow-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Match Table -->
        <div v-if="filteredMatches.length === 0 && selectedStageTab === 'favorites'" class="py-12 text-center text-gray-500">
          {{ $t('schedule.emptyFavorites') }}
        </div>
        <div v-else class="match-table-wrapper">
          <!-- Table Header -->
          <div class="match-table-header">
            <div class="col-time">{{ $t('schedule.dateTime') }}</div>
            <div class="col-matchup">{{ $t('schedule.matchup') }}</div>
            <div class="col-group">{{ $t('schedule.group') }}</div>
            <div class="col-venue">{{ $t('schedule.venue') }}</div>
            <div class="col-actions">{{ $t('schedule.actions') }}</div>
          </div>

          <!-- Grouped by Date -->
          <template v-for="(group, dateKey) in groupedMatches" :key="dateKey">
            <div class="date-separator">
              📅 {{ dateKey }}
            </div>
            <div v-for="match in group" :key="match.id" class="match-row relative">
              <div class="col-time flex items-center justify-between w-full md:w-auto pr-2 md:pr-0">
                <div class="flex items-center gap-2">
                  <ClientOnly>
                    <span class="match-time">{{ formatMatchTime(match, timezoneMode) }}</span>
                    <template #fallback>
                      <span class="match-time">{{ match.time }}</span>
                    </template>
                  </ClientOnly>
                  <button 
                     v-if="isLoaded"
                     class="text-xl hover:scale-110 transition-transform focus:outline-none"
                     :class="isMatchFavorited(match.id) ? 'text-yellow-500 drop-shadow-sm' : 'text-gray-200 grayscale opacity-40 hover:opacity-80 hover:grayscale-0'"
                     @click.prevent.stop="toggleMatch(match.id)"
                     title="Add to My Schedule"
                   >
                     {{ isMatchFavorited(match.id) ? '🔔' : '🔕' }}
                   </button>
                   <div class="hidden md:block">
                     <AddToCalendarButton :matches="match" dropdownPosition="left" customClass="!p-1 !text-gray-400 hover:!bg-gray-100 !border-transparent" buttonText="" />
                   </div>
                </div>
                <div class="md:hidden block absolute right-4 top-4">
                  <AddToCalendarButton :matches="match" dropdownPosition="right" customClass="!p-1 !text-gray-400 hover:!bg-gray-100 !border-transparent" buttonText="" />
                </div>
              </div>
              <div class="col-matchup">
                <div class="matchup-content">
                  <span class="team-info team-info--home">
                    <span class="team-flag"><img :src="match.homeTeam.flag" :alt="match.homeTeam.nameEn" style="width: 24px; height: 16px; object-fit: contain;" loading="lazy" decoding="async" /></span>
                    <span class="team-name">
                      {{ locale === 'zh' ? match.homeTeam.nameZh : match.homeTeam.nameEn }}
                      <button 
                        v-if="isLoaded && match.homeTeam.nameEn !== 'TBA'"
                        class="ml-1 focus:outline-none hover:scale-110 transition-transform"
                      :class="isTeamFavorited(match.homeTeam.nameEn) ? 'text-yellow-500 drop-shadow-sm' : 'text-gray-200 grayscale opacity-40 hover:opacity-80 hover:grayscale-0'"
                      @click.prevent="toggleTeam(match.homeTeam.nameEn)"
                        title="Favorite Team"
                      >⭐</button>
                    </span>
                  </span>
                  <span class="vs-badge">VS</span>
                  <span class="team-info team-info--away">
                    <span class="team-name">
                      <button 
                        v-if="isLoaded && match.awayTeam.nameEn !== 'TBA'"
                        class="mr-1 focus:outline-none hover:scale-110 transition-transform"
                      :class="isTeamFavorited(match.awayTeam.nameEn) ? 'text-yellow-500 drop-shadow-sm' : 'text-gray-200 grayscale opacity-40 hover:opacity-80 hover:grayscale-0'"
                      @click.prevent="toggleTeam(match.awayTeam.nameEn)"
                        title="Favorite Team"
                      >⭐</button>
                      {{ locale === 'zh' ? match.awayTeam.nameZh : match.awayTeam.nameEn }}
                    </span>
                    <span class="team-flag"><img :src="match.awayTeam.flag" :alt="match.awayTeam.nameEn" style="width: 24px; height: 16px; object-fit: contain;" loading="lazy" decoding="async" /></span>
                  </span>
                </div>
              </div>
              <div class="col-group">
                <span class="group-tag">{{ match.group }}{{ locale === 'zh' ? $t('schedule.groupSuffix') : '' }}</span>
              </div>
              <div class="col-venue">
                <div class="venue-name">{{ locale === 'zh' ? match.venue.nameZh : match.venue.name }}</div>
                <div class="venue-city">{{ locale === 'zh' ? match.venue.cityZh : match.venue.city }}</div>
              </div>
              <div class="col-actions">
                <div class="predict-btns">
                  <NuxtLinkLocale :to="`/predict/${match.id}`" class="predict-btn predict-btn--human">{{ $t('home.predictHuman') }}</NuxtLinkLocale>
                  <button type="button" class="predict-btn predict-btn--ai" @click.prevent="handleAiPredict(match.homeTeam.nameEn, match.awayTeam.nameEn, 'schedule_list_ai_btn')">{{ $t('home.predictAi') }}</button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- View Full Schedule Button -->
        <div v-if="!showAll" class="btn-view-more-wrapper">
          <button class="btn-view-more" @click="showAll = true">{{ $t('schedule.viewFullSchedule') }} ({{ filteredMatches.length }}{{ locale === 'zh' ? '场' : '' }}) →</button>
        </div>
      </main>
    </div>


    </template>
  </div>
</template>

<script setup lang="ts">
import type { MatchItem } from '~/types'

const { t, locale } = useI18n()
const { favoriteTeams, favoriteMatches, isLoaded, toggleTeam, isTeamFavorited, toggleMatch, isMatchFavorited } = useFavorites()
const { handleAiPredict } = useAiPredict()

// ─── Types ───

interface Stage {
  key: string
  name: string
  nameEn: string
  dateRange: string
  count: number
}

// ─── API Data ───
const { data: matchesResponse, pending, error } = useMatchList()
const allMatches = computed<MatchItem[]>(() => matchesResponse.value?.data ?? [])

// ─── Date Formatting ───
const weekdayNamesZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const weekdayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function formatDateLabel(dateStr: string, loc: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekday = d.getDay()
  if (loc === 'zh') {
    return `${year}年${month}月${day}日 ${weekdayNamesZh[weekday]}`
  }
  return `${weekdayNamesEn[weekday]}, ${monthNames[d.getMonth()]} ${day}, ${year}`
}

// ─── State ───
const timezoneMode = ref<'venue' | 'local'>('venue')

function formatMatchDate(m: MatchItem, loc: string, mode: 'venue' | 'local'): string {
  if (mode === 'venue') {
    return formatDateLabel(m.date, loc)
  } else {
    const d = new Date(m.timestamp)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const day = d.getDate()
    const weekday = d.getDay()
    if (loc === 'zh') {
      return `${year}年${month}月${day}日 ${weekdayNamesZh[weekday]}`
    }
    return `${weekdayNamesEn[weekday]}, ${monthNames[d.getMonth()]} ${day}, ${year}`
  }
}

function formatMatchTime(m: MatchItem, mode: 'venue' | 'local'): string {
  if (mode === 'venue') return m.time || '00:00'
  const d = new Date(m.timestamp)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const showAll = ref(false)
type FilterType = 'all' | 'group' | 'knockout' | 'favorites'
const selectedStageTab = ref<FilterType>('all')
const selectedDate = ref('')
const selectedVenue = ref('')
const selectedGroup = ref('')
const selectedSidebarStage = ref('GROUP_STAGE')
const calendarYear = ref(2026)
const calendarMonth = ref(6)
const selectedCalendarDay = ref(12)

// ─── Stage Tabs ───
const stageTabs = computed<{ value: FilterType; label: string }[]>(() => [
  { value: 'all', label: t('schedule.allMatches') },
  { value: 'group', label: t('schedule.groupStage') },
  { value: 'knockout', label: t('schedule.knockoutStage') },
  { value: 'favorites', label: t('schedule.mySchedule') },
])

// ─── Sidebar Stages ───
const stages = computed<Stage[]>(() => {
  const countByStage = (stage: string) => allMatches.value.filter(m => m.stage === stage).length
  return [
    { key: 'GROUP_STAGE', name: t('schedule.stageGroupStage'), nameEn: 'Group Stage', dateRange: locale.value === 'zh' ? '6月12日 - 7月3日' : 'Jun 12 - Jul 3', count: countByStage('GROUP_STAGE') || 72 },
    { key: 'ROUND_OF_32', name: t('schedule.stageRoundOf16'), nameEn: 'Round of 32', dateRange: locale.value === 'zh' ? '7月4日 - 7月7日' : 'Jul 4 - Jul 7', count: countByStage('ROUND_OF_32') || 16 },
    { key: 'ROUND_OF_16', name: t('schedule.stageRoundOf8'), nameEn: 'Round of 8', dateRange: locale.value === 'zh' ? '7月8日 - 7月11日' : 'Jul 8 - Jul 11', count: countByStage('ROUND_OF_16') || 8 },
    { key: 'QUARTER_FINALS', name: t('schedule.stageQuarterFinal'), nameEn: 'Quarter-Final', dateRange: locale.value === 'zh' ? '7月12日 - 7月13日' : 'Jul 12 - Jul 13', count: countByStage('QUARTER_FINALS') || 4 },
    { key: 'SEMI_FINALS', name: t('schedule.stageSemiFinal'), nameEn: 'Semi-Final', dateRange: locale.value === 'zh' ? '7月15日 - 7月16日' : 'Jul 15 - Jul 16', count: countByStage('SEMI_FINALS') || 2 },
    { key: 'THIRD_PLACE', name: t('schedule.stageThirdPlace'), nameEn: 'Third Place', dateRange: locale.value === 'zh' ? '7月18日' : 'Jul 18', count: countByStage('THIRD_PLACE') || 1 },
    { key: 'FINAL', name: t('schedule.stageFinal'), nameEn: 'Final', dateRange: locale.value === 'zh' ? '7月19日' : 'Jul 19', count: countByStage('FINAL') || 1 },
  ]
})

const currentStageName = computed(() => {
  const s = stages.value.find(st => st.key === selectedSidebarStage.value)
  return s ? s.name : ''
})

// ─── Groups ───
const groups = computed(() => {
  const set = new Set<string>()
  allMatches.value.forEach(m => { if (m.group) set.add(m.group) })
  return Array.from(set).sort()
})

// ─── Venues list ───
const venues = computed(() => {
  const set = new Set<string>()
  allMatches.value.forEach(m => set.add(locale.value === 'zh' ? m.venue.nameZh : m.venue.name))
  return Array.from(set)
})

// ─── Available dates ───
const availableDates = computed(() => {
  const dates = [...new Set(allMatches.value.map(m => m.date))].sort()
  return dates.map(d => {
    if (locale.value === 'zh') {
      const dt = new Date(d + 'T00:00:00')
      return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日`
    }
    return formatDateLabel(d, 'en')
  })
})

// ─── Match dates for calendar highlighting ───
const matchDaysByMonth = computed(() => {
  const map: Record<string, Set<number>> = {}
  allMatches.value.forEach(m => {
    const d = new Date(m.date + 'T00:00:00')
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    if (!map[key]) map[key] = new Set()
    map[key].add(d.getDate())
  })
  return map
})

// ─── Filtered Matches ───
const filteredMatches = computed(() => {
  let result = [...allMatches.value]
  if (selectedStageTab.value === 'favorites') {
    result = result.filter(m => {
      const isFavTeam = favoriteTeams.value.includes(m.homeTeam.nameEn) || favoriteTeams.value.includes(m.awayTeam.nameEn)
      const isFavMatch = favoriteMatches.value.includes(m.id)
      return isFavTeam || isFavMatch
    })
  } else if (selectedStageTab.value === 'group') {
    result = result.filter(m => m.stage === 'GROUP_STAGE')
  } else if (selectedStageTab.value === 'knockout') {
    result = result.filter(m => m.stage !== 'GROUP_STAGE')
  }
  if (selectedGroup.value) {
    result = result.filter(m => m.group === selectedGroup.value)
  }
  if (selectedVenue.value) {
    result = result.filter(m => (locale.value === 'zh' ? m.venue.nameZh : m.venue.name) === selectedVenue.value)
  }
  // 过滤掉 TBD 比赛
  result = result.filter(m => m.homeTeam.id !== 'tbd' && m.awayTeam.id !== 'tbd')
  return result
})

// ─── Displayed Matches (折叠/展开) ───
const displayedMatches = computed(() => {
  if (showAll.value) return filteredMatches.value
  return filteredMatches.value.slice(0, 10)
})

// ─── Grouped by date ───
const groupedMatches = computed(() => {
  const map: Record<string, MatchItem[]> = {}
  displayedMatches.value.forEach(m => {
    const key = formatMatchDate(m, locale.value, timezoneMode.value)
    if (!map[key]) map[key] = []
    map[key].push(m)
  })
  return map
})

// ─── Calendar Logic ───
const weekdayLabels = computed(() => {
  if (locale.value === 'zh') {
    return t('schedule.weekdays').split('')
  }
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S']
})

const calendarCells = computed(() => {
  const year = calendarYear.value
  const month = calendarMonth.value
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: { day: number | null; hasMatch: boolean; isSelected: boolean }[] = []
  const monthKey = `${year}-${month}`

  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, hasMatch: false, isSelected: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const hasMatch = matchDaysByMonth.value[monthKey]?.has(d) ?? false
    cells.push({
      day: d,
      hasMatch,
      isSelected: d === selectedCalendarDay.value && month === calendarMonth.value,
    })
  }
  return cells
})

function prevMonth() {
  if (calendarMonth.value === 1) {
    calendarMonth.value = 12
    calendarYear.value--
  } else {
    calendarMonth.value--
  }
}

function nextMonth() {
  if (calendarMonth.value === 12) {
    calendarMonth.value = 1
    calendarYear.value++
  } else {
    calendarMonth.value++
  }
}

function selectCalendarDate(day: number) {
  selectedCalendarDay.value = day
}

// ─── SEO ───
useSeoConfig({
  title: `${t('schedule.title')} - WorldCupDex`,
  description: '2026世界杯完整赛程时间表，小组赛到决赛的所有比赛安排。',
})

// ─── JSON-LD SportsEvent: first 5 future matches with real opponents ───
const upcomingMatchesForSchema = computed<MatchItem[]>(() => {
  const now = Date.now()
  return allMatches.value
    .filter((m) => {
      if (m.homeTeam.id === 'tbd' || m.awayTeam.id === 'tbd') return false
      const ts = new Date(`${m.date}T${m.time || '00:00'}:00`).getTime()
      return Number.isFinite(ts) && ts >= now
    })
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    .slice(0, 5)
})

function buildSportsEventData(m: MatchItem) {
  return {
    name: `${m.homeTeam.nameEn} vs ${m.awayTeam.nameEn}`,
    startDate: `${m.date}T${m.time || '00:00'}:00`,
    location: {
      '@type': 'Place',
      name: m.venue.name,
      address: m.venue.city,
    },
    homeTeam: { '@type': 'SportsTeam', name: m.homeTeam.nameEn },
    awayTeam: { '@type': 'SportsTeam', name: m.awayTeam.nameEn },
    competitor: [
      { '@type': 'SportsTeam', name: m.homeTeam.nameEn },
      { '@type': 'SportsTeam', name: m.awayTeam.nameEn },
    ],
    eventStatus: 'https://schema.org/EventScheduled',
  }
}
</script>

<style scoped>
/* ===== Layout ===== */
.schedule-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (min-width: 1024px) {
  .schedule-layout {
    flex-direction: row;
  }
  .schedule-sidebar {
    width: 260px;
    flex-shrink: 0;
  }
  .schedule-main {
    flex: 1;
    min-width: 0;
  }
}

/* ===== Filter Bar ===== */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.filter-tabs {
  display: inline-flex;
  flex-shrink: 0;
}
.filter-dropdowns {
  display: flex;
  gap: 10px;
  flex: 1;
}
@media (max-width: 1023px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-dropdowns {
    flex-direction: column;
  }
  .schedule-sidebar {
    display: none;
  }
}
.filter-select {
  appearance: none;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px 36px 8px 14px;
  font-size: 13px;
  color: #333;
  background: white;
  outline: none;
  cursor: pointer;
  min-width: 150px;
  width: 100%;
}
.dropdown-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  pointer-events: none;
}
.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #999;
  pointer-events: none;
}
.select-arrow-sm {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: #999;
  pointer-events: none;
}
.export-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}
.export-btn:hover {
  border-color: #000F49;
  color: #000F49;
}

/* ===== Sidebar ===== */
.sidebar-card {
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 20px;
  margin-bottom: 16px;
}
.sidebar-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #000F49;
  margin-bottom: 16px;
}
.stage-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.stage-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  border-left: 3px solid transparent;
  margin-bottom: 2px;
}
.stage-item:hover {
  background: #F8F9FC;
}
.stage-item--active {
  background: #F0F4FF;
  border-left-color: #000F49;
}
.stage-item-left {
  flex: 1;
  min-width: 0;
}
.stage-name {
  font-size: 14px;
  font-weight: 700;
  color: #000F49;
}
.stage-date {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.stage-badge {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  background: #F0F0F0;
  padding: 2px 10px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ===== Calendar ===== */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.calendar-nav {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.15s;
}
.calendar-nav:hover {
  background: #F0F0F0;
}
.calendar-month {
  font-size: 14px;
  font-weight: 600;
  color: #000F49;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  text-align: center;
}
.calendar-weekday {
  font-size: 12px;
  color: #999;
  padding: 4px 0;
  font-weight: 500;
}
.calendar-cell {
  font-size: 12px;
  padding: 6px 0;
  border-radius: 50%;
  color: #ccc;
  cursor: default;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.calendar-cell--match {
  color: #333;
  font-weight: 700;
  cursor: pointer;
}
.calendar-cell--match:hover {
  background: #E8EDFF;
}
.calendar-cell--selected {
  background: #000F49 !important;
  color: white !important;
  font-weight: 700;
}

/* ===== Main Content Top ===== */
.main-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.main-top-left {
  display: flex;
  flex-direction: column;
}
.main-stage-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #000F49;
  margin: 0;
}
.main-stage-underline {
  width: 48px;
  height: 3px;
  background: #FFD700;
  border-radius: 2px;
  margin-top: 6px;
}
.main-top-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.sort-select {
  appearance: none;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 6px 30px 6px 12px;
  font-size: 13px;
  color: #333;
  background: white;
  outline: none;
  cursor: pointer;
}

/* ===== Match Table ===== */
.match-table-wrapper {
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  /* Removed overflow: hidden to allow dropdowns to overflow */
}
.match-table-header {
  display: grid;
  grid-template-columns: 100px 1fr 80px 180px 120px;
  padding: 12px 20px;
  background: #FAFAFA;
  border-bottom: 1px solid #F0F0F0;
  font-size: 13px;
  font-weight: 600;
  color: #666;
}
.date-separator {
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 700;
  color: #000F49;
  background: #FAFBFD;
  border-bottom: 1px solid #F0F0F0;
}
.match-row {
  display: grid;
  grid-template-columns: 100px 1fr 80px 180px 120px;
  padding: 14px 20px;
  border-bottom: 1px solid #F5F5F5;
  align-items: center;
  transition: background 0.15s;
}
.match-row:hover {
  background: #FAFBFD;
}
.match-row:last-child {
  border-bottom: none;
}

/* Columns */
.col-time {
  font-size: 14px;
  color: #333;
}
.match-time {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.col-matchup {
  display: flex;
  align-items: center;
  justify-content: center;
}
.matchup-content {
  display: flex;
  align-items: center;
  gap: 10px;
}
.team-info {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.team-flag {
  font-size: 20px;
  line-height: 1;
}
.team-name {
  font-size: 14px;
  font-weight: 600;
  color: #000F49;
  white-space: nowrap;
}
.vs-badge {
  font-size: 12px;
  font-weight: 700;
  color: #999;
  padding: 0 4px;
}
.col-group {
  display: flex;
  align-items: center;
  justify-content: center;
}
.group-tag {
  font-size: 13px;
  color: #333;
  font-weight: 600;
}
.col-venue {
  display: flex;
  flex-direction: column;
}
.venue-name {
  font-size: 13px;
  font-weight: 700;
  color: #000F49;
}
.venue-city {
  font-size: 12px;
  color: #999;
  margin-top: 1px;
}
.col-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}
.predict-btns {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}
.predict-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  text-decoration: none;
}
.predict-btn--human {
  border: 1.5px solid #FFD700;
  color: #000F49;
  background: transparent;
}
.predict-btn--human:hover {
  background: #FFD700;
  color: #000F49;
}
.predict-btn--ai {
  border: 1.5px solid #7C3AED;
  color: #7C3AED;
  background: transparent;
}
.predict-btn--ai:hover {
  background: #7C3AED;
  color: #fff;
}

/* Responsive table: stack on mobile */
@media (max-width: 768px) {
  .match-table-header {
    display: none;
  }
  .match-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 20px;
  }
  .col-matchup {
    justify-content: flex-start;
  }
  .col-group,
  .col-actions {
    justify-content: flex-start;
  }
}

</style>

