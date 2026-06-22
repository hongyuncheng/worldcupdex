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
    <DataSourceNote kind="schedule" compact />

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
      <div class="filter-tabs-scroll" aria-label="Schedule stage filters">
        <div class="filter-tabs" style="display: inline-flex; border: 1px solid #E0E0E0; border-radius: 8px; overflow: hidden;">
          <button
            v-for="(tab, index) in stageTabs"
            :key="tab.value"
            class="filter-tab text-sm font-semibold transition-all duration-200 cursor-pointer"
            :style="[
              'padding: 10px 24px; border: none;',
              selectedStageTab === tab.value
                ? 'background: #000F49; color: white;'
                : 'background: white; color: #333;',
              index < stageTabs.length - 1 ? 'border-right: 1px solid #E0E0E0;' : ''
            ].join(' ')"
            @click="setStageTab(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Center Dropdowns -->
      <div class="filter-dropdowns">
        <!-- Date Select -->
        <div class="relative">
          <span class="dropdown-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#999" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          </span>
          <select
            v-model="dateSelectValue"
            class="filter-select"
            style="padding-left: 32px;"
          >
            <option value="">{{ $t('schedule.selectDate') }}</option>
            <option v-for="d in dateOptions" :key="d.value" :value="d.value">{{ d.label }}</option>
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
        <div class="filter-timezone relative flex items-center bg-white border border-gray-200 rounded-lg p-1">
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

    <div class="favorite-guide" role="note">
      <span class="favorite-guide-icon">⭐</span>
      <span>{{ $t('schedule.favoriteGuide') }}</span>
    </div>

    <section class="schedule-affiliate-strip mb-6">
      <div class="schedule-affiliate-strip__main">
        <WatchPartyGear variant="rail" :max-items="3" />
      </div>
      <div class="schedule-affiliate-strip__cta">
        <SponsorCta theme="generic" btn-style="outline" layout="inline" placement="schedule_support_inline" />
      </div>
    </section>

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
              @click="setSidebarStage(stage.key)"
            >
              <div class="stage-item-left">
                <div class="stage-name">{{ stage.name }}</div>
                <div class="stage-date">{{ getStageDateRange(stage.key, stage.dateRange) }}</div>
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
              <select v-model="sortOrder" class="sort-select">
                <option value="asc">{{ $t('schedule.sortByTime') }}</option>
                <option value="desc">{{ $t('schedule.sortLatestFirst') }}</option>
              </select>
              <svg class="select-arrow-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Match Table -->
        <div v-if="filteredMatches.length === 0 && selectedStageTab === 'favorites'" class="empty-favorites">
          <div class="empty-favorites-icon">⭐</div>
          <h3>{{ $t('schedule.emptyFavoritesTitle') }}</h3>
          <p>{{ $t('schedule.emptyFavorites') }}</p>
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
                        class="team-follow-star ml-1"
                        :class="{ 'team-follow-star--active': isTeamFavorited(match.homeTeam.nameEn) }"
                        :title="isTeamFavorited(match.homeTeam.nameEn) ? $t('teams.followingTeam') : $t('teams.followTeam')"
                        :aria-label="isTeamFavorited(match.homeTeam.nameEn) ? $t('teams.followingTeam') : $t('teams.followTeam')"
                        @click.prevent.stop="toggleTeam(match.homeTeam.nameEn)"
                      >{{ isTeamFavorited(match.homeTeam.nameEn) ? '✓' : '☆' }}</button>
                    </span>
                  </span>
                  <span class="vs-badge">VS</span>
                  <span class="team-info team-info--away">
                    <span class="team-name">
                      <button 
                        v-if="isLoaded && match.awayTeam.nameEn !== 'TBA'"
                        class="team-follow-star mr-1"
                        :class="{ 'team-follow-star--active': isTeamFavorited(match.awayTeam.nameEn) }"
                        :title="isTeamFavorited(match.awayTeam.nameEn) ? $t('teams.followingTeam') : $t('teams.followTeam')"
                        :aria-label="isTeamFavorited(match.awayTeam.nameEn) ? $t('teams.followingTeam') : $t('teams.followTeam')"
                        @click.prevent.stop="toggleTeam(match.awayTeam.nameEn)"
                      >{{ isTeamFavorited(match.awayTeam.nameEn) ? '✓' : '☆' }}</button>
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
                  <button
                    v-if="isLoaded"
                    type="button"
                    class="follow-match-btn"
                    :class="{ 'follow-match-btn--active': isMatchFavorited(match.id) }"
                    :aria-pressed="isMatchFavorited(match.id)"
                    :aria-label="isMatchFavorited(match.id) ? $t('schedule.followingMatch') : $t('schedule.followMatch')"
                    @click.prevent.stop="toggleMatch(match.id)"
                  >
                    <span aria-hidden="true">{{ isMatchFavorited(match.id) ? '✓' : '☆' }}</span>
                    {{ isMatchFavorited(match.id) ? $t('schedule.followingMatch') : $t('schedule.followMatch') }}
                  </button>
                  <AddToCalendarButton
                    :matches="match"
                    :buttonText="$t('schedule.exportToCalendar')"
                    dropdownPosition="right"
                    customClass="calendar-export-btn"
                  />
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
  return formatMatchDateLabel(m, loc, mode)
}

