<script setup lang="ts">
const props = defineProps<{
  homeTeam: { nameZh: string; nameEn: string; code: string; flag: string }
  awayTeam: { nameZh: string; nameEn: string; code: string; flag: string }
  group: string | null
  matchDate: string
  matchTime: string
  venue: string
  city: string
  predictedResult: 'HOME_WIN' | 'AWAY_WIN' | 'DRAW'
  predictedScore?: { home: number; away: number }
  locale: string
}>()

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
// 品牌水印：去除协议前缀显示域名
const brandDomain = computed(() => {
  const url = (runtimeConfig.public?.siteUrl as string) || 'https://worldcupdex.org'
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
})
const brandSlogan = computed(() => t('share.watermarkSlogan'))

// 根据 locale 获取队名
function getTeamName(team: { nameZh: string; nameEn: string }) {
  return props.locale === 'zh' ? team.nameZh : team.nameEn
}

// 预测文案
const predictionText = computed(() => {
  const homeName = getTeamName(props.homeTeam)
  const awayName = getTeamName(props.awayTeam)

  if (props.predictedScore) {
    const { home, away } = props.predictedScore
    return props.locale === 'zh'
      ? `我预测：${homeName} ${home}:${away} ${awayName}`
      : `My Pick: ${homeName} ${home}:${away} ${awayName}`
  }

  if (props.predictedResult === 'HOME_WIN') {
    return props.locale === 'zh'
      ? `我预测：${homeName} 获胜`
      : `My Pick: ${homeName} Win`
  }
  if (props.predictedResult === 'AWAY_WIN') {
    return props.locale === 'zh'
      ? `我预测：${awayName} 获胜`
      : `My Pick: ${awayName} Win`
  }
  return props.locale === 'zh' ? '我预测：平局' : 'My Pick: Draw'
})

// 赛事信息行
const matchInfoLine = computed(() => {
  const groupText = props.group
    ? (props.locale === 'zh' ? `${props.group}组` : `Group ${props.group}`)
    : ''
  return `${groupText} · ${props.matchDate} ${props.matchTime}`
})

// 国旗 URL
function getFlagUrl(code: string) {
  return `https://flagcdn.com/w160/${code.toLowerCase()}.png`
}
</script>

<template>
  <div class="prediction-card">
    <!-- 背景图 -->
    <div class="prediction-card__bg" aria-hidden="true" />

    <!-- 内容 -->
    <div class="prediction-card__content">
      <!-- Header -->
      <header class="prediction-card__header">
        <span class="prediction-card__header-deco">◆</span>
        <span class="prediction-card__header-title">⚽ MY PREDICTION</span>
        <span class="prediction-card__header-deco">◆</span>
      </header>

      <!-- 双方球队 -->
      <section class="prediction-card__teams">
        <div class="prediction-card__team">
          <div class="prediction-card__flag-wrapper">
            <img
              :src="getFlagUrl(homeTeam.code)"
              :alt="homeTeam.nameEn"
              class="prediction-card__flag"
              crossorigin="anonymous"
            >
          </div>
          <span class="prediction-card__team-name">{{ getTeamName(homeTeam) }}</span>
          <span class="prediction-card__team-name-en">{{ homeTeam.nameEn }}</span>
        </div>

        <div class="prediction-card__vs">VS</div>

        <div class="prediction-card__team">
          <div class="prediction-card__flag-wrapper">
            <img
              :src="getFlagUrl(awayTeam.code)"
              :alt="awayTeam.nameEn"
              class="prediction-card__flag"
              crossorigin="anonymous"
            >
          </div>
          <span class="prediction-card__team-name">{{ getTeamName(awayTeam) }}</span>
          <span class="prediction-card__team-name-en">{{ awayTeam.nameEn }}</span>
        </div>
      </section>

      <!-- 预测结果区域 -->
      <section class="prediction-card__result">
        <span class="prediction-card__result-label">我的预测</span>
        <p class="prediction-card__result-text">{{ predictionText.replace(/^我预测：/, '') }}</p>
      </section>

      <!-- 赛事信息 -->
      <section class="prediction-card__info">
        <div class="prediction-card__info-item">
          <svg class="prediction-card__info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <div>
            <p class="prediction-card__info-label">比赛时间</p>
            <p class="prediction-card__info-value">{{ matchInfoLine }}</p>
          </div>
        </div>
        <div class="prediction-card__info-item">
          <svg class="prediction-card__info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <div>
            <p class="prediction-card__info-label">比赛场馆</p>
            <p class="prediction-card__info-value">{{ venue }} · {{ city }}</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="prediction-card__footer">
        <span class="prediction-card__footer-deco">◆ WorldCupDex ◆</span>
        <span class="prediction-card__footer-cta">你也来预测 → worldcupdex.org</span>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.prediction-card {
  position: relative;
  width: 400px;
  height: 520px;
  border-radius: 20px;
  overflow: hidden;
  background: #FFFFFF;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  color: #1F2937;
  box-shadow:
    0 12px 48px rgba(0, 15, 73, 0.10),
    0 4px 12px rgba(0, 15, 73, 0.06);
}

/* 背景图层 */
.prediction-card__bg {
  position: absolute;
  inset: 0;
  background-image: url('/images/prediction-card-bg.png');
  background-size: cover;
  background-position: center top;
  pointer-events: none;
  z-index: 0;
}

/* 内容层 */
.prediction-card__content {
  position: relative;
  z-index: 1;
  padding: 28px 24px 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Header */
.prediction-card__header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 24px;
}

.prediction-card__header-deco {
  font-size: 8px;
  color: #93C5FD;
}

.prediction-card__header-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #1E3A8A;
}

/* 球队区域 */
.prediction-card__teams {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 22px;
}

.prediction-card__team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.prediction-card__flag-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #E2E8F0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F8FAFC;
}

.prediction-card__flag {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.prediction-card__team-name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  text-align: center;
}

.prediction-card__team-name-en {
  font-size: 11px;
  color: #9CA3AF;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
}

.prediction-card__vs {
  font-family: 'Montserrat', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #3B82F6;
  flex-shrink: 0;
}

/* 预测结果区域 */
.prediction-card__result {
  background: #2563EB;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.prediction-card__result-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.15);
  padding: 3px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}

.prediction-card__result-text {
  font-size: 16px;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0;
  text-align: center;
  flex: 1;
}

/* 赛事信息 */
.prediction-card__info {
  display: flex;
  gap: 12px;
  margin-bottom: auto;
  padding: 14px 16px;
  background: rgba(248, 250, 252, 0.85);
  border-radius: 12px;
  border: 1px solid #E2E8F0;
}

.prediction-card__info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex: 1;
}

.prediction-card__info-icon {
  width: 16px;
  height: 16px;
  color: #3B82F6;
  flex-shrink: 0;
  margin-top: 2px;
}

.prediction-card__info-label {
  font-size: 10px;
  color: #9CA3AF;
  margin: 0 0 2px;
  font-weight: 500;
}

.prediction-card__info-value {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  line-height: 1.4;
}

/* Footer */
.prediction-card__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  margin: 0 -24px;
  padding: 12px 24px;
  background: #1E3A8A;
}

.prediction-card__footer-deco {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.80);
  letter-spacing: 1px;
}

.prediction-card__footer-cta {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 400;
}
</style>
