<script setup lang="ts">
import type { TeamDetail, SquadPlayer } from '~/types'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { loadFanCard, getFirstMatch } = useFanCard()

// SEO via useSeoConfig (handles title, description, OG, Twitter, canonical, hreflang)
useSeoConfig({
  title: `${t('fanCard.step3Title')} | WorldCupDex`,
  description: 'Create your own World Cup 2026 Fan Card and show your colors!',
  ogImage: '/og/fan-card.png',
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
            />
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
    </div>
  </div>
</template>
