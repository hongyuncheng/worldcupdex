import predictionsData from '~/data/predictions.json'
import type { AiPrediction } from '~/types'

const predictions = predictionsData as AiPrediction[]

export default defineEventHandler(async (event) => {
  const matchId = Number(getRouterParam(event, 'matchId'))

  if (isNaN(matchId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid matchId parameter',
    })
  }

  const prediction = predictions.find((p) => p.matchId === matchId)

  if (!prediction) {
    throw createError({
      statusCode: 404,
      statusMessage: `Prediction not found for matchId: ${matchId}`,
    })
  }

  return prediction
})
