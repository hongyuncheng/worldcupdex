<template>
  <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-[#FFD700]">
    <!-- Group label -->
    <div class="flex justify-between items-center py-2 px-3 border-b border-gray-100">
      <span class="text-xs font-semibold text-gray-600">{{ $t('home.groupLabel', { group: group }) }}</span>
      <AddToCalendarButton 
        v-if="match"
        :matches="match" 
        dropdownPosition="right"
        customClass="!text-gray-500 !bg-gray-50 hover:!bg-gray-100 !border-gray-100 !py-1 !px-2 !text-[11px]"
        :buttonText="$t('home.addToMySchedule')"
      />
    </div>
    <!-- Teams VS -->
    <div class="flex items-center justify-center gap-2 px-3 py-4">
      <!-- Team 1 -->
      <div class="flex flex-col items-center gap-1.5 flex-1 min-w-0">
        <img :src="team1Flag" :alt="team1Name" class="w-11 h-8 object-contain rounded shadow-sm" loading="lazy" decoding="async" />
        <span class="text-xs font-bold text-gray-800 text-center truncate w-full">{{ team1Name }}</span>
      </div>
      <!-- VS -->
      <span class="text-base font-bold text-gray-400">VS</span>
      <!-- Team 2 -->
      <div class="flex flex-col items-center gap-1.5 flex-1 min-w-0">
        <img :src="team2Flag" :alt="team2Name" class="w-11 h-8 object-contain rounded shadow-sm" loading="lazy" decoding="async" />
        <span class="text-xs font-bold text-gray-800 text-center truncate w-full">{{ team2Name }}</span>
      </div>
    </div>
    <!-- Date & Venue -->
    <div class="text-center pb-3 px-3 text-[11px] leading-tight text-gray-500">
      <p>{{ date }}</p>
      <p class="truncate">{{ venue }}</p>
    </div>
    <!-- Predict buttons -->
    <div class="px-3 pb-2 grid grid-cols-2 gap-1.5">
      <NuxtLinkLocale
        :to="`/predict/${matchId}`"
        class="btn btn-xs h-8 min-h-0 border-none bg-[#FFD700] text-[#000F49] hover:bg-[#E6C200] font-bold no-underline shadow-sm text-xs px-2"
        style="border-radius: 8px;"
      >
        {{ $t('home.predictHuman') }}
      </NuxtLinkLocale>
      <button
        type="button"
        class="btn btn-xs h-8 min-h-0 border-none bg-[#7C3AED] text-white hover:bg-[#6D28D9] font-bold shadow-sm text-xs px-2"
        style="border-radius: 8px;"
        @click.prevent="onAiPredict"
      >
        {{ $t('home.predictAi') }}
      </button>
    </div>
    <!-- General Affiliate Placeholder -->
    <div class="px-3 pb-3">
      <a
        href="/api/track-affiliate?teamId=global&partner=Amazon&productName=Watch+Party+Essentials"
        target="_blank"
        rel="nofollow sponsored noopener"
        class="btn btn-xs w-full h-8 min-h-0 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-bold no-underline shadow-sm text-xs px-2 flex items-center justify-center gap-1.5 transition-colors"
        style="border-radius: 8px;"
      >
        📺 Watch Party Gear
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MatchItem } from '~/types'

const props = defineProps<{
  match?: MatchItem
  matchId: string
  group: string
  team1Name: string
  team1NameEn: string
  team1Flag: string
  team2Name: string
  team2NameEn: string
  team2Flag: string
  date: string
  venue: string
}>()

const { handleAiPredict } = useAiPredict()

function onAiPredict() {
  handleAiPredict(props.team1NameEn, props.team2NameEn, 'match_card_ai_btn')
}
</script>
