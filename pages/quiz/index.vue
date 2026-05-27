<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// SEO
useSeoConfig({
  title: t('quiz.seoTitle'),
  description: t('quiz.seoDesc'),
})

// JSON-LD Quiz schema
const quizSchemaData = {
  name: 'World Cup IQ Test',
  about: 'World Cup 2026 Knowledge',
  educationalLevel: 'beginner',
  description: 'Test your World Cup 2026 knowledge with our 5-question IQ challenge.',
}

// 挑战横幅（来自分享链接）
const challengeScore = ref<number | null>(null)
const challengePercentile = ref<number | null>(null)
const showChallengeBanner = ref(false)

// 参与人数计算
const participantCount = ref(0)

onMounted(() => {
  // 解析挑战参数
  const s = route.query.score
  const p = route.query.percentile
  if (s && p) {
    challengeScore.value = parseInt(s as string, 10)
    challengePercentile.value = parseInt(p as string, 10)
    showChallengeBanner.value = true
  }

  // 固定随机基数（使用日期种子，每天固定）
  const today = new Date().toISOString().slice(0, 10)
  let seed = 0
  for (let i = 0; i < today.length; i++) {
    seed += today.charCodeAt(i)
  }
  const baseCount = 10000 + (seed * 37) % 5000

  // 加上实际完成次数
  const quizCount = parseInt(localStorage.getItem('wcd_quiz_count') || '0', 10)
  participantCount.value = baseCount + quizCount
})

function dismissChallengeBanner() {
  showChallengeBanner.value = false
}

const quizPlayPath = computed(() => {
  const path = localePath('/quiz/play/')
  return path.endsWith('/') ? path : `${path}/`
})
</script>

