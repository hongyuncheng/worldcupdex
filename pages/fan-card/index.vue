<script setup lang="ts">
import type { TeamListItem, PaginatedResponse, TeamDetail, SquadPlayer } from '~/types'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { generateFanNumber, saveFanCard } = useFanCard()

// SEO
useSeoConfig({
  title: `${t('fanCard.title')} - WorldCupDex`,
  description: '创建你的专属球迷身份卡，展示你支持的球队和座右铭。',
})

// ── Step state ──
const currentStep = ref(1)
const searchQuery = ref('')
const selectedTeamId = ref('')
const selectedPlayerIdx = ref(-1)
const nickname = ref('')
// 昵称输入弹窗显隐
const showNicknameModal = ref(false)

// ── Step 1: 加载球队列表 ──
const { data: teamsResponse } = useFetch<PaginatedResponse<TeamListItem>>('/api/teams', {
  query: { pageSize: 200 },
})

const allTeams = computed(() => {
  if (!teamsResponse.value?.data) return []
  return teamsResponse.value.data
})

// 地区筛选
const selectedConfederation = ref<string | null>(null)
const showConfederationDropdown = ref(false)
const confederations = ['UEFA', 'CONMEBOL', 'CAF', 'AFC', 'CONCACAF', 'OFC']

function toggleConfederation(conf: string | null) {
  selectedConfederation.value = conf
  showConfederationDropdown.value = false
}

function toggleDropdown() {
  showConfederationDropdown.value = !showConfederationDropdown.value
}

// 点击页面其他地方关闭下拉
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.confederation-dropdown')) {
    showConfederationDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const filteredTeams = computed(() => {
  let result = allTeams.value
  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    result = result.filter(t =>
      t.nameZh.includes(q) ||
      t.nameEn.toLowerCase().includes(q) ||
      t.id.includes(q),
    )
  }
  if (selectedConfederation.value) {
    result = result.filter(t => t.confederation === selectedConfederation.value)
  }
  return result
})

