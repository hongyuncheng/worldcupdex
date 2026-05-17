import { readFile } from 'fs/promises'
import { resolve } from 'path'
import type { AiPrediction } from '~/types'

// 模块级缓存
let predictionsCache: AiPrediction[] | null = null

async function loadPredictions(): Promise<AiPrediction[]> {
  if (predictionsCache) return predictionsCache

  const filePath = resolve(process.cwd(), 'data/predictions.json')
  try {
    const raw = await readFile(filePath, 'utf-8')
    predictionsCache = JSON.parse(raw) as AiPrediction[]
    return predictionsCache
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return []
    }
    throw err
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const predictions = await loadPredictions()

  // 支持通过 query param 过滤单场
  if (query.matchId) {
    const matchId = Number(query.matchId)
    const prediction = predictions.find((p) => p.matchId === matchId)
    return prediction || []
  }

  return predictions
})
