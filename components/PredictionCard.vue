<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  homeTeam: { nameZh: string; nameEn: string; code: string; flag: string }
  awayTeam: { nameZh: string; nameEn: string; code: string; flag: string }
  group: string | null
  matchDate: string
  matchTime: string
  venue: string
  city: string
  predictedResult: 'HOME_WIN' | 'AWAY_WIN' | 'DRAW'
  predictedScore?: { home: number; away: number }
  locale: string
  // Premium 模式属性
  premiumBgImage?: string
  theme?: 'graffiti' | 'minimalist' | 'glasswind' | 'classic'
  // 毒奶模式
  isJinxMode?: boolean
}>()

const { t, tm, rt } = useI18n()

// 提取 isPremium 供内部快捷使用
const isPremium = computed(() => !!props.premiumBgImage)
const currentTheme = computed(() => props.isJinxMode ? 'jinx' : (props.theme || 'graffiti'))

// 根据 locale 获取队名
function getTeamName(team: { nameZh: string; nameEn: string }) {
  return props.locale === 'zh' ? team.nameZh : team.nameEn
}

// 预测文案
const predictionText = computed(() => {
  const homeName = getTeamName(props.homeTeam)
  const awayName = getTeamName(props.awayTeam)

  if (props.predictedScore) {
    const { home, away } = props.predictedScore
    return props.locale === 'zh'
      ? `我预测：${homeName} ${home}:${away} ${awayName}`
      : `My Pick: ${homeName} ${home}:${away} ${awayName}`
  }

  if (props.predictedResult === 'HOME_WIN') {
    return props.locale === 'zh'
      ? `我预测：${homeName} 获胜`
      : `My Pick: ${homeName} Win`
  }
  if (props.predictedResult === 'AWAY_WIN') {
    return props.locale === 'zh'
      ? `我预测：${awayName} 获胜`
      : `My Pick: ${awayName} Win`
  }
  return props.locale === 'zh' ? '我预测：平局' : 'My Pick: Draw'
})

// ─── 随机主题色系统 ───
const themeColors = {
  graffiti: ['#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#14B8A6'], // 荧光色系
  minimalist: ['#60A5FA', '#34D399', '#FBBF24', '#F472B6', '#A78BFA', '#fb7185', '#38bdf8'], // 马卡龙色系
  glasswind: ['#A78BFA', '#F472B6', '#38bdf8', '#34D399', '#FBBF24'] // 偏光/极光色系
}

