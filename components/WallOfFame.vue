<template>
  <div class="wall-of-fame bg-white/50 rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
      <div>
        <h2 class="font-bold mb-2 flex items-center gap-2" style="font-family: 'Montserrat', sans-serif; font-size: 24px; color: #000F49;">
          💖 Wall of Supporters
        </h2>
        <p style="font-family: 'Inter', sans-serif; font-size: 14px; color: #4A5578; max-width: 500px;">
          {{ $t('home.supportersSubtitle', 'A huge thank you to everyone who bought us a beer and keeps the servers running! 🍻') }}
        </p>
      </div>
      <!-- Trigger Ko-fi widget when clicking this button -->
      <button 
        @click="openKofiWidget"
        class="inline-flex items-center justify-center font-bold px-6 py-2.5 rounded-lg transition-transform hover:scale-105"
        style="background: #00b9fe; color: white; font-family: 'Montserrat', sans-serif; font-size: 14px; white-space: nowrap;"
      >
        Buy us a Beer 🍺
      </button>
    </div>

    <!-- Masonry/Grid of supporters -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="supporter in supporters" 
        :key="supporter.id"
        class="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_5px_15px_rgba(0,0,0,0.05)] transition-shadow flex flex-col justify-between"
      >
        <div>
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <!-- Avatar placeholder -->
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-[#000F49] font-bold text-sm">
                {{ supporter.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="font-bold text-[#000F49] text-sm">{{ supporter.name }}</div>
                <div class="text-xs text-gray-400">{{ supporter.date }}</div>
              </div>
            </div>
            <!-- Beers icon -->
            <div class="flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
              🍺 <span class="ml-0.5">x{{ supporter.beers }}</span>
            </div>
          </div>
          <p class="text-[13px] text-[#4A5578] leading-relaxed italic">
            "{{ supporter.message }}"
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import supportersData from '~/data/supporters.json'

const supporters = supportersData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

// Programmatically open the Ko-fi page
const openKofiWidget = () => {
  // 由于 Ko-fi 的左下角悬浮按钮是一个跨域的 iframe，浏览器的安全策略（跨域限制）不允许我们用代码模拟点击它内部的元素。
  // 所以最稳定、体验最好的做法是：点击荣誉墙按钮时，直接在一个优雅的新标签页中打开你的 Ko-fi 专属打赏页。
  window.open('https://ko-fi.com/worldcupdex', '_blank');
}
</script>

<style scoped>
/* Scoped styles if needed */
</style>
