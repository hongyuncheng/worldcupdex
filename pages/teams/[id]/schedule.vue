<template>
  <main v-if="team" class="team-schedule-page">
    <SchemaOrg
      v-for="event in sportsEventSchema"
      :key="event.url"
      type="SportsEvent"
      :data="event"
    />

    <section class="team-schedule-hero">
      <div class="team-schedule-hero__inner">
        <BreadcrumbSchema :items="breadcrumbItems" nav-class="team-schedule-breadcrumb" />

        <div class="team-schedule-hero__content">
          <img
            :src="`https://flagcdn.com/w160/${team.code}.png`"
            :alt="team.nameEn"
            class="team-schedule-hero__flag"
            loading="eager"
            decoding="async"
          />
          <div>
            <p class="team-schedule-hero__eyebrow">World Cup 2026</p>
            <h1>{{ copy.title }}</h1>
            <p class="team-schedule-hero__subtitle">{{ copy.subtitle }}</p>
            <div class="team-schedule-hero__chips">
              <span>{{ copy.groupLabel }} {{ team.group }}</span>
              <span>FIFA #{{ team.fifaRank }}</span>
              <span>{{ matches.length }} {{ copy.matches }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="team-schedule-content">
      <DataSourceNote kind="schedule" compact />
      <GeoAnswerBlock :team="team" :match="nextMatch" :group="team.group" />

      <div class="team-schedule-tools">
        <div>
          <h2>{{ copy.fixturesTitle }}</h2>
          <p>{{ copy.fixturesSubtitle }}</p>
        </div>
        <div class="team-schedule-tools__actions">
          <NuxtLinkLocale :to="`/teams/${team.id}/world-cup-2026-route`" class="team-schedule-route-link">
            {{ copy.viewRoute }}
          </NuxtLinkLocale>
          <AddToCalendarButton
            :matches="matches"
            :button-text="copy.exportCalendar"
            custom-class="!bg-[#000F49] hover:!bg-[#12205f] !text-white !border-[#000F49] !px-4 !py-2"
            dropdown-position="right"
          />
        </div>
      </div>

      <div class="team-schedule-summary">
        <div>
          <span>{{ copy.firstMatch }}</span>
          <strong>{{ nextMatch ? formatMatchDate(nextMatch) : '-' }}</strong>
        </div>
        <div>
          <span>{{ copy.venues }}</span>
          <strong>{{ venueCount }}</strong>
        </div>
        <div>
          <span>{{ copy.opponents }}</span>
          <strong>{{ opponentNames.join(', ') }}</strong>
        </div>
      </div>

      <div class="team-schedule-list">
        <article
          v-for="match in matches"
          :id="`match-${match.id}`"
          :key="match.id"
          class="team-schedule-card"
        >
          <div class="team-schedule-card__date">
            <strong>{{ formatDay(match) }}</strong>
            <span>{{ formatTime(match) }}</span>
          </div>

          <div class="team-schedule-card__match">
            <NuxtLinkLocale :to="`/teams/${match.homeTeam.id}`" class="team-schedule-card__team">
              <img :src="match.homeTeam.flag" :alt="match.homeTeam.nameEn" loading="lazy" decoding="async" />
              <span>{{ getTeamName(match.homeTeam) }}</span>
            </NuxtLinkLocale>
            <span class="team-schedule-card__vs">vs</span>
            <NuxtLinkLocale :to="`/teams/${match.awayTeam.id}`" class="team-schedule-card__team">
              <img :src="match.awayTeam.flag" :alt="match.awayTeam.nameEn" loading="lazy" decoding="async" />
              <span>{{ getTeamName(match.awayTeam) }}</span>
            </NuxtLinkLocale>
          </div>

          <div class="team-schedule-card__meta">
            <strong>{{ getVenueName(match) }}</strong>
            <span>{{ getVenueCity(match) }}</span>
          </div>

          <div class="team-schedule-card__actions">
            <AddToCalendarButton
              :matches="match"
              :button-text="copy.addCalendar"
              custom-class="!bg-white !text-[#000F49] !border-gray-200 hover:!bg-gray-50"
              dropdown-position="right"
            />
            <NuxtLinkLocale :to="`/predict/${match.id}`" class="team-schedule-card__predict">
              {{ copy.predict }}
            </NuxtLinkLocale>
          </div>
        </article>
      </div>

      <section class="team-schedule-seo-block">
        <h2>{{ copy.searchIntentTitle }}</h2>
        <p>{{ copy.searchIntentBody }}</p>
        <div class="team-schedule-seo-block__links">
          <NuxtLinkLocale :to="`/teams/${team.id}`">{{ copy.teamProfile }}</NuxtLinkLocale>
          <NuxtLinkLocale to="/schedule">{{ copy.fullSchedule }}</NuxtLinkLocale>
          <NuxtLinkLocale to="/predict">{{ copy.predictions }}</NuxtLinkLocale>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { MatchItem } from '~/types'

const route = useRoute()
const { locale, t } = useI18n()
const runtimeConfig = useRuntimeConfig()

const teamId = computed(() => String(route.params.id || ''))
const team = computed(() => getStaticTeamDetail(teamId.value))

if (!team.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Team not found',
  })
}

