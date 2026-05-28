<template>
  <main v-if="routeData" class="team-route-page">
    <SchemaOrg type="SportsTeam" :data="sportsTeamSchema" />
    <SchemaOrg
      v-for="event in sportsEventSchema"
      :key="event.url"
      type="SportsEvent"
      :data="event"
    />

    <section class="team-route-hero">
      <div class="team-route-container">
        <nav class="team-route-breadcrumb">
          <NuxtLinkLocale to="/">{{ t('nav.home') }}</NuxtLinkLocale>
          <span>/</span>
          <NuxtLinkLocale to="/teams">{{ t('teams.title') }}</NuxtLinkLocale>
          <span>/</span>
          <NuxtLinkLocale :to="`/teams/${team.id}`">{{ teamName }}</NuxtLinkLocale>
          <span>/</span>
          <span>{{ copy.route }}</span>
        </nav>

        <div class="team-route-hero__content">
          <img
            :src="team.flag || `https://flagcdn.com/w160/${team.code}.png`"
            :alt="team.nameEn"
            class="team-route-hero__flag"
            loading="eager"
            decoding="async"
          />
          <div class="team-route-hero__text">
            <p class="team-route-eyebrow">World Cup 2026</p>
            <h1>{{ copy.title }}</h1>
            <p>{{ copy.subtitle }}</p>
            <div class="team-route-chips">
              <span>{{ copy.groupLabel }} {{ routeData.group || 'TBD' }}</span>
              <span>{{ routeData.matches.length }} {{ copy.matches }}</span>
              <span>{{ copy.localTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="team-route-container team-route-content">
      <DataSourceNote kind="schedule" compact />

      <section class="team-route-grid team-route-grid--top">
        <article class="team-route-card team-route-card--next">
          <div class="team-route-card__header">
            <span>{{ copy.nextMatch }}</span>
            <NuxtLinkLocale v-if="nextMatch" :to="`/predict/${nextMatch.id}`">{{ copy.predict }}</NuxtLinkLocale>
          </div>

          <template v-if="nextMatch">
            <div class="team-route-matchup">
              <NuxtLinkLocale :to="`/teams/${nextMatch.homeTeam.id}`" class="team-route-team">
                <img :src="nextMatch.homeTeam.flag" :alt="nextMatch.homeTeam.nameEn" loading="lazy" decoding="async" />
                <strong>{{ getTeamName(nextMatch.homeTeam) }}</strong>
              </NuxtLinkLocale>
              <span>vs</span>
              <NuxtLinkLocale :to="`/teams/${nextMatch.awayTeam.id}`" class="team-route-team">
                <img :src="nextMatch.awayTeam.flag" :alt="nextMatch.awayTeam.nameEn" loading="lazy" decoding="async" />
                <strong>{{ getTeamName(nextMatch.awayTeam) }}</strong>
              </NuxtLinkLocale>
            </div>

            <dl class="team-route-meta">
              <div>
                <dt>{{ copy.myTime }}</dt>
                <dd>{{ formatDateTime(nextMatch, 'local') }}</dd>
              </div>
              <div>
                <dt>{{ copy.venueTime }}</dt>
                <dd>{{ formatVenueDateTime(nextMatch) }}</dd>
              </div>
              <div>
                <dt>{{ copy.venue }}</dt>
                <dd>{{ getVenueName(nextMatch) }}, {{ getVenueCity(nextMatch) }}</dd>
              </div>
            </dl>

            <div class="team-route-actions">
              <AddToCalendarButton
                :matches="nextMatch"
                :button-text="copy.addCalendar"
                custom-class="!bg-[#000F49] hover:!bg-[#12205f] !text-white !border-[#000F49] !px-4 !py-2"
                dropdown-position="left"
              />
              <NuxtLinkLocale :to="`/teams/${team.id}/schedule`" class="team-route-secondary-btn">
                {{ copy.fullTeamSchedule }}
              </NuxtLinkLocale>
            </div>
          </template>

          <div v-else class="team-route-empty">{{ copy.noMatches }}</div>
        </article>

        <article class="team-route-card">
          <div class="team-route-card__header">
            <span>{{ copy.groupContext }}</span>
            <NuxtLinkLocale to="/teams">{{ copy.allTeams }}</NuxtLinkLocale>
          </div>

          <div v-if="routeData.groupTeams.length" class="team-route-group-list">
            <NuxtLinkLocale
              v-for="member in routeData.groupTeams"
              :key="member.id"
              :to="`/teams/${member.id}/world-cup-2026-route`"
              class="team-route-group-team"
              :class="{ 'team-route-group-team--active': member.id === team.id }"
            >
              <img :src="member.flag" :alt="member.nameEn" loading="lazy" decoding="async" />
              <span>{{ getTeamListName(member) }}</span>
              <small>FIFA #{{ member.fifaRank }}</small>
            </NuxtLinkLocale>
          </div>
          <div v-else class="team-route-empty">{{ copy.groupPending }}</div>
        </article>
      </section>

      <TeamMerchMoment
        :teams="teamMerchTeams"
        context="team"
        variant="inline"
      />

      <section class="team-route-section">
        <div class="team-route-section__title">
          <div>
            <h2>{{ copy.groupTimeline }}</h2>
            <p>{{ copy.groupTimelineSub }}</p>
          </div>
          <AddToCalendarButton
            v-if="routeData.matches.length"
            :matches="routeData.matches"
            :button-text="copy.exportFixtures"
            custom-class="!bg-white !text-[#000F49] !border-[#d9deea] hover:!bg-[#f8fafc]"
            dropdown-position="right"
          />
        </div>

        <div v-if="routeData.matches.length" class="team-route-timeline">
          <article
            v-for="(match, index) in routeData.matches"
            :id="`match-${match.id}`"
            :key="match.id"
            class="team-route-fixture"
          >
            <div class="team-route-fixture__index">
              <strong>{{ index + 1 }}</strong>
              <span>{{ copy.matchday }} {{ match.matchday || index + 1 }}</span>
            </div>
            <div class="team-route-fixture__main">
              <div class="team-route-matchup team-route-matchup--compact">
                <NuxtLinkLocale :to="`/teams/${match.homeTeam.id}`" class="team-route-team">
                  <img :src="match.homeTeam.flag" :alt="match.homeTeam.nameEn" loading="lazy" decoding="async" />
                  <strong>{{ getTeamName(match.homeTeam) }}</strong>
                </NuxtLinkLocale>
                <span>vs</span>
                <NuxtLinkLocale :to="`/teams/${match.awayTeam.id}`" class="team-route-team">
                  <img :src="match.awayTeam.flag" :alt="match.awayTeam.nameEn" loading="lazy" decoding="async" />
                  <strong>{{ getTeamName(match.awayTeam) }}</strong>
                </NuxtLinkLocale>
              </div>
              <p>{{ formatFixtureMeta(match) }}</p>
            </div>
            <div class="team-route-fixture__actions">
              <NuxtLinkLocale :to="`/predict/${match.id}`">{{ copy.predict }}</NuxtLinkLocale>
              <AddToCalendarButton
                :matches="match"
                :button-text="copy.addCalendarShort"
                custom-class="!bg-white !text-[#000F49] !border-[#d9deea] hover:!bg-[#f8fafc]"
                dropdown-position="right"
              />
            </div>
          </article>
        </div>
        <div v-else class="team-route-empty team-route-empty--block">{{ copy.noMatches }}</div>
      </section>

      <section class="team-route-grid">
        <article class="team-route-card">
          <div class="team-route-card__header">
            <span>{{ copy.officialSlots }}</span>
          </div>
          <div v-if="routeData.slots.length" class="team-route-slot-list">
            <div v-for="slot in routeData.slots" :key="slot.finish" class="team-route-slot">
              <strong>{{ getRouteSlotLabel(slot.finish) }}</strong>
              <p>{{ getRouteSlotDescription(slot.finish) }}</p>
            </div>
          </div>
          <p class="team-route-note">{{ copy.slotNote }}</p>
        </article>

        <article class="team-route-card team-route-card--kickiq">
          <div class="team-route-card__header">
            <span>{{ copy.fullBracketTitle }}</span>
          </div>
          <p>{{ copy.fullBracketBody }}</p>
          <button type="button" class="team-route-primary-link" @click="openKickiqBracket">
            {{ copy.openKickiq }}
          </button>
        </article>
      </section>

      <section v-if="routeData.relatedGroupMatches.length" class="team-route-section">
        <div class="team-route-section__title">
          <div>
            <h2>{{ copy.relatedMatches }}</h2>
            <p>{{ copy.relatedMatchesSub }}</p>
          </div>
        </div>
        <div class="team-route-related">
          <NuxtLinkLocale
            v-for="match in routeData.relatedGroupMatches.slice(0, 6)"
            :key="match.id"
            :to="`/predict/${match.id}`"
            class="team-route-related-match"
          >
            <span>{{ getTeamName(match.homeTeam) }} vs {{ getTeamName(match.awayTeam) }}</span>
            <small>{{ formatDateTime(match, 'local') }}</small>
          </NuxtLinkLocale>
        </div>
      </section>

      <section class="team-route-seo">
        <h2>{{ copy.seoTitle }}</h2>
        <p>{{ copy.seoBody }}</p>
        <div class="team-route-seo__links">
          <NuxtLinkLocale :to="`/teams/${team.id}`">{{ copy.teamProfile }}</NuxtLinkLocale>
          <NuxtLinkLocale :to="`/teams/${team.id}/schedule`">{{ copy.teamSchedule }}</NuxtLinkLocale>
          <NuxtLinkLocale to="/schedule">{{ copy.fullSchedule }}</NuxtLinkLocale>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { MatchItem, TeamListItem } from '~/types'
import { AnalyticsEvents } from '~/composables/analyticsEvents'

const route = useRoute()
const { locale, t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const { track } = useAnalytics()

const teamId = computed(() => String(route.params.id || ''))
const routeData = computed(() => getTeamRoute(teamId.value))

if (!routeData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Team not found',
  })
}

const team = computed(() => routeData.value!.team)
const teamName = computed(() => (locale.value === 'zh' ? team.value.nameZh : team.value.nameEn))
const nextMatch = computed(() => routeData.value!.nextMatch)
const teamMerchTeams = computed(() => [{
  id: team.value.id,
  name: teamName.value,
  flag: team.value.flag || `https://flagcdn.com/w160/${team.value.code}.png`,
}])
const siteUrl = (runtimeConfig.public?.siteUrl as string) || 'https://worldcupdex.org'
const kickiqBracketUrl = computed(() => {
  const configuredUrl = (runtimeConfig.public?.kickiqUrl as string) || 'https://kickiq.org'
  let baseUrl = configuredUrl.replace(/\/+$/, '')

  if (baseUrl.endsWith('/quiz') || baseUrl.endsWith('/predict')) {
    baseUrl = baseUrl.replace(/\/(quiz|predict)$/, '/bracket')
  } else if (!baseUrl.endsWith('/bracket')) {
    baseUrl += '/bracket'
  }

  const targetUrl = new URL(baseUrl)
  targetUrl.searchParams.set('utm_source', 'worldcupdex')
  targetUrl.searchParams.set('utm_medium', 'partner_link')
  targetUrl.searchParams.set('utm_campaign', 'cross_promo')
  targetUrl.searchParams.set('utm_content', 'team_route_bracket_card')

  return targetUrl.toString()
})

function openKickiqBracket() {
  track(AnalyticsEvents.CROSS_SITE_CLICK, {
    source: 'team_route_bracket_card',
    target: 'kickiq_bracket',
  })

  if (typeof window !== 'undefined') {
    window.open(kickiqBracketUrl.value, '_blank', 'noopener,noreferrer')
  }
}

const copy = computed(() => {
  if (locale.value === 'zh') {
    return {
      route: '球队路线',
      title: `${teamName.value} 2026 世界杯球队路线`,
      subtitle: `追踪${teamName.value}的下一场比赛、本地开球时间、小组赛赛程、日历提醒和官方出线槽位。`,
      groupLabel: '小组',
      matches: '场比赛',
      localTime: '本地时间',
      nextMatch: '下一场比赛',
      predict: '预测比赛',
      myTime: '我的时间',
      venueTime: '举办地时间',
      venue: '球场',
      addCalendar: '加入日历',
      addCalendarShort: '日历',
      fullTeamSchedule: '完整球队赛程',
      noMatches: '当前还没有该球队的可用赛程。',
      groupContext: '同组球队',
      allTeams: '全部球队',
      groupPending: '小组信息尚未完整确认。',
      groupTimeline: '小组赛旅程',
      groupTimelineSub: '只展示该球队相关赛程，不做整届 bracket 模拟。',
      exportFixtures: '导出球队赛程',
      matchday: '比赛日',
      officialSlots: '官方出线槽位',
      slotNote: '这里仅说明球队可能进入的官方槽位，不预测具体淘汰赛对手。',
      fullBracketTitle: '想填写完整 bracket？',
      fullBracketBody: 'WorldCupDex 专注球队旅程和日历工具。完整赛事 bracket 和晋级模拟请使用 KickIQ。',
      openKickiq: '打开 KickIQ bracket',
      relatedMatches: '同组关键比赛',
      relatedMatchesSub: '这些比赛可能影响小组排名和你的球队处境。',
      seoTitle: `${teamName.value} 球迷为什么需要这页？`,
      seoBody: `这页面向只想关注${teamName.value}的世界杯球迷，把下一场比赛、本地时间、球场、日历和小组赛路线放在一起。`,
      teamProfile: '球队资料',
      teamSchedule: '球队赛程',
      fullSchedule: '完整赛程',
    }
  }

  if (locale.value === 'es') {
    return {
      route: 'Team route',
      title: `${teamName.value} World Cup 2026 Team Route`,
      subtitle: `Follow ${teamName.value}'s next match, local kickoff time, group fixtures, calendar tools and official qualification slots.`,
      groupLabel: 'Group',
      matches: 'matches',
      localTime: 'Local time',
      nextMatch: 'Next match',
      predict: 'Predict match',
      myTime: 'My time',
      venueTime: 'Venue time',
      venue: 'Venue',
      addCalendar: 'Add to calendar',
      addCalendarShort: 'Calendar',
      fullTeamSchedule: 'Full team schedule',
      noMatches: 'No available fixtures for this team yet.',
      groupContext: 'Group context',
      allTeams: 'All teams',
      groupPending: 'Group information is not fully confirmed yet.',
      groupTimeline: 'Group-stage journey',
      groupTimelineSub: 'Focused on this team only, not a full tournament bracket simulation.',
      exportFixtures: 'Export team fixtures',
      matchday: 'Matchday',
      officialSlots: 'Official qualification slots',
      slotNote: 'This explains official slot types only. It does not predict specific knockout opponents.',
      fullBracketTitle: 'Want the full bracket?',
      fullBracketBody: 'WorldCupDex focuses on team journeys and calendar tools. Use KickIQ for the full bracket and tournament simulation.',
      openKickiq: 'Open KickIQ bracket',
      relatedMatches: 'Related group matches',
      relatedMatchesSub: 'These matches can affect the group table around your team.',
      seoTitle: `Why this page helps ${teamName.value} fans`,
      seoBody: `This page helps ${teamName.value} fans track the 2026 World Cup without scanning the whole tournament schedule: next match, local time, venue, calendar tools and group-stage journey in one place.`,
      teamProfile: 'Team profile',
      teamSchedule: 'Team schedule',
      fullSchedule: 'Full schedule',
    }
  }

  return {
    route: 'Team route',
    title: `${teamName.value} World Cup 2026 Team Route`,
    subtitle: `Follow ${teamName.value}'s next match, local kickoff time, group fixtures, calendar tools and official qualification slots.`,
    groupLabel: 'Group',
    matches: 'matches',
    localTime: 'Local time',
    nextMatch: 'Next match',
    predict: 'Predict match',
    myTime: 'My time',
    venueTime: 'Venue time',
    venue: 'Venue',
    addCalendar: 'Add to calendar',
    addCalendarShort: 'Calendar',
    fullTeamSchedule: 'Full team schedule',
    noMatches: 'No available fixtures for this team yet.',
    groupContext: 'Group context',
    allTeams: 'All teams',
    groupPending: 'Group information is not fully confirmed yet.',
    groupTimeline: 'Group-stage journey',
    groupTimelineSub: 'Focused on this team only, not a full tournament bracket simulation.',
    exportFixtures: 'Export team fixtures',
    matchday: 'Matchday',
    officialSlots: 'Official qualification slots',
    slotNote: 'This explains official slot types only. It does not predict specific knockout opponents.',
    fullBracketTitle: 'Want the full bracket?',
    fullBracketBody: 'WorldCupDex focuses on team journeys and calendar tools. Use KickIQ for the full bracket and tournament simulation.',
    openKickiq: 'Open KickIQ bracket',
    relatedMatches: 'Related group matches',
    relatedMatchesSub: 'These matches can affect the group table around your team.',
    seoTitle: `Why this page helps ${teamName.value} fans`,
    seoBody: `This page helps ${teamName.value} fans track the 2026 World Cup without scanning the whole tournament schedule: next match, local time, venue, calendar tools and group-stage journey in one place.`,
    teamProfile: 'Team profile',
    teamSchedule: 'Team schedule',
    fullSchedule: 'Full schedule',
  }
})

const seoDescription = computed(() =>
  `${teamName.value} World Cup 2026 route with next match, local kickoff time, group fixtures, venues, calendar export and official qualification slot notes.`,
)

useSeoConfig({
  title: computed(() => `${copy.value.title} | WorldCupDex`),
  description: seoDescription,
  ogImage: computed(() => team.value.flag || `https://flagcdn.com/w320/${team.value.code}.png`),
  ogType: 'website',
})

const sportsTeamSchema = computed(() => ({
  name: team.value.nameEn,
  alternateName: team.value.nameZh,
  sport: 'Football',
  logo: team.value.flag || `https://flagcdn.com/w160/${team.value.code}.png`,
  url: `${siteUrl}/teams/${team.value.id}/world-cup-2026-route`,
}))

const sportsEventSchema = computed(() => routeData.value!.matches.map(match => ({
  name: `${match.homeTeam.nameEn} vs ${match.awayTeam.nameEn} - FIFA World Cup 2026`,
  startDate: new Date(match.timestamp).toISOString(),
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  url: `${siteUrl}${route.path}#match-${match.id}`,
  location: {
    '@type': 'Place',
    name: match.venue.name,
    address: match.venue.city,
  },
  competitor: [
    { '@type': 'SportsTeam', name: match.homeTeam.nameEn },
    { '@type': 'SportsTeam', name: match.awayTeam.nameEn },
  ],
})))

function getTeamName(matchTeam: MatchItem['homeTeam']) {
  return locale.value === 'zh' ? matchTeam.nameZh : matchTeam.nameEn
}

function getTeamListName(item: TeamListItem) {
  return locale.value === 'zh' ? item.nameZh : item.nameEn
}

function getVenueName(match: MatchItem) {
  return locale.value === 'zh' ? match.venue.nameZh : match.venue.name
}

function getVenueCity(match: MatchItem) {
  return locale.value === 'zh' ? match.venue.cityZh : match.venue.city
}

function getRouteSlotLabel(finish: '1st' | '2nd' | '3rd') {
  const group = routeData.value!.group || 'TBD'

  if (locale.value === 'zh') {
    if (finish === '1st') return `${group}组第一出线槽位`
    if (finish === '2nd') return `${group}组第二出线槽位`
    return '可能的最佳小组第三路线'
  }

  if (locale.value === 'es') {
    if (finish === '1st') return `Puesto de ganador del Grupo ${group}`
    if (finish === '2nd') return `Puesto de segundo del Grupo ${group}`
    return 'Posible ruta como mejor tercero'
  }

  if (finish === '1st') return `Group ${group} winner slot`
  if (finish === '2nd') return `Group ${group} runner-up slot`
  return 'Possible best third-place route'
}

function getRouteSlotDescription(finish: '1st' | '2nd' | '3rd') {
  const group = routeData.value!.group || 'TBD'

  if (locale.value === 'zh') {
    if (finish === '1st') return `如果这支球队赢得${group}组第一，将进入官方分配给${group}组第一名的32强淘汰赛槽位。`
    if (finish === '2nd') return `如果这支球队获得${group}组第二，将进入官方分配给${group}组第二名的32强淘汰赛槽位。`
    return '小组第三能否出线取决于完整赛事积分榜，WorldCupDex 当前不模拟这一结果。'
  }

  if (locale.value === 'es') {
    if (finish === '1st') return `Si este equipo gana el Grupo ${group}, entrara en el puesto oficial de dieciseisavos asignado al ganador del Grupo ${group}.`
    if (finish === '2nd') return `Si este equipo queda segundo en el Grupo ${group}, entrara en el puesto oficial de dieciseisavos asignado al segundo del Grupo ${group}.`
    return 'La clasificacion como tercero depende de la tabla completa del torneo y WorldCupDex no la simula actualmente.'
  }

  if (finish === '1st') return `If this team wins Group ${group}, it enters the official Round of 32 slot assigned to the Group ${group} winner.`
  if (finish === '2nd') return `If this team finishes second in Group ${group}, it enters the official Round of 32 slot assigned to the Group ${group} runner-up.`
  return 'Third-place qualification depends on the full tournament table and is not simulated on WorldCupDex.'
}

function formatFixtureMeta(match: MatchItem) {
  return `${formatDateTime(match, 'local')} · ${getVenueName(match)}, ${getVenueCity(match)}`
}

function formatDateTime(match: MatchItem, mode: 'local' | 'venue') {
  if (mode === 'venue') return formatVenueDateTime(match)

  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : locale.value === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(match.timestamp))
}

