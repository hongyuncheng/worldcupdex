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
const copied = ref(false)

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

// ========== 分享功能 ==========
function shareTwitter() {
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(shareUrl.value)}`,
    '_blank',
    'width=600,height=400',
  )
}

async function shareInstagram() {
  try {
    await navigator.clipboard.writeText(shareText.value + ' ' + shareUrl.value)
    showCopiedToast()
  } catch { /* noop */ }
}

async function shareDiscord() {
  try {
    await navigator.clipboard.writeText(shareText.value + ' ' + shareUrl.value)
    showCopiedToast()
  } catch { /* noop */ }
}

function shareWhatsApp() {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(shareText.value + ' ' + shareUrl.value)}`,
    '_blank',
  )
}

async function handleCopyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    showCopiedToast()
  } catch { /* noop */ }
}

function showCopiedToast() {
  copied.value = true
  setTimeout(() => { copied.value = false }, 2500)
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
    <!-- Copied Toast -->
    <Transition name="toast">
      <div v-if="copied" class="qr-toast">✓ {{ t('share.copied') }}</div>
    </Transition>

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

    <!-- ====== Share Section ====== -->
    <div class="qr-share">
      <div class="qr-section-header">
        <span class="qr-deco-line" /><span class="qr-diamond">◆</span>
        <span class="qr-section-header__text">{{ t('quiz.shareYourScore') }}</span>
        <span class="qr-diamond">◆</span><span class="qr-deco-line" />
      </div>

      <div class="qr-share__grid">
        <!-- Twitter / X -->
        <button class="qr-share__btn" @click="shareTwitter">
          <div class="qr-share__icon" style="background:#000">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </div>
          <span class="qr-share__label">Twitter / X</span>
        </button>
        <!-- Instagram -->
        <button class="qr-share__btn" @click="shareInstagram">
          <div class="qr-share__icon" style="background:radial-gradient(circle at 30% 107%,#fdf497 0%,#fdf497 5%,#fd5949 45%,#d6249f 60%,#285AEB 90%)">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </div>
          <span class="qr-share__label">Instagram</span>
        </button>
        <!-- Discord -->
        <button class="qr-share__btn" @click="shareDiscord">
          <div class="qr-share__icon" style="background:#5865F2">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.618-1.25.077.077 0 00-.079-.037 19.736 19.736 0 00-4.885 1.515.07.07 0 00-.032.028C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.1.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.946 2.418-2.157 2.418z"/></svg>
          </div>
          <span class="qr-share__label">Discord</span>
        </button>
        <!-- WhatsApp -->
        <button class="qr-share__btn" @click="shareWhatsApp">
          <div class="qr-share__icon" style="background:#25D366">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <span class="qr-share__label">WhatsApp</span>
        </button>
        <!-- Copy Link -->
        <button class="qr-share__btn" @click="handleCopyLink">
          <div class="qr-share__icon" style="background:rgba(255,255,255,0.12)">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
          </div>
          <span class="qr-share__label">{{ t('share.copyLink') }}</span>
        </button>
      </div>
    </div>

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

/* ===== Toast ===== */
.qr-toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(34, 197, 94, 0.95);
  color: #fff;
  padding: 10px 28px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 1000;
  backdrop-filter: blur(8px);
}
.toast-enter-active,
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-12px); }

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
  background: linear-gradient(
    180deg,
    rgba(10, 14, 42, 1) 0%,
    rgba(10, 14, 42, 1) 40%,
    rgba(10, 14, 42, 0.5) 65%,
    rgba(10, 14, 42, 0.15) 100%
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

/* ===== Section Header ===== */
.qr-section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}
.qr-section-header__text {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 500;
  white-space: nowrap;
}

/* ===== Share Section ===== */
.qr-share {
  margin-top: 36px;
  width: 100%;
  max-width: 500px;
}
.qr-share__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}
.qr-share__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 10px 14px;
  width: 100px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  color: #fff;
}
.qr-share__btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
}
.qr-share__icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qr-share__label {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
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
  .qr-share__btn {
    width: calc(33.33% - 10px);
    min-width: 80px;
  }
}
</style>
