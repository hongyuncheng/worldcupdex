<script setup lang="ts">
import { getRandomSlogan } from '~/data/fan-card-slogans'

const props = defineProps<{
  teamId: string
  teamName: string
  teamFlag: string
  teamGroup: string
  teamRank: number | null
  coachName: string
  playerName: string
  playerPhoto: string | null
  playerPosition: string
  nickname: string
  fanNumber: number
  firstMatchOpponent: string | null
  firstMatchDate: string | null
  createdAt?: string
  motto?: string
  theme?: string
  premiumBgImage?: string
}>()

const { t, locale } = useI18n()
const runtimeConfig = useRuntimeConfig()
// 品牌水印：去除协议前缀显示域名
const brandDomain = computed(() => {
  const url = (runtimeConfig.public?.siteUrl as string) || 'https://worldcupdex.org'
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
})
const brandSlogan = computed(() => t('share.watermarkSlogan'))

const fanNumberStr = computed(() => String(props.fanNumber).padStart(5, '0'))

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

// 球员照片加载失败 fallback
const photoError = ref(false)
function onPhotoError() {
  photoError.value = true
}

// 截图模式：由父组件在保存前切换为 true，让图片走代理解决跨域
const screenshotMode = ref(false)

// 正常渲染用原始 URL（快），截图时走代理 URL（解决 html2canvas 跨域）
const photoSrc = computed(() => {
  if (!props.playerPhoto) return null
  if (screenshotMode.value) {
    return `/api/image-proxy?url=${encodeURIComponent(props.playerPhoto)}`
  }
  return props.playerPhoto
})

const showPhoto = computed(() => {
  return props.playerPhoto && !photoError.value
})

// screenshotMode 切换时重置错误状态，让代理 URL 重新尝试加载
watch(screenshotMode, () => {
  photoError.value = false
})

// 暴露截图模式切换方法给父组件调用
defineExpose({
  setScreenshotMode(val: boolean) {
    screenshotMode.value = val
  },
})

// 随机标语 - mount 时固定，避免截图时变化
const randomSlogan = ref('')
onMounted(() => {
  randomSlogan.value = getRandomSlogan(locale.value)
})

const displayMotto = computed(() => {
  return props.motto || randomSlogan.value
})
</script>

<template>
  <div class="fan-card" :class="[`theme-${theme || 'stadium'}`]">
    <!-- 背景图层：仅高级版显示图片 -->
    <div
      v-if="theme !== 'basic'"
      class="fan-card__bg"
      :style="{ backgroundImage: `url(${premiumBgImage || '/images/fancard-bg-v3.png'})` }"
    />
    <!-- 基础版背景图层：纯 CSS -->
    <div v-else class="fan-card__bg fan-card__bg--basic" />

    <!-- 遮罩层 - 轻微的暗角效果，让背景更通透 -->
    <div class="fan-card__overlay" />

    <!-- 内容区 -->
    <div class="fan-card__content">
      <!-- 顶部 Header -->
      <header class="fc-header">
        <div class="fc-tag">
          <Icon name="mdi:trophy-outline" class="w-4 h-4 text-[#FFD700]" />
          <span>FAN PASS</span>
        </div>
        <div class="fc-no">NO.{{ fanNumberStr }}</div>
      </header>

      <!-- 核心信息区 (居中) -->
      <section class="fc-hero">
        <div class="fc-avatar-box">
          <img
            v-if="showPhoto"
            :src="photoSrc!"
            :alt="playerName"
            class="fc-avatar"
            @error="onPhotoError"
          >
          <div v-else class="fc-avatar-fallback">{{ playerInitial }}</div>
        </div>
        
        <h2 class="fc-name">
          {{ nickname }}
          <Icon name="mdi:check-decagram" class="fc-verified" />
        </h2>
        
        <div class="fc-joined">{{ $t('fanCard.joinDate', { date: createdAt }) }}</div>
      </section>

      <!-- 标语 -->
      <div v-if="displayMotto" class="fc-quote">
        “{{ displayMotto }}”
      </div>

      <!-- 玻璃态数据卡 -->
      <section class="fc-glass-panel">
        <div class="fc-glass-row">
          <div class="fc-glass-item">
            <label>{{ $t('fanCard.favoritePlayer') }}</label>
            <div class="fc-player-name">{{ playerName }}</div>
          </div>
          <div class="fc-glass-item right">
            <label>LVL</label>
            <div class="fc-level-badge">
              <Icon name="mdi:crown" class="fc-crown" />
              <span>10</span>
            </div>
          </div>
        </div>
        
        <div class="fc-glass-divider" />
        
        <div class="fc-glass-row">
          <div class="fc-glass-item">
            <label>{{ $t('fanCard.favoriteTeam') }}</label>
            <div class="fc-team-info">
              <img :src="teamFlag" :alt="teamName" class="fc-flag" />
              <span>{{ teamName }}</span>
            </div>
          </div>
          <div class="fc-glass-item right">
            <label>{{ $t('fanCard.firstMatch') }}</label>
            <div class="fc-match-info">
              <span>vs {{ firstMatchOpponent }}</span>
              <small>{{ formattedDate }}</small>
            </div>
          </div>
        </div>
      </section>

      <!-- 艺术签名 -->
      <div class="fc-signature">{{ playerName }}</div>

      <!-- 底部极简 Footer -->
      <footer class="fc-footer">
        <div class="fc-footer-logo">
          <Icon name="mdi:trophy-outline" class="w-3 h-3" />
          <span>WorldCupDex.org</span>
        </div>
        <div class="fc-footer-divider"></div>
        <div class="fc-footer-desc">
          全球球迷数据库
        </div>
      </footer>
    </div>

    <!-- 右侧竖排文字 -->
    <div class="fan-card__sidebar">WORLD CUP DEX</div>
  </div>