function formatVenueDateTime(match: MatchItem) {
  const date = new Date(`${match.date}T00:00:00`)
  const day = new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : locale.value === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)

  return `${day}, ${match.time || 'TBD'}`
}
</script>

<style scoped>
.team-route-page {
  min-height: 100vh;
  background: #f6f7fb;
  color: #000f49;
}

.team-route-container {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

.team-route-hero {
  background: #000f49;
  color: #fff;
}

.team-route-hero .team-route-container {
  padding: 28px 0 44px;
}

.team-route-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  color: rgba(255, 255, 255, 0.68);
  font-size: 13px;
  margin-bottom: 28px;
}

.team-route-breadcrumb a {
  color: inherit;
  text-decoration: none;
}

.team-route-breadcrumb a:hover {
  color: #ffd700;
}

.team-route-hero__content {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: 24px;
  align-items: center;
}

.team-route-hero__flag {
  width: 132px;
  height: 88px;
  object-fit: cover;
  border-radius: 10px;
  border: 3px solid rgba(255, 255, 255, 0.86);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.22);
}

.team-route-eyebrow {
  margin: 0 0 8px;
  color: #ffd700;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
}

.team-route-hero h1 {
  margin: 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 42px;
  line-height: 1.12;
  font-weight: 900;
}

