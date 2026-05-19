<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()

// SEO
useSeoConfig({
  title: '冠军竞猜 | WorldCupDex',
  description: '选择你支持的球队，生成冠军预测卡片分享给朋友！2026世界杯冠军竞猜。',
  ogImage: '/og/champion-predict.png',
})

// ── 状态 ──
const selectedTeam = ref<{
  id: string
  nameZh: string
  nameEn: string
  code: string
  flag: string
} | null>(null)

const showResult = ref(false)
const cardRef = ref<HTMLElement | null>(null)

// ── 获取球队数据 ──
const { data: teamsResponse } = useFetch<{
  data: Array<{
    id: string
    nameZh: string
    nameEn: string
    code: string
    group: string
    flag: string
    fifaRank: number
  }>
  total: number
}>('/api/teams', {
  query: { pageSize: 48 },
})

const teams = computed(() => {
  if (!teamsResponse.value?.data) return []
  return teamsResponse.value.data.filter(t => t.group && t.group.trim() !== '')
})

// ── 选择球队 ──
function selectTeam(team: typeof teams.value[number]) {
  selectedTeam.value = {
    id: team.id,
    nameZh: team.nameZh,
    nameEn: team.nameEn,
    code: team.code,
    flag: team.flag,
  }
}

// ── 确认生成卡片 ──
function confirmPrediction() {
  if (!selectedTeam.value) return

  // 保存到 localStorage
  const data = {
    teamId: selectedTeam.value.id,
    teamName: selectedTeam.value.nameZh,
    teamNameEn: selectedTeam.value.nameEn,
    timestamp: Date.now(),
  }
  localStorage.setItem('wcd_champion_prediction', JSON.stringify(data))

  showResult.value = true
}

// ── 重新选择 ──
function resetSelection() {
  showResult.value = false
  selectedTeam.value = null
}

// ── 分享参数 ──
const shareText = computed(() => {
  if (!selectedTeam.value) return ''
  return `我押 ${selectedTeam.value.nameZh} 拿下2026世界杯冠军！🏆 你选谁？`
})

const shareUrl = 'https://worldcupdex.org/predict/champion?utm_source=share&utm_medium=card&utm_campaign=champion'

const shareFilename = computed(() => {
  if (!selectedTeam.value) return 'worldcupdex-champion.png'
  return `worldcupdex-champion-${selectedTeam.value.id}.png`
})

// ── 页面加载时检查是否有已保存的预测 ──
onMounted(() => {
  try {
    const stored = localStorage.getItem('wcd_champion_prediction')
    if (stored) {
      const data = JSON.parse(stored)
      // 如果有保存的预测，预选该球队但不自动进入结果页
      // 用户可重新选择
    }
  } catch {}
})
</script>

