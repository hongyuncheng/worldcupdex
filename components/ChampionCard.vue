<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TEAM_COLORS, DEFAULT_TEAM_COLORS } from '~/data/team-colors'

const props = defineProps<{
  teamId: string
  teamName: string
  teamNameEn: string
  teamFlag: string
  teamCode: string
  // Premium properties
  premiumBgImage?: string
  theme?: string
  // 毒奶模式
  isJinxMode?: boolean
}>()

const { t, locale, tm, rt } = useI18n()

// 提取 isPremium 供内部快捷使用
const isPremium = computed(() => !!props.premiumBgImage)
const currentTheme = computed(() => props.isJinxMode ? 'jinx' : (props.theme || 'graffiti'))

// 获取球队配色
const teamColors = computed(() => {
  return TEAM_COLORS[props.teamId] || DEFAULT_TEAM_COLORS
})

const accentColor = computed(() => {
  return teamColors.value.accent || '#2D7AF6'
})

// 根据语言返回球队名称
const displayTeamName = computed(() => {
  return locale.value === 'zh' ? props.teamName : props.teamNameEn
})

// 根据语言返回预测文案
const predictionText = computed(() => {
  if (props.isJinxMode) {
    try {
      const texts = tm('share.predictionTexts.jinxChampion') as string[]
      if (Array.isArray(texts) && texts.length > 0) {
        const idx = props.teamCode.charCodeAt(0)
        const text = typeof texts[0] === 'string' ? texts[idx % texts.length] : rt(texts[idx % texts.length])
        return { prefix: '', suffix: '', full: text.replace('{team}', displayTeamName.value) }
      }
    } catch (e) {
      // fallback
    }
  }

  if (locale.value === 'zh') {
    return { prefix: '我押 ', suffix: ' 夺冠！', full: '' }
  } else if (locale.value === 'es') {
    return { prefix: '¡Apuesto por ', suffix: ' para ser Campeón!', full: '' }
  } else {
    return { prefix: 'I pick ', suffix: ' to be the Champion!', full: '' }
  }
})

// ─── 随机主题色系统 (与单场预测保持一致) ───
const themeColors = {
  graffiti: ['#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#14B8A6'], // 荧光色系
  minimalist: ['#60A5FA', '#34D399', '#FBBF24', '#F472B6', '#A78BFA', '#fb7185', '#38bdf8'], // 马卡龙色系
  glasswind: ['#A78BFA', '#F472B6', '#38bdf8', '#34D399', '#FBBF24'] // 偏光/极光色系
}

const randomAccentColor = computed(() => {
  const colors = themeColors[currentTheme.value as keyof typeof themeColors] || themeColors.graffiti
  // 使用哈希保证同一张图和球队分配固定的颜色，避免闪烁
  const seedStr = (props.premiumBgImage || '') + props.teamCode
  let hash = 0
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
})

const premiumStyleVars = computed(() => {
  if (!isPremium.value) return {}
  return {
    '--accent-color': randomAccentColor.value
  }
})

// 格式化当前日期
const formattedDate = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
})