.team-route-hero__text > p:not(.team-route-eyebrow) {
  max-width: 760px;
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 16px;
  line-height: 1.58;
}

.team-route-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.team-route-chips span {
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

.team-route-content {
  padding: 28px 0 60px;
}

.team-route-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.72fr);
  gap: 16px;
  margin-top: 18px;
}

.team-route-grid--top {
  margin-top: 24px;
}

.team-route-card,
.team-route-section,
.team-route-seo {
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 15, 73, 0.06);
}

.team-route-card {
  padding: 20px;
}

.team-route-card__header,
.team-route-section__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.team-route-card__header span,
.team-route-section__title h2,
.team-route-seo h2 {
  font-family: 'Montserrat', sans-serif;
  color: #000f49;
  font-weight: 900;
}

.team-route-card__header span {
  font-size: 16px;
}

.team-route-card__header a {
  color: #000f49;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
}

.team-route-matchup {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 34px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  margin-top: 22px;
}

.team-route-matchup > span {
  color: #98a2b3;
  font-weight: 900;
  text-align: center;
}

.team-route-matchup--compact {
  margin-top: 0;
}

.team-route-team {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  color: #000f49;
  text-decoration: none;
}

.team-route-team img {
  width: 34px;
  height: 22px;
  object-fit: cover;
  border-radius: 3px;
  flex: 0 0 auto;
}