function formatMatchTime(m: MatchItem, mode: 'venue' | 'local'): string {
  return formatMatchClock(m, locale.value, mode)
}

const showAll = ref(false)
type FilterType = 'all' | 'group' | 'knockout' | 'favorites'
const selectedStageTab = ref<FilterType>('all')
const selectedDate = ref('')
const selectedVenue = ref('')
const selectedGroup = ref('')
const selectedSidebarStage = ref('')
const calendarYear = ref(2026)
const calendarMonth = ref(6)
const selectedCalendarDay = ref(0)
const sortOrder = ref<'asc' | 'desc'>('asc')

// ─── Stage Tabs ───
const stageTabs = computed<{ value: FilterType; label: string }[]>(() => [
  { value: 'all', label: t('schedule.allMatches') },
  { value: 'group', label: t('schedule.groupStage') },
  { value: 'knockout', label: t('schedule.knockoutStage') },
  { value: 'favorites', label: t('schedule.mySchedule') },
])

function formatStageShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  if (locale.value === 'zh') {
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }
  return `${monthNames[d.getMonth()].slice(0, 3)} ${d.getDate()}`
}

function getStageDateRange(stage: string, fallback: string): string {
  const dates = allMatches.value
    .filter(m => m.stage === stage)
    .map(m => m.date)
    .filter(Boolean)
    .sort()

  if (!dates.length) return fallback

  const start = formatStageShortDate(dates[0])
  const end = formatStageShortDate(dates[dates.length - 1])
  return start === end ? start : `${start} - ${end}`
}

// ─── Sidebar Stages ───
const stages = computed<Stage[]>(() => {
  const countByStage = (stage: string) => allMatches.value.filter(m => m.stage === stage).length
  return [
    { key: 'GROUP_STAGE', name: t('schedule.stageGroupStage'), nameEn: 'Group Stage', dateRange: locale.value === 'zh' ? '6月12日 - 7月3日' : 'Jun 12 - Jul 3', count: countByStage('GROUP_STAGE') || 72 },
    { key: 'LAST_32', name: t('schedule.stageRoundOf16'), nameEn: 'Round of 32', dateRange: locale.value === 'zh' ? '7月4日 - 7月7日' : 'Jul 4 - Jul 7', count: countByStage('LAST_32') || 16 },
    { key: 'LAST_16', name: t('schedule.stageRoundOf8'), nameEn: 'Round of 8', dateRange: locale.value === 'zh' ? '7月8日 - 7月11日' : 'Jul 8 - Jul 11', count: countByStage('LAST_16') || 8 },
    { key: 'QUARTER_FINALS', name: t('schedule.stageQuarterFinal'), nameEn: 'Quarter-Final', dateRange: locale.value === 'zh' ? '7月12日 - 7月13日' : 'Jul 12 - Jul 13', count: countByStage('QUARTER_FINALS') || 4 },
    { key: 'SEMI_FINALS', name: t('schedule.stageSemiFinal'), nameEn: 'Semi-Final', dateRange: locale.value === 'zh' ? '7月15日 - 7月16日' : 'Jul 15 - Jul 16', count: countByStage('SEMI_FINALS') || 2 },
    { key: 'THIRD_PLACE', name: t('schedule.stageThirdPlace'), nameEn: 'Third Place', dateRange: locale.value === 'zh' ? '7月18日' : 'Jul 18', count: countByStage('THIRD_PLACE') || 1 },
    { key: 'FINAL', name: t('schedule.stageFinal'), nameEn: 'Final', dateRange: locale.value === 'zh' ? '7月19日' : 'Jul 19', count: countByStage('FINAL') || 1 },
  ]
})

function setStageTab(tab: FilterType) {
  selectedStageTab.value = tab
  selectedSidebarStage.value = tab === 'group' ? 'GROUP_STAGE' : ''
}

