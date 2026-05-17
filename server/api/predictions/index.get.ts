import type { AiPrediction } from '~/types'

let _predictions: AiPrediction[] | null = null

async function getPredictions(): Promise<AiPrediction[]> {
  if (!_predictions) {
    const mod = await import('../../../data/predictions.json')
    _predictions = mod.default as AiPrediction[]
  }
  return _predictions
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const predictions = await getPredictions()

  // 支持通过 query param 过滤单场
  if (query.matchId) {
    const matchId = Number(query.matchId)
    const prediction = predictions.find((p) => p.matchId === matchId)
    return prediction || []
  }

  return predictions
})
