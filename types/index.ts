// 球队列表项
export interface TeamListItem {
  id: string
  nameZh: string
  nameEn: string
  code: string
  group: string
  confederation: string
  fifaRank: number
  flag: string
  coach: {
    nameEn: string
    nameZh: string
    nationality: string
  }
}

// 球员信息
export interface SquadPlayer {
  name: string
  nameZh: string
  position: string
  positionZh: string
  dateOfBirth: string
  nationality: string
  shirtNumber: number | null
  photo?: string | null
  photoCutout?: string | null
  photoThumb?: string | null
}

export type SquadStatus = 'official' | 'provisional' | 'incomplete'

// 近期比赛（球队详情用）
export interface RecentMatch {
  date: string
  homeTeam: string
  awayTeam: string
  score: string
  competition: string
}

// 球队详情
export interface TeamDetail extends TeamListItem {
  founded: number
  venue: string
  squad: SquadPlayer[]
  squadStatus: SquadStatus
  squadLastUpdated: string
  squadSourceUrl?: string
  recentMatches?: RecentMatch[]
}

// 比赛项
export interface MatchItem {
  id: number
  date: string
  time: string
  timestamp: number
  homeTeam: {
    id: string
    nameZh: string
    nameEn: string
    code: string
    flag: string
  }
  awayTeam: {
    id: string
    nameZh: string
    nameEn: string
    code: string
    flag: string
  }
  venue: {
    name: string
    nameZh: string
    city: string
    cityZh: string
    timeZone?: string
  }
  group: string | null
  stage: string
  matchday: number
  score: {
    home: number
    away: number
  } | null
}

// 场馆项
export interface VenueItem {
  id: string
  name: string
  nameZh: string
  city: string
  cityZh: string
  country: string
  countryZh: string
  timeZone?: string
}

// API 响应格式
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface ListResponse<T> {
  data: T[]
  total: number
}

// 用户预测
export interface UserPrediction {
  matchId: number
  result: 'HOME_WIN' | 'AWAY_WIN' | 'DRAW'
  score?: { home: number; away: number }
  timestamp: number
}

// AI预测
export interface AiPrediction {
  matchId: number
  result: 'HOME_WIN' | 'AWAY_WIN' | 'DRAW'
  score: { home: number; away: number }
  confidence: number
  homeWinProb: number
  drawProb: number
  awayWinProb: number
  analysis: string
  keyFactors: string[]
}

// 用户统计
export interface UserStats {
  totalPoints: number
  totalPredictions: number
  correctPredictions: number
  accuracy: number
  currentStreak: number
  longestStreak: number
  beatAiCount: number
  title: string
}

// 用户信息
export interface UserProfile {
  id: string
  nickname: string
  createdAt: number
}

// === Quiz 相关类型 ===
export interface QuizQuestion {
  id: string
  type: 'team_group' | 'team_rank' | 'team_coach' | 'player_team' | 'player_position' | 'match_venue' | 'history'
  question: { zh: string; en: string; es: string }
  options: { zh: string; en: string; es: string }[]
  correctIndex: number
  difficulty: 1 | 2 | 3
}

export interface QuizResult {
  score: number
  correctCount: number
  totalQuestions: number
  timeSpent: number
  percentile: number
  date: string
}

// === Fan Card 相关类型 ===
export interface FanCardData {
  nickname: string
  teamId: string
  favoritePlayerIndex: number
  fanNumber: number
  createdAt: number
}