.team-route-team strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-route-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 22px 0 0;
}

.team-route-meta div {
  padding: 14px;
  border-radius: 8px;
  background: #f8fafc;
}

.team-route-meta dt {
  color: #667085;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 6px;
}

.team-route-meta dd {
  margin: 0;
  color: #000f49;
  font-size: 14px;
  font-weight: 800;
}

.team-route-actions,
.team-route-fixture__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.team-route-secondary-btn,
.team-route-fixture__actions > a,
.team-route-primary-link,
.team-route-seo__links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
}

.team-route-secondary-btn {
  background: #eef2ff;
  color: #000f49;
}

.team-route-group-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.team-route-group-team {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-height: 46px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f8fafc;
  color: #000f49;
  text-decoration: none;
}

.team-route-group-team--active {
  background: #fff8c7;
}

.team-route-group-team img {
  width: 30px;
  height: 20px;
  object-fit: cover;
  border-radius: 3px;
}

.team-route-group-team span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 900;
}

.team-route-group-team small {
  color: #667085;
  font-size: 12px;
  font-weight: 800;
}

.team-route-section {
  margin-top: 18px;
  padding: 22px;
}

.team-route-section__title h2,
.team-route-seo h2 {
  margin: 0;
  font-size: 24px;
}

.team-route-section__title p {
  margin: 6px 0 0;
  color: #667085;
  font-size: 14px;
}