const randomAccentColor = computed(() => {
  const colors = themeColors[currentTheme.value as keyof typeof themeColors] || themeColors.graffiti
  // 使用简单的哈希保证同一张图和对阵分配固定的颜色，避免闪烁
  const seedStr = (props.premiumBgImage || '') + props.homeTeam.code + props.awayTeam.code
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

// 模拟一个简单的多语言 Trash Talk 库
const trashTalks = {
  zh: {
    big_win: ["绝对的大师级表演！", "毫无怜悯的全面压制。", "完美无瑕的胜利。多么精彩的表演！"],
    narrow_win: ["悬念留到了最后一秒！真是惊心动魄。", "战术大师之作。一场艰难的胜利。", "关键时刻展现大心脏。"],
    high_draw: ["绝对的进球盛宴！今天足球是赢家。", "美丽的混乱。多么具有娱乐性的平局。", "两队都不该输掉这场经典对决。"],
    low_draw: ["球场上的国际象棋博弈。", "今天防守端表现出色。", "难分伯仲的两位勇士。"],
    default: ["我预感就是这样！", "记住我的话。", "数据不会说谎。", "一个大胆的预测，但很真实。"]
  },
  en: {
    big_win: ["An absolute masterclass!", "No mercy. Total domination.", "Flawless victory. What a performance!"],
    narrow_win: ["Down to the wire! What a thriller.", "A tactical masterpiece. Hard-fought win.", "Ice in their veins when it mattered most."],
    high_draw: ["An absolute goalfest! Football wins today.", "A beautiful mess. What an entertaining draw.", "Neither team deserved to lose this classic."],
    low_draw: ["A chess match on the pitch.", "Defenses stood tall today.", "Nothing to separate these two warriors."],
    default: ["I'm calling it now!", "Mark my words.", "The data doesn't lie.", "A bold prediction, but a true one."]
  },
  es: {
    big_win: ["¡Una clase magistral absoluta!", "Sin piedad. Dominación total.", "Victoria impecable. ¡Qué actuación!"],
    narrow_win: ["¡Hasta el último segundo! Qué emoción.", "Una obra maestra táctica. Victoria reñida.", "Sangre fría en el momento decisivo."],
    high_draw: ["¡Un festín de goles absoluto! Hoy gana el fútbol.", "Un hermoso caos. Qué empate tan entretenido.", "Ningún equipo merecía perder este clásico."],
    low_draw: ["Una partida de ajedrez en la cancha.", "Las defensas se mantuvieron firmes hoy.", "Nada que separe a estos dos guerreros."],
    default: ["¡Lo digo ahora!", "Recuerda mis palabras.", "Los datos no mienten.", "Una predicción audaz, pero verdadera."]
  }
}

// 动态 Trash Talk 标语
const trashTalk = computed(() => {
  if (props.isJinxMode) {
    // 强制使用 i18n 里的毒奶文案
    try {
      const texts = tm('share.predictionTexts.jinxMatch') as string[]
      if (Array.isArray(texts) && texts.length > 0) {
        const winnerName = props.predictedResult === 'AWAY_WIN' ? getTeamName(props.awayTeam) : getTeamName(props.homeTeam)
        const idx = props.homeTeam.nameEn.length + props.awayTeam.nameEn.length
        // rt() 用于解析 tm() 返回的数组元素
        const text = typeof texts[0] === 'string' ? texts[idx % texts.length] : rt(texts[idx % texts.length])
        return text.replace('{team}', winnerName)
      }
    } catch (e) {
      // fallback
    }
  }

  if (!isPremium.value) return ''
  
  const currentLang = props.locale as keyof typeof trashTalks
  const talkLibrary = trashTalks[currentLang] || trashTalks['en']
  
  if (props.predictedScore) {
    const score1 = props.predictedScore.home
    const score2 = props.predictedScore.away
    const diff = Math.abs(score1 - score2)
    const total = score1 + score2
    
    let category: keyof typeof talkLibrary = 'low_draw'
    if (diff >= 3) {
      category = 'big_win'
    } else if (diff === 1 || diff === 2) {
      category = 'narrow_win'
    } else if (diff === 0 && total >= 4) {
      category = 'high_draw'
    } else if (diff === 0) {
      category = 'low_draw'
    }
    
    const talks = talkLibrary[category]
    const seed = (score1 * 10 + score2 + props.homeTeam.nameEn.charCodeAt(0)) % talks.length
    return talks[seed]
  }

  const defaultPhrases = talkLibrary.default
  const idx = props.homeTeam.nameEn.length + props.awayTeam.nameEn.length
  return defaultPhrases[idx % defaultPhrases.length]
})

const matchInfoLine = computed(() => {
  const groupText = props.group
    ? (props.locale === 'zh' ? `${props.group}组` : `Group ${props.group}`)
    : ''
  return `${groupText} · ${props.matchDate} ${props.matchTime}`
})

function getFlagUrl(code: string) {
  return `https://flagcdn.com/w160/${code.toLowerCase()}.png`
}
</script>

<template>
  <div 
    class="prediction-card" 
    :style="premiumStyleVars"
  >
    <!-- 为了防止 html2canvas 截图出现透明背景或圆角黑边，在这里垫一层白色实色背景 -->
    <div style="position: absolute; inset: 0; background: #FFFFFF; z-index: -1;"></div>

    <!-- ==================== 1. 基础版 (Basic) ==================== -->
    <template v-if="!isPremium">
      <div class="layout-basic">
        <!-- 基础版纯 CSS 渐变背景 -->
        <div class="basic-bg" aria-hidden="true"></div>
        
        <div class="content-wrapper">
          <header class="header">
            <span class="deco">◆</span>
            <span class="title">⚽ {{ $t('prediction.myPrediction') || 'MY PREDICTION' }}</span>
            <span class="deco">◆</span>
          </header>

          <section class="teams">
            <div class="team">
              <div class="flag-wrapper"><img :src="getFlagUrl(homeTeam.code)" class="flag" crossorigin="anonymous"></div>
              <span class="team-name">{{ getTeamName(homeTeam) }}</span>
              <span class="team-name-en">{{ homeTeam.nameEn }}</span>
            </div>
            <div class="vs">VS</div>
            <div class="team">
              <div class="flag-wrapper"><img :src="getFlagUrl(awayTeam.code)" class="flag" crossorigin="anonymous"></div>
              <span class="team-name">{{ getTeamName(awayTeam) }}</span>
              <span class="team-name-en">{{ awayTeam.nameEn }}</span>
            </div>
          </section>

          <section class="result">
            <span class="result-label">{{ $t('prediction.myPrediction') }}</span>
            <p class="result-text">{{ predictionText.replace(/^我预测：/, '') }}</p>
          </section>

          <section class="info">
            <div class="info-item">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <p class="label">{{ $t('match.time') }}</p>
                <p class="value">{{ matchInfoLine }}</p>
              </div>
            </div>
            <div class="info-item">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div>
                <p class="label">{{ $t('match.venue') }}</p>
                <p class="value">{{ venue }} · {{ city }}</p>
              </div>
            </div>
          </section>

          <footer class="footer">
            <span class="footer-deco">◆ WorldCupDex ◆</span>
            <span class="footer-cta">你也来预测 → worldcupdex.org</span>
          </footer>
        </div>
      </div>
    </template>

    <!-- ==================== 2. 高级涂鸦版 (Graffiti) ==================== -->
    <template v-else-if="currentTheme === 'graffiti'">
      <div class="layout-graffiti">
        <div class="premium-bg" :style="`background-image: url(${premiumBgImage}) !important;`" aria-hidden="true"></div>
        <div class="premium-overlay-bottom"></div>

        <div class="content-wrapper">
          <header class="header">
            <span class="title">⭐ PREMIUM PREDICTION</span>
          </header>

          <section class="teams">
            <div class="team">
              <div class="flag-wrapper"><img :src="getFlagUrl(homeTeam.code)" class="flag" crossorigin="anonymous"></div>
              <span class="team-name">{{ getTeamName(homeTeam) }}</span>
              <span class="team-name-en">{{ homeTeam.nameEn }}</span>
            </div>
            <div class="vs">VS</div>
            <div class="team">
              <div class="flag-wrapper"><img :src="getFlagUrl(awayTeam.code)" class="flag" crossorigin="anonymous"></div>
              <span class="team-name">{{ getTeamName(awayTeam) }}</span>
              <span class="team-name-en">{{ awayTeam.nameEn }}</span>
            </div>
          </section>

          <section class="result">
            <span class="result-label">👑 {{ $t('prediction.exclusivePrediction') }}</span>
            <p class="result-text">{{ predictionText.replace(/^我预测：/, '') }}</p>
          </section>

          <section class="trash-talk">
            <span class="quote left">"</span>
            {{ trashTalk }}
            <span class="quote right">"</span>
          </section>

          <section class="info">
            <div class="info-item">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <p class="label">{{ $t('match.time') }}</p>
                <p class="value">{{ matchInfoLine }}</p>
              </div>
            </div>
            <div class="info-item">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div>
                <p class="label">{{ $t('match.venue') }}</p>
                <p class="value">{{ venue }} · {{ city }}</p>
              </div>
            </div>
          </section>

          <footer class="footer">
            <div class="premium-badge">
              <span class="badge-icon">⭐</span>
              <span class="badge-text">WorldCupDex Premium Predictor</span>
            </div>
            <div class="domain-watermark">worldcupdex.org</div>
          </footer>
        </div>
      </div>
    </template>

    <!-- ==================== 3. 高级清新版 (Minimalist) ==================== -->
    <template v-else-if="currentTheme === 'minimalist'">
      <div class="layout-minimalist">
        <div class="premium-bg" :style="`background-image: url(${premiumBgImage}) !important;`" aria-hidden="true"></div>
        <div class="premium-overlay-light"></div>

        <div class="content-wrapper">
          <header class="header">
            <span class="title">✨ PREMIUM PREDICTION</span>
          </header>

          <section class="teams">
            <div class="team">
              <div class="flag-wrapper"><img :src="getFlagUrl(homeTeam.code)" class="flag" crossorigin="anonymous"></div>
              <span class="team-name">{{ getTeamName(homeTeam) }}</span>
            </div>
            <div class="vs">VS</div>
            <div class="team">
              <div class="flag-wrapper"><img :src="getFlagUrl(awayTeam.code)" class="flag" crossorigin="anonymous"></div>
              <span class="team-name">{{ getTeamName(awayTeam) }}</span>
            </div>
          </section>

          <section class="result">
            <span class="result-label">👑 {{ $t('prediction.exclusivePrediction') }}</span>
            <p class="result-text">{{ predictionText.replace(/^我预测：/, '') }}</p>
          </section>

          <section class="trash-talk">
            {{ trashTalk }}
          </section>

          <section class="info">
            <div class="info-item">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <p class="label">{{ $t('match.time') }}</p>
                <p class="value">{{ matchInfoLine }}</p>
              </div>
            </div>
            <div class="info-item">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div>
                <p class="label">{{ $t('match.venue') }}</p>
                <p class="value">{{ venue }} · {{ city }}</p>
              </div>
            </div>
          </section>

          <footer class="footer">
            <div class="premium-badge">
              <span class="badge-icon">✨</span>
              <span class="badge-text">WorldCupDex Premium Predictor</span>
            </div>
            <div class="domain-watermark">worldcupdex.org</div>
          </footer>
        </div>
      </div>
    </template>
    <!-- ==================== 4. 高级磨砂玻璃版 (Glasswind) ==================== -->
    <template v-else-if="currentTheme === 'glasswind'">
      <div class="layout-glasswind">
        <div class="premium-bg" :style="`background-image: url(${premiumBgImage}) !important;`" aria-hidden="true"></div>
        <!-- 玻璃遮罩 -->
        <div class="glass-overlay"></div>

        <div class="content-wrapper">
          <header class="header">
            <div class="glass-pill">
              <span class="title">🔮 PREMIUM PREDICTION</span>
            </div>
          </header>

          <section class="teams">
            <div class="team">
              <div class="flag-wrapper glass-panel"><img :src="getFlagUrl(homeTeam.code)" class="flag" crossorigin="anonymous"></div>
              <span class="team-name glass-panel">{{ getTeamName(homeTeam) }}</span>
            </div>
            <div class="vs">
              <div class="glass-circle">VS</div>
            </div>
            <div class="team">
              <div class="flag-wrapper glass-panel"><img :src="getFlagUrl(awayTeam.code)" class="flag" crossorigin="anonymous"></div>
              <span class="team-name glass-panel">{{ getTeamName(awayTeam) }}</span>
            </div>
          </section>

          <section class="result glass-panel highlight">
            <div class="glass-ribbon">👑 {{ $t('prediction.exclusivePrediction') }}</div>
            <p class="result-text">{{ predictionText.replace(/^我预测：/, '') }}</p>
          </section>

          <section class="trash-talk glass-panel">
            {{ trashTalk }}
          </section>

          <section class="info glass-panel">
            <div class="info-item">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <p class="label">{{ $t('match.time') }}</p>
                <p class="value">{{ matchInfoLine }}</p>
              </div>
            </div>
            <div class="info-item">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div>
                <p class="label">{{ $t('match.venue') }}</p>
                <p class="value">{{ venue }} · {{ city }}</p>
              </div>
            </div>
          </section>

          <footer class="footer glass-panel-flat">
            <div class="premium-badge">
              <span class="badge-icon">🔮</span>
              <span class="badge-text">WorldCupDex Premium Predictor</span>
            </div>
            <div class="domain-watermark">worldcupdex.org</div>
          </footer>
        </div>
      </div>
    </template>
    
    <!-- ==================== 5. 经典复古版 (Classic) ==================== -->
    <template v-else-if="currentTheme === 'classic'">
      <div class="layout-classic">
        <!-- 动态背景图 -->
        <div 
          class="premium-bg" 
          :style="`background-image: url(${premiumBgImage}) !important;`"
          aria-hidden="true" 
        ></div>

        <div class="content-wrapper">
          <!-- Header -->
          <header class="classic-header">
            <Icon name="mdi:soccer" class="classic-header-icon" />
            <span class="classic-title">{{ $t('prediction.myPrediction') || 'MY PREDICTION' }}</span>
          </header>

          <!-- 主体内容 -->
          <div class="classic-body">
            <section class="teams classic-teams">
              <div class="team">
                <div class="classic-flag-wrapper"><img :src="getFlagUrl(homeTeam.code)" class="flag" crossorigin="anonymous"></div>
                <span class="classic-team-name">{{ getTeamName(homeTeam) }}</span>
                <span class="classic-team-name-en">{{ homeTeam.nameEn }}</span>
              </div>
              <div class="vs classic-vs">VS</div>
              <div class="team">
                <div class="classic-flag-wrapper"><img :src="getFlagUrl(awayTeam.code)" class="flag" crossorigin="anonymous"></div>
                <span class="classic-team-name">{{ getTeamName(awayTeam) }}</span>
                <span class="classic-team-name-en">{{ awayTeam.nameEn }}</span>
              </div>
            </section>

            <!-- 预测结果框 (带蓝色背景) -->
            <div class="classic-prediction-box">
              <span class="classic-prediction-badge">{{ t('prediction.myPrediction') || 'MY PREDICTION' }}</span>
              <p class="classic-prediction-text">{{ predictionText.replace(/^我预测：/, '') }}</p>
            </div>

            <p class="classic-trash-talk">{{ trashTalk }}</p>

            <!-- 时间与场馆信息 -->
            <div class="classic-info-box">
              <div class="classic-info-item">
                <svg class="icon classic-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <div class="classic-info-text">
                  <span class="classic-info-label">{{ $t('match.time') }}</span>
                  <span class="classic-info-value">{{ matchInfoLine }}</span>
                </div>
              </div>
              <div class="classic-info-item">
                <svg class="icon classic-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <div class="classic-info-text">
                  <span class="classic-info-label">{{ $t('match.venue') }}</span>
                  <span class="classic-info-value">{{ city }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <footer class="classic-footer">
            <div class="classic-footer-brand">
              <Icon name="mdi:rhombus-medium" size="10" />
              <span>WorldCupDex</span>
              <Icon name="mdi:rhombus-medium" size="10" />
            </div>
            <div class="classic-footer-domain">你也来预测 ➔ worldcupdex.org</div>
          </footer>
        </div>
      </div>
    </template>

    <!-- ==================== 6. 毒奶模式版 (Jinx) ==================== -->
    <template v-else-if="currentTheme === 'jinx'">
      <div class="layout-jinx">
        <div class="jinx-bg" aria-hidden="true"></div>
        <div class="jinx-overlay"></div>
        
        <!-- CSS 毒奶认证印章 -->
        <div class="jinx-stamp">
          <div class="stamp-inner">
            <span class="stamp-text" v-if="locale === 'zh'">毒奶<br/>认证</span>
            <span class="stamp-text" v-else-if="locale === 'es'">JINX<br/>CERT</span>
            <span class="stamp-text" v-else>JINX<br/>CERT</span>
          </div>
        </div>

        <div class="content-wrapper">
          <header class="header">
            <span class="title">🔮 JINX PREDICTION</span>
          </header>

          <section class="teams">
            <div class="team">
              <div class="flag-wrapper"><img :src="getFlagUrl(homeTeam.code)" class="flag" crossorigin="anonymous"></div>
              <span class="team-name">{{ getTeamName(homeTeam) }}</span>
            </div>
            <div class="vs">VS</div>
            <div class="team">
              <div class="flag-wrapper"><img :src="getFlagUrl(awayTeam.code)" class="flag" crossorigin="anonymous"></div>
              <span class="team-name">{{ getTeamName(awayTeam) }}</span>
            </div>
          </section>

          <section class="result">
            <p class="result-text">{{ predictionText.replace(/^我预测：/, '') }}</p>
          </section>

          <section class="trash-talk">
            {{ trashTalk }}
          </section>

          <section class="info">
            <div class="info-item">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <p class="label">{{ $t('match.time') }}</p>
                <p class="value">{{ matchInfoLine }}</p>
              </div>
            </div>
            <div class="info-item">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div>
                <p class="label">{{ $t('match.venue') }}</p>
                <p class="value">{{ venue }} · {{ city }}</p>
              </div>
            </div>
          </section>

          <footer class="footer">
            <div class="premium-badge">
              <span class="badge-icon">🔮</span>
              <span class="badge-text">WorldCupDex Jinx Predictor</span>
            </div>
            <div class="domain-watermark">worldcupdex.org</div>
          </footer>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.prediction-card {
  position: relative;
  width: 360px;
  height: 640px;
  border-radius: 20px;
  overflow: hidden;
  background: #FFFFFF;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  color: #1F2937;
  box-shadow: 0 12px 48px rgba(0, 15, 73, 0.10), 0 4px 12px rgba(0, 15, 73, 0.06);
  max-width: 100%;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  padding: 24px 24px 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}

/* 共有图片类 */
.premium-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 0;
}
.flag {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.layout-basic, .layout-graffiti, .layout-minimalist, .layout-glasswind, .layout-classic {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ==================== 1. 基础版样式 (Basic) ==================== */
.layout-basic .basic-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  z-index: 0;
}
.layout-basic .header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 24px;
}
.layout-basic .deco { font-size: 8px; color: #93C5FD; }
.layout-basic .title { font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 800; letter-spacing: 2px; color: #1E3A8A; }
.layout-basic .teams { display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 24px; }
.layout-basic .team { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
.layout-basic .flag-wrapper { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); display: flex; align-items: center; justify-content: center; background: #F8FAFC; }
.layout-basic .team-name { font-size: 18px; font-weight: 800; color: #111827; text-align: center; margin-top: 4px; }
.layout-basic .team-name-en { font-size: 12px; color: #6B7280; text-align: center; font-family: 'Montserrat', sans-serif; margin-top: 2px; }
.layout-basic .vs { font-family: 'Montserrat', sans-serif; font-size: 26px; font-weight: 900; color: #3B82F6; flex-shrink: 0; margin-top: -30px; }
.layout-basic .result { background: #2563EB; border-radius: 14px; padding: 14px 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
.layout-basic .result-label { font-size: 12px; font-weight: 700; color: rgba(255, 255, 255, 0.9); white-space: nowrap; background: rgba(255, 255, 255, 0.2); padding: 4px 10px; border-radius: 8px; flex-shrink: 0; }
.layout-basic .result-text { font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0; text-align: center; flex: 1; }
.layout-basic .info { display: flex; gap: 12px; margin-bottom: 20px; padding: 12px 16px; background: rgba(248, 250, 252, 0.85); border-radius: 12px; border: 1px solid #E2E8F0; }
.layout-basic .info-item { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
.layout-basic .icon { width: 16px; height: 16px; color: #3B82F6; flex-shrink: 0; margin-top: 2px; }
.layout-basic .label { font-size: 10px; color: #9CA3AF; margin: 0 0 2px; font-weight: 500; }
.layout-basic .value { font-size: 12px; font-weight: 600; color: #374151; margin: 0; line-height: 1.4; }
.layout-basic .footer { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; margin: auto -24px 0; padding: 16px 24px; background: #1E3A8A; width: calc(100% + 48px); }
.layout-basic .footer-deco { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: rgba(255, 255, 255, 0.80); letter-spacing: 1px; }
.layout-basic .footer-cta { font-size: 11px; color: rgba(255, 255, 255, 0.55); font-weight: 400; }


/* ==================== 2. 高级涂鸦版样式 (Graffiti) ==================== */
.layout-graffiti .premium-overlay-bottom { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.4) 100%); pointer-events: none; z-index: 0; }
.layout-graffiti .header { display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.layout-graffiti .title { color: #FFFFFF; background: #111827; padding: 6px 16px; border-radius: 4px; transform: skew(-8deg); font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 900; letter-spacing: 1px; box-shadow: 4px 4px 0px rgba(0,0,0,0.15); }
.layout-graffiti .teams { display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 16px; }
.layout-graffiti .team { display: flex; flex-direction: column; align-items: center; flex: 1; }
.layout-graffiti .flag-wrapper { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 4px solid #111827; box-shadow: 4px 4px 0px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; background: #F8FAFC; }
.layout-graffiti .team-name { color: #FFFFFF; background: #111827; padding: 4px 12px; border-radius: 4px; transform: skew(-8deg); margin-top: 10px; display: inline-block; box-shadow: 3px 3px 0px rgba(0,0,0,0.15); font-size: 16px; font-weight: 800; text-align: center; }
.layout-graffiti .team-name-en { color: #111827; font-weight: 800; background: rgba(255,255,255,0.9); padding: 2px 8px; border-radius: 4px; transform: skew(-8deg); margin-top: 4px; display: inline-block; font-size: 12px; font-family: 'Montserrat', sans-serif; }
.layout-graffiti .vs { color: #111827; font-size: 32px; font-family: 'Montserrat', sans-serif; font-weight: 900; flex-shrink: 0; margin-top: -30px; text-shadow: -2px -2px 0 #FFF, 2px -2px 0 #FFF, -2px 2px 0 #FFF, 2px 2px 0 #FFF, 4px 4px 0px rgba(0,0,0,0.15); }
.layout-graffiti .result { background: #FFFFFF; border: 4px solid #111827; box-shadow: 8px 8px 0px rgba(17, 24, 39, 1); display: flex; flex-direction: column; overflow: hidden; margin: 0 16px 16px; transform: rotate(-2deg); }
.layout-graffiti .result-label { background: var(--accent-color, #EC4899); color: #FFFFFF; padding: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; text-align: center; border-bottom: 4px solid #111827; letter-spacing: 0.5px; }
.layout-graffiti .result-text { color: #111827; font-size: 20px; font-weight: 900; padding: 12px 10px; text-align: center; line-height: 1.3; word-break: break-word; margin: 0; }
.layout-graffiti .trash-talk { font-family: 'Montserrat', sans-serif; font-style: italic; font-weight: 800; font-size: 15px; text-align: center; color: #111827; margin: 0 20px 16px; line-height: 1.4; background: #FFFFFF; padding: 12px 16px; border: 4px solid #111827; box-shadow: -8px 8px 0px rgba(17, 24, 39, 1); position: relative; transform: rotate(1.5deg); }
.layout-graffiti .quote { position: absolute; font-size: 60px; color: var(--accent-color, #EC4899); font-family: Georgia, serif; line-height: 1; opacity: 0.8; }
.layout-graffiti .quote.left { top: -10px; left: 12px; }
.layout-graffiti .quote.right { bottom: -30px; right: 12px; }
.layout-graffiti .info { background: #111827; color: #FFFFFF; margin: 0 -16px 16px; padding: 10px 24px; transform: rotate(-1deg); display: flex; gap: 12px; }
.layout-graffiti .info-item { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
.layout-graffiti .icon { width: 16px; height: 16px; color: var(--accent-color, #EC4899); flex-shrink: 0; margin-top: 2px; }
.layout-graffiti .label { color: var(--accent-color, #EC4899); font-weight: 800; text-transform: uppercase; font-size: 10px; margin: 0 0 2px; }
.layout-graffiti .value { color: #FFFFFF; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; margin: 0; line-height: 1.4; }
.layout-graffiti .footer { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; margin: auto -24px 0; padding: 10px 24px; background: #111827; width: calc(100% + 48px); border-top: 4px solid var(--accent-color, #EC4899); }
.layout-graffiti .premium-badge { display: flex; align-items: center; gap: 6px; }
.layout-graffiti .badge-icon { font-size: 16px; }
.layout-graffiti .badge-text { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.5px; }
.layout-graffiti .domain-watermark { font-family: 'Montserrat', sans-serif; font-size: 10px; color: rgba(255, 255, 255, 0.6); font-weight: 600; letter-spacing: 0.5px; }


/* ==================== 3. 高级清新版样式 (Minimalist) ==================== */
.layout-minimalist .premium-overlay-light { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 100%); pointer-events: none; z-index: 0; }
.layout-minimalist .header { display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.layout-minimalist .title { color: var(--accent-color, #60A5FA); background: rgba(255, 255, 255, 0.85); padding: 8px 20px; border-radius: 24px; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 1px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,1); }
.layout-minimalist .teams { display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 16px; }
.layout-minimalist .team { display: flex; flex-direction: column; align-items: center; flex: 1; }
.layout-minimalist .flag-wrapper { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 4px solid #FFFFFF; box-shadow: 0 12px 24px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; background: #FFFFFF; }
.layout-minimalist .team-name { color: #1F2937; font-size: 16px; font-weight: 800; text-align: center; margin-top: 10px; background: rgba(255, 255, 255, 0.85); padding: 6px 14px; border-radius: 16px; backdrop-filter: blur(12px); box-shadow: 0 4px 12px rgba(0,0,0,0.04); border: 1px solid rgba(255,255,255,0.8); }
.layout-minimalist .vs { color: var(--accent-color, #60A5FA); font-size: 22px; font-family: 'Montserrat', sans-serif; font-weight: 900; flex-shrink: 0; margin-top: -30px; background: #FFFFFF; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 8px 16px rgba(0,0,0,0.08); }
.layout-minimalist .result { background: rgba(255, 255, 255, 0.9); border-radius: 20px; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08); display: flex; flex-direction: column; overflow: hidden; margin: 0 12px 16px; backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,1); padding: 6px; }
.layout-minimalist .result-label { background: var(--accent-color, #60A5FA); color: #FFFFFF; padding: 6px 12px; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; border-radius: 14px; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; }
.layout-minimalist .result-text { color: #1F2937; font-size: 18px; font-weight: 800; padding: 12px 8px; text-align: center; line-height: 1.3; word-break: break-word; margin: 0; }
.layout-minimalist .trash-talk { font-family: 'Montserrat', sans-serif; font-weight: 600; font-size: 15px; text-align: center; color: #374151; margin: 0 24px 16px; line-height: 1.4; background: rgba(255, 255, 255, 0.75); padding: 12px 16px; border-radius: 20px; backdrop-filter: blur(12px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05); border: 1px solid rgba(255,255,255,0.8); }
.layout-minimalist .info { background: rgba(255, 255, 255, 0.85); color: #4B5563; margin: 0 12px 16px; padding: 10px 16px; border-radius: 16px; display: flex; gap: 12px; backdrop-filter: blur(12px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05); border: 1px solid rgba(255,255,255,1); }
.layout-minimalist .info-item { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
.layout-minimalist .icon { width: 16px; height: 16px; color: var(--accent-color, #60A5FA); flex-shrink: 0; margin-top: 2px; }
.layout-minimalist .label { color: #9CA3AF; font-weight: 600; font-size: 10px; margin: 0 0 2px; text-transform: uppercase; }
.layout-minimalist .value { color: #1F2937; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; margin: 0; line-height: 1.4; }
.layout-minimalist .footer { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; margin: auto -24px 0; padding: 14px 24px; background: #FFFFFF; width: calc(100% + 48px); border-top: 1px solid rgba(0, 0, 0, 0.05); }
.layout-minimalist .premium-badge { display: flex; align-items: center; gap: 6px; }
.layout-minimalist .badge-icon { font-size: 16px; }
.layout-minimalist .badge-text { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 800; color: var(--accent-color, #60A5FA); letter-spacing: 0.5px; }
.layout-minimalist .domain-watermark { font-family: 'Montserrat', sans-serif; font-size: 10px; color: rgba(31, 41, 55, 0.4); font-weight: 600; letter-spacing: 0.5px; }
/* ==================== 4. 高级磨砂玻璃版样式 (Glasswind) ==================== */
.layout-glasswind .glass-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%); pointer-events: none; z-index: 0; }
.layout-glasswind .header { display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.layout-glasswind .glass-pill { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 30px; padding: 8px 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
.layout-glasswind .title { color: #FFFFFF; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.layout-glasswind .teams { display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 16px; }
.layout-glasswind .team { display: flex; flex-direction: column; align-items: center; flex: 1; }
.layout-glasswind .glass-panel { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
.layout-glasswind .flag-wrapper { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 2px; }
.layout-glasswind .flag-wrapper img { border-radius: 50%; }
.layout-glasswind .team-name { color: #FFFFFF; font-size: 16px; font-weight: 800; text-align: center; margin-top: 10px; padding: 6px 14px; border-radius: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
.layout-glasswind .vs { display: flex; align-items: center; justify-content: center; margin-top: -30px; }
.layout-glasswind .glass-circle { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.4); color: #FFFFFF; font-size: 20px; font-family: 'Montserrat', sans-serif; font-weight: 900; box-shadow: 0 4px 16px rgba(0,0,0,0.1); text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.layout-glasswind .result { border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; margin: 0 12px 16px; padding: 2px; }
.layout-glasswind .result.highlight { background: rgba(255, 255, 255, 0.25); border: 1px solid rgba(255, 255, 255, 0.5); }
.layout-glasswind .glass-ribbon { background: var(--accent-color, #A78BFA); color: #FFFFFF; padding: 8px 12px; font-size: 12px; font-weight: 800; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 16px 16px 0 0; }
.layout-glasswind .result-text { color: #FFFFFF; font-size: 18px; font-weight: 800; padding: 16px 12px; text-align: center; line-height: 1.3; word-break: break-word; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.layout-glasswind .trash-talk { font-family: 'Montserrat', sans-serif; font-weight: 600; font-size: 15px; text-align: center; color: #FFFFFF; margin: 0 24px 16px; line-height: 1.4; padding: 14px 16px; border-radius: 20px; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
.layout-glasswind .info { color: #FFFFFF; margin: 0 12px 16px; padding: 12px 16px; border-radius: 16px; display: flex; gap: 12px; }
.layout-glasswind .info-item { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
.layout-glasswind .icon { width: 16px; height: 16px; color: #FFFFFF; flex-shrink: 0; margin-top: 2px; opacity: 0.9; }
.layout-glasswind .label { color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 10px; margin: 0 0 2px; text-transform: uppercase; }
.layout-glasswind .value { color: #FFFFFF; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; margin: 0; line-height: 1.4; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
.layout-glasswind .footer { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; margin: auto -24px 0; padding: 14px 24px; width: calc(100% + 48px); }
.layout-glasswind .glass-panel-flat { background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-top: 1px solid rgba(255, 255, 255, 0.2); }
.layout-glasswind .premium-badge { display: flex; align-items: center; gap: 6px; }
.layout-glasswind .badge-icon { font-size: 16px; }
.layout-glasswind .badge-text { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.5px; }
.layout-glasswind .domain-watermark { font-family: 'Montserrat', sans-serif; font-size: 10px; color: rgba(255, 255, 255, 0.5); font-weight: 600; letter-spacing: 0.5px; }

/* ==================== 5. Classic Style ==================== */
.layout-classic { position: relative; }
.layout-classic .premium-bg { background-position: center center; }
.layout-classic .classic-header { display: flex; align-items: center; justify-content: center; margin-bottom: 24px; gap: 12px; width: 100%; }
.layout-classic .classic-header-icon { width: 16px; height: 16px; color: #2563EB; }
.layout-classic .classic-title { color: #1E3A8A; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 2px; }
.layout-classic .classic-body { display: flex; flex-direction: column; align-items: center; gap: 20px; flex: 1; justify-content: flex-start; padding-top: 10px; width: 100%; }
.layout-classic .classic-teams { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 0; width: 100%; }
.layout-classic .team { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
.layout-classic .classic-flag-wrapper { width: 72px; height: 72px; border-radius: 50%; overflow: hidden; border: 3px solid #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: center; padding: 0; background: #FFFFFF; }
.layout-classic .classic-vs { color: #2563EB; font-size: 20px; font-family: 'Montserrat', sans-serif; font-weight: 900; margin-top: -30px; }
.layout-classic .classic-team-name { font-size: 15px; font-weight: 800; color: #111827; text-align: center; margin-top: 4px; }
.layout-classic .classic-team-name-en { font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 600; color: #9CA3AF; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; }

/* 蓝色预测结果框 */
.layout-classic .classic-prediction-box { background: #2563EB; border-radius: 12px; padding: 16px 20px; width: 100%; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
.layout-classic .classic-prediction-badge { background: rgba(255, 255, 255, 0.2); color: #FFFFFF; font-size: 10px; font-weight: 600; padding: 4px 8px; border-radius: 6px; white-space: nowrap; border: 1px solid rgba(255, 255, 255, 0.3); }
.layout-classic .classic-prediction-text { color: #FFFFFF; font-size: 16px; font-weight: 700; margin: 0; line-height: 1.4; flex: 1; text-align: center; }

/* 底部时间场馆信息卡片 */
.layout-classic .classic-info-box { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(8px); border-radius: 12px; padding: 12px 16px; width: 100%; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255, 255, 255, 0.8); margin-bottom: 72px; }
.layout-classic .classic-info-item { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
.layout-classic .classic-info-icon { width: 16px; height: 16px; color: #6B7280; margin-top: 2px; }
.layout-classic .classic-info-text { display: flex; flex-direction: column; gap: 2px; }
.layout-classic .classic-info-label { color: #6B7280; font-size: 10px; font-weight: 500; }
.layout-classic .classic-info-value { color: #111827; font-size: 11px; font-weight: 600; }

.layout-classic .classic-footer { margin: 0 -24px; padding: 16px 24px; background: #1E3A8A; width: calc(100% + 48px); display: flex; flex-direction: column; align-items: center; gap: 4px; position: absolute; bottom: 0; left: 0; right: 0; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
.layout-classic .classic-footer-brand { color: #FFFFFF; font-weight: 800; font-size: 14px; display: flex; align-items: center; gap: 8px; }
.layout-classic .classic-footer-domain { color: rgba(255, 255, 255, 0.7); font-size: 10px; }
.layout-classic .classic-footer-content { display: flex; justify-content: space-between; align-items: center; }
.layout-classic .classic-badge-text { font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.9); letter-spacing: 1px; }
.layout-classic .classic-domain { font-family: 'Montserrat', sans-serif; font-size: 10px; color: rgba(255,255,255,0.6); font-weight: 500; letter-spacing: 1px; }

/* ==================== 6. 毒奶版样式 (Jinx) - 强视觉冲击/梗图风格 ==================== */
.layout-jinx { position: relative; height: 100%; display: flex; flex-direction: column; background-color: #090212; overflow: hidden; font-family: 'Montserrat', sans-serif; }
.layout-jinx .jinx-bg { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, #2a0845 0%, #090212 80%), repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(57, 255, 20, 0.05) 10px, rgba(57, 255, 20, 0.05) 20px); z-index: 0; }
.layout-jinx .jinx-overlay { position: absolute; inset: 0; background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>'); opacity: 0.15; mix-blend-mode: overlay; pointer-events: none; z-index: 1; }

/* 狂暴印章效果 */
.layout-jinx .jinx-stamp { position: absolute; right: 0px; top: 140px; z-index: 10; transform: rotate(-25deg) scale(1.1); opacity: 0.95; pointer-events: none; }
.layout-jinx .stamp-inner { width: 130px; height: 130px; border: 6px double #ff007c; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; box-shadow: 0 0 30px rgba(255, 0, 124, 0.6), inset 0 0 20px rgba(255, 0, 124, 0.5); background: rgba(255, 0, 124, 0.1); backdrop-filter: blur(2px); }
.layout-jinx .stamp-inner::after { content: ''; position: absolute; inset: 6px; border: 3px dashed #ff007c; border-radius: 50%; }
.layout-jinx .stamp-text { color: #ff007c; font-weight: 900; font-size: 28px; line-height: 1.1; text-align: center; font-family: 'Montserrat', 'PingFang SC', sans-serif; text-shadow: 2px 2px 0px #000, 0 0 10px rgba(255, 0, 124, 0.8); letter-spacing: 2px; }

.layout-jinx .header { display: flex; align-items: center; justify-content: center; margin-bottom: 30px; position: relative; z-index: 2; margin-top: 10px; }
.layout-jinx .title { color: #000; background: #39ff14; padding: 4px 16px; font-size: 18px; font-weight: 900; letter-spacing: 4px; box-shadow: 4px 4px 0 #ff007c; transform: skewX(-10deg); }

.layout-jinx .teams { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 30px; position: relative; z-index: 2; }
.layout-jinx .team { display: flex; flex-direction: column; align-items: center; flex: 1; }
.layout-jinx .flag-wrapper { width: 85px; height: 85px; border-radius: 12px; overflow: hidden; border: 4px solid #39ff14; box-shadow: -4px 4px 0 #ff007c; display: flex; align-items: center; justify-content: center; background: #000; filter: contrast(1.5) saturate(1.5) hue-rotate(-20deg); transform: rotate(3deg); }
.layout-jinx .team:nth-child(3) .flag-wrapper { transform: rotate(-3deg); border-color: #ff007c; box-shadow: 4px 4px 0 #39ff14; filter: contrast(1.5) saturate(1.5) hue-rotate(20deg); }
.layout-jinx .team-name { color: #fff; font-size: 16px; font-weight: 900; text-align: center; margin-top: 16px; text-shadow: 2px 2px 0 #ff007c; background: #000; padding: 2px 8px; border-radius: 4px; border: 1px solid #39ff14; }
.layout-jinx .vs { color: #ff007c; font-size: 36px; font-family: 'Montserrat', sans-serif; font-weight: 900; flex-shrink: 0; margin-top: -30px; text-shadow: 4px 4px 0 #000, 0 0 20px #ff007c; transform: scale(1.2) rotate(-10deg); }

.layout-jinx .result { background: #000; border: 3px solid #39ff14; margin: 0 24px 20px; box-shadow: -6px 6px 0 #ff007c; position: relative; z-index: 2; transform: rotate(-2deg); border-radius: 0; }
.layout-jinx .result-text { color: #39ff14; font-size: 22px; font-weight: 900; padding: 16px; text-align: center; line-height: 1.4; margin: 0; text-transform: uppercase; text-shadow: 2px 2px 0 #000; }

/* 保留巨型 Meme 字体 */
.layout-jinx .trash-talk { font-family: 'Impact', 'Arial Black', 'PingFang SC', sans-serif; font-weight: 900; font-size: 20px; text-align: center; color: #fff; margin: 0 16px 20px; line-height: 1.2; position: relative; z-index: 2; -webkit-text-stroke: 1px #000; text-shadow: 2px 2px 0px #000, 0 0 10px #ff007c; transform: rotate(-2deg); text-transform: uppercase; display: flex; align-items: center; justify-content: center; min-height: 80px; }

.layout-jinx .info { background: #000; border: 2px dashed #ff007c; color: #fff; margin: 0 24px 20px; padding: 12px 16px; border-radius: 0; display: flex; gap: 12px; position: relative; z-index: 2; transform: rotate(1deg); }
.layout-jinx .info-item { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
.layout-jinx .icon { width: 16px; height: 16px; color: #39ff14; flex-shrink: 0; margin-top: 2px; }
.layout-jinx .label { color: #ff007c; font-weight: 800; font-size: 10px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px; }
.layout-jinx .value { color: #fff; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; margin: 0; line-height: 1.4; }

.layout-jinx .footer { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; margin: auto -24px 0; padding: 16px 24px; background: #000; width: calc(100% + 48px); border-top: 4px solid #39ff14; position: relative; z-index: 2; }
.layout-jinx .premium-badge { display: flex; align-items: center; gap: 8px; }
.layout-jinx .badge-icon { font-size: 18px; filter: drop-shadow(0 0 5px #ff007c); }
.layout-jinx .badge-text { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 900; color: #39ff14; letter-spacing: 2px; text-transform: uppercase; }
.layout-jinx .domain-watermark { font-family: 'Montserrat', sans-serif; font-size: 10px; color: #ff007c; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
</style>