function setSidebarStage(stage: string) {
  selectedSidebarStage.value = stage
  selectedStageTab.value = stage === 'GROUP_STAGE' ? 'group' : 'knockout'
}

const currentStageName = computed(() => {
  if (selectedStageTab.value === 'favorites') return t('schedule.mySchedule')
  if (selectedStageTab.value === 'all' && !selectedSidebarStage.value) return t('schedule.allMatches')
  if (selectedStageTab.value === 'knockout' && !selectedSidebarStage.value) return t('schedule.knockoutStage')

  const s = stages.value.find(st => st.key === selectedSidebarStage.value)
  return s ? s.name : t('schedule.allMatches')
})

watch([selectedStageTab, selectedVenue, selectedGroup, selectedSidebarStage, selectedDate, sortOrder], () => {
  showAll.value = false
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
  filteredMatches.value.forEach(m => {
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
    result = result.filter(m =>
      favoriteMatches.value.includes(m.id) ||
      favoriteTeams.value.includes(m.homeTeam.nameEn) ||
      favoriteTeams.value.includes(m.awayTeam.nameEn)
    )
  } else if (selectedStageTab.value === 'group') {
    result = result.filter(m => m.stage === 'GROUP_STAGE')
  } else if (selectedStageTab.value === 'knockout') {
    result = result.filter(m => m.stage !== 'GROUP_STAGE')
  }
  if (selectedSidebarStage.value) {
    result = result.filter(m => m.stage === selectedSidebarStage.value)
  }
  if (selectedGroup.value) {
    result = result.filter(m => m.group === selectedGroup.value)
  }
  if (selectedVenue.value) {
    result = result.filter(m => (locale.value === 'zh' ? m.venue.nameZh : m.venue.name) === selectedVenue.value)
  }
  return result
})

const dateOptions = computed(() => {
  const dates = [...new Set(filteredMatches.value.map(m => m.date))].sort()
  return dates.map(d => ({
    value: d,
    label: formatDateLabel(d, locale.value),
  }))
})

const availableDateValues = computed(() => dateOptions.value.map(date => date.value))

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function syncCalendarToDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  calendarYear.value = date.getFullYear()
  calendarMonth.value = date.getMonth() + 1
  selectedCalendarDay.value = date.getDate()
}

const defaultScheduleDate = computed(() => {
  const dates = availableDateValues.value
  if (!dates.length) return ''

  const today = toIsoDate(new Date())
  return dates.find(date => date >= today) ?? dates[dates.length - 1]
})

const dateSelectValue = computed({
  get: () => selectedDate.value || defaultScheduleDate.value,
  set: (value: string) => {
    selectedDate.value = value
  }
})

const activeDate = computed(() => dateSelectValue.value || '')

watch(availableDateValues, (dates) => {
  if (!dates.length) {
    selectedDate.value = ''
    selectedCalendarDay.value = 0
    return
  }

  if (selectedDate.value && !dates.includes(selectedDate.value)) {
    selectedDate.value = ''
  }
}, { immediate: true })

watch(activeDate, (date) => {
  if (!date) {
    selectedCalendarDay.value = 0
    return
  }

  syncCalendarToDate(date)
}, { immediate: true })

const sortedMatches = computed(() => {
  return [...filteredMatches.value].sort((a, b) => {
    return sortOrder.value === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
  })
})

// ─── Displayed Matches (折叠/展开) ───
const displayedMatches = computed(() => {
  if (showAll.value) return sortedMatches.value
  if (sortOrder.value === 'desc') return sortedMatches.value.slice(0, 10)
  if (!activeDate.value) return sortedMatches.value.slice(0, 10)

  const anchorIndex = sortedMatches.value.findIndex(match => match.date === activeDate.value)
  if (anchorIndex === -1) return sortedMatches.value.slice(0, 10)

  return sortedMatches.value.slice(anchorIndex, anchorIndex + 10)
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
  selectedDate.value = `${calendarYear.value}-${`${calendarMonth.value}`.padStart(2, '0')}-${`${day}`.padStart(2, '0')}`
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
      return Number.isFinite(m.timestamp) && m.timestamp >= now
    })
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(0, 5)
})

