import { onMounted, ref, watch } from 'vue'

const FAVORITES_STORAGE_KEY = 'wcd_favorites'

interface FavoritesData {
  teams: string[] // 存球队的 nameEn，因为它是唯一的
  matches: number[] // 存 matchId
}

export function useFavorites() {
  const favoriteTeams = ref<string[]>([])
  const favoriteMatches = ref<number[]>([])
  const isLoaded = ref(false)

  // 从 localStorage 加载数据
  const loadFavorites = () => {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored) as FavoritesData
        favoriteTeams.value = Array.isArray(data.teams) ? data.teams : []
        favoriteMatches.value = Array.isArray(data.matches)
          ? data.matches.map(Number).filter(Number.isFinite)
          : []
      }
    } catch (e) {
      console.error('Failed to load favorites', e)
    }
    isLoaded.value = true
  }

  // 保存到 localStorage
  const saveFavorites = () => {
    if (typeof window === 'undefined') return
    
    const data: FavoritesData = {
      teams: favoriteTeams.value,
      matches: favoriteMatches.value
    }
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(data))
  }

  // 监听变化自动保存
  watch(favoriteTeams, saveFavorites, { deep: true })
  watch(favoriteMatches, saveFavorites, { deep: true })

  // 球队操作
  const toggleTeam = (teamNameEn: string) => {
    const index = favoriteTeams.value.indexOf(teamNameEn)
    if (index > -1) {
      favoriteTeams.value.splice(index, 1)
    } else {
      // 限制最多关注 5 支球队
      if (favoriteTeams.value.length >= 5) {
        alert('You can only favorite up to 5 teams.')
        return false
      }
      favoriteTeams.value.push(teamNameEn)
    }
    return true
  }

  const isTeamFavorited = (teamNameEn: string) => {
    return favoriteTeams.value.includes(teamNameEn)
  }

  // 比赛操作
  const toggleMatch = (matchId: number) => {
    const index = favoriteMatches.value.indexOf(matchId)
    if (index > -1) {
      favoriteMatches.value.splice(index, 1)
    } else {
      favoriteMatches.value.push(matchId)
    }
  }

  const isMatchFavorited = (matchId: number) => {
    return favoriteMatches.value.includes(matchId)
  }

  // 判断某场比赛是否因为关联的球队被关注而处于“被关注”状态
  const isMatchFavoritedByTeam = (homeTeamNameEn: string, awayTeamNameEn: string) => {
    return favoriteTeams.value.includes(homeTeamNameEn) || favoriteTeams.value.includes(awayTeamNameEn)
  }

  // 等待客户端挂载后再读 localStorage，避免 SSR 与首轮客户端渲染不一致。
  if (import.meta.client) {
    onMounted(() => {
      if (!isLoaded.value) {
        loadFavorites()
      }
    })
  }

  return {
    favoriteTeams,
    favoriteMatches,
    isLoaded,
    toggleTeam,
    isTeamFavorited,
    toggleMatch,
    isMatchFavorited,
    isMatchFavoritedByTeam
  }
}
