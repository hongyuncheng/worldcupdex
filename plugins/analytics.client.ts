/**
 * 客户端路由订阅 - 自动上报 GA4 page_view
 * 仅 client 端执行（文件名 .client.ts），SSR 不会包含。
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { trackPageView } = useAnalytics()
  const router = useRouter()

  // 首屏：等待应用 mounted 后上报一次（gtag 此时已注入）
  nuxtApp.hook('app:mounted', () => {
    trackPageView(router.currentRoute.value.fullPath)
  })

  // 后续路由切换
  router.afterEach((to) => {
    trackPageView(to.fullPath)
  })
})