function buildSportsEventData(m: MatchItem) {
  const venueName = m.venue.name || 'TBA Stadium'
  const venueCity = m.venue.city || 'TBA City'

  return {
    name: `${m.homeTeam.nameEn} vs ${m.awayTeam.nameEn}`,
    startDate: getMatchIsoStart(m),
    location: {
      '@type': 'Place',
      name: venueName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: venueCity
      }
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
.schedule-affiliate-strip {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-affiliate-strip__main,
.schedule-affiliate-strip__cta {
  width: 100%;
}

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
.filter-tabs-scroll {
  max-width: 100%;
  flex-shrink: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 2px;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}
.filter-tabs-scroll::after {
  content: '';
  position: sticky;
  right: 0;
  display: inline-block;
  width: 20px;
  height: 1px;
  margin-left: -20px;
  background: linear-gradient(90deg, rgba(255,255,255,0), #fff 70%);
  pointer-events: none;
}
.filter-tabs {
  display: inline-flex;
  flex-shrink: 0;
}
.filter-tab {
  min-height: 42px;
  white-space: nowrap;
}
.filter-dropdowns {
  display: flex;
  gap: 10px;
  flex: 1;
}
.filter-dropdowns > .relative {
  min-width: 0;
}
@media (max-width: 1023px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-tabs-scroll {
    width: 100%;
    mask-image: linear-gradient(90deg, #000 0, #000 calc(100% - 28px), transparent 100%);
    -webkit-mask-image: linear-gradient(90deg, #000 0, #000 calc(100% - 28px), transparent 100%);
  }
  .filter-dropdowns {
    flex-direction: column;
  }
  .filter-dropdowns > .relative,
  .filter-timezone,
  .export-btn {
    width: 100%;
  }
  .filter-timezone {
    justify-content: stretch;
  }
  .filter-timezone button {
    flex: 1;
    min-height: 34px;
  }
  .export-btn {
    justify-content: center;
    min-height: 42px;
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
.favorite-guide {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: -8px 0 18px;
  padding: 10px 14px;
  border: 1px solid #FFE08A;
  border-radius: 8px;
  background: #FFF9DB;
  color: #000F49;
  font-size: 13px;
  font-weight: 600;
}
.favorite-guide-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #FFD700;
  flex-shrink: 0;
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
.empty-favorites {
  padding: 52px 20px;
  text-align: center;
  color: #4A5578;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.empty-favorites-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-bottom: 12px;
  border-radius: 999px;
  background: #FFF3B0;
  color: #000F49;
  font-size: 22px;
}
.empty-favorites h3 {
  margin: 0 0 6px;
  color: #000F49;
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 800;
}
.empty-favorites p {
  margin: 0;
  font-size: 14px;
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
  grid-template-columns: 100px 1fr 80px 180px 172px;
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
  grid-template-columns: 100px 1fr 80px 180px 172px;
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
.team-follow-star {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 1px solid #D9DEF0;
  border-radius: 999px;
  background: #FFFFFF;
  color: #9AA3B2;
  font-size: 11px;
  line-height: 1;
  vertical-align: middle;
  transition: all 0.15s;
}
.team-follow-star:hover {
  border-color: #FFD700;
  background: #FFF9DB;
  color: #000F49;
}

.team-follow-star--active {
  border-color: #000F49;
  background: #000F49;
  color: #FFFFFF;
  box-shadow: 0 2px 6px rgba(0, 15, 73, 0.18);
}

.team-follow-star--active:hover {
  border-color: #07185F;
  background: #07185F;
  color: #FFFFFF;
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
.follow-match-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 112px;
  padding: 5px 12px;
  border: 1.5px solid #FFD700;
  border-radius: 999px;
  background: #FFFBE6;
  color: #000F49;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
  transition: all 0.2s;
}
.follow-match-btn:hover {
  background: #FFF3B0;
  color: #000F49;
  box-shadow: 0 3px 10px rgba(255, 215, 0, 0.18);
}

.follow-match-btn--active {
  border-color: #000F49;
  background: #000F49;
  color: #FFFFFF;
  box-shadow: 0 3px 10px rgba(0, 15, 73, 0.18);
}

.follow-match-btn--active:hover {
  border-color: #07185F;
  background: #07185F;
  color: #FFFFFF;
}
:deep(.calendar-export-btn) {
  min-width: 112px !important;
  justify-content: center !important;
  border: 1px solid #D8DDEA !important;
  background: #FFFFFF !important;
  color: #4A5578 !important;
  padding: 5px 12px !important;
  border-radius: 999px !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  backdrop-filter: none !important;
}
:deep(.calendar-export-btn:hover) {
  border-color: #000F49 !important;
  color: #000F49 !important;
  background: #F8F9FC !important;
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
  .col-venue,
  .col-actions {
    justify-content: flex-start;
  }
  .col-actions,
  .predict-btns,
  .follow-match-btn,
  :deep(.calendar-export-btn) {
    width: 100%;
  }
}

</style>

