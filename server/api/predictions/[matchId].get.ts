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
  const matchId = Number(getRouterParam(event, 'matchId'))

  if (isNaN(matchId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid matchId parameter',
    })
  }

  const predictions = await getPredictions()
  const prediction = predictions.find((p) => p.matchId === matchId)

  if (!prediction) {
    throw createError({
      statusCode: 404,
      statusMessage: `Prediction not found for matchId: ${matchId}`,
    })
  }

  return prediction
})
