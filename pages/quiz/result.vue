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
})

const titleKey = computed(() => getTitle(score.value))

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

function playAgain() {
  navigateTo(localePath('/quiz/play'))
}
</script>

<template>
  <div class="quiz-result">
    <!-- 分享卡片区域 -->
    <div ref="cardRef" class="quiz-result__card">
      <div class="quiz-result__card-inner">
        <!-- 标题 -->
        <h2 class="quiz-result__card-title">
          {{ t('quiz.resultTitle') }}
        </h2>

        <!-- 大号分数 -->
        <div class="quiz-result__score">
          {{ score }}
        </div>
        <p class="quiz-result__score-label">pts</p>

        <!-- 称号 -->
        <div class="quiz-result__title-badge">
          🏅 {{ t(titleKey) }}
        </div>

        <!-- 百分位 -->
        <p class="quiz-result__percentile">
          {{ t('quiz.percentile', { percent: percentile }) }}
        </p>

        <!-- 答对数和用时 -->
        <div class="quiz-result__stats">
          <span>{{ t('quiz.correctCount', { correct: correctCount, total: totalQuestions }) }}</span>
          <span class="quiz-result__stats-divider">|</span>
          <span>{{ t('quiz.timeSpent', { time: timeSpent }) }}</span>
        </div>

        <!-- 水印 -->
        <div class="quiz-result__watermark">
          🏆 WorldCupDex.org
        </div>
      </div>
    </div>

    <!-- 分享按钮区域 -->
    <div class="quiz-result__share">
      <ShareButtons
        :share-text="shareText"
        :share-url="shareUrl"
        :card-ref="cardRef"
        filename="worldcupdex-quiz.png"
      />
    </div>

    <!-- 再来一次 -->
    <button class="quiz-result__replay-btn" @click="playAgain">
      {{ t('quiz.playAgain') }}
    </button>

    <!-- 推荐区域 -->
    <div class="quiz-result__recommend">
      <p class="quiz-result__recommend-title">{{ t('share.alsoTry') }}</p>
      <div class="quiz-result__recommend-links">
        <NuxtLinkLocale to="/fan-card" class="quiz-result__recommend-link">
          🎴 {{ t('share.tryFanCard') }}
        </NuxtLinkLocale>
        <NuxtLinkLocale to="/teams" class="quiz-result__recommend-link">
          📋 {{ t('share.viewTeam') }}
        </NuxtLinkLocale>
      </div>
    </div>

    <!-- 广告占位 -->
    <!-- AdSense Placeholder -->
    <div class="quiz-result__ad-placeholder">
      <span>Ad</span>
    </div>
  </div>
</template>

<style scoped>
.quiz-result {
  min-height: calc(100vh - 170px);
  background: linear-gradient(180deg, #000F49 0%, #1A237E 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 60px;
}

.quiz-result__card {
  width: 100%;
  max-width: 400px;
  border-radius: 20px;
  background: linear-gradient(145deg, #0a1a5c 0%, #000F49 100%);
  border: 1px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.1);
  overflow: hidden;
}

.quiz-result__card-inner {
  padding: 40px 30px;
  text-align: center;
}

.quiz-result__card-title {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.quiz-result__score {
  font-family: 'Montserrat', sans-serif;
  font-size: 4rem;
  font-weight: 800;
  color: #FFD700;
  line-height: 1;
}

.quiz-result__score-label {
  font-size: 1rem;
  color: rgba(255, 215, 0, 0.6);
  margin-bottom: 20px;
}

.quiz-result__title-badge {
  display: inline-block;
  padding: 8px 20px;
  border-radius: 20px;
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid rgba(255, 215, 0, 0.4);
  color: #FFD700;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.quiz-result__percentile {
  font-size: 1.1rem;
  color: white;
  margin-bottom: 16px;
  font-weight: 500;
}

.quiz-result__stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 24px;
}

.quiz-result__stats-divider {
  color: rgba(255, 255, 255, 0.3);
}

.quiz-result__watermark {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.35);
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Share section */
.quiz-result__share {
  margin-top: 28px;
  width: 100%;
  max-width: 400px;
}

/* Replay button */
.quiz-result__replay-btn {
  margin-top: 24px;
  padding: 14px 40px;
  border-radius: 12px;
  background: #FFD700;
  color: #000F49;
  font-family: 'Montserrat', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
}

.quiz-result__replay-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 30px rgba(255, 215, 0, 0.5);
}

/* Recommend section */
.quiz-result__recommend {
  margin-top: 36px;
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.quiz-result__recommend-title {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}

.quiz-result__recommend-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.quiz-result__recommend-link {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.quiz-result__recommend-link:hover {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.4);
  color: #FFD700;
}

/* Ad placeholder */
.quiz-result__ad-placeholder {
  margin-top: 36px;
  width: 100%;
  max-width: 400px;
  height: 90px;
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.8rem;
}

/* 移动端 */
@media (max-width: 640px) {
  .quiz-result__card-inner {
    padding: 30px 20px;
  }

  .quiz-result__score {
    font-size: 3rem;
  }
}
</style>
