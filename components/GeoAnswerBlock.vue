<script setup lang="ts">
import type { DataSourceKind } from '~/composables/useDataSourceMeta'
import { formatDataSourceDate } from '~/composables/useDataSourceMeta'
import type { MatchItem, TeamDetail } from '~/types'

const props = defineProps<{
  team: TeamDetail
  match: MatchItem | null
  group?: string
  sourceKind?: DataSourceKind
}>()

const { locale } = useI18n()
const meta = computed(() => useDataSourceMeta(props.sourceKind || 'schedule'))

const dictionary = {
  en: {
    title: (name: string) => `${name}'s next World Cup match`,
    noMatch: 'The next fixture is awaiting official confirmation.',
    opponent: 'Opponent',
    kickoff: 'Kickoff',
    localTime: 'Local display time',
    venue: 'Venue',
    group: 'Group',
    squadStatus: 'Squad status',
    verified: 'Last verified',
    source: 'Source',
    official: 'Official FIFA source',
    statuses: {
      official: 'Official squad',
      provisional: 'Provisional squad',
      incomplete: 'Squad update in progress',
    },
  },
  zh: {
    title: (name: string) => `${name}下一场世界杯比赛`,
    noMatch: '下一场比赛仍待官方确认。',
    opponent: '对手',
    kickoff: '开球时间',
    localTime: '本地显示时间',
    venue: '球场',
    group: '小组',
    squadStatus: '名单状态',
    verified: '最后核验',
    source: '来源',
    official: 'FIFA 官方来源',
    statuses: {
      official: '官方名单',
      provisional: '临时名单',
      incomplete: '名单更新中',
    },
  },
  es: {
    title: (name: string) => `Proximo partido mundialista de ${name}`,
    noMatch: 'El proximo partido espera confirmacion oficial.',
    opponent: 'Rival',
    kickoff: 'Inicio',
    localTime: 'Hora local mostrada',
    venue: 'Estadio',
    group: 'Grupo',
    squadStatus: 'Estado de plantilla',
    verified: 'Ultima verificacion',
    source: 'Fuente',
    official: 'Fuente oficial FIFA',
    statuses: {
      official: 'Plantilla oficial',
      provisional: 'Plantilla provisional',
      incomplete: 'Plantilla en actualizacion',
    },
  },
}

const labels = computed(() => dictionary[locale.value as keyof typeof dictionary] || dictionary.en)
const teamName = computed(() => locale.value === 'zh' ? props.team.nameZh : props.team.nameEn)
const opponent = computed(() => {
  if (!props.match) return null
  return props.match.homeTeam.id === props.team.id ? props.match.awayTeam : props.match.homeTeam
})
const opponentName = computed(() => {
  if (!opponent.value) return '-'
  return locale.value === 'zh' ? opponent.value.nameZh : opponent.value.nameEn
})
const venueName = computed(() => {
  if (!props.match) return '-'
  return locale.value === 'zh' ? props.match.venue.nameZh : props.match.venue.name
})
const venueCity = computed(() => {
  if (!props.match) return ''
  return locale.value === 'zh' ? props.match.venue.cityZh : props.match.venue.city
})
const displayedTime = computed(() => props.match ? `${props.match.date} ${props.match.time}` : '-')
const sourceLink = computed(() => meta.value.links.find(link => link.kind === 'schedule') || meta.value.links[0])
const squadStatus = computed(() => labels.value.statuses[props.team.squadStatus] || props.team.squadStatus)
const verifiedDate = computed(() => formatDataSourceDate(meta.value.lastUpdated, locale.value))
</script>

<template>
  <aside class="geo-answer" aria-label="World Cup match fact summary">
    <h2>{{ labels.title(teamName) }}</h2>
    <p v-if="!match" class="geo-answer__empty">{{ labels.noMatch }}</p>
    <dl v-else>
      <div><dt>{{ labels.opponent }}</dt><dd>{{ opponentName }}</dd></div>
      <div><dt>{{ labels.kickoff }}</dt><dd><time :datetime="new Date(match.timestamp).toISOString()">{{ displayedTime }}</time></dd></div>
      <div><dt>{{ labels.venue }}</dt><dd>{{ venueName }}<span v-if="venueCity">, {{ venueCity }}</span></dd></div>
      <div><dt>{{ labels.localTime }}</dt><dd>{{ displayedTime }}</dd></div>
      <div><dt>{{ labels.group }}</dt><dd>{{ group || team.group || 'TBD' }}</dd></div>
      <div><dt>{{ labels.squadStatus }}</dt><dd>{{ squadStatus }}</dd></div>
      <div><dt>{{ labels.verified }}</dt><dd><time :datetime="meta.lastUpdated">{{ verifiedDate }}</time></dd></div>
      <div v-if="sourceLink"><dt>{{ labels.source }}</dt><dd><a :href="sourceLink.url" target="_blank" rel="noopener noreferrer">{{ labels.official }}</a></dd></div>
    </dl>
  </aside>
</template>

<style scoped>
.geo-answer {
  margin: 0 0 20px;
  padding: 16px;
  border: 1px solid #D8DDEA;
  border-radius: 12px;
  background: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.geo-answer h2 {
  margin: 0 0 12px;
  color: #000F49;
  font-size: 18px;
  font-weight: 800;
}
.geo-answer dl {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px 16px;
  margin: 0;
}
.geo-answer dt {
  color: #6A7288;
  font-size: 12px;
  font-weight: 700;
}
.geo-answer dd {
  margin: 2px 0 0;
  color: #1F2A44;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
}
.geo-answer a {
  color: #000F49;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.geo-answer__empty {
  margin: 0;
  color: #6A7288;
  font-size: 14px;
}
@media (max-width: 768px) {
  .geo-answer dl {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
