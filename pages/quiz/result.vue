<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { getTitle } = useQuiz()
const { hasUnlockedPremium, unlockPremium } = usePredictions()
const runtimeConfig = useRuntimeConfig()

// 品牌水印：去除协议前缀显示域名
const brandDomain = computed(() => {
  const url = (runtimeConfig.public?.siteUrl as string) || 'https://worldcupdex.org'
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
})
const brandSlogan = computed(() => t('share.watermarkSlogan'))

// 从 URL query 或 sessionStorage 读取结果（必须在 useSeoMeta 之前声明，避免 TDZ 错误）
const score = ref(0)
const correctCount = ref(0)
const totalQuestions = ref(5)
const timeSpent = ref(0)
const percentile = ref(0)

// OG Meta tags via useSeoConfig
useSeoConfig({
  title: 'World Cup IQ Result | WorldCupDex',
  description: 'Take the WorldCupDex World Cup IQ Challenge and test your 2026 football knowledge!',
  ogImage: '/og/quiz-result.png',
  noindex: true,
})

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

const quizPlayPath = computed(() => {
  const path = localePath('/quiz/play/')
  return path.endsWith('/') ? path : `${path}/`
})

const titleKey = computed(() => getTitle(score.value))

// ========== Premium 状态及主题切换 ==========
const isPremiumUnlocked = computed(() => hasUnlockedPremium.value)
const currentTheme = ref<'stadium' | 'cyberpunk' | 'glory-gold'>('stadium')
const currentPremiumBg = ref(1)

// 动态获取各主题拥有的图片数量 (通过 Vite 的 import.meta.glob 在构建时/开发时扫描 public 目录)
const themeBgCounts = ref<Record<string, number>>({
  'stadium': 2,
  'cyberpunk': 2,
  'glory-gold': 2
})

// 使用 import.meta.glob 扫描 public/images/quiz 下的所有 .webp 文件
const webpFiles = import.meta.glob('/public/images/quiz/**/*.webp', { eager: true, query: '?url' })

// 统计各主题文件夹下的文件数量
const counts: Record<string, number> = {
  'stadium': 0,
  'cyberpunk': 0,
  'glory-gold': 0
}

Object.keys(webpFiles).forEach(path => {
  if (path.includes('/Stadium/')) counts['stadium']++
  if (path.includes('/Cyberpunk/')) counts['cyberpunk']++
  if (path.includes('/GloryGold/')) counts['glory-gold']++
})

// 使用实际统计到的数量，如果为 0，则保底显示 1
themeBgCounts.value = {
  'stadium': Math.max(1, counts['stadium']),
  'cyberpunk': Math.max(1, counts['cyberpunk']),
  'glory-gold': Math.max(1, counts['glory-gold'])
}

const currentThemeMaxBg = computed(() => themeBgCounts.value[currentTheme.value] || 2)

function setPremiumTheme(theme: 'stadium' | 'cyberpunk' | 'glory-gold') {
  currentTheme.value = theme
  currentPremiumBg.value = 1
}

function cyclePremiumBg() {
  currentPremiumBg.value = currentPremiumBg.value >= currentThemeMaxBg.value ? 1 : currentPremiumBg.value + 1
}

const previewBgPath = computed(() => {
  if (!isPremiumUnlocked.value) return ''
  
  const dirName = currentTheme.value === 'glory-gold' 
    ? 'GloryGold' 
    : currentTheme.value.charAt(0).toUpperCase() + currentTheme.value.slice(1)
    
  return `/images/quiz/${dirName}/${currentPremiumBg.value}.webp`
})

// ========== 解锁处理 ==========
const showUnlockModal = ref(false)
const unlockStatus = ref<'idle' | 'unlocking'>('idle')

function closeUnlockModal() {
  showUnlockModal.value = false
  unlockStatus.value = 'idle'
}

