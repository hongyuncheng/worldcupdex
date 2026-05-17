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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MatchCard
          v-for="match in upcomingMatches"
          :key="match.id"
          :group="match.group"
          :team1-name="match.team1Name"
          :team1-flag="match.team1Flag"
          :team2-name="match.team2Name"
          :team2-flag="match.team2Flag"
          :date="match.date"
          :venue="match.venue"
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
        <div ref="teamsScrollRef" class="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          <TeamCard
            v-for="team in hotTeams"
            :key="team.code"
            :name="team.name"
            :flag="team.flag"
            :rank="team.rank"
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
const teamsScrollRef = ref<HTMLElement | null>(null)

function scrollTeams() {
  if (teamsScrollRef.value) {
    teamsScrollRef.value.scrollBy({ left: 300, behavior: 'smooth' })
  }
}

// Mock data - Upcoming matches
const upcomingMatches = [
  {
    id: 1,
    group: 'A',
    team1Name: '墨西哥',
    team1Flag: 'https://flagcdn.com/w80/mx.png',
    team2Name: '阿根廷',
    team2Flag: 'https://flagcdn.com/w80/ar.png',
    date: '6月12日 03:00',
    venue: '阿兹特克球场',
  },
  {
    id: 2,
    group: 'B',
    team1Name: '美国',
    team1Flag: 'https://flagcdn.com/w80/us.png',
    team2Name: '英格兰',
    team2Flag: 'https://flagcdn.com/w80/gb-eng.png',
    date: '6月12日 03:00',
    venue: 'MetLife球场',
  },
  {
    id: 3,
    group: 'C',
    team1Name: '巴西',
    team1Flag: 'https://flagcdn.com/w80/br.png',
    team2Name: '德国',
    team2Flag: 'https://flagcdn.com/w80/de.png',
    date: '6月12日 03:00',
    venue: 'AT&T球场',
  },
]

// Mock data - Hot teams
const hotTeams = [
  { name: '阿根廷', code: 'ar', flag: 'https://flagcdn.com/w80/ar.png', rank: 1 },
  { name: '法国', code: 'fr', flag: 'https://flagcdn.com/w80/fr.png', rank: 2 },
  { name: '比利时', code: 'be', flag: 'https://flagcdn.com/w80/be.png', rank: 3 },
  { name: '英格兰', code: 'gb-eng', flag: 'https://flagcdn.com/w80/gb-eng.png', rank: 4 },
  { name: '巴西', code: 'br', flag: 'https://flagcdn.com/w80/br.png', rank: 5 },
  { name: '葡萄牙', code: 'pt', flag: 'https://flagcdn.com/w80/pt.png', rank: 6 },
  { name: '荷兰', code: 'nl', flag: 'https://flagcdn.com/w80/nl.png', rank: 7 },
  { name: '西班牙', code: 'es', flag: 'https://flagcdn.com/w80/es.png', rank: 8 },
]
</script>
