<template>
  <div class="predict-page">
    <!-- Hero 区域 -->
    <section class="predict-hero">
      <div class="hero__inner">
          <h1 class="hero__title">{{ $t('predict.titlePrefix') }}<span class="hero__title--highlight">{{ $t('predict.titleHighlight') }}</span></h1>
          <p class="hero__subtitle">{{ $t('predict.subtitle') }}</p>

          <!-- 双入口卡片 -->
          <div class="hero__actions">
            <NuxtLinkLocale to="/predict/champion" class="action-card">
              <div class="action-card__icon action-card__icon--champion">🏆</div>
              <div class="action-card__info">
                <span class="action-card__title">{{ $t('predict.champion') }}</span>
                <span class="action-card__desc">{{ $t('predict.championDesc') }}</span>
              </div>
              <span class="action-card__arrow">→</span>
            </NuxtLinkLocale>
            <NuxtLinkLocale to="/schedule" class="action-card">
              <div class="action-card__icon action-card__icon--match">⚽</div>
              <div class="action-card__info">
                <span class="action-card__title">{{ $t('predict.matchPredict') }}</span>
                <span class="action-card__desc">{{ $t('predict.matchPredictDesc') }}</span>
              </div>
              <span class="action-card__arrow">→</span>
            </NuxtLinkLocale>
          </div>
      </div>
    </section>

    <!-- 比赛列表区域 -->
    <section class="matches">
      <div class="matches__inner">
        <h2 class="section-title">📅 {{ $t('predict.upcoming') }}</h2>

        <!-- Loading -->
        <div v-if="pending" class="matches__loading">
          <div class="loading-spinner"></div>
        </div>

        <!-- Match List -->
        <div v-else class="match-list">
          <div
            v-for="match in filteredMatches"
            :key="match.id"
            class="match-item"
          >
            <!-- 左侧日期时间 -->
            <div class="match-item__date">
              <div class="match-item__date-day">{{ formatDateLine(match.date) }}</div>
              <div class="match-item__date-time">{{ match.time }}</div>
            </div>

            <!-- 分隔线 -->
            <div class="match-item__divider"></div>

            <!-- 队伍对阵 -->
            <div class="match-item__teams">
              <div class="match-item__team match-item__team--home">
                <img :src="match.homeTeam.flag" :alt="getTeamName(match.homeTeam)" class="match-item__flag" />
                <div class="match-item__team-info">
                  <span class="match-item__team-name">{{ getTeamName(match.homeTeam) }}</span>
                  <span v-if="match.group" class="match-item__group">{{ match.group }}{{ $t('predict.groupSuffix') }}</span>
                </div>
              </div>
              <span class="match-item__vs">vs</span>
              <div class="match-item__team match-item__team--away">
                <img :src="match.awayTeam.flag" :alt="getTeamName(match.awayTeam)" class="match-item__flag" />
                <div class="match-item__team-info">
                  <span class="match-item__team-name">{{ getTeamName(match.awayTeam) }}</span>
                  <span v-if="match.group" class="match-item__group">{{ match.group }}{{ $t('predict.groupSuffix') }}</span>
                </div>
              </div>
            </div>

            <!-- 右侧操作 -->
            <div class="match-item__action">
              <div class="predict-btns">
                <NuxtLinkLocale :to="`/predict/${match.id}`" class="btn-predict btn-predict--human">{{ $t('home.predictHuman') }}</NuxtLinkLocale>
                <button type="button" class="btn-predict btn-predict--ai" @click.prevent="handleAiPredict(match.homeTeam.nameEn, match.awayTeam.nameEn, 'predict_list_ai_btn')">{{ $t('home.predictAi') }}</button>
                <AddToCalendarButton :matches="match" dropdownPosition="right" customClass="!p-1 !text-gray-400 hover:!bg-gray-100 !border-transparent" buttonText="" />
              </div>
              <span class="match-item__deadline">{{ $t('predict.deadline') }}: {{ formatDeadline(match.date, match.time) }}</span>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="filteredMatches.length === 0 && !pending" class="matches__empty">
            {{ $t('predict.noUpcoming') }}
          </div>
        </div>

        <!-- 查看全部按钮 -->
        <div class="btn-view-more-wrapper">
          <NuxtLinkLocale to="/schedule" class="btn-view-more">
            {{ $t('predict.viewAllCount', { count: totalUpcoming }) }}
          </NuxtLinkLocale>
        </div>
      </div>
    </section>

    <!-- 我的预测卡集 -->
    <section v-if="myPredictions.length > 0" class="my-cards">
      <div class="my-cards__inner">
        <h2 class="section-title">🎯 {{ $t('predict.myPredictions') }}</h2>
        <div class="cards-scroll">
          <div
            v-for="pred in myPredictions"
            :key="pred.matchId"
            class="pred-card"
          >
            <div class="pred-card__match">{{ $t('predict.matchNo', { id: pred.matchId }) }}</div>
            <div class="pred-card__result">
              {{ getPredictionText(pred) }}
              <span v-if="pred.isCorrect === true" class="pred-card__badge pred-card__badge--correct">✅ {{ $t('predictDetail.correct') }}</span>
              <span v-else-if="pred.isCorrect === false" class="pred-card__badge pred-card__badge--wrong">❌ {{ $t('predictDetail.ruleWrong') }}</span>
              <span v-else class="pred-card__badge pred-card__badge--pending">⏳ {{ $t('predictDetail.predicted') }}</span>
            </div>
            <div v-if="pred.score" class="pred-card__score">
              {{ pred.score.home }} : {{ pred.score.away }}
            </div>
            <div class="pred-card__time">{{ formatPredictionTime(pred.timestamp) }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { MatchItem, ListResponse } from '~/types'

const { t, locale } = useI18n()
const { handleAiPredict } = useAiPredict()

// ─── SEO ───
useSeoConfig({
  title: t('predict.seoTitle'),
  description: t('predict.seoDesc'),
})

// ─── 获取即将开赛的比赛 ───
const { data: upcomingMatches, pending } = useUpcomingMatches(6)

// 过滤掉 TBD 球队的比赛
const filteredMatches = computed(() => {
  if (!upcomingMatches.value) return []
  return upcomingMatches.value.filter((match: MatchItem) => {
    return match.homeTeam.id !== 'TBD' && match.awayTeam.id !== 'TBD'
  })
})

// ─── 全部待预测比赛数 ───
const { data: allMatchesData } = useAsyncData<number>(
  'total-upcoming-matches',
  async () => {
    const response = await $fetch<ListResponse<MatchItem>>('/api/matches')
    if (!response.data) return 0
    const today = new Date().toISOString().split('T')[0]
    return response.data.filter(
      (m) => m.date >= today && m.homeTeam.id !== 'TBD' && m.awayTeam.id !== 'TBD',
    ).length
  },
)
const totalUpcoming = computed(() => allMatchesData.value || 0)

// ─── 获取本地预测记录 ───
const { getAllPredictions } = usePredictions()
const { data: allMatchesResponse } = useFetch<ListResponse<MatchItem>>('/api/matches')
const myPredictions = computed(() => {
  const preds = getAllPredictions()
  return preds.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6).map(pred => {
    // 查找比赛真实结果
    const match = allMatchesResponse.value?.data?.find(m => m.id === pred.matchId)
    let isCorrect: boolean | null = null
    if (match && match.score) {
      // 计算真实胜负
      const realResult = match.score.home > match.score.away ? 'HOME_WIN' : (match.score.home < match.score.away ? 'AWAY_WIN' : 'DRAW')
      isCorrect = realResult === pred.result
    }
    return { ...pred, match, isCorrect }
  })
})

