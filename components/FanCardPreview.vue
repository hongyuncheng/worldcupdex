<script setup lang="ts">
import { getRandomSlogan } from '~/data/fan-card-slogans'

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
  createdAt?: string
  motto?: string
}>()

const { t } = useI18n()
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
  randomSlogan.value = getRandomSlogan()
})

const displayMotto = computed(() => {
  return props.motto || randomSlogan.value
})
</script>

<template>
  <div class="fan-card">
    <!-- 背景图层 -->
    <div
      class="fan-card__bg"
      :style="{ backgroundImage: `url('/images/fancard-bg-v2.png')` }"
    />
    <!-- 遮罩层 -->
    <div class="fan-card__overlay" />

    <!-- 内容区 -->
    <div class="fan-card__content">
      <!-- Header -->
      <header class="fan-card__header">
        <div class="fan-card__header-left">
          <span class="fan-card__header-icon">🏆</span>
          <span class="fan-card__header-title">FAN CARD</span>
        </div>
      </header>

      <!-- Profile 区域 -->
      <section class="fan-card__profile">
        <div class="fan-card__avatar-wrapper">
          <div class="fan-card__avatar">
            <img
              v-if="showPhoto"
              :src="photoSrc!"
              :alt="playerName"
              class="fan-card__avatar-img"
              @error="onPhotoError"
            >
            <div v-else class="fan-card__avatar-fallback">
              {{ playerInitial }}
            </div>
          </div>
        </div>
        <div class="fan-card__user-info">
          <h2 class="fan-card__nickname">
            {{ nickname }}
            <span class="fan-card__verified">✓</span>
          </h2>
          <p class="fan-card__number">#{{ fanNumberStr }}</p>
          <div class="fan-card__tags">
            <span v-if="createdAt" class="fan-card__tag">
              加入时间 {{ createdAt }}
            </span>
          </div>
        </div>
      </section>

      <!-- 标语 Quote -->
      <section v-if="displayMotto" class="fan-card__quote">
        <span class="fan-card__quote-mark fan-card__quote-mark--left">"</span>
        <p class="fan-card__quote-text">{{ displayMotto }}</p>
        <span class="fan-card__quote-mark fan-card__quote-mark--right">"</span>
      </section>

      <!-- 球队 & 球员信息卡片 -->
      <section class="fan-card__info-card">
        <div class="fan-card__team-side">
          <img :src="teamFlag" :alt="teamName" class="fan-card__team-flag">
          <div class="fan-card__team-detail">
            <small class="fan-card__label">最支持的球队</small>
            <strong class="fan-card__team-name">{{ teamName }}</strong>
            <span class="fan-card__team-meta">{{ teamGroup }} · FIFA #{{ teamRank }}</span>
          </div>
        </div>
        <div class="fan-card__divider" />
        <div class="fan-card__player-side">
          <div class="fan-card__player-detail">
            <small class="fan-card__label">最喜欢的球员</small>
            <strong class="fan-card__player-name-text">{{ playerName }}</strong>
            <span class="fan-card__player-pos">{{ playerPosition }}</span>
          </div>
          <div class="fan-card__jersey">
            <span class="fan-card__jersey-number">10</span>
          </div>
        </div>
      </section>

      <!-- 首场比赛 -->
      <section v-if="firstMatchOpponent" class="fan-card__match">
        <span class="fan-card__match-label">⚽ 首场比赛</span>
        <strong class="fan-card__match-opponent">vs {{ firstMatchOpponent }}</strong>
        <span class="fan-card__match-date">{{ formattedDate }}</span>
      </section>

      <!-- 艺术签名 -->
      <div class="fan-card__signature">
        <span class="fan-card__signature-text">{{ playerName }}</span>
      </div>

      <!-- Footer -->
      <footer class="fan-card__footer">
        <span class="fan-card__footer-left">🏆 WorldCupDex.org</span>
        <span class="fan-card__footer-right">⚽ 全球球迷数据库</span>
      </footer>

      <!-- 品牌水印 -->
      <div class="fan-card__brand-watermark">{{ brandDomain }} · {{ brandSlogan }}</div>
    </div>

    <!-- 右侧竖排文字 -->
    <div class="fan-card__sidebar">WORLD CUP DEX</div>
  </div>
</template>

