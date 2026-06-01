<template>
  <div style="background: #FAFAFA; min-height: 100vh;">
    <!-- JSON-LD SportsTeam Schema -->
    <SchemaOrg
      v-if="team"
      type="SportsTeam"
      :data="sportsTeamSchemaData"
    />
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
      <BreadcrumbSchema :items="breadcrumbItems" separator=">" />
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
              loading="lazy"
              decoding="async"
            />
            <div style="flex: 1;">
              <!-- Names -->
              <div class="flex items-center gap-3 mb-1">
                <h1 class="font-bold text-white" style="font-family: 'Montserrat', sans-serif; font-size: 36px; line-height: 1.2;">
                  {{ locale === 'en' ? team.nameEn : team.nameZh }}
                </h1>
                <button 
                  v-if="isLoaded"
                  class="p-2 text-2xl hover:scale-110 transition-transform focus:outline-none"
                  :class="isTeamFavorited(team.nameEn) ? 'text-yellow-500 drop-shadow-md' : 'text-gray-200 grayscale opacity-40 hover:opacity-80 hover:grayscale-0'"
                  @click.prevent="toggleTeam(team.nameEn)"
                  title="Favorite Team"
                >⭐</button>
              </div>
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
                  <img :src="`https://flagcdn.com/w40/${mate.code}.png`" :alt="mate.nameEn" style="width: 24px; height: 16px; object-fit: cover; border-radius: 2px;" loading="lazy" decoding="async" />
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
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      <DataSourceNote kind="team" compact />
    </div>

    <!-- Content Area -->
    <div class="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <!-- Fan Actions -->
      <div class="flex flex-wrap items-center gap-3 mb-6">
        <NuxtLinkLocale
          :to="`/fan-card?team=${team.id}`"
          class="inline-flex items-center gap-2 font-bold hover:opacity-90 transition-opacity"
          style="background: #FFD700; color: #000F49; font-family: 'Montserrat', sans-serif; font-size: 14px; border-radius: 8px; padding: 10px 20px;"
        >
          ⚽ {{ $t('teams.becomeFan', { team: locale === 'en' ? team.nameEn : team.nameZh }) }}
        </NuxtLinkLocale>
        <NuxtLinkLocale
          :to="`/teams/${team.id}/schedule`"
          class="inline-flex items-center gap-2 font-bold hover:opacity-90 transition-opacity"
          style="background: #000F49; color: white; font-family: 'Montserrat', sans-serif; font-size: 14px; border-radius: 8px; padding: 10px 20px;"
        >
          📅 {{ locale === 'zh' ? '查看球队赛程' : 'Team Schedule' }}
        </NuxtLinkLocale>
        <NuxtLinkLocale
          :to="`/teams/${team.id}/world-cup-2026-route`"
          class="inline-flex items-center gap-2 font-bold hover:opacity-90 transition-opacity"
          style="background: #FFF7C2; color: #000F49; border: 1px solid #FFD700; font-family: 'Montserrat', sans-serif; font-size: 14px; border-radius: 8px; padding: 10px 20px;"
        >
          {{ locale === 'zh' ? '追踪球队路线' : 'Track Team Route' }}
        </NuxtLinkLocale>
      </div>

      <!-- SEO / Intro text -->
      <div class="mb-6 p-5 rounded-xl bg-white" style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h2 class="font-bold text-xl mb-2" style="color: #000F49; font-family: 'Montserrat', sans-serif;">
          {{ locale === 'en' ? `About ${team.nameEn} National Football Team` : `关于${team.nameZh}国家队` }}
        </h2>
        <p style="color: #666; font-size: 15px; line-height: 1.6;">
          {{ locale === 'en' 
            ? `The ${team.nameEn} national football team is gearing up for the 2026 World Cup. Currently ranked #${team.fifaRank} by FIFA, they are placed in Group ${team.group}. Follow the latest ${team.nameEn} World Cup news, explore their full squad roster below, and gear up to support them in the upcoming tournament.`
            : `${team.nameZh}国家队正积极备战2026年世界杯。目前FIFA世界排名第${team.fifaRank}位，在本次赛事中分在${team.group}组。在这里你可以查看${team.nameZh}队最新的世界杯大名单、主教练信息、赛程以及专属球迷周边。`
          }}
        </p>
      </div>

      <TeamMerchMoment
        :teams="[{
          id: team.id,
          name: locale === 'en' ? team.nameEn : team.nameZh,
          flag: `https://flagcdn.com/w80/${team.code}.png`,
        }]"
        context="team"
        variant="inline"
      />
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
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 18px; color: #000F49;">
                {{ $t('teams.squad') }} ({{ team.squad?.length || 0 }})
              </h3>
              <span class="squad-status-pill" :class="`squad-status-pill--${team.squadStatus}`">
                {{ squadStatusLabel }}
              </span>
            </div>
            <p class="squad-status-note">
              {{ squadStatusNote }}
              <span v-if="team.squadLastUpdated"> {{ squadUpdatedLabel }} {{ team.squadLastUpdated }}</span>
            </p>
          </div>
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
            class="bg-base-100 rounded-xl p-4 flex flex-col items-center text-center transition-shadow hover:shadow-md cursor-pointer"
            style="border: 1px solid #f0f0f0;"
            @click="openPlayerModal(player)"
          >
            <!-- Player Photo -->
            <div class="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center mb-3 flex-shrink-0" style="background: rgba(0,15,73,0.08);">
              <img
                v-if="player.photo && !photoErrors.has(player.name)"
                :src="player.photo"
                :alt="player.name"
                class="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                @error="() => photoErrors.add(player.name)"
              />
              <img
                v-else
                :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=000F49&color=fff&size=128`"
                :alt="player.name"
                class="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
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

      <!-- Player Detail Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="selectedPlayer"
            class="player-modal-overlay"
            @click.self="closePlayerModal"
          >
            <div class="player-modal">
              <!-- Close Button -->
              <button class="player-modal__close" @click="closePlayerModal">✕</button>

              <!-- Player Photo -->
              <div class="player-modal__photo-wrap">
                <img
                  v-if="selectedPlayer.photo && !photoErrors.has(selectedPlayer.name)"
                  :src="selectedPlayer.photo"
                  :alt="selectedPlayer.name"
                  class="player-modal__photo"
                  @error="() => photoErrors.add(selectedPlayer!.name)"
                />
                <img
                  v-else
                  :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPlayer.name)}&background=000F49&color=fff&size=256`"
                  :alt="selectedPlayer.name"
                  class="player-modal__photo"
                />
              </div>

              <!-- Name -->
              <div class="player-modal__name">
                {{ getPlayerDisplayName(selectedPlayer).primary }}
              </div>
              <div v-if="getPlayerDisplayName(selectedPlayer).secondary" class="player-modal__name-sub">
                {{ getPlayerDisplayName(selectedPlayer).secondary }}
              </div>

              <!-- Position Badge -->
              <span
                class="player-modal__position"
                :style="{ background: getPositionColor(selectedPlayer.position) }"
              >
                {{ locale === 'en' ? selectedPlayer.position : selectedPlayer.positionZh }}
              </span>

              <!-- Info Row -->
              <div class="player-modal__info-row">
                <div class="player-modal__info-item">
                  <span class="player-modal__info-label">{{ locale === 'zh' ? '年龄' : 'Age' }}</span>
                  <span class="player-modal__info-value">{{ getPlayerAge(selectedPlayer.dateOfBirth) }}{{ locale === 'zh' ? '岁' : '' }}</span>
                </div>
                <div class="player-modal__info-item">
                  <span class="player-modal__info-label">{{ locale === 'zh' ? '国籍' : 'Nationality' }}</span>
                  <span class="player-modal__info-value">{{ selectedPlayer.nationality }}</span>
                </div>
                <div v-if="selectedPlayer.shirtNumber" class="player-modal__info-item">
                  <span class="player-modal__info-label">{{ locale === 'zh' ? '号码' : 'No.' }}</span>
                  <span class="player-modal__info-value">#{{ selectedPlayer.shirtNumber }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="player-modal__actions">
                <NuxtLinkLocale
                  :to="`/fan-card?team=${team?.id}&playerName=${encodeURIComponent(selectedPlayer.name)}`"
                  class="player-modal__btn player-modal__btn--fancard"
                  @click="closePlayerModal"
                >
                  ⚽ {{ locale === 'zh' ? '生成球迷身份卡' : 'Generate Fan Card' }}
                </NuxtLinkLocale>
                <a
                  :href="`/api/track-affiliate?teamId=${team?.id}&partner=generic&productName=${encodeURIComponent((locale === 'zh' ? team?.nameZh : team?.nameEn) + ' Jersey')}`"
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  class="player-modal__btn player-modal__btn--jersey"
                >
                  👕 {{ locale === 'zh' ? '购买球衣' : 'Buy Jersey' }}
                </a>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>

    <!-- Narrative Sections: Team Story / Prediction / Group Analysis -->
    <section v-if="narrative" class="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      <article>
        <h2 class="text-2xl font-bold mb-4" style="color: #1a1a1a; font-family: 'Montserrat', sans-serif;">{{ $t('teams.narrative.historyTitle') }}</h2>
        <p class="text-base leading-relaxed whitespace-pre-line" style="color: #374151;">{{ narrative.history }}</p>
      </article>
      <article>
        <h2 class="text-2xl font-bold mb-4" style="color: #1a1a1a; font-family: 'Montserrat', sans-serif;">{{ $t('teams.narrative.predictionTitle') }}</h2>
        <p class="text-base leading-relaxed whitespace-pre-line" style="color: #374151;">{{ narrative.prediction }}</p>
      </article>
      <article>
        <h2 class="text-2xl font-bold mb-4" style="color: #1a1a1a; font-family: 'Montserrat', sans-serif;">{{ $t('teams.narrative.groupAnalysisTitle') }}</h2>
        <p class="text-base leading-relaxed whitespace-pre-line" style="color: #374151;">{{ narrative.groupAnalysis }}</p>
      </article>
    </section>
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

