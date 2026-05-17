import type { AiPrediction } from '~/types'

export function useAiPredictions() {
  /**
   * 获取单场比赛的 AI 预测
   */
  async function getAiPrediction(matchId: number): Promise<AiPrediction | null> {
    try {
      const data = await $fetch<AiPrediction>(`/api/predictions/${matchId}`)
      return data
    } catch {
      return null
    }
  }

  /**
   * 获取所有 AI 预测
   */
  async function getAllAiPredictions(): Promise<AiPrediction[]> {
    try {
      const data = await $fetch<AiPrediction[]>('/api/predictions')
      return data || []
    } catch {
      return []
    }
  }

  return {
    getAiPrediction,
    getAllAiPredictions,
  }
}
