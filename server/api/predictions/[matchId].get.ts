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
  const matchId = Number(getRouterParam(event, 'matchId'))

  if (isNaN(matchId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid matchId parameter',
    })
  }

  const predictions = await loadPredictions()
  const prediction = predictions.find((p) => p.matchId === matchId)

  if (!prediction) {
    throw createError({
      statusCode: 404,
      statusMessage: `Prediction not found for matchId: ${matchId}`,
    })
  }

  return prediction
})
