<template>
  <div style="background: #FAFAFA; min-height: 100vh;">
    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center" style="min-height: 60vh;">
      <div class="animate-spin w-10 h-10 border-4 border-gray-200 border-t-[#FFD700] rounded-full"></div>
    </div>
    <!-- Error -->
    <div v-else-if="error" class="flex flex-col items-center justify-center" style="min-height: 60vh;">
      <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
      <p style="font-size: 18px; color: #666;">{{ error.statusCode === 404 ? '找不到该球队' : '加载失败' }}</p>
      <NuxtLinkLocale to="/teams" style="margin-top: 16px; color: #000F49; font-weight: 600;">返回球队列表</NuxtLinkLocale>
    </div>
    <!-- Content -->
    <template v-else-if="team">
    <!-- Breadcrumb -->
    <div class="max-w-7xl mx-auto px-4 lg:px-8" style="padding-top: 20px; padding-bottom: 16px;">
      <nav style="font-size: 13px; color: #999;">
        <NuxtLinkLocale to="/" class="hover:text-[#000F49] transition-colors">{{ $t('nav.home') }}</NuxtLinkLocale>
        <span style="margin: 0 6px;">&gt;</span>
        <NuxtLinkLocale to="/teams" class="hover:text-[#000F49] transition-colors">{{ $t('teams.title') }}</NuxtLinkLocale>
        <span style="margin: 0 6px;">&gt;</span>
        <span style="color: #666;">{{ locale === 'en' ? team.nameEn : team.nameZh }}</span>
      </nav>
    </div>

    <!-- Hero Banner -->
    <div class="max-w-7xl mx-auto px-4 lg:px-8" style="padding-bottom: 24px;">
      <div class="relative overflow-hidden" style="background: #000F49; border-radius: 16px;">
        <!-- Background decoration -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute right-0 top-0 bottom-0 w-1/2" style="background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.05) 100%);"></div>
        </div>
        <div style="padding: 32px 32px; position: relative; z-index: 10;">
        <div class="hero-layout">
          <!-- Left: Flag + Info -->
          <div class="hero-main">
            <!-- Flag -->
            <img
              :src="`https://flagcdn.com/w160/${team.code}.png`"
              :alt="team.nameEn"
              class="hero-flag"
              style="width: 120px; height: 80px; object-fit: cover; border: 3px solid rgba(255,255,255,0.9); border-radius: 8px; flex-shrink: 0;"
            />
            <div style="flex: 1;">
              <!-- Names -->
              <h1 class="font-bold text-white" style="font-family: 'Montserrat', sans-serif; font-size: 36px; line-height: 1.2; margin-bottom: 4px;">
                {{ locale === 'en' ? team.nameEn : team.nameZh }}
              </h1>
              <p style="font-size: 18px; color: rgba(255,255,255,0.75); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                {{ locale === 'en' ? team.nameZh : team.nameEn }}
                <svg class="w-5 h-5 text-blue-400" style="flex-shrink: 0;" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              </p>
              <!-- Key Stats Row -->
              <div style="display: flex; flex-wrap: wrap; gap: 24px;">
                <div>
                  <div style="font-size: 13px; color: rgba(255,255,255,0.55);">{{ $t('teams.fifaRanking') }}</div>
                  <div class="font-bold text-white" style="font-size: 16px;">#{{ team.fifaRank }}</div>
                </div>
                <div>
                  <div style="font-size: 13px; color: rgba(255,255,255,0.55);">{{ $t('teams.confederation') }}</div>
                  <div class="font-bold text-white" style="font-size: 16px;">{{ team.confederation }}</div>
                </div>
                <div>
                  <div style="font-size: 13px; color: rgba(255,255,255,0.55);">{{ $t('teams.founded') }}</div>
                  <div class="font-bold text-white" style="font-size: 16px;">{{ team.founded }}</div>
                </div>
              </div>
            </div>
          </div>
          <!-- Right: Group Card -->
          <div class="hero-group-card">
            <div class="rounded-xl p-4" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <span class="text-white font-bold" style="font-size: 14px;">{{ $t('teams.worldCupGroup') }}</span>
                <span style="background: #E53935; color: white; padding: 2px 12px; border-radius: 999px; font-size: 12px; font-weight: 700;">{{ team.group }}{{ locale === 'zh' ? '组' : '' }}</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div
                  v-for="mate in groupTeams"
                  :key="mate.code"
                  style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px;"
                  :style="mate.code === team.code ? 'background: rgba(255,255,255,0.12);' : ''"
                >
                  <img :src="`https://flagcdn.com/w40/${mate.code}.png`" :alt="mate.nameEn" style="width: 24px; height: 16px; object-fit: cover; border-radius: 2px;" />
                  <span class="text-white" :class="mate.code === team.code ? 'font-bold' : ''" style="font-size: 13px;">
                    {{ locale === 'en' ? mate.nameEn : mate.nameZh }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <!-- Fan Actions -->
      <div class="flex flex-wrap items-center gap-3 mb-6">
        <NuxtLinkLocale
          :to="`/fan-card?team=${team.code}`"
          class="inline-flex items-center gap-2 font-bold hover:opacity-90 transition-opacity"
          style="background: #FFD700; color: #000F49; font-family: 'Montserrat', sans-serif; font-size: 14px; border-radius: 8px; padding: 10px 20px;"
        >
          ⚽ {{ $t('teams.becomeFan', { team: locale === 'en' ? team.nameEn : team.nameZh }) }}
        </NuxtLinkLocale>
        <!-- Fanatics Affiliate Placeholder -->
        <a
          href="#"
          class="inline-flex items-center gap-2 font-semibold hover:opacity-90 transition-opacity"
          style="border: 1px solid #FFD700; color: #FFD700; font-family: 'Inter', sans-serif; font-size: 14px; border-radius: 8px; padding: 10px 20px; background: transparent;"
        >
          👕 {{ $t('fanCard.buyJersey', { team: locale === 'en' ? team.nameEn : team.nameZh }) }}
        </a>
      </div>
      <!-- Top: Team Info + Key Stats (two-column) -->
      <div class="info-stats-grid">
        <!-- Left: Team Info Card -->
        <div class="bg-white rounded-xl p-6" style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <h3 class="font-bold mb-5" style="font-family: 'Montserrat', sans-serif; font-size: 16px; color: #000F49;">{{ $t('teams.teamInfo') }}</h3>
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <span style="font-size: 18px;">📅</span>
              <div class="flex-1 flex items-center justify-between">
                <span style="font-size: 14px; color: #666;">{{ $t('teams.founded') }}</span>
                <span class="font-semibold" style="font-size: 14px; color: #333;">{{ team.founded }}{{ locale === 'zh' ? '年' : '' }}</span>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span style="font-size: 18px;">👔</span>
              <div class="flex-1">
                <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                  <span style="font-size: 14px; color: #666; white-space: nowrap; flex-shrink: 0;">{{ $t('teams.headCoach') }}</span>
                  <span class="font-semibold" style="font-size: 14px; color: #333; text-align: right;">{{ locale === 'en' ? team.coach.nameEn : team.coach.nameZh }}</span>
                </div>
                <div style="font-size: 12px; color: #999; text-align: right;">{{ locale === 'en' ? team.coach.nameZh : team.coach.nameEn }}</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span style="font-size: 18px;">🌐</span>
              <div class="flex-1 flex items-center justify-between">
                <span style="font-size: 14px; color: #666;">{{ $t('teams.confederation') }}</span>
                <span class="font-semibold" style="font-size: 14px; color: #333;">{{ team.confederation }}</span>
              </div>
            </div>
            <div v-if="team.venue" class="flex items-center gap-3">
              <span style="font-size: 18px;">🏟️</span>
              <div class="flex-1">
                <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                  <span style="font-size: 14px; color: #666; white-space: nowrap; flex-shrink: 0;">{{ $t('teams.homeStadium') }}</span>
                  <span class="font-semibold" style="font-size: 14px; color: #333; text-align: right;">{{ team.venue }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Key Stats Card -->
        <div class="bg-white rounded-xl p-6" style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <h3 class="font-bold mb-5" style="font-family: 'Montserrat', sans-serif; font-size: 16px; color: #000F49;">{{ $t('teams.keyStats') }}</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; text-align: center;">
            <div style="padding: 12px; background: #FFFBEA; border-radius: 12px;">
              <div class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 32px; color: #FFD700;">#{{ team.fifaRank }}</div>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">{{ $t('teams.fifaRanking') }}</div>
            </div>
            <div style="padding: 12px; background: #EEF2FF; border-radius: 12px;">
              <div class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 32px; color: #000F49;">{{ team.group }}</div>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">{{ $t('teams.worldCupGroup') }}</div>
            </div>
            <div style="padding: 12px; background: #F0FDF4; border-radius: 12px;">
              <div class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 32px; color: #16A34A;">{{ team.squad?.length || 0 }}</div>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">{{ locale === 'en' ? 'Squad Size' : '球队人数' }}</div>
            </div>
            <div style="padding: 12px; background: #FFF1F2; border-radius: 12px;">
              <div class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 32px; color: #E11D48;">{{ averageAge }}</div>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">{{ locale === 'en' ? 'Avg Age' : '平均年龄' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: Full Squad -->
      <div class="bg-white rounded-xl p-6 mt-6" style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 18px; color: #000F49;">
            {{ $t('teams.squad') }} ({{ team.squad?.length || 0 }})
          </h3>
          <!-- Position Filter -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="pos in positionGroups"
              :key="pos.key"
              :class="['btn btn-sm', selectedPosition === pos.key ? 'btn-primary' : 'btn-ghost']"
              style="border-radius: 999px;"
              @click="selectedPosition = pos.key"
            >
              {{ pos.label }} ({{ pos.count }})
            </button>
          </div>
        </div>

        <!-- Player Grid -->
        <div class="player-grid">
          <div
            v-for="player in filteredSquad"
            :key="player.name"
            class="bg-base-100 rounded-xl p-4 flex flex-col items-center text-center transition-shadow hover:shadow-md"
            style="border: 1px solid #f0f0f0;"
          >
            <!-- Player Photo -->
            <div class="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center mb-3 flex-shrink-0" style="background: rgba(0,15,73,0.08);">
              <img
                v-if="player.photo && !photoErrors.has(player.name)"
                :src="player.photo"
                :alt="player.name"
                class="w-full h-full object-cover"
                loading="lazy"
                @error="() => photoErrors.add(player.name)"
              />
              <img
                v-else
                :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=000F49&color=fff&size=128`"
                :alt="player.name"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <!-- Player Name -->
            <div class="font-semibold truncate w-full" style="font-size: 14px; color: #333;">{{ getPlayerDisplayName(player).primary }}</div>
            <div v-if="getPlayerDisplayName(player).secondary" class="truncate w-full" style="font-size: 12px; color: #999; margin-top: 2px;">{{ getPlayerDisplayName(player).secondary }}</div>
            <!-- Position Badge -->
            <span
              class="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
              :style="{ background: getPositionColor(player.position) }"
            >
              {{ locale === 'en' ? player.position : player.positionZh }}
            </span>
            <!-- Age & Nationality -->
            <div class="flex items-center gap-3 mt-2" style="font-size: 12px; color: #666;">
              <span>{{ getPlayerAge(player.dateOfBirth) }}{{ locale === 'zh' ? '岁' : '' }}</span>
              <span>{{ player.nationality }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { TeamDetail, SquadPlayer } from '~/types'

const { t, locale } = useI18n()
const route = useRoute()

const teamId = computed(() => route.params.id as string)

// Fetch team detail from API
const { data: team, pending, error } = useTeamDetail(teamId)

const selectedPosition = ref('all')

// Track photo load errors for fallback
const photoErrors = reactive(new Set<string>())

// Group teams (from same group)
const groupTeams = computed(() => {
  if (!team.value) return []
  return [{ nameZh: team.value.nameZh, nameEn: team.value.nameEn, code: team.value.code }]
})

// Player name display logic
function getPlayerDisplayName(player: SquadPlayer) {
  const hasChineseName = player.nameZh && player.nameZh !== player.name
  if (locale.value === 'en') {
    return {
      primary: player.name,
      secondary: hasChineseName ? player.nameZh : ''
    }
  }
  if (hasChineseName) {
    return {
      primary: player.nameZh,
      secondary: player.name
    }
  }
  return {
    primary: player.name,
    secondary: ''
  }
}

// Calculate player age from dateOfBirth
function getPlayerAge(dateOfBirth: string): number | string {
  if (!dateOfBirth) return '-'
  const birth = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Calculate average age
const averageAge = computed(() => {
  const squad = team.value?.squad || []
  if (squad.length === 0) return '-'
  const ages = squad
    .map(p => getPlayerAge(p.dateOfBirth))
    .filter((a): a is number => typeof a === 'number')
  if (ages.length === 0) return '-'
  return (ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(1)
})

// Position color mapping
function getPositionColor(position: string): string {
  if (position === 'Goalkeeper') return '#16A34A'
  if (isDefender(position)) return '#2563EB'
  if (isMidfielder(position)) return '#EA580C'
  if (isForward(position)) return '#DC2626'
  return '#6B7280'
}

// Position groups for filter
const positionGroups = computed(() => {
  const squad = team.value?.squad || []
  const groups = [
    { key: 'all', label: locale.value === 'en' ? 'All' : '全部', count: squad.length },
    { key: 'Goalkeeper', label: locale.value === 'en' ? 'GK' : '门将', count: squad.filter(p => p.position === 'Goalkeeper').length },
    { key: 'Defence', label: locale.value === 'en' ? 'DEF' : '后卫', count: squad.filter(p => isDefender(p.position)).length },
    { key: 'Midfield', label: locale.value === 'en' ? 'MID' : '中场', count: squad.filter(p => isMidfielder(p.position)).length },
    { key: 'Attack', label: locale.value === 'en' ? 'FWD' : '前锋', count: squad.filter(p => isForward(p.position)).length },
  ]
  return groups.filter(g => g.key === 'all' || g.count > 0)
})

function isDefender(pos: string) {
  return pos === 'Defence' || pos.includes('Back') || pos.includes('Centre-Back')
}

function isMidfielder(pos: string) {
  return pos === 'Midfield' || pos.includes('Midfield')
}

function isForward(pos: string) {
  return pos === 'Offence' || pos.includes('Forward') || pos.includes('Winger') || pos === 'Centre-Forward'
}

const filteredSquad = computed(() => {
  const squad = team.value?.squad || []
  if (selectedPosition.value === 'all') return squad
  if (selectedPosition.value === 'Goalkeeper') return squad.filter(p => p.position === 'Goalkeeper')
  if (selectedPosition.value === 'Defence') return squad.filter(p => isDefender(p.position))
  if (selectedPosition.value === 'Midfield') return squad.filter(p => isMidfielder(p.position))
  if (selectedPosition.value === 'Attack') return squad.filter(p => isForward(p.position))
  return squad
})

// SEO - dynamic based on team data
watchEffect(() => {
  if (team.value) {
    const teamName = locale.value === 'en' ? team.value.nameEn : team.value.nameZh
    useSeoConfig({
      title: `${teamName} - WorldCupDex`,
      description: `${teamName}的详细资料，包括FIFA排名#${team.value.fifaRank}、${team.value.group}组小组赛、教练、阵容名单等信息。`,
      ogType: 'article',
    })
  }
})
</script>

<style scoped>
/* Hero layout */
.hero-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.hero-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  flex: 1;
}
.hero-group-card {
  width: 100%;
  min-width: 220px;
}

@media (min-width: 768px) {
  .hero-main {
    flex-direction: row;
    align-items: center;
  }
}

@media (min-width: 1024px) {
  .hero-layout {
    flex-direction: row;
    align-items: center;
    gap: 40px;
  }
  .hero-group-card {
    width: auto;
    flex-shrink: 0;
  }
}

/* Info + Stats two-column grid */
.info-stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .info-stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Player card grid */
.player-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .player-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .player-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .player-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