.team-route-timeline {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.team-route-fixture {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr) 210px;
  gap: 16px;
  align-items: center;
  padding: 16px;
  border: 1px solid #edf1f7;
  border-radius: 10px;
  background: #fbfcff;
}

.team-route-fixture__index strong,
.team-route-fixture__index span,
.team-route-fixture__main p {
  display: block;
}

.team-route-fixture__index strong {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ffd700;
  color: #000f49;
}

.team-route-fixture__index span,
.team-route-fixture__main p {
  color: #667085;
  font-size: 13px;
}

.team-route-fixture__index span {
  margin-top: 6px;
  font-weight: 800;
}

.team-route-fixture__main p {
  margin: 8px 0 0;
}

.team-route-fixture__actions {
  justify-content: flex-end;
  margin-top: 0;
}

.team-route-fixture__actions > a {
  background: #ffd700;
  color: #000f49;
}

.team-route-slot-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.team-route-slot {
  padding: 14px;
  border-radius: 8px;
  background: #f8fafc;
}

.team-route-slot strong {
  color: #000f49;
  font-size: 14px;
}

.team-route-slot p,
.team-route-card--kickiq p,
.team-route-note,
.team-route-seo p {
  color: #4b5565;
  line-height: 1.65;
}

.team-route-slot p,
.team-route-note {
  margin: 6px 0 0;
  font-size: 13px;
}

