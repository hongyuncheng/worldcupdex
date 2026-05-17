import { readFile } from 'fs/promises'
import { resolve } from 'path'
import type { VenueItem } from '~/types'

// 模块级缓存
let venuesCache: VenueItem[] | null = null

async function loadVenues(): Promise<VenueItem[]> {
  if (venuesCache) return venuesCache

  const filePath = resolve(process.cwd(), 'data/venues.json')
  try {
    const raw = await readFile(filePath, 'utf-8')
    venuesCache = JSON.parse(raw) as VenueItem[]
    return venuesCache
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return []
    }
    throw err
  }
}

export default defineEventHandler(async () => {
  const venues = await loadVenues()

  if (venues.length === 0) {
    return {
      data: [],
      total: 0,
      message: '暂无数据。请先运行 `npm run fetch-data` 获取场馆数据。',
    }
  }

  return {
    data: venues,
    total: venues.length,
  }
})
