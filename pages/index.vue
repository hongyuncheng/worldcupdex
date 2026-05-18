<template>
  <div>
    <!-- JSON-LD Structured Data (Organization + WebSite) -->
    <SchemaOrg type="Organization" :data="organizationData" />
    <SchemaOrg type="WebSite" :data="webSiteData" />

    <!-- Hero Section -->
    <section
      class="relative flex items-center justify-center overflow-hidden hero-section"
    >
      <!-- Background image -->
      <div class="absolute inset-0 hero-background"></div>


      <!-- Content - centered -->
      <div class="relative z-10 text-center">
        <h1
          class="font-bold text-white mb-2"
          style="font-family: 'Montserrat', sans-serif; font-size: 48px; text-shadow: 0 4px 12px rgba(0,0,0,0.3);"
        >
          {{ $t('hero.title') }}
        </h1>
        <p class="text-white mb-6" style="font-family: 'Inter', sans-serif; font-size: 18px;">
          {{ $t('hero.subtitle') }}
        </p>

        <!-- Countdown (ClientOnly to avoid SSR/CSR time mismatch) -->
        <ClientOnly>
          <CountdownTimer class="mb-6" />
          <template #fallback>
            <div class="flex items-center justify-center gap-4 mb-6">
              <div v-for="key in countdownFallbackKeys" :key="key" class="flex flex-col items-center">
                <div class="flex items-center justify-center rounded-lg border border-white/30" style="width: 70px; height: 70px; background: rgba(255,255,255,0.1);">
                  <span class="font-bold text-[#FFD700]" style="font-family: 'Montserrat', sans-serif; font-size: 36px;">--</span>
                </div>
                <span class="mt-2 text-white" style="font-family: 'Inter', sans-serif; font-size: 14px;">{{ $t(key) }}</span>
              </div>
            </div>
          </template>
        </ClientOnly>

        <!-- CTA Buttons -->
        <div class="flex items-center justify-center gap-4 mb-6">
          <NuxtLinkLocale
            to="/predict"
            class="inline-flex items-center justify-center border-none font-bold cursor-pointer hover:opacity-90 transition-opacity"
            style="background: #FFD700; color: #1A237E; font-family: 'Montserrat', sans-serif; font-size: 16px; border-radius: 8px; padding: 12px 24px;"
          >
            {{ $t('hero.startPredict') }}
          </NuxtLinkLocale>
          <NuxtLinkLocale
            to="/matches"
            class="inline-flex items-center justify-center font-bold cursor-pointer transition-all"
            style="border: 2px solid #FFD700; color: #FFD700; font-family: 'Montserrat', sans-serif; font-size: 16px; border-radius: 8px; padding: 12px 24px; background: transparent;"
            @mouseenter="($event.target as HTMLElement).style.background = '#FFD700'; ($event.target as HTMLElement).style.color = '#1A237E'"
            @mouseleave="($event.target as HTMLElement).style.background = 'transparent'; ($event.target as HTMLElement).style.color = '#FFD700'"
          >
            {{ $t('hero.viewSchedule') }}
          </NuxtLinkLocale>
        </div>

        <!-- Stats row -->
        <div class="flex items-center justify-center gap-3" style="font-family: 'Inter', sans-serif; font-size: 14px; color: #FFFFFF; text-shadow: 0 1px 4px rgba(0,0,0,0.5);">
          <span>{{ $t('hero.statsTeams') }}</span>
          <span style="opacity:0.5;">·</span>
          <span>{{ $t('hero.statsMatches') }}</span>
          <span style="opacity:0.5;">·</span>
          <span>{{ $t('hero.statsCities') }}</span>
          <span style="opacity:0.5;">·</span>
          <span>{{ $t('hero.statsCountries') }}</span>
        </div>
      </div>
    </section>

    <!-- Upcoming Matches -->
    <section class="max-w-7xl mx-auto px-4 lg:px-8 pt-8 pb-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 22px; color: #000F49;">
          🏆 {{ $t('home.upcomingMatches') }}
        </h2>
        <NuxtLinkLocale to="/matches" class="font-semibold hover:opacity-80 transition-opacity" style="color: #4A5578; font-size: 14px;">
          {{ $t('home.viewAllMatches') }}
        </NuxtLinkLocale>
      </div>
      <div v-if="matchesPending" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-gray-200 border-t-[#FFD700] rounded-full mx-auto"></div>
      </div>
      <div v-else-if="matchesError" class="text-center py-12 text-red-500">
        {{ matchesError.message || '加载失败' }}
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <MatchCard
          v-for="match in upcomingMatches"
          :key="match.id"
          :match-id="String(match.id)"
          :group="match.group || ''"
          :team1-name="locale === 'zh' ? match.homeTeam.nameZh : match.homeTeam.nameEn"
          :team1-flag="match.homeTeam.flag"
          :team2-name="locale === 'zh' ? match.awayTeam.nameZh : match.awayTeam.nameEn"
          :team2-flag="match.awayTeam.flag"
          :date="formatMatchDate(match.date, match.time)"
          :venue="locale === 'zh' ? match.venue.nameZh : match.venue.name"
        />
      </div>
    </section>

    <!-- Hot Teams -->
    <section class="max-w-7xl mx-auto px-4 lg:px-8 pt-6 pb-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 22px; color: #000F49;">
          ⭐ {{ $t('home.hotTeams') }}
        </h2>
        <NuxtLinkLocale to="/teams" class="font-semibold hover:opacity-80 transition-opacity" style="color: #4A5578; font-size: 14px;">
          {{ $t('home.viewAllTeams') }}
        </NuxtLinkLocale>
      </div>
      <div class="relative">
        <div v-if="teamsPending" class="flex items-center justify-center py-8">
          <div class="animate-spin w-8 h-8 border-4 border-gray-200 border-t-[#FFD700] rounded-full"></div>
        </div>
        <div v-else class="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          <TeamCard
            v-for="team in hotTeams"
            :key="team.code"
            :team-id="team.id"
            :name="locale === 'zh' ? team.nameZh : team.nameEn"
            :flag="team.flag"
            :rank="team.fifaRank"
          />
        </div>
        <!-- Scroll arrow right (跳转球队列表页) -->
        <NuxtLinkLocale
          to="/teams"
          class="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLinkLocale>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="max-w-7xl mx-auto px-4 lg:px-8 pt-4 pb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon="🛡️"
          :count="$t('home.statsTeamsCount')"
          :title="$t('home.statsTeamsTitle')"
          :description="$t('home.statsTeamsDesc')"
        />
        <StatsCard
          icon="⚽"
          :count="$t('home.statsMatchesCount')"
          :title="$t('home.statsMatchesTitle')"
          :description="$t('home.statsMatchesDesc')"
        />
        <StatsCard
          icon="🏟️"
          :count="$t('home.statsCitiesCount')"
          :title="$t('home.statsCitiesTitle')"
          :description="$t('home.statsCitiesDesc')"
        />
      </div>
    </section>

    <!-- AdSense Placeholder -->
    <section class="max-w-7xl mx-auto px-4 lg:px-8 pb-4">
      <div class="w-full p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-400 text-sm">
        Ad Space
      </div>
    </section>

    <!-- Quiz & Fan Card CTA Section -->
    <section class="max-w-7xl mx-auto px-4 lg:px-8 pb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Quiz CTA Card -->
        <NuxtLinkLocale
          to="/quiz"
          class="relative overflow-hidden rounded-2xl p-8 flex flex-col justify-center cursor-pointer no-underline hover:shadow-lg transition-shadow"
          style="background: linear-gradient(135deg, #0a1628 0%, #0d1b3e 60%, #162d5a 100%); min-height: 280px;"
        >
          <!-- Decorative image -->
          <img
            :src="'/images/quiz-hero-bg.png'"
            alt=""
            class="absolute right-0 bottom-0 w-48 h-auto opacity-80 pointer-events-none select-none"
            style="max-height: 90%;"
          />
          <!-- Content -->
          <div class="relative z-10 flex flex-col items-start gap-3">
            <h3 class="font-bold text-white" style="font-family: 'Montserrat', sans-serif; font-size: 22px;">
              {{ $t('home.quizCta') }}
            </h3>
            <p style="font-family: 'Inter', sans-serif; font-size: 14px; color: rgba(255,255,255,0.7);">
              {{ $t('home.quizCtaSub') }}
            </p>
            <!-- Feature list -->
            <div class="flex flex-col gap-2 mt-2">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full" style="background: #22c55e;">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span style="font-family: 'Inter', sans-serif; font-size: 13px; color: rgba(255,255,255,0.85);">
                  {{ $t('home.quizFeature1') }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full" style="background: #22c55e;">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span style="font-family: 'Inter', sans-serif; font-size: 13px; color: rgba(255,255,255,0.85);">
                  {{ $t('home.quizFeature2') }}
                </span>
              </div>
            </div>
            <!-- Button (不再使用嵌套链接，整卡可点击) -->
            <span
              class="inline-flex items-center justify-center font-bold mt-4"
              style="background: #E67E22; color: #ffffff; font-family: 'Montserrat', sans-serif; font-size: 14px; border-radius: 8px; padding: 12px 24px;"
            >
              {{ $t('home.startChallenge') }}
            </span>
          </div>
        </NuxtLinkLocale>

        <!-- Fan Card CTA Card -->
        <NuxtLinkLocale
          to="/fan-card"
          class="relative overflow-hidden rounded-2xl p-8 flex flex-col justify-center cursor-pointer no-underline hover:shadow-lg transition-shadow"
          style="background: linear-gradient(135deg, #1a0533 0%, #2d1b69 60%, #3b2080 100%); min-height: 280px;"
        >
          <!-- Decorative image -->
          <img
            :src="'/images/fancard-bg.png'"
            alt=""
            class="absolute right-0 bottom-0 w-48 h-auto opacity-80 pointer-events-none select-none"
            style="max-height: 90%;"
          />
          <!-- Content -->
          <div class="relative z-10 flex flex-col items-start gap-3">
            <h3 class="font-bold text-white" style="font-family: 'Montserrat', sans-serif; font-size: 22px;">
              {{ $t('home.fanCardCta') }}
            </h3>
            <p style="font-family: 'Inter', sans-serif; font-size: 14px; color: rgba(255,255,255,0.7);">
              {{ $t('home.fanCardCtaSub') }}
            </p>
            <!-- Feature list -->
            <div class="flex flex-col gap-2 mt-2">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full" style="background: #22c55e;">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span style="font-family: 'Inter', sans-serif; font-size: 13px; color: rgba(255,255,255,0.85);">
                  {{ $t('home.fanCardFeature1') }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full" style="background: #22c55e;">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span style="font-family: 'Inter', sans-serif; font-size: 13px; color: rgba(255,255,255,0.85);">
                  {{ $t('home.fanCardFeature2') }}
                </span>
              </div>
            </div>
            <!-- Button (整卡可点击) -->
            <span
              class="inline-flex items-center justify-center font-bold mt-4"
              style="background: #7C3AED; color: #ffffff; font-family: 'Montserrat', sans-serif; font-size: 14px; border-radius: 8px; padding: 12px 24px;"
            >
              {{ $t('home.generateCard') }}
            </span>
          </div>
        </NuxtLinkLocale>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="max-w-7xl mx-auto px-4 lg:px-8 pb-8">
      <div class="rounded-2xl overflow-hidden relative cta-banner-bg">
        <div class="flex items-center justify-between px-6 md:px-12 py-10 relative z-10">
          <!-- Text -->
          <div class="flex-1 md:ml-32 lg:ml-40">
            <h3 class="font-bold mb-2" style="font-family: 'Montserrat', sans-serif; font-size: 24px; color: #FFD700;">
              {{ $t('home.ctaTitle') }}
            </h3>
            <p style="font-family: 'Inter', sans-serif; font-size: 16px; color: #FFFFFF;">
              {{ $t('home.ctaSubtitle') }}
            </p>
          </div>
          <!-- CTA Button -->
          <NuxtLinkLocale
            to="/predict"
            class="border-none font-bold shrink-0 cursor-pointer hover:opacity-90 transition-opacity inline-flex items-center justify-center"
            style="background: #FFD700; color: #1A237E; font-family: 'Montserrat', sans-serif; font-size: 16px; border-radius: 8px; padding: 12px 24px;"
          >
            {{ $t('home.ctaButton') }}
          </NuxtLinkLocale>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { MatchItem } from '~/types'

const { locale, t } = useI18n()

// Fallback placeholder keys for CountdownTimer (rendered during SSR)
const countdownFallbackKeys = ['hero.days', 'hero.hours', 'hero.minutes', 'hero.seconds']

// SEO
useSeoConfig({
  title: 'WorldCupDex - 2026世界杯百科与预测',
  description: '2026年FIFA世界杯百科全书，包含球队资料、赛程赛果、比分预测和球迷互动。',
})

// JSON-LD Structured Data — data objects rendered via <SchemaOrg> in template
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public?.siteUrl as string) || 'https://worldcupdex.org'
const kickiqUrl = (runtimeConfig.public?.kickiqUrl as string) || 'https://kickiq.app'

const organizationData = {
  name: 'WorldCupDex',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  sameAs: [kickiqUrl],
}

const webSiteData = {
  name: 'WorldCupDex',
  url: siteUrl,
  description: '2026 FIFA World Cup Encyclopedia & Predictions',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/data?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

const teamsScrollRef = ref<HTMLElement | null>(null)
// 保留 scrollTeams 以备后续使用（当前右侧箭头改为跳转球队列表页）
function scrollTeams() {
  if (teamsScrollRef.value) {
    teamsScrollRef.value.scrollBy({ left: 300, behavior: 'smooth' })
  }
}
void scrollTeams

// Date formatting helper
function formatMatchDate(dateStr: string, time: string): string {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr

  const month = parseInt(parts[1], 10)
  const day = parseInt(parts[2], 10)

  if (locale.value === 'zh') {
    return `${month}月${day}日 ${time}`
  } else if (locale.value === 'es') {
    return `${day}/${month} ${time}`
  } else {
    return `${month}/${day} ${time}`
  }
}

// Fetch upcoming matches
const { data: upcomingMatches, pending: matchesPending, error: matchesError } = useUpcomingMatches(8)

// Fetch teams and compute top 8 by ranking
const { data: teamsResponse, pending: teamsPending } = useTeamList()

const hotTeams = computed(() => {
  const teams = teamsResponse.value?.data || []
  return [...teams].sort((a, b) => a.fifaRank - b.fifaRank).slice(0, 8)
})
</script>

