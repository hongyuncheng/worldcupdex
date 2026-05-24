<template>
  <div class="flex items-center justify-center gap-4">
    <div v-for="item in timeBlocks" :key="item.label" class="flex flex-col items-center">
      <div class="flex items-center justify-center rounded-lg border border-white/30" style="width: 70px; height: 70px; background: rgba(255,255,255,0.1);">
        <span class="font-bold text-[#FFD700]" style="font-family: 'Montserrat', sans-serif; font-size: 36px;">
          {{ String(item.value).padStart(2, '0') }}
        </span>
      </div>
      <span class="mt-2 text-white" style="font-family: 'Inter', sans-serif; font-size: 14px;">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// The opening match is June 11, 2026, 19:00 (Mexico City Time, UTC-6)
// This is equivalent to June 12, 2026, 01:00 UTC
const targetDate = new Date('2026-06-12T01:00:00Z').getTime()

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)

const timeBlocks = computed(() => [
  { value: days.value, label: t('hero.days') },
  { value: hours.value, label: t('hero.hours') },
  { value: minutes.value, label: t('hero.minutes') },
  { value: seconds.value, label: t('hero.seconds') },
])

function updateCountdown() {
  // 处理可能传入的无效日期或不支持的日期格式
  if (isNaN(targetDate)) {
    console.warn('Invalid targetDate provided to CountdownTimer:', targetDate)
    return
  }

  const now = Date.now()
  const diff = targetDate - now

  if (diff <= 0) {
    days.value = 0
    hours.value = 0
    minutes.value = 0
    seconds.value = 0
    return
  }

  days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
  hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  seconds.value = Math.floor((diff % (1000 * 60)) / 1000)
}

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>
