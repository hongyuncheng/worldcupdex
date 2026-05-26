<script setup lang="ts">
import type { TeamDetail, SquadPlayer } from '~/types'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { loadFanCard, getFirstMatch } = useFanCard()
const { hasUnlockedPremium, unlockPremium } = usePredictions()

// ── Premium 状态 ──
const isPremiumUnlocked = computed(() => hasUnlockedPremium.value)

// SEO via useSeoConfig (handles title, description, OG, Twitter, canonical, hreflang)
useSeoConfig({
  title: `${t('fanCard.step3Title')} | WorldCupDex`,
  description: 'Create your own World Cup 2026 Fan Card and show your colors!',
  ogImage: '/og/fan-card.png',
  noindex: true,
})

// ── 从 query 或 localStorage 读取参数 ──
const teamId = ref('')
const playerIndex = ref(-1)
const userNickname = ref('')
const fanNumber = ref(0)

onMounted(() => {
  const q = route.query
  if (q.teamId && q.playerIndex && q.nickname && q.fanNumber) {
    teamId.value = q.teamId as string
    playerIndex.value = parseInt(q.playerIndex as string)
    userNickname.value = q.nickname as string
    fanNumber.value = parseInt(q.fanNumber as string)
  } else {
    // 从 localStorage 加载
    const saved = loadFanCard()
    if (saved) {
      teamId.value = saved.teamId
      playerIndex.value = saved.favoritePlayerIndex
      userNickname.value = saved.nickname
      fanNumber.value = saved.fanNumber
    }
  }
})

// ── 获取球队详情 ──
const { data: teamDetail } = useFetch<TeamDetail>(
  () => `/api/teams/${teamId.value}`,
  {
    watch: [teamId],
    immediate: false,
  },
)

// ── 获取首场比赛 ──
const firstMatch = ref<{ opponent: string; opponentEn: string; opponentFlag: string; date: string } | null>(null)

watch(teamId, async (newId) => {
  if (newId) {
    firstMatch.value = await getFirstMatch(newId)
  }
}, { immediate: false })

// 等到挂载后再触发数据获取
onMounted(async () => {
  // 等待 teamId 设定完成
  await nextTick()
  if (teamId.value) {
    firstMatch.value = await getFirstMatch(teamId.value)
  }
})

// ── 计算属性 ──
const team = computed(() => teamDetail.value || null)

const selectedPlayer = computed((): SquadPlayer | null => {
  if (!team.value?.squad || playerIndex.value < 0) return null
  // 按照和 index 页相同的排序取出球员
  const sorted = [...team.value.squad].sort((a, b) => {
    const aHas = a.photo ? 0 : 1
    const bHas = b.photo ? 0 : 1
    return aHas - bHas
  })
  return sorted[playerIndex.value] || null
})

const teamName = computed(() => {
  if (!team.value) return ''
  return locale.value === 'zh' ? team.value.nameZh : team.value.nameEn
})

const coachName = computed(() => {
  if (!team.value) return ''
  return locale.value === 'zh'
    ? (team.value.coach.nameZh || team.value.coach.nameEn)
    : team.value.coach.nameEn
})

const playerName = computed(() => {
  if (!selectedPlayer.value) return ''
  return locale.value === 'zh'
    ? (selectedPlayer.value.nameZh || selectedPlayer.value.name)
    : selectedPlayer.value.name
})

const playerPosition = computed(() => {
  if (!selectedPlayer.value) return ''
  return locale.value === 'zh'
    ? (selectedPlayer.value.positionZh || selectedPlayer.value.position)
    : selectedPlayer.value.position
})

const firstMatchOpponent = computed(() => {
  if (!firstMatch.value) return null
  return locale.value === 'zh' ? firstMatch.value.opponent : firstMatch.value.opponentEn
})

const shareText = computed(() => {
  const name = teamName.value
  const num = String(fanNumber.value).padStart(4, '0')
  if (locale.value === 'zh') {
    return `我是${name}的忠实球迷 #${num}！在WorldCupDex生成你的球迷身份卡吧！`
  } else if (locale.value === 'es') {
    return `¡Soy el fan #${num} de ${name}! ¡Crea tu tarjeta de fan en WorldCupDex!`
  }
  return `I'm fan #${num} of ${name}! Create your fan card at WorldCupDex!`
})

