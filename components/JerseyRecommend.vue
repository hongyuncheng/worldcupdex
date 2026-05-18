<script setup lang="ts">
import affiliateProducts from '~/data/affiliate-products.json'
import { AnalyticsEvents } from '~/composables/analyticsEvents'

interface AffiliateProduct {
  teamId: string
  partner: string
  productName: string
  productUrl: string
  imgUrl: string
  price: number
  currency: string
}

interface Props {
  teamId: string
}

const props = defineProps<Props>()

const { locale, t } = useI18n()
const { track } = useAnalytics()

const products = computed<AffiliateProduct[]>(() => {
  const list = (affiliateProducts as unknown as Array<Partial<AffiliateProduct> & Record<string, unknown>>) || []
  return list
    .filter((p): p is AffiliateProduct => {
      return typeof p?.teamId === 'string'
        && p.teamId.length > 0
        && p.teamId === props.teamId
        && typeof p.productUrl === 'string'
        && p.productUrl.length > 0
    })
})

function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat(locale.value, { style: 'currency', currency }).format(price)
  } catch {
    return `${currency} ${price.toFixed(2)}`
  }
}

function buildTrackUrl(p: AffiliateProduct): string {
  const params = new URLSearchParams({
    teamId: p.teamId,
    partner: p.partner,
    productName: p.productName,
  })
  return `/api/track-affiliate?${params.toString()}`
}

function handleClick(p: AffiliateProduct): void {
  track(AnalyticsEvents.AFFILIATE_CLICK, {
    team_id: p.teamId,
    partner: p.partner,
    product_name: p.productName,
    currency: p.currency,
    price: p.price,
  })
  // 不阻止默认跳转，让 a 标签继续 302 中转
}
</script>

<template>
  <section v-if="products.length > 0" class="jersey-recommend">
    <div class="bg-white rounded-xl p-6 mt-6" style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h3 class="font-bold flex items-center gap-2" style="font-family: 'Montserrat', sans-serif; font-size: 18px; color: #000F49;">
            <span style="font-size: 22px;">👕</span>
            {{ t('affiliate.jerseyTitle') }}
          </h3>
          <p class="text-sm mt-1" style="color: #666;">{{ t('affiliate.jerseySubtitle') }}</p>
        </div>
        <span class="badge badge-warning badge-sm font-semibold uppercase tracking-wider">
          {{ t('affiliate.sponsored') }}
        </span>
      </div>

      <!-- Products grid -->
      <div class="jersey-grid">
        <a
          v-for="(p, idx) in products"
          :key="`${p.teamId}-${idx}-${p.productName}`"
          :href="buildTrackUrl(p)"
          target="_blank"
          rel="nofollow sponsored noopener"
          class="jersey-card group block"
          @click="handleClick(p)"
        >
          <div class="jersey-card__inner">
            <!-- Image -->
            <div class="jersey-card__img-wrap">
              <img
                :src="p.imgUrl"
                :alt="p.productName"
                class="jersey-card__img"
                loading="lazy"
                decoding="async"
              />
              <span class="jersey-card__badge badge badge-warning badge-sm">
                {{ t('affiliate.sponsored') }}
              </span>
            </div>
            <!-- Body -->
            <div class="jersey-card__body">
              <div class="jersey-card__partner">{{ p.partner }}</div>
              <div class="jersey-card__name" :title="p.productName">{{ p.productName }}</div>
              <div class="jersey-card__footer">
                <span class="jersey-card__price">{{ formatPrice(p.price, p.currency) }}</span>
                <span class="btn btn-primary btn-sm jersey-card__btn">
                  {{ t('affiliate.viewProduct') }} →
                </span>
              </div>
            </div>
          </div>
        </a>
      </div>

      <!-- Disclosure -->
      <p class="jersey-disclosure">
        {{ t('affiliate.disclosure') }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.jersey-recommend {
  width: 100%;
}

.jersey-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .jersey-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .jersey-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.jersey-card {
  text-decoration: none;
  color: inherit;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  background: #fff;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  display: block;
}

.jersey-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 15, 73, 0.10);
  border-color: #e0e6f2;
}

.jersey-card__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.jersey-card__img-wrap {
  position: relative;
  aspect-ratio: 1 / 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f5f5f5;
  padding: 12px;
}

.jersey-card__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.jersey-card__badge {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.jersey-card__body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.jersey-card__partner {
  font-size: 11px;
  font-weight: 700;
  color: #888;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.jersey-card__name {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 38px;
}

.jersey-card__footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
}

.jersey-card__price {
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #000F49;
}

.jersey-card__btn {
  border-radius: 999px;
  background: #000F49;
  border-color: #000F49;
  color: #FFD700;
  font-weight: 700;
  font-size: 12px;
  min-height: 30px;
  height: 30px;
  padding: 0 12px;
}

.jersey-card__btn:hover {
  background: #1A237E;
  border-color: #1A237E;
}

.jersey-disclosure {
  margin-top: 18px;
  font-size: 11px;
  line-height: 1.55;
  color: #999;
  border-top: 1px dashed #eee;
  padding-top: 12px;
}
</style>
