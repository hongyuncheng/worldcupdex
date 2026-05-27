import type { FanCardData } from '~/types'
import { TEAM_COLORS, DEFAULT_TEAM_COLORS, type TeamColors } from '~/data/team-colors'

const FAN_CARD_STORAGE_KEY = 'worldcupdex_fan_card'

export function useFanCard() {
  const selectedTeamId = ref<string>('')
  const selectedPlayerIndex = ref<number>(-1)
  const nickname = ref<string>('')
  const fanNumber = ref<number>(0)
  const isGenerated = ref<boolean>(false)

  /**
   * 生成球迷编号 (基于 teamId + timestamp 的哈希值取模，范围 0001-9999)
   */
  function generateFanNumber(teamId: string): number {
    const seed = `${teamId}-${Date.now()}-${Math.random()}`
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    const num = (Math.abs(hash) % 9999) + 1
    return num
  }

  /**
   * 保存到 localStorage
   */
  function saveFanCard(data: FanCardData): void {
    if (import.meta.client) {
      localStorage.setItem(FAN_CARD_STORAGE_KEY, JSON.stringify(data))
    }
  }

  /**
   * 从 localStorage 加载
   */
  function loadFanCard(): FanCardData | null {
    if (import.meta.client) {
      const raw = localStorage.getItem(FAN_CARD_STORAGE_KEY)
      if (raw) {
        try {
          return JSON.parse(raw) as FanCardData
        } catch {
          return null
        }
      }
    }
    return null
  }

  /**
   * 获取球队的首场比赛（从 matches API 查找）
   */
  async function getFirstMatch(
    teamId: string,
  ): Promise<{ opponent: string; opponentEn: string; opponentFlag: string; date: string } | null> {
    try {
      const response = getStaticMatchList({ team: teamId })

      if (!response.data || response.data.length === 0) return null

      // 按日期排序取第一场
      const sorted = [...response.data].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        return a.time.localeCompare(b.time)
      })

      const firstMatch = sorted[0]
      const isHome = firstMatch.homeTeam.id === teamId
      const opponent = isHome ? firstMatch.awayTeam : firstMatch.homeTeam

      return {
        opponent: opponent.nameZh,
        opponentEn: opponent.nameEn,
        opponentFlag: opponent.flag,
        date: firstMatch.date,
      }
    } catch {
      return null
    }
  }

  /**
   * 获取球队配色
   */
  function getTeamColors(teamId: string): TeamColors {
    return TEAM_COLORS[teamId] || DEFAULT_TEAM_COLORS
  }

  return {
    selectedTeamId,
    selectedPlayerIndex,
    nickname,
    fanNumber,
    isGenerated,
    generateFanNumber,
    saveFanCard,
    loadFanCard,
    getFirstMatch,
    getTeamColors,
  }
}