// Team narrative (SEO long-form content)
const narrative = useTeamNarrative(team, locale)
const { isLoaded, toggleTeam, isTeamFavorited } = useFavorites()

const selectedPosition = ref('all')

// Player modal
const selectedPlayer = ref<SquadPlayer | null>(null)

function openPlayerModal(player: SquadPlayer) {
  selectedPlayer.value = player
  if (import.meta.client) document.body.style.overflow = 'hidden'
}

function closePlayerModal() {
  selectedPlayer.value = null
  if (import.meta.client) document.body.style.overflow = ''
}

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

const squadStatusLabel = computed(() => {
  const status = team.value?.squadStatus || 'incomplete'
  if (locale.value === 'zh') {
    return status === 'official' ? '官方 26 人名单' : status === 'provisional' ? '临时名单' : '名单更新中'
  }
  if (locale.value === 'es') {
    return status === 'official' ? 'Plantilla oficial de 26' : status === 'provisional' ? 'Plantilla provisional' : 'Plantilla en actualización'
  }
  return status === 'official' ? 'Official 26-player squad' : status === 'provisional' ? 'Provisional squad' : 'Squad data is being updated'
})

const squadStatusNote = computed(() => {
  const status = team.value?.squadStatus || 'incomplete'
  if (locale.value === 'zh') {
    return status === 'official' ? '名单已根据官方最终公告确认。' : status === 'provisional' ? '名单仍可能在最终确认前调整。' : '当前名单数据尚未补齐，请稍后再查看。'
  }
  if (locale.value === 'es') {
    return status === 'official' ? 'La plantilla esta confirmada con el anuncio oficial final.' : status === 'provisional' ? 'La plantilla puede cambiar antes de la confirmacion final.' : 'Los datos de la plantilla aun se estan actualizando.'
  }
  return status === 'official' ? 'This squad is confirmed from the final official announcement.' : status === 'provisional' ? 'This squad may change before final confirmation.' : 'This squad dataset is still being completed.'
})

