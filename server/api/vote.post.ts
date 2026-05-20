export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { matchId, result } = body
  
  if (!matchId || !result) {
    throw createError({ statusCode: 400, statusMessage: 'matchId and result are required' })
  }

  // 验证结果参数
  if (!['HOME_WIN', 'AWAY_WIN', 'DRAW'].includes(result)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid result type' })
  }

  try {
    // 兼容本地和生产环境的 CF KV 绑定
    // @ts-ignore
    const kv = process.env.WCD_PREDICTIONS || event.context.cloudflare?.env?.WCD_PREDICTIONS
    
    if (!kv) {
      // 模拟返回
      return { success: true, mocked: true }
    }

    const key = `match_stats_${matchId}`
    let data = await kv.get(key, { type: 'json' }) as { HOME_WIN: number, AWAY_WIN: number, DRAW: number, total: number } | null
    
    if (!data) {
      data = { HOME_WIN: 0, AWAY_WIN: 0, DRAW: 0, total: 0 }
    }

    // 更新计数
    data[result as keyof typeof data] += 1
    data.total += 1

    // 写回 KV
    await kv.put(key, JSON.stringify(data))

    return { success: true, stats: data }
  } catch (error) {
    console.error('KV POST Error:', error)
    return { success: false, error: 'Internal Server Error' }
  }
})