</template>

<style scoped>
.fan-card {
  position: relative;
  width: 360px;
  height: 640px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, #0a0e2a 0%, #0d1440 50%, #0a1230 100%);
  border: 1px solid rgba(255, 215, 0, 0.4);
  box-shadow:
    0 12px 48px rgba(0, 15, 73, 0.10),
    0 4px 12px rgba(0, 15, 73, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  font-family: 'Inter', sans-serif;
  color: #ffffff;
  max-width: 100%;
}

/* 背景图层 */
.fan-card__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}

/* 基础版纯 CSS 背景 */
.fan-card__bg--basic {
  background: linear-gradient(135deg, #000F49 0%, #0A1628 50%, #061033 100%);
}
.fan-card__bg--basic::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 50% 0%, rgba(255, 215, 0, 0.15) 0%, transparent 60%),
                    radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.2) 0%, transparent 50%);
}

/* 遮罩层 - 顶部暗读内容，底部稍透露球场 */
.fan-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
    rgba(10, 14, 42, 0.35) 0%,
    rgba(10, 14, 42, 0.2) 40%,
    rgba(10, 14, 42, 0.1) 100%
  );
  z-index: 1;
}

/* 内容层 */
.fan-card__content {
  position: relative;
  z-index: 10;
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

/* ===== Header ===== */
.fc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.fc-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  padding: 4px 10px;
  border-radius: 20px;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #FFD700;
}

.fc-no {
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 1px;
}

/* ===== 核心信息区 ===== */
.fc-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
}

.fc-avatar-box {
  position: relative;
  width: 90px;
  height: 90px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fc-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FFD700;
  z-index: 2;
  position: relative;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.5);
}

.fc-avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #0a0e2a;
  border: 2px solid #FFD700;
  z-index: 2;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 800;
  font-family: 'Montserrat', sans-serif;
  color: #FFD700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.5);
}

.fc-name {
  font-size: 24px;
  font-weight: 800;
  font-family: 'Montserrat', sans-serif;
  color: #ffffff;
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.fc-verified {
  color: #3b82f6;
  background: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
}

.fc-joined {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* ===== 标语 Quote ===== */
.fc-quote {
  text-align: center;
  font-style: italic;
  font-size: 14px;
  color: rgba(255, 215, 0, 0.9);
  margin: 0 20px 16px;
  line-height: 1.5;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

/* ===== 玻璃态数据卡 ===== */
.fc-glass-panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.01));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.02);
}

.fc-glass-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fc-glass-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fc-glass-item.right {
  align-items: flex-end;
  text-align: right;
}

.fc-glass-item label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.fc-player-name {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.fc-level-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid rgba(255, 215, 0, 0.4);
  padding: 4px 10px;
  border-radius: 20px;
  color: #FFD700;
  font-weight: 800;
  font-size: 14px;
  font-family: 'Montserrat', sans-serif;
}

.fc-crown {
  width: 16px;
  height: 16px;
}

.fc-glass-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  margin: 16px 0;
}

.fc-team-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.fc-flag {
  width: 24px;
  height: 16px;
  border-radius: 2px;
  object-fit: cover;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.fc-match-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.fc-match-info small {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  font-family: 'Montserrat', sans-serif;
}

/* ===== 艺术签名 ===== */
.fc-signature {
  margin-top: 24px;
  text-align: center;
  font-family: 'Brush Script MT', 'Segoe Script', cursive;
  font-size: 46px;
  font-weight: 700;
  color: #FFD700;
  transform: rotate(-5deg);
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.3);
}

/* ===== 底部极简 Footer ===== */
.fc-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
}

.fc-footer-logo {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 600;
}

.fc-footer-divider {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.fc-footer-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 1px;
  font-weight: 500;
}

/* ===== Sidebar 竖排文字 ===== */
.fan-card__sidebar {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  writing-mode: vertical-rl;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 4px;
  color: rgba(255, 255, 255, 0.2);
  padding: 24px 8px;
  z-index: 11;
}
</style>
