export function useShare() {
  const isShareSupported = ref(false)

  onMounted(() => {
    isShareSupported.value = !!navigator.share
  })

  // 使用 html2canvas-pro 将 DOM 元素转为图片 Blob
  async function generateImage(element: HTMLElement): Promise<Blob> {
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
        if (blob) resolve(blob)
        else reject(new Error('Failed to generate image'))
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
