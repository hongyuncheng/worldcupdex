import predictionsData from '~/data/predictions.json'
import type { AiPrediction } from '~/types'

const predictions = predictionsData as AiPrediction[]

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // 支持通过 query param 过滤单场
  if (query.matchId) {
    const matchId = Number(query.matchId)
    const prediction = predictions.find((p) => p.matchId === matchId)
    return prediction || []
  }

  return predictions
})
