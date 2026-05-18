import type { Ref } from 'vue'
import type { MatchItem, ListResponse } from '~/types'

interface UseMatchListParams {
  stage?: Ref<string> | string
  group?: Ref<string> | string
  date?: Ref<string> | string
  venue?: Ref<string> | string
  team?: Ref<string> | string
}

/**
 * 获取赛程列表（支持响应式过滤参数）
 */
export function useMatchList(params?: UseMatchListParams) {
  const queryParams = computed(() => {
    const p: Record<string, string> = {}

    if (params?.stage) {
      const val = toValue(params.stage)
      if (val) p.stage = val
    }
    if (params?.group) {
      const val = toValue(params.group)
      if (val) p.group = val
    }
    if (params?.date) {
      const val = toValue(params.date)
      if (val) p.date = val
    }
    if (params?.venue) {
      const val = toValue(params.venue)
      if (val) p.venue = val
    }
    if (params?.team) {
      const val = toValue(params.team)
      if (val) p.team = val
    }

    return p
  })

  return useFetch<ListResponse<MatchItem>>('/api/matches', {
    query: queryParams,
    key: computed(() => `matches-${JSON.stringify(queryParams.value)}`).value,
    watch: [queryParams],
  })
}

/**
 * 获取即将到来的比赛（首页用）
 * 过滤出日期 >= 今天的比赛，按日期+时间排序取前 N 条
 */
export function useUpcomingMatches(limit: number = 5) {
  return useAsyncData<MatchItem[]>(
    `upcoming-matches-${limit}`,
    async () => {
      const response = await $fetch<ListResponse<MatchItem>>('/api/matches')

      if (!response.data || response.data.length === 0) {
        return []
      }

      // 获取本地当前时间的年月日，避免时区带来的日期偏移
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const today = `${year}-${month}-${day}`

      const upcoming = response.data
        .filter((match) => match.date >= today)
        .sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date)
          if (dateCompare !== 0) return dateCompare
          return a.time.localeCompare(b.time)
        })
        .slice(0, limit)

      return upcoming
    },
  )
}
