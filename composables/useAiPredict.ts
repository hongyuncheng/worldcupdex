import { AnalyticsEvents } from './analyticsEvents'

export function useAiPredict() {
  const runtimeConfig = useRuntimeConfig()
  const { track } = useAnalytics()

  function handleAiPredict(team1NameEn: string, team2NameEn: string, source: string) {
    // 统一获取跳转的基础地址
    const baseUrl = (runtimeConfig.public?.kickiqUrl as string) || 'https://kickiq.org/quiz'
    
    // 将 /quiz 替换为 /predict
    const targetUrl = new URL(baseUrl.replace('/quiz', '/predict'))
    
    // 统一拼接球队参数 A vs B
    targetUrl.searchParams.set('team1', team1NameEn)
    targetUrl.searchParams.set('team2', team2NameEn)
    
    // 统一的 UTM 参数
    targetUrl.searchParams.set('utm_source', 'worldcupdex')
    targetUrl.searchParams.set('utm_medium', 'ai_predict_btn')
    
    // 触发埋点
    track(AnalyticsEvents.CROSS_SITE_CLICK, {
      source,
      target: 'kickiq_predict',
    })

    // 跳转
    if (typeof window !== 'undefined') {
      window.open(targetUrl.toString(), '_blank', 'noopener,noreferrer')
    }
  }

  return { handleAiPredict }
}
