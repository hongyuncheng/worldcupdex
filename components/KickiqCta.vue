<script setup lang="ts">
interface Props {
  source: 'quiz_result' | 'fan_card_result' | 'champion_result'
  label?: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()

const kickiqUrl = computed<string>(() => {
  // 优先读取环境变量配置
  let raw = (runtimeConfig.public?.kickiqUrl as string) || 'https://kickiq.org'
  raw = raw.replace(/\/+$/, '') // 去除末尾的斜杠
  
  // 确保它指向 /quiz 页面
  if (!raw.endsWith('/quiz')) {
    raw += '/quiz'
  }
  return raw
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