<template>
  <div class="champion-page">
    <!-- 顶部装饰背景 -->
    <div class="champion-page__bg" aria-hidden="true"></div>

    <div class="champion-page__container">
      <!-- 选择区域 -->
      <template v-if="!showResult">
        <!-- Hero -->
        <section class="champion-page__hero">
          <div class="champion-page__trophy">🏆</div>
          <h1 class="champion-page__title">
            选择你心中的<span class="champion-page__title-highlight">冠军</span>
          </h1>
          <p class="champion-page__subtitle">
            48支球队，逐鹿绿茵大力神杯！选出你的冠军预测，生成专属卡片！
          </p>
        </section>

        <!-- 球队网格 -->
        <section class="champion-page__grid">
          <button
            v-for="team in teams"
            :key="team.id"
            class="champion-page__team-card"
            :class="{ 'champion-page__team-card--selected': selectedTeam?.id === team.id }"
            @click="selectTeam(team)"
          >
            <div class="champion-page__flag-wrapper">
              <img
                :src="team.flag"
                :alt="team.nameEn"
                class="champion-page__team-flag"
                crossorigin="anonymous"
              >
            </div>
            <span class="champion-page__team-name">{{ team.nameZh }}</span>
            <span class="champion-page__team-name-en">{{ team.nameEn }}</span>
          </button>
        </section>

        <!-- 底部提示 -->
        <div class="champion-page__tip">
          <span class="champion-page__tip-icon">ⓘ</span>
          提交后可生成你的专属冠军预测卡片
          <span class="champion-page__tip-sparkle">✨</span>
        </div>

        <!-- 确认按钮 -->
        <Transition name="slide-up">
          <div v-if="selectedTeam" class="champion-page__confirm-bar">
            <button class="champion-page__confirm-btn" @click="confirmPrediction">
              生成我的冠军预测卡 🏆
            </button>
          </div>
        </Transition>
      </template>

      <!-- 结果区域 -->
      <template v-else>
        <section class="champion-page__result">
          <!-- 结果页顶部标题 -->
          <div class="champion-page__result-hero">
            <p class="champion-page__result-desc">成功！你的冠军预测卡已生成，生成专属预测卡片！</p>
            <h2 class="champion-page__result-title">你的冠军预测卡</h2>
          </div>

          <!-- 卡片预览 -->
          <div class="champion-page__card-wrapper">
            <div ref="cardRef">
              <ChampionCard
                :team-id="selectedTeam!.id"
                :team-name="selectedTeam!.nameZh"
                :team-name-en="selectedTeam!.nameEn"
                :team-flag="selectedTeam!.flag"
                :team-code="selectedTeam!.code"
              />
            </div>
          </div>

          <!-- 分享面板 -->
          <div class="champion-page__share">
            <SharePanel
              :share-text="shareText"
              :share-url="shareUrl"
              :card-ref="cardRef"
              :filename="shareFilename"
              save-button-text="保存预测卡片"
              share-title="分享给好友"
            />
          </div>

          <!-- 重新选择 -->
          <div class="champion-page__reset">
            <button class="champion-page__reset-btn" @click="resetSelection">
              ← 重新选择
            </button>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.champion-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(180deg, #F5F8FF 0%, #ECF1FB 60%, #FFFFFF 100%);
  padding: 32px 16px 80px;
  overflow: hidden;
}

/* 顶部装饰弧线背景 */
.champion-page__bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 420px;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 100% 30%, rgba(255, 200, 50, 0.08), transparent 60%),
    radial-gradient(ellipse at 0% 60%, rgba(99, 156, 255, 0.18), transparent 55%),
    radial-gradient(ellipse 80% 90% at 50% 100%, rgba(180, 210, 255, 0.55), transparent 70%);
}

.champion-page__container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== Hero ===== */
.champion-page__hero {
  text-align: center;
  margin-bottom: 36px;
  padding-top: 12px;
}

.champion-page__trophy {
  font-size: 36px;
  line-height: 1;
  margin-bottom: 12px;
}

.champion-page__title {
  font-family: 'Montserrat', sans-serif;
  font-size: 40px;
  font-weight: 800;
  color: #000F49;
  margin: 0 0 14px;
  letter-spacing: 0.5px;
}

.champion-page__title-highlight {
  color: #2D7AF6;
  margin-left: 4px;
}

.champion-page__subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #6B7280;
  margin: 0 auto;
  max-width: 560px;
  line-height: 1.6;
}

/* ===== 球队网格 ===== */
.champion-page__grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.champion-page__team-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 12px 16px;
  border-radius: 14px;
  background: #FFFFFF;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  color: #000F49;
  box-shadow: 0 2px 10px rgba(15, 32, 80, 0.06);
}

.champion-page__team-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(45, 122, 246, 0.15);
}

.champion-page__team-card--selected {
  background: #FFFFFF;
  box-shadow: 0 0 0 2px #2D7AF6, 0 8px 20px rgba(45, 122, 246, 0.25);
}

.champion-page__team-card--selected:hover {
  box-shadow: 0 0 0 2px #2D7AF6, 0 10px 24px rgba(45, 122, 246, 0.3);
}

.champion-page__flag-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 48px;
  margin-bottom: 4px;
}

