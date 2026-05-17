import { readFile } from 'fs/promises'
import { resolve } from 'path'
import type { TeamListItem } from '~/types'

// 模块级缓存
let teamsCache: TeamListItem[] | null = null

async function loadTeams(): Promise<TeamListItem[]> {
  if (teamsCache) return teamsCache

  const filePath = resolve(process.cwd(), 'data/teams.json')
  try {
    const raw = await readFile(filePath, 'utf-8')
    teamsCache = JSON.parse(raw) as TeamListItem[]
    return teamsCache
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return []
    }
    throw err
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const teams = await loadTeams()

  if (teams.length === 0) {
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 48,
      message: '暂无数据。请先运行 `npm run fetch-data` 获取球队数据。',
    }
  }

  let filtered = [...teams]

  // 按小组过滤
  if (query.group && typeof query.group === 'string') {
    filtered = filtered.filter((t) => t.group === query.group)
  }

  // 按联盟过滤
  if (query.confederation && typeof query.confederation === 'string') {
    filtered = filtered.filter((t) => t.confederation === query.confederation)
  }

  // 搜索（模糊匹配，不区分大小写）
  if (query.search && typeof query.search === 'string') {
    const keyword = query.search.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.nameZh.toLowerCase().includes(keyword) ||
        t.nameEn.toLowerCase().includes(keyword),
    )
  }

  // 排序
  const sort = (query.sort as string) || 'group'
  if (sort === 'fifaRank') {
    filtered.sort((a, b) => a.fifaRank - b.fifaRank)
  } else {
    // 默认按小组排序
    filtered.sort((a, b) => a.group.localeCompare(b.group))
  }

  const total = filtered.length
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.max(1, Number(query.pageSize) || 48)

  // 分页
  const start = (page - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  return {
    data: paged,
    total,
    page,
    pageSize,
  }
})
