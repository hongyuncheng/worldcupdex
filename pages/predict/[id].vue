<script setup lang="ts">
import type { MatchItem } from '~/types'

const { t, tm, locale } = useI18n()
const route = useRoute()
const matchId = Number(route.params.id)

// ─── SEO ───
useSeoConfig({
  title: `${t('predictDetail.title')} - WorldCupDex`,
  description: '预测世界杯单场比赛结果，生成专属预测卡片并分享。',
})

// ─── 获取比赛数据 ───
const { data } = useFetch<{ data: MatchItem[] }>('/api/matches')
const match = computed(() => data.value?.data?.find(m => m.id === matchId) || null)

// ─── 表单状态 ───
const selectedResult = ref<'HOME_WIN' | 'AWAY_WIN' | 'DRAW' | null>(null)
const homeScore = ref<number>(0)
const awayScore = ref<number>(0)
const skipScore = ref(false)

// ─── 获取本地预测记录 ───
const { getPrediction } = usePredictions()
const myPrediction = computed(() => getPrediction(matchId))

// ─── 验证预测结果 ───
const isCorrect = computed(() => {
  if (!myPrediction.value || !match.value || !match.value.score) return null
  const { home, away } = match.value.score
  const realResult = home > away ? 'HOME_WIN' : (home < away ? 'AWAY_WIN' : 'DRAW')
  return realResult === myPrediction.value.result
})

// ─── 卡片状态 ───
const showCard = ref(false)
const showValidation = ref(true) // 控制是否显示验证卡片
const cardRef = ref<HTMLElement | null>(null)
const isGenerating = ref(false)
const voteStats = ref<Record<string, number> | null>(null)

// ─── 比分加减 ───
function increment(target: 'home' | 'away') {
  if (target === 'home' && homeScore.value < 20) homeScore.value++
  if (target === 'away' && awayScore.value < 20) awayScore.value++
}
function decrement(target: 'home' | 'away') {
  if (target === 'home' && homeScore.value > 0) homeScore.value--
  if (target === 'away' && awayScore.value > 0) awayScore.value--
}

