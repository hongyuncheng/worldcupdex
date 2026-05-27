<script setup lang="ts">
const { t } = useI18n()

const props = withDefaults(defineProps<{
  shareText: string
  shareUrl: string
  cardRef: HTMLElement | null
  filename?: string
  saveButtonText?: string
  shareTitle?: string
  platforms?: string[]
  onBeforeSave?: () => Promise<void>
  onAfterSave?: () => void
}>(), {
  filename: 'worldcupdex-share.png',
  saveButtonText: '',
  shareTitle: '',
  platforms: () => ['twitter', 'instagram', 'discord', 'whatsapp', 'reddit', 'copy'],
  onBeforeSave: undefined,
  onAfterSave: undefined,
})

// ========== 状态 ==========
const saving = ref(false)
const copied = ref(false)

// ========== 平台可见性 ==========
function visible(key: string) {
  return props.platforms.includes(key)
}

// ========== 标题文字 ==========
const titleText = computed(() => props.shareTitle || t('share.shareTitle'))
const saveBtnText = computed(() => props.saveButtonText || t('share.saveImage'))

// ========== 等待卡片内所有图片加载完毕 ==========
function waitForImages(el: HTMLElement): Promise<void> {
  const imgs = Array.from(el.querySelectorAll<HTMLImageElement>('img'))
  const pending = imgs.filter(img => !img.complete)
  if (pending.length === 0) return Promise.resolve()
  return Promise.all(
    pending.map(
      img =>
        new Promise<void>((resolve) => {
          img.onload = () => resolve()
          img.onerror = () => resolve()
        }),
    ),
  ).then(() => {})
}

// ========== 保存图片 ==========
async function saveCardAsImage() {
  if (!props.cardRef || saving.value) return
  saving.value = true

  try {
    // 截图前回调：切换为代理图片
    if (props.onBeforeSave) await props.onBeforeSave()

    // 等待代理图片加载完成
    await waitForImages(props.cardRef)

    const html2canvas = (await import('html2canvas-pro')).default
    const canvas = await html2canvas(props.cardRef, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    })

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b: Blob | null) => resolve(b!), 'image/png')
    })

    const file = new File([blob], props.filename, { type: 'image/png' })

      // 检测是否是移动端设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    // 移动端：尝试使用 Web Share API 直接分享图片
    if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'WorldCupDex',
        text: props.shareText,
      })
    } else {
      // PC端或不支持Web Share的移动端浏览器：直接触发下载
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = props.filename
      document.body.appendChild(a) // 兼容Firefox
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  } catch (e) {
    console.error('Save image failed:', e)
  } finally {
    // 截图后回调：恢复原始图片
    props.onAfterSave?.()
    saving.value = false
  }
}

// ========== 分享功能 ==========
function shareTwitter() {
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.shareText)}&url=${encodeURIComponent(props.shareUrl)}`,
    '_blank',
    'width=600,height=400',
  )
}

async function shareInstagram() {
  try {
    await navigator.clipboard.writeText(props.shareText + ' ' + props.shareUrl)
    showCopiedToast()
  } catch { /* noop */ }
}

async function shareDiscord() {
  try {
    await navigator.clipboard.writeText(props.shareText + ' ' + props.shareUrl)
    showCopiedToast()
  } catch { /* noop */ }
}

function shareWhatsApp() {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(props.shareText + ' ' + props.shareUrl)}`,
    '_blank',
  )
}

function shareReddit() {
  window.open(
    `https://www.reddit.com/submit?url=${encodeURIComponent(props.shareUrl)}&title=${encodeURIComponent(props.shareText)}`,
    '_blank',
    'width=600,height=500',
  )
}

function shareMessenger() {
  window.open(
    `https://www.facebook.com/dialog/send?link=${encodeURIComponent(props.shareUrl)}&app_id=0&redirect_uri=${encodeURIComponent(props.shareUrl)}`,
    '_blank',
    'width=600,height=500',
  )
}

function shareThreads() {
  window.open(
    `https://threads.net/intent/post?text=${encodeURIComponent(props.shareText + ' ' + props.shareUrl)}`,
    '_blank',
    'width=600,height=600',
  )
}

async function handleCopyLink() {
  try {
    await navigator.clipboard.writeText(props.shareUrl)
    showCopiedToast()
  } catch { /* noop */ }
}

function showCopiedToast() {
  copied.value = true
  setTimeout(() => { copied.value = false }, 2500)
}
</script>

