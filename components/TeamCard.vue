<template>
  <NuxtLinkLocale
    :to="`/teams/${teamId}`"
    class="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow min-w-[120px] cursor-pointer no-underline"
  >
    <img :src="flag" :alt="name" class="w-16 h-11 object-contain rounded shadow-sm mb-2" loading="lazy" decoding="async" />
    <span class="text-sm font-bold text-gray-800 mb-1">{{ name }}</span>
    <span class="text-xs font-bold text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded-full">#{{ rank }}</span>
  </NuxtLinkLocale>
</template>

<script setup lang="ts">
defineProps<{
  teamId: string
  name: string
  flag: string
  rank?: number
}>()
</script>