const shareUrl = computed(() => {
  const base = 'https://worldcupdex.org'
  const path = localePath('/fan-card')
  return base + path
})

// ── 卡片 DOM ref ──
const cardRef = ref<HTMLElement | null>(null)

// ── FanCardPreview 组件 ref，用于切换截图模式 ──
const fanCardRef = ref<{ setScreenshotMode: (val: boolean) => void } | null>(null)

// 截图前：切换为代理图片
async function onBeforeSave(): Promise<void> {
  if (fanCardRef.value) {
    fanCardRef.value.setScreenshotMode(true)
    // 等一帧让 Vue 更新 DOM
    await nextTick()
  }
}

// 截图后：恢复原始图片
function onAfterSave(): void {
  if (fanCardRef.value) {
    fanCardRef.value.setScreenshotMode(false)
  }
}

// ── 加入时间 ──
const createdAt = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`
})

// ── 助威口号 ──
const motto = ref('')
onMounted(() => {
  const q = route.query.motto as string
  if (q) {
    motto.value = q
  } else {
    try {
      const stored = sessionStorage.getItem('wcd_fan_card')
      if (stored) {
        const data = JSON.parse(stored)
        motto.value = data.motto || ''
      }
    } catch {}
  }
})

// ── 数据是否就绪 ──
const isReady = computed(() => {
  return teamId.value && team.value && selectedPlayer.value && userNickname.value
})

// ── 主题切换 ──
const currentTheme = ref<'stadium' | 'cyberpunk' | 'glory-gold'>('stadium')
const currentPremiumBg = ref(1)

function setPremiumTheme(theme: 'stadium' | 'cyberpunk' | 'glory-gold') {
  currentTheme.value = theme
  currentPremiumBg.value = 1
}

function cyclePremiumBg() {
  currentPremiumBg.value = currentPremiumBg.value >= 3 ? 1 : currentPremiumBg.value + 1
}

const previewBgPath = computed(() => {
  if (!isPremiumUnlocked.value) return ''
  
  // 转换主题名为目录名 (例如 'stadium' -> 'Stadium', 'glory-gold' -> 'GloryGold')
  const dirName = currentTheme.value === 'glory-gold' 
    ? 'GloryGold' 
    : currentTheme.value.charAt(0).toUpperCase() + currentTheme.value.slice(1)
    
  return `/images/fan-card/${dirName}/${currentPremiumBg.value}.webp`
})

const appliedTheme = computed(() => {
  return isPremiumUnlocked.value ? currentTheme.value : 'basic'
})

// ─── 解锁处理 ───
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
</script>

<template>
  <div style="min-height: 100vh; background: linear-gradient(180deg, #000F49 0%, #0A1628 100%);">
    <div class="max-w-4xl mx-auto px-4 py-10">
      <!-- 标题 -->
      <h1
        class="text-2xl md:text-3xl font-extrabold text-white text-center mb-8"
        style="font-family: 'Montserrat', sans-serif; text-shadow: 0 2px 8px rgba(0,0,0,0.3);"
      >
        {{ t('fanCard.step3Title') }}
      </h1>

      <!-- Loading -->
      <div v-if="!isReady" class="flex items-center justify-center py-20">
        <span class="loading loading-spinner loading-lg text-[#FFD700]"></span>
      </div>

      <!-- 卡片 + 分享区域 -->
      <template v-else>
        <!-- 解锁提示栏 -->
        <div class="flex justify-center mb-4">
          <div v-if="!isPremiumUnlocked" class="w-full max-w-md bg-gradient-to-r from-fuchsia-50 to-purple-50 border border-fuchsia-400 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-2">
              <span class="text-xl">✨</span>
              <span class="text-sm font-bold text-fuchsia-800">{{ $t('predictDetail.premiumUnlock.lockedBannerText') }}</span>
            </div>
            <button class="bg-fuchsia-600 hover:bg-fuchsia-700 text-white border-none px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm" @click="showUnlockModal = true">
              {{ $t('predictDetail.premiumUnlock.unlockBtn') }}
            </button>
          </div>
          <div v-else class="w-full max-w-md bg-gradient-to-r from-green-50 to-emerald-50 border border-green-400 rounded-xl p-3 flex items-center justify-center shadow-sm">
            <div class="flex items-center gap-2">
              <span class="text-xl">👑</span>
              <span class="text-sm font-bold text-green-800">{{ $t('predictDetail.premiumUnlock.unlockedBannerText') }}</span>
            </div>
          </div>
        </div>

        <!-- 卡片居中 -->
        <div class="flex justify-center mb-8">
          <div ref="cardRef">
            <FanCardPreview
              ref="fanCardRef"
              :team-id="teamId"
              :team-name="teamName"
              :team-flag="team!.flag"
              :team-group="team!.group ? (locale === 'zh' ? team!.group + '组' : 'Group ' + team!.group) : ''"
              :team-rank="team!.fifaRank"
              :coach-name="coachName"
              :player-name="playerName"
              :player-photo="selectedPlayer!.photo || null"
              :player-position="playerPosition"
              :nickname="userNickname"
              :fan-number="fanNumber"
              :first-match-opponent="firstMatchOpponent"
              :first-match-date="firstMatch?.date || null"
              :created-at="createdAt"
              :motto="motto"
              :theme="appliedTheme"
              :premiumBgImage="previewBgPath"
            />
          </div>
        </div>

        <!-- 主题切换控件 -->
        <div v-if="isPremiumUnlocked" class="flex justify-center mb-8">
          <div class="theme-switcher w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-xl">
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
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span>{{ t('fanCard.switchBg', { current: currentPremiumBg, max: 3 }) || `Switch Background (${currentPremiumBg} / 3)` }}</span>
            </button>
          </div>
        </div>

        <!-- 分享面板 -->
        <div class="mb-10">
          <SharePanel
            :share-text="shareText"
            :share-url="shareUrl"
            :card-ref="cardRef"
            :filename="`worldcupdex-fancard-${teamId}.png`"
            :share-title="t('share.shareTo')"
            :on-before-save="onBeforeSave"
            :on-after-save="onAfterSave"
          />
        </div>

        <!-- KickIQ Cross-site CTA -->
        <div class="mb-10">
          <KickiqCta source="fan_card_result" />
        </div>

        <!-- 你可能还想 -->
        <div class="text-center mb-10">
          <h3
            class="text-lg font-bold text-white mb-4"
            style="font-family: 'Montserrat', sans-serif;"
          >
            {{ t('share.alsoTry') }}
          </h3>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
            <NuxtLinkLocale
              to="/quiz"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105"
              style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); font-family: 'Inter', sans-serif;"
            >
              🧠 {{ t('share.tryQuiz') }}
            </NuxtLinkLocale>
            <NuxtLinkLocale
              :to="`/teams/${teamId}`"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105"
              style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); font-family: 'Inter', sans-serif;"
            >
              ⚽ {{ t('share.viewTeam') }}
            </NuxtLinkLocale>
          </div>
        </div>

        <!-- AdSense Placeholder -->
        <div class="max-w-md mx-auto text-center p-4 border border-dashed border-white/20 rounded-lg mb-8">
          <span class="text-white/20 text-sm">Ad Space</span>
        </div>

        <!-- Fanatics Affiliate Placeholder -->
        <div
          class="max-w-md mx-auto text-center p-6 rounded-2xl mb-8"
          style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);"
        >
          <p class="text-white/70 text-sm mb-3" style="font-family: 'Inter', sans-serif;">
            {{ t('fanCard.supportTeam') }}
          </p>
          <a
            href="#"
            class="inline-block px-6 py-2.5 rounded-xl text-[#000F49] font-bold text-sm transition-all hover:scale-105"
            style="background: #FFD700; font-family: 'Montserrat', sans-serif; box-shadow: 0 4px 15px rgba(255,215,0,0.3);"
          >
            {{ t('fanCard.buyJersey', { team: teamName }) }}
          </a>
        </div>
      </template>

      <!-- 返回按钮 -->
      <div class="text-center pb-8">
        <NuxtLinkLocale
          to="/fan-card"
          class="text-white/50 hover:text-white text-sm transition-colors"
          style="font-family: 'Inter', sans-serif;"
        >
          ← {{ t('fanCard.title') }}
        </NuxtLinkLocale>
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
  </div>
</template>

<style scoped>
@keyframes modal-pop {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
