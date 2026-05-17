<template>
  <div></div>
</template>

<script setup lang="ts">
// /matches 重定向到 /schedule
await navigateTo('/schedule', { redirectCode: 301 })
</script>
