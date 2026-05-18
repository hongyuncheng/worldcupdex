/**
 * 分享 composable
 * - 提供 PNG 卡片导出、社交平台分享、剪贴板复制等能力
 * - 内置分享文案 A/B 实验：用户首次进入站点时随机分配 variant 'A' 或 'B'，
 *   持久化到 localStorage（key: share_variant），并通过 GA4 上报一次 SHARE_VARIANT 事件
 */

export type ShareVariant = 'A' | 'B'

export interface ShareTextPayload {
  /** 文案变体 */
  variant: ShareVariant
  /** 主标题（适合作为卡片/Twitter 标题） */
  title: string
  /** 描述（用于 description / OG / 分享正文） */
  description: string
  /** Hashtag 字串（已带 # 号，多条以空格分隔） */
  hashtag: string
  /** CTA 引导话术（一般作为正文末尾） */
  cta: string
}

export interface BuildShareTextParams {
  /** 与文案模板字段对应的占位填充值，如 { team, score, percentile } */
  team?: string
  score?: number | string
  percentile?: number | string
  [key: string]: string | number | undefined
}

const STORAGE_KEY_VARIANT = 'share_variant'
const STORAGE_KEY_REPORTED = 'share_variant_reported'

export function useShare() {
  const { track } = useAnalytics()
  const { t, te } = useI18n()
  const isShareSupported = ref(false)

  /**
   * 读取/初始化 A/B 变体分配
   * - 仅在客户端执行；SSR 默认返回 'A'，但不会持久化也不会上报
   * - 首次分配会调用一次 SHARE_VARIANT 上报，并写入 share_variant_reported 守护重复
   */
  function getShareVariant(): ShareVariant {
    if (import.meta.server || typeof window === 'undefined') return 'A'
    try {
      const existing = localStorage.getItem(STORAGE_KEY_VARIANT)
      if (existing === 'A' || existing === 'B') {
        return existing
      }
      const assigned: ShareVariant = Math.random() < 0.5 ? 'A' : 'B'
      localStorage.setItem(STORAGE_KEY_VARIANT, assigned)
      // 仅在首次分配且未上报过时调用一次埋点
      if (!localStorage.getItem(STORAGE_KEY_REPORTED)) {
        track(AnalyticsEvents.SHARE_VARIANT, { variant: assigned })
        localStorage.setItem(STORAGE_KEY_REPORTED, '1')
      }
      return assigned
    } catch {
      return 'A'
    }
  }

  /**
   * 构建当前 variant 的分享文案
   * @param params 文案占位填充值（如 team / score）
   * @param overrideVariant 可选，强制使用某个 variant（一般用于调试）
   */
  function buildShareText(
    params: BuildShareTextParams = {},
    overrideVariant?: ShareVariant,
  ): ShareTextPayload {
    const variant = overrideVariant || getShareVariant()
    const ns = variant === 'B' ? 'share.variantB' : 'share.variantA'

    // 兜底：i18n 未配置时返回安全空串，避免抛错
    const safeT = (key: string): string => {
      try {
        return te(key) ? (t(key, params as Record<string, unknown>) as string) : ''
      } catch {
        return ''
      }
    }

    return {
      variant,
      title: safeT(`${ns}.title`),
      description: safeT(`${ns}.description`),
      hashtag: safeT(`${ns}.hashtag`),
      cta: safeT(`${ns}.cta`),
    }
  }

  onMounted(() => {
    isShareSupported.value = !!navigator.share
    // 进入站点时主动确保 variant 被分配并上报（幂等）
    getShareVariant()
  })

  // 使用 html2canvas-pro 将 DOM 元素转为图片 Blob
  async function generateImage(element: HTMLElement, options?: { cardType?: string }): Promise<Blob> {
    const html2canvas = (await import('html2canvas-pro')).default
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      logging: false,
    })
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          // PNG 导出成功埋点（Felix 已实现，请勿改动）
          track(AnalyticsEvents.SHARE_CARD_EXPORT, {
            card_type: options?.cardType || 'unknown',
          })
          resolve(blob)
        } else {
          reject(new Error('Failed to generate image'))
        }
      }, 'image/png')
    })
  }

  // 下载图片
  function downloadImage(blob: Blob, filename: string = 'worldcupdex.png') {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 分享到 Twitter/X
  function shareToTwitter(text: string, url: string) {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  // 分享到 Facebook
  function shareToFacebook(url: string) {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(fbUrl, '_blank', 'width=600,height=400')
  }

  // 分享到 WhatsApp
  function shareToWhatsApp(text: string, url: string) {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`
    window.open(waUrl, '_blank')
  }

  // 分享到 Reddit
  function shareToReddit(title: string, url: string) {
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
    window.open(redditUrl, '_blank', 'width=600,height=400')
  }

  // 复制链接到剪贴板
  async function copyLink(url: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    }
  }

  // Web Share API (移动端优先)
  async function nativeShare(data: { title: string; text: string; url: string; files?: File[] }) {
    if (navigator.share) {
      try {
        await navigator.share(data)
        return true
      } catch {
        return false
      }
    }
    return false
  }

  return {
    isShareSupported,
    getShareVariant,
    buildShareText,
    generateImage,
    downloadImage,
    shareToTwitter,
    shareToFacebook,
    shareToWhatsApp,
    shareToReddit,
    copyLink,
    nativeShare,
  }
}
