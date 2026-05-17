<template>
  <div>
    <!-- Hero Section -->
    <section class="predict-hero">
      <div class="predict-hero-inner max-w-7xl mx-auto" style="padding-left: 16px; padding-right: 16px;">
        <!-- Left Content -->
        <div class="hero-left">
          <h1 class="hero-title">
            {{ $t('predict.heroTitle') }}
            <span class="hero-info-icon">ℹ</span>
          </h1>
          <p class="hero-subtitle">{{ $t('predict.heroSubtitle') }}</p>
          <div class="hero-stats">
            <span>⚽ {{ $t('predict.teams') }}</span>
            <span class="hero-stats-sep">·</span>
            <span>📋 {{ $t('predict.totalMatches') }}</span>
            <span class="hero-stats-sep">·</span>
            <span>🏆 {{ $t('predict.earnPoints') }}</span>
            <span class="hero-stats-sep">·</span>
            <span>🎯 {{ $t('predict.climbLeaderboard') }}</span>
          </div>
        </div>
        <!-- Right Countdown Card -->
        <div class="hero-countdown-card">
          <div class="countdown-stage">{{ $t('predict.groupStage') }}</div>
          <div class="countdown-label">{{ $t('predict.deadline') }}</div>
          <div class="countdown-numbers">
            <div class="countdown-item">
              <span class="countdown-value">{{ String(countdown.days).padStart(2, '0') }}</span>
              <span class="countdown-unit">{{ $t('predict.day') }}</span>
            </div>
            <div class="countdown-item">
              <span class="countdown-value">{{ String(countdown.hours).padStart(2, '0') }}</span>
              <span class="countdown-unit">{{ $t('predict.hour') }}</span>
            </div>
            <div class="countdown-item">
              <span class="countdown-value">{{ String(countdown.minutes).padStart(2, '0') }}</span>
              <span class="countdown-unit">{{ $t('predict.minute') }}</span>
            </div>
            <div class="countdown-item">
              <span class="countdown-value">{{ String(countdown.seconds).padStart(2, '0') }}</span>
              <span class="countdown-unit">{{ $t('predict.second') }}</span>
            </div>
          </div>
          <div class="countdown-deadline">{{ $t('predict.deadlineDate') }}</div>
        </div>
      </div>
    </section>

    <!-- Tab Navigation -->
    <div class="predict-tabs-wrapper">
      <div class="predict-tabs max-w-7xl mx-auto" style="padding-left: 16px; padding-right: 16px;">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="predict-tab"
          :class="{ 'predict-tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto" style="padding: 24px 16px;">
      <div class="predict-layout">
        <!-- Left Main -->
        <div class="predict-main">
          <!-- Match List Card -->
          <div class="predict-card">
            <h2 class="card-title">{{ $t('predict.pendingMatches') }} ({{ displayMatches.length }})</h2>
            <!-- Loading -->
            <div v-if="matchesPending" class="text-center py-12">
              <div class="animate-spin w-8 h-8 border-4 border-gray-200 border-t-[#FFD700] rounded-full mx-auto"></div>
            </div>
            <!-- Error -->
            <div v-else-if="matchesError" class="text-center py-12" style="color: #999; font-size: 14px;">
              加载失败，请稍后重试
            </div>
            <template v-else>
            <div class="match-list">
              <div v-for="(match, idx) in displayMatches" :key="match.id" class="match-item" :class="{ 'match-item--last': idx === displayMatches.length - 1 }">
                <!-- Date/Time -->
                <div class="match-date-col">
                  <div class="match-date">{{ formatDate(match.date) }} {{ getWeekday(match.date) }}</div>
                  <div class="match-time">{{ match.time }}</div>
                </div>
                <!-- Teams -->
                <div class="match-teams-col">
                  <div class="match-team match-team--home">
                    <img :src="match.homeTeam.flag" :alt="match.homeTeam.nameZh" class="team-flag-img" />
                    <div class="team-info">
                      <span class="team-name">{{ match.homeTeam.nameZh }}</span>
                      <span class="team-group">{{ match.group || '' }}{{ $t('schedule.groupSuffix') }}</span>
                    </div>
                  </div>
                  <span class="match-vs">vs</span>
                  <div class="match-team match-team--away">
                    <img :src="match.awayTeam.flag" :alt="match.awayTeam.nameZh" class="team-flag-img" />
                    <div class="team-info">
                      <span class="team-name">{{ match.awayTeam.nameZh }}</span>
                      <span class="team-group">{{ match.group || '' }}{{ $t('schedule.groupSuffix') }}</span>
                    </div>
                  </div>
                </div>
                <!-- Action -->
                <div class="match-action-col">
                  <NuxtLinkLocale :to="`/predict/${match.id}`" class="btn-go-predict">{{ $t('predict.goPredict') }}</NuxtLinkLocale>
                  <span class="match-deadline">{{ $t('predict.deadlinePrefix') }} {{ getDeadline(match.date, match.time) }}</span>
                </div>
              </div>
            </div>
            <!-- View More -->
            <div class="btn-view-more-wrapper">
              <button class="btn-view-more">{{ $t('predict.viewAllPending') }}</button>
            </div>
            </template>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="predict-sidebar">
          <!-- My Overview Card -->
          <div class="predict-card sidebar-card-gap">
            <div class="sidebar-header">
              <h3 class="sidebar-title">{{ $t('predict.myOverview') }}</h3>
              <a href="#" class="sidebar-link">{{ $t('predict.viewDetail') }}</a>
            </div>
            <div class="overview-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; text-align: center;">
              <div class="overview-item">
                <div class="overview-label">{{ $t('predict.predicted') }}</div>
                <div class="overview-value">12</div>
                <div class="overview-sub">{{ $t('predict.matches') }}</div>
              </div>
              <div class="overview-item">
                <div class="overview-label">{{ $t('predict.correct') }}</div>
                <div class="overview-value">8</div>
                <div class="overview-sub">{{ $t('predict.matches') }}</div>
              </div>
              <div class="overview-item">
                <div class="overview-label">{{ $t('predict.accuracy') }}</div>
                <div class="overview-value overview-value--gold">66.7%</div>
                <div class="overview-sub">{{ $t('predict.accuracy') }}</div>
              </div>
              <div class="overview-item">
                <div class="overview-label">{{ $t('predict.currentPoints') }}</div>
                <div class="overview-value">320</div>
                <div class="overview-sub">{{ $t('predict.points') }}</div>
              </div>
            </div>
          </div>

          <!-- Scoring Rules Card -->
          <div class="predict-card sidebar-card-gap">
            <div class="sidebar-header">
              <h3 class="sidebar-title">{{ $t('predict.scoringRules') }}</h3>
              <a href="#" class="sidebar-link">{{ $t('predict.viewAll') }}</a>
            </div>
            <div class="rules-list">
              <div class="rule-item">
                <span class="rule-icon">✅</span>
                <span class="rule-text">{{ $t('predict.ruleCorrectRegular') }}</span>
                <span class="rule-points">+10 {{ $t('predict.points') }}</span>
              </div>
              <div class="rule-item">
                <span class="rule-icon">🟡</span>
                <span class="rule-text">{{ $t('predict.ruleCorrectExtra') }}</span>
                <span class="rule-points">+20 {{ $t('predict.points') }}</span>
              </div>
              <div class="rule-item">
                <span class="rule-icon">🎯</span>
                <span class="rule-text">{{ $t('predict.ruleCorrectScore') }}</span>
                <span class="rule-points">+30 {{ $t('predict.points') }}</span>
              </div>
              <div class="rule-item">
                <span class="rule-icon">❌</span>
                <span class="rule-text">{{ $t('predict.ruleWrong') }}</span>
                <span class="rule-points">0 {{ $t('predict.points') }}</span>
              </div>
            </div>
          </div>

          <!-- Leaderboard Card -->
          <div class="predict-card" style="flex: 1;">
            <div class="sidebar-header">
              <h3 class="sidebar-title">{{ $t('predict.leaderboard') }}</h3>
              <a href="#" class="sidebar-link">{{ $t('predict.viewAll') }}</a>
            </div>
            <div class="leaderboard-list">
              <div v-for="(user, idx) in leaderboard" :key="idx" class="leaderboard-item">
                <span class="leaderboard-rank">{{ user.medal || user.rank }}</span>
                <span class="leaderboard-avatar">{{ user.avatar }}</span>
                <span class="leaderboard-name">{{ user.name }}</span>
                <span class="leaderboard-points">{{ user.points }} {{ $t('predict.points') }}</span>
              </div>
            </div>
            <!-- Login hint -->
            <div class="leaderboard-login">
              <span class="leaderboard-rank">-</span>
              <span class="leaderboard-avatar">👤</span>
              <span class="leaderboard-name">{{ $t('predict.loginToRank') }}</span>
              <span class="leaderboard-points">- {{ $t('predict.points') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- How To Section -->
      <div class="predict-card how-to-section">
        <h2 class="card-title" style="margin-bottom: 24px;">{{ $t('predict.howToPredict') }}</h2>
        <div class="how-to-grid" style="display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; gap: 16px; align-items: flex-start;">
          <div class="how-to-step">
            <div class="step-icon">📋</div>
            <div class="step-title">1. {{ $t('predict.step1Title') }}</div>
            <div class="step-desc">{{ $t('predict.step1Desc') }}</div>
          </div>
          <div class="how-to-arrow">→</div>
          <div class="how-to-step">
            <div class="step-icon">📊</div>
            <div class="step-title">2. {{ $t('predict.step2Title') }}</div>
            <div class="step-desc">{{ $t('predict.step2Desc') }}</div>
          </div>
          <div class="how-to-arrow">→</div>
          <div class="how-to-step">
            <div class="step-icon">⏰</div>
            <div class="step-title">3. {{ $t('predict.step3Title') }}</div>
            <div class="step-desc">{{ $t('predict.step3Desc') }}</div>
          </div>
          <div class="how-to-arrow">→</div>
          <div class="how-to-step">
            <div class="step-icon">🏆</div>
            <div class="step-title">4. {{ $t('predict.step4Title') }}</div>
            <div class="step-desc">{{ $t('predict.step4Desc') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MatchItem } from '~/types'

const { t } = useI18n()

// ─── SEO ───
useHead({
  title: () => `${t('predict.heroTitle')} - WorldCupDex`,
})

// ─── Tab State ───
const activeTab = ref('pending')

const tabs = computed(() => [
  { key: 'pending', label: t('predict.tabPending') },
  { key: 'group', label: t('predict.tabGroupStage') },
  { key: 'knockout', label: t('predict.tabKnockout') },
  { key: 'myPredictions', label: t('predict.tabMyPredictions') },
  { key: 'history', label: t('predict.tabHistory') },
  { key: 'rules', label: t('predict.tabRules') },
])

// ─── Countdown Logic ───
const deadline = new Date('2026-06-12T02:59:00').getTime()
const countdown = reactive({ days: 0, hours: 0, minutes: 0, seconds: 0 })

function updateCountdown() {
  const now = Date.now()
  const diff = Math.max(0, deadline - now)
  countdown.days = Math.floor(diff / (1000 * 60 * 60 * 24))
  countdown.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  countdown.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  countdown.seconds = Math.floor((diff % (1000 * 60)) / 1000)
}

let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// ─── Fetch Matches from API ───
const { data: upcomingMatches, pending: matchesPending, error: matchesError } = useUpcomingMatches(6)

const displayMatches = computed(() => upcomingMatches.value || [])

// ─── Date Formatting Helpers ───
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}月${day}日`
}

function getWeekday(dateStr: string): string {
  const d = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[d.getDay()]
}

function getDeadline(dateStr: string, time: string): string {
  // Deadline is 1 minute before match time
  const [hours, minutes] = time.split(':').map(Number)
  const deadlineMinutes = (hours * 60 + minutes - 1 + 24 * 60) % (24 * 60)
  const dH = String(Math.floor(deadlineMinutes / 60)).padStart(2, '0')
  const dM = String(deadlineMinutes % 60).padStart(2, '0')
  return `${dH}:${dM}:00`
}

// ─── Leaderboard Mock (用户交互数据，非外部 API) ───
const leaderboard = [
  { rank: 1, medal: '🥇', avatar: '👨‍💼', name: 'FootballKing', points: '2,580' },
  { rank: 2, medal: '🥈', avatar: '👨‍🎓', name: 'SoccerGuru', points: '2,310' },
  { rank: 3, medal: '🥉', avatar: '👨‍🔬', name: 'PredictMaster', points: '2,150' },
  { rank: 4, medal: '', avatar: '👦', name: '球迷小张', points: '1,980' },
  { rank: 5, medal: '', avatar: '👨‍🚀', name: 'Champion24', points: '1,875' },
]
</script>

<style scoped>
/* ===== Hero Section ===== */
.predict-hero {
  background: linear-gradient(135deg, #000F49 0%, #001A6E 100%);
  padding: 48px 0;
}
.predict-hero-inner {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
@media (min-width: 1024px) {
  .predict-hero-inner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.hero-left {
  flex: 1;
}
.hero-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 36px;
  font-weight: 800;
  color: #FFFFFF;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}
.hero-info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-style: normal;
}
.hero-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 20px 0;
}
.hero-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}
.hero-stats-sep {
  color: rgba(255, 255, 255, 0.4);
}

/* Countdown Card */
.hero-countdown-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px 32px;
  text-align: center;
  backdrop-filter: blur(8px);
  min-width: 320px;
}
.countdown-stage {
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #FFD700;
  margin-bottom: 4px;
}
.countdown-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16px;
}
.countdown-numbers {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 12px;
}
.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.countdown-value {
  font-family: 'Montserrat', sans-serif;
  font-size: 40px;
  font-weight: 800;
  color: #FFFFFF;
  line-height: 1.1;
}
.countdown-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}
.countdown-deadline {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

/* ===== Tabs ===== */
.predict-tabs-wrapper {
  background: #FFFFFF;
  border-bottom: 1px solid #E8E8E8;
}
.predict-tabs {
  display: flex;
  gap: 0;
  overflow-x: auto;
}
.predict-tab {
  padding: 16px 24px;
  font-size: 15px;
  font-weight: 500;
  color: #999;
  background: none;
  border: none;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}
.predict-tab:hover {
  color: #333;
}
.predict-tab--active {
  color: #000F49;
  font-weight: 700;
  border-bottom-color: #FFD700;
}

/* ===== Layout ===== */
.predict-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (min-width: 1024px) {
  .predict-layout {
    flex-direction: row;
    align-items: stretch;
  }
  .predict-main {
    flex: 1;
    min-width: 0;
  }
  .predict-sidebar {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
  }
}

/* ===== Card ===== */
.predict-card {
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
}
.sidebar-card-gap {
  margin-bottom: 16px;
}
.card-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #000F49;
  margin: 0 0 20px 0;
}

/* ===== Match List ===== */
.match-list {
  margin-bottom: 8px;
}
.match-item {
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #F0F0F0;
  gap: 20px;
}
.match-item--last {
  border-bottom: none;
}
.match-date-col {
  min-width: 90px;
  flex-shrink: 0;
}
.match-date {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}
.match-time {
  font-size: 15px;
  font-weight: 700;
  color: #000F49;
  margin-top: 2px;
}
.match-teams-col {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}
.match-team {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 140px;
}
.match-team--home {
  justify-content: flex-end;
}
.match-team--away {
  justify-content: flex-start;
}
.team-flag-img {
  width: 48px;
  height: 32px;
  object-fit: cover;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  flex-shrink: 0;
}
.team-info {
  display: flex;
  flex-direction: column;
}
.team-name {
  font-size: 15px;
  font-weight: 700;
  color: #000F49;
}
.team-group {
  font-size: 12px;
  color: #999;
  margin-top: 1px;
}
.match-vs {
  font-size: 15px;
  font-weight: 700;
  color: #999;
  flex-shrink: 0;
}
.match-action-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  min-width: 100px;
}
.btn-go-predict {
  background: transparent;
  color: #000F49;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
  padding: 7px 20px;
  border: 1.5px solid #FFD700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  text-decoration: none;
  display: inline-block;
}
.btn-go-predict:hover {
  background: #FFD700;
  color: #000F49;
}
.match-deadline {
  font-size: 12px;
  color: #999;
}

/* ===== Sidebar ===== */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.sidebar-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #000F49;
  margin: 0;
}
.sidebar-link {
  font-size: 13px;
  font-weight: 600;
  color: #FFD700;
  text-decoration: none;
}
.sidebar-link:hover {
  text-decoration: underline;
}

/* Overview Grid */
.overview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.overview-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}
.overview-value {
  font-family: 'Montserrat', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #000F49;
}
.overview-value--gold {
  color: #FFD700;
}
.overview-sub {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

/* Rules */
.rules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rule-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rule-icon {
  font-size: 16px;
  flex-shrink: 0;
}
.rule-text {
  flex: 1;
  font-size: 13px;
  color: #333;
}
.rule-points {
  font-size: 13px;
  font-weight: 700;
  color: #000F49;
  white-space: nowrap;
}

/* Leaderboard */
.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.leaderboard-item,
.leaderboard-login {
  display: flex;
  align-items: center;
  gap: 10px;
}
.leaderboard-login {
  margin-top: 12px;
  padding: 10px 12px;
  background: #F5F5F5;
  border-radius: 8px;
}
.leaderboard-rank {
  min-width: 20px;
  font-size: 14px;
  font-weight: 700;
  color: #666;
  text-align: center;
}
.leaderboard-avatar {
  font-size: 24px;
  line-height: 1;
}
.leaderboard-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.leaderboard-points {
  font-size: 13px;
  font-weight: 700;
  color: #000F49;
  white-space: nowrap;
}

/* ===== How To Section ===== */
.how-to-section {
  margin-top: 24px;
}
.how-to-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.step-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #E8F0FE;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 12px;
}
.step-title {
  font-size: 14px;
  font-weight: 700;
  color: #000F49;
  margin-bottom: 6px;
}
.step-desc {
  font-size: 13px;
  color: #999;
}
.how-to-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #CCC;
  padding-top: 12px;
}

/* Responsive: how-to grid */
@media (max-width: 768px) {
  .how-to-section .how-to-grid {
    grid-template-columns: 1fr !important;
    gap: 16px;
  }
  .how-to-arrow {
    display: none;
  }
  .match-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .match-teams-col {
    justify-content: flex-start;
  }
  .hero-countdown-card {
    min-width: auto;
  }
}
</style>
