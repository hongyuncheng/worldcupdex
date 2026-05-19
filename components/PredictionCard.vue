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
        <span class="prediction-card__header-title">⚽ MY PREDICTION</span>
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
        <p class="prediction-card__result-text">{{ predictionText }}</p>
      </section>

      <!-- 赛事信息 -->
      <section class="prediction-card__info">
        <p class="prediction-card__info-line">{{ matchInfoLine }}</p>
        <p class="prediction-card__info-venue">📍 {{ venue }} · {{ city }}</p>
      </section>

      <!-- Footer -->
      <footer class="prediction-card__footer">
        <span class="prediction-card__footer-deco">─── WorldCupDex ───</span>
        <span class="prediction-card__footer-cta">你也来预测 → worldcupdex.org</span>
        <span class="prediction-card__brand-watermark">{{ brandDomain }} · {{ brandSlogan }}</span>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.prediction-card {
  position: relative;
  width: 400px;
  height: 520px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #000F49 0%, #1A237E 100%);
  font-family: 'Inter', 'Montserrat', sans-serif;
  color: #ffffff;
  box-shadow: 0 8px 32px rgba(0, 15, 73, 0.4);
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
  padding: 28px 24px 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Header */
.prediction-card__header {
  text-align: center;
  margin-bottom: 28px;
}

.prediction-card__header-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #FFD700;
  text-shadow: 0 1px 6px rgba(255, 215, 0, 0.5);
}

/* 球队区域 */
.prediction-card__teams {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 28px;
}

.prediction-card__team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.prediction-card__flag-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 215, 0, 0.4);
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
}

.prediction-card__flag {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.prediction-card__team-name {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
}

.prediction-card__team-name-en {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.prediction-card__vs {
  font-family: 'Montserrat', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

/* 预测结果区域 */
.prediction-card__result {
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  text-align: center;
}

.prediction-card__result-text {
  font-size: 16px;
  font-weight: 700;
  color: #FFD700;
  margin: 0;
  text-shadow: 0 1px 4px rgba(255, 215, 0, 0.3);
}

/* 赛事信息 */
.prediction-card__info {
  text-align: center;
  margin-bottom: auto;
}

.prediction-card__info-line {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 6px;
}

.prediction-card__info-venue {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* Footer */
.prediction-card__footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.prediction-card__footer-deco {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 1px;
}

.prediction-card__footer-cta {
  font-size: 12px;
  color: rgba(255, 215, 0, 0.7);
  font-weight: 500;
}

.prediction-card__brand-watermark {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 0.6px;
  margin-top: 2px;
}
</style>
