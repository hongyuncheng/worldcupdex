<script setup lang="ts">
import { AnalyticsEvents } from '~/composables/analyticsEvents'

interface Props {
  source: string
  targetId: string // 用于分析目标，如 'kickiq', 'partner_site'
  url: string // 目标网站 URL
  icon?: string
  title: string
  subtitle?: string
  ctaText?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi:open-in-new',
  ctaText: '访问 →',
  utmSource: 'worldcupdex',
  utmMedium: 'cross_site',
  utmCampaign: 'worldcup2026',
})

const { track } = useAnalytics()

const targetUrl = computed<string>(() => {
  try {
    const urlObj = new URL(props.url)
    if (props.utmSource) urlObj.searchParams.set('utm_source', props.utmSource)
    if (props.utmMedium) urlObj.searchParams.set('utm_medium', props.utmMedium)
    if (props.utmCampaign) urlObj.searchParams.set('utm_campaign', props.utmCampaign)
    if (props.source) urlObj.searchParams.set('utm_content', props.source)
    return urlObj.toString()
  } catch (e) {
    // 如果 url 无效或是相对路径，返回原始 url
    return props.url
  }
})

function handleClick(): void {
  track(AnalyticsEvents.CROSS_SITE_CLICK, {
    source: props.source,
    target: props.targetId,
  })
  if (typeof window !== 'undefined') {
    window.open(targetUrl.value, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <div class="external-cta">
    <button
      type="button"
      class="external-cta__btn"
      @click="handleClick"
    >
      <Icon :name="icon" class="external-cta__icon" />
      <span class="external-cta__text">
        <span class="external-cta__title">
          {{ title }}
        </span>
        <span v-if="subtitle" class="external-cta__subtitle">
          {{ subtitle }}
        </span>
      </span>
      <span class="external-cta__cta">{{ ctaText }}</span>
    </button>
  </div>
</template>

<style scoped>
.external-cta {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.external-cta__btn {
  width: 100%;
  height: auto;
  min-height: 64px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 14px;
  border-radius: 16px;
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  color: #1a1a2e;
  text-transform: none;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.external-cta__btn:hover {
  transform: translateY(-2px);
  border-color: #2D7AF6;
  box-shadow: 0 6px 20px rgba(45, 122, 246, 0.15);
}

.external-cta__icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  color: #2D7AF6;
}

.external-cta__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  text-align: left;
  min-width: 0;
}

.external-cta__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.external-cta__subtitle {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.external-cta__cta {
  font-size: 0.85rem;
  font-weight: 700;
  color: #2D7AF6;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}

@media (max-width: 480px) {
  .external-cta__btn {
    padding: 12px 14px;
    gap: 10px;
  }
  .external-cta__title {
    font-size: 0.88rem;
  }
  .external-cta__subtitle {
    font-size: 0.7rem;
  }
  .external-cta__cta {
    font-size: 0.78rem;
  }
}
</style>