.team-route-card--kickiq p {
  margin: 18px 0;
}

.team-route-primary-link {
  background: #000f49;
  border: 0;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
}

.team-route-related {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.team-route-related-match {
  padding: 14px;
  border-radius: 8px;
  background: #f8fafc;
  color: #000f49;
  text-decoration: none;
}

.team-route-related-match span,
.team-route-related-match small {
  display: block;
}

.team-route-related-match span {
  font-weight: 900;
}

.team-route-related-match small {
  margin-top: 6px;
  color: #667085;
}

.team-route-seo {
  margin-top: 18px;
  padding: 22px;
}

.team-route-seo p {
  margin: 10px 0 0;
}

.team-route-seo__links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.team-route-seo__links a {
  background: #eef2ff;
  color: #000f49;
}

.team-route-empty {
  margin-top: 18px;
  padding: 16px;
  border-radius: 8px;
  background: #f8fafc;
  color: #667085;
  font-weight: 800;
}

.team-route-empty--block {
  margin-top: 18px;
}

@media (max-width: 900px) {
  .team-route-grid,
  .team-route-fixture,
  .team-route-meta,
  .team-route-related {
    grid-template-columns: 1fr;
  }

  .team-route-fixture__actions {
    justify-content: flex-start;
  }
}

@media (max-width: 560px) {
  .team-route-container {
    width: min(100% - 28px, 1180px);
  }

  .team-route-hero__content {
    grid-template-columns: 1fr;
  }

  .team-route-hero__flag {
    width: 112px;
    height: 74px;
  }

  .team-route-hero h1 {
    font-size: 30px;
  }

  .team-route-matchup {
    grid-template-columns: 1fr;
  }

  .team-route-matchup > span {
    text-align: left;
  }

  .team-route-section__title,
  .team-route-card__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
