<template>
  <div>
    <!-- JSON-LD Structured Data (Organization + WebSite) -->
    <SchemaOrg type="Organization" :data="organizationData" />
    <SchemaOrg type="WebSite" :data="webSiteData" />

    <!-- Hero Section -->
    <section
      class="relative flex flex-col items-center justify-center overflow-hidden hero-section lg:h-[400px]"
    >
      <!-- Background image -->
      <div class="absolute inset-0 hero-background"></div>


      <!-- Content Wrapper -->
      <div class="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-center h-full pt-8 lg:pt-0 pb-8 lg:pb-0 overflow-y-auto lg:overflow-visible scrollbar-hide">
        <!-- Main Content (Absolute Centered on desktop, regular flow on mobile) -->
        <div class="flex flex-col items-center text-center w-full max-w-3xl my-auto">
          <h1
            class="font-bold text-white mb-2 tracking-tight drop-shadow-lg"
            style="font-family: 'Montserrat', sans-serif; font-size: clamp(28px, 4vw, 48px); text-shadow: 0 4px 12px rgba(0,0,0,0.3);"
          >
            {{ $t('hero.title') }}
          </h1>
          <p class="text-white/90 mb-6" style="font-family: 'Inter', sans-serif; font-size: clamp(14px, 1.5vw, 16px);">
            {{ $t('home.heroSubtitle') }}
          </p>

          <ClientOnly>
            <CountdownTimer class="mb-6" :target-date="countdownTarget" />
            <template #fallback>
              <!-- SSR Placeholder -->
              <div class="flex items-center justify-center gap-3 mb-6">
                <div v-for="key in countdownFallbackKeys" :key="key" class="flex flex-col items-center">
                  <div class="flex items-center justify-center rounded-lg border border-white/30 bg-white/10 backdrop-blur-md" style="width: 60px; height: 60px;">
                    <span class="font-bold text-[#FFD700]" style="font-family: 'Montserrat', sans-serif; font-size: 28px;">--</span>
                  </div>
                  <span class="mt-2 text-white/80" style="font-family: 'Inter', sans-serif; font-size: 13px;">{{ $t(key) }}</span>
                </div>
              </div>
            </template>
          </ClientOnly>

          <!-- CTA Buttons -->
          <div class="hero-cta-buttons flex items-center justify-center gap-4 mb-6 w-full">
            <NuxtLinkLocale
              to="/schedule"
              class="hero-cta-button inline-flex items-center justify-center border-none font-bold cursor-pointer hover:scale-105 transition-transform shadow-lg"
              style="background: #FFD700; color: #1A237E; font-family: 'Montserrat', sans-serif; font-size: 15px; border-radius: 8px; padding: 10px 24px;"
            >
              {{ $t('home.heroPrimaryCta') }}
            </NuxtLinkLocale>
            <NuxtLinkLocale
              to="/teams"
              class="hero-cta-button inline-flex items-center justify-center font-bold cursor-pointer transition-colors"
              style="border: 2px solid rgba(255,255,255,0.3); color: #FFF; font-family: 'Montserrat', sans-serif; font-size: 15px; border-radius: 8px; padding: 10px 24px; background: rgba(255,255,255,0.05);"
              @mouseenter="($event.target as HTMLElement).style.background = 'rgba(255,255,255,0.15)'"
              @mouseleave="($event.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)'"
            >
              {{ $t('home.heroSecondaryCta') }}
            </NuxtLinkLocale>
          </div>

          <!-- Stats row -->
          <div class="flex flex-wrap items-center justify-center gap-3 text-white/80 text-sm shadow-sm" style="font-family: 'Inter', sans-serif;">
            <span>{{ $t('hero.statsTeams') }}</span>
            <span style="opacity:0.5;">·</span>
            <span>{{ $t('hero.statsMatches') }}</span>
            <span style="opacity:0.5;">·</span>
            <span>{{ $t('hero.statsCities') }}</span>
            <span style="opacity:0.5;">·</span>
            <span>{{ $t('hero.statsCountries') }}</span>
          </div>
        </div>

        <!-- Right: Custom Schedule (Absolute positioned on desktop, regular flow on mobile) -->
        <ClientOnly>
          <div v-if="upcomingFavoriteMatches.length > 0" class="lg:absolute lg:right-4 xl:right-8 lg:top-[60%] lg:-translate-y-1/2 w-full max-w-[340px] lg:w-[320px] xl:w-[340px] animate-fade-in z-20 mt-4 lg:mt-0">
            <div class="bg-white/10 backdrop-blur-md border border-white/30 rounded-xl p-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <h3 class="text-white font-bold text-[15px] mb-2 flex items-center gap-1.5">
                <span class="text-yellow-400 drop-shadow-md text-sm">⭐</span> {{ $t('home.customSchedule') }}
              </h3>
              
              <div class="flex flex-col gap-2">
                <NuxtLinkLocale 
                  v-for="match in upcomingFavoriteMatches" 
                  :key="match.id" 
                  :to="`/predict/${match.id}`"
                  class="bg-black/30 hover:bg-black/50 border border-white/10 rounded-lg p-2.5 transition-colors block group"
                >
                  <div class="text-[11px] text-white/90 mb-2 flex justify-between items-center font-medium">
                    <span class="bg-white/20 px-2 py-0.5 rounded">{{ $t(`common.${match.stage}`) }}</span>
                    <div class="flex items-center gap-1.5">
                      <span class="text-white">{{ formatLocalTime(match.timestamp) }}</span>
                      <AddToCalendarButton 
                        :matches="match" 
                        dropdownPosition="right"
                        dropdownDirection="down"
                        customClass="!p-1 !bg-transparent hover:!bg-white/20 !border-transparent"
                        buttonText=""
                      />
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between mt-1">
                    <div class="flex flex-col items-center gap-1 w-[40%]">
                      <img v-if="match.homeTeam.flag" :src="match.homeTeam.flag" class="w-8 h-5 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                      <span class="text-white font-bold text-[12px] text-center leading-tight">{{ locale === 'zh' ? match.homeTeam.nameZh : match.homeTeam.nameEn }}</span>
                    </div>
                    
                    <span class="text-yellow-400 text-[11px] font-black w-[20%] text-center italic drop-shadow-sm">VS</span>
                    
                    <div class="flex flex-col items-center gap-1 w-[40%]">
                      <img v-if="match.awayTeam.flag" :src="match.awayTeam.flag" class="w-8 h-5 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                      <span class="text-white font-bold text-[12px] text-center leading-tight">{{ locale === 'zh' ? match.awayTeam.nameZh : match.awayTeam.nameEn }}</span>
                    </div>
                  </div>
                </NuxtLinkLocale>
              </div>
              
              <div class="mt-3 flex items-center justify-between">
                <AddToCalendarButton 
                  :matches="upcomingFavoriteMatches"
                  :buttonText="$t('schedule.exportAll')"
                  dropdownPosition="left"
                  dropdownDirection="up"
                  customClass="!py-1 !px-2 !text-[10px] !bg-transparent hover:!bg-white/10 !border-white/10"
                />
                
                <NuxtLinkLocale to="/schedule" class="inline-block text-[12px] font-bold text-white/80 hover:text-yellow-400 transition-colors pr-1">
                  {{ $t('home.viewAllMatches') }} →
                </NuxtLinkLocale>
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>
    </section>

    <!-- Fan Journey -->
    <section class="max-w-7xl mx-auto px-4 lg:px-8 pt-8 pb-4">
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-5">
        <div>
          <p class="font-bold uppercase tracking-normal mb-1" style="font-family: 'Montserrat', sans-serif; font-size: 12px; color: #4A5578;">
            {{ $t('home.pathEyebrow') }}
          </p>
          <h2 class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 24px; color: #000F49;">
            {{ $t('home.pathTitle') }}
          </h2>
        </div>
        <p class="max-w-2xl leading-relaxed" style="font-family: 'Inter', sans-serif; font-size: 14px; color: #4A5578;">
          {{ $t('home.pathSubtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <NuxtLinkLocale
          v-for="step in homePathSteps"
          :key="step.key"
          :to="step.to"
          class="group bg-white border border-gray-200 rounded-lg px-4 py-4 shadow-sm hover:shadow-md hover:border-[#FFD700] transition-all no-underline"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm" style="background: #000F49; color: #FFD700;">
              {{ step.index }}
            </span>
            <span class="text-[#4A5578] group-hover:text-[#000F49] transition-colors" aria-hidden="true">→</span>
          </div>
          <h3 class="font-bold mb-1" style="font-family: 'Montserrat', sans-serif; font-size: 16px; color: #000F49;">
            {{ $t(`home.pathSteps.${step.key}.title`) }}
          </h3>
          <p class="leading-snug" style="font-family: 'Inter', sans-serif; font-size: 13px; color: #4A5578;">
            {{ $t(`home.pathSteps.${step.key}.desc`) }}
          </p>
        </NuxtLinkLocale>
      </div>
    </section>

    <!-- Track Team Route -->
    <section class="max-w-7xl mx-auto px-4 lg:px-8 pt-6 pb-4">
      <div class="home-route-module">
        <div>
          <p class="home-route-module__eyebrow">World Cup 2026</p>
          <h2>{{ routeModuleCopy.title }}</h2>
          <p>
            {{ routeModuleCopy.subtitle }}
          </p>
        </div>
        <div class="home-route-module__side">
          <div class="home-route-module__side-header">
            <span>{{ routeModuleCopy.listLabel }}</span>
            <NuxtLinkLocale to="/teams">{{ routeModuleCopy.cta }}</NuxtLinkLocale>
          </div>
          <div class="home-route-module__teams">
            <NuxtLinkLocale
              v-for="team in routeTeams"
              :key="team.id"
              :to="`/teams/${team.id}/world-cup-2026-route`"
              class="home-route-module__team"
            >
              <img :src="team.flag" :alt="team.nameEn" loading="lazy" decoding="async" />
              <span>{{ locale === 'zh' ? team.nameZh : team.nameEn }}</span>
            </NuxtLinkLocale>
          </div>
        </div>
      </div>
    </section>

    <!-- Upcoming Matches -->
    <section class="max-w-7xl mx-auto px-4 lg:px-8 pt-8 pb-4">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 22px; color: #000F49;">
            🏆 {{ $t('home.upcomingMatches') }}
          </h2>
          <p class="mt-1" style="font-family: 'Inter', sans-serif; font-size: 13px; color: #4A5578;">
            {{ $t('home.upcomingMatchesSub') }}
          </p>
        </div>
        <NuxtLinkLocale to="/schedule" class="font-semibold hover:opacity-80 transition-opacity whitespace-nowrap" style="color: #4A5578; font-size: 14px;">
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
          :match="match"
          :match-id="String(match.id)"
          :group="match.group || ''"
          :team1-name="locale === 'zh' ? match.homeTeam.nameZh : match.homeTeam.nameEn"
          :team1-name-en="match.homeTeam.nameEn"
          :team1-flag="match.homeTeam.flag"
          :team2-name="locale === 'zh' ? match.awayTeam.nameZh : match.awayTeam.nameEn"
          :team2-name-en="match.awayTeam.nameEn"
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
      <div class="w-full py-2 border border-dashed border-gray-200 rounded-lg text-center text-gray-300 text-xs bg-gray-50/40">
        {{ $t('home.adPlaceholder') }}
      </div>
    </section>

    <!-- Quiz & Fan Card CTA Section -->
    <section class="max-w-7xl mx-auto px-4 lg:px-8 pb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Quiz CTA Card -->
        <NuxtLinkLocale
          to="/quiz"
          class="relative overflow-hidden rounded-2xl px-8 py-6 flex flex-row items-center justify-between cursor-pointer no-underline hover:shadow-lg transition-shadow gap-6"
          style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);"
        >
          <!-- Background Pattern -->
          <div class="absolute inset-0 opacity-20 bg-cover bg-center" style="background-image: url('/images/quiz-hero-bg.png'); mix-blend-mode: overlay;"></div>
          
          <!-- Content -->
          <div class="relative z-10 flex flex-col items-start gap-2">
            <h3 class="font-bold text-white" style="font-family: 'Montserrat', sans-serif; font-size: 20px;">
              {{ $t('home.quizCta') }}
            </h3>
            <p style="font-family: 'Inter', sans-serif; font-size: 13px; color: rgba(255,255,255,0.7);">
              {{ $t('home.quizCtaSub') }}
            </p>
            <!-- Feature list -->
            <div class="flex flex-col gap-1.5 mt-1">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0" style="background: #22c55e;">
                  <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span style="font-family: 'Inter', sans-serif; font-size: 12px; color: rgba(255,255,255,0.85);">
                  {{ $t('home.quizFeature1') }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0" style="background: #22c55e;">
                  <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span style="font-family: 'Inter', sans-serif; font-size: 12px; color: rgba(255,255,255,0.85);">
                  {{ $t('home.quizFeature2') }}
                </span>
              </div>
            </div>
          </div>
          <!-- Button on the right -->
          <span
            class="relative z-10 inline-flex items-center justify-center font-bold flex-shrink-0"
            style="background: #E67E22; color: #ffffff; font-family: 'Montserrat', sans-serif; font-size: 14px; border-radius: 8px; padding: 12px 24px; white-space: nowrap;"
          >
            {{ $t('home.startChallenge') }}
          </span>
        </NuxtLinkLocale>

        <!-- Fan Card CTA Card -->
        <NuxtLinkLocale
          to="/fan-card"
          class="relative overflow-hidden rounded-2xl px-8 py-6 flex flex-row items-center justify-between cursor-pointer no-underline hover:shadow-lg transition-shadow gap-6"
          style="background: linear-gradient(135deg, #1a0533 0%, #2d1b69 60%, #3b2080 100%);"
        >
          <!-- Background Pattern -->
          <div class="absolute inset-0 opacity-20 bg-cover bg-center" style=" mix-blend-mode: overlay;"></div>

          <!-- Content -->
          <div class="relative z-10 flex flex-col items-start gap-2">
            <h3 class="font-bold text-white" style="font-family: 'Montserrat', sans-serif; font-size: 20px;">
              {{ $t('home.fanCardCta') }}
            </h3>
            <p style="font-family: 'Inter', sans-serif; font-size: 13px; color: rgba(255,255,255,0.7);">
              {{ $t('home.fanCardCtaSub') }}
            </p>
            <!-- Feature list -->
            <div class="flex flex-col gap-1.5 mt-1">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0" style="background: #22c55e;">
                  <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span style="font-family: 'Inter', sans-serif; font-size: 12px; color: rgba(255,255,255,0.85);">
                  {{ $t('home.fanCardFeature1') }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0" style="background: #22c55e;">
                  <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span style="font-family: 'Inter', sans-serif; font-size: 12px; color: rgba(255,255,255,0.85);">
                  {{ $t('home.fanCardFeature2') }}
                </span>
              </div>
            </div>
          </div>
          <!-- Button on the right -->
          <span
            class="relative z-10 inline-flex items-center justify-center font-bold flex-shrink-0"
            style="background: #7C3AED; color: #ffffff; font-family: 'Montserrat', sans-serif; font-size: 14px; border-radius: 8px; padding: 12px 24px; white-space: nowrap;"
          >
            {{ $t('home.generateCard') }}
          </span>
        </NuxtLinkLocale>
      </div>
    </section>

    <!-- Wall of Supporters -->
    <section class="max-w-7xl mx-auto px-4 lg:px-8 pb-8">
      <WallOfFame />
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

    <!-- Floating Draggable Discord Button (Home Page Only) -->
    <ClientOnly>
      <DraggableDiscord :discord-url="discordUrl" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { MatchItem } from '~/types'

import matchesData from '~/data/matches.json'
const { locale, t } = useI18n()
const { favoriteTeams, favoriteMatches, isLoaded } = useFavorites()

const countdownTarget = '2026-06-12T01:00:00Z'

const homePathSteps = [
  { index: '1', key: 'team', to: '/teams' },
  { index: '2', key: 'schedule', to: '/schedule' },
  { index: '3', key: 'predict', to: '/predict' },
  { index: '4', key: 'share', to: '/fan-card' },
]

const upcomingFavoriteMatches = computed(() => {
  if (!isLoaded.value) return []
  if (favoriteTeams.value.length === 0 && favoriteMatches.value.length === 0) return []

  const favMatches = (matchesData as MatchItem[]).filter(m => {
    const isFavTeam = favoriteTeams.value.includes(m.homeTeam.nameEn) || favoriteTeams.value.includes(m.awayTeam.nameEn)
    const isFavMatch = favoriteMatches.value.includes(m.id)
    return isFavTeam || isFavMatch
  })

  // 仅显示还未结束的比赛（score为空），并按时间排序，取前两场
  const upcoming = favMatches.filter(m => !m.score).sort((a, b) => a.timestamp - b.timestamp)
  return upcoming.slice(0, 2)
})

function formatLocalTime(timestamp: number) {
  if (!timestamp) return ''
  return new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp))
}

// Fallback placeholder keys for CountdownTimer (rendered during SSR)
const countdownFallbackKeys = ['hero.days', 'hero.hours', 'hero.minutes', 'hero.seconds']

// SEO
const seoTitle = computed(() => t('home.title'))
const seoDescription = computed(() => t('home.description'))

useSeoConfig({
  title: seoTitle,
  description: seoDescription,
})

// JSON-LD Structured Data — data objects rendered via <SchemaOrg> in template
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public?.siteUrl as string) || 'https://worldcupdex.org'
const kickiqUrl = (runtimeConfig.public?.kickiqUrl as string) || 'https://kickiq.app'
const discordUrl = (runtimeConfig.public?.discordUrl as string) || 'https://discord.gg/zpCBfUZbUn'

const organizationData = {
  name: 'WorldCupDex',
  url: siteUrl,
  logo: `${siteUrl}/images/logo.png`,
  sameAs: [kickiqUrl],
}

const webSiteData = {
  name: 'WorldCupDex',
  url: siteUrl,
  description: '2026 FIFA World Cup Encyclopedia & Predictions',
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

const followedRouteTeams = computed(() => {
  const teams = teamsResponse.value?.data || []
  if (!isLoaded.value || favoriteTeams.value.length === 0) return []

  const teamsByName = new Map(teams.map(team => [team.nameEn, team]))

  return favoriteTeams.value
    .map(teamName => teamsByName.get(teamName))
    .filter((team): team is NonNullable<typeof team> => Boolean(team))
    .slice(0, 6)
})

const hasFollowedRouteTeams = computed(() => followedRouteTeams.value.length > 0)

const routeTeams = computed(() => {
  if (hasFollowedRouteTeams.value) return followedRouteTeams.value
  return hotTeams.value.filter(team => team.group).slice(0, 6)
})

const routeModuleCopy = computed(() => {
  const hasFollowed = hasFollowedRouteTeams.value

  if (locale.value === 'zh') {
    return {
      title: hasFollowed ? '追踪你的关注球队路线' : '选择你的球队路线',
      subtitle: hasFollowed
        ? '这里优先展示你已关注球队的下一场比赛、本地开球时间、小组赛赛程、日历提醒和官方出线槽位。'
        : '先从热门球队开始，或进入球队图鉴选择你真正支持的球队路线。',
      listLabel: hasFollowed ? '你的关注球队' : '热门球队路线',
      cta: hasFollowed ? '管理球队' : '查看更多球队',
    }
  }

  if (locale.value === 'es') {
    return {
      title: hasFollowed ? 'Sigue tus equipos favoritos' : 'Elige la ruta de tu equipo',
      subtitle: hasFollowed
        ? 'Mira primero los equipos que sigues: proximo partido, hora local, calendario, recordatorios y puestos oficiales.'
        : 'Empieza con equipos populares o abre el atlas de equipos para elegir el que realmente sigues.',
      listLabel: hasFollowed ? 'Tus equipos seguidos' : 'Rutas populares',
      cta: hasFollowed ? 'Gestionar equipos' : 'Ver mas equipos',
    }
  }

  return {
    title: hasFollowed ? 'Track Your Followed Teams' : 'Choose Your Team Route',
    subtitle: hasFollowed
      ? 'Your followed teams come first: next match, local kickoff time, group fixtures, calendar reminders and official qualification slots.'
      : 'Start with popular teams or open the team atlas to choose the team you actually care about.',
    listLabel: hasFollowed ? 'Your followed teams' : 'Popular team routes',
    cta: hasFollowed ? 'Manage teams' : 'Browse all teams',
  }
})
</script>

<style scoped>
.hero-section {
  min-height: 400px;
  background-color: #000F49;
}

.home-route-module {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.82fr);
  gap: 20px;
  align-items: center;
  padding: 22px;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 15, 73, 0.06);
}

