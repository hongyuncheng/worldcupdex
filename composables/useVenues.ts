import type { VenueItem, ListResponse } from '~/types'

/**
 * 获取场馆列表
 */
export function useVenueList() {
  return {
    data: computed(() => getStaticVenueList()),
    pending: ref(false),
    error: ref(null),
  }
}
