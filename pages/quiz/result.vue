<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { getTitle } = useQuiz()

// 从 URL query 或 sessionStorage 读取结果（必须在 useSeoMeta 之前声明，避免 TDZ 错误）
const score = ref(0)
const correctCount = ref(0)
const totalQuestions = ref(5)
const timeSpent = ref(0)
const percentile = ref(0)

// OG Meta tags
useSeoMeta({
  title: () => `My World Cup IQ: ${score.value} | WorldCupDex`,
  ogTitle: () => `My World Cup IQ is ${score.value}! Can you beat me?`,
  ogDescription: () => `I scored ${score.value} on the WorldCupDex World Cup IQ Challenge, beating ${percentile.value}% of fans!`,
  ogImage: '/og/quiz-result.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

// Hreflang alternate links
useHreflang()

// 分享卡片 ref
const cardRef = ref<HTMLElement | null>(null)

// 分享文本
const shareText = computed(() => {
  return `I scored ${score.value} pts on the WorldCupDex World Cup IQ Quiz, beating ${percentile.value}% of fans! Can you beat me? 🏆⚽`
})

const shareUrl = computed(() => {
  if (import.meta.client) {
    return `${window.location.origin}${localePath('/quiz')}?score=${score.value}&percentile=${percentile.value}`
  }
  return ''
})

const titleKey = computed(() => getTitle(score.value))



// ========== 进度环动画 ==========
const animatedScore = ref(0)
const RADIUS = 90
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const arcLength = CIRCUMFERENCE * 0.75 // 270° arc
const gapLength = CIRCUMFERENCE * 0.25 // 90° gap at bottom

const progressOffset = computed(() => arcLength * (1 - animatedScore.value / 100))

const dotAngle = computed(() => (135 + 270 * (animatedScore.value / 100)) * Math.PI / 180)
const dotX = computed(() => 100 + RADIUS * Math.cos(dotAngle.value))
const dotY = computed(() => 100 + RADIUS * Math.sin(dotAngle.value))

// 百分位高亮 HTML
const percentileHtml = computed(() => {
  const text = t('quiz.percentile', { percent: percentile.value })
  return text.replace(
    `${percentile.value}%`,
    `<span class="hl-gold">${percentile.value}%</span>`,
  )
})

// 分数动画
function animateScoreRing() {
  const target = score.value
  if (target <= 0) return
  const duration = 1500
  const startTime = performance.now()
  function step(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedScore.value = Math.round(eased * target)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function playAgain() {
  navigateTo(localePath('/quiz/play'))
}

// ========== 挂载 ==========
onMounted(() => {
  // 优先从 query 读取
  if (route.query.score) {
    score.value = parseInt(route.query.score as string, 10) || 0
    correctCount.value = parseInt(route.query.correct as string, 10) || 0
    totalQuestions.value = parseInt(route.query.total as string, 10) || 5
    timeSpent.value = parseInt(route.query.time as string, 10) || 0
    percentile.value = parseInt(route.query.percentile as string, 10) || 0
  } else {
    // 从 sessionStorage 读取
    try {
      const stored = sessionStorage.getItem('wcd_quiz_result')
      if (stored) {
        const result = JSON.parse(stored)
        score.value = result.score
        correctCount.value = result.correctCount
        totalQuestions.value = result.totalQuestions
        timeSpent.value = result.timeSpent
        percentile.value = result.percentile
      }
    } catch {
      // fallback
    }
  }
  // 延迟启动进度环动画
  nextTick(() => setTimeout(animateScoreRing, 300))
})
</script>

<template>
  <div class="qr-page">
    <!-- ====== Score Card ====== -->
    <div ref="cardRef" class="qr-card">
      <div class="qr-card__bg" :style="{ backgroundImage: `url(/images/quiz-result-bg.png)` }" />
      <div class="qr-card__overlay" />

      <div class="qr-card__body">
        <!-- Title -->
        <div class="qr-card__title">
          <span class="qr-deco-line" /><span class="qr-diamond">◆</span>
          <span>{{ t('quiz.resultTitle') }}</span>
          <span class="qr-diamond">◆</span><span class="qr-deco-line" />
        </div>

        <!-- SVG Progress Ring -->
        <div class="qr-ring">
          <svg viewBox="0 0 200 200" class="qr-ring__svg">
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stop-color="#FFD700" />
                <stop offset="100%" stop-color="#6366f1" />
              </linearGradient>
              <filter id="dotGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <!-- Background track -->
            <circle
              cx="100" cy="100" :r="RADIUS" fill="none"
              stroke="rgba(255,255,255,0.08)" stroke-width="8"
              :stroke-dasharray="`${arcLength} ${gapLength}`"
              stroke-linecap="round" transform="rotate(135,100,100)"
            />
            <!-- Progress arc -->
            <circle
              cx="100" cy="100" :r="RADIUS" fill="none"
              stroke="url(#ringGrad)" stroke-width="8"
              :stroke-dasharray="`${arcLength} ${gapLength}`"
              :stroke-dashoffset="progressOffset"
              stroke-linecap="round" transform="rotate(135,100,100)"
            />
            <!-- Glow dot at progress tip -->
            <circle
              v-if="animatedScore > 0"
              :cx="dotX" :cy="dotY" r="6"
              fill="#a78bfa" filter="url(#dotGlow)"
            />
          </svg>
          <div class="qr-ring__label">
            <span class="qr-ring__score">{{ animatedScore }}</span>
            <span class="qr-ring__pts">pts</span>
          </div>
        </div>

        <!-- Title Badge -->
        <div class="qr-badge">🏅 {{ t(titleKey) }}</div>

        <!-- Percentile (gold highlight via v-html) -->
        <p class="qr-percentile" v-html="percentileHtml" />

        <!-- Stats -->
        <div class="qr-stats">
          <span>{{ t('quiz.correctCount', { correct: correctCount, total: totalQuestions }) }}</span>
          <span class="qr-stats__sep">|</span>
          <span>{{ t('quiz.timeSpent', { time: timeSpent }) }}</span>
        </div>

        <!-- Watermark -->
        <div class="qr-watermark">🏆 WorldCupDex.org</div>
      </div>

    </div>

    <!-- ====== Share Panel ====== -->
    <SharePanel
      :share-text="shareText"
      :share-url="shareUrl"
      :card-ref="cardRef"
      filename="worldcupdex-iq-result.png"
      :save-button-text="t('quiz.saveImage')"
      :share-title="t('quiz.shareYourScore')"
    />

    <!-- ====== Play Again ====== -->
    <button class="qr-replay" @click="playAgain">
      <span>{{ t('quiz.playAgain') }}</span>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0115.36-6.36L21 8"/>
        <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 01-15.36 6.36L3 16"/>
      </svg>
    </button>

    <!-- ====== Recommend ====== -->
    <div class="qr-recommend">
      <div class="qr-section-header">
        <span class="qr-deco-line" /><span class="qr-diamond">◆</span>
        <span class="qr-section-header__text">{{ t('share.alsoTry') }}</span>
        <span class="qr-diamond">◆</span><span class="qr-deco-line" />
      </div>

      <div class="qr-recommend__grid">
        <NuxtLinkLocale to="/fan-card" class="qr-recommend__card">
          <span class="qr-recommend__icon pink">🎴</span>
          <span class="qr-recommend__text">{{ t('share.tryFanCard') }}</span>
          <span class="qr-recommend__arrow">›</span>
        </NuxtLinkLocale>
        <NuxtLinkLocale to="/teams" class="qr-recommend__card">
          <span class="qr-recommend__icon green">📋</span>
          <span class="qr-recommend__text">{{ t('share.viewTeam') }}</span>
          <span class="qr-recommend__arrow">›</span>
        </NuxtLinkLocale>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== Page ===== */
.qr-page {
  min-height: calc(100vh - 170px);
  background: linear-gradient(180deg, #000F49 0%, #0a0e2a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 60px;
  position: relative;
}

/* ===== Shared decorators ===== */
.qr-diamond {
  color: rgba(255, 215, 0, 0.55);
  font-size: 0.55rem;
  flex-shrink: 0;
}
.qr-deco-line {
  display: inline-block;
  width: 36px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  flex-shrink: 0;
}

/* ===== Score Card ===== */
.qr-card {
  position: relative;
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  border: 1.5px solid rgba(99, 102, 241, 0.45);
  box-shadow:
    0 0 25px rgba(99, 102, 241, 0.2),
    0 0 60px rgba(99, 102, 241, 0.08);
  overflow: hidden;
}
.qr-card__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center bottom;
}
.qr-card__overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 70% 60% at 50% 40%,
    rgba(10, 14, 42, 0.95) 0%,
    rgba(10, 14, 42, 0.8) 40%,
    rgba(10, 14, 42, 0.3) 70%,
    rgba(10, 14, 42, 0.05) 100%
  );
}
.qr-card__body {
  position: relative;
  z-index: 1;
  padding: 32px 28px 24px;
  text-align: center;
}

/* Card Title */
.qr-card__title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
}

/* ===== Progress Ring ===== */
.qr-ring {
  position: relative;
  width: 220px;
  height: 220px;
  margin: 0 auto 16px;
}
.qr-ring__svg {
  width: 100%;
  height: 100%;
}
.qr-ring__label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.qr-ring__score {
  font-family: 'Montserrat', sans-serif;
  font-size: 4.2rem;
  font-weight: 800;
  color: #FFD700;
  line-height: 1;
}
.qr-ring__pts {
  font-size: 1.1rem;
  color: rgba(255, 215, 0, 0.55);
  font-weight: 600;
  margin-top: 2px;
}

/* ===== Badge ===== */
.qr-badge {
  display: inline-block;
  padding: 8px 24px;
  border-radius: 24px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.25);
  color: #FFD700;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 18px;
}

