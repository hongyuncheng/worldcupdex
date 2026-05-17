<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  text: string
  status: 'default' | 'selected' | 'correct' | 'wrong'
  disabled: boolean
}>(), {
  status: 'default',
  disabled: false,
})

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    class="quiz-option"
    :class="[`quiz-option--${status}`]"
    :disabled="disabled"
    @click="emit('click')"
  >
    <span class="quiz-option__label">{{ label }}</span>
    <span class="quiz-option__text">{{ text }}</span>
    <span v-if="status === 'correct'" class="quiz-option__icon">✓</span>
    <span v-if="status === 'wrong'" class="quiz-option__icon">✗</span>
  </button>
</template>

<style scoped>
.quiz-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 18px;
  border-radius: 12px;
  border: 2px solid #000F49;
  background: white;
  color: #000F49;
  font-size: 16px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.quiz-option:hover:not(:disabled):not(.quiz-option--correct):not(.quiz-option--wrong) {
  border-color: #FFD700;
  box-shadow: 0 0 0 1px #FFD700;
}

.quiz-option:disabled {
  cursor: not-allowed;
  opacity: 0.9;
}

.quiz-option__label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #000F49;
  color: white;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.quiz-option__text {
  flex: 1;
  font-weight: 500;
  line-height: 1.4;
}

.quiz-option__icon {
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

/* Selected state */
.quiz-option--selected {
  border-color: #FFD700;
  background: #FFFBEA;
}

.quiz-option--selected .quiz-option__label {
  background: #FFD700;
  color: #000F49;
}

/* Correct state */
.quiz-option--correct {
  border-color: #22C55E;
  background: #22C55E;
  color: white;
}

.quiz-option--correct .quiz-option__label {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

/* Wrong state */
.quiz-option--wrong {
  border-color: #EF4444;
  background: #EF4444;
  color: white;
}

.quiz-option--wrong .quiz-option__label {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}
</style>
