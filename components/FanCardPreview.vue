<script setup lang="ts">
import { TEAM_COLORS, DEFAULT_TEAM_COLORS } from '~/data/team-colors'

const { t } = useI18n()

const props = defineProps<{
  teamId: string
  teamName: string
  teamFlag: string
  teamGroup: string
  teamRank: number
  coachName: string
  playerName: string
  playerPhoto: string | null
  playerPosition: string
  nickname: string
  fanNumber: number
  firstMatchOpponent: string | null
  firstMatchDate: string | null
}>()

const colors = computed(() => TEAM_COLORS[props.teamId] || DEFAULT_TEAM_COLORS)

const fanNumberStr = computed(() => String(props.fanNumber).padStart(4, '0'))

const playerInitial = computed(() => {
  if (!props.playerName) return '?'
  return props.playerName.charAt(0).toUpperCase()
})

const formattedDate = computed(() => {
  if (!props.firstMatchDate) return ''
  const parts = props.firstMatchDate.split('-')
  if (parts.length === 3) {
    return `${parseInt(parts[1])}/${parseInt(parts[2])}`
  }
  return props.firstMatchDate
})

// 球队助威口号
const TEAM_SLOGANS: Record<string, string> = {
  'argentina': '¡Vamos Argentina!',
  'brazil': 'Vai Brasil!',
  'germany': "Auf geht's Deutschland!",
  'france': 'Allez les Bleus!',
  'spain': '¡Vamos España!',
  'england': 'Come on England!',
  'portugal': 'Força Portugal!',
  'netherlands': 'Hup Holland Hup!',
  'mexico': '¡Vamos México!',
  'japan': '頑張れ日本!',
  'south-korea': '대한민국 화이팅!',
  'united-states': 'USA! USA! USA!',
  'italy': 'Forza Italia!',
  'croatia': 'Hrvatska!',
  'belgium': 'Allez Belgique!',
  'uruguay': '¡Vamos Uruguay!',
  'colombia': '¡Vamos Colombia!',
  'morocco': 'Dima Maghrib!',
  'senegal': 'Allez les Lions!',
  'turkey': 'Türkiye!',
  'ecuador': '¡Sí se puede!',
  'switzerland': 'Hopp Schwiiz!',
  'canada': 'Go Canada!',
  'australia': 'Go Socceroos!',
  'scotland': 'Come on Scotland!',
}

const slogan = computed(() => {
  return TEAM_SLOGANS[props.teamId] || `Go ${props.teamName}!`
})

// 球员照片加载失败 fallback
const photoError = ref(false)
function onPhotoError() {
  photoError.value = true
}

const showPhoto = computed(() => {
  return props.playerPhoto && !photoError.value
})
</script>