function selectTeam(teamId: string) {
  selectedTeamId.value = teamId
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function getTeamName(team: TeamListItem) {
  return locale.value === 'zh' ? team.nameZh : team.nameEn
}

// ── Step 2: 加载球员列表 ──
const { data: teamDetail } = useFetch<TeamDetail>(
  () => `/api/teams/${selectedTeamId.value}`,
  {
    watch: [selectedTeamId],
    immediate: false,
  },
)

const sortedSquad = computed(() => {
  if (!teamDetail.value?.squad) return []
  // 有照片的排在前面
  return [...teamDetail.value.squad].sort((a, b) => {
    const aHas = a.photo ? 0 : 1
    const bHas = b.photo ? 0 : 1
    return aHas - bHas
  })
})

function getPlayerName(player: SquadPlayer) {
  return locale.value === 'zh' ? (player.nameZh || player.name) : player.name
}

function getPlayerPosition(player: SquadPlayer) {
  return locale.value === 'zh' ? (player.positionZh || player.position) : player.position
}

function positionColor(position: string): string {
  switch (position) {
    case 'Offence': return '#EF4444'
    case 'Midfield': return '#22C55E'
    case 'Defence': return '#3B82F6'
    case 'Goalkeeper': return '#EAB308'
    default: return '#6B7280'
  }
}

function selectPlayer(idx: number) {
  selectedPlayerIdx.value = idx
  // 选中球员后立即弹出昵称输入弹窗
  showNicknameModal.value = true
}

function closeNicknameModal() {
  showNicknameModal.value = false
}

function getPlayerInitial(name: string) {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

// ── Step navigation ──
function goToStep2() {
  if (selectedTeamId.value) {
    currentStep.value = 2
    selectedPlayerIdx.value = -1
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function goBackToStep1() {
  currentStep.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── 帮助我选择：随机选择一支球队 ──
function helpMeChoose() {
  if (allTeams.value.length === 0) return
  const randomIndex = Math.floor(Math.random() * allTeams.value.length)
  selectedTeamId.value = allTeams.value[randomIndex].id
}

const canGenerate = computed(() => {
  return selectedPlayerIdx.value >= 0 && nickname.value.trim().length > 0
})

async function handleGenerate() {
  if (!canGenerate.value) return

  const num = generateFanNumber(selectedTeamId.value)

  // 保存到 localStorage
  saveFanCard({
    nickname: nickname.value.trim(),
    teamId: selectedTeamId.value,
    favoritePlayerIndex: selectedPlayerIdx.value,
    fanNumber: num,
    createdAt: Date.now(),
  })

  // 跳转到结果页
  await navigateTo({
    path: localePath('/fan-card/result'),
    query: {
      teamId: selectedTeamId.value,
      playerIndex: String(selectedPlayerIdx.value),
      nickname: nickname.value.trim(),
      fanNumber: String(num),
    },
  })
}

// ── 选中球队信息 ──
const selectedTeam = computed(() => {
  return allTeams.value.find(t => t.id === selectedTeamId.value) || null
})

// ── URL 参数预填：从球队详情页球员弹窗跳转过来时，自动选中球队和球员 ──
// 支持 ?team=teamId&playerName=xxx，跳过选球队/选球员步骤，直接弹出昵称输入框
const prefilledPlayerName = route.query.playerName as string | undefined

watch(sortedSquad, (squad) => {
  if (!prefilledPlayerName || squad.length === 0 || selectedPlayerIdx.value >= 0) return
  const idx = squad.findIndex(
    p => p.name === prefilledPlayerName || p.nameZh === prefilledPlayerName,
  )
  if (idx >= 0) {
    selectedPlayerIdx.value = idx
    showNicknameModal.value = true
  }
}, { immediate: true })

onMounted(() => {
  const teamParam = route.query.team as string | undefined
  if (teamParam) {
    selectedTeamId.value = teamParam
    currentStep.value = 2
  }
})
</script>

<template>
  <div class="min-h-screen" style="background: #F0F3F8;">
    <!-- Hero 区域 -->
    <div class="relative text-center pt-12 pb-16 px-4 overflow-hidden" style="background: linear-gradient(180deg, #000F49 0%, #0A1628 100%);">
      <div class="relative z-10 flex flex-col items-center">
        <div class="flex items-center gap-4 mb-3">
          <!-- 左侧麦穗/装饰 -->
          <svg class="w-6 h-8 text-white/30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c0 0-8-4-8-12 0-3.5 2-6 5-7 1.5-.5 3 0 3 0s1.5-.5 3 0c3 1 5 3.5 5 7 0 8-8 12-8 12z" opacity="0.5"/>
            <path d="M12 22c0 0-6-3-6-10 0-2.5 1.5-4.5 3.5-5.5 1-.5 2.5 0 2.5 0s1.5-.5 2.5 0c2 1 3.5 3 3.5 5.5 0 7-6 10-6 10z"/>
          </svg>
          <h1
            class="text-3xl md:text-[40px] font-extrabold text-white tracking-wider"
            style="text-shadow: 0 2px 8px rgba(0,0,0,0.3);"
          >
            {{ t('fanCard.title') }}
          </h1>
          <!-- 右侧麦穗/装饰 -->
          <svg class="w-6 h-8 text-white/30" viewBox="0 0 24 24" fill="currentColor" style="transform: scaleX(-1);">
            <path d="M12 22c0 0-8-4-8-12 0-3.5 2-6 5-7 1.5-.5 3 0 3 0s1.5-.5 3 0c3 1 5 3.5 5 7 0 8-8 12-8 12z" opacity="0.5"/>
            <path d="M12 22c0 0-6-3-6-10 0-2.5 1.5-4.5 3.5-5.5 1-.5 2.5 0 2.5 0s1.5-.5 2.5 0c2 1 3.5 3 3.5 5.5 0 7-6 10-6 10z"/>
          </svg>
        </div>
        <p class="text-white/80 text-sm md:text-base font-medium">
          {{ t('fanCard.subtitle') }}
        </p>

        <!-- 步骤指示器：2步 -->
        <div class="flex items-center justify-center gap-3 mt-10">
          <!-- Step 1 -->
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
              :style="{
                backgroundColor: currentStep >= 1 ? '#FFD700' : 'rgba(255,255,255,0.15)',
                color: currentStep >= 1 ? '#000F49' : 'rgba(255,255,255,0.5)',
              }"
            >
              1
            </div>
            <span
              class="text-sm font-semibold hidden sm:inline"
              :style="{ color: currentStep >= 1 ? '#FFD700' : 'rgba(255,255,255,0.5)' }"
            >
              选择你支持的球队
            </span>
          </div>
          <!-- Line -->
          <div class="w-12 h-[1px] bg-white/20 mx-1"></div>
          <!-- Step 2 -->
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
              :style="{
                backgroundColor: currentStep >= 2 ? '#FFD700' : 'rgba(255,255,255,0.15)',
                color: currentStep >= 2 ? '#000F49' : 'rgba(255,255,255,0.5)',
              }"
            >
              2
            </div>
            <span
              class="text-sm font-semibold hidden sm:inline"
              :style="{ color: currentStep >= 2 ? '#FFD700' : 'rgba(255,255,255,0.5)' }"
            >
              选择你想展示的球迷卡
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容白色卡片 -->
    <div class="max-w-7xl mx-auto px-3 md:px-6 -mt-5 relative z-20">
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden" style="min-height: calc(100vh - 200px);">

        <!-- Step 1: 选球队 -->
        <div v-if="currentStep === 1" class="p-6 md:p-8">
          <!-- 标题栏 -->
          <div class="flex items-start gap-3 mb-6">
            <div class="mt-1">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm4 3h8v2H8V9zm0 4h8v2H8v-2z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg md:text-xl font-bold text-gray-900">
                {{ t('fanCard.step1Title') }}
              </h2>
              <p class="text-sm text-gray-500 mt-1">从48支球队中选择你支持的球队，生成专属你的球迷身份证卡</p>
            </div>
          </div>

          <!-- 搜索框 -->
          <div class="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div class="relative flex-1 w-full">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索国家或地区..."
                class="w-full pl-11 pr-4 py-3 rounded-full bg-gray-50/80 text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
              >
            </div>
            <!-- 按地区筛选下拉 -->
            <div class="relative confederation-dropdown flex-shrink-0">
              <button
                class="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-colors whitespace-nowrap"
                :class="selectedConfederation
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'"
                @click.stop="toggleDropdown"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                {{ selectedConfederation || '按地区筛选' }}
                <svg
                  class="w-4 h-4 transition-transform"
                  :class="showConfederationDropdown ? 'rotate-180' : ''"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <!-- 下拉面板 -->
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-95 -translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 -translate-y-1"
              >
                <div
                  v-if="showConfederationDropdown"
                  class="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30"
                >
                  <button
                    class="w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors"
                    :class="selectedConfederation === null ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'"
                    @click.stop="toggleConfederation(null)"
                  >
                    全部地区
                  </button>
                  <div class="my-1 border-t border-gray-100" />
                  <button
                    v-for="conf in confederations"
                    :key="conf"
                    class="w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors"
                    :class="selectedConfederation === conf ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'"
                    @click.stop="toggleConfederation(conf)"
                  >
                    {{ conf }}
                  </button>
                </div>
              </Transition>
            </div>
          </div>

          <!-- 球队网格 -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button
              v-for="team in filteredTeams"
              :key="team.id"
              class="relative flex flex-col items-center justify-center py-5 px-3 rounded-2xl transition-all duration-200 cursor-pointer border-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
              :class="{
                'border-blue-500 bg-blue-50/50': selectedTeamId === team.id,
                'border-transparent bg-white': selectedTeamId !== team.id,
              }"
              @click="selectTeam(team.id)"
            >
              <!-- 选中对勾 -->
              <div
                v-if="selectedTeamId === team.id"
                class="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center z-10 border-2 border-white shadow-sm"
              >
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <img
                :src="team.flag"
                :alt="getTeamName(team)"
                class="w-[52px] h-9 object-cover rounded mb-3 shadow-sm border border-gray-100"
                loading="lazy"
              >
              <span 
                class="text-sm font-bold text-center leading-tight mb-1"
                :class="selectedTeamId === team.id ? 'text-blue-600' : 'text-gray-900'"
              >
                {{ getTeamName(team) }}
              </span>
              <span class="text-gray-400 text-[11px] leading-tight font-medium">
                FIFA #{{ team.fifaRank || 'N/A' }}
              </span>
            </button>
          </div>

          <!-- 无结果 -->
          <div v-if="filteredTeams.length === 0" class="text-center py-12 text-gray-400">
            {{ t('common.noResults') }}
          </div>

          <!-- 底部区域 -->
          <div class="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
            <div class="text-left">
              <p class="text-gray-900 font-bold text-sm">还没有找到你的主队？</p>
              <p class="text-gray-400 text-xs mt-1">我们支持所有国际足联认可的国家/地区</p>
            </div>
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 translate-y-4"
              enter-to-class="opacity-100 translate-y-0"
            >
              <button
                v-if="selectedTeamId"
                class="w-full sm:w-auto px-8 py-3.5 rounded-full text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-95"
                style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);"
                @click="goToStep2"
              >
                下一步：选择球迷卡模板 →
              </button>
            </Transition>
          </div>
        </div>

        <!-- Step 2: 选球员 -->
        <div v-else-if="currentStep === 2" class="p-6 md:p-8">
          <!-- 返回按钮 -->
          <button
            class="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm mb-4 transition-colors"
            @click="goBackToStep1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ t('common.back') }}
          </button>

          <div class="flex items-center gap-3 mb-2">
            <div class="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h2 class="text-lg md:text-xl font-bold text-gray-900">
              {{ t('fanCard.step2Title') }}
            </h2>
          </div>

          <!-- 已选球队提示 -->
          <div v-if="selectedTeam" class="flex items-center gap-2 mb-6 text-gray-500 text-sm">
            <img :src="selectedTeam.flag" class="w-6 h-4 object-cover rounded" :alt="getTeamName(selectedTeam)">
            <span>{{ getTeamName(selectedTeam) }}</span>
          </div>

          <!-- 球员网格 -->
          <div v-if="sortedSquad.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            <button
              v-for="(player, idx) in sortedSquad"
              :key="idx"
              class="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer text-left border-2"
              :class="{
                'border-blue-500 bg-blue-50': selectedPlayerIdx === idx,
                'border-transparent bg-gray-50 hover:bg-gray-100': selectedPlayerIdx !== idx,
              }"
              @click="selectPlayer(idx)"
            >
              <!-- 球员照片 -->
              <div
                class="w-14 h-14 min-w-[56px] rounded-full overflow-hidden flex items-center justify-center"
                :class="selectedPlayerIdx === idx ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-200 border-2 border-gray-300'"
              >
                <img
                  v-if="player.photo"
                  :src="player.photo"
                  :alt="getPlayerName(player)"
                  class="w-full h-full object-cover"
                  loading="lazy"
                >
                <span
                  v-else
                  class="text-xl font-bold text-gray-500"
                >
                  {{ getPlayerInitial(player.name) }}
                </span>
              </div>

              <!-- 球员信息 -->
              <div class="min-w-0 flex-1">
                <div class="text-gray-900 text-sm font-semibold truncate">
                  {{ getPlayerName(player) }}
                </div>
                <span
                  class="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 text-white"
                  :style="{ backgroundColor: positionColor(player.position) }"
                >
                  {{ getPlayerPosition(player) }}
                </span>
              </div>
            </button>
          </div>

          <div v-else class="text-center py-8 text-gray-400">
            {{ t('common.loading') }}
          </div>
        </div>
      </div>
    </div>

    <!-- 昵称输入弹窗：选中球员后弹出，输入昵称并生成身份卡 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showNicknameModal"
          class="fixed inset-0 z-50 flex items-center justify-center px-4"
          style="background: rgba(0, 8, 36, 0.75); backdrop-filter: blur(4px);"
          @click.self="closeNicknameModal"
        >
          <div
            class="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style="background: linear-gradient(180deg, #0F1F5C 0%, #000F49 100%); border: 1px solid rgba(255,215,0,0.2);"
          >
            <!-- 已选球员预览 -->
            <div
              v-if="selectedPlayerIdx >= 0 && sortedSquad[selectedPlayerIdx]"
              class="flex items-center gap-3 mb-5 pb-5 border-b border-white/10"
            >
              <div
                class="w-14 h-14 min-w-[56px] rounded-full overflow-hidden flex items-center justify-center"
                style="background: rgba(255,255,255,0.1); border: 2px solid #FFD700;"
              >
                <img
                  v-if="sortedSquad[selectedPlayerIdx].photo"
                  :src="sortedSquad[selectedPlayerIdx].photo || ''"
                  :alt="getPlayerName(sortedSquad[selectedPlayerIdx])"
                  class="w-full h-full object-cover"
                >
                <span v-else class="text-xl font-bold text-white/60">
                  {{ getPlayerInitial(sortedSquad[selectedPlayerIdx].name) }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-white text-base font-bold truncate">
                  {{ getPlayerName(sortedSquad[selectedPlayerIdx]) }}
                </div>
                <span
                  class="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 text-white"
                  :style="{ backgroundColor: positionColor(sortedSquad[selectedPlayerIdx].position) }"
                >
                  {{ getPlayerPosition(sortedSquad[selectedPlayerIdx]) }}
                </span>
              </div>
            </div>

            <!-- 昵称输入 -->
            <label class="block text-white/80 text-sm font-semibold mb-2">
              {{ t('fanCard.nickname') }} *
            </label>
            <input
              v-model="nickname"
              type="text"
              maxlength="12"
              autofocus
              :placeholder="t('fanCard.nicknamePlaceholder')"
              class="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-[#FFD700] focus:outline-none transition-colors"
              @keyup.enter="canGenerate && handleGenerate()"
            >
            <div class="text-white/30 text-xs mt-1">{{ nickname.length }}/12</div>

            <!-- 操作按钮 -->
            <div class="mt-6 flex gap-3">
              <button
                class="flex-1 py-3 rounded-xl font-semibold text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                style="border: 1px solid rgba(255,255,255,0.15);"
                @click="closeNicknameModal"
              >
                {{ t('common.back') }}
              </button>
              <button
                class="flex-[2] py-3 rounded-xl font-bold text-sm transition-all"
                :style="{
                  background: canGenerate ? '#FFD700' : 'rgba(255,255,255,0.1)',
                  color: canGenerate ? '#000F49' : 'rgba(255,255,255,0.3)',
                  cursor: canGenerate ? 'pointer' : 'not-allowed',
                  boxShadow: canGenerate ? '0 4px 15px rgba(255,215,0,0.3)' : 'none',
                }"
                :disabled="!canGenerate"
                @click="handleGenerate"
              >
                {{ t('fanCard.generate') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