// ─── 提交生成卡片 ───
function handleGenerate() {
  if (!selectedResult.value) return
  isGenerating.value = true

  const { submitPrediction } = usePredictions()
  submitPrediction(matchId, {
    result: selectedResult.value,
    score: !skipScore.value ? { home: homeScore.value, away: awayScore.value } : undefined,
  })

  // 异步向后端发送投票数据
  $fetch('/api/vote', {
    method: 'POST',
    body: { matchId, result: selectedResult.value }
  }).then((res: any) => {
    if (res && res.stats) {
      voteStats.value = res.stats
    }
  }).catch(err => console.error('Vote failed', err))

  setTimeout(() => {
    showCard.value = true
    isGenerating.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 800)
}

// ─── 从赛后验证进入卡片 ───
function handleShowHistoryCard() {
  if (myPrediction.value) {
    selectedResult.value = myPrediction.value.result as 'HOME_WIN' | 'AWAY_WIN' | 'DRAW'
    if (myPrediction.value.score) {
      homeScore.value = myPrediction.value.score.home
      awayScore.value = myPrediction.value.score.away
      skipScore.value = false
    } else {
      skipScore.value = true
    }
  }
  showCard.value = true
}

// ─── 重新预测 ───
function handleReset() {
  showCard.value = false
  if (isMatchFinished.value) {
    showValidation.value = true // 如果已完赛，点击返回则回到验证结果页
  } else {
    showValidation.value = false 
    selectedResult.value = null
    homeScore.value = 0
    awayScore.value = 0
    skipScore.value = false
  }
}

// ─── 分享参数 ───
const shareText = computed(() => {
  if (!match.value) return ''
  const homeName = locale.value === 'zh' ? match.value.homeTeam.nameZh : match.value.homeTeam.nameEn
  const awayName = locale.value === 'zh' ? match.value.awayTeam.nameZh : match.value.awayTeam.nameEn
  
  // 1. 如果是从验证结果过来的（且验证正确）
  if (isMatchFinished.value && myPrediction.value && isCorrect.value) {
    const scoreStr = `${match.value.score!.home}:${match.value.score!.away}`
    const text = t('share.predictionTexts.verified', { home: homeName, score: scoreStr, away: awayName })
    return `${text} ${t('share.hashtags')} #${match.value.homeTeam.nameEn}vs${match.value.awayTeam.nameEn}`.replace(/\s+/g, ' ')
  }

  // 2. 正常赛前预测
  let textPool: string[] = []
  let teamName = ''

  if (selectedResult.value === 'DRAW') {
    textPool = tm('share.predictionTexts.draw') as string[]
  } else {
    teamName = selectedResult.value === 'HOME_WIN' ? homeName : awayName
    
    // 判断是否是大比分屠杀局 (分差 >= 3)
    let isCrush = false
    if (!skipScore.value) {
      const diff = Math.abs(homeScore.value - awayScore.value)
      if (diff >= 3) isCrush = true
    }

    if (isCrush) {
      textPool = tm('share.predictionTexts.crush') as string[]
    } else {
      textPool = tm('share.predictionTexts.normal') as string[]
    }
  }

  // 随机抽取一条文案 (为了避免服务端与客户端 Hydration 不一致，这里采用简单的基于 matchId 伪随机)
  const randomIndex = matchId % (textPool.length || 1)
  let text = textPool[randomIndex] || ''
  
  if (teamName && typeof text === 'string') {
    text = text.replace('{team}', teamName)
  }

  // 拼接标签
  return `${text} ${t('share.hashtags')} #${match.value.homeTeam.nameEn}vs${match.value.awayTeam.nameEn}`.replace(/\s+/g, ' ')
})

const shareUrl = computed(() => {
  return `https://worldcupdex.org/predict/${matchId}?utm_source=share&utm_medium=card&utm_campaign=prediction`
})

const filename = computed(() => `worldcupdex-prediction-${matchId}.png`)

// ─── 世界杯历史战绩对比 ───
interface WcStat { appearances: number; titles: number; bestResult: string }
const wcStats = ref<Record<string, WcStat>>({})

onMounted(async () => {
  if (myPrediction.value) {
    if (match.value?.score) {
      showValidation.value = true
    } else {
      selectedResult.value = myPrediction.value.result as 'HOME_WIN' | 'AWAY_WIN' | 'DRAW'
      if (myPrediction.value.score) {
        homeScore.value = myPrediction.value.score.home
        awayScore.value = myPrediction.value.score.away
        skipScore.value = false
      } else {
        skipScore.value = true
      }
      showCard.value = true
    }
  }

  // 获取比赛投票数据
  $fetch(`/api/vote?matchId=${matchId}`).then(res => {
    if (res && typeof (res as any).total !== 'undefined') {
      voteStats.value = res as Record<string, number>
    }
  }).catch(err => console.error('Failed to load vote stats', err))

  try {
    const res = await $fetch<Record<string, WcStat>>('/api/wc-stats')
    wcStats.value = res
  }
  catch { /* 静默失败 */ }
})

const homeWcStat = computed<WcStat | null>(() =>
  match.value ? (wcStats.value[match.value.homeTeam.id] ?? null) : null,
)
const awayWcStat = computed<WcStat | null>(() =>
  match.value ? (wcStats.value[match.value.awayTeam.id] ?? null) : null,
)

function bestResultKey(result: string) {
  return `h2h.bestResult_${result}`
}

// ─── 比赛是否已过期/完赛 ───
const isMatchFinished = computed(() => {
  return !!match.value?.score
})
const isMatchLocked = computed(() => {
  if (!match.value) return false
  const matchTime = new Date(match.value.date + 'T' + match.value.time).getTime()
  return Date.now() >= matchTime
})

// ─── 辅助 ───
function getPredictionText(pred: any): string {
  if (pred.result === 'HOME_WIN') return t('predictDetail.homeWin')
  if (pred.result === 'AWAY_WIN') return t('predictDetail.awayWin')
  return t('predictDetail.draw')
}

function getTeamName(team: { nameZh: string; nameEn: string }) {
  return locale.value === 'zh' ? team.nameZh : team.nameEn
}
</script>

<template>
  <div class="predict-page">
    <div class="predict-page__container">
      <!-- Loading -->
      <div v-if="!match" class="predict-page__loading">
        <span>{{ t('common.loading') }}...</span>
      </div>

      <!-- 状态0：已预测且已完赛 (显示赛后验证) -->
      <ClientOnly>
        <template #fallback>
          <div class="predict-page__loading">
            <span>{{ t('common.loading') }}...</span>
          </div>
        </template>
        <template v-if="myPrediction && match && match.score && !showCard && showValidation">
          <div class="predict-page__validation">
            <div class="validation-card" :class="isCorrect ? 'validation-card--correct' : 'validation-card--wrong'">
              <div class="validation-icon">{{ isCorrect ? '🎉' : '💔' }}</div>
              <h3 class="validation-title">
                {{ isCorrect ? $t('predictDetail.correct') : $t('predictDetail.ruleWrong') }}
              </h3>
              
              <div class="validation-compare">
                <div class="compare-row">
                  <span class="compare-label">{{ $t('predictDetail.predicted') }}:</span>
                  <span class="compare-value">{{ getPredictionText(myPrediction) }}</span>
                </div>
                <div class="compare-row">
                  <span class="compare-label">{{ $t('predictDetail.actual') || 'Actual' }}:</span>
                  <span class="compare-value">
                    {{ match.score.home }} : {{ match.score.away }} 
                    ({{ match.score.home > match.score.away ? $t('predictDetail.homeWin') : (match.score.home < match.score.away ? $t('predictDetail.awayWin') : $t('predictDetail.draw')) }})
                  </span>
                </div>
              </div>
              
              <button class="predict-page__submit-btn mt-6" @click="handleShowHistoryCard">
                {{ $t('predict.generateCard') }}
              </button>
            </div>
          </div>
        </template>
      </ClientOnly>

      <!-- 状态1：选择预测 -->
      <template v-if="!showCard && match && (!myPrediction || !match.score || !showValidation)">
        <!-- 比赛信息卡片 -->
        <div class="predict-page__match-card">
          <div class="predict-page__match-teams">
            <div class="predict-page__match-team">
              <img
                :src="`https://flagcdn.com/w160/${match.homeTeam.code.toLowerCase()}.png`"
                :alt="match.homeTeam.nameEn"
                class="predict-page__match-flag"
                crossorigin="anonymous"
              >
              <span class="predict-page__match-team-name">{{ getTeamName(match.homeTeam) }}</span>
            </div>

            <div class="predict-page__match-vs">
              <span class="predict-page__match-vs-text">VS</span>
              <span v-if="match.group" class="predict-page__match-group">{{ match.group }}{{ t('predictDetail.groupMatch') }}</span>
            </div>

            <div class="predict-page__match-team">
              <img
                :src="`https://flagcdn.com/w160/${match.awayTeam.code.toLowerCase()}.png`"
                :alt="match.awayTeam.nameEn"
                class="predict-page__match-flag"
                crossorigin="anonymous"
              >
              <span class="predict-page__match-team-name">{{ getTeamName(match.awayTeam) }}</span>
            </div>
          </div>

          <div class="predict-page__match-meta">
            <div class="flex items-center gap-2 justify-center">
              <span>📅 {{ match.date }} {{ match.time }}</span>
              <AddToCalendarButton 
                :matches="match" 
                dropdownPosition="right"
                customClass="!text-gray-600 !bg-white !border-gray-200 hover:!bg-gray-50 hover:!border-gray-300 !shadow-sm"
              />
            </div>
            <span>📍 {{ locale === 'zh' ? match.venue.nameZh : match.venue.name }} · {{ locale === 'zh' ? match.venue.cityZh : match.venue.city }}</span>
          </div>
        </div>

        <!-- 世界杯历史战绩对比 -->
        <div class="predict-page__h2h">
          <div class="predict-page__h2h-title">📊 {{ t('h2h.title') }}</div>
          <div class="predict-page__h2h-cols">
            <!-- 主队 -->
            <div class="predict-page__h2h-col">
              <img
                :src="`https://flagcdn.com/w80/${match!.homeTeam.code.toLowerCase()}.png`"
                :alt="match!.homeTeam.nameEn"
                class="predict-page__h2h-flag"
              >
              <span class="predict-page__h2h-col-name">{{ getTeamName(match!.homeTeam) }}</span>
              <template v-if="homeWcStat">
                <div class="predict-page__h2h-stat-row">
                  <span class="predict-page__h2h-stat-label">{{ t('h2h.appearances') }}</span>
                  <span class="predict-page__h2h-stat-val">{{ homeWcStat.appearances || '—' }}</span>
                </div>
                <div class="predict-page__h2h-stat-row">
                  <span class="predict-page__h2h-stat-label">{{ t('h2h.titles') }}</span>
                  <span class="predict-page__h2h-stat-val" :class="{ 'predict-page__h2h-gold': homeWcStat.titles > 0 }">
                    {{ homeWcStat.titles || '—' }}
                  </span>
                </div>
                <div class="predict-page__h2h-stat-row">
                  <span class="predict-page__h2h-stat-label">{{ t('h2h.bestResult') }}</span>
                  <span class="predict-page__h2h-stat-val predict-page__h2h-best">{{ t(bestResultKey(homeWcStat.bestResult)) }}</span>
                </div>
              </template>
              <div v-else class="predict-page__h2h-no-data">—</div>
            </div>

            <!-- 分隔线 -->
            <div class="predict-page__h2h-divider" />

            <!-- 客队 -->
            <div class="predict-page__h2h-col">
              <img
                :src="`https://flagcdn.com/w80/${match!.awayTeam.code.toLowerCase()}.png`"
                :alt="match!.awayTeam.nameEn"
                class="predict-page__h2h-flag"
              >
              <span class="predict-page__h2h-col-name">{{ getTeamName(match!.awayTeam) }}</span>
              <template v-if="awayWcStat">
                <div class="predict-page__h2h-stat-row">
                  <span class="predict-page__h2h-stat-label">{{ t('h2h.appearances') }}</span>
                  <span class="predict-page__h2h-stat-val">{{ awayWcStat.appearances || '—' }}</span>
                </div>
                <div class="predict-page__h2h-stat-row">
                  <span class="predict-page__h2h-stat-label">{{ t('h2h.titles') }}</span>
                  <span class="predict-page__h2h-stat-val" :class="{ 'predict-page__h2h-gold': awayWcStat.titles > 0 }">
                    {{ awayWcStat.titles || '—' }}
                  </span>
                </div>
                <div class="predict-page__h2h-stat-row">
                  <span class="predict-page__h2h-stat-label">{{ t('h2h.bestResult') }}</span>
                  <span class="predict-page__h2h-stat-val predict-page__h2h-best">{{ t(bestResultKey(awayWcStat.bestResult)) }}</span>
                </div>
              </template>
              <div v-else class="predict-page__h2h-no-data">—</div>
            </div>
          </div>
        </div>

        <!-- 预测表单 -->
        <div class="predict-page__form">
          <!-- Section 1: 预测结果 -->
          <div class="predict-page__section">
            <h3 class="predict-page__section-title">{{ t('predictDetail.section1Title') }}</h3>
            <div class="predict-page__result-grid">
              <button
                class="predict-page__result-btn"
                :class="{ 'predict-page__result-btn--active': selectedResult === 'HOME_WIN' }"
                @click="selectedResult = 'HOME_WIN'"
              >
                <div v-if="selectedResult === 'HOME_WIN'" class="predict-page__check-icon">✓</div>
                <img
                  :src="`https://flagcdn.com/w80/${match.homeTeam.code.toLowerCase()}.png`"
                  :alt="match.homeTeam.nameEn"
                  class="predict-page__result-btn-flag"
                >
                <span class="predict-page__result-btn-text">{{ getTeamName(match.homeTeam) }} {{ t('predictDetail.homeWin') }}</span>
              </button>
              <button
                class="predict-page__result-btn"
                :class="{ 'predict-page__result-btn--active': selectedResult === 'DRAW' }"
                @click="selectedResult = 'DRAW'"
              >
                <div v-if="selectedResult === 'DRAW'" class="predict-page__check-icon">✓</div>
                <span class="predict-page__result-btn-icon">⚽</span>
                <span class="predict-page__result-btn-text">{{ t('predictDetail.draw') }}</span>
              </button>
              <button
                class="predict-page__result-btn"
                :class="{ 'predict-page__result-btn--active': selectedResult === 'AWAY_WIN' }"
                @click="selectedResult = 'AWAY_WIN'"
              >
                <div v-if="selectedResult === 'AWAY_WIN'" class="predict-page__check-icon">✓</div>
                <img
                  :src="`https://flagcdn.com/w80/${match.awayTeam.code.toLowerCase()}.png`"
                  :alt="match.awayTeam.nameEn"
                  class="predict-page__result-btn-flag"
                >
                <span class="predict-page__result-btn-text">{{ getTeamName(match.awayTeam) }} {{ t('predictDetail.awayWin') }}</span>
              </button>
            </div>
          </div>

          <!-- Section 2: 预测比分（可选） -->
          <div class="predict-page__section">
            <div class="predict-page__section-header">
              <h3 class="predict-page__section-title">{{ t('predictDetail.section2Title') }}</h3>
              <label class="predict-page__toggle">
                <input v-model="skipScore" type="checkbox">
                <span class="predict-page__toggle-label">{{ t('predictDetail.skip') }}</span>
              </label>
            </div>
            <div v-if="!skipScore" class="predict-page__score-row">
              <div class="predict-page__score-stepper">
                <button class="predict-page__score-btn" @click="decrement('home')">−</button>
                <span class="predict-page__score-value">{{ homeScore }}</span>
                <button class="predict-page__score-btn" @click="increment('home')">+</button>
              </div>
              <span class="predict-page__score-colon">:</span>
              <div class="predict-page__score-stepper">
                <button class="predict-page__score-btn" @click="decrement('away')">−</button>
                <span class="predict-page__score-value">{{ awayScore }}</span>
                <button class="predict-page__score-btn" @click="increment('away')">+</button>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <button
            v-if="!isMatchLocked && !isMatchFinished"
            class="predict-page__submit-btn flex items-center justify-center space-x-2"
            :disabled="!selectedResult || isGenerating"
            @click="handleGenerate"
          >
            <span v-if="isGenerating" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isGenerating ? $t('predictDetail.predicting') : t('predict.generateCard') }}</span>
          </button>
          <div v-else class="predict-page__locked-msg">
            ⚠️ 比赛已开始或已结束，停止预测
          </div>

          <!-- 显示匿名投票进度 -->
          <div v-if="voteStats && voteStats.total > 0 && selectedResult" class="mt-4 text-center text-sm text-gray-500 font-medium animate-fade-in">
            {{ $t('predictDetail.voteStats', { 
                percent: Math.round((voteStats[selectedResult] || 0) / voteStats.total * 100),
                result: selectedResult === 'HOME_WIN' ? $t('predictDetail.homeWin') : (selectedResult === 'AWAY_WIN' ? $t('predictDetail.awayWin') : $t('predictDetail.draw'))
            }) }}
          </div>

          <!-- 底部提示 -->
          <p class="predict-page__hint">{{ t('predictDetail.hint') }}</p>
        </div>
      </template>

      <!-- 状态2：展示卡片 -->
      <template v-if="showCard && match">
        <div class="predict-page__card-wrapper">
          <div ref="cardRef">
            <PredictionCard
              :home-team="match.homeTeam"
              :away-team="match.awayTeam"
              :group="match.group"
              :match-date="match.date"
              :match-time="match.time"
              :venue="locale === 'zh' ? match.venue.nameZh : match.venue.name"
              :city="locale === 'zh' ? match.venue.cityZh : match.venue.city"
              :predicted-result="selectedResult!"
              :predicted-score="!skipScore ? { home: homeScore, away: awayScore } : undefined"
              :locale="locale"
            />
          </div>
        </div>

        <!-- 分享面板 -->
        <div class="predict-page__share">
          <SharePanel
            :share-text="shareText"
            :share-url="shareUrl"
            :card-ref="cardRef"
            :filename="filename"
            save-button-text="保存预测卡片"
            share-title="分享给好友"
          />
        </div>

        <!-- External Cta 广告组件 -->
        <KickiqCta source="quiz_result" class="my-6" />

        <!-- 重新预测 -->
        <div class="predict-page__reset">
          <button v-if="!isMatchFinished" class="predict-page__reset-btn" @click="handleReset">
            ← {{ t('predict.rePredict') }}
          </button>
          <button v-else class="predict-page__reset-btn" @click="handleReset">
            ← 返回验证结果
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.predict-page {
  min-height: 100vh;
  background: #f0f4f8;
  padding: 40px 16px;
}