.champion-page__team-flag {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.champion-page__team-name {
  font-size: 15px;
  font-weight: 700;
  color: #1A1A1A;
  text-align: center;
  line-height: 1.2;
}

.champion-page__team-name-en {
  font-size: 12px;
  color: #9CA3AF;
  text-align: center;
  line-height: 1.2;
  font-family: 'Inter', sans-serif;
}

/* ===== 底部提示 ===== */
.champion-page__tip {
  text-align: center;
  font-size: 14px;
  color: #9CA3AF;
  font-family: 'Inter', sans-serif;
  padding: 8px 0 24px;
}

.champion-page__tip-icon {
  margin-right: 6px;
  color: #B0B7C3;
}

.champion-page__tip-sparkle {
  margin-left: 4px;
}

/* ===== 确认按钮栏（选中后底部弹出）===== */
.champion-page__confirm-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(45, 122, 246, 0.15);
  display: flex;
  justify-content: center;
  z-index: 100;
  box-shadow: 0 -4px 20px rgba(15, 32, 80, 0.08);
}

.champion-page__confirm-btn {
  padding: 14px 36px;
  background: linear-gradient(135deg, #2D7AF6 0%, #1A237E 100%);
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(45, 122, 246, 0.35);
}

.champion-page__confirm-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 6px 25px rgba(45, 122, 246, 0.5);
}

/* ===== 结果区域 ===== */
.champion-page__result {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.champion-page__result-hero {
  text-align: center;
  margin-bottom: 28px;
}

.champion-page__result-desc {
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 8px;
  font-family: 'Inter', sans-serif;
}

.champion-page__result-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #000F49;
  margin: 0;
}

.champion-page__card-wrapper {
  margin-bottom: 32px;
}

.champion-page__share {
  width: 100%;
  max-width: 500px;
  margin-bottom: 32px;
}

/* ===== SharePanel 浅色主题覆盖（本页专用） =====
   SharePanel 默认是深色卡片场景下的白色文字，
   本页是浅色背景，需要把白字改成深色，并把 Copy Link 图标背景调深。 */
.champion-page__share :deep(.share-panel__header-text) {
  color: #4B5563;
}
.champion-page__share :deep(.share-panel__diamond) {
  color: rgba(255, 165, 0, 0.7);
}
.champion-page__share :deep(.share-panel__deco-line) {
  background: linear-gradient(90deg, transparent, rgba(0, 15, 73, 0.2), transparent);
}
.champion-page__share :deep(.share-panel__label) {
  color: #4B5563;
}
.champion-page__share :deep(.share-panel__btn) {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  color: #1A1A1A;
  box-shadow: 0 2px 8px rgba(15, 32, 80, 0.05);
}
.champion-page__share :deep(.share-panel__btn:hover) {
  background: #F8FAFF;
  border-color: #2D7AF6;
  box-shadow: 0 4px 12px rgba(45, 122, 246, 0.18);
}
/* Copy Link 按钮：图标背景在白底上不可见，强制改深色让白色描边图标显出来 */
.champion-page__share :deep(.share-panel__btn:last-child .share-panel__icon) {
  background: #1A237E !important;
}

.champion-page__reset {
  text-align: center;
}

.champion-page__reset-btn {
  padding: 10px 24px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.champion-page__reset-btn:hover {
  background: #F3F4F6;
  color: #000F49;
  border-color: #2D7AF6;
}

/* ===== 动画 ===== */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .champion-page__grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
}

@media (max-width: 640px) {
  .champion-page {
    padding: 24px 12px 80px;
  }

  .champion-page__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .champion-page__title {
    font-size: 28px;
  }

  .champion-page__trophy {
    font-size: 30px;
  }

  .champion-page__subtitle {
    font-size: 13px;
    padding: 0 8px;
  }

  .champion-page__team-card {
    padding: 14px 8px 12px;
    gap: 8px;
  }

  .champion-page__flag-wrapper {
    width: 52px;
    height: 38px;
  }

  .champion-page__team-name {
    font-size: 13px;
  }

  .champion-page__team-name-en {
    font-size: 11px;
  }

  .champion-page__tip {
    font-size: 12px;
  }
}
</style>
