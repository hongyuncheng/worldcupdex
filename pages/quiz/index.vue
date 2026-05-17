<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

// 参与人数计算
const participantCount = ref(0)

onMounted(() => {
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

function handleStart() {
  navigateTo(localePath('/quiz/play'))
}
</script>

<template>
  <div class="quiz-landing">
    <div class="quiz-landing__content">
      <!-- 标题 -->
      <h1 class="quiz-landing__title">
        {{ t('quiz.title') }}
      </h1>

      <!-- 副标题 -->
      <p class="quiz-landing__subtitle">
        {{ t('quiz.subtitle') }}
      </p>

      <!-- 挑战文案 -->
      <p class="quiz-landing__challenge">
        {{ t('quiz.challengeFriends') }}
      </p>

      <!-- 规则标签 -->
      <div class="quiz-landing__rules">
        <span class="quiz-landing__rule-tag">🧠 5 {{ locale === 'zh' ? '题' : locale === 'es' ? ' preguntas' : ' questions' }}</span>
        <span class="quiz-landing__rule-tag">⏱️ 30s</span>
        <span class="quiz-landing__rule-tag">⚡ {{ locale === 'zh' ? '即时出分' : locale === 'es' ? 'Instantáneo' : 'Instant' }}</span>
      </div>

      <!-- 开始按钮 -->
      <button
        class="quiz-landing__start-btn"
        @click="handleStart"
      >
        {{ t('quiz.startButton') }}
      </button>

      <!-- 参与人数 -->
      <p class="quiz-landing__participants">
        {{ t('quiz.participants', { count: participantCount.toLocaleString() }) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.quiz-landing {
  min-height: calc(100vh - 170px);
  background: linear-gradient(180deg, #000F49 0%, #1A237E 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.quiz-landing__content {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.quiz-landing__title {
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: #FFD700;
  margin-bottom: 16px;
  line-height: 1.2;
}

.quiz-landing__subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 1.2rem;
  color: white;
  margin-bottom: 12px;
  opacity: 0.9;
}

.quiz-landing__challenge {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #FFD700;
  margin-bottom: 32px;
  opacity: 0.85;
}

.quiz-landing__rules {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.quiz-landing__rule-tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
}

.quiz-landing__start-btn {
  display: inline-block;
  padding: 16px 48px;
  min-width: 220px;
  border-radius: 12px;
  background: #FFD700;
  color: #000F49;
  font-family: 'Montserrat', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
}

.quiz-landing__start-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 30px rgba(255, 215, 0, 0.5);
}

.quiz-landing__start-btn:active {
  transform: scale(0.98);
}

.quiz-landing__participants {
  margin-top: 24px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

/* 移动端响应式 */
@media (max-width: 640px) {
  .quiz-landing__title {
    font-size: 1.8rem;
  }

  .quiz-landing__subtitle {
    font-size: 1rem;
  }

  .quiz-landing__start-btn {
    padding: 14px 36px;
    font-size: 1.1rem;
    min-width: 180px;
  }

  .quiz-landing__rules {
    gap: 8px;
  }

  .quiz-landing__rule-tag {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
</style>