.predict-page__container {
  max-width: 640px;
  margin: 0 auto;
}

.predict-page__loading {
  text-align: center;
  color: #6b7280;
  padding: 80px 0;
  font-size: 16px;
}

/* ===== 验证结果 ===== */
.predict-page__validation {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.validation-card {
  width: 100%;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  border-top: 6px solid #ccc;
}
.validation-card--correct {
  border-top-color: #10b981;
}
.validation-card--wrong {
  border-top-color: #ef4444;
}
.validation-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.validation-title {
  font-size: 24px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 24px;
}
.validation-compare {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.compare-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
}
.compare-label {
  color: #6b7280;
  font-weight: 500;
}
.compare-value {
  color: #1a1a2e;
  font-weight: 700;
}

/* ===== 比赛信息卡片 ===== */
.predict-page__match-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 36px 24px 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.predict-page__match-teams {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
}

.predict-page__match-team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.predict-page__match-flag {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e8edf2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.predict-page__match-team-name {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  text-align: center;
}

.predict-page__match-vs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.predict-page__match-vs-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #4A90D9;
}

.predict-page__match-group {
  font-size: 12px;
  font-weight: 600;
  color: #b45309;
  background: #fef3c7;
  padding: 3px 12px;
  border-radius: 10px;
}

.predict-page__match-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

/* ===== 世界杯历史战绩对比 ===== */
.predict-page__h2h {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.predict-page__h2h-title {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 16px;
  letter-spacing: 0.3px;
}

.predict-page__h2h-cols {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.predict-page__h2h-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.predict-page__h2h-flag {
  width: 44px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.10);
}

.predict-page__h2h-col-name {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a2e;
  text-align: center;
  line-height: 1.3;
}

.predict-page__h2h-stat-row {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 8px;
  border-radius: 8px;
  background: #f9fafb;
}

.predict-page__h2h-stat-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #9ca3af;
}

.predict-page__h2h-stat-val {
  font-size: 16px;
  font-weight: 800;
  color: #1a1a2e;
}

.predict-page__h2h-gold {
  color: #d97706;
}

.predict-page__h2h-best {
  font-size: 13px;
  font-weight: 700;
  color: #4A90D9;
}

.predict-page__h2h-divider {
  width: 1px;
  background: #e5e7eb;
  align-self: stretch;
  margin: 0 12px;
  flex-shrink: 0;
}

.predict-page__h2h-no-data {
  font-size: 20px;
  color: #d1d5db;
  padding: 16px 0;
}

/* ===== 预测表单 ===== */
.predict-page__form {
  background: #ffffff;
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.predict-page__section {
  margin-bottom: 28px;
}

.predict-page__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.predict-page__section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 16px;
}

.predict-page__section-header .predict-page__section-title {
  margin: 0;
}

/* 结果按钮 */
.predict-page__result-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.predict-page__result-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px 12px;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.predict-page__result-btn:hover {
  border-color: #93c5fd;
  background: #f8faff;
}

.predict-page__result-btn--active {
  border-color: #4A90D9;
  background: #f0f7ff;
  color: #4A90D9;
}

.predict-page__check-icon {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #4A90D9;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(74, 144, 217, 0.3);
}

.predict-page__result-btn-flag {
  width: 40px;
  height: 28px;
  object-fit: cover;
  border-radius: 4px;
}

.predict-page__result-btn-icon {
  font-size: 28px;
  line-height: 1;
}

.predict-page__result-btn-text {
  font-size: 14px;
  font-weight: 600;
}

/* 比分输入 */
.predict-page__toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #6b7280;
  font-size: 14px;
}

