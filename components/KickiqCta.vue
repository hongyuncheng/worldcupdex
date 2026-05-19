<script setup lang="ts">
interface Props {
  source: 'quiz_result' | 'fan_card_result' | 'champion_result'
  label?: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()

const kickiqUrl = computed<string>(() => {
  // 优先读取环境变量配置，如果没配置则使用默认的 https://kickiq.org/quiz
  const raw = (runtimeConfig.public?.kickiqUrl as string) || 'https://kickiq.org/quiz'
  return raw.replace(/\/+$/, '')
})
</script>

<template>
  <ExternalCta
    :source="source"
    target-id="kickiq"
    :url="kickiqUrl"
    icon="mdi:soccer"
    :title="label || t('crossSite.toKickiq.title')"
    :subtitle="t('crossSite.toKickiq.subtitle')"
    :cta-text="t('crossSite.toKickiq.cta') + ' →'"
  />
</template>
