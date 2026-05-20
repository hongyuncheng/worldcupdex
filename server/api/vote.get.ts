export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const matchId = query.matchId as string
  
  if (!matchId) {
    throw createError({ statusCode: 400, statusMessage: 'matchId is required' })
  }

  try {
    // 兼容本地和生产环境的 CF KV 绑定
    // @ts-ignore
    const kv = process.env.WCD_PREDICTIONS || event.context.cloudflare?.env?.WCD_PREDICTIONS
    
    if (!kv) {
      // 如果没有 KV 绑定（比如开发环境未配置好），返回模拟数据，避免阻塞流程
      return {
        HOME_WIN: 45,
        AWAY_WIN: 30,
        DRAW: 25,
        total: 100
      }
    }

    const key = `match_stats_${matchId}`
    const data = await kv.get(key, { type: 'json' })
    
    if (!data) {
      return { HOME_WIN: 0, AWAY_WIN: 0, DRAW: 0, total: 0 }
    }

    return data
  } catch (error) {
    console.error('KV GET Error:', error)
    // 降级返回，不要让前端崩溃
    return { HOME_WIN: 0, AWAY_WIN: 0, DRAW: 0, total: 0 }
  }
})
