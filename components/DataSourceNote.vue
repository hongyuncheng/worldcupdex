<template>
  <section class="data-source-note" :class="{ 'data-source-note--compact': compact }" aria-label="Data source notice">
    <div class="data-source-note__main">
      <div class="data-source-note__eyebrow">{{ labels.title }}</div>
      <p class="data-source-note__text">
        <strong>{{ labels.source }}</strong>
        {{ localized(meta.source) }}
      </p>
      <p v-if="meta.disclaimer" class="data-source-note__text data-source-note__text--muted">
        {{ localized(meta.disclaimer) }}
      </p>
    </div>
    <div class="data-source-note__facts">
      <span class="data-source-note__pill">{{ labels.updated }} {{ formattedDate }}</span>
      <span class="data-source-note__pill">{{ labels.ai }} {{ meta.aiGenerated ? labels.yes : labels.no }}</span>
      <NuxtLinkLocale to="/contact" class="data-source-note__link">{{ labels.feedback }}</NuxtLinkLocale>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DataSourceKind } from '~/composables/useDataSourceMeta'

const props = defineProps<{
  kind: DataSourceKind
  compact?: boolean
}>()

const { locale } = useI18n()
const meta = computed(() => useDataSourceMeta(props.kind))

const dictionary = {
  en: {
    title: 'Data transparency',
    source: 'Source:',
    updated: 'Updated',
    ai: 'AI-generated',
    yes: 'Yes',
    no: 'No',
    feedback: 'Report an issue',
  },
  zh: {
    title: '数据透明度',
    source: '来源：',
    updated: '更新时间',
    ai: 'AI 生成',
    yes: '是',
    no: '否',
    feedback: '反馈问题',
  },
  es: {
    title: 'Transparencia de datos',
    source: 'Fuente:',
    updated: 'Actualizado',
    ai: 'Generado por IA',
    yes: 'Si',
    no: 'No',
    feedback: 'Informar error',
  },
}

const labels = computed(() => dictionary[locale.value as keyof typeof dictionary] ?? dictionary.en)

function localized(value: { en: string; zh: string; es: string }) {
  return value[locale.value as keyof typeof value] ?? value.en
}

const formattedDate = computed(() => {
  const date = new Date(`${meta.value.lastUpdated}T00:00:00Z`)
  if (locale.value === 'zh') {
    return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日`
  }
  return date.toLocaleDateString(locale.value === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
})
</script>

<style scoped>
.data-source-note {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin: 16px 0 24px;
  padding: 14px 16px;
  border: 1px solid #D8DDEA;
  border-left: 4px solid #FFD700;
  border-radius: 8px;
  background: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.data-source-note--compact {
  margin: 12px 0 18px;
}
.data-source-note__main {
  min-width: 0;
}
.data-source-note__eyebrow {
  margin-bottom: 4px;
  color: #000F49;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}
.data-source-note__text {
  margin: 0;
  color: #34405F;
  font-size: 13px;
  line-height: 1.5;
}
.data-source-note__text--muted {
  margin-top: 3px;
  color: #6A7288;
}
.data-source-note__facts {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  flex: 0 0 auto;
}
.data-source-note__pill,
.data-source-note__link {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.data-source-note__pill {
  background: #F3F5FA;
  color: #000F49;
}
.data-source-note__link {
  border: 1px solid #D8DDEA;
  background: #FFFFFF;
  color: #000F49;
  text-decoration: none;
}
.data-source-note__link:hover {
  border-color: #000F49;
  background: #F8F9FC;
}

@media (max-width: 768px) {
  .data-source-note {
    flex-direction: column;
    gap: 12px;
    margin: 12px 0 18px;
  }
  .data-source-note__facts {
    justify-content: flex-start;
    width: 100%;
  }
}
</style>
