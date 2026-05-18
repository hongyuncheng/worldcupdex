<script setup lang="ts">
import { AnalyticsEvents } from '~/composables/analyticsEvents'

interface Props {
  source: 'quiz_result' | 'fan_card_result'
  label?: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const { track } = useAnalytics()

const kickiqBaseUrl = computed<string>(() => {
  const raw = (runtimeConfig.public?.kickiqUrl as string) || 'https://kickiq.app'
  return raw.replace(/\/+$/, '')
})

const targetUrl = computed<string>(() => {
  const params = new URLSearchParams({
    utm_source: 'worldcupdex',
    utm_medium: 'cross_site',
    utm_campaign: 'worldcup2026',
    utm_content: props.source,
  })
  return `${kickiqBaseUrl.value}/?${params.toString()}`
})

function handleClick(): void {
  track(AnalyticsEvents.CROSS_SITE_CLICK, {
    source: props.source,
    target: 'kickiq',
  })
  if (typeof window !== 'undefined') {
    window.open(targetUrl.value, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <div class="kickiq-cta">
    <button
      type="button"
      class="btn btn-outline btn-secondary kickiq-cta__btn"
      @click="handleClick"
    >
      <Icon name="mdi:soccer" class="kickiq-cta__icon" />
      <span class="kickiq-cta__text">
        <span class="kickiq-cta__title">
          {{ label || t('crossSite.toKickiq.title') }}
        </span>
        <span class="kickiq-cta__subtitle">
          {{ t('crossSite.toKickiq.subtitle') }}
        </span>
      </span>
      <span class="kickiq-cta__cta">{{ t('crossSite.toKickiq.cta') }} →</span>
    </button>
  </div>
</template>

<style scoped>
.kickiq-cta {
  width: 100%;
  max-width: 500px;
  margin: 24px auto 0;
  display: flex;
  justify-content: center;
}

.kickiq-cta__btn {
  width: 100%;
  height: auto;
  min-height: 64px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 14px;
  border-radius: 16px;
  border-width: 1.5px;
  text-transform: none;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
}

.kickiq-cta__btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(167, 139, 250, 0.25);
}

.kickiq-cta__icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.kickiq-cta__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  text-align: left;
  min-width: 0;
}

.kickiq-cta__title {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.kickiq-cta__subtitle {
  font-size: 0.75rem;
  font-weight: 400;
  opacity: 0.75;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.kickiq-cta__cta {
  font-size: 0.85rem;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}

@media (max-width: 480px) {
  .kickiq-cta__btn {
    padding: 12px 14px;
    gap: 10px;
  }
  .kickiq-cta__title {
    font-size: 0.88rem;
  }
  .kickiq-cta__subtitle {
    font-size: 0.7rem;
  }
  .kickiq-cta__cta {
    font-size: 0.78rem;
  }
}
</style>
