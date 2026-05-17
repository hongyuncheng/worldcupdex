import type { VenueItem } from '~/types'

let _venues: VenueItem[] | null = null

async function getVenues(): Promise<VenueItem[]> {
  if (!_venues) {
    const mod = await import('../../../data/venues.json')
    _venues = mod.default as VenueItem[]
  }
  return _venues
}

export default defineEventHandler(async () => {
  const venues = await getVenues()

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
