<script setup lang="ts">
import type { TeamListItem, PaginatedResponse, TeamDetail, SquadPlayer } from '~/types'

const { t, locale } = useI18n()
const localePath = useLocalePath()
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
  query: { pageSize: 100 },
})

const allTeams = computed(() => {
  if (!teamsResponse.value?.data) return []
  // 只显示有小组的球队（参赛球队）
  return teamsResponse.value.data.filter(t => t.group)
})

const filteredTeams = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return allTeams.value
  return allTeams.value.filter(t =>
    t.nameZh.includes(q) ||
    t.nameEn.toLowerCase().includes(q) ||
    t.id.includes(q),
  )
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
</script>

<template>
  <div style="min-height: 100vh; background: linear-gradient(180deg, #000F49 0%, #0A1628 100%);">
    <!-- Hero 区域 -->
    <div class="text-center pt-10 pb-6 px-4">
      <h1
        class="text-3xl md:text-4xl font-extrabold text-white mb-2"
        style="font-family: 'Montserrat', sans-serif; text-shadow: 0 2px 8px rgba(0,0,0,0.3);"
      >
        {{ t('fanCard.title') }}
      </h1>
      <p class="text-white/70 text-sm md:text-base" style="font-family: 'Inter', sans-serif;">
        {{ t('fanCard.subtitle') }}
      </p>

      <!-- 步骤指示器 -->
      <div class="flex items-center justify-center gap-3 mt-6">
        <div
          v-for="step in 2"
          :key="step"
          class="flex items-center gap-2"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
            :style="{
              backgroundColor: currentStep >= step ? '#FFD700' : 'rgba(255,255,255,0.15)',
              color: currentStep >= step ? '#000F49' : 'rgba(255,255,255,0.5)',
            }"
          >
            {{ step }}
          </div>
          <span
            class="text-sm font-semibold hidden sm:inline"
            :style="{ color: currentStep >= step ? '#FFD700' : 'rgba(255,255,255,0.5)' }"
          >
            {{ step === 1 ? t('fanCard.step1Title') : t('fanCard.step2Title') }}
          </span>
          <div
            v-if="step < 2"
            class="w-8 h-0.5 mx-1"
            :style="{ backgroundColor: currentStep > step ? '#FFD700' : 'rgba(255,255,255,0.15)' }"
          />
        </div>
      </div>
    </div>

    <!-- Step 1: 选球队 -->
    <div v-if="currentStep === 1" class="max-w-5xl mx-auto px-4 pb-12">
      <h2 class="text-xl font-bold text-white mb-4" style="font-family: 'Montserrat', sans-serif;">
        {{ t('fanCard.step1Title') }}
      </h2>

      <!-- 搜索框 -->
      <div class="mb-6">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('fanCard.searchTeam')"
          class="w-full max-w-md px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-[#FFD700] focus:outline-none transition-colors"
          style="font-family: 'Inter', sans-serif;"
        >
      </div>

      <!-- 球队网格 -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <button
          v-for="team in filteredTeams"
          :key="team.id"
          class="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 cursor-pointer"
          :style="{
            backgroundColor: selectedTeamId === team.id ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.06)',
            border: selectedTeamId === team.id ? '2px solid #FFD700' : '2px solid transparent',
          }"
          @click="selectTeam(team.id)"
        >
          <img
            :src="team.flag"
            :alt="getTeamName(team)"
            class="w-12 h-8 object-cover rounded shadow"
            loading="lazy"
          >
          <span class="text-white text-xs font-semibold text-center leading-tight" style="font-family: 'Inter', sans-serif;">
            {{ getTeamName(team) }}
          </span>
          <span class="text-white/40 text-[10px]">
            FIFA #{{ team.fifaRank }}
          </span>
        </button>
      </div>

      <!-- 无结果 -->
      <div v-if="filteredTeams.length === 0" class="text-center py-12 text-white/50">
        {{ t('common.noResults') }}
      </div>

      <!-- 下一步按钮：紧贴网格下方，内联展示 -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="selectedTeamId" class="mt-8 flex justify-center">
          <button
            class="w-full max-w-md py-3.5 rounded-xl text-[#000F49] font-bold text-base transition-all hover:scale-[1.02] active:scale-95"
            style="background: #FFD700; font-family: 'Montserrat', sans-serif; box-shadow: 0 4px 15px rgba(255,215,0,0.3);"
            @click="goToStep2"
          >
            {{ t('fanCard.step2Title') }} →
          </button>
        </div>
      </Transition>
    </div>

    <!-- Step 2: 选球员 + 输入昵称 -->
    <div v-else-if="currentStep === 2" class="max-w-4xl mx-auto px-4 pb-12">
      <!-- 返回按钮 -->
      <button
        class="flex items-center gap-1 text-white/60 hover:text-white text-sm mb-4 transition-colors"
        @click="goBackToStep1"
      >
        ← {{ t('common.back') }}
      </button>

      <h2 class="text-xl font-bold text-white mb-2" style="font-family: 'Montserrat', sans-serif;">
        {{ t('fanCard.step2Title') }}
      </h2>

      <!-- 已选球队提示 -->
      <div v-if="selectedTeam" class="flex items-center gap-2 mb-6 text-white/70 text-sm">
        <img :src="selectedTeam.flag" class="w-6 h-4 object-cover rounded" :alt="getTeamName(selectedTeam)">
        <span>{{ getTeamName(selectedTeam) }}</span>
      </div>

      <!-- 球员网格 -->
      <div v-if="sortedSquad.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <button
          v-for="(player, idx) in sortedSquad"
          :key="idx"
          class="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer text-left"
          :style="{
            backgroundColor: selectedPlayerIdx === idx ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.06)',
            border: selectedPlayerIdx === idx ? '2px solid #FFD700' : '2px solid transparent',
          }"
          @click="selectPlayer(idx)"
        >
          <!-- 球员照片 -->
          <div
            class="w-14 h-14 min-w-[56px] rounded-full overflow-hidden flex items-center justify-center"
            style="background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.2);"
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
              class="text-xl font-bold text-white/60"
              style="font-family: 'Montserrat', sans-serif;"
            >
              {{ getPlayerInitial(player.name) }}
            </span>
          </div>

          <!-- 球员信息 -->
          <div class="min-w-0 flex-1">
            <div
              class="text-white text-sm font-semibold truncate"
              style="font-family: 'Inter', sans-serif;"
            >
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

      <div v-else class="text-center py-8 text-white/50">
        {{ t('common.loading') }}
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
                <div class="text-white text-base font-bold truncate" style="font-family: 'Inter', sans-serif;">
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
            <label class="block text-white/80 text-sm font-semibold mb-2" style="font-family: 'Inter', sans-serif;">
              {{ t('fanCard.nickname') }} *
            </label>
            <input
              v-model="nickname"
              type="text"
              maxlength="12"
              autofocus
              :placeholder="t('fanCard.nicknamePlaceholder')"
              class="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-[#FFD700] focus:outline-none transition-colors"
              style="font-family: 'Inter', sans-serif;"
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
                  fontFamily: 'Montserrat, sans-serif',
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
