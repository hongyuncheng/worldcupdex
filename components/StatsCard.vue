<template>
  <div class="flex items-center gap-4 bg-gray-50 rounded-xl p-6 flex-1">
    <div class="w-14 h-14 flex items-center justify-center rounded-full text-2xl shrink-0" style="background: #152570; color: #FFFFFF;">
      {{ icon }}
    </div>
    <div>
      <span class="text-4xl font-bold text-[#FFD700] block" style="font-family: 'Montserrat', sans-serif;">{{ count }}</span>
      <span class="text-base font-bold text-gray-800">{{ title }}</span>
      <p class="text-xs text-gray-500 mt-0.5">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  count: string
  title: string
  description: string
}>()
</script>
