<template>
  <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-[#FFD700]">
    <!-- Group label -->
    <div class="text-center py-3 border-b border-gray-100">
      <span class="text-sm font-semibold text-gray-600">{{ $t('home.groupMatch') }} {{ group }}{{ $t('home.group') }}</span>
    </div>
    <!-- Teams VS -->
    <div class="flex items-center justify-center gap-4 px-4 py-5">
      <!-- Team 1 -->
      <div class="flex flex-col items-center gap-2 flex-1">
        <img :src="team1Flag" :alt="team1Name" class="w-14 h-10 object-contain rounded shadow-sm" />
        <span class="text-sm font-bold text-gray-800">{{ team1Name }}</span>
      </div>
      <!-- VS -->
      <span class="text-lg font-bold text-gray-400">VS</span>
      <!-- Team 2 -->
      <div class="flex flex-col items-center gap-2 flex-1">
        <img :src="team2Flag" :alt="team2Name" class="w-14 h-10 object-contain rounded shadow-sm" />
        <span class="text-sm font-bold text-gray-800">{{ team2Name }}</span>
      </div>
    </div>
    <!-- Date & Venue -->
    <div class="text-center pb-3 text-xs text-gray-500">
      <p>{{ date }}</p>
      <p>{{ venue }}</p>
    </div>
    <!-- Predict buttons -->
    <div class="px-4 pb-4 grid grid-cols-2 gap-2">
      <NuxtLinkLocale
        :to="`/predict/${matchId}`"
        class="btn btn-sm border-none bg-[#FFD700] text-[#000F49] hover:bg-[#E6C200] font-bold no-underline shadow-sm"
        style="border-radius: 8px;"
      >
        {{ $t('home.predictHuman') }}
      </NuxtLinkLocale>
      <button
        type="button"
        class="btn btn-sm border-none bg-[#7C3AED] text-white hover:bg-[#6D28D9] font-bold shadow-sm"
        style="border-radius: 8px;"
        @click.prevent="onAiPredict"
      >
        {{ $t('home.predictAi') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  matchId: string
  group: string
  team1Name: string
  team1Flag: string
  team2Name: string
  team2Flag: string
  date: string
  venue: string
}>()

// AI 预测逻辑后续接入，这里先留空
function onAiPredict() {
  // TODO: 跳转或弹出 AI 预测详情。现阶段不做处理。
}
</script>
