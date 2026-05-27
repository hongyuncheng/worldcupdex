import type { Ref } from 'vue'
import type { ListResponse, MatchItem } from '~/types'

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

  return {
    data: computed(() => getStaticMatchList(queryParams.value)),
    pending: ref(false),
    error: ref(null),
  }
}

/**
 * 获取即将到来的比赛（首页用）
 * 过滤出日期 >= 今天的比赛，按日期+时间排序取前 N 条
 */
export function useUpcomingMatches(limit: number = 5) {
  return {
    data: computed(() => getStaticUpcomingMatches(limit)),
    pending: ref(false),
    error: ref(null),
  }
}
