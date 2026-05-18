<!--
  AdSlot.vue — Google AdSense 广告位组件
  ⚠️ 本组件实现完毕但未在任何页面挂载，待 AdSense 审核通过后再启用。
  使用方式：<AdSlot slot="1234567890" format="auto" />
  slot ID 由 AdSense 后台创建广告单元后获得。
-->
<script setup lang="ts">
import { computed, onMounted } from 'vue'

interface Props {
  slot: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical'
  responsive?: boolean
  layoutKey?: string
  minHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  format: 'auto',
  responsive: true,
  layoutKey: '',
  minHeight: 90,
})

const config = useRuntimeConfig()
const adsenseClient = computed<string>(() => (config.public.adsenseClient as string) || '')

const insStyle = computed(() => `display:block; min-height:${props.minHeight}px;`)

onMounted(() => {
  if (!adsenseClient.value) return
  try {
    // @ts-expect-error adsbygoogle is injected by AdSense script
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  }
  catch (err) {
    // 脚本未加载或被屏蔽时静默失败，避免影响页面渲染
    console.warn('[AdSlot] adsbygoogle push failed:', err)
  }
})
</script>

<template>
  <ClientOnly>
    <ins
      v-if="adsenseClient"
      class="adsbygoogle"
      :style="insStyle"
      :data-ad-client="adsenseClient"
      :data-ad-slot="slot"
      :data-ad-format="format"
      :data-full-width-responsive="responsive ? 'true' : 'false'"
      :data-ad-layout-key="layoutKey || undefined"
    />
  </ClientOnly>
</template>
