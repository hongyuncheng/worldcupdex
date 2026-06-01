<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePredictions } from '~/composables/usePredictions'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { hasUnlockedPremium, unlockPremium } = usePredictions()
const breadcrumbItems = computed(() => [
  { name: t('nav.home'), path: '/' },
  { name: t('nav.predict'), path: '/predict' },
  { name: t('predict.champion'), path: '/predict/champion' },
])

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
const isJinxMode = ref(false)

// ── 获取球队数据 ──
const { data: teamsResponse } = useTeamList({ pageSize: 48 })

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

  // 计算默认背景 (通过 teamId 哈希)
  const hash = selectedTeam.value.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  currentPremiumBg.value = (hash % 3) + 1

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

// ── 分享与解锁 ──
const shareText = computed(() => {
  if (!selectedTeam.value) return ''
  const name = locale.value === 'zh' ? selectedTeam.value.nameZh : selectedTeam.value.nameEn

  if (isJinxMode.value) {
    const texts = t('share.predictionTexts.jinxChampion', { returnObjects: true }) as string[]
    if (Array.isArray(texts)) {
      const idx = selectedTeam.value.code.charCodeAt(0)
      const baseText = texts[idx % texts.length].replace('{team}', name)
      return `${baseText} ${t('share.hashtags')}`.replace(/\s+/g, ' ')
    }
  }

  const tPrefix = t('champion.shareTextPrefix') || 'I pick '
  const tSuffix = t('champion.shareTextSuffix') || ' to win the 2026 World Cup! 🏆 Who is your pick?'
  return `${tPrefix}${name}${tSuffix} ${t('share.hashtags')}`.replace(/\s+/g, ' ')
})

const shareUrl = 'https://worldcupdex.org/predict/champion?utm_source=share&utm_medium=card&utm_campaign=champion'

const shareFilename = computed(() => {
  if (!selectedTeam.value) return 'worldcupdex-champion.png'
  return `worldcupdex-champion-${selectedTeam.value.id}.png`
})

const showUnlockModal = ref(false)
const unlockStatus = ref<'idle' | 'unlocking'>('idle')

function closeUnlockModal() {
  showUnlockModal.value = false
  unlockStatus.value = 'idle'
}

function handleRealShare(platform: 'twitter' | 'facebook' | 'copy') {
  if (!import.meta.client) return
  
  const text = shareText.value
  const url = shareUrl

  if (platform === 'twitter') {
    navigator.clipboard.writeText(`${text} ${url}`).catch(() => {})
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  } else if (platform === 'facebook') {
    navigator.clipboard.writeText(`${text} ${url}`).catch(() => {})
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  } else if (platform === 'copy') {
    navigator.clipboard.writeText(`${text} ${url}`).catch(() => {})
  }

  unlockStatus.value = 'unlocking'
  
  setTimeout(() => {
    unlockPremium()
    closeUnlockModal()
    
    import('canvas-confetti').then((confetti) => {
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }
      
      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }
      
      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()
        if (timeLeft <= 0) return clearInterval(interval)
        const particleCount = 50 * (timeLeft / duration)
        confetti.default(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }))
        confetti.default(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }))
      }, 250)
    }).catch(e => console.warn('confetti not loaded', e))
  }, 1800)
}

// ── 主题与背景 ──
const currentTheme = ref<'graffiti' | 'minimalist' | 'glasswind' | 'classic'>('graffiti')
const currentPremiumBg = ref(1)

const appliedTheme = computed(() => {
  return hasUnlockedPremium.value ? currentTheme.value : 'basic'
})

const previewBgPath = computed(() => {
  if (!hasUnlockedPremium.value) return undefined
  
  // classic 风格特别处理：因为文件名是 UUID
  if (currentTheme.value === 'classic') {
    return '/images/predict/champion/classic/b4d21c7a-d0e2-48b8-8af0-c3be1967de7b.webp'
  }
  
  // 涂鸦风格对应的目录名是 bgs
  const folder = currentTheme.value === 'graffiti' ? 'bgs' : currentTheme.value

  // 其他风格默认有 5 张背景图 (1.webp/png ~ 5.webp/png)
  const ext = (currentTheme.value === 'minimalist' && currentPremiumBg.value === 1) ? 'png' : 'webp'
  return `/images/predict/champion/${folder}/${currentPremiumBg.value}.${ext}`
})

