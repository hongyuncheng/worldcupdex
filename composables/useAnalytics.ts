import type { AnalyticsEventName } from './analyticsEvents'

/**
 * GA4 gtag 全局函数声明
 */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export interface AnalyticsTrackParams {
  [key: string]: string | number | boolean | null | undefined
}

export interface UseAnalyticsReturn {
  /** 是否已配置 GA ID（仅参考，不影响埋点调用安全性） */
  isEnabled: boolean
  /** 上报自定义事件 */
  track: (event: AnalyticsEventName | string, params?: AnalyticsTrackParams) => void
  /** 上报页面浏览 */
  trackPageView: (path?: string) => void
  /** 设置用户标识（预留） */
  identify: (userId: string, traits?: AnalyticsTrackParams) => void
}

/**
 * 统一的 GA4 埋点 composable
 * - 所有调用在 SSR 环境下静默
 * - 未配置 NUXT_PUBLIC_GA_ID 时也不会抛错，仅静默 no-op
 */
export function useAnalytics(): UseAnalyticsReturn {
  const config = useRuntimeConfig()
  const gaId = (config.public?.gaId as string) || ''
  const isEnabled = Boolean(gaId)

  function safeGtag(...args: any[]): void {
    if (import.meta.server) return
    if (typeof window === 'undefined') return
    if (typeof window.gtag !== 'function') return
    try {
      window.gtag(...args)
    } catch {
      // 静默吞掉，避免埋点失败影响业务
    }
  }

  function track(event: AnalyticsEventName | string, params?: AnalyticsTrackParams): void {
    safeGtag('event', event, params || {})
  }

  function trackPageView(path?: string): void {
    if (import.meta.server) return
    let pagePath = path
    if (!pagePath) {
      try {
        const route = useRoute()
        pagePath = route.fullPath
      } catch {
        pagePath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'
      }
    }
    safeGtag('event', 'page_view', {
      page_path: pagePath,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
    })
  }

  function identify(userId: string, traits?: AnalyticsTrackParams): void {
    if (!gaId) return
    safeGtag('config', gaId, {
      user_id: userId,
      ...(traits || {}),
    })
  }

  return {
    isEnabled,
    track,
    trackPageView,
    identify,
  }
}