const matches = computed(() => {
  return getStaticMatchList({ team: teamId.value }).data
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp)
})

const teamName = computed(() => {
  if (!team.value) return ''
  if (locale.value === 'zh') return team.value.nameZh
  return team.value.nameEn
})

const copy = computed(() => {
  if (locale.value === 'zh') {
    return {
      schedule: '赛程',
      title: `${teamName.value} 2026 世界杯赛程`,
      subtitle: `查看${teamName.value}小组赛日期、开球时间、对手、球场和日历提醒。`,
      groupLabel: '小组',
      matches: '场比赛',
      fixturesTitle: `${teamName.value}赛程表`,
      fixturesSubtitle: '每场比赛都可以加入日历或直接进入预测。',
      viewRoute: '追踪球队路线',
      exportCalendar: '导出全部赛程',
      addCalendar: '加入日历',
      predict: '预测比赛',
      firstMatch: '首场比赛',
      venues: '比赛球场',
      opponents: '小组对手',
      searchIntentTitle: `${teamName.value}球迷为什么需要这页？`,
      searchIntentBody: `这页专门解决“${teamName.value}世界杯赛程”“${teamName.value}几点比赛”“${teamName.value}对手是谁”等搜索需求，提供可加入日历的结构化赛程，而不是只给一段介绍文字。`,
      teamProfile: '球队资料',
      fullSchedule: '完整赛程',
      predictions: '预测竞猜',
    }
  }

  if (locale.value === 'es') {
    return {
      schedule: 'Calendario',
      title: `${teamName.value} World Cup 2026 Schedule`,
      subtitle: `See ${teamName.value} fixtures, kickoff times, opponents, venues and calendar reminders.`,
      groupLabel: 'Group',
      matches: 'matches',
      fixturesTitle: `${teamName.value} fixtures`,
      fixturesSubtitle: 'Add every match to your calendar or jump straight into predictions.',
      viewRoute: 'Track team route',
      exportCalendar: 'Export all fixtures',
      addCalendar: 'Add to calendar',
      predict: 'Predict match',
      firstMatch: 'First match',
      venues: 'Venues',
      opponents: 'Opponents',
      searchIntentTitle: `Why this page helps ${teamName.value} fans`,
      searchIntentBody: `This page answers searches like "${teamName.value} World Cup schedule", "${teamName.value} kickoff time" and "${teamName.value} opponents" with structured fixtures and calendar tools.`,
      teamProfile: 'Team profile',
      fullSchedule: 'Full schedule',
      predictions: 'Predictions',
    }
  }

  return {
    schedule: 'Schedule',
    title: `${teamName.value} World Cup 2026 Schedule`,
    subtitle: `See ${teamName.value} fixtures, kickoff times, opponents, venues and calendar reminders.`,
    groupLabel: 'Group',
    matches: 'matches',
    fixturesTitle: `${teamName.value} fixtures`,
    fixturesSubtitle: 'Add every match to your calendar or jump straight into predictions.',
    viewRoute: 'Track team route',
    exportCalendar: 'Export all fixtures',
    addCalendar: 'Add to calendar',
    predict: 'Predict match',
    firstMatch: 'First match',
    venues: 'Venues',
    opponents: 'Opponents',
    searchIntentTitle: `Why this page helps ${teamName.value} fans`,
    searchIntentBody: `This page answers searches like "${teamName.value} World Cup schedule", "${teamName.value} kickoff time" and "${teamName.value} opponents" with structured fixtures and calendar tools, not just generic copy.`,
    teamProfile: 'Team profile',
    fullSchedule: 'Full schedule',
    predictions: 'Predictions',
  }
})

