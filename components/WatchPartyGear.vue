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

const { locale, t } = useI18n()
const { track } = useAnalytics()

const products = computed<AffiliateProduct[]>(() => {
  const list = (affiliateProducts as unknown as any[]) || []
  return list.filter((p) => {
    return p?.teamId === 'global'
      && typeof p.productUrl === 'string'
      && p.productUrl.length > 0
  }) as AffiliateProduct[]
})


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
}
</script>

<template>
  <section v-if="products.length > 0" class="watch-party-gear">
    <div class="bg-white rounded-xl p-6" style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h3 class="font-bold flex items-center gap-2" style="font-family: 'Montserrat', sans-serif; font-size: 18px; color: #000F49;">
            <span style="font-size: 22px;">📺</span>
            Watch Party Essentials
          </h3>
          <p class="text-sm mt-1" style="color: #666;">Level up your game day experience</p>
        </div>
        <span class="badge badge-warning badge-sm font-semibold uppercase tracking-wider px-2 py-3">
          Sponsored
        </span>
      </div>

      <!-- Products grid -->
      <div class="gear-grid">
        <a
          v-for="(p, idx) in products"
          :key="`global-${idx}-${p.productName}`"
          :href="buildTrackUrl(p)"
          target="_blank"
          rel="nofollow sponsored noopener"
          class="gear-card group block"
          @click="handleClick(p)"
        >
          <div class="gear-card__inner">
            <!-- Image -->
            <div class="gear-card__img-wrap">
              <img
                :src="p.imgUrl"
                :alt="p.productName"
                class="gear-card__img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <!-- Body -->
            <div class="gear-card__body">
              <div class="gear-card__partner">{{ p.partner }}</div>
              <div class="gear-card__name" :title="p.productName">{{ p.productName }}</div>
              <div class="gear-card__footer">
                <span class="btn btn-primary btn-sm gear-card__btn w-full">
                  View →
                </span>
              </div>
            </div>
          </div>
        </a>
      </div>

      <!-- Disclosure (Amazon Mandatory) -->
      <p class="gear-disclosure">
        {{ t('affiliate.disclosure') }} <br />
        As an Amazon Associate I earn from qualifying purchases.
      </p>
    </div>
  </section>
</template>

<style scoped>
.watch-party-gear {
  width: 100%;
}

.gear-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .gear-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .gear-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.gear-card {
  text-decoration: none;
  color: inherit;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  background: #fff;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  display: block;
}

.gear-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 15, 73, 0.10);
  border-color: #e0e6f2;
}

.gear-card__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.gear-card__img-wrap {
  position: relative;
  aspect-ratio: 1 / 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f5f5f5;
  padding: 12px;
}

.gear-card__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.gear-card__body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.gear-card__partner {
  font-size: 11px;
  font-weight: 700;
  color: #888;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.gear-card__name {
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

.gear-card__footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
}


.gear-card__btn {
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

.gear-card__btn:hover {
  background: #1A237E;
  border-color: #1A237E;
}

.gear-card__badge {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 4px 8px;
}

.gear-disclosure {
  margin-top: 18px;
  font-size: 11px;
  line-height: 1.55;
  color: #999;
  border-top: 1px dashed #eee;
  padding-top: 12px;
}
</style>
