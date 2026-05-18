/**
 * 全站统一的 GA4 事件常量
 * 任何埋点都应使用此处定义的事件名，避免散落字符串。
 */
export const AnalyticsEvents = {
  SHARE_CARD_EXPORT: 'share_card_export',
  PREDICT_SUBMIT: 'predict_submit',
  QUIZ_COMPLETE: 'quiz_complete',
  AFFILIATE_CLICK: 'affiliate_click',
  CROSS_SITE_CLICK: 'cross_site_click',
  SHARE_VARIANT: 'share_variant',
} as const

export type AnalyticsEventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents]
