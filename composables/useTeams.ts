import type { Ref } from 'vue'
import type { TeamListItem, TeamDetail, PaginatedResponse } from '~/types'

interface UseTeamListParams {
  group?: Ref<string> | string
  confederation?: Ref<string> | string
  search?: Ref<string> | string
  sort?: Ref<string> | string
  page?: Ref<number> | number
  pageSize?: Ref<number> | number
}

/**
 * 获取球队列表（支持响应式过滤参数）
 */
export function useTeamList(params?: UseTeamListParams) {
  const queryParams = computed(() => {
    const p: Record<string, string | number> = {}

    if (params?.group) {
      const val = toValue(params.group)
      if (val) p.group = val
    }
    if (params?.confederation) {
      const val = toValue(params.confederation)
      if (val) p.confederation = val
    }
    if (params?.search) {
      const val = toValue(params.search)
      if (val) p.search = val
    }
    if (params?.sort) {
      const val = toValue(params.sort)
      if (val) p.sort = val
    }
    if (params?.page) {
      const val = toValue(params.page)
      if (val) p.page = val
    }
    if (params?.pageSize) {
      const val = toValue(params.pageSize)
      if (val) p.pageSize = val
    }

    return p
  })

  return {
    data: computed(() => getStaticTeamList(queryParams.value)),
    pending: ref(false),
    error: ref(null),
  }
}

/**
 * 获取球队详情
 */
export function useTeamDetail(id: string | Ref<string>) {
  const teamId = computed(() => toValue(id))

  return {
    data: computed(() => getStaticTeamDetail(teamId.value)),
    pending: ref(false),
    error: ref(null),
  }
}