<template>
  <!-- 卡片容器：400x560, 用内联样式确保 html2canvas 截图一致 -->
  <div
    :style="{
      width: '400px',
      height: '560px',
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'Inter, sans-serif',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      boxShadow: 'inset 0 0 60px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.25)',
      color: colors.text,
    }"
  >
    <!-- 内容容器 -->
    <div
      :style="{
        padding: '28px 24px 20px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }"
    >
      <!-- 顶部: FAN CARD -->
      <div :style="{ textAlign: 'center', marginBottom: '8px' }">
        <div
          :style="{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '13px',
            fontWeight: '700',
            letterSpacing: '3px',
            color: colors.accent,
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }"
        >
          🏆 {{ t('fanCard.cardTitle') }}
        </div>
      </div>

      <!-- 金色分割线 -->
      <div
        :style="{
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`,
          marginBottom: '16px',
        }"
      />

      <!-- 球员信息区 -->
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '14px',
        }"
      >
        <!-- 球员照片（圆形） -->
        <div
          :style="{
            width: '88px',
            height: '88px',
            minWidth: '88px',
            borderRadius: '50%',
            border: `3px solid rgba(255,255,255,0.9)`,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.2)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }"
        >
          <img
            v-if="showPhoto"
            :src="playerPhoto!"
            :alt="playerName"
            crossorigin="anonymous"
            :style="{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }"
            @error="onPhotoError"
          >
          <div
            v-else
            :style="{
              fontSize: '36px',
              fontWeight: '800',
              fontFamily: 'Montserrat, sans-serif',
              color: colors.accent,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }"
          >
            {{ playerInitial }}
          </div>
        </div>

        <!-- 右侧信息 -->
        <div :style="{ flex: '1', minWidth: '0' }">
          <div
            :style="{
              fontSize: '22px',
              fontWeight: '800',
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: '1.2',
              textShadow: '0 2px 4px rgba(0,0,0,0.4)',
              marginBottom: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }"
          >
            {{ nickname }}
          </div>
          <div
            :style="{
              fontSize: '18px',
              fontWeight: '700',
              color: colors.accent,
              fontFamily: 'Montserrat, sans-serif',
              textShadow: '0 1px 3px rgba(0,0,0,0.4)',
              marginBottom: '6px',
            }"
          >
            #{{ fanNumberStr }}
          </div>
          <div
            :style="{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: '600',
              padding: '2px 10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }"
          >
            {{ playerPosition }}
          </div>
        </div>
      </div>

      <!-- 球员名 -->
      <div
        :style="{
          fontSize: '13px',
          fontWeight: '500',
          textAlign: 'center',
          marginBottom: '10px',
          opacity: '0.85',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }"
      >
        ⭐ {{ playerName }}
      </div>

      <!-- 分割线 -->
      <div
        :style="{
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${colors.accent}80, transparent)`,
          marginBottom: '14px',
        }"
      />

      <!-- 球队信息 -->
      <div :style="{ marginBottom: '12px' }">
        <!-- 球队名 + 小组 -->
        <div
          :style="{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '6px',
          }"
        >
          <img
            :src="teamFlag"
            :alt="teamName"
            crossorigin="anonymous"
            :style="{
              width: '28px',
              height: '20px',
              objectFit: 'cover',
              borderRadius: '3px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }"
          >
          <span
            :style="{
              fontSize: '16px',
              fontWeight: '700',
              fontFamily: 'Montserrat, sans-serif',
              textShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }"
          >
            {{ teamName }}
          </span>
          <span
            v-if="teamGroup"
            :style="{
              fontSize: '12px',
              fontWeight: '600',
              padding: '1px 8px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.2)',
            }"
          >
            {{ teamGroup }}
          </span>
        </div>

        <!-- FIFA排名 + 教练 -->
        <div
          :style="{
            fontSize: '12px',
            opacity: '0.85',
            marginBottom: '4px',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }"
        >
          FIFA #{{ teamRank }} · {{ coachName }}
        </div>

        <!-- 首场比赛 -->
        <div
          v-if="firstMatchOpponent"
          :style="{
            fontSize: '12px',
            opacity: '0.85',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }"
        >
          {{ t('fanCard.firstMatch') }}: {{ t('fanCard.vs') }} {{ firstMatchOpponent }} {{ formattedDate }}
        </div>
      </div>

      <!-- 分割线 -->
      <div
        :style="{
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${colors.accent}80, transparent)`,
          marginBottom: '14px',
        }"
      />

      <!-- 助威口号 -->
      <div
        :style="{
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }"
      >
        <div
          :style="{
            fontSize: '20px',
            fontWeight: '700',
            fontStyle: 'italic',
            fontFamily: 'Montserrat, sans-serif',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.4)',
            color: colors.accent,
          }"
        >
          "{{ slogan }}"
        </div>
      </div>

      <!-- 水印 -->
      <div
        :style="{
          textAlign: 'center',
          fontSize: '10px',
          fontWeight: '500',
          opacity: '0.5',
          letterSpacing: '1px',
        }"
      >
        WorldCupDex.org
      </div>
    </div>
  </div>
</template>