function setPremiumTheme(theme: 'graffiti' | 'minimalist' | 'glasswind' | 'classic') {
  currentTheme.value = theme
  // 如果切换到 classic，重置 bg 索引为 1
  if (theme === 'classic') {
    currentPremiumBg.value = 1
  }
}

function cyclePremiumBg() {
  if (currentTheme.value === 'classic') return // classic 只有一张图，不循环
  currentPremiumBg.value = currentPremiumBg.value >= 5 ? 1 : currentPremiumBg.value + 1
}

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
      <BreadcrumbSchema :items="breadcrumbItems" nav-class="breadcrumb-schema pt-5" />
      <!-- 选择区域 -->
      <template v-if="!showResult">
        <!-- Hero -->
        <section class="champion-page__hero">
          <div class="champion-page__trophy">🏆</div>
          <h1 class="champion-page__title">
            {{ $t('champion.title') }}<span class="champion-page__title-highlight">{{ $t('champion.titleHighlight') }}</span>
          </h1>
          <p class="champion-page__subtitle">
            {{ $t('champion.subtitle') }}
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
            <span class="champion-page__team-name">{{ locale === 'zh' ? team.nameZh : team.nameEn }}</span>
            <span v-if="locale === 'zh'" class="champion-page__team-name-en">{{ team.nameEn }}</span>
          </button>
        </section>

        <!-- 底部提示 -->
        <div class="champion-page__tip">
          <span class="champion-page__tip-icon">ⓘ</span>
          {{ $t('champion.tip') }}
          <span class="champion-page__tip-sparkle">✨</span>
        </div>

        <!-- 确认按钮 -->
        <Transition name="slide-up">
          <div v-if="selectedTeam" class="champion-page__confirm-bar">
            <button class="champion-page__confirm-btn" @click="confirmPrediction">
              {{ $t('champion.confirmBtn') }}
            </button>
          </div>
        </Transition>
      </template>

        <!-- 结果区域 -->
      <template v-else>
        <section class="champion-page__result">
          <!-- 结果页顶部标题 -->
          <div class="champion-page__result-hero">
            <p class="champion-page__result-desc">{{ $t('champion.resultDesc') }}</p>
            <h2 class="champion-page__result-title">{{ $t('champion.resultTitle') }}</h2>
          </div>

          <!-- 卡片预览 -->
          <div class="champion-page__card-wrapper" :class="{ 'champion-page__card-wrapper--unlocked': hasUnlockedPremium }">
            <!-- 解锁提示栏 -->
            <div v-if="!hasUnlockedPremium" class="predict-page__unlock-banner">
              <div class="unlock-banner-content">
                <span class="unlock-icon">✨</span>
                <span class="unlock-text">{{ $t('predictDetail.premiumUnlock.lockedBannerText') }}</span>
              </div>
              <button class="unlock-btn" @click="showUnlockModal = true">{{ $t('predictDetail.premiumUnlock.unlockBtn') }}</button>
            </div>
            <div v-else-if="hasUnlockedPremium" class="predict-page__unlock-banner predict-page__unlock-banner--success">
              <div class="unlock-banner-content">
                <span class="unlock-icon">👑</span>
                <span class="unlock-text">{{ $t('predictDetail.premiumUnlock.unlockedBannerText') }}</span>
              </div>
            </div>

            <div ref="cardRef">
              <ChampionCard
                :team-id="selectedTeam!.id"
                :team-name="selectedTeam!.nameZh"
                :team-name-en="selectedTeam!.nameEn"
                :team-flag="selectedTeam!.flag"
                :team-code="selectedTeam!.code"
                :theme="appliedTheme"
                :premiumBgImage="previewBgPath"
                :isJinxMode="isJinxMode"
              />
            </div>
            
            <!-- 高级版主题切换控件 -->
            <div v-if="hasUnlockedPremium" class="predict-page__theme-switcher animate-fade-in">
              <div class="theme-switcher-title">{{ $t('predictDetail.premiumUnlock.themeSwitcherTitle') }}</div>
              
              <!-- 毒奶模式开关 -->
              <div class="flex justify-center mb-4 pb-4 border-b border-gray-100 w-full">
                <label class="jinx-mode-toggle flex items-center cursor-pointer gap-3 select-none group bg-purple-50 hover:bg-purple-100 transition-colors px-6 py-3 rounded-full border border-purple-100">
                  <div class="relative">
                    <input type="checkbox" class="sr-only" v-model="isJinxMode">
                    <div class="block w-12 h-7 rounded-full transition-colors duration-300" :class="isJinxMode ? 'bg-purple-600' : 'bg-gray-300'"></div>
                    <div class="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 flex items-center justify-center shadow-sm" :class="isJinxMode ? 'transform translate-x-5' : ''">
                      <span v-if="isJinxMode" class="text-[12px]">🪄</span>
                    </div>
                  </div>
                  <span class="text-base font-bold transition-colors" :class="isJinxMode ? 'text-purple-700' : 'text-gray-600'">🔮 开启毒奶模式</span>
                </label>
              </div>

              <div :class="{'opacity-50 pointer-events-none transition-opacity': isJinxMode}" class="w-full flex flex-col items-center gap-4">
                <div class="theme-buttons">
                  <button 
                    class="theme-btn" 
                    :class="{ 'theme-btn--active': currentTheme === 'graffiti' }"
                    @click="setPremiumTheme('graffiti')"
                  >
                    {{ $t('champion.themeGraffiti') || 'Graffiti' }}
                  </button>
                  <button 
                    class="theme-btn" 
                    :class="{ 'theme-btn--active': currentTheme === 'minimalist' }"
                    @click="setPremiumTheme('minimalist')"
                  >
                    {{ $t('champion.themeMinimalist') || 'Minimalist' }}
                  </button>
                  <button 
                    class="theme-btn" 
                    :class="{ 'theme-btn--active': currentTheme === 'glasswind' }"
                    @click="setPremiumTheme('glasswind')"
                  >
                    {{ $t('champion.themeGlasswind') || 'Glasswind' }}
                  </button>
                  <button 
                    class="theme-btn" 
                    :class="{ 'theme-btn--active': currentTheme === 'classic' }"
                    @click="setPremiumTheme('classic')"
                  >
                    {{ $t('champion.themeClassic') || 'Classic' }}
                  </button>
                </div>
                
                <button class="bg-switch-btn" @click="cyclePremiumBg" :disabled="currentTheme === 'classic'" :class="{ 'opacity-50 cursor-not-allowed': currentTheme === 'classic' }">
                  <Icon name="uil:image-v" class="w-4 h-4" />
                  <span v-if="currentTheme === 'classic'">{{ $t('champion.classicBgUnique') || 'Classic BG is Unique' }}</span>
                  <span v-else>{{ $t('predictDetail.premiumUnlock.switchBg', { current: currentPremiumBg }) }} / 5</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 分享面板 -->
          <div class="champion-page__share">
            <SharePanel
              :share-text="shareText"
              :share-url="shareUrl"
              :card-ref="cardRef"
              :filename="shareFilename"
              :save-button-text="$t('champion.saveCard')"
              :share-title="$t('champion.shareTitle')"
            />
          </div>

          <!-- External Cta 广告组件 -->
          <KickiqCta source="champion_result" class="my-6" />

          <!-- 重新选择 -->
          <div class="champion-page__reset">
            <button class="champion-page__reset-btn" @click="resetSelection">
              {{ $t('champion.resetBtn') }}
            </button>
          </div>
        </section>
      </template>

      <!-- Share to Unlock Modal -->
      <div v-if="showUnlockModal" class="predict-page__modal-overlay" @click="closeUnlockModal">
        <div class="predict-page__modal" @click.stop>
          <button v-if="unlockStatus === 'idle'" class="predict-page__modal-close" @click="closeUnlockModal">×</button>
          
          <template v-if="unlockStatus === 'idle'">
            <div class="modal-header">
              <span class="modal-icon">✨</span>
              <h3 class="modal-title">{{ $t('predictDetail.premiumUnlock.modalTitle') }}</h3>
              <p class="modal-desc">{{ $t('predictDetail.premiumUnlock.modalDesc') }}</p>
            </div>

            <div class="modal-actions">
              <button class="share-btn share-btn--twitter" @click="handleRealShare('twitter')">
                <Icon name="uil:twitter" class="w-5 h-5" />
                <span>{{ $t('predictDetail.premiumUnlock.shareTwitter') }}</span>
              </button>
              <button class="share-btn share-btn--facebook" @click="handleRealShare('facebook')">
                <Icon name="uil:facebook" class="w-5 h-5" />
                <span>{{ $t('predictDetail.premiumUnlock.shareFacebook') }}</span>
              </button>
              <button class="share-btn share-btn--copy" @click="handleRealShare('copy')">
                <Icon name="uil:link" class="w-5 h-5" />
                <span>{{ $t('predictDetail.premiumUnlock.copyLink') }}</span>
              </button>
            </div>
            
            <p class="modal-hint">{{ $t('predictDetail.premiumUnlock.modalHint') }}</p>
          </template>

          <template v-else>
            <div class="modal-unlocking">
              <Icon name="uil:spinner-alt" class="unlocking-spinner" />
              <h3 class="unlocking-title">{{ $t('predictDetail.premiumUnlock.verifying') }}</h3>
              <p class="unlocking-desc">{{ $t('predictDetail.premiumUnlock.verifyingDesc') }}</p>
            </div>
          </template>
        </div>
      </div>

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