.predict-page__toggle input {
  accent-color: #4A90D9;
  width: 16px;
  height: 16px;
}

.predict-page__toggle-label {
  font-size: 14px;
}

.predict-page__score-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 16px 0;
}

.predict-page__score-stepper {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.predict-page__score-btn {
  width: 44px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border: none;
  color: #374151;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.predict-page__score-btn:hover {
  background: #e5e7eb;
}

.predict-page__score-btn:active {
  background: #d1d5db;
}

.predict-page__score-value {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 700;
  color: #1a1a2e;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
}

.predict-page__score-colon {
  font-size: 28px;
  font-weight: 700;
  color: #6b7280;
}

/* 提交按钮 */
.predict-page__submit-btn {
  display: block;
  width: 88%;
  margin: 0 auto;
  padding: 16px;
  background: linear-gradient(135deg, #F5A623, #F7C948);
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(245, 166, 35, 0.3);
}

.predict-page__submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(245, 166, 35, 0.4);
}

.predict-page__submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

/* 底部提示 */
.predict-page__hint {
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  margin: 14px 0 0;
}

.predict-page__locked-msg {
  text-align: center;
  color: #ef4444;
  font-weight: 600;
  padding: 16px;
  background: #fee2e2;
  border-radius: 12px;
  margin: 0 auto;
  width: 88%;
}

/* ===== 卡片展示 ===== */
.predict-page__card-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

/* 分享面板容器 */
.predict-page__share {
  width: 100%;
  max-width: 500px;
  margin: 0 auto 20px;
}

/* SharePanel 浅色主题覆盖（与冠军预测页一致） */
.predict-page__share :deep(.share-panel__header-text) {
  color: #4B5563;
}
.predict-page__share :deep(.share-panel__diamond) {
  color: rgba(255, 165, 0, 0.7);
}
.predict-page__share :deep(.share-panel__deco-line) {
  background: linear-gradient(90deg, transparent, rgba(0, 15, 73, 0.2), transparent);
}
.predict-page__share :deep(.share-panel__label) {
  color: #4B5563;
}
.predict-page__share :deep(.share-panel__btn) {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  color: #1A1A1A;
  box-shadow: 0 2px 8px rgba(15, 32, 80, 0.05);
}
.predict-page__share :deep(.share-panel__btn:hover) {
  background: #F8FAFF;
  border-color: #2D7AF6;
  box-shadow: 0 4px 12px rgba(45, 122, 246, 0.18);
}
.predict-page__share :deep(.share-panel__btn:last-child .share-panel__icon) {
  background: #1A237E !important;
}

/* 重新预测按钮 */
.predict-page__reset {
  text-align: center;
  margin-bottom: 40px;
  margin-top: 20px;
}

.predict-page__reset-btn {
  padding: 10px 24px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.predict-page__reset-btn:hover {
  background: #F3F4F6;
  color: #000F49;
  border-color: #2D7AF6;
}

/* ===== 响应式 ===== */
@media (max-width: 480px) {
  .predict-page {
    padding: 24px 12px;
  }

  .predict-page__match-flag {
    width: 72px;
    height: 72px;
  }

  .predict-page__match-team-name {
    font-size: 18px;
  }

  .predict-page__result-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .predict-page__result-btn {
    flex-direction: row;
    padding: 16px 20px;
    gap: 12px;
  }

  .predict-page__check-icon {
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
  }
}
</style>