/* ===== Percentile ===== */
.qr-percentile {
  font-size: 1.15rem;
  color: #fff;
  font-weight: 600;
  margin-bottom: 10px;
}
.qr-percentile :deep(.hl-gold) {
  color: #FFD700;
  font-weight: 700;
}

/* ===== Stats ===== */
.qr-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 24px;
}
.qr-stats__sep {
  color: rgba(255, 255, 255, 0.2);
}

/* ===== Watermark ===== */
.qr-watermark {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.28);
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}



/* ===== Replay Button ===== */
.qr-replay {
  margin-top: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 60px;
  border-radius: 50px;
  background: #FFD700;
  color: #000F49;
  font-size: 1.15rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 24px rgba(255, 215, 0, 0.3);
  min-width: 320px;
}
.qr-replay:hover {
  transform: scale(1.04);
  box-shadow: 0 6px 32px rgba(255, 215, 0, 0.5);
}

/* ===== Recommend ===== */
.qr-recommend {
  margin-top: 36px;
  width: 100%;
  max-width: 500px;
}
.qr-recommend__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.qr-recommend__card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
  text-decoration: none;
  transition: all 0.2s ease;
}
.qr-recommend__card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
}
.qr-recommend__icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.qr-recommend__icon.pink {
  background: rgba(236, 72, 153, 0.2);
}
.qr-recommend__icon.green {
  background: rgba(34, 197, 94, 0.2);
}
.qr-recommend__text {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
}
.qr-recommend__arrow {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
  font-weight: 300;
}

/* ===== Mobile ===== */
@media (max-width: 640px) {
  .qr-page {
    padding: 24px 16px 48px;
  }
  .qr-card {
    max-width: 100%;
  }
  .qr-card__body {
    padding: 28px 20px 20px;
  }
  .qr-ring {
    width: 180px;
    height: 180px;
  }
  .qr-ring__score {
    font-size: 3.2rem;
  }
  .qr-replay {
    min-width: auto;
    width: 100%;
    max-width: 320px;
    padding: 14px 40px;
  }
  .qr-recommend__grid {
    grid-template-columns: 1fr;
  }
}
</style>