function handleRealShare(platform: 'twitter' | 'facebook' | 'copy') {
  if (!import.meta.client) return
  
  const text = shareText.value
  const url = shareUrl.value

  if (platform === 'twitter') {
    navigator.clipboard.writeText(`${text} ${url}`).catch(() => {})
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  } else if (platform === 'facebook') {
    navigator.clipboard.writeText(`${text} ${url}`).catch(() => {})
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  } else if (platform === 'copy') {
    navigator.clipboard.writeText(`${text} ${url}`).catch(err => console.error('Copy failed', err))
  }

  unlockStatus.value = 'unlocking'
  
  setTimeout(() => {
    unlockPremium()
    closeUnlockModal()
    
    import('canvas-confetti').then((confetti) => {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
      
      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }
      
      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti.default(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti.default(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
    }).catch(e => console.warn('confetti not loaded', e))
  }, 1800)
}

// ========== 进度环动画 ==========
const animatedScore = ref(0)
const RADIUS = 100
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const arcLength = CIRCUMFERENCE * 0.75 // 270° arc
const gapLength = CIRCUMFERENCE * 0.25 // 90° gap at bottom

const progressOffset = computed(() => arcLength * (1 - animatedScore.value / 100))

const dotAngle = computed(() => (135 + 270 * (animatedScore.value / 100)) * Math.PI / 180)
const dotX = computed(() => 110 + RADIUS * Math.cos(dotAngle.value))
const dotY = computed(() => 110 + RADIUS * Math.sin(dotAngle.value))

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

function playAgain() {
  if (import.meta.client) {
    window.location.assign(quizPlayPath.value)
    return
  }

  return navigateTo(quizPlayPath.value)
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
    
    <!-- 解锁提示栏 -->
    <ClientOnly>
      <div class="flex justify-center mb-4 w-full max-w-[500px]">
        <div v-if="!isPremiumUnlocked" class="w-full bg-gradient-to-r from-fuchsia-50 to-purple-50 border border-fuchsia-400 rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-2">
            <span class="text-xl">✨</span>
            <span class="text-sm font-bold text-fuchsia-800">{{ $t('predictDetail.premiumUnlock.lockedBannerText') }}</span>
          </div>
          <button class="bg-fuchsia-600 hover:bg-fuchsia-700 text-white border-none px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm" @click="showUnlockModal = true">
            {{ $t('predictDetail.premiumUnlock.unlockBtn') }}
          </button>
        </div>
        <div v-else class="w-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-400 rounded-xl p-3 flex items-center justify-center shadow-sm">
          <div class="flex items-center gap-2">
            <span class="text-xl">👑</span>
            <span class="text-sm font-bold text-green-800">{{ $t('predictDetail.premiumUnlock.unlockedBannerText') }}</span>
          </div>
        </div>
      </div>
      <template #fallback>
        <div class="flex justify-center mb-4 w-full max-w-[500px] h-[52px]"></div>
      </template>
    </ClientOnly>

    <!-- ====== Score Card ====== -->
    <div ref="cardRef" class="qr-card">
      <!-- 为了防止 html2canvas 截图出现透明背景或圆角黑边，在这里垫一层纯黑/深色实色背景 -->
      <div style="position: absolute; inset: 0; background: #0B0E14; z-index: -1;"></div>
      
      <div 
        class="qr-card__bg" 
        :class="{ 'qr-card__bg--default': !isPremiumUnlocked }"
        :style="isPremiumUnlocked ? { backgroundImage: `url(${previewBgPath})` } : {}" 
      />
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
          <svg viewBox="0 0 220 220" class="qr-ring__svg">
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
              cx="110" cy="110" :r="RADIUS" fill="none"
              stroke="rgba(255,255,255,0.08)" stroke-width="8"
              :stroke-dasharray="`${arcLength} ${gapLength}`"
              stroke-linecap="round" transform="rotate(135,110,110)"
            />
            <!-- Progress arc -->
            <circle
              cx="110" cy="110" :r="RADIUS" fill="none"
              stroke="url(#ringGrad)" stroke-width="8"
              :stroke-dasharray="`${arcLength} ${gapLength}`"
              :stroke-dashoffset="progressOffset"
              stroke-linecap="round" transform="rotate(135,110,110)"
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

        <!-- Glass Data Panel -->
        <div class="qr-data-panel">
          <!-- Title Badge -->
          <div class="qr-badge">🏅 {{ t(titleKey) }}</div>

          <!-- Percentile -->
          <p class="qr-percentile" v-html="percentileHtml" />

          <!-- Stats Grid -->
          <div class="qr-stats">
            <div class="qr-stat-badge">
              <Icon name="uil:check-circle" class="w-4 h-4 text-emerald-400" />
              <span>{{ t('quiz.correctCount', { correct: correctCount, total: totalQuestions }) }}</span>
            </div>
            <div class="qr-stat-badge">
              <Icon name="uil:stopwatch" class="w-4 h-4 text-blue-400" />
              <span>{{ t('quiz.timeSpent', { time: timeSpent }) }}</span>
            </div>
          </div>
        </div>

        <!-- Watermark -->
        <div class="qr-watermarks">
          <div class="qr-watermark">🏆 WorldCupDex.org</div>
          <div class="qr-brand-watermark">{{ brandDomain }} · {{ brandSlogan }}</div>
        </div>
      </div>

    </div>

    <!-- 主题切换控件 -->
    <ClientOnly>
      <div v-if="isPremiumUnlocked" class="flex justify-center mt-6 mb-2 w-full max-w-[500px]">
        <div class="theme-switcher w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-xl">
          <div class="text-center text-sm font-bold text-white/90 mb-4 tracking-wider">
            {{ t('fanCard.themeSwitcherTitle') || 'CUSTOMIZE YOUR CARD' }}
          </div>
          
          <div class="flex gap-2 mb-4">
            <button 
              class="flex-1 py-2 rounded-lg border-2 text-xs font-bold transition-all" 
              :class="currentTheme === 'stadium' ? 'bg-[#FFD700] border-[#FFD700] text-[#000F49]' : 'bg-transparent border-white/30 text-white hover:bg-white/10'"
              @click="setPremiumTheme('stadium')"
            >
              Stadium
            </button>
            <button 
              class="flex-1 py-2 rounded-lg border-2 text-xs font-bold transition-all" 
              :class="currentTheme === 'cyberpunk' ? 'bg-[#FFD700] border-[#FFD700] text-[#000F49]' : 'bg-transparent border-white/30 text-white hover:bg-white/10'"
              @click="setPremiumTheme('cyberpunk')"
            >
              Cyberpunk
            </button>
            <button 
              class="flex-1 py-2 rounded-lg border-2 text-xs font-bold transition-all" 
              :class="currentTheme === 'glory-gold' ? 'bg-[#FFD700] border-[#FFD700] text-[#000F49]' : 'bg-transparent border-white/30 text-white hover:bg-white/10'"
              @click="setPremiumTheme('glory-gold')"
            >
              Glory Gold
            </button>
          </div>
          
          <button class="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-[#FFD700] transition-colors" @click="cyclePremiumBg">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span>{{ t('fanCard.switchBg', { current: currentPremiumBg, max: currentThemeMaxBg }) || `Switch Background (${currentPremiumBg} / ${currentThemeMaxBg})` }}</span>
          </button>
        </div>
      </div>
      <template #fallback>
        <div class="mt-6 mb-2 w-full max-w-[500px] h-[180px]"></div>
      </template>
    </ClientOnly>

    <!-- ====== Share Panel ====== -->
    <div class="mt-8">
      <SharePanel
        :share-text="shareText"
        :share-url="shareUrl"
        :card-ref="cardRef"
        filename="worldcupdex-iq-result.png"
        :save-button-text="t('quiz.saveImage')"
        :share-title="t('quiz.shareYourScore')"
      />
    </div>

    <!-- ====== KickIQ Cross-site CTA ====== -->
    <KickiqCta source="quiz_result" />

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

    <!-- Share to Unlock Modal -->
    <div v-if="showUnlockModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-5" @click="closeUnlockModal">
      <div class="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl" style="animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);" @click.stop>
        <button v-if="unlockStatus === 'idle'" class="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors" @click="closeUnlockModal">×</button>
        
        <template v-if="unlockStatus === 'idle'">
          <div class="text-center mb-6">
            <span class="text-5xl block mb-3">✨</span>
            <h3 class="text-2xl font-extrabold text-gray-900 mb-2">{{ $t('predictDetail.premiumUnlock.modalTitle') }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">{{ $t('predictDetail.premiumUnlock.modalDesc') }}</p>
          </div>

          <div class="flex flex-col gap-3 mb-5">
            <button class="flex items-center justify-center gap-3 w-full p-3.5 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-sm transition-transform hover:-translate-y-0.5" @click="handleRealShare('twitter')">
              <Icon name="uil:twitter" class="w-5 h-5" />
              <span>{{ $t('predictDetail.premiumUnlock.shareTwitter') }}</span>
            </button>
            <button class="flex items-center justify-center gap-3 w-full p-3.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-sm transition-transform hover:-translate-y-0.5" @click="handleRealShare('facebook')">
              <Icon name="uil:facebook" class="w-5 h-5" />
              <span>{{ $t('predictDetail.premiumUnlock.shareFacebook') }}</span>
            </button>
            <button class="flex items-center justify-center gap-3 w-full p-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-bold text-sm transition-transform hover:-translate-y-0.5" @click="handleRealShare('copy')">
              <Icon name="uil:link" class="w-5 h-5" />
              <span>{{ $t('predictDetail.premiumUnlock.copyLink') }}</span>
            </button>
          </div>
          
          <p class="text-center text-xs text-gray-400 m-0">{{ $t('predictDetail.premiumUnlock.modalHint') }}</p>
        </template>

        <template v-else>
          <div class="flex flex-col items-center justify-center text-center py-10">
            <Icon name="uil:spinner-alt" class="w-12 h-12 text-purple-500 animate-spin mb-5" />
            <h3 class="text-xl font-extrabold text-gray-900 mb-2">{{ $t('predictDetail.premiumUnlock.verifying') }}</h3>
            <p class="text-sm text-gray-500 m-0">{{ $t('predictDetail.premiumUnlock.verifyingDesc') }}</p>
          </div>
        </template>
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
  max-width: 400px;
  aspect-ratio: 9/16;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.qr-card__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center center;
  transition: background-image 0.4s ease, background-color 0.4s ease;
}
.qr-card__bg--default {
  background-color: #0B0E14; /* 更深邃的深蓝色/接近黑 */
  background-image: 
    /* 顶部光晕 - 电光紫 */
    radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.25) 0%, transparent 50%),
    /* 底部发光 - 荧光绿/青 */
    radial-gradient(ellipse at 50% 100%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
    /* 左侧点缀 - 洋红 */
    radial-gradient(circle at 0% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 40%),
    /* 细微网格纹理叠加 (可选, 增加质感) */
    linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 100% 100%, 20px 20px, 20px 20px;
}
.qr-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(10, 14, 42, 0.0) 0%,
    rgba(10, 14, 42, 0.15) 40%,
    rgba(10, 14, 42, 0.8) 100%
  );
}
.qr-card__body {
  position: relative;
  z-index: 1;
  padding: 36px 24px 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Card Title */
.qr-card__title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 24px;
  font-size: 1.05rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
}