<template>
  <div class="quiz-page">
    <!-- JSON-LD Quiz Schema -->
    <SchemaOrg type="Quiz" :data="quizSchemaData" />

    <!-- 挑战横幅 -->
    <Transition name="banner-slide">
      <div v-if="showChallengeBanner" class="challenge-banner">
        <div class="challenge-banner__inner">
          <span class="challenge-banner__icon">🏆</span>
          <div class="challenge-banner__text">
            <p class="challenge-banner__main">
              {{ t('quiz.challengeMain', { score: challengeScore, percentile: challengePercentile }) }}
            </p>
            <p class="challenge-banner__sub">{{ t('quiz.challengeSub') }}</p>
          </div>
          <button class="challenge-banner__close" @click="dismissChallengeBanner" aria-label="Close">
            ✕
          </button>
        </div>
      </div>
    </Transition>

    <!-- Hero 区域 -->
    <section class="hero">
      <!-- 体育场灯光效果 -->
      <div class="hero__lights"></div>
      <div class="hero__container">
        <!-- 左列：文字 -->
        <div class="hero__text">
          <h1 class="hero__title">
            <span class="hero__title-small">{{ t('quiz.heroSmall') }}</span>
            <span class="hero__title-big">{{ t('quiz.heroBig') }} <em class="hero__title-iq">IQ</em></span>
          </h1>
          <p class="hero__subtitle">{{ t('quiz.heroSubtitle') }}</p>
          <div class="hero__divider"></div>
        </div>

      </div>
    </section>

    <!-- 特性卡片区域 -->
    <section class="features">
      <div class="features__card">
        <div class="features__item">
          <div class="features__icon features__icon--blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="3" width="16" height="18" rx="2" stroke="white" stroke-width="1.5"/>
              <line x1="8" y1="8" x2="16" y2="8" stroke="white" stroke-width="1.5"/>
              <line x1="8" y1="12" x2="16" y2="12" stroke="white" stroke-width="1.5"/>
              <line x1="8" y1="16" x2="13" y2="16" stroke="white" stroke-width="1.5"/>
            </svg>
          </div>
          <div class="features__text">
            <h3>{{ t('quiz.featureQuestions') }}</h3>
            <p>{{ t('quiz.featureQuestionsDesc') }}</p>
          </div>
        </div>
        <div class="features__item">
          <div class="features__icon features__icon--green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" stroke-width="1.5"/>
              <polyline points="12,7 12,12 16,14" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="features__text">
            <h3>{{ t('quiz.featureTimer') }}</h3>
            <p>{{ t('quiz.featureTimerDesc') }}</p>
          </div>
        </div>
        <div class="features__item">
          <div class="features__icon features__icon--purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 9V4h12v5c0 3.5-2.5 6.5-6 7.5-3.5-1-6-4-6-7.5z" stroke="white" stroke-width="1.5"/>
              <path d="M9 20h6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M12 16.5V20" stroke="white" stroke-width="1.5"/>
            </svg>
          </div>
          <div class="features__text">
            <h3>{{ t('quiz.featureInstant') }}</h3>
            <p>{{ t('quiz.featureInstantDesc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA 按钮区域 -->
    <section class="cta">
      <a class="cta__button" :href="quizPlayPath">
        {{ t('quiz.startChallenge') }}
        <span class="cta__arrow">→</span>
      </a>
      <div class="cta__participants">
        <span class="cta__count">{{ t('quiz.participantCount', { count: participantCount.toLocaleString() }) }}</span>
        <div class="cta__avatars">
          <span class="cta__avatar" style="background:#E67E22;"></span>
          <span class="cta__avatar" style="background:#3498DB;"></span>
          <span class="cta__avatar" style="background:#9B59B6;"></span>
          <span class="cta__avatar" style="background:#1ABC9C;"></span>
          <span class="cta__avatar" style="background:#E74C3C;"></span>
          <span class="cta__avatar" style="background:#F39C12;"></span>
          <span class="cta__dot">…</span>
        </div>
      </div>
    </section>

    <!-- 挑战流程区域 -->
    <section class="flow">
      <div class="flow__card">
        <h2 class="flow__title">
          <span class="flow__diamond">◇</span>
          {{ t('quiz.howItWorks') }}
          <span class="flow__diamond">◇</span>
        </h2>
        <div class="flow__steps">
          <div class="flow__step">
            <div class="flow__step-icon flow__step-icon--1">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="3" width="16" height="18" rx="2" stroke="white" stroke-width="1.5"/>
                <line x1="8" y1="8" x2="16" y2="8" stroke="white" stroke-width="1.5"/>
                <line x1="8" y1="12" x2="16" y2="12" stroke="white" stroke-width="1.5"/>
                <line x1="8" y1="16" x2="13" y2="16" stroke="white" stroke-width="1.5"/>
              </svg>
            </div>
            <div class="flow__connector"></div>
            <h4>{{ t('quiz.step1Title') }}</h4>
            <p>{{ t('quiz.step1Desc') }}</p>
          </div>
          <div class="flow__step">
            <div class="flow__step-icon flow__step-icon--2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="white" stroke-width="1.5"/>
                <polyline points="12,7 12,12 16,14" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="flow__connector"></div>
            <h4>{{ t('quiz.step2Title') }}</h4>
            <p>{{ t('quiz.step2Desc') }}</p>
          </div>
          <div class="flow__step">
            <div class="flow__step-icon flow__step-icon--3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M6 9V4h12v5c0 3.5-2.5 6.5-6 7.5-3.5-1-6-4-6-7.5z" stroke="white" stroke-width="1.5"/>
                <path d="M9 20h6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M12 16.5V20" stroke="white" stroke-width="1.5"/>
              </svg>
            </div>
            <h4>{{ t('quiz.step3Title') }}</h4>
            <p>{{ t('quiz.step3Desc') }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ========== 挑战横幅 ========== */
.challenge-banner {
  background: linear-gradient(135deg, #2d1b69 0%, #1a1145 50%, #0d1440 100%);
  border-bottom: 2px solid #FFD700;
  position: relative;
  overflow: hidden;
}

.challenge-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 215, 0, 0.05) 50%, transparent 100%);
  pointer-events: none;
}

.challenge-banner__inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.challenge-banner__icon {
  font-size: 2rem;
  flex-shrink: 0;
  animation: trophy-pulse 2s ease-in-out infinite;
}

@keyframes trophy-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.challenge-banner__text {
  flex: 1;
}

.challenge-banner__main {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
}

.challenge-banner__main strong {
  color: #FFD700;
}

.challenge-banner__sub {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: rgba(255, 215, 0, 0.85);
  font-weight: 500;
}

.challenge-banner__close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.challenge-banner__close:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
}

/* Banner 入场/退场动画 */
.banner-slide-enter-active {
  animation: bannerIn 0.4s ease-out;
}

.banner-slide-leave-active {
  animation: bannerOut 0.3s ease-in;
}

@keyframes bannerIn {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bannerOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-100%);
  }
}

/* ========== 全局页面 ========== */
.quiz-page {
  background: #0a0e2a;
  min-height: 100vh;
  color: #fff;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ========== Hero 区域 ========== */
.hero {
  position: relative;
  width: 100%;
  min-height: 360px;
  height: 24vw;
  max-height: 440px;
  overflow: hidden;
  background: url('/images/quiz-hero-bg.png') center center / cover no-repeat;
  background-color: #0d1440;
}

.hero__lights {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background:
    linear-gradient(90deg, rgba(10, 14, 42, 0.85) 0%, rgba(10, 14, 42, 0.55) 50%, rgba(10, 14, 42, 0.15) 100%),
    linear-gradient(180deg, transparent 60%, rgba(10, 14, 42, 0.9) 100%);
  pointer-events: none;
}

.hero__container {
  position: relative;
  max-width: 1100px;
  margin: 0 auto;
  padding: 50px 40px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.hero__text {
  flex: 1;
  max-width: 500px;
}

.hero__title {
  margin: 0 0 20px;
  line-height: 1.1;
}

.hero__title-small {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.hero__title-big {
  display: block;
  font-size: 3.8rem;
  font-weight: 900;
  color: #fff;
}

.hero__title-iq {
  font-style: italic;
  color: #FFD700;
  font-size: 4.2rem;
}

.hero__subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 20px;
  line-height: 1.6;
}

.hero__divider {
  width: 40px;
  height: 3px;
  background: #FFD700;
  border-radius: 2px;
}

/* ========== 特性卡片区域 ========== */
.features {
  max-width: 900px;
  margin: 0 auto;
  padding: 28px 20px 0;
}

.features__card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 32px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
}

.features__item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
}