// 距 2026-06-11 开幕的倒计时天数
const daysToGo = computed(() => {
  const target = new Date('2026-06-11T00:00:00')
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return 0
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

// 国旗 URL
const flagUrl = computed(() => {
  return `https://flagcdn.com/w160/${props.teamCode.toLowerCase()}.png`
})
</script>

<template>
  <div class="champion-card" :class="[`layout-${isPremium ? currentTheme : 'basic'}`]" :style="premiumStyleVars">
    
    <!-- ==================== 1. 基础版 (Basic) ==================== -->
    <template v-if="!isPremium">
      <!-- 基础版纯 CSS 渐变背景 -->
      <div class="champion-card__bg basic-bg" aria-hidden="true" />

      <div class="champion-card__content">
        <!-- Header -->
        <header class="champion-card__header">
          <span class="champion-card__header-icon">🏆</span>
          <span class="champion-card__header-title">CHAMPION PREDICTION</span>
        </header>

        <!-- 主体内容 -->
        <div class="champion-card__body">
          <!-- 国旗 -->
          <div class="champion-card__flag-wrapper">
            <div class="champion-card__flag-ring" :style="{ borderColor: accentColor }">
              <img
                :src="flagUrl"
                :alt="teamNameEn"
                class="champion-card__flag-img"
                crossorigin="anonymous"
              >
            </div>
          </div>

          <!-- 预测文案 -->
          <div class="champion-card__prediction">
            <p class="champion-card__prediction-main">
              {{ predictionText.prefix }}<span class="champion-card__team-name" :style="{ color: accentColor }">{{ displayTeamName }}</span>{{ predictionText.suffix }}
            </p>
            <p v-if="locale === 'zh'" class="champion-card__prediction-sub">
              {{ teamNameEn }}
            </p>
          </div>

          <!-- 时间信息 -->
          <div class="champion-card__meta">
            <div class="champion-card__meta-item">
              <svg class="champion-card__meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <div class="champion-card__meta-info">
                <span class="champion-card__meta-label">{{ $t('match.time') || '预测时间' }}</span>
                <span class="champion-card__meta-value">{{ formattedDate }}</span>
              </div>
            </div>
            <div class="champion-card__meta-divider" />
            <div class="champion-card__meta-item">
              <svg class="champion-card__meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              <div class="champion-card__meta-info">
                <span class="champion-card__meta-label">{{ $t('champion.countdown') || '距开幕' }}</span>
                <span class="champion-card__meta-value champion-card__meta-value--highlight">{{ daysToGo }} {{ $t('champion.days') || '天' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="champion-card__footer">
          <span class="champion-card__brand">─── WorldCupDex ───</span>
          <span class="champion-card__brand-cta">{{ $t('champion.footerCta') || '你选谁？— worldcupdex.org' }}</span>
        </footer>
      </div>
    </template>

    <!-- ==================== 2. 高级涂鸦版 (Graffiti) ==================== -->
    <template v-else-if="currentTheme === 'graffiti'">
      <!-- 动态背景图 -->
      <div 
        class="champion-card__premium-bg" 
        :style="{ backgroundImage: `url(${premiumBgImage})` }"
        aria-hidden="true" 
      />
      <!-- 底部遮罩保护可读性 -->
      <div class="premium-overlay-bottom"></div>

      <div class="champion-card__content">
        <!-- Header -->
        <header class="graffiti-header">
          <span class="graffiti-title">⭐ PREMIUM PREDICTION</span>
        </header>

        <!-- 主体内容 -->
        <div class="graffiti-body">
          <!-- 奖杯与国旗 -->
          <div class="graffiti-flag-container">
            <div class="graffiti-flag-ring" :style="{ borderColor: 'var(--accent-color, #EAB308)' }">
              <img
                :src="flagUrl"
                :alt="teamNameEn"
                class="graffiti-flag-img"
                crossorigin="anonymous"
              >
            </div>
          </div>

          <!-- 预测文案 -->
          <div class="graffiti-prediction">
            <div class="graffiti-result-label" :style="{ backgroundColor: 'var(--accent-color, #EAB308)' }">👑 MY CHAMPION PICK</div>
            <p class="graffiti-prediction-main">
              {{ predictionText.prefix }}<span class="graffiti-team-name" :style="{ color: 'var(--accent-color, #EAB308)' }">{{ displayTeamName }}</span>{{ predictionText.suffix }}
            </p>
            <p v-if="locale === 'zh'" class="graffiti-prediction-sub">
              {{ teamNameEn }}
            </p>
          </div>

          <!-- 时间信息 -->
          <div class="graffiti-info">
            <div class="graffiti-info-item">
              <svg class="graffiti-icon" :style="{ color: 'var(--accent-color, #EAB308)' }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <div>
                <p class="graffiti-label" :style="{ color: 'var(--accent-color, #EAB308)' }">{{ $t('match.time') || '预测时间' }}</p>
                <p class="graffiti-value">{{ formattedDate }}</p>
              </div>
            </div>
            <div class="graffiti-info-item">
              <svg class="graffiti-icon" :style="{ color: 'var(--accent-color, #EAB308)' }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              <div>
                <p class="graffiti-label" :style="{ color: 'var(--accent-color, #EAB308)' }">{{ $t('champion.countdown') || '距开幕' }}</p>
                <p class="graffiti-value">{{ daysToGo }} {{ $t('champion.days') || '天' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="graffiti-footer" :style="{ borderTopColor: 'var(--accent-color, #EAB308)' }">
          <div class="premium-badge">
            <span class="badge-icon">⭐</span>
            <span class="badge-text">WorldCupDex Premium Predictor</span>
          </div>
          <div class="domain-watermark">worldcupdex.org</div>
        </footer>
      </div>
    </template>
    <!-- ==================== 3. 高级清新版 (Minimalist) ==================== -->
    <template v-else-if="currentTheme === 'minimalist'">
      <!-- 动态背景图 -->
      <div 
        class="champion-card__premium-bg" 
        :style="{ backgroundImage: `url(${premiumBgImage})` }"
        aria-hidden="true" 
      />
      <!-- 清新版的淡色遮罩 -->
      <div class="premium-overlay-light"></div>

      <div class="champion-card__content">
        <!-- Header -->
        <header class="minimalist-header">
          <span class="minimalist-title" :style="{ color: 'var(--accent-color, #60A5FA)' }">✨ PREMIUM PREDICTION</span>
        </header>

        <!-- 主体内容 -->
        <div class="minimalist-body">
          <!-- 国旗 -->
          <div class="minimalist-flag-wrapper">
            <img
              :src="flagUrl"
              :alt="teamNameEn"
              class="minimalist-flag-img"
              crossorigin="anonymous"
            >
          </div>

          <!-- 预测文案 -->
          <div class="minimalist-prediction">
            <div class="minimalist-result-label" :style="{ backgroundColor: 'var(--accent-color, #60A5FA)' }">👑 MY CHAMPION PICK</div>
            <p class="minimalist-prediction-main">
              {{ predictionText.prefix }}<span class="minimalist-team-name" :style="{ color: 'var(--accent-color, #60A5FA)' }">{{ displayTeamName }}</span>{{ predictionText.suffix }}
            </p>
            <p v-if="locale === 'zh'" class="minimalist-prediction-sub">
              {{ teamNameEn }}
            </p>
          </div>

          <!-- 时间信息 -->
          <div class="minimalist-info">
            <div class="minimalist-info-item">
              <svg class="minimalist-icon" :style="{ color: 'var(--accent-color, #60A5FA)' }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <div>
                <p class="minimalist-label">{{ $t('match.time') || '预测时间' }}</p>
                <p class="minimalist-value">{{ formattedDate }}</p>
              </div>
            </div>
            <div class="minimalist-info-item">
              <svg class="minimalist-icon" :style="{ color: 'var(--accent-color, #60A5FA)' }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              <div>
                <p class="minimalist-label">{{ $t('champion.countdown') || '距开幕' }}</p>
                <p class="minimalist-value">{{ daysToGo }} {{ $t('champion.days') || '天' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="minimalist-footer">
          <div class="premium-badge">
            <span class="badge-icon">✨</span>
            <span class="badge-text" :style="{ color: 'var(--accent-color, #60A5FA)' }">WorldCupDex Premium Predictor</span>
          </div>
          <div class="domain-watermark-dark">worldcupdex.org</div>
        </footer>
      </div>
    </template>

    <!-- ==================== 4. 高级磨砂玻璃版 (Glasswind) ==================== -->
    <template v-else-if="currentTheme === 'glasswind'">
      <!-- 动态背景图 -->
      <div 
        class="champion-card__premium-bg" 
        :style="{ backgroundImage: `url(${premiumBgImage})` }"
        aria-hidden="true" 
      />
      <!-- 玻璃遮罩 -->
      <div class="glass-overlay"></div>

      <div class="champion-card__content">
        <!-- Header -->
        <header class="glasswind-header">
          <div class="glass-pill">
            <span class="glasswind-title">🔮 PREMIUM PREDICTION</span>
          </div>
        </header>

        <!-- 主体内容 -->
        <div class="glasswind-body">
          <!-- 国旗 -->
          <div class="glasswind-flag-wrapper glass-panel">
            <img
              :src="flagUrl"
              :alt="teamNameEn"
              class="glasswind-flag-img"
              crossorigin="anonymous"
            >
          </div>
          <span class="glasswind-team-name-badge glass-panel">{{ teamNameEn }}</span>

          <!-- 预测文案 -->
          <div class="glasswind-prediction glass-panel highlight">
            <div class="glasswind-result-label" :style="{ backgroundColor: 'var(--accent-color, #A78BFA)' }">👑 MY CHAMPION PICK</div>
            <p class="glasswind-prediction-main">
              {{ predictionText.prefix }}<span class="glasswind-team-name" :style="{ color: 'var(--accent-color, #A78BFA)' }">{{ displayTeamName }}</span>{{ predictionText.suffix }}
            </p>
          </div>

          <!-- 时间信息 -->
          <div class="glasswind-info glass-panel">
            <div class="glasswind-info-item">
              <svg class="glasswind-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <div>
                <p class="glasswind-label">{{ $t('match.time') || '预测时间' }}</p>
                <p class="glasswind-value">{{ formattedDate }}</p>
              </div>
            </div>
            <div class="glasswind-info-item">
              <svg class="glasswind-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              <div>
                <p class="glasswind-label">{{ $t('champion.countdown') || '距开幕' }}</p>
                <p class="glasswind-value">{{ daysToGo }} {{ $t('champion.days') || '天' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="glasswind-footer glass-panel-flat">
          <div class="premium-badge">
            <span class="badge-icon">🔮</span>
            <span class="badge-text">WorldCupDex Premium Predictor</span>
          </div>
          <div class="domain-watermark">worldcupdex.org</div>
        </footer>
      </div>
    </template>
    
    <!-- ==================== 5. 经典复古版 (Classic) ==================== -->
    <template v-else-if="currentTheme === 'classic'">
      <!-- 动态背景图 -->
      <div 
        class="champion-card__premium-bg" 
        :style="{ backgroundImage: `url(${premiumBgImage})` }"
        aria-hidden="true" 
      />
      <div class="premium-overlay-classic"></div>

      <div class="champion-card__content">
        <!-- Header -->
        <header class="classic-header">
          <div class="classic-deco-line"></div>
          <span class="classic-title">★ PREMIUM PREDICTION ★</span>
          <div class="classic-deco-line"></div>
        </header>

        <!-- 主体内容 -->
        <div class="classic-body">
          <!-- 国旗 -->
          <div class="classic-flag-wrapper">
            <img
              :src="flagUrl"
              :alt="teamNameEn"
              class="classic-flag-img"
              crossorigin="anonymous"
            >
          </div>

          <!-- 预测文案 -->
          <div class="classic-prediction">
            <div class="classic-result-label">MY CHAMPION PICK</div>
            <p class="classic-prediction-main">
              {{ predictionText.prefix }}<span class="classic-team-name" :style="{ color: 'var(--accent-color, #EAB308)' }">{{ displayTeamName }}</span>{{ predictionText.suffix }}
            </p>
            <p v-if="locale === 'zh'" class="classic-prediction-sub">
              {{ teamNameEn }}
            </p>
          </div>

          <!-- 时间信息 -->
          <div class="classic-info">
            <div class="classic-info-item">
              <span class="classic-label">{{ $t('champion.date') || 'DATE' }}</span>
              <span class="classic-value">{{ formattedDate }}</span>
            </div>
            <div class="classic-divider">|</div>
            <div class="classic-info-item">
              <span class="classic-label">{{ $t('champion.countdownLabel') || 'COUNTDOWN' }}</span>
              <span class="classic-value">{{ daysToGo }} {{ $t('champion.daysAbbr') || 'D' }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="classic-footer">
          <div class="classic-footer-content">
            <span class="classic-badge-text">WorldCupDex Premium Predictor</span>
            <span class="classic-domain">worldcupdex.org</span>
          </div>
        </footer>
      </div>
    </template>

    <!-- ==================== 6. 毒奶版 (Jinx) ==================== -->
    <template v-else-if="currentTheme === 'jinx'">
      <div class="champion-card__premium-bg jinx-bg" aria-hidden="true" />
      <div class="jinx-overlay"></div>

      <!-- CSS 毒奶认证印章 -->
      <div class="jinx-stamp">
        <div class="stamp-inner">
          <span class="stamp-text" v-if="locale === 'zh'">毒奶<br/>认证</span>
          <span class="stamp-text" v-else-if="locale === 'es'">JINX<br/>CERT</span>
          <span class="stamp-text" v-else>JINX<br/>CERT</span>
        </div>
      </div>

      <div class="champion-card__content">
        <!-- Header -->
        <header class="jinx-header">
          <span class="jinx-title">🔮 JINX PREDICTION</span>
        </header>

        <!-- 主体内容 -->
        <div class="jinx-body">
          <!-- 国旗 -->
          <div class="jinx-flag-wrapper">
            <img
              :src="flagUrl"
              :alt="teamNameEn"
              class="jinx-flag-img"
              crossorigin="anonymous"
            >
          </div>
          <span class="jinx-team-name-badge">{{ teamNameEn }}</span>

          <!-- 预测文案 -->
          <div class="jinx-prediction">
            <p class="jinx-prediction-main">
              {{ predictionText.full || (predictionText.prefix + displayTeamName + predictionText.suffix) }}
            </p>
          </div>

          <!-- 时间信息 -->
          <div class="jinx-info">
            <div class="jinx-info-item">
              <svg class="jinx-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <div>
                <p class="jinx-label">{{ $t('match.time') || '预测时间' }}</p>
                <p class="jinx-value">{{ formattedDate }}</p>
              </div>
            </div>
            <div class="jinx-info-item">
              <svg class="jinx-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              <div>
                <p class="jinx-label">{{ $t('champion.countdown') || '距开幕' }}</p>
                <p class="jinx-value">{{ daysToGo }} {{ $t('champion.days') || '天' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="jinx-footer">
          <div class="premium-badge">
            <span class="badge-icon">🔮</span>
            <span class="badge-text">WorldCupDex Jinx Predictor</span>
          </div>
          <div class="domain-watermark">worldcupdex.org</div>
        </footer>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* 基本样式 */
.champion-card {
  position: relative;
  width: 360px;
  height: 640px;
  border-radius: 20px;
  overflow: hidden;
  background: #FFFFFF;
  box-shadow:
    0 12px 48px rgba(0, 15, 73, 0.1),
    0 4px 12px rgba(0, 15, 73, 0.06);
  font-family: 'Inter', 'PingFang SC', sans-serif;
  color: #1F2937;
  max-width: 100%;
}

.champion-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 24px 24px 0;
}

/* ==================== 1. Basic Style ==================== */
.champion-card__bg {
  position: absolute;
  inset: 0;
  background-image: url('/images/champion-card-bg.png');
  background-size: cover;
  background-position: center top;
  pointer-events: none;
}

.champion-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.champion-card__header-icon { font-size: 18px; line-height: 1; }
.champion-card__header-title { font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; letter-spacing: 1.5px; color: #9CA3AF; }

.champion-card__body { display: flex; flex-direction: column; align-items: center; gap: 22px; flex: 1; justify-content: center; margin-right: 60px; }
.champion-card__flag-wrapper { display: flex; align-items: center; justify-content: center; }
.champion-card__flag-ring { width: 108px; height: 108px; border-radius: 50%; overflow: hidden; border: 3px solid; display: flex; align-items: center; justify-content: center; background: #F3F4F6; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); }
.champion-card__flag-img { width: 100%; height: 100%; object-fit: cover; }

.champion-card__prediction { text-align: center; }
.champion-card__prediction-main { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 6px; line-height: 1.3; }
.champion-card__team-name { color: #2563EB; }
.champion-card__prediction-sub { font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 500; color: #9CA3AF; letter-spacing: 0.5px; margin: 0; }

.champion-card__meta { display: flex; align-items: center; gap: 16px; padding: 12px 18px; background: #F8FAFC; border-radius: 14px; border: 1px solid #E2E8F0; }
.champion-card__meta-item { display: flex; align-items: center; gap: 8px; }
.champion-card__meta-icon { width: 18px; height: 18px; color: #94A3B8; flex-shrink: 0; }
.champion-card__meta-info { display: flex; flex-direction: column; gap: 2px; }
.champion-card__meta-label { font-size: 11px; color: #94A3B8; font-weight: 500; line-height: 1; }
.champion-card__meta-value { font-size: 14px; font-weight: 700; color: #1E293B; line-height: 1; }
.champion-card__meta-value--highlight { color: #2563EB; }
.champion-card__meta-divider { width: 1px; height: 30px; background: #E2E8F0; }

.champion-card__footer { display: flex; flex-direction: column; align-items: center; gap: 4px; margin: 0 -24px; padding: 12px 24px; background: #1E3A8A; }
.champion-card__brand { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: rgba(255, 255, 255, 0.85); letter-spacing: 2px; }
.champion-card__brand-cta { font-size: 11px; color: rgba(255, 255, 255, 0.55); font-weight: 400; letter-spacing: 0.3px; }

/* ==================== 2. Graffiti Style ==================== */
.champion-card__premium-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 0;
}
.premium-overlay-bottom {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%);
  pointer-events: none;
  z-index: 0;
}

.graffiti-header { display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.graffiti-title { color: #FFFFFF; background: #111827; padding: 6px 16px; border-radius: 4px; transform: skew(-8deg); font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 900; letter-spacing: 1px; box-shadow: 4px 4px 0px rgba(0,0,0,0.15); }

.graffiti-body { display: flex; flex-direction: column; align-items: center; gap: 20px; flex: 1; justify-content: center; }

.graffiti-flag-container { position: relative; width: 180px; height: 160px; display: flex; align-items: center; justify-content: center; }
.graffiti-flag-ring { position: relative; z-index: 1; width: 100px; height: 100px; border-radius: 50%; overflow: hidden; border: 4px solid #111827; box-shadow: 4px 4px 0px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; background: #F8FAFC; margin-top: 20px; }
.graffiti-flag-img { width: 100%; height: 100%; object-fit: cover; }

.graffiti-prediction { text-align: center; background: #FFFFFF; border: 4px solid #111827; box-shadow: 6px 6px 0px rgba(17, 24, 39, 1); display: flex; flex-direction: column; overflow: hidden; transform: rotate(-2deg); margin-bottom: 10px; width: 100%; }
.graffiti-result-label { background: var(--accent-color, #EAB308); color: #111827; padding: 6px; font-size: 12px; font-weight: 900; text-transform: uppercase; text-align: center; border-bottom: 3px solid #111827; letter-spacing: 0.5px; }
.graffiti-prediction-main { font-size: 20px; font-weight: 900; color: #111827; margin: 12px 10px 4px; line-height: 1.3; }
.graffiti-team-name { color: var(--accent-color, #EAB308); text-shadow: -1px -1px 0 #111827, 1px -1px 0 #111827, -1px 1px 0 #111827, 1px 1px 0 #111827; }
.graffiti-prediction-sub { font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; color: #4B5563; letter-spacing: 0.5px; margin: 0 0 12px; }

.graffiti-info { background: #111827; color: #FFFFFF; width: calc(100% + 32px); padding: 10px 24px; transform: rotate(1deg); display: flex; gap: 12px; }
.graffiti-info-item { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
.graffiti-icon { width: 16px; height: 16px; color: var(--accent-color, #EAB308); flex-shrink: 0; margin-top: 2px; }
.graffiti-label { color: var(--accent-color, #EAB308); font-weight: 800; text-transform: uppercase; font-size: 10px; margin: 0 0 2px; }
.graffiti-value { color: #FFFFFF; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; margin: 0; line-height: 1.4; }

.graffiti-footer { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; margin: auto -24px 0; padding: 10px 24px; background: #111827; width: calc(100% + 48px); border-top: 4px solid var(--accent-color, #EAB308); }
.premium-badge { display: flex; align-items: center; gap: 6px; }
.badge-icon { font-size: 16px; }
.badge-text { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.5px; }
.domain-watermark { font-family: 'Montserrat', sans-serif; font-size: 10px; color: rgba(255, 255, 255, 0.6); font-weight: 600; letter-spacing: 0.5px; }
.domain-watermark-dark { font-family: 'Montserrat', sans-serif; font-size: 10px; color: rgba(31, 41, 55, 0.4); font-weight: 600; letter-spacing: 0.5px; }

/* ==================== 3. Minimalist Style ==================== */
.premium-overlay-light { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 100%); pointer-events: none; z-index: 0; }
.minimalist-header { display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.minimalist-title { background: rgba(255, 255, 255, 0.85); padding: 8px 20px; border-radius: 24px; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 1px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,1); }
.minimalist-body { display: flex; flex-direction: column; align-items: center; gap: 20px; flex: 1; justify-content: center; }
.minimalist-flag-wrapper { width: 100px; height: 100px; border-radius: 50%; overflow: hidden; border: 4px solid #FFFFFF; box-shadow: 0 12px 24px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; background: #FFFFFF; }
.minimalist-flag-img { width: 100%; height: 100%; object-fit: cover; }
.minimalist-prediction { background: rgba(255, 255, 255, 0.9); border-radius: 20px; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08); display: flex; flex-direction: column; overflow: hidden; width: 100%; margin-bottom: 10px; backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,1); padding: 6px; }
.minimalist-result-label { color: #FFFFFF; padding: 6px 12px; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; border-radius: 14px; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; }
.minimalist-prediction-main { color: #1F2937; font-size: 20px; font-weight: 800; padding: 12px 8px 4px; text-align: center; line-height: 1.3; margin: 0; }
.minimalist-team-name { font-weight: 900; }
.minimalist-prediction-sub { font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700; color: #6B7280; letter-spacing: 0.5px; text-align: center; margin: 0 0 12px; }
.minimalist-info { background: rgba(255, 255, 255, 0.85); color: #4B5563; width: 100%; padding: 12px 20px; border-radius: 16px; display: flex; gap: 12px; backdrop-filter: blur(12px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05); border: 1px solid rgba(255,255,255,1); }
.minimalist-info-item { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
.minimalist-icon { width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; }
.minimalist-label { color: #9CA3AF; font-weight: 600; font-size: 10px; margin: 0 0 2px; text-transform: uppercase; }
.minimalist-value { color: #1F2937; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; margin: 0; line-height: 1.4; }
.minimalist-footer { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; margin: auto -24px 0; padding: 14px 24px; background: #FFFFFF; width: calc(100% + 48px); border-top: 1px solid rgba(0, 0, 0, 0.05); }

/* ==================== 4. Glasswind Style ==================== */
.glass-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%); pointer-events: none; z-index: 0; }
.glasswind-header { display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.glass-pill { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 30px; padding: 8px 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
.glasswind-title { color: #FFFFFF; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.glasswind-body { display: flex; flex-direction: column; align-items: center; gap: 16px; flex: 1; justify-content: center; }
.glass-panel { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
.glasswind-flag-wrapper { width: 100px; height: 100px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 4px; }
.glasswind-flag-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.glasswind-team-name-badge { color: #FFFFFF; font-size: 14px; font-family: 'Montserrat', sans-serif; font-weight: 800; padding: 6px 20px; border-radius: 20px; text-shadow: 0 1px 2px rgba(0,0,0,0.2); margin-top: -8px; margin-bottom: 8px; }
.glasswind-prediction { border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; width: 100%; padding: 2px; }
.glasswind-prediction.highlight { background: rgba(255, 255, 255, 0.25); border: 1px solid rgba(255, 255, 255, 0.5); }
.glasswind-result-label { color: #FFFFFF; padding: 8px 12px; font-size: 12px; font-weight: 800; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 16px 16px 0 0; }
.glasswind-prediction-main { color: #FFFFFF; font-size: 20px; font-weight: 800; padding: 16px 12px; text-align: center; line-height: 1.3; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.glasswind-team-name { font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
.glasswind-info { color: #FFFFFF; width: 100%; padding: 12px 20px; border-radius: 16px; display: flex; gap: 12px; }
.glasswind-info-item { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
.glasswind-icon { width: 16px; height: 16px; color: #FFFFFF; flex-shrink: 0; margin-top: 2px; opacity: 0.9; }
.glasswind-label { color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 10px; margin: 0 0 2px; text-transform: uppercase; }
.glasswind-value { color: #FFFFFF; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; margin: 0; line-height: 1.4; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
.glasswind-footer { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; margin: auto -24px 0; padding: 14px 24px; width: calc(100% + 48px); }
.glass-panel-flat { background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-top: 1px solid rgba(255, 255, 255, 0.2); }

/* ==================== 5. Classic Style ==================== */
.layout-classic .champion-card__premium-bg { background-position: center center; }
.premium-overlay-classic { display: none; }
.classic-header { display: flex; align-items: center; justify-content: center; margin-bottom: 24px; gap: 12px; transform: translateX(-22px); width: calc(100% - 44px); margin-left: 22px; }
.classic-deco-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(0,0,0,0.15), transparent); }
.classic-title { color: #374151; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 3px; }
.classic-body { display: flex; flex-direction: column; align-items: center; gap: 24px; flex: 1; justify-content: center; transform: translateX(-22px); }
.classic-flag-wrapper { width: 110px; height: 110px; border-radius: 50%; overflow: hidden; border: 4px solid #FFFFFF; box-shadow: 0 8px 24px rgba(0,0,0,0.12); display: flex; align-items: center; justify-content: center; padding: 0; background: #FFFFFF; }
.classic-flag-img { width: 100%; height: 100%; object-fit: cover; }
.classic-prediction { text-align: center; width: 100%; margin-bottom: 10px; }
.classic-result-label { color: #6B7280; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
.classic-prediction-main { color: #111827; font-size: 24px; font-weight: 800; margin: 0 0 8px; line-height: 1.4; text-shadow: 0 2px 8px rgba(255,255,255,0.8); }
.classic-team-name { font-weight: 900; font-family: 'Montserrat', sans-serif; }
.classic-prediction-sub { font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700; color: #6B7280; letter-spacing: 1px; text-transform: uppercase; margin: 0; }
.classic-info { display: flex; align-items: center; justify-content: center; gap: 20px; padding: 16px 0; border-top: 1px solid rgba(0,0,0,0.1); border-bottom: 1px solid rgba(0,0,0,0.1); width: 80%; }
.classic-info-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.classic-divider { color: rgba(0,0,0,0.15); font-size: 20px; font-weight: 300; }
.classic-label { color: #4B5563; font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 800; letter-spacing: 2px; }
.classic-value { color: #111827; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; letter-spacing: 1px; text-shadow: none; }
.classic-footer { margin: auto -24px 0; padding: 16px 24px; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); width: calc(100% + 48px); }
.classic-footer-content { display: flex; justify-content: space-between; align-items: center; }
.classic-badge-text { font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.9); letter-spacing: 1px; }
.classic-domain { font-family: 'Montserrat', sans-serif; font-size: 10px; color: rgba(255,255,255,0.6); font-weight: 500; letter-spacing: 1px; }

/* 响应式 */
@media (max-width: 640px) {
  .champion-card { width: 320px; height: 568px; }
  .champion-card__content { padding: 24px 20px 0; }
  .champion-card__prediction-main { font-size: 20px; }
  .champion-card__flag-ring { width: 96px; height: 96px; }
  .champion-card__meta { padding: 10px 14px; gap: 12px; }
  .champion-card__footer { margin: 0 -20px; }
}

/* ==================== 6. 毒奶版样式 (Jinx) - 强视觉冲击/梗图风格 ==================== */
.layout-jinx { position: relative; height: 100%; display: flex; flex-direction: column; background-color: #090212; overflow: hidden; font-family: 'Montserrat', sans-serif; }
.layout-jinx .jinx-bg { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, #2a0845 0%, #090212 80%), repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(57, 255, 20, 0.05) 10px, rgba(57, 255, 20, 0.05) 20px); z-index: 0; }
.layout-jinx .jinx-overlay { position: absolute; inset: 0; background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>'); opacity: 0.15; mix-blend-mode: overlay; pointer-events: none; z-index: 1; }

/* 狂暴印章效果 */
.layout-jinx .jinx-stamp { position: absolute; right: 0px; top: 140px; z-index: 10; transform: rotate(-25deg) scale(1.1); opacity: 0.95; pointer-events: none; }
.layout-jinx .stamp-inner { width: 130px; height: 130px; border: 6px double #ff007c; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; box-shadow: 0 0 30px rgba(255, 0, 124, 0.6), inset 0 0 20px rgba(255, 0, 124, 0.5); background: rgba(255, 0, 124, 0.1); backdrop-filter: blur(2px); }
.layout-jinx .stamp-inner::after { content: ''; position: absolute; inset: 6px; border: 3px dashed #ff007c; border-radius: 50%; }
.layout-jinx .stamp-text { color: #ff007c; font-weight: 900; font-size: 28px; line-height: 1.1; text-align: center; font-family: 'Montserrat', 'PingFang SC', sans-serif; text-shadow: 2px 2px 0px #000, 0 0 10px rgba(255, 0, 124, 0.8); letter-spacing: 2px; }

.jinx-header { display: flex; align-items: center; justify-content: center; margin-bottom: 24px; position: relative; z-index: 2; margin-top: 10px; }
.jinx-title { color: #000; background: #39ff14; padding: 4px 16px; font-size: 18px; font-weight: 900; letter-spacing: 4px; box-shadow: 4px 4px 0 #ff007c; transform: skewX(-10deg); }

.jinx-body { display: flex; flex-direction: column; align-items: center; gap: 16px; flex: 1; justify-content: center; position: relative; z-index: 2; }
.jinx-flag-wrapper { width: 120px; height: 120px; border-radius: 12px; overflow: hidden; border: 4px solid #39ff14; box-shadow: -6px 6px 0 #ff007c; display: flex; align-items: center; justify-content: center; background: #000; filter: contrast(1.5) saturate(1.5) hue-rotate(-20deg); transform: rotate(3deg); }
.jinx-flag-img { width: 100%; height: 100%; object-fit: cover; }
.jinx-team-name-badge { color: #fff; font-size: 18px; font-weight: 900; text-align: center; margin-top: 4px; text-shadow: 2px 2px 0 #ff007c; background: #000; padding: 4px 12px; border-radius: 4px; border: 1px solid #39ff14; margin-bottom: 8px; transform: rotate(-2deg); }

/* 垃圾话/预测文案：究极 Meme 字体（大白字 + 黑粗描边） */
.jinx-prediction { background: transparent; border: none; border-radius: 0; margin: 0 0 16px; box-shadow: none; width: 100%; transform: none; }
.jinx-prediction-main { font-family: 'Impact', 'Arial Black', 'PingFang SC', sans-serif; font-weight: 900; font-size: 24px; text-align: center; color: #fff; margin: 0 16px 12px; line-height: 1.2; position: relative; z-index: 2; -webkit-text-stroke: 1.5px #000; text-shadow: 3px 3px 0px #000, 0 0 15px #ff003c; transform: rotate(-2deg); text-transform: uppercase; display: flex; align-items: center; justify-content: center; min-height: 80px; }

.jinx-info { background: #000; border: 2px dashed #ff007c; color: #fff; width: 100%; padding: 12px 16px; border-radius: 0; display: flex; gap: 12px; position: relative; z-index: 2; transform: rotate(-1deg); margin-bottom: 24px; }
.jinx-info-item { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
.jinx-icon { width: 16px; height: 16px; color: #39ff14; flex-shrink: 0; margin-top: 2px; }
.jinx-label { color: #ff007c; font-weight: 800; font-size: 10px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px; }
.jinx-value { color: #fff; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; margin: 0; line-height: 1.4; }

.jinx-footer { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; margin: auto -24px 0; padding: 16px 24px; background: #000; width: calc(100% + 48px); border-top: 4px solid #39ff14; position: relative; z-index: 2; }
.layout-jinx .premium-badge { display: flex; align-items: center; gap: 8px; }
.layout-jinx .badge-icon { font-size: 18px; filter: drop-shadow(0 0 5px #ff007c); }
.layout-jinx .badge-text { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 900; color: #39ff14; letter-spacing: 2px; text-transform: uppercase; }
.layout-jinx .domain-watermark { font-family: 'Montserrat', sans-serif; font-size: 10px; color: #ff007c; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
</style>
