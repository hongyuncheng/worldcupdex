<template>
  <IconifyIcon
    :icon="name"
    :width="size"
    :height="size"
    aria-hidden="true"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue'

defineOptions({
  inheritAttrs: false,
})

withDefaults(defineProps<{
  name: string
  size?: string | number
}>(), {
  size: '1em',
})
</script>
