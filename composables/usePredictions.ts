import { ref, computed } from 'vue'
import type { UserPrediction } from '~/types'

const STORAGE_KEY = 'wcd_predictions'

export function usePredictions() {
  const predictions = ref<Record<number, UserPrediction>>({})

  // 从 localStorage 加载
  function loadPredictions() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        predictions.value = JSON.parse(raw) as Record<number, UserPrediction>
      }
    } catch {
      predictions.value = {}
    }
  }

  // 保存到 localStorage
  function savePredictions() {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions.value))
  }

  // 提交预测
  function submitPrediction(
    matchId: number,
    prediction: Omit<UserPrediction, 'matchId' | 'timestamp'>,
  ) {
    const entry: UserPrediction = {
      matchId,
      ...prediction,
      timestamp: Date.now(),
    }
    predictions.value[matchId] = entry
    savePredictions()
  }

  // 获取单场预测
  function getPrediction(matchId: number): UserPrediction | null {
    return predictions.value[matchId] || null
  }

  // 获取所有预测
  function getAllPredictions(): UserPrediction[] {
    return Object.values(predictions.value)
  }

  // 是否已预测
  function hasPredicted(matchId: number): boolean {
    return matchId in predictions.value
  }

  // 预测总数
  const totalPredictions = computed(() => Object.keys(predictions.value).length)

  // 初始化加载
  loadPredictions()

  return {
    submitPrediction,
    getPrediction,
    getAllPredictions,
    hasPredicted,
    totalPredictions,
  }
}
