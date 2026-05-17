<template>
  <div>
    <!-- Hero Section -->
    <section
      class="relative flex items-center justify-center overflow-hidden"
      style="height: 400px;"
    >
      <!-- Background image -->
      <div class="absolute inset-0" style="background: url('/images/index_bg.png') center bottom / 100% 100% no-repeat;"></div>


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

        <!-- Countdown -->
        <CountdownTimer class="mb-6" />

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
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MatchCard
          v-for="match in upcomingMatches"
          :key="match.id"
          :group="match.group || ''"
          :team1-name="match.homeTeam.nameZh"
          :team1-flag="match.homeTeam.flag"
          :team2-name="match.awayTeam.nameZh"
          :team2-flag="match.awayTeam.flag"
          :date="formatMatchDate(match.date, match.time)"
          :venue="match.venue.nameZh"
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
        <div v-else ref="teamsScrollRef" class="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          <TeamCard
            v-for="team in hotTeams"
            :key="team.code"
            :name="team.nameZh"
            :flag="team.flag"
            :rank="team.fifaRank"
          />
        </div>
        <!-- Scroll arrow right -->
        <button
          class="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow z-10"
          @click="scrollTeams"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
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
      <div
        class="rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8"
        style="background: #000F49; border: 1px solid #FFD700;"
      >
        <!-- Quiz CTA -->
        <div class="flex flex-col items-start gap-3">
          <span class="text-3xl">🧠</span>
          <h3 class="font-bold text-white" style="font-family: 'Montserrat', sans-serif; font-size: 20px;">
            {{ $t('home.quizCta') }}
          </h3>
          <p style="font-family: 'Inter', sans-serif; font-size: 14px; color: rgba(255,255,255,0.7);">
            {{ $t('home.quizCtaSub') }}
          </p>
          <NuxtLinkLocale
            to="/quiz"
            class="inline-flex items-center justify-center font-bold hover:opacity-90 transition-opacity"
            style="background: #FFD700; color: #000F49; font-family: 'Montserrat', sans-serif; font-size: 14px; border-radius: 8px; padding: 10px 20px; margin-top: 4px;"
          >
            {{ $t('home.startChallenge') }}
          </NuxtLinkLocale>
        </div>
        <!-- Fan Card CTA -->
        <div class="flex flex-col items-start gap-3">
          <span class="text-3xl">🃏</span>
          <h3 class="font-bold text-white" style="font-family: 'Montserrat', sans-serif; font-size: 20px;">
            {{ $t('home.fanCardCta') }}
          </h3>
          <p style="font-family: 'Inter', sans-serif; font-size: 14px; color: rgba(255,255,255,0.7);">
            {{ $t('home.fanCardCtaSub') }}
          </p>
          <NuxtLinkLocale
            to="/fan-card"
            class="inline-flex items-center justify-center font-bold hover:opacity-90 transition-opacity"
            style="border: 1px solid #FFD700; color: #FFFFFF; font-family: 'Montserrat', sans-serif; font-size: 14px; border-radius: 8px; padding: 10px 20px; margin-top: 4px; background: transparent;"
          >
            {{ $t('home.generateCard') }}
          </NuxtLinkLocale>
        </div>
        <!-- Participants count -->
        <div class="md:col-span-2 text-center" style="font-family: 'Inter', sans-serif; font-size: 13px; color: rgba(255,255,255,0.5); margin-top: -4px;">
          {{ $t('home.ctaParticipants', { count: participantCount }) }}
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="max-w-7xl mx-auto px-4 lg:px-8 pb-8">
      <div class="rounded-2xl overflow-hidden relative" style="background: url('/images/cta_banner.png') center / 100% 100% no-repeat;">
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

const teamsScrollRef = ref<HTMLElement | null>(null)

function scrollTeams() {
  if (teamsScrollRef.value) {
    teamsScrollRef.value.scrollBy({ left: 300, behavior: 'smooth' })
  }
}

// Date formatting helper
function formatMatchDate(date: string, time: string): string {
  const d = new Date(date)
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}月${day}日 ${time}`
}

// Fetch upcoming matches
const { data: upcomingMatches, pending: matchesPending, error: matchesError } = useUpcomingMatches(8)

// Fetch teams and compute top 8 by ranking
const { data: teamsResponse, pending: teamsPending } = useTeamList()

const hotTeams = computed(() => {
  const teams = teamsResponse.value?.data || []
  return [...teams].sort((a, b) => a.fifaRank - b.fifaRank).slice(0, 8)
})

// Participant count from localStorage + fixed base
const BASE_PARTICIPANTS = 12847
const participantCount = ref(BASE_PARTICIPANTS)

onMounted(() => {
  try {
    const quizCount = parseInt(localStorage.getItem('wcd_quiz_count') || '0', 10)
    participantCount.value = BASE_PARTICIPANTS + quizCount
  } catch {
    // fallback
  }
})
</script>