/* ===== 解锁与主题切换 ===== */
.champion-page__card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.champion-page__card-wrapper--unlocked {
  margin-top: 16px;
}

.predict-page__unlock-banner {
  width: 100%;
  max-width: 400px;
  background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
  border: 1px solid #e879f9;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(232, 121, 249, 0.15);
}

.predict-page__unlock-banner--success {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #4ade80;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(74, 222, 128, 0.15);
}

.unlock-banner-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unlock-icon {
  font-size: 20px;
}

.unlock-text {
  font-size: 13px;
  font-weight: 700;
  color: #86198f;
  line-height: 1.4;
}

.predict-page__unlock-banner--success .unlock-text {
  color: #166534;
}

.unlock-btn {
  background: #c026d3;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(192, 38, 211, 0.3);
}

.unlock-btn:hover {
  background: #a21caf;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(192, 38, 211, 0.4);
}

.predict-page__theme-switcher {
  width: 100%;
  max-width: 400px;
  margin-top: 24px;
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.theme-switcher-title {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  letter-spacing: 0.5px;
}

.theme-buttons {
  display: flex;
  gap: 8px;
  width: 100%;
}

.theme-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
  color: #4b5563;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.theme-btn--active {
  background: #f0fdf4;
  border-color: #22c55e;
  color: #166534;
}

