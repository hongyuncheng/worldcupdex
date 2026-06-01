import metaData from '~/data/meta.json'

export type DataSourceKind = 'schedule' | 'teams' | 'team' | 'prediction' | 'data'

export interface DataSourceMeta {
  source: {
    en: string
    zh: string
    es: string
  }
  lastUpdated: string
  updateMethod: {
    en: string
    zh: string
    es: string
  }
  aiGenerated: boolean
  links: DataSourceLink[]
  disclaimer?: {
    en: string
    zh: string
    es: string
  }
}

export interface DataSourceLink {
  kind: 'schedule' | 'teams' | 'squads' | 'rankings' | 'tournament'
  url: string
  official: boolean
}

const officialLink = (kind: DataSourceLink['kind']): DataSourceLink => ({
  kind,
  url: metaData.sourceUrls[kind],
  official: true,
})

function latestTimestamp(...values: string[]) {
  return [...values].sort().at(-1) || ''
}

const DATA_LAST_UPDATED: Record<DataSourceKind, string> = {
  schedule: metaData.scheduleLastUpdated,
  teams: latestTimestamp(metaData.teamsLastUpdated, metaData.rankingsLastUpdated),
  team: latestTimestamp(metaData.teamsLastUpdated, metaData.squadsLastUpdated, metaData.rankingsLastUpdated),
  prediction: metaData.scheduleLastUpdated,
  data: latestTimestamp(
    metaData.scheduleLastUpdated,
    metaData.teamsLastUpdated,
    metaData.squadsLastUpdated,
    metaData.rankingsLastUpdated,
  ),
}

const baseUpdateMethod = {
  en: 'Static dataset refreshed by the GitHub scheduled workflow.',
  zh: '静态数据由 GitHub 定时任务更新。',
  es: 'Conjunto de datos estático actualizado por una tarea programada de GitHub.',
}

export const dataSourceMeta: Record<DataSourceKind, DataSourceMeta> = {
  schedule: {
    source: {
      en: 'FIFA public match schedule, venue data, and WorldCupDex static match dataset.',
      zh: 'FIFA 公开赛程、场馆资料与 WorldCupDex 静态赛程数据集。',
      es: 'Calendario publico de FIFA, datos de sedes y dataset estatico de WorldCupDex.',
    },
    lastUpdated: DATA_LAST_UPDATED.schedule,
    updateMethod: baseUpdateMethod,
    aiGenerated: false,
    links: [officialLink('schedule'), officialLink('tournament')],
    disclaimer: {
      en: 'Not affiliated with FIFA. Match participants marked TBD will be updated when official slots are confirmed.',
      zh: '本站非 FIFA 官方网站；TBD 对阵会在官方席位确认后更新。',
      es: 'No afiliado a FIFA. Los cruces TBD se actualizaran cuando se confirmen oficialmente.',
    },
  },
  teams: {
    source: {
      en: 'WorldCupDex team dataset compiled from public federation, FIFA ranking, and tournament information.',
      zh: 'WorldCupDex 球队数据集，整理自公开协会资料、FIFA 排名与赛事信息。',
      es: 'Dataset de selecciones de WorldCupDex basado en datos publicos, ranking FIFA e informacion del torneo.',
    },
    lastUpdated: DATA_LAST_UPDATED.teams,
    updateMethod: baseUpdateMethod,
    aiGenerated: false,
    links: [officialLink('teams'), officialLink('rankings'), officialLink('tournament')],
    disclaimer: {
      en: 'Team squads and rankings can change before the tournament.',
      zh: '球队名单与排名在开赛前仍可能变化。',
      es: 'Las plantillas y rankings pueden cambiar antes del torneo.',
    },
  },
  team: {
    source: {
      en: 'WorldCupDex team profile dataset with public squad, ranking, venue, and group information.',
      zh: 'WorldCupDex 球队详情数据集，包含公开名单、排名、场馆与分组信息。',
      es: 'Dataset de perfiles de WorldCupDex con plantillas, rankings, sedes y grupos.',
    },
    lastUpdated: DATA_LAST_UPDATED.team,
    updateMethod: baseUpdateMethod,
    aiGenerated: false,
    links: [officialLink('teams'), officialLink('squads'), officialLink('rankings')],
    disclaimer: {
      en: 'Player photos and squad details may be refreshed as official rosters evolve.',
      zh: '球员照片与名单会随官方名单变化继续更新。',
      es: 'Fotos y plantillas pueden actualizarse cuando cambien las listas oficiales.',
    },
  },
  prediction: {
    source: {
      en: 'Match data from the WorldCupDex static dataset; prediction cards are user-generated and may include AI-assisted copy.',
      zh: '比赛数据来自 WorldCupDex 静态数据集；预测卡由用户生成，文案可能包含 AI 辅助。',
      es: 'Datos del partido desde el dataset estatico de WorldCupDex; las tarjetas son generadas por usuarios y pueden incluir texto asistido por IA.',
    },
    lastUpdated: DATA_LAST_UPDATED.prediction,
    updateMethod: baseUpdateMethod,
    aiGenerated: true,
    links: [officialLink('schedule')],
    disclaimer: {
      en: 'For fan entertainment only. Not official advice, betting advice, odds, or gambling content.',
      zh: '仅供球迷娱乐；不是官方建议、博彩建议、赔率或赌博内容。',
      es: 'Solo entretenimiento para aficionados. No es consejo oficial, de apuestas, cuotas ni contenido de juego.',
    },
  },
  data: {
    source: {
      en: 'WorldCupDex historical and tournament datasets compiled from public World Cup records and static project data.',
      zh: 'WorldCupDex 历史与赛事数据集，整理自公开世界杯记录与项目静态数据。',
      es: 'Datasets historicos y del torneo compilados desde registros publicos y datos estaticos del proyecto.',
    },
    lastUpdated: DATA_LAST_UPDATED.data,
    updateMethod: baseUpdateMethod,
    aiGenerated: false,
    links: [
      officialLink('schedule'),
      officialLink('teams'),
      officialLink('squads'),
      officialLink('rankings'),
      officialLink('tournament'),
    ],
    disclaimer: {
      en: 'Use this page as a transparent overview of what powers the tools on WorldCupDex.',
      zh: '本页用于透明展示 WorldCupDex 工具背后的数据基础。',
      es: 'Esta pagina resume con transparencia los datos que alimentan las herramientas de WorldCupDex.',
    },
  },
}

export function useDataSourceMeta(kind: DataSourceKind) {
  return dataSourceMeta[kind]
}

export function formatDataSourceDate(timestamp: string, locale: string) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return timestamp
  if (locale === 'zh') {
    return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日`
  }
  return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
