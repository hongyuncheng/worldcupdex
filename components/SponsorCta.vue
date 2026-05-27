<script setup lang="ts">
const { t } = useI18n()

interface Props {
  // 决定文案和风格
  theme?: 'generic' | 'jinx' | 'fan' | 'quiz'
  // 决定按钮外观
  btnStyle?: 'solid' | 'outline' | 'ghost'
  // 自定义链接（如果不填则跳转 Ko-fi 主页）
  url?: string
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'generic',
  btnStyle: 'solid',
  url: 'https://ko-fi.com/worldcupdex'
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
</script>

<template>
  <div class="sponsor-cta relative overflow-hidden rounded-2xl p-5 border shadow-sm transition-transform hover:-translate-y-1" :class="[
    props.theme === 'jinx' ? 'bg-blue-50/50 border-blue-100' :
    props.theme === 'fan' ? 'bg-pink-50/50 border-pink-100' :
    props.theme === 'quiz' ? 'bg-orange-50/50 border-orange-100' :
    'bg-yellow-50/50 border-yellow-100'
  ]">
    <!-- Background Decoration -->
    <div class="absolute -right-6 -top-6 opacity-10 blur-xl">
      <div class="w-32 h-32 rounded-full bg-gradient-to-br" :class="themeConfig.color"></div>
    </div>

    <div class="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-4 text-center sm:text-left">
        <div class="text-4xl filter drop-shadow-md animate-bounce-slow">{{ themeConfig.icon }}</div>
        <div>
          <h4 class="font-bold text-gray-900 text-lg mb-0.5">{{ themeConfig.title }}</h4>
          <p class="text-sm text-gray-600 m-0 leading-tight">{{ themeConfig.desc }}</p>
        </div>
      </div>
      
      <a 
        :href="props.url" 
        target="_blank" 
        rel="noopener noreferrer"
        class="flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
        :class="[
          props.btnStyle === 'solid' ? `bg-gradient-to-r ${themeConfig.color} text-white border-none` :
          props.btnStyle === 'outline' ? 'bg-white border-2 border-gray-200 text-gray-800 hover:border-gray-300' :
          'bg-transparent text-gray-800 hover:bg-gray-100 shadow-none'
        ]"
      >
        <span>{{ themeConfig.btnText }}</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </a>
    </div>
  </div>
</template>

<style scoped>
.animate-bounce-slow {
  animation: bounce 3s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
  50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
}
</style>