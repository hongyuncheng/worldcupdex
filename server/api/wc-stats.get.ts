import wcStatsData from '~/data/wc-stats.json'

export default defineEventHandler(() => {
  // 过滤掉 _note 元字段，只返回球队数据
  const { _note: _, ...stats } = wcStatsData as Record<string, unknown>
  return stats
})