/* ===== Progress Ring ===== */
.qr-ring {
  position: relative;
  width: 240px;
  height: 240px;
  margin: 0 auto 24px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 50%;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.05);
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

/* ===== Glass Data Panel ===== */
.qr-data-panel {
  width: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 24px;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
  margin-bottom: 24px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.15);
}

/* ===== Badge ===== */
.qr-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 28px;
  border-radius: 30px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.02) 100%);
  border: 1px solid rgba(255, 215, 0, 0.4);
  color: #FFD700;
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 
    0 4px 16px rgba(255, 215, 0, 0.15),
    inset 0 1px 4px rgba(255, 215, 0, 0.3);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* ===== Percentile ===== */
.qr-percentile {
  font-size: 1.15rem;
  color: #fff;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
}
.qr-percentile :deep(.hl-gold) {
  color: #FFD700;
  font-weight: 700;
  font-size: 1.25rem;
}

/* ===== Stats Grid ===== */
.qr-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
}
.qr-stat-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  padding: 10px 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* ===== Watermark ===== */
.qr-watermarks {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.7;
}

.qr-watermark {
  font-size: 0.85rem;
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.qr-brand-watermark {
  margin-top: 4px;
  font-size: 0.65rem;
  font-weight: 500;
  color: #fff;
  letter-spacing: 0.6px;
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

/* ===== Modal ===== */
@keyframes modal-pop {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
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
}
</style>
