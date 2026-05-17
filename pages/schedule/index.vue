<template>
  <div class="max-w-7xl mx-auto px-4 py-6" style="padding-left: 16px; padding-right: 16px;">
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
        <div class="match-table-wrapper">
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
            <div v-for="match in group" :key="match.id" class="match-row">
              <div class="col-time">
                <span class="match-time">{{ match.time }}</span>
              </div>
              <div class="col-matchup">
                <div class="matchup-content">
                  <span class="team-info team-info--home">
                    <span class="team-flag">{{ match.homeFlag }}</span>
                    <span class="team-name">{{ locale === 'zh' ? match.homeNameZh : match.homeNameEn }}</span>
                  </span>
                  <span class="vs-badge">VS</span>
                  <span class="team-info team-info--away">
                    <span class="team-name">{{ locale === 'zh' ? match.awayNameZh : match.awayNameEn }}</span>
                    <span class="team-flag">{{ match.awayFlag }}</span>
                  </span>
                </div>
              </div>
              <div class="col-group">
                <span class="group-tag">{{ match.group }}{{ locale === 'zh' ? $t('schedule.groupSuffix') : '' }}</span>
              </div>
              <div class="col-venue">
                <div class="venue-name">{{ locale === 'zh' ? match.venueZh : match.venueEn }}</div>
                <div class="venue-city">{{ locale === 'zh' ? match.cityZh : match.cityEn }}</div>
              </div>
              <div class="col-actions">
                <button class="predict-btn">{{ $t('schedule.predictMatch') }}</button>
              </div>
            </div>
          </template>
        </div>

        <!-- View Full Schedule Button -->
        <div class="btn-view-more-wrapper">
          <button class="btn-view-more">{{ $t('schedule.viewFullSchedule') }} (72{{ locale === 'zh' ? '场' : '' }}) →</button>
        </div>
      </main>
    </div>

    <!-- Bottom Info Bar -->
    <div class="info-bar">
      <div class="info-item">
        <span class="info-icon">⏰</span>
        <div>
          <div class="info-title">{{ $t('schedule.infoTimeZone') }}</div>
          <div class="info-desc">{{ $t('schedule.infoTimeZoneDesc') }}</div>
        </div>
      </div>
      <div class="info-item">
        <span class="info-icon">📺</span>
        <div>
          <div class="info-title">{{ $t('schedule.infoBroadcast') }}</div>
          <div class="info-desc">{{ $t('schedule.infoBroadcastDesc') }}</div>
        </div>
      </div>
      <div class="info-item">
        <span class="info-icon">🎫</span>
        <div>
          <div class="info-title">{{ $t('schedule.infoTicket') }}</div>
          <div class="info-desc">{{ $t('schedule.infoTicketDesc') }}</div>
        </div>
      </div>
      <div class="info-item">
        <span class="info-icon">📋</span>
        <div>
          <div class="info-title">{{ $t('schedule.infoUpdate') }}</div>
          <div class="info-desc">{{ $t('schedule.infoUpdateDesc') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

// ─── Types ───
interface Match {
  id: number
  date: string
  dateLabel: string
  dateLabelEn: string
  time: string
  homeFlag: string
  homeNameZh: string
  homeNameEn: string
  awayFlag: string
  awayNameZh: string
  awayNameEn: string
  group: string
  venueZh: string
  venueEn: string
  cityZh: string
  cityEn: string
  stage: string
}

interface Stage {
  key: string
  name: string
  nameEn: string
  dateRange: string
  count: number
}

// ─── State ───
const selectedStageTab = ref('all')
const selectedDate = ref('')
const selectedVenue = ref('')
const selectedGroup = ref('')
const selectedSidebarStage = ref('group')
const calendarYear = ref(2026)
const calendarMonth = ref(6)
const selectedCalendarDay = ref(12)

// ─── Stage Tabs ───
const stageTabs = computed(() => [
  { value: 'all', label: t('schedule.allMatches') },
  { value: 'group', label: t('schedule.groupStage') },
  { value: 'knockout', label: t('schedule.knockoutStage') },
])

// ─── Sidebar Stages ───
const stages = computed<Stage[]>(() => [
  { key: 'group', name: t('schedule.stageGroupStage'), nameEn: 'Group Stage', dateRange: locale.value === 'zh' ? '6月12日 - 7月3日' : 'Jun 12 - Jul 3', count: 72 },
  { key: 'r16', name: t('schedule.stageRoundOf16'), nameEn: 'Round of 16', dateRange: locale.value === 'zh' ? '7月4日 - 7月7日' : 'Jul 4 - Jul 7', count: 16 },
  { key: 'r8', name: t('schedule.stageRoundOf8'), nameEn: 'Round of 8', dateRange: locale.value === 'zh' ? '7月8日 - 7月11日' : 'Jul 8 - Jul 11', count: 8 },
  { key: 'qf', name: t('schedule.stageQuarterFinal'), nameEn: 'Quarter-Final', dateRange: locale.value === 'zh' ? '7月12日 - 7月13日' : 'Jul 12 - Jul 13', count: 4 },
  { key: 'sf', name: t('schedule.stageSemiFinal'), nameEn: 'Semi-Final', dateRange: locale.value === 'zh' ? '7月15日 - 7月16日' : 'Jul 15 - Jul 16', count: 2 },
  { key: '3rd', name: t('schedule.stageThirdPlace'), nameEn: 'Third Place', dateRange: locale.value === 'zh' ? '7月18日' : 'Jul 18', count: 1 },
  { key: 'final', name: t('schedule.stageFinal'), nameEn: 'Final', dateRange: locale.value === 'zh' ? '7月19日' : 'Jul 19', count: 1 },
])

const currentStageName = computed(() => {
  const s = stages.value.find(st => st.key === selectedSidebarStage.value)
  return s ? s.name : ''
})

// ─── Groups ───
const groups = ['A', 'B', 'C', 'D', 'E']

// ─── Mock Match Data ───
const allMatches: Match[] = [
  // June 12 (Friday) - Opening Day
  { id: 1, date: '2026-06-12', dateLabel: '2026年6月12日 星期五', dateLabelEn: 'Friday, June 12, 2026', time: '03:00', homeFlag: '🇲🇽', homeNameZh: '墨西哥', homeNameEn: 'Mexico', awayFlag: '🇦🇷', awayNameZh: '阿根廷', awayNameEn: 'Argentina', group: 'A', venueZh: '阿兹特克球场', venueEn: 'Azteca Stadium', cityZh: '墨西哥城', cityEn: 'Mexico City', stage: 'group' },
  { id: 2, date: '2026-06-12', dateLabel: '2026年6月12日 星期五', dateLabelEn: 'Friday, June 12, 2026', time: '06:00', homeFlag: '🇺🇸', homeNameZh: '美国', homeNameEn: 'USA', awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayNameZh: '英格兰', awayNameEn: 'England', group: 'B', venueZh: 'MetLife球场', venueEn: 'MetLife Stadium', cityZh: '东卢瑟福', cityEn: 'East Rutherford', stage: 'group' },
  { id: 3, date: '2026-06-12', dateLabel: '2026年6月12日 星期五', dateLabelEn: 'Friday, June 12, 2026', time: '09:00', homeFlag: '🇨🇦', homeNameZh: '加拿大', homeNameEn: 'Canada', awayFlag: '🇭🇷', awayNameZh: '克罗地亚', awayNameEn: 'Croatia', group: 'B', venueZh: 'BMO球场', venueEn: 'BMO Field', cityZh: '多伦多', cityEn: 'Toronto', stage: 'group' },
  // June 13 (Saturday)
  { id: 4, date: '2026-06-13', dateLabel: '2026年6月13日 星期六', dateLabelEn: 'Saturday, June 13, 2026', time: '00:00', homeFlag: '🇪🇸', homeNameZh: '西班牙', homeNameEn: 'Spain', awayFlag: '🇺🇾', awayNameZh: '乌拉圭', awayNameEn: 'Uruguay', group: 'C', venueZh: '硬石体育场', venueEn: 'Hard Rock Stadium', cityZh: '迈阿密', cityEn: 'Miami', stage: 'group' },
  { id: 5, date: '2026-06-13', dateLabel: '2026年6月13日 星期六', dateLabelEn: 'Saturday, June 13, 2026', time: '03:00', homeFlag: '🇧🇷', homeNameZh: '巴西', homeNameEn: 'Brazil', awayFlag: '🇩🇪', awayNameZh: '德国', awayNameEn: 'Germany', group: 'C', venueZh: 'AT&T球场', venueEn: 'AT&T Stadium', cityZh: '阿灵顿', cityEn: 'Arlington', stage: 'group' },
  { id: 6, date: '2026-06-13', dateLabel: '2026年6月13日 星期六', dateLabelEn: 'Saturday, June 13, 2026', time: '06:00', homeFlag: '🇲🇦', homeNameZh: '摩洛哥', homeNameEn: 'Morocco', awayFlag: '🇯🇵', awayNameZh: '日本', awayNameEn: 'Japan', group: 'D', venueZh: '林肯金融球场', venueEn: 'Lincoln Financial Field', cityZh: '费城', cityEn: 'Philadelphia', stage: 'group' },
  // June 14 (Sunday)
  { id: 7, date: '2026-06-14', dateLabel: '2026年6月14日 星期日', dateLabelEn: 'Sunday, June 14, 2026', time: '00:00', homeFlag: '🇩🇪', homeNameZh: '德国', homeNameEn: 'Germany', awayFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', awayNameZh: '苏格兰', awayNameEn: 'Scotland', group: 'D', venueZh: '梅赛德斯-奔驰体育场', venueEn: 'Mercedes-Benz Stadium', cityZh: '亚特兰大', cityEn: 'Atlanta', stage: 'group' },
  { id: 8, date: '2026-06-14', dateLabel: '2026年6月14日 星期日', dateLabelEn: 'Sunday, June 14, 2026', time: '03:00', homeFlag: '🇫🇷', homeNameZh: '法国', homeNameEn: 'France', awayFlag: '🇸🇳', awayNameZh: '塞内加尔', awayNameEn: 'Senegal', group: 'E', venueZh: 'SoFi体育场', venueEn: 'SoFi Stadium', cityZh: '洛杉矶', cityEn: 'Los Angeles', stage: 'group' },
  { id: 9, date: '2026-06-14', dateLabel: '2026年6月14日 星期日', dateLabelEn: 'Sunday, June 14, 2026', time: '06:00', homeFlag: '🇳🇱', homeNameZh: '荷兰', homeNameEn: 'Netherlands', awayFlag: '🇦🇹', awayNameZh: '奥地利', awayNameEn: 'Austria', group: 'E', venueZh: '达拉斯体育场', venueEn: 'Cotton Bowl', cityZh: '达拉斯', cityEn: 'Dallas', stage: 'group' },
]

// ─── Venues list ───
const venues = computed(() => {
  const set = new Set<string>()
  allMatches.forEach(m => set.add(locale.value === 'zh' ? m.venueZh : m.venueEn))
  return Array.from(set)
})

// ─── Available dates ───
const availableDates = computed(() => {
  const set = new Set<string>()
  allMatches.forEach(m => set.add(locale.value === 'zh' ? m.dateLabel.split(' ')[0] : m.dateLabelEn))
  return Array.from(set)
})

// ─── Match dates for calendar highlighting ───
const matchDays = new Set([1, 2, 3, 4, 5, 7, 8, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 24, 25, 26, 27, 28, 29])

// ─── Filtered Matches ───
const filteredMatches = computed(() => {
  let result = [...allMatches]
  if (selectedStageTab.value === 'group') {
    result = result.filter(m => m.stage === 'group')
  } else if (selectedStageTab.value === 'knockout') {
    result = result.filter(m => m.stage !== 'group')
  }
  if (selectedGroup.value) {
    result = result.filter(m => m.group === selectedGroup.value)
  }
  if (selectedVenue.value) {
    result = result.filter(m => (locale.value === 'zh' ? m.venueZh : m.venueEn) === selectedVenue.value)
  }
  return result
})

// ─── Grouped by date ───
const groupedMatches = computed(() => {
  const map: Record<string, Match[]> = {}
  filteredMatches.value.forEach(m => {
    const key = locale.value === 'zh' ? m.dateLabel : m.dateLabelEn
    if (!map[key]) map[key] = []
    map[key].push(m)
  })
  return map
})

// ─── Calendar Logic ───
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

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

  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, hasMatch: false, isSelected: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const hasMatch = month === 6 ? matchDays.has(d) : (month === 7 && d <= 19)
    cells.push({
      day: d,
      hasMatch,
      isSelected: d === selectedCalendarDay.value && month === 6,
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
useHead({
  title: () => `${t('schedule.title')} - WorldCupDex`,
})
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
  overflow: hidden;
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
.predict-btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 18px;
  border: 1.5px solid #FFD700;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #000F49;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.predict-btn:hover {
  background: #FFD700;
  color: #000F49;
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

/* ===== Info Bar ===== */
.info-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 20px 0;
  margin-top: 32px;
}
.info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 0 24px;
  border-right: 1px solid #F0F0F0;
}
.info-item:last-child {
  border-right: none;
}
.info-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 1px;
}
.info-title {
  font-size: 13px;
  font-weight: 700;
  color: #000F49;
}
.info-desc {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
@media (max-width: 768px) {
  .info-bar {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 16px;
  }
  .info-item {
    border-right: none;
    padding: 0;
  }
}
</style>
