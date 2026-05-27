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
          @click.stop="handleCalendarChoice"
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
          @click.stop="handleCalendarChoice"
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

    <div
      v-if="showGearCta"
      class="calendar-gear-cta"
      :class="[
        dropdownPosition === 'right' ? 'right-0' : 'left-0',
        dropdownDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
      ]"
    >
      <div class="calendar-gear-cta__title">{{ locale === 'zh' ? '已加入日历' : locale === 'es' ? 'Añadido al calendario' : 'Added to calendar' }}</div>
      <a
        href="/api/track-affiliate?teamId=global&partner=Amazon&productName=Soccer+Party+Decorations"
        target="_blank"
        rel="nofollow sponsored noopener"
        class="calendar-gear-cta__link"
        @click="showGearCta = false"
      >
        {{ locale === 'zh' ? '准备观赛装备' : locale === 'es' ? 'Preparar accesorios' : 'Prep watch party gear' }}
      </a>
      <div class="calendar-gear-cta__disclosure">{{ t('affiliate.sponsored') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
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

const { locale, t } = useI18n()
const isOpen = ref(false)
const showGearCta = ref(false)
let gearCtaTimer: ReturnType<typeof setTimeout> | null = null
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

function showAfterAddCta() {
  showGearCta.value = true
  if (gearCtaTimer) clearTimeout(gearCtaTimer)
  gearCtaTimer = setTimeout(() => {
    showGearCta.value = false
    gearCtaTimer = null
  }, 7000)
}

const handleCalendarChoice = () => {
  isOpen.value = false
  showAfterAddCta()
}

const handleDownloadIcs = () => {
  isOpen.value = false
  const matchArray = isMulti.value ? (props.matches as MatchItem[]) : [singleMatch.value]
  const filename = isMulti.value ? 'worldcup2026-my-schedule.ics' : `worldcup2026-match-${singleMatch.value.id}.ics`
  downloadIcs(matchArray, filename)
  showAfterAddCta()
}

onBeforeUnmount(() => {
  if (gearCtaTimer) clearTimeout(gearCtaTimer)
})
</script>

<style scoped>
.calendar-gear-cta {
  position: absolute;
  z-index: 60;
  width: 210px;
  padding: 10px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid rgba(0, 15, 73, 0.12);
  box-shadow: 0 14px 34px rgba(0, 15, 73, 0.16);
  color: #000f49;
}

.calendar-gear-cta__title {
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 6px;
}

.calendar-gear-cta__link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 10px;
  border-radius: 999px;
  background: #ffd700;
  color: #000f49;
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
}

.calendar-gear-cta__disclosure {
  margin-top: 6px;
  font-size: 10px;
  color: #8a92a3;
  text-align: center;
}
</style>
