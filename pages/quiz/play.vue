<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

const {
  questions,
  currentIndex,
  answers,
  timeLeft,
  isLoading,
  isFinished,
  currentQuestion,
  progress,
  startQuiz,
  submitAnswer,
  nextQuestion,
  getResult,
  getTitle,
} = useQuiz()

const selectedIndex = ref<number | null>(null)
const showResult = ref(false)
const lastCorrect = ref(false)
const optionsDisabled = ref(false)
const isNavigating = ref(false)

// 追踪所有 setTimeout，确保组件卸载时清除
const pendingTimers: ReturnType<typeof setTimeout>[] = []
function safeTimeout(fn: () => void, ms: number) {
  const id = setTimeout(() => {
    // 从列表中移除已执行的 timer
    const idx = pendingTimers.indexOf(id)
    if (idx > -1) pendingTimers.splice(idx, 1)
    fn()
  }, ms)
  pendingTimers.push(id)
}
function clearAllTimers() {
  pendingTimers.forEach(id => clearTimeout(id))
  pendingTimers.length = 0
}

// 开始加载题目
onMounted(async () => {
  await startQuiz()
})

// 组件卸载时清除所有 timer
onBeforeUnmount(() => {
  clearAllTimers()
})

// 监听答题完成 → 跳转结果页
watch(isFinished, async (finished) => {
  if (finished && !isNavigating.value) {
    isNavigating.value = true
    clearAllTimers()

    const result = getResult()
    const query = {
      score: String(result.score),
      correct: String(result.correctCount),
      total: String(result.totalQuestions),
      time: String(result.timeSpent),
      percentile: String(result.percentile),
    }
    // 保存到 sessionStorage 作为备用
    if (import.meta.client) {
      sessionStorage.setItem('wcd_quiz_result', JSON.stringify(result))
    }
    await router.push({
      path: localePath('/quiz/result'),
      query,
    })
  }
})

// 监听超时
watch(timeLeft, (val) => {
  if (val <= 0 && !optionsDisabled.value && !isNavigating.value && !isFinished.value) {
    optionsDisabled.value = true
    showResult.value = true
    lastCorrect.value = false
    // 超时后1.2s进入下一题
    safeTimeout(() => {
      goNext()
    }, 1200)
  }
})

function handleOptionClick(index: number) {
  if (optionsDisabled.value || isNavigating.value) return

  selectedIndex.value = index
  optionsDisabled.value = true
  const { correct } = submitAnswer(index)
  lastCorrect.value = correct
  showResult.value = true

  // 1.2秒后自动下一题
  safeTimeout(() => {
    goNext()
  }, 1200)
}

function goNext() {
  // 如果已经在导航中或已结束，不再操作
  if (isNavigating.value || isFinished.value) return

  selectedIndex.value = null
  showResult.value = false
  optionsDisabled.value = false
  nextQuestion()
}

function getOptionStatus(optIndex: number): 'default' | 'selected' | 'correct' | 'wrong' {
  if (!showResult.value) {
    if (selectedIndex.value === optIndex) return 'selected'
    return 'default'
  }

  // 显示结果状态
  const question = currentQuestion.value
  if (!question) return 'default'

  if (optIndex === question.correctIndex) return 'correct'
  if (optIndex === selectedIndex.value && selectedIndex.value !== question.correctIndex) return 'wrong'
  return 'default'
}

function getQuestionText(question: any): string {
  if (!question) return ''
  const q = question.question
  if (locale.value === 'zh') return q.zh
  if (locale.value === 'es') return q.es
  return q.en
}

function getOptionText(option: any): string {
  if (!option) return ''
  if (locale.value === 'zh') return option.zh
  if (locale.value === 'es') return option.es
  return option.en
}

const labels = ['A', 'B', 'C', 'D']
</script>

<template>
  <div class="quiz-play">
    <!-- Loading -->
    <div v-if="isLoading" class="quiz-play__loading">
      <span class="loading loading-spinner loading-lg text-yellow-400"></span>
      <p class="text-white mt-4">{{ t('common.loading') }}</p>
    </div>

    <!-- Quiz Content -->
    <div v-else-if="currentQuestion" class="quiz-play__container">
      <!-- 顶部：进度条 + 倒计时 -->
      <div class="quiz-play__header">
        <div class="quiz-play__progress-wrapper">
          <span class="quiz-play__question-num">
            {{ t('quiz.question', { current: currentIndex + 1, total: questions.length }) }}
          </span>
          <div class="quiz-play__progress-bar">
            <div
              class="quiz-play__progress-fill"
              :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }"
            ></div>
          </div>
        </div>
        <div class="quiz-play__timer" :class="{ 'quiz-play__timer--warning': timeLeft <= 10 }">
          {{ t('quiz.timeLeft', { seconds: timeLeft }) }}
        </div>
      </div>

      <!-- 题目文本 -->
      <div class="quiz-play__question">
        <p>{{ getQuestionText(currentQuestion) }}</p>
      </div>

      <!-- 选项 -->
      <div class="quiz-play__options">
        <QuizOption
          v-for="(option, idx) in currentQuestion.options"
          :key="idx"
          :label="labels[idx]"
          :text="getOptionText(option)"
          :status="getOptionStatus(idx)"
          :disabled="optionsDisabled"
          @click="handleOptionClick(idx)"
        />
      </div>

      <!-- 答题反馈 -->
      <div v-if="showResult" class="quiz-play__feedback">
        <span v-if="lastCorrect" class="quiz-play__feedback--correct">
          ✓ {{ t('quiz.correct') }}
        </span>
        <span v-else class="quiz-play__feedback--wrong">
          ✗ {{ t('quiz.wrong') }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-play {
  min-height: calc(100vh - 170px);
  background: linear-gradient(180deg, #000F49 0%, #1A237E 100%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 30px 20px 60px;
}

.quiz-play__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.quiz-play__container {
  width: 100%;
  max-width: 640px;
}

.quiz-play__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
}

.quiz-play__progress-wrapper {
  flex: 1;
}

.quiz-play__question-num {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 6px;
  display: block;
}

.quiz-play__progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  overflow: hidden;
}

.quiz-play__progress-fill {
  height: 100%;
  background: #FFD700;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.quiz-play__timer {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.quiz-play__timer--warning {
  background: rgba(239, 68, 68, 0.2);
  border-color: #EF4444;
  color: #FCA5A5;
  animation: pulse-warning 1s infinite;
}

@keyframes pulse-warning {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.quiz-play__question {
  margin-bottom: 32px;
}

.quiz-play__question p {
  font-family: 'Inter', sans-serif;
  font-size: 1.3rem;
  color: white;
  font-weight: 600;
  line-height: 1.5;
}

.quiz-play__options {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 768px) {
  .quiz-play__options {
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
}

.quiz-play__feedback {
  margin-top: 24px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
}

.quiz-play__feedback--correct {
  color: #22C55E;
}

.quiz-play__feedback--wrong {
  color: #EF4444;
}

/* 移动端 */
@media (max-width: 640px) {
  .quiz-play__question p {
    font-size: 1.1rem;
  }

  .quiz-play__header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .quiz-play__timer {
    align-self: flex-end;
  }
}
</style>
