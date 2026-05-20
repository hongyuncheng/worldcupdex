<template>
  <div class="relative" ref="dropdownRef">
    <!-- Trigger Button -->
    <button 
      @click.prevent.stop="isOpen = !isOpen"
      class="flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded-lg transition-colors backdrop-blur-sm"
      :class="customClass"
    >
      <span class="text-sm">📅</span>
      {{ buttonText || $t('schedule.addToCalendar') }}
    </button>

    <!-- Dropdown Menu -->
    <div 
      v-if="isOpen" 
      class="absolute z-50 w-48 rounded-xl bg-[#000F49]/95 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden animate-fade-in"
      :class="[
        dropdownPosition === 'right' ? 'right-0' : 'left-0',
        dropdownDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
      ]"
      style="z-index: 50;"
    >
      <div class="p-1.5 flex flex-col gap-1">
        <!-- Google Calendar -->
        <a 
          v-if="!isMulti"
          :href="googleLink" 
          target="_blank" 
          rel="noopener noreferrer"
          class="flex items-center gap-2.5 px-3 py-2 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          @click.stop="isOpen = false"
        >
          <span class="text-lg">🟢</span> Google Calendar
        </a>

        <!-- Outlook -->
        <a 
          v-if="!isMulti"
          :href="outlookLink" 
          target="_blank" 
          rel="noopener noreferrer"
          class="flex items-center gap-2.5 px-3 py-2 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          @click.stop="isOpen = false"
        >
          <span class="text-lg">🔵</span> Outlook
        </a>

        <div v-if="!isMulti" class="h-px w-full bg-white/10 my-0.5"></div>

        <!-- Apple / ICS Download -->
        <button 
          @click.prevent.stop="handleDownloadIcs"
          class="flex items-center w-full gap-2.5 px-3 py-2 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
        >
          <span class="text-lg">🍎</span> {{ isMulti ? $t('schedule.downloadAllIcs') : 'Apple / .ICS File' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { MatchItem } from '~/types'
import { useCalendar } from '~/composables/useCalendar'

const props = withDefaults(defineProps<{
  matches: MatchItem | MatchItem[]
  buttonText?: string
  customClass?: string
  dropdownPosition?: 'left' | 'right'
  dropdownDirection?: 'up' | 'down'
}>(), {
  dropdownDirection: 'down'
})

const isOpen = ref(false)
const dropdownRef = ref(null)

onClickOutside(dropdownRef, () => {
  isOpen.value = false
})

const { generateGoogleCalendarLink, generateOutlookCalendarLink, downloadIcs } = useCalendar()

const isMulti = computed(() => Array.isArray(props.matches))

const singleMatch = computed(() => {
  return isMulti.value ? (props.matches as MatchItem[])[0] : (props.matches as MatchItem)
})

const googleLink = computed(() => {
  if (isMulti.value) return '#'
  return generateGoogleCalendarLink(singleMatch.value)
})

const outlookLink = computed(() => {
  if (isMulti.value) return '#'
  return generateOutlookCalendarLink(singleMatch.value)
})

const handleDownloadIcs = () => {
  isOpen.value = false
  const matchArray = isMulti.value ? (props.matches as MatchItem[]) : [singleMatch.value]
  const filename = isMulti.value ? 'worldcup2026-my-schedule.ics' : `worldcup2026-match-${singleMatch.value.id}.ics`
  downloadIcs(matchArray, filename)
}
</script>