const breadcrumbItems = computed(() => [
  { name: t('nav.home'), path: '/' },
  { name: t('teams.title'), path: '/teams' },
  { name: teamName.value, path: `/teams/${team.value!.id}` },
  { name: copy.value.schedule, path: `/teams/${team.value!.id}/schedule` },
])

const seoDescription = computed(() => {
  if (!team.value) return ''
  if (locale.value === 'zh') {
    return `${teamName.value} 2026 世界杯完整赛程：小组${team.value.group}，${matches.value.length}场比赛，包含对手、日期、开球时间、球场和日历导出。`
  }
  return `${teamName.value} World Cup 2026 schedule: Group ${team.value.group}, ${matches.value.length} fixtures with opponents, dates, kickoff times, venues and calendar export.`
})

useSeoConfig({
  title: computed(() => `${copy.value.title} | WorldCupDex`),
  description: seoDescription,
  ogImage: computed(() => team.value ? `https://flagcdn.com/w320/${team.value.code}.png` : '/images/og-default.png'),
  ogType: 'website',
})

const siteUrl = (runtimeConfig.public?.siteUrl as string) || 'https://worldcupdex.org'
const canonicalPath = computed(() => route.path)

const venueCount = computed(() => new Set(matches.value.map(match => match.venue.name)).size)
const nextMatch = computed(() => matches.value[0] || null)
const opponentNames = computed(() => {
  return matches.value.map((match) => {
    const opponent = match.homeTeam.id === teamId.value ? match.awayTeam : match.homeTeam
    return getTeamName(opponent)
  })
})

const sportsEventSchema = computed(() => matches.value.map(match => ({
  name: `${getTeamName(match.homeTeam)} vs ${getTeamName(match.awayTeam)} - FIFA World Cup 2026`,
  startDate: new Date(match.timestamp).toISOString(),
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  url: `${siteUrl}${canonicalPath.value}#match-${match.id}`,
  location: {
    '@type': 'Place',
    name: getVenueName(match),
    address: getVenueCity(match),
  },
  competitor: [
    { '@type': 'SportsTeam', name: getTeamName(match.homeTeam) },
    { '@type': 'SportsTeam', name: getTeamName(match.awayTeam) },
  ],
})))

function getTeamName(matchTeam: MatchItem['homeTeam']): string {
  return locale.value === 'zh' ? matchTeam.nameZh : matchTeam.nameEn
}

function getVenueName(match: MatchItem): string {
  return locale.value === 'zh' ? match.venue.nameZh : match.venue.name
}

function getVenueCity(match: MatchItem): string {
  return locale.value === 'zh' ? match.venue.cityZh : match.venue.city
}

function formatDay(match: MatchItem): string {
  return formatMatchShortDate(match, locale.value, 'venue')
}

function formatTime(match: MatchItem): string {
  return formatMatchClock(match, locale.value, 'venue')
}

function formatMatchDate(match: MatchItem): string {
  return `${formatDay(match)} ${formatTime(match)}`
}
</script>

<style scoped>
.team-schedule-page {
  min-height: 100vh;
  background: #f6f7fb;
  color: #000f49;
}

.team-schedule-hero {
  background: #000f49;
  color: #fff;
}

.team-schedule-hero__inner,
.team-schedule-content {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

.team-schedule-hero__inner {
  padding: 28px 0 44px;
}

.team-schedule-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  color: rgba(255, 255, 255, 0.64);
  font-size: 13px;
  margin-bottom: 28px;
}

.team-schedule-breadcrumb a {
  color: inherit;
  text-decoration: none;
}

.team-schedule-breadcrumb a:hover {
  color: #ffd700;
}

.team-schedule-hero__content {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: 24px;
  align-items: center;
}

.team-schedule-hero__flag {
  width: 132px;
  height: 88px;
  object-fit: cover;
  border-radius: 10px;
  border: 3px solid rgba(255, 255, 255, 0.86);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.22);
}

