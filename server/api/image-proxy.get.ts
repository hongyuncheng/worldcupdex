/**
 * 图片代理接口 - 解决 html2canvas 跨域截图时第三方图片无法渲染的问题
 * 用法: /api/image-proxy?url=https://r2.thesportsdb.com/...
 *
 * 内存缓存：同一 URL 在服务进程生命周期内只拉取一次，后续直接命中缓存
 */

interface CacheEntry {
  data: Uint8Array
  contentType: string
}

// 进程级内存缓存，最多缓存 500 张图片
const CACHE_MAX = 500
const imageCache = new Map<string, CacheEntry>()

function pruneCache() {
  if (imageCache.size >= CACHE_MAX) {
    // 删除最早写入的条目（Map 按插入顺序迭代）
    const firstKey = imageCache.keys().next().value
    if (firstKey) imageCache.delete(firstKey)
  }
}

// 只允许代理已知的可信图片域名
const ALLOWED_HOSTS = new Set([
  'r2.thesportsdb.com',
  'www.thesportsdb.com',
  'flagcdn.com',
  'ui-avatars.com',
])

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string | undefined

  if (!url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing url parameter' })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid url parameter' })
  }
  if (!ALLOWED_HOSTS.has(parsedUrl.hostname)) {
    throw createError({ statusCode: 403, statusMessage: 'Host not allowed' })
  }

  // 缓存命中 - 直接返回
  const cached = imageCache.get(url)
  if (cached) {
    setResponseHeaders(event, {
      'Content-Type': cached.contentType,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
      'X-Cache': 'HIT',
    })
    return cached.data
  }

  // 缓存未命中 - 拉取上游
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw createError({ statusCode: response.status, statusMessage: 'Upstream error' })
    }
    const contentType = response.headers.get('content-type') || 'image/png'
    const buffer = await response.arrayBuffer()
    const data = new Uint8Array(buffer)

    // 写入缓存
    pruneCache()
    imageCache.set(url, { data, contentType })

    setResponseHeaders(event, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
      'X-Cache': 'MISS',
    })
    return data
  } catch (e: unknown) {
    if ((e as { statusCode?: number }).statusCode) throw e
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch image' })
  }
})
