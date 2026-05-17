import type { VenueItem, ListResponse } from '~/types'

/**
 * 获取场馆列表
 */
export function useVenueList() {
  return useFetch<ListResponse<VenueItem>>('/api/venues', {
    key: 'venues-list',
  })
}