.team-schedule-hero__eyebrow {
  margin: 0 0 8px;
  color: #ffd700;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

.team-schedule-hero h1 {
  margin: 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 40px;
  line-height: 1.15;
  font-weight: 900;
}

.team-schedule-hero__subtitle {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 16px;
  line-height: 1.55;
}

.team-schedule-hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.team-schedule-hero__chips span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.10);
  color: #fff;
  font-size: 13px;
  font-weight: 800;
}

.team-schedule-content {
  padding: 28px 0 56px;
}

.team-schedule-tools {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  margin: 24px 0 16px;
}

.team-schedule-tools h2 {
  margin: 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 26px;
  font-weight: 900;
}

.team-schedule-tools p {
  margin: 6px 0 0;
  color: #667085;
  font-size: 14px;
}

.team-schedule-tools__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.team-schedule-route-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #ffd700;
  background: #fff7c2;
  color: #000f49;
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
}

.team-schedule-summary {
  display: grid;
  grid-template-columns: 1fr 160px 1.5fr;
  gap: 12px;
  margin-bottom: 16px;
}

.team-schedule-summary > div,
.team-schedule-card,
.team-schedule-seo-block {
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 15, 73, 0.06);
}

.team-schedule-summary > div {
  padding: 16px;
}

.team-schedule-summary span {
  display: block;
  color: #667085;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
}

.team-schedule-summary strong {
  color: #000f49;
  font-size: 15px;
}

.team-schedule-list {
  display: grid;
  gap: 12px;
}

.team-schedule-card {
  display: grid;
  grid-template-columns: 136px minmax(260px, 1fr) minmax(180px, 0.8fr) 176px;
  gap: 16px;
  align-items: center;
  padding: 16px;
}

.team-schedule-card__date strong,
.team-schedule-card__date span,
.team-schedule-card__meta strong,
.team-schedule-card__meta span {
  display: block;
}

.team-schedule-card__date strong {
  font-size: 15px;
}

.team-schedule-card__date span,
.team-schedule-card__meta span {
  color: #667085;
  font-size: 13px;
  margin-top: 4px;
}

.team-schedule-card__match {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 34px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.team-schedule-card__team {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: #000f49;
  font-weight: 800;
  text-decoration: none;
}

.team-schedule-card__team img {
  width: 30px;
  height: 20px;
  object-fit: cover;
  border-radius: 3px;
  flex: 0 0 auto;
}

.team-schedule-card__team span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-schedule-card__vs {
  color: #98a2b3;
  font-weight: 900;
  text-align: center;
}

.team-schedule-card__meta strong {
  font-size: 14px;
}

.team-schedule-card__actions {
  display: grid;
  gap: 8px;
}

.team-schedule-card__predict {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 8px;
  background: #ffd700;
  color: #000f49;
  font-size: 12px;
  font-weight: 900;
  text-decoration: none;
}

.team-schedule-seo-block {
  margin-top: 24px;
  padding: 22px;
}

.team-schedule-seo-block h2 {
  margin: 0 0 10px;
  font-family: 'Montserrat', sans-serif;
  font-size: 22px;
  font-weight: 900;
}

.team-schedule-seo-block p {
  margin: 0;
  color: #4b5565;
  line-height: 1.7;
}

.team-schedule-seo-block__links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.team-schedule-seo-block__links a {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #eef2ff;
  color: #000f49;
  font-weight: 800;
  font-size: 13px;
  text-decoration: none;
}

@media (max-width: 900px) {
  .team-schedule-tools,
  .team-schedule-hero__content {
    align-items: flex-start;
  }

  .team-schedule-tools {
    flex-direction: column;
  }

  .team-schedule-summary,
  .team-schedule-card {
    grid-template-columns: 1fr;
  }

  .team-schedule-card__actions {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 520px) {
  .team-schedule-hero__inner,
  .team-schedule-content {
    width: min(100% - 28px, 1180px);
  }

  .team-schedule-hero__content {
    grid-template-columns: 1fr;
  }

  .team-schedule-hero__flag {
    width: 112px;
    height: 74px;
  }

  .team-schedule-hero h1 {
    font-size: 30px;
  }

  .team-schedule-card__match {
    grid-template-columns: 1fr;
  }

  .team-schedule-card__vs {
    text-align: left;
  }

  .team-schedule-card__actions {
    grid-template-columns: 1fr;
  }
}
</style>