// ─── 日期行格式化，根据语言切换格式 ───
function formatDateLine(date: string): string {
  const d = new Date(date + 'T00:00:00')
  if (locale.value === 'zh') {
    const month = d.getMonth() + 1
    const day = d.getDate()
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    return `${month}月${day}日 周${weekdays[d.getDay()]}`
  }
  return d.toLocaleDateString(locale.value === 'es' ? 'es-ES' : 'en-US', {
    month: 'short', day: 'numeric', weekday: 'short',
  })
}

// ─── 截止时间 (比赛前1分钟) ───
function formatDeadline(date: string, time: string): string {
  const d = new Date(date + 'T' + time)
  d.setMinutes(d.getMinutes() - 1)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}:00`
}

// ─── 获取队名 ───
function getTeamName(team: any): string {
  return locale.value === 'zh' ? team.nameZh : team.nameEn
}

// ─── 获取预测结果文案 ───
function getPredictionText(pred: any): string {
  if (pred.result === 'HOME_WIN') return t('predict.homeWin')
  if (pred.result === 'AWAY_WIN') return t('predict.awayWin')
  return t('predict.draw')
}

// ─── 预测时间格式化，根据语言切换格式 ───
function formatPredictionTime(timestamp: number): string {
  const d = new Date(timestamp)
  if (locale.value === 'zh') {
    const month = d.getMonth() + 1
    const day = d.getDate()
    return `${month}月${day}日`
  }
  return d.toLocaleDateString(locale.value === 'es' ? 'es-ES' : 'en-US', {
    month: 'short', day: 'numeric',
  })
}
</script>

<style scoped>
/* ===== Page ===== */
.predict-page {
  min-height: 100vh;
  background: #F5F7FA;
}

/* ===== Hero Section ===== */
.predict-hero {
  padding: 48px 24px 56px;
  background:
    linear-gradient(to bottom, transparent 85%, #F5F7FA 100%),
    url('/images/predict-hero-bg.png') right top / contain no-repeat;
  background-color: #fff;
  position: relative;
}
.predict-hero .hero__inner {
  max-width: 1100px;
  margin: 0 auto;
}
.hero__title {
  font-family: 'Montserrat', sans-serif;
  font-size: 2.8rem;
  font-weight: 800;
  color: #1A1A2E;
  margin: 0 0 12px 0;
  line-height: 1.2;
}
.hero__title--highlight {
  color: #2563EB;
}
.hero__subtitle {
  font-size: 16px;
  color: #6B7280;
  margin: 0 0 36px 0;
  line-height: 1.6;
}

/* ===== Action Cards ===== */
.hero__actions {
  display: flex;
  gap: 20px;
}
.action-card {
  width: 180px;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.25s ease;
  border: none;
  font-family: inherit;
  position: relative;
}
.action-card:hover {
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
  transform: translateY(-3px);
}
.action-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 14px;
}
.action-card__icon--champion {
  background: #FFF8E1;
}
.action-card__icon--match {
  background: #E3F2FD;
}
.action-card__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.action-card__title {
  font-size: 16px;
  font-weight: 700;
  color: #1A1A2E;
}
.action-card__desc {
  font-size: 12px;
  color: #6B7280;
  line-height: 1.4;
  text-align: center;
}
.action-card__arrow {
  margin-top: 14px;
  font-size: 20px;
  color: #2563EB;
  font-weight: 700;
}





/* ===== Matches Section ===== */
.matches {
  padding: 8px 24px 40px;
}
.matches__inner {
  max-width: 1100px;
  margin: 0 auto;
}
.section-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #1A1A2E;
  margin: 0 0 20px 0;
}

/* Loading */
.matches__loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}
.loading-spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #E5E7EB;
  border-top-color: #2563EB;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Match List */
.match-list {
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.match-item {
  display: flex;
  align-items: center;
  padding: 20px 28px;
  gap: 20px;
  border-bottom: 1px solid #F0F0F5;
  transition: background 0.15s;
}
.match-item:last-child {
  border-bottom: none;
}
.match-item:hover {
  background: #FAFBFC;
}

/* Date column */
.match-item__date {
  min-width: 120px;
  flex-shrink: 0;
}
.match-item__date-day {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 2px;
}
.match-item__date-time {
  font-size: 20px;
  font-weight: 700;
  color: #1A1A2E;
}

/* Divider */
.match-item__divider {
  width: 1px;
  height: 40px;
  background: #E5E7EB;
  flex-shrink: 0;
}

/* Teams */
.match-item__teams {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
.match-item__team {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 120px;
}
.match-item__team--home {
  justify-content: flex-end;
}
.match-item__team--away {
  justify-content: flex-start;
}
.match-item__flag {
  width: 36px;
  height: 25px;
  object-fit: cover;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}
.match-item__team-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.match-item__team-name {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A2E;
}
.match-item__group {
  font-size: 12px;
  color: #9CA3AF;
}
.match-item__vs {
  font-size: 14px;
  font-weight: 700;
  color: #9CA3AF;
  flex-shrink: 0;
}

/* Action column */
.match-item__action {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}
.predict-btns {
  display: flex;
  gap: 6px;
  align-items: center;
}
.btn-predict {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-predict--human {
  border: 1.5px solid #FFD700;
  color: #000F49;
  background: transparent;
}
.btn-predict--human:hover {
  background: #FFD700;
  color: #000F49;
}
.btn-predict--ai {
  border: 1.5px solid #7C3AED;
  color: #7C3AED;
  background: transparent;
}
.btn-predict--ai:hover {
  background: #7C3AED;
  color: #fff;
}
.match-item__deadline {
  font-size: 11px;
  color: #9CA3AF;
}

/* Empty state */
.matches__empty {
  padding: 48px 24px;
  text-align: center;
  color: #9CA3AF;
  font-size: 14px;
}

/* View all button */


/* ===== My Cards Section ===== */
.my-cards {
  padding: 8px 24px 60px;
}
.my-cards__inner {
  max-width: 1100px;
  margin: 0 auto;
}
.cards-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
}
.cards-scroll::-webkit-scrollbar {
  height: 4px;
}
.cards-scroll::-webkit-scrollbar-track {
  background: #F0F0F5;
  border-radius: 2px;
}
.cards-scroll::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 2px;
}
.pred-card {
  flex-shrink: 0;
  min-width: 160px;
  padding: 20px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pred-card__match {
  font-size: 13px;
  color: #9CA3AF;
}
.pred-card__result {
  font-size: 16px;
  font-weight: 700;
  color: #2563EB;
}
.pred-card__score {
  font-size: 14px;
  font-weight: 600;
  color: #1A1A2E;
}
.pred-card__time {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 4px;
}

.pred-card__badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
  font-weight: 600;
  vertical-align: middle;
}
.pred-card__badge--correct {
  background: #dcfce7;
  color: #166534;
}
.pred-card__badge--wrong {
  background: #fee2e2;
  color: #991b1b;
}
.pred-card__badge--pending {
  background: #f3f4f6;
  color: #4b5563;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .predict-hero {
    min-height: auto;
    height: auto;
    max-height: none;
    padding: 32px 16px 40px;
    background-size: auto 100%;
  }
  .hero__title {
    font-size: 2rem;
  }
  .hero__actions {
    flex-direction: column;
  }
  .action-card {
    max-width: 100%;
  }
  .matches {
    padding: 8px 16px 32px;
  }
  .match-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 20px;
  }
  .match-item__divider {
    display: none;
  }
  .match-item__date {
    min-width: auto;
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .match-item__date-time {
    font-size: 16px;
  }
  .match-item__teams {
    width: 100%;
    justify-content: flex-start;
  }
  .match-item__team {
    min-width: auto;
  }
  .match-item__team--home {
    justify-content: flex-start;
  }
  .match-item__action {
    align-self: flex-end;
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }
  .my-cards {
    padding: 8px 16px 48px;
  }
}
</style>
