import venuesData from '~/data/venues.json'
import type { VenueItem } from '~/types'

const venues = venuesData as VenueItem[]

export default defineEventHandler(async () => {
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