.features__icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.features__icon--blue {
  background: #4A5FE0;
}

.features__icon--green {
  background: #22C55E;
}

.features__icon--purple {
  background: #8B5CF6;
}

.features__text h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 6px;
  color: #fff;
}

.features__text p {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.5;
}

/* ========== CTA 按钮区域 ========== */
.cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 20px 20px;
}

.cta__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 18px 60px;
  min-width: 280px;
  border-radius: 50px;
  background: #FFD700;
  color: #0a0e2a;
  text-decoration: none;
  font-size: 1.3rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 24px rgba(255, 215, 0, 0.3);
}

.cta__button:hover {
  transform: scale(1.04);
  box-shadow: 0 6px 32px rgba(255, 215, 0, 0.5);
}

.cta__button:active {
  transform: scale(0.97);
}

.cta__arrow {
  font-size: 1.4rem;
  font-weight: 400;
}

.cta__participants {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.cta__count {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.cta__count strong {
  color: #FFD700;
}

.cta__avatars {
  display: flex;
  align-items: center;
}

.cta__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-left: -6px;
  border: 2px solid #0a0e2a;
  display: inline-block;
}

.cta__avatar:first-child {
  margin-left: 0;
}

.cta__dot {
  margin-left: 4px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.2rem;
}

/* ========== 挑战流程区域 ========== */
.flow {
  max-width: 900px;
  margin: 0 auto;
  padding: 10px 20px 40px;
}

.flow__card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 28px;
  background: rgba(255, 255, 255, 0.02);
}

.flow__title {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 24px;
  color: #fff;
}

.flow__diamond {
  color: rgba(255, 255, 255, 0.4);
  margin: 0 8px;
  font-size: 0.9rem;
}

.flow__steps {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
}

.flow__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  position: relative;
}

.flow__step-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0e2a;
  border: 2px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 16px;
  position: relative;
  z-index: 2;
}

.flow__step-icon--1 {
  background: linear-gradient(135deg, #1a237e, #0a0e2a);
  border-color: rgba(74, 95, 224, 0.5);
}

.flow__step-icon--2 {
  background: linear-gradient(135deg, #1a237e, #0a0e2a);
  border-color: rgba(34, 197, 94, 0.5);
}

.flow__step-icon--3 {
  background: linear-gradient(135deg, #1a237e, #0a0e2a);
  border-color: rgba(139, 92, 246, 0.5);
}

.flow__connector {
  position: absolute;
  top: 36px;
  left: calc(50% + 40px);
  width: calc(100% - 80px);
  height: 0;
  border-top: 2px dashed rgba(255, 255, 255, 0.2);
  z-index: 1;
}

.flow__step:last-child .flow__connector {
  display: none;
}

.flow__step h4 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #fff;
}

.flow__step p {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
  max-width: 160px;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .challenge-banner__inner {
    padding: 12px 16px;
    gap: 12px;
  }

  .challenge-banner__icon {
    font-size: 1.6rem;
  }

  .challenge-banner__main {
    font-size: 0.9rem;
  }

  .challenge-banner__sub {
    font-size: 0.8rem;
  }

  .hero__container {
    flex-direction: column;
    padding: 50px 20px 40px;
    text-align: center;
  }

  .hero__text {
    max-width: 100%;
  }

  .hero__title-small {
    font-size: 1.5rem;
  }

  .hero__title-big {
    font-size: 2.8rem;
  }

  .hero__title-iq {
    font-size: 3.2rem;
  }

  .hero__divider {
    margin: 0 auto;
  }

  .hero {
    min-height: 300px;
    height: auto;
    max-height: none;
    background-position: 65% center;
  }

  .hero__lights {
    background:
      linear-gradient(180deg, rgba(10, 14, 42, 0.8) 0%, rgba(10, 14, 42, 0.6) 50%, rgba(10, 14, 42, 0.9) 100%);
  }

  .features__card {
    flex-direction: column;
    padding: 24px;
    gap: 20px;
  }

  .cta__button {
    min-width: 240px;
    padding: 16px 40px;
    font-size: 1.1rem;
  }

  .flow__card {
    padding: 24px;
  }

  .flow__steps {
    flex-direction: column;
    gap: 32px;
  }

  .flow__connector {
    display: none;
  }

  .flow__step {
    flex-direction: column;
  }
}
</style>
