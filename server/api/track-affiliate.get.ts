import affiliateProducts from '~/data/affiliate-products.json'

interface AffiliateProduct {
  teamId: string
  partner: string
  productName: string
  productUrl: string
  imgUrl: string
  price: number
  currency: string
}

const products: AffiliateProduct[] = (affiliateProducts as unknown as Array<Partial<AffiliateProduct>>)
  .filter((p): p is AffiliateProduct => {
    return typeof p?.teamId === 'string'
      && p.teamId.length > 0
      && typeof p.productUrl === 'string'
      && p.productUrl.length > 0
  })

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const teamId = String(query.teamId || '')
  const partner = String(query.partner || '')
  const productName = String(query.productName || '')

  if (!teamId || !partner || !productName) {
    setResponseStatus(event, 400)
    return 'Missing required query params'
  }

  const product = products.find(
    (p) => p.teamId === teamId
      && p.partner === partner
      && p.productName === productName,
  )

  if (!product) {
    setResponseStatus(event, 404)
    return 'Product not found'
  }

  // CF Worker / Nitro 日志（GA4 已在前端埋点；服务端日志用于风控与对账）
  console.log('[affiliate-click]', {
    teamId: product.teamId,
    partner: product.partner,
    productName: product.productName,
    ts: Date.now(),
  })

  return sendRedirect(event, product.productUrl, 302)
})