.home-route-module__eyebrow {
  margin: 0 0 6px;
  color: #4a5578;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.home-route-module h2 {
  margin: 0;
  color: #000f49;
  font-family: 'Montserrat', sans-serif;
  font-size: 24px;
  font-weight: 900;
}

.home-route-module p:not(.home-route-module__eyebrow) {
  margin: 8px 0 0;
  color: #4a5578;
  font-size: 14px;
  line-height: 1.65;
}

.home-route-module__teams {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.home-route-module__side {
  min-width: 0;
}

.home-route-module__side-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.home-route-module__side-header span {
  color: #4a5578;
  font-size: 12px;
  font-weight: 900;
}

.home-route-module__side-header a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0 12px;
  border: 1px solid #d9deea;
  border-radius: 8px;
  color: #000f49;
  background: #fff;
  font-size: 12px;
  font-weight: 900;
  text-decoration: none;
  white-space: nowrap;
}

.home-route-module__side-header a:hover {
  border-color: #ffd700;
  background: #fff9d8;
}

.home-route-module__team {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f8fafc;
  color: #000f49;
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
}

.home-route-module__team img {
  width: 28px;
  height: 18px;
  border-radius: 3px;
  object-fit: cover;
  flex: 0 0 auto;
}

.home-route-module__team span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1024px) {
  .hero-section {
    height: auto;
    min-height: 450px;
  }

  .home-route-module {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .hero-section {
    min-height: 400px;
  }

  .home-route-module__teams {
    grid-template-columns: 1fr;
  }

  .hero-cta-buttons {
    flex-direction: column;
    gap: 10px;
    max-width: 280px;
  }

  .hero-cta-button {
    width: 100%;
    min-height: 48px;
  }
}
</style>

