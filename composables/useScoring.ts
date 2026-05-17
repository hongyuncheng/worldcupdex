import type { UserPrediction, AiPrediction, UserStats, MatchItem } from '~/types'

type MatchResult = 'HOME_WIN' | 'AWAY_WIN' | 'DRAW'

/**
 * 根据比分判定比赛结果
 */
function getMatchResult(score: { home: number; away: number }): MatchResult {
  if (score.home > score.away) return 'HOME_WIN'
  if (score.home < score.away) return 'AWAY_WIN'
  return 'DRAW'
}

/**
 * 根据分数获取称号
 */
function getTitle(points: number): string {
  if (points > 300) return '预测之神'
  if (points > 150) return '预测大师'
  if (points > 50) return '预测达人'
  return '预测新手'
}

/**
 * 计算单场比赛得分
 */
function calculateMatchScore(
  userPred: UserPrediction,
  actualScore: { home: number; away: number },
  aiPred: AiPrediction | null,
): number {
  let score = 0
  const actualResult = getMatchResult(actualScore)

  // 判断用户是否猜对胜/平/负
  const userCorrect = userPred.result === actualResult
  if (!userCorrect) return 0

  // 猜对胜/平/负 +3分
  score += 3

  // 猜对精确比分 额外+7分（总计10分）
  if (
    userPred.score &&
    userPred.score.home === actualScore.home &&
    userPred.score.away === actualScore.away
  ) {
    score += 7
  }

  // 超过AI（AI猜错用户猜对）+2分
  if (aiPred && aiPred.result !== actualResult) {
    score += 2
  }

  return score
}

export function useScoring() {
  /**
   * 计算用户综合统计数据
   */
  function getStats(
    predictions: UserPrediction[],
    matches: MatchItem[],
    aiPredictions: AiPrediction[],
  ): UserStats {
    let totalPoints = 0
    let correctPredictions = 0
    let currentStreak = 0
    let longestStreak = 0
    let beatAiCount = 0
    let tempStreak = 0

    // 按比赛完成状态过滤 — 只计算已有比分的比赛
    const matchMap = new Map(matches.map((m) => [m.id, m]))
    const aiMap = new Map(aiPredictions.map((a) => [a.matchId, a]))

    // 按 matchId 排序预测（按时间顺序计算连胜）
    const sortedPredictions = [...predictions].sort((a, b) => a.matchId - b.matchId)

    for (const pred of sortedPredictions) {
      const match = matchMap.get(pred.matchId)
      if (!match || !match.score) continue // 比赛未结束

      const actualResult = getMatchResult(match.score)
      const aiPred = aiMap.get(pred.matchId) || null
      const matchScore = calculateMatchScore(pred, match.score, aiPred)

      if (pred.result === actualResult) {
        correctPredictions++
        tempStreak++
        if (tempStreak > longestStreak) longestStreak = tempStreak
      } else {
        tempStreak = 0
      }

      // 超过AI计数
      if (aiPred && pred.result === actualResult && aiPred.result !== actualResult) {
        beatAiCount++
      }

      totalPoints += matchScore
    }

    currentStreak = tempStreak

    // 连胜翻倍: 计算总分时应用倍率（只对当前连胜中的分数生效）
    // 简化实现：对总分应用当前连胜加成
    let streakMultiplier = 1
    if (currentStreak >= 5) streakMultiplier = 2
    else if (currentStreak >= 3) streakMultiplier = 1.5

    // 连胜加成只应用于最近连胜的最后一场
    if (currentStreak >= 3 && sortedPredictions.length > 0) {
      const lastPred = sortedPredictions[sortedPredictions.length - 1]
      const lastMatch = matchMap.get(lastPred.matchId)
      if (lastMatch?.score) {
        const lastAi = aiMap.get(lastPred.matchId) || null
        const lastScore = calculateMatchScore(lastPred, lastMatch.score, lastAi)
        // 加上倍率奖励（额外部分）
        totalPoints += Math.floor(lastScore * (streakMultiplier - 1))
      }
    }

    const totalPredictions = predictions.length
    const accuracy = totalPredictions > 0 ? correctPredictions / totalPredictions : 0

    return {
      totalPoints,
      totalPredictions,
      correctPredictions,
      accuracy,
      currentStreak,
      longestStreak,
      beatAiCount,
      title: getTitle(totalPoints),
    }
  }

  return {
    calculateMatchScore,
    getStats,
    getTitle,
  }
}