const squadUpdatedLabel = computed(() => {
  if (locale.value === 'zh') return '更新时间：'
  if (locale.value === 'es') return 'Actualizado:'
  return 'Updated:'
})

// SEO - dynamic based on team data
const seoTeamName = computed(() =>
  team.value ? (locale.value === 'en' ? team.value.nameEn : team.value.nameZh) : 'WorldCupDex',
)
const seoTitle = computed(() => {
  if (!team.value) return 'WorldCupDex'
  if (locale.value === 'en') {
    return `${team.value.nameEn} World Cup 2026 Roster & Stats | WorldCupDex`
  }
  return `${team.value.nameZh}国家队 - 2026世界杯阵容名单与赛程 | WorldCupDex`
})
const seoDescription = computed(() => {
  if (!team.value) return ''
  if (locale.value === 'en') {
    return `Get the latest on the ${team.value.nameEn} World Cup team. View the ${team.value.nameEn} 2026 squad roster, FIFA rank #${team.value.fifaRank}, Group ${team.value.group} standings, and fan gear.`
  }
  return `${team.value.nameZh}国家队2026世界杯详细资料：FIFA最新排名第${team.value.fifaRank}位，分在${team.value.group}组。查看最新大名单、首发阵容及球迷周边。`
})
const seoOgImage = computed(() =>
  team.value ? `https://flagcdn.com/w320/${team.value.code}.png` : '',
)
const breadcrumbItems = computed(() => team.value ? [
  { name: t('nav.home'), path: '/' },
  { name: t('teams.title'), path: '/teams' },
  { name: seoTeamName.value, path: `/teams/${team.value.id}` },
] : [])
useSeoConfig({ title: seoTitle, description: seoDescription, ogImage: seoOgImage, ogType: 'profile' })

