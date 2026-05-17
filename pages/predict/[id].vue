<template>
  <div style="background: #FAFAFA; min-height: 100vh;">
    <div class="max-w-7xl mx-auto" style="padding: 24px 16px;">
      <!-- Breadcrumb -->
      <nav style="font-size: 13px; color: #999; margin-bottom: 16px;">
        <NuxtLinkLocale to="/" class="hover:text-[#000F49] transition-colors">{{ $t('nav.home') }}</NuxtLinkLocale>
        <span style="margin: 0 6px;">&gt;</span>
        <NuxtLinkLocale to="/predict" class="hover:text-[#000F49] transition-colors">{{ $t('nav.predict') }}</NuxtLinkLocale>
        <span style="margin: 0 6px;">&gt;</span>
        <span style="color: #333;">{{ $t('predictDetail.title') }}</span>
      </nav>

      <!-- Title -->
      <h1 style="font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 800; color: #000F49; margin: 0 0 8px 0;">
        {{ $t('predictDetail.title') }}
      </h1>
      <p style="font-size: 15px; color: #666; margin: 0 0 16px 0;">
        {{ $t('predictDetail.subtitle') }}
      </p>

      <!-- Back Link -->
      <NuxtLinkLocale to="/predict" style="font-size: 14px; color: #000F49; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 24px; padding: 8px 16px; border: 1px solid #E0E0E0; border-radius: 8px; background: white;">
        ← {{ $t('predictDetail.backToList') }}
      </NuxtLinkLocale>

      <!-- Two Column Layout -->
      <div class="predict-detail-layout">
        <!-- Left Column -->
        <div class="predict-detail-left">
          <!-- Card 1: Match Info -->
          <div class="detail-card">
            <div style="text-align: center; margin-bottom: 16px;">
              <div style="font-size: 15px; color: #333; font-weight: 500;">{{ match.date }} {{ match.weekday }}</div>
              <div style="font-size: 22px; font-weight: 700; color: #000F49; margin-top: 4px;">{{ match.time }}</div>
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 13px; color: #999;">{{ match.group }}{{ $t('predictDetail.groupMatch') }}</span>
            </div>
            <!-- Teams vs -->
            <div style="display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 20px;">
              <div style="display: flex; flex-direction: column; align-items: center;">
                <img :src="`https://flagcdn.com/w80/${match.home.code}.png`" :alt="match.home.name" style="width: 80px; height: 54px; object-fit: cover; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);" />
                <span style="font-size: 14px; font-weight: 700; color: #000F49; margin-top: 8px;">{{ match.home.name }}</span>
              </div>
              <span style="font-size: 20px; font-weight: 700; color: #999;">VS</span>
              <div style="display: flex; flex-direction: column; align-items: center;">
                <img :src="`https://flagcdn.com/w80/${match.away.code}.png`" :alt="match.away.name" style="width: 80px; height: 54px; object-fit: cover; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);" />
                <span style="font-size: 14px; font-weight: 700; color: #000F49; margin-top: 8px;">{{ match.away.name }}</span>
              </div>
            </div>
            <!-- Venue -->
            <div style="text-align: center; color: #999; font-size: 13px;">
              <div>⚽ {{ match.venue }}</div>
              <div style="margin-top: 2px;">{{ match.city }}</div>
            </div>
          </div>

          <!-- Card 2: Countdown -->
          <div class="detail-card">
            <div style="text-align: center; font-size: 14px; font-weight: 600; color: #333; margin-bottom: 16px;">
              {{ $t('predictDetail.deadlineTitle') }}
            </div>
            <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 12px;">
              <div style="display: flex; flex-direction: column; align-items: center;">
                <span style="font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 700; color: #000F49;">{{ String(countdown.days).padStart(2, '0') }}</span>
                <span style="font-size: 12px; color: #999;">{{ $t('predict.day') }}</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center;">
                <span style="font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 700; color: #000F49;">{{ String(countdown.hours).padStart(2, '0') }}</span>
                <span style="font-size: 12px; color: #999;">{{ $t('predict.hour') }}</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center;">
                <span style="font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 700; color: #000F49;">{{ String(countdown.minutes).padStart(2, '0') }}</span>
                <span style="font-size: 12px; color: #999;">{{ $t('predict.minute') }}</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center;">
                <span style="font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 700; color: #000F49;">{{ String(countdown.seconds).padStart(2, '0') }}</span>
                <span style="font-size: 12px; color: #999;">{{ $t('predict.second') }}</span>
              </div>
            </div>
            <div style="text-align: center; font-size: 13px; color: #999;">
              {{ match.deadlineDate }} {{ $t('predictDetail.deadlineText') }}
            </div>
          </div>

          <!-- Card 3: My Prediction Record -->
          <div class="detail-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <div style="position: relative;">
                <span style="font-size: 15px; font-weight: 700; color: #000F49;">{{ $t('predictDetail.myRecord') }}</span>
                <div style="position: absolute; bottom: -4px; left: 0; width: 40px; height: 3px; background: #FFD700; border-radius: 2px;"></div>
              </div>
              <a href="#" style="font-size: 13px; color: #000F49; font-weight: 600; text-decoration: none;">{{ $t('predictDetail.viewAll') }} &gt;</a>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; margin-top: 20px;">
              <div>
                <div style="font-size: 12px; color: #999;">{{ $t('predictDetail.predicted') }}</div>
                <div style="font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 800; color: #000F49; margin: 4px 0;">12</div>
                <div style="font-size: 12px; color: #999;">{{ $t('predict.matches') }}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #999;">{{ $t('predictDetail.correct') }}</div>
                <div style="font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 800; color: #000F49; margin: 4px 0;">8</div>
                <div style="font-size: 12px; color: #999;">{{ $t('predict.matches') }}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #999;">{{ $t('predictDetail.accuracy') }}</div>
                <div style="font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 800; color: #FFD700; margin: 4px 0;">66.7%</div>
                <div style="font-size: 12px; color: #999;">{{ $t('predictDetail.accuracy') }}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #999;">{{ $t('predictDetail.points') }}</div>
                <div style="font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 800; color: #000F49; margin: 4px 0;">320</div>
                <div style="font-size: 12px; color: #999;">{{ $t('predict.points') }}</div>
              </div>
            </div>
          </div>

          <!-- Card 4: Scoring Rules -->
          <div class="detail-card" style="flex: 1;">
            <div style="font-size: 15px; font-weight: 700; color: #000F49; margin-bottom: 16px;">
              {{ $t('predictDetail.scoringRules') }}
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">✅</span>
                <span style="flex: 1; font-size: 13px; color: #333;">{{ $t('predictDetail.ruleCorrectRegular') }}</span>
                <span style="font-size: 13px; font-weight: 700; color: #000F49;">+10 {{ $t('predict.points') }}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">🟡</span>
                <span style="flex: 1; font-size: 13px; color: #333;">{{ $t('predictDetail.ruleCorrectExtra') }}</span>
                <span style="font-size: 13px; font-weight: 700; color: #000F49;">+20 {{ $t('predict.points') }}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">🎯</span>
                <span style="flex: 1; font-size: 13px; color: #333;">{{ $t('predictDetail.ruleCorrectScore') }}</span>
                <span style="font-size: 13px; font-weight: 700; color: #000F49;">+30 {{ $t('predict.points') }}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">❌</span>
                <span style="flex: 1; font-size: 13px; color: #333;">{{ $t('predictDetail.ruleWrong') }}</span>
                <span style="font-size: 13px; font-weight: 700; color: #000F49;">0 {{ $t('predict.points') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Prediction Options -->
        <div class="predict-detail-right">
          <div class="detail-card" style="padding: 32px;">
            <h2 style="font-size: 24px; font-weight: 700; color: #000F49; margin: 0 0 8px 0;">
              {{ $t('predictDetail.optionsTitle') }}
            </h2>
            <p style="font-size: 14px; color: #999; margin: 0 0 32px 0;">
              {{ $t('predictDetail.optionsSubtitle') }}
            </p>

            <!-- Section 1: Match Result -->
            <div style="margin-bottom: 32px;">
              <h3 style="font-size: 16px; font-weight: 700; color: #000F49; margin: 0 0 6px 0;">
                {{ $t('predictDetail.section1Title') }}
              </h3>
              <p style="font-size: 13px; color: #999; margin: 0 0 16px 0;">
                {{ $t('predictDetail.section1Desc') }}
              </p>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                <button
                  class="option-btn"
                  :class="{ 'option-btn--selected': selectedResult === 'home' }"
                  @click="selectedResult = 'home'"
                >
                  <img :src="`https://flagcdn.com/w40/${match.home.code}.png`" :alt="match.home.name" style="width: 24px; height: 16px; object-fit: cover; border-radius: 2px;" />
                  <span>{{ match.home.name }} {{ $t('predictDetail.homeWin') }}</span>
                </button>
                <button
                  class="option-btn"
                  :class="{ 'option-btn--selected': selectedResult === 'draw' }"
                  @click="selectedResult = 'draw'"
                >
                  <span style="font-size: 16px;">⚽</span>
                  <span>{{ $t('predictDetail.draw') }}</span>
                </button>
                <button
                  class="option-btn"
                  :class="{ 'option-btn--selected': selectedResult === 'away' }"
                  @click="selectedResult = 'away'"
                >
                  <img :src="`https://flagcdn.com/w40/${match.away.code}.png`" :alt="match.away.name" style="width: 24px; height: 16px; object-fit: cover; border-radius: 2px;" />
                  <span>{{ match.away.name }} {{ $t('predictDetail.awayWin') }}</span>
                </button>
              </div>
              <!-- Tip -->
              <div v-if="selectedResult" style="background: #FFF8E1; border-left: 3px solid #FFD700; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #666; margin-top: 16px;">
                {{ $t('predictDetail.section1Tip') }}
              </div>
            </div>

            <!-- Section 2: Score Prediction -->
            <div style="margin-bottom: 32px;">
              <h3 style="font-size: 16px; font-weight: 700; color: #000F49; margin: 0 0 6px 0;">
                {{ $t('predictDetail.section2Title') }}
              </h3>
              <p style="font-size: 13px; color: #999; margin: 0 0 16px 0;">
                {{ $t('predictDetail.section2Desc') }}
              </p>
              <div style="display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap;">
                <!-- Home Score -->
                <div style="display: flex; align-items: center; gap: 8px;">
                  <img :src="`https://flagcdn.com/w40/${match.home.code}.png`" :alt="match.home.name" style="width: 24px; height: 16px; object-fit: cover; border-radius: 2px;" />
                  <span style="font-size: 14px; font-weight: 600; color: #333;">{{ match.home.name }}</span>
                  <div class="score-input-wrapper">
                    <input
                      v-model.number="homeScore"
                      type="number"
                      min="0"
                      max="10"
                      class="score-input"
                    />
                  </div>
                </div>
                <span style="font-size: 20px; font-weight: 700; color: #999;">-</span>
                <!-- Away Score -->
                <div style="display: flex; align-items: center; gap: 8px;">
                  <img :src="`https://flagcdn.com/w40/${match.away.code}.png`" :alt="match.away.name" style="width: 24px; height: 16px; object-fit: cover; border-radius: 2px;" />
                  <span style="font-size: 14px; font-weight: 600; color: #333;">{{ match.away.name }}</span>
                  <div class="score-input-wrapper">
                    <input
                      v-model.number="awayScore"
                      type="number"
                      min="0"
                      max="10"
                      class="score-input"
                    />
                  </div>
                </div>
              </div>
              <!-- Tip -->
              <div style="background: #FFF8E1; border-left: 3px solid #FFD700; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #666; margin-top: 16px;">
                {{ $t('predictDetail.section2Tip') }}
              </div>
            </div>

            <!-- Section 3: Total Goals -->
            <div>
              <h3 style="font-size: 16px; font-weight: 700; color: #000F49; margin: 0 0 6px 0;">
                {{ $t('predictDetail.section3Title') }}
              </h3>
              <p style="font-size: 13px; color: #999; margin: 0 0 16px 0;">
                {{ $t('predictDetail.section3Desc') }}
              </p>
              <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px;">
                <button
                  v-for="goal in goalOptions"
                  :key="goal"
                  class="goal-btn"
                  :class="{ 'goal-btn--selected': selectedGoals === goal }"
                  @click="selectedGoals = goal"
                >
                  {{ goal }}
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom Submit Bar -->
          <div class="submit-bar">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 20px;">⏰</span>
              <div>
                <div style="color: white; font-weight: 700; font-size: 15px;">
                  {{ $t('predictDetail.submitDeadline', { days: String(countdown.days).padStart(2, '0'), hours: String(countdown.hours).padStart(2, '0'), minutes: String(countdown.minutes).padStart(2, '0'), seconds: String(countdown.seconds).padStart(2, '0') }) }}
                </div>
                <div style="color: rgba(255,255,255,0.6); font-size: 13px;">
                  {{ $t('predictDetail.submitHint') }}
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
              <span style="color: rgba(255,255,255,0.8); font-size: 14px;">{{ $t('predictDetail.maxPoints') }}</span>
              <button class="submit-btn">
                {{ $t('predictDetail.submit') }}
              </button>
            </div>
          </div>

          <!-- Disclaimer -->
          <div style="margin-top: 16px; font-size: 13px; color: #999; display: flex; align-items: center; gap: 6px;">
            <span>ℹ</span>
            {{ $t('predictDetail.disclaimer') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// ─── SEO ───
useHead({
  title: () => `${t('predictDetail.title')} - WorldCupDex`,
})

// ─── Mock Match Data ───
const match = {
  date: '2026年6月12日',
  weekday: '周五',
  time: '03:00',
  group: 'A',
  home: { name: '墨西哥', code: 'mx' },
  away: { name: '阿根廷', code: 'ar' },
  venue: '阿兹特克球场',
  city: '墨西哥城',
  deadlineDate: '2026年6月12日 02:59',
}

// ─── Countdown Logic ───
const deadline = new Date('2026-06-12T02:59:00').getTime()
const countdown = reactive({ days: 0, hours: 0, minutes: 0, seconds: 0 })

function updateCountdown() {
  const now = Date.now()
  const diff = Math.max(0, deadline - now)
  countdown.days = Math.floor(diff / (1000 * 60 * 60 * 24))
  countdown.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  countdown.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  countdown.seconds = Math.floor((diff % (1000 * 60)) / 1000)
}

let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// ─── Prediction State ───
const selectedResult = ref<string>('draw')
const homeScore = ref<number>(1)
const awayScore = ref<number>(2)
const selectedGoals = ref<string>('3')
const goalOptions = ['0', '1', '2', '3', '4', '5+']
</script>

<style scoped>
/* Layout */
.predict-detail-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (min-width: 1024px) {
  .predict-detail-layout {
    flex-direction: row;
    align-items: stretch;
  }
  .predict-detail-left {
    width: 380px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .predict-detail-right {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

/* Card */
.detail-card {
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
}

/* Option Buttons */
.option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 12px;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  transition: all 0.2s;
}
.option-btn:hover {
  border-color: #000F49;
}
.option-btn--selected {
  border: 2px solid #000F49;
  background: #F0F4FF;
}

/* Goal Buttons */
.goal-btn {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
  background: white;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}
.goal-btn:hover {
  border-color: #000F49;
}
.goal-btn--selected {
  background: #000F49;
  color: white;
  border-color: #000F49;
}

/* Score Input */
.score-input-wrapper {
  position: relative;
}
.score-input {
  width: 80px;
  padding: 10px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  color: #000F49;
  outline: none;
  transition: border-color 0.2s;
}
.score-input:focus {
  border-color: #000F49;
}

/* Submit Bar */
.submit-bar {
  background: #000F49;
  border-radius: 12px;
  padding: 20px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  flex-wrap: wrap;
  gap: 16px;
}
.submit-btn {
  background: #FFD700;
  color: #000F49;
  font-weight: 700;
  font-size: 15px;
  padding: 12px 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}
.submit-btn:hover {
  opacity: 0.9;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .submit-bar {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 20px;
  }
}
</style>
