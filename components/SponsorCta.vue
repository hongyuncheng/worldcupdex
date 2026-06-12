<script setup lang="ts">
import { AnalyticsEvents } from '~/composables/analyticsEvents'

const { t } = useI18n()
const { track } = useAnalytics()

interface Props {
  // 决定文案和风格
  theme?: 'generic' | 'jinx' | 'fan' | 'quiz'
  // 决定按钮外观
  btnStyle?: 'solid' | 'outline' | 'ghost'
  // 自定义链接（如果不填则跳转 Ko-fi 主页）
  url?: string
  placement?: string
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'generic',
  btnStyle: 'solid',
  url: 'https://ko-fi.com/worldcupdex',
  placement: 'sponsor_cta',
})

const themeConfig = computed(() => {
  switch (props.theme) {
    case 'jinx':
      return {
        icon: '🥛',
        title: 'Sponsor the mysterious power',
        desc: 'Your donation will make the "jinx" even stronger.',
        btnText: 'Buy a glass of milk',
        color: 'from-blue-500 to-cyan-400'
      }
    case 'fan':
      return {
        icon: '💖',
        title: 'Support WorldCupDex',
        desc: 'Love your Fan Card? Buy us a coffee to support the server costs!',
        btnText: 'Support Server',
        color: 'from-pink-500 to-rose-400'
      }
    case 'quiz':
      return {
        icon: '☕',
        title: 'Buy the dev a coffee',
        desc: 'Coding this site took 100+ sleepless nights. Keep the dev awake!',
        btnText: 'Buy a coffee',
        color: 'from-amber-500 to-orange-400'
      }
    case 'generic':
    default:
      return {
        icon: '🍺',
        title: 'Buy the dev a beer',
        desc: 'Enjoying the site? Keep the developer hydrated with a cold beer!',
        btnText: 'Buy a beer',
        color: 'from-amber-400 to-yellow-500'
      }
  }
})

function handleClick(): void {
  track(AnalyticsEvents.CROSS_SITE_CLICK, {
    source: `${props.placement}_${props.theme}`,
    target: 'ko-fi',
  })
}
</script>

<template>
  <div class="sponsor-cta relative overflow-hidden rounded-2xl p-4 border shadow-sm" :class="[
    props.theme === 'jinx' ? 'bg-blue-50/50 border-blue-100' :
    props.theme === 'fan' ? 'bg-pink-50/50 border-pink-100' :
    props.theme === 'quiz' ? 'bg-orange-50/50 border-orange-100' :
    'bg-yellow-50/50 border-yellow-100'
  ]">
    <div class="absolute -right-8 -top-8 opacity-[0.07] blur-2xl">
      <div class="w-32 h-32 rounded-full bg-gradient-to-br" :class="themeConfig.color"></div>
    </div>

    <div class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div class="flex items-start gap-3 text-left">
        <div class="sponsor-cta__icon">{{ themeConfig.icon }}</div>
        <div>
          <h4 class="font-bold text-gray-900 text-base mb-1">{{ themeConfig.title }}</h4>
          <p class="text-sm text-gray-600 m-0 leading-snug">{{ themeConfig.desc }}</p>
        </div>
      </div>

      <a 
        :href="props.url" 
        target="_blank" 
        rel="noopener noreferrer"
        class="sponsor-cta__button flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-colors"
        :class="[
          props.btnStyle === 'solid' ? `bg-gradient-to-r ${themeConfig.color} text-white border-none` :
          props.btnStyle === 'outline' ? 'bg-white border-2 border-gray-200 text-gray-800 hover:border-gray-300' :
          'bg-transparent text-gray-800 hover:bg-gray-100 shadow-none'
        ]"
        @click="handleClick"
      >
        <span>{{ themeConfig.btnText }}</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </a>
    </div>
  </div>
</template>

<style scoped>
.sponsor-cta__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  font-size: 20px;
  line-height: 1;
}

.sponsor-cta__button {
  min-height: 42px;
}
</style>