// JSON-LD SportsTeam schema data
const sportsTeamSchemaData = computed(() => {
  if (!team.value) return {}
  return {
    name: team.value.nameEn,
    alternateName: team.value.nameZh,
    sport: 'Football',
    logo: `https://flagcdn.com/w160/${team.value.code}.png`,
    foundingDate: team.value.founded ? String(team.value.founded) : undefined,
    member: (team.value.squad || []).map((p: SquadPlayer) => ({
      '@type': 'Person',
      name: p.name,
      nationality: p.nationality,
    })),
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

.squad-status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}
.squad-status-pill--official {
  background: #DCFCE7;
  color: #166534;
}
.squad-status-pill--provisional {
  background: #FEF3C7;
  color: #92400E;
}
.squad-status-pill--incomplete {
  background: #FEE2E2;
  color: #991B1B;
}
.squad-status-note {
  margin-top: 5px;
  color: #6B7280;
  font-size: 12px;
  line-height: 1.5;
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

<style>
/* Player Modal - 非 scoped，Teleport 挂载到 body 外部需要全局样式 */
.player-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.player-modal {
  position: relative;
  background: #ffffff;
  border-radius: 20px;
  padding: 32px 28px 28px;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
.player-modal__close {
  position: absolute;
  top: 14px;
  right: 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.15s;
}
.player-modal__close:hover { background: #e5e7eb; }
.player-modal__photo-wrap {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #f0f0f0;
  background: rgba(0, 15, 73, 0.08);
  flex-shrink: 0;
  margin-bottom: 14px;
}
.player-modal__photo { width: 100%; height: 100%; object-fit: cover; }
.player-modal__name {
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  text-align: center;
  margin-bottom: 2px;
}
.player-modal__name-sub {
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
  margin-bottom: 8px;
}
.player-modal__position {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 18px;
}
.player-modal__info-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}
.player-modal__info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.player-modal__info-label {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.player-modal__info-value {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}
.player-modal__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.player-modal__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 11px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;
  border: none;
}
.player-modal__btn:hover { opacity: 0.88; }
.player-modal__btn--fancard { background: #FFD700; color: #000F49; }
.player-modal__btn--jersey { background: #000F49; color: #ffffff; }
/* Transition */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .player-modal,
.modal-leave-active .player-modal { transition: transform 0.2s ease; }
.modal-enter-from .player-modal,
.modal-leave-to .player-modal { transform: scale(0.94) translateY(8px); }
</style>
