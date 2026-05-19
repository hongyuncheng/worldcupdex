<script setup lang="ts">
import { TEAM_COLORS, DEFAULT_TEAM_COLORS } from '~/data/team-colors'

const props = defineProps<{
  teamId: string
  teamName: string
  teamNameEn: string
  teamFlag: string
  teamCode: string
}>()

// 获取球队配色
const teamColors = computed(() => {
  return TEAM_COLORS[props.teamId] || DEFAULT_TEAM_COLORS
})

const accentColor = computed(() => {
  return teamColors.value.accent || '#2D7AF6'
})

// 格式化当前日期
const formattedDate = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
})

// 距 2026-06-11 开幕的倒计时天数
const daysToGo = computed(() => {
  const target = new Date('2026-06-11T00:00:00')
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return 0
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

// 国旗 URL
const flagUrl = computed(() => {
  return `https://flagcdn.com/w160/${props.teamCode.toLowerCase()}.png`
})
</script>

<template>
  <div class="champion-card">
    <!-- 背景图 -->
    <div class="champion-card__bg" aria-hidden="true" />

    <div class="champion-card__content">
      <!-- Header -->
      <header class="champion-card__header">
        <span class="champion-card__header-icon">🏆</span>
        <span class="champion-card__header-title">CHAMPION PREDICTION</span>
      </header>

      <!-- 主体内容 -->
      <div class="champion-card__body">
        <!-- 国旗 -->
        <div class="champion-card__flag-wrapper">
          <div class="champion-card__flag-ring" :style="{ borderColor: accentColor }">
            <img
              :src="flagUrl"
              :alt="teamNameEn"
              class="champion-card__flag-img"
              crossorigin="anonymous"
            >
          </div>
        </div>

        <!-- 预测文案 -->
        <div class="champion-card__prediction">
          <p class="champion-card__prediction-main">
            我押 <span class="champion-card__team-name" :style="{ color: accentColor }">{{ teamName }}</span> 夺冠！
          </p>
          <p class="champion-card__prediction-sub">
            {{ teamNameEn }}
          </p>
        </div>

        <!-- 时间信息 -->
        <div class="champion-card__meta">
          <div class="champion-card__meta-item">
            <svg class="champion-card__meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            <div class="champion-card__meta-info">
              <span class="champion-card__meta-label">预测时间</span>
              <span class="champion-card__meta-value">{{ formattedDate }}</span>
            </div>
          </div>
          <div class="champion-card__meta-divider" />
          <div class="champion-card__meta-item">
            <svg class="champion-card__meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <div class="champion-card__meta-info">
              <span class="champion-card__meta-label">距开幕</span>
              <span class="champion-card__meta-value champion-card__meta-value--highlight">{{ daysToGo }} 天</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="champion-card__footer">
        <span class="champion-card__brand">─── WorldCupDex ───</span>
        <span class="champion-card__brand-cta">你选谁？— worldcupdex.org</span>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.champion-card {
  position: relative;
  width: 360px;
  height: 520px;
  border-radius: 24px;
  overflow: hidden;
  background: #FFFFFF;
  box-shadow:
    0 12px 48px rgba(0, 15, 73, 0.1),
    0 4px 12px rgba(0, 15, 73, 0.06);
  font-family: 'Inter', 'PingFang SC', sans-serif;
  color: #1F2937;
}

/* 背景图层 */
.champion-card__bg {
  position: absolute;
  inset: 0;
  background-image: url('/images/champion-card-bg.png');
  background-size: cover;
  background-position: center top;
  pointer-events: none;
}

.champion-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 28px 24px 0;
}

/* Header */
.champion-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.champion-card__header-icon {
  font-size: 18px;
  line-height: 1;
}

.champion-card__header-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #9CA3AF;
}

/* Body */
.champion-card__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  flex: 1;
  justify-content: center;
}

/* 国旗 */
.champion-card__flag-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.champion-card__flag-ring {
  width: 108px;
  height: 108px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.champion-card__flag-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 预测文案 */
.champion-card__prediction {
  text-align: center;
}

.champion-card__prediction-main {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px;
  line-height: 1.3;
}

.champion-card__team-name {
  color: #2563EB;
}

.champion-card__prediction-sub {
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #9CA3AF;
  letter-spacing: 0.5px;
  margin: 0;
}

/* 时间元信息 */
.champion-card__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 18px;
  background: #F8FAFC;
  border-radius: 14px;
  border: 1px solid #E2E8F0;
}

.champion-card__meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.champion-card__meta-icon {
  width: 18px;
  height: 18px;
  color: #94A3B8;
  flex-shrink: 0;
}

.champion-card__meta-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.champion-card__meta-label {
  font-size: 11px;
  color: #94A3B8;
  font-weight: 500;
  line-height: 1;
}

.champion-card__meta-value {
  font-size: 14px;
  font-weight: 700;
  color: #1E293B;
  line-height: 1;
}

.champion-card__meta-value--highlight {
  color: #2563EB;
}

.champion-card__meta-divider {
  width: 1px;
  height: 30px;
  background: #E2E8F0;
}

/* Footer */
.champion-card__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 0 -24px;
  padding: 12px 24px;
  background: #1E3A8A;
}

.champion-card__brand {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 2px;
}

.champion-card__brand-cta {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 400;
  letter-spacing: 0.3px;
}

/* 响应式 */
@media (max-width: 640px) {
  .champion-card {
    width: 320px;
    height: 460px;
  }

  .champion-card__content {
    padding: 24px 20px 0;
  }

  .champion-card__prediction-main {
    font-size: 20px;
  }

  .champion-card__flag-ring {
    width: 96px;
    height: 96px;
  }

  .champion-card__meta {
    padding: 10px 14px;
    gap: 12px;
  }

  .champion-card__footer {
    margin: 0 -20px;
  }
}
</style>