<style scoped>
.fan-card {
  position: relative;
  max-width: 420px;
  min-height: 680px;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #0a0e2a 0%, #0d1440 50%, #0a1230 100%);
  border: 1px solid rgba(99, 102, 241, 0.5);
  box-shadow:
    0 0 20px rgba(99, 102, 241, 0.3),
    0 0 60px rgba(99, 102, 241, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  font-family: 'Inter', sans-serif;
  color: #ffffff;
}

/* 背景图层 */
.fan-card__bg {
  position: absolute;
  inset: 0;
  background-size: 107%;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
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
  padding: 28px 24px 24px;
  display: flex;
  flex-direction: column;
  min-height: 680px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

/* ===== Header ===== */
.fan-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.fan-card__header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fan-card__header-icon {
  font-size: 20px;
}

.fan-card__header-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #FFD700;
  text-shadow: 0 1px 6px rgba(255, 215, 0, 0.5);
}

/* ===== Profile 区域 ===== */
.fan-card__profile {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 20px;
}

.fan-card__avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  min-width: 120px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, #FFD700, #FFA500, #FFD700, #FFC107);
  box-shadow:
    0 0 20px rgba(255, 215, 0, 0.4),
    0 0 40px rgba(255, 215, 0, 0.1);
}

.fan-card__avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: #0a0e2a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fan-card__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.fan-card__avatar-fallback {
  font-size: 42px;
  font-weight: 800;
  font-family: 'Montserrat', sans-serif;
  color: #FFD700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.fan-card__user-info {
  flex: 1;
  min-width: 0;
}

.fan-card__nickname {
  font-size: 22px;
  font-weight: 800;
  font-family: 'Montserrat', sans-serif;
  color: #ffffff;
  margin: 0 0 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fan-card__verified {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.fan-card__number {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.65);
  margin: 0 0 10px;
  font-weight: 500;
}

.fan-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fan-card__tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* ===== Quote 标语 ===== */
.fan-card__quote {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 4px 0 22px;
  padding: 0 4px;
}

.fan-card__quote-mark {
  font-size: 32px;
  font-weight: 700;
  color: #FFD700;
  line-height: 1;
  font-family: Georgia, 'Times New Roman', serif;
  flex-shrink: 0;
}

.fan-card__quote-mark--left {
  margin-top: -4px;
}

.fan-card__quote-mark--right {
  align-self: flex-end;
  margin-bottom: -4px;
}

.fan-card__quote-text {
  flex: 1;
  font-size: 15px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  margin: 0;
  padding: 0 2px;
}

/* ===== 球队 & 球员信息卡片 ===== */
.fan-card__info-card {
  display: flex;
  align-items: stretch;
  background: rgba(10, 14, 42, 0.5);
  backdrop-filter: none;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 14px;
  gap: 14px;
}

.fan-card__team-side {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.fan-card__team-flag {
  width: 40px;
  height: 28px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.fan-card__team-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fan-card__label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.fan-card__team-name {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  font-family: 'Montserrat', sans-serif;
}

.fan-card__team-meta {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.fan-card__divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
  align-self: stretch;
}

.fan-card__player-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.fan-card__player-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fan-card__player-name-text {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  font-family: 'Montserrat', sans-serif;
}

.fan-card__player-pos {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.fan-card__jersey {
  width: 56px;
  height: 56px;
  min-width: 56px;
  border-radius: 50%;
  background: #0a1628;
  border: 2px solid #FFD700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.25);
}

.fan-card__jersey-number {
  font-size: 24px;
  font-weight: 800;
  color: #FFD700;
  font-family: 'Montserrat', sans-serif;
}

/* ===== 首场比赛 ===== */
.fan-card__match {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(10, 14, 42, 0.5);
  backdrop-filter: none;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 14px;
}

.fan-card__match-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.fan-card__match-opponent {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
}

.fan-card__match-date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-left: auto;
}

/* ===== 艺术签名 ===== */
.fan-card__signature {
  margin-top: 16px;
  padding: 10px 0;
  text-align: center;
  position: relative;
}

.fan-card__signature-text {
  font-family: 'Brush Script MT', 'Segoe Script', cursive;
  font-size: 42px;
  font-weight: 700;
  color: #FFD700;
  letter-spacing: 2px;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.7);
  opacity: 1;
  font-style: italic;
  border-bottom: 2px solid rgba(255, 215, 0, 0.5);
  padding-bottom: 4px;
  transform: rotate(-4deg) skewX(-2deg);
  display: inline-block;
  white-space: nowrap;
}

/* ===== Footer ===== */
.fan-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.fan-card__footer-left,
.fan-card__footer-right {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;
}

.fan-card__brand-watermark {
  margin-top: 6px;
  text-align: center;
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.32);
  letter-spacing: 0.6px;
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