<template>
  <div class="share-panel">
    <!-- Copied Toast -->
    <Transition name="sp-toast">
      <div v-if="copied" class="share-panel__toast">✓ {{ t('share.copied') }}</div>
    </Transition>

    <!-- Save Image Button -->
    <button
      class="share-panel__save-btn"
      :disabled="saving"
      @click="saveCardAsImage"
    >
      <span v-if="saving">{{ t('common.loading') }}</span>
      <span v-else class="share-panel__save-text">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        {{ saveBtnText }}
      </span>
    </button>

    <!-- Share Section -->
    <div class="share-panel__section">
      <div class="share-panel__header">
        <span class="share-panel__deco-line" /><span class="share-panel__diamond">◆</span>
        <span class="share-panel__header-text">{{ titleText }}</span>
        <span class="share-panel__diamond">◆</span><span class="share-panel__deco-line" />
      </div>

      <div class="share-panel__grid">
        <!-- Twitter / X -->
        <button v-if="visible('twitter')" class="share-panel__btn" @click="shareTwitter">
          <div class="share-panel__icon" style="background:#000">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </div>
          <span class="share-panel__label">X</span>
        </button>
        <!-- Instagram -->
        <button v-if="visible('instagram')" class="share-panel__btn" @click="shareInstagram">
          <div class="share-panel__icon" style="background:radial-gradient(circle at 30% 107%,#fdf497 0%,#fdf497 5%,#fd5949 45%,#d6249f 60%,#285AEB 90%)">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </div>
          <span class="share-panel__label">Instagram</span>
        </button>
        <!-- Discord -->
        <button v-if="visible('discord')" class="share-panel__btn" @click="shareDiscord">
          <div class="share-panel__icon" style="background:#5865F2">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.618-1.25.077.077 0 00-.079-.037 19.736 19.736 0 00-4.885 1.515.07.07 0 00-.032.028C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.1.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.946 2.418-2.157 2.418z"/></svg>
          </div>
          <span class="share-panel__label">Discord</span>
        </button>
        <!-- Messenger -->
        <button v-if="visible('messenger')" class="share-panel__btn" @click="shareMessenger">
          <div class="share-panel__icon" style="background:#0084FF">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M12 2C6.48 2 2 6.03 2 11c0 1.82.49 3.53 1.35 5L2 22l5.11-1.33A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.91 7.44l-2.16 4.38c-.17.34-.61.44-.9.2l-1.87-1.4a.66.66 0 00-.8 0l-2.52 1.91c-.46.35-1.07-.2-.76-.7l2.16-4.38c.17-.34.61-.44.9-.2l1.87 1.4c.22.17.54.17.76 0l2.52-1.91c.47-.35 1.08.2.8.7z"/></svg>
          </div>
          <span class="share-panel__label">Messenger</span>
        </button>
        <!-- WhatsApp -->
        <button v-if="visible('whatsapp')" class="share-panel__btn" @click="shareWhatsApp">
          <div class="share-panel__icon" style="background:#25D366">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <span class="share-panel__label">WhatsApp</span>
        </button>
        <!-- Reddit -->
        <button v-if="visible('reddit')" class="share-panel__btn" @click="shareReddit">
          <div class="share-panel__icon" style="background:#FF4500">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
          </div>
          <span class="share-panel__label">Reddit</span>
        </button>
        <!-- Threads -->
        <button v-if="visible('threads')" class="share-panel__btn" @click="shareThreads">
          <div class="share-panel__icon" style="background:#000">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.781 3.632 2.695 6.54 2.717h.005c1.623 0 3.19-.422 4.663-1.255l.91 1.832c-1.79 1.003-3.76 1.51-5.86 1.51h-.007z"/></svg>
          </div>
          <span class="share-panel__label">Threads</span>
        </button>
        <!-- Copy Link -->
        <button v-if="visible('copy')" class="share-panel__btn" @click="handleCopyLink">
          <div class="share-panel__icon" style="background:rgba(255,255,255,0.12)">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
          </div>
          <span class="share-panel__label">{{ t('share.copyLink') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== Toast ===== */
.share-panel__toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(34, 197, 94, 0.95);
  color: #fff;
  padding: 10px 28px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 1000;
  backdrop-filter: blur(8px);
}
.sp-toast-enter-active,
.sp-toast-leave-active { transition: all 0.3s ease; }
.sp-toast-enter-from,
.sp-toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-12px); }

/* ===== Decorators ===== */
.share-panel__diamond {
  color: rgba(255, 215, 0, 0.55);
  font-size: 0.55rem;
  flex-shrink: 0;
}
.share-panel__deco-line {
  display: inline-block;
  width: 36px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  flex-shrink: 0;
}

/* ===== Section Header ===== */
.share-panel__header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}
.share-panel__header-text {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 500;
  white-space: nowrap;
}

/* ===== Save Image Button ===== */
.share-panel__save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 300px;
  max-width: 90%;
  margin: 0 auto 24px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000F49;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  margin-top: 20px;
}
.share-panel__save-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5);
}
.share-panel__save-btn:disabled {
  opacity: 0.6;
  cursor: wait;
  transform: none;
}

.share-panel__save-text {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

/* ===== Share Grid ===== */
.share-panel__section {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}
.share-panel__grid {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 10px;
}
.share-panel__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 6px 12px;
  width: 76px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  color: #fff;
}
.share-panel__btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
}
.share-panel__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.share-panel__label {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
}

/* ===== Mobile ===== */
@media (max-width: 640px) {
  .share-panel__grid {
    flex-wrap: wrap;
  }
  .share-panel__btn {
    width: calc(33.33% - 8px);
    min-width: 70px;
  }
}
</style>
