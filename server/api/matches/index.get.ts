import { readFile } from 'fs/promises'
import { resolve } from 'path'
import type { MatchItem } from '~/types'

// 模块级缓存
let matchesCache: MatchItem[] | null = null

async function loadMatches(): Promise<MatchItem[]> {
  if (matchesCache) return matchesCache

  const filePath = resolve(process.cwd(), 'data/matches.json')
  try {
    const raw = await readFile(filePath, 'utf-8')
    matchesCache = JSON.parse(raw) as MatchItem[]
    return matchesCache
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return []
    }
    throw err
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const matches = await loadMatches()

  if (matches.length === 0) {
    return {
      data: [],
      total: 0,
      message: '暂无数据。请先运行 `npm run fetch-data` 获取赛程数据。',
    }
  }

  let filtered = [...matches]

  // 按赛事阶段过滤
  if (query.stage && typeof query.stage === 'string') {
    filtered = filtered.filter((m) => m.stage === query.stage)
  }

  // 按小组过滤（仅小组赛有效）
  if (query.group && typeof query.group === 'string') {
    filtered = filtered.filter((m) => m.group === query.group)
  }

  // 按日期过滤
  if (query.date && typeof query.date === 'string') {
    filtered = filtered.filter((m) => m.date === query.date)
  }

  // 按场馆名过滤
  if (query.venue && typeof query.venue === 'string') {
    const venueKeyword = query.venue.toLowerCase()
    filtered = filtered.filter(
      (m) =>
        m.venue.name.toLowerCase().includes(venueKeyword) ||
        m.venue.nameZh.includes(query.venue as string),
    )
  }

  // 按球队 id 过滤
  if (query.team && typeof query.team === 'string') {
    const teamId = query.team
    filtered = filtered.filter(
      (m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId,
    )
  }

  return {
    data: filtered,
    total: filtered.length,
  }
})