.bg-switch-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: #f3e8ff;
  color: #7e22ce;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.bg-switch-btn:hover {
  background: #e9d5ff;
  color: #6b21a8;
}

/* ===== 模态框 ===== */
.predict-page__modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.predict-page__modal {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 400px;
  padding: 32px 24px;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-pop {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.predict-page__modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  font-size: 20px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.predict-page__modal-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.modal-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.modal-title {
  font-size: 24px;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 8px;
}

.modal-desc {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  color: #ffffff;
}

.share-btn:hover {
  transform: translateY(-2px);
}

.share-btn--twitter {
  background: #000000;
}
.share-btn--twitter:hover { background: #333333; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }

.share-btn--facebook {
  background: #1877F2;
}
.share-btn--facebook:hover { background: #166fe5; box-shadow: 0 4px 12px rgba(24,119,242,0.3); }

.share-btn--copy {
  background: #f3f4f6;
  color: #374151;
}
.share-btn--copy:hover { background: #e5e7eb; color: #111827; }

.modal-hint {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.modal-unlocking {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
}

.unlocking-spinner {
  width: 48px;
  height: 48px;
  color: #a855f7;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.unlocking-title {
  font-size: 20px;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 8px;
}

.unlocking-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ================== */

.champion-page__share {
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
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
  margin-top: 20px;
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
