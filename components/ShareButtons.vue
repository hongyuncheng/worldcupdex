<script setup lang="ts">
const { t } = useI18n()
const {
  isShareSupported,
  generateImage,
  downloadImage,
  shareToTwitter,
  shareToFacebook,
  shareToWhatsApp,
  shareToReddit,
  copyLink,
  nativeShare,
} = useShare()

const props = withDefaults(defineProps<{
  shareText: string
  shareUrl: string
  cardRef?: HTMLElement | null
  filename?: string
}>(), {
  cardRef: null,
  filename: 'worldcupdex.png',
})

const copied = ref(false)
const downloading = ref(false)

async function handleCopy() {
  const success = await copyLink(props.shareUrl)
  if (success) {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 3000)
  }
}

async function handleDownload() {
  if (!props.cardRef || downloading.value) return
  downloading.value = true
  try {
    const blob = await generateImage(props.cardRef)
    downloadImage(blob, props.filename)
  } catch (e) {
    console.error('Failed to download image:', e)
  } finally {
    downloading.value = false
  }
}

async function handleNativeShare() {
  await nativeShare({
    title: props.shareText,
    text: props.shareText,
    url: props.shareUrl,
  })
}

function handleTwitter() {
  shareToTwitter(props.shareText, props.shareUrl)
}

function handleFacebook() {
  shareToFacebook(props.shareUrl)
}

function handleWhatsApp() {
  shareToWhatsApp(props.shareText, props.shareUrl)
}

function handleReddit() {
  shareToReddit(props.shareText, props.shareUrl)
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-3">
    <!-- Native Share (移动端) -->
    <button
      v-if="isShareSupported"
      class="share-btn"
      :title="t('share.nativeShare')"
      @click="handleNativeShare"
    >
      <span class="text-lg">📤</span>
    </button>

    <!-- Twitter/X -->
    <button
      class="share-btn"
      :title="t('share.twitter')"
      @click="handleTwitter"
    >
      <span class="text-lg">🐦</span>
    </button>

    <!-- Facebook -->
    <button
      class="share-btn"
      :title="t('share.facebook')"
      @click="handleFacebook"
    >
      <span class="text-lg">📘</span>
    </button>

    <!-- WhatsApp -->
    <button
      class="share-btn"
      :title="t('share.whatsapp')"
      @click="handleWhatsApp"
    >
      <span class="text-lg">💬</span>
    </button>

    <!-- Reddit -->
    <button
      class="share-btn"
      :title="t('share.reddit')"
      @click="handleReddit"
    >
      <span class="text-lg">🔗</span>
    </button>

    <!-- Download Image -->
    <button
      v-if="cardRef"
      class="share-btn"
      :title="t('share.download')"
      :disabled="downloading"
      @click="handleDownload"
    >
      <span v-if="downloading" class="loading loading-spinner loading-xs"></span>
      <span v-else class="text-lg">📥</span>
    </button>

    <!-- Copy Link -->
    <button
      class="share-btn"
      :class="{ '!bg-green-600': copied }"
      :title="copied ? t('share.copied') : t('share.copyLink')"
      @click="handleCopy"
    >
      <span class="text-lg">📋</span>
      <span class="ml-1 text-xs whitespace-nowrap">{{ copied ? t('share.copied') : t('share.copyLink') }}</span>
    </button>
  </div>
</template>

<style scoped>
.share-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  padding: 0 10px;
  border-radius: 9999px;
  background-color: #000F49;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.15s ease;
}

.share-btn:hover {
  background-color: #FFD700;
  color: #000F49;
  transform: scale(1.08);
}

.share-btn:active {
  transform: scale(0.95);
}

.share-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
