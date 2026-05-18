<script setup lang="ts">
import { TEAM_COLORS, DEFAULT_TEAM_COLORS } from '~/data/team-colors'

const props = defineProps<{
  teamId: string
  teamName: string
  teamNameEn: string
  teamFlag: string
  teamCode: string
}>()

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
// 品牌水印：去除协议前缀显示域名
const brandDomain = computed(() => {
  const url = (runtimeConfig.public?.siteUrl as string) || 'https://worldcupdex.org'
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
})
const brandSlogan = computed(() => t('share.watermarkSlogan'))

// 获取球队配色
const teamColors = computed(() => {
  return TEAM_COLORS[props.teamId] || DEFAULT_TEAM_COLORS
})

const bgGradient = computed(() => {
  const colors = teamColors.value
  if (TEAM_COLORS[props.teamId]) {
    return `linear-gradient(160deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
  }
  return 'linear-gradient(160deg, #000F49 0%, #1A237E 100%)'
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

// 国旗 URL（使用 w160 高清版本）
const flagUrl = computed(() => {
  return `https://flagcdn.com/w160/${props.teamCode.toLowerCase()}.png`
})
</script>

<template>
  <div class="champion-card" :style="{ background: bgGradient }">
    <!-- 装饰光晕 -->
    <div class="champion-card__glow" />

    <!-- 内容 -->
    <div class="champion-card__content">
      <!-- Header -->
      <header class="champion-card__header">
        <span class="champion-card__trophy">🏆</span>
        <span class="champion-card__title">CHAMPION PREDICTION</span>
      </header>

      <!-- 国旗区域 -->
      <div class="champion-card__flag-wrapper">
        <div class="champion-card__flag-circle">
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
        <p class="champion-card__prediction-text">
          我押 <strong>{{ teamName }}</strong> 夺冠！
        </p>
        <p class="champion-card__prediction-en">
          {{ teamNameEn }}
        </p>
      </div>

      <!-- 时间信息 -->
      <div class="champion-card__meta">
        <div class="champion-card__meta-item">
          <span class="champion-card__meta-label">预测时间</span>
          <span class="champion-card__meta-value">{{ formattedDate }}</span>
        </div>
        <div class="champion-card__meta-divider" />
        <div class="champion-card__meta-item">
          <span class="champion-card__meta-label">距开幕</span>
          <span class="champion-card__meta-value champion-card__meta-value--highlight">
            {{ daysToGo }} 天
          </span>
        </div>
      </div>

      <!-- Footer -->
      <footer class="champion-card__footer">
        <span class="champion-card__footer-line">─── WorldCupDex ───</span>
        <span class="champion-card__footer-cta">你选谁？→ worldcupdex.org</span>
        <span class="champion-card__brand-watermark">{{ brandDomain }} · {{ brandSlogan }}</span>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.champion-card {
  position: relative;
  width: 400px;
  height: 520px;
  border-radius: 20px;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  color: #ffffff;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.15),
    0 20px 60px rgba(0, 0, 0, 0.4);
}

.champion-card__glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.08) 0%, transparent 60%);
  pointer-events: none;
}

.champion-card__content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 32px 28px 24px;
}

/* Header */
.champion-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.champion-card__trophy {
  font-size: 24px;
}

.champion-card__title {
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #FFD700;
  text-shadow: 0 1px 8px rgba(255, 215, 0, 0.5);
}

/* 国旗圆形区域 */
.champion-card__flag-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.champion-card__flag-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 215, 0, 0.6);
  box-shadow:
    0 0 20px rgba(255, 215, 0, 0.3),
    0 0 40px rgba(255, 215, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
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

.champion-card__prediction-text {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 6px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

.champion-card__prediction-text strong {
  color: #FFD700;
}

.champion-card__prediction-en {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 1px;
  margin: 0;
}

/* 时间元信息 */
.champion-card__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.champion-card__meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.champion-card__meta-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.champion-card__meta-value {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
}

.champion-card__meta-value--highlight {
  color: #FFD700;
  text-shadow: 0 0 6px rgba(255, 215, 0, 0.4);
}

.champion-card__meta-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.15);
}

/* Footer */
.champion-card__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.champion-card__footer-line {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2px;
}

.champion-card__footer-cta {
  font-size: 12px;
  color: rgba(255, 215, 0, 0.7);
  font-weight: 500;
}

.champion-card__brand-watermark {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 0.6px;
  margin-top: 2px;
}
</style>
