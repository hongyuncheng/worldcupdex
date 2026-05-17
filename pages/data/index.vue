<template>
  <div>
    <!-- Hero Section -->
    <div style="background: linear-gradient(135deg, #000F49 0%, #001A6E 50%, #0D2B85 100%); padding: 48px 0; position: relative; overflow: hidden;">
      <!-- Decorative elements -->
      <div style="position: absolute; top: -60px; right: -60px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%);"></div>
      <div style="position: absolute; bottom: -40px; right: 100px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%);"></div>
      <div class="max-w-7xl mx-auto px-4">
        <h1 style="font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 800; color: white; margin: 0 0 8px;">
          {{ $t('dataCenter.title') }}
        </h1>
        <p style="color: rgba(255,255,255,0.7); font-size: 15px; margin: 0 0 24px;">
          {{ $t('dataCenter.subtitle') }}
        </p>
        <!-- Search box -->
        <div style="display: flex; gap: 8px; max-width: 400px;">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('dataCenter.searchPlaceholder')"
            style="flex: 1; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 10px 16px; color: white; font-size: 14px; outline: none;"
          />
          <button style="background: #2563EB; border: none; border-radius: 8px; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div style="background: #FAFAFA;">
      <div class="stats-grid max-w-7xl mx-auto px-4" style="padding: 32px 16px;">
        <div v-for="stat in statsCards" :key="stat.label" style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 20px 24px; display: flex; align-items: center; gap: 16px;">
          <div :style="{ width: '48px', height: '48px', borderRadius: '50%', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: '0' }">
            {{ stat.icon }}
          </div>
          <div>
            <div style="font-size: 12px; color: #999; margin-bottom: 4px;">{{ $t(stat.label) }}</div>
            <div style="font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 800; color: #000F49; line-height: 1;">{{ stat.value }}</div>
            <div style="font-size: 12px; color: #999; margin-top: 4px;">{{ stat.sub }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main 3-column layout -->
    <div class="max-w-7xl mx-auto px-4" style="padding-bottom: 40px;">
      <div class="data-main-layout">
        <!-- Left Sidebar -->
        <aside class="data-sidebar">
          <div style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 16px; flex: 1;">
          <button style="background: #2563EB; color: white; border: none; border-radius: 8px; padding: 10px 16px; width: 100%; text-align: left; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
            📊 {{ $t('dataCenter.overview') }}
          </button>

          <!-- Core Data -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 12px; color: #999; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">{{ $t('dataCenter.coreData') }}</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <a
                v-for="item in coreDataMenu"
                :key="item.key"
                :class="{ 'nav-active': activeNav === item.key }"
                class="sidebar-nav-item"
                @click="activeNav = item.key"
              >
                <span style="font-size: 16px;">{{ item.icon }}</span> {{ $t(item.label) }}
              </a>
            </div>
          </div>

          <!-- Deep Analysis -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 12px; color: #999; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">{{ $t('dataCenter.deepAnalysis') }}</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <a
                v-for="item in analysisMenu"
                :key="item.key"
                :class="{ 'nav-active': activeNav === item.key }"
                class="sidebar-nav-item"
                @click="activeNav = item.key"
              >
                <span style="font-size: 16px;">{{ item.icon }}</span> {{ $t(item.label) }}
              </a>
            </div>
          </div>

          <!-- Data Download -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 12px; color: #999; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">{{ $t('dataCenter.dataDownload') }}</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <a class="sidebar-nav-item" @click="activeNav = 'export'">
                <span style="font-size: 16px;">⬇️</span> {{ $t('dataCenter.exportData') }}
              </a>
            </div>
          </div>
          </div>
        </aside>

        <!-- Main content area (right of sidebar) -->
        <div class="data-main-content">
          <!-- Row 1: Goals Trend Chart (full width) -->
          <div style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: 700; color: #000F49; margin: 0;">{{ $t('dataCenter.goalTrend') }}</h2>
              <select style="padding: 6px 12px; border: 1px solid #E0E0E0; border-radius: 6px; font-size: 13px; color: #333; background: white;">
                <option>{{ $t('dataCenter.allTournaments') }}</option>
              </select>
            </div>
            <!-- SVG Chart -->
            <div style="position: relative;">
              <!-- Y-axis labels -->
              <div style="position: absolute; left: 0; top: 0; height: 250px; display: flex; flex-direction: column; justify-content: space-between;">
                <span style="font-size: 11px; color: #999;">250</span>
                <span style="font-size: 11px; color: #999;">200</span>
                <span style="font-size: 11px; color: #999;">150</span>
                <span style="font-size: 11px; color: #999;">100</span>
                <span style="font-size: 11px; color: #999;">50</span>
                <span style="font-size: 11px; color: #999;">0</span>
              </div>
              <div style="margin-left: 30px;">
                <svg viewBox="0 0 800 280" style="width: 100%; height: 250px;" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="rgba(37,99,235,0.3)" />
                      <stop offset="100%" stop-color="rgba(37,99,235,0.02)" />
                    </linearGradient>
                  </defs>
                  <!-- Grid lines -->
                  <line v-for="i in 5" :key="'grid'+i" x1="0" :y1="(i-1)*56" x2="800" :y2="(i-1)*56" stroke="#F0F0F0" stroke-width="1" />
                  <!-- Area fill -->
                  <polygon :points="areaPoints" fill="url(#areaGrad)" />
                  <!-- Line -->
                  <polyline :points="linePoints" fill="none" stroke="#2563EB" stroke-width="2" />
                  <!-- Data points -->
                  <circle v-for="(point, i) in chartPoints" :key="'c'+i" :cx="point.x" :cy="point.y" r="3" fill="#2563EB" />
                  <!-- Data labels -->
                  <text v-for="(point, i) in chartPoints" :key="'t'+i" :x="point.x" :y="point.y - 10" text-anchor="middle" style="font-size: 9px; fill: #333;">{{ point.value }}</text>
                </svg>
                <!-- X-axis labels -->
                <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                  <span v-for="d in chartData" :key="d.year" style="font-size: 10px; color: #999;">{{ d.year }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Row 2: Champions Table + Right Cards side by side -->
          <div class="data-row2">
            <!-- Champions Ranking Table -->
            <div class="data-row2-left" style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 24px;">
              <h2 style="font-size: 16px; font-weight: 700; color: #000F49; margin: 0 0 16px;">{{ $t('dataCenter.championsRanking') }}</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 1px solid #E0E0E0;">
                    <th style="text-align: left; padding: 10px 12px; font-size: 13px; color: #999; font-weight: 600;">{{ $t('dataCenter.rank') }}</th>
                    <th style="text-align: left; padding: 10px 12px; font-size: 13px; color: #999; font-weight: 600;">{{ $t('dataCenter.team') }}</th>
                    <th style="text-align: left; padding: 10px 12px; font-size: 13px; color: #999; font-weight: 600;">{{ $t('dataCenter.championships') }}</th>
                    <th style="text-align: left; padding: 10px 12px; font-size: 13px; color: #999; font-weight: 600;">{{ $t('dataCenter.championYears') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="team in champions" :key="team.rank" style="border-bottom: 1px solid #F0F0F0;">
                    <td style="padding: 12px;">{{ team.rank }}</td>
                    <td style="padding: 12px;">
                      <span style="display: flex; align-items: center; gap: 8px;">
                        <img :src="'https://flagcdn.com/w40/' + team.code + '.png'" style="width: 24px; height: 16px; object-fit: cover; border-radius: 2px;" :alt="team.name" />
                        <span style="font-weight: 600; color: #000F49;">{{ team.name }}</span>
                      </span>
                    </td>
                    <td style="padding: 12px; font-weight: 700;">{{ team.count }}</td>
                    <td style="padding: 12px; font-size: 13px; color: #666;">{{ team.years }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="btn-view-more-wrapper">
                <button class="btn-view-more">{{ $t('dataCenter.viewMore') }}</button>
              </div>
            </div>

            <!-- Right Cards -->
            <div class="data-row2-right">
              <!-- Continent Distribution Donut -->
              <div style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 24px;">
                <h3 style="font-size: 15px; font-weight: 700; color: #000F49; margin: 0 0 8px;">{{ $t('dataCenter.continentDistribution') }}</h3>
                <div style="width: 160px; height: 160px; border-radius: 50%; background: conic-gradient(#3B82F6 0deg 147.2deg, #22C55E 147.2deg 343.6deg, #F59E0B 343.6deg 360deg); margin: 20px auto; position: relative;">
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100px; height: 100px; border-radius: 50%; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <span style="font-size: 12px; color: #999;">{{ $t('dataCenter.total') }}</span>
                    <span style="font-size: 22px; font-weight: 800; color: #000F49;">22{{ $t('dataCenter.times') }}</span>
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 16px;">
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                    <span style="width: 12px; height: 12px; border-radius: 2px; background: #3B82F6; flex-shrink: 0;"></span>
                    <span style="color: #333;">{{ $t('dataCenter.southAmerica') }}</span>
                    <span style="margin-left: auto; color: #666;">9{{ $t('dataCenter.times') }} (40.9%)</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                    <span style="width: 12px; height: 12px; border-radius: 2px; background: #22C55E; flex-shrink: 0;"></span>
                    <span style="color: #333;">{{ $t('dataCenter.europe') }}</span>
                    <span style="margin-left: auto; color: #666;">12{{ $t('dataCenter.times') }} (54.5%)</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                    <span style="width: 12px; height: 12px; border-radius: 2px; background: #F59E0B; flex-shrink: 0;"></span>
                    <span style="color: #333;">{{ $t('dataCenter.others') }}</span>
                    <span style="margin-left: auto; color: #666;">1{{ $t('dataCenter.times') }} (4.6%)</span>
                  </div>
                </div>
              </div>

              <!-- Most Goals in Single Tournament -->
              <div style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 24px;">
                <h3 style="font-size: 15px; font-weight: 700; color: #000F49; margin: 0 0 16px;">{{ $t('dataCenter.mostGoals') }}</h3>
                <div style="display: flex; gap: 12px; align-items: center;">
                  <div style="background: #E0E4E8; width: 100px; height: 70px; border-radius: 8px; flex-shrink: 0;"></div>
                  <div>
                    <div style="font-weight: 700; color: #000F49; font-size: 14px; margin-bottom: 4px;">1954年 瑞士世界杯</div>
                    <div style="margin-bottom: 4px;">
                      <span style="font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 800; color: #D4A017;">140</span>
                      <span style="font-size: 13px; color: #666; margin-left: 4px;">{{ $t('dataCenter.goals') }}</span>
                    </div>
                    <div style="font-size: 12px; color: #999;">共26场比赛，场均5.38球</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="bottom-layout" style="margin-top: 32px;">
        <!-- Quick Query -->
        <div class="bottom-left" style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 24px;">
          <h2 style="font-size: 16px; font-weight: 700; color: #000F49; margin: 0 0 16px;">{{ $t('dataCenter.quickQuery') }}</h2>
          <!-- Tab buttons -->
          <div style="display: inline-flex; border: 1px solid #E0E0E0; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
            <button
              v-for="tab in queryTabs"
              :key="tab.key"
              :style="activeQueryTab === tab.key ? 'background: #000F49; color: white; border: none; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;' : 'background: white; color: #333; border: none; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;'"
              @click="activeQueryTab = tab.key"
            >
              {{ $t(tab.label) }}
            </button>
          </div>
          <!-- Selects + button -->
          <div style="display: flex; gap: 12px; align-items: center;">
            <select style="flex: 1; padding: 10px 12px; border: 1px solid #E0E0E0; border-radius: 8px; font-size: 14px; color: #333; background: white;">
              <option>{{ $t('dataCenter.selectTeam') }}</option>
            </select>
            <select style="flex: 1; padding: 10px 12px; border: 1px solid #E0E0E0; border-radius: 8px; font-size: 14px; color: #333; background: white;">
              <option>{{ $t('dataCenter.selectTournament') }}</option>
            </select>
            <button style="background: #000F49; color: white; border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap;">{{ $t('dataCenter.queryData') }}</button>
          </div>
        </div>

        <!-- Data Update -->
        <div class="bottom-right" style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 24px;">
          <h2 style="font-size: 16px; font-weight: 700; color: #000F49; margin: 0 0 16px;">{{ $t('dataCenter.dataUpdate') }}</h2>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: #EBF0FF; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">⏰</div>
            <div>
              <div style="font-size: 12px; color: #999; margin-bottom: 2px;">{{ $t('dataCenter.lastUpdate') }}</div>
              <div style="font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; color: #000F49; margin-bottom: 2px;">2024-05-20 14:30:00</div>
              <div style="font-size: 12px; color: #999;">{{ $t('dataCenter.dataSource') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const searchQuery = ref('')
const activeNav = ref('team')
const activeQueryTab = ref('team')

const statsCards = [
  { icon: '🏆', label: 'dataCenter.editions', value: '22', sub: '1930-2022', bg: '#EBF0FF' },
  { icon: '🏟️', label: 'dataCenter.totalMatches', value: '1,112', sub: '场比赛', bg: '#FFF8E1' },
  { icon: '⚽', label: 'dataCenter.totalGoals', value: '2,886', sub: '粒进球', bg: '#FFF3E0' },
  { icon: '👥', label: 'dataCenter.totalTeams', value: '211', sub: '支球队', bg: '#E8F5E9' },
  { icon: '🧑', label: 'dataCenter.totalPlayers', value: '4,892', sub: '名球员', bg: '#FCE4EC' },
]

const coreDataMenu = [
  { key: 'team', icon: '👥', label: 'dataCenter.teamData' },
  { key: 'player', icon: '🧑', label: 'dataCenter.playerData' },
  { key: 'match', icon: '🏟️', label: 'dataCenter.matchData' },
  { key: 'history', icon: '📜', label: 'dataCenter.historyData' },
]

const analysisMenu = [
  { key: 'goal', icon: '⊕', label: 'dataCenter.goalAnalysis' },
  { key: 'tactics', icon: '⚙️', label: 'dataCenter.tacticsAnalysis' },
  { key: 'performance', icon: '📊', label: 'dataCenter.performanceCompare' },
  { key: 'trend', icon: '📈', label: 'dataCenter.trendAnalysis' },
]

const queryTabs = [
  { key: 'team', label: 'dataCenter.teamQuery' },
  { key: 'player', label: 'dataCenter.playerQuery' },
  { key: 'match', label: 'dataCenter.matchQuery' },
]

const champions = [
  { rank: 1, name: '巴西', code: 'br', count: 5, years: '1958, 1962, 1970, 1994, 2002' },
  { rank: 2, name: '德国', code: 'de', count: 4, years: '1954, 1974, 1990, 2014' },
  { rank: 3, name: '意大利', code: 'it', count: 4, years: '1934, 1938, 1982, 2006' },
  { rank: 4, name: '阿根廷', code: 'ar', count: 2, years: '1978, 1986' },
  { rank: 5, name: '法国', code: 'fr', count: 2, years: '1998, 2018' },
  { rank: 6, name: '乌拉圭', code: 'uy', count: 2, years: '1930, 1950' },
]

const chartData = [
  { year: 1930, goals: 70 }, { year: 1934, goals: 88 }, { year: 1938, goals: 85 },
  { year: 1950, goals: 140 }, { year: 1954, goals: 171 }, { year: 1958, goals: 156 },
  { year: 1962, goals: 171 }, { year: 1966, goals: 161 }, { year: 1970, goals: 171 },
  { year: 1974, goals: 147 }, { year: 1978, goals: 146 }, { year: 1982, goals: 171 },
  { year: 1986, goals: 145 }, { year: 1990, goals: 147 }, { year: 1994, goals: 171 },
  { year: 1998, goals: 152 }, { year: 2002, goals: 145 }, { year: 2006, goals: 169 },
  { year: 2010, goals: 165 }, { year: 2014, goals: 172 }, { year: 2018, goals: 201 },
  { year: 2022, goals: 172 }
]

const chartPoints = computed(() => {
  const maxGoals = 250
  const chartWidth = 800
  const chartHeight = 280
  const padding = 10
  const usableWidth = chartWidth - padding * 2
  const usableHeight = chartHeight - padding * 2

  return chartData.map((d, i) => ({
    x: padding + (i / (chartData.length - 1)) * usableWidth,
    y: padding + usableHeight - (d.goals / maxGoals) * usableHeight,
    value: d.goals
  }))
})

const linePoints = computed(() => {
  return chartPoints.value.map(p => `${p.x},${p.y}`).join(' ')
})

const areaPoints = computed(() => {
  const points = chartPoints.value
  if (points.length === 0) return ''
  const first = points[0]
  const last = points[points.length - 1]
  const lineStr = points.map(p => `${p.x},${p.y}`).join(' ')
  return `${first.x},270 ${lineStr} ${last.x},270`
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.data-main-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 1024px) {
  .data-main-layout {
    flex-direction: row;
    align-items: stretch;
  }
  .data-sidebar {
    width: 180px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
  }
  .data-main-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .data-row2 {
    display: flex;
    flex-direction: row;
    gap: 24px;
    align-items: stretch;
  }
  .data-row2-left {
    flex: 1;
    min-width: 0;
  }
  .data-row2-right {
    width: 300px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.bottom-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 1024px) {
  .bottom-layout {
    flex-direction: row;
    align-items: stretch;
  }
  .bottom-left {
    flex: 3;
  }
  .bottom-right {
    flex: 2;
  }
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #333;
  text-decoration: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.sidebar-nav-item:hover {
  background: #F5F5F5;
}

.nav-active {
  border-left: 3px solid #2563EB;
  background: #F0F4FF !important;
  font-weight: 600;
  color: #000F49;
}
</style>
