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
  variant?: 'panel' | 'rail'
  maxItems?: number
  placement?: string
  eyebrow?: string
  title?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'panel',
  maxItems: 3,
  placement: 'watch_party_gear',
  eyebrow: '',
  title: 'Watch Party Essentials',
  subtitle: 'Level up your game day experience',
})

const { t } = useI18n()
const { track } = useAnalytics()

const products = computed<AffiliateProduct[]>(() => {
  const list = (affiliateProducts as unknown as any[]) || []
  return list.filter((p) => {
    return p?.teamId === 'global'
      && typeof p.productUrl === 'string'
      && p.productUrl.length > 0
  }) as AffiliateProduct[]
})

const visibleProducts = computed(() => products.value.slice(0, props.maxItems))

function buildTrackUrl(p: AffiliateProduct): string {
  const params = new URLSearchParams({
    teamId: p.teamId,
    partner: p.partner,
    productName: p.productName,
    placement: props.placement,
  })
  return `/api/track-affiliate?${params.toString()}`
}

function handleClick(p: AffiliateProduct): void {
  track(AnalyticsEvents.AFFILIATE_CLICK, {
    team_id: p.teamId,
    partner: p.partner,
    product_name: p.productName,
    placement: props.placement,
    currency: p.currency,
    price: p.price,
  })
}
</script>

<template>
  <section v-if="visibleProducts.length > 0" class="watch-party-gear">
    <div
      class="gear-shell"
      :class="props.variant === 'rail' ? 'gear-shell--rail' : 'gear-shell--panel'"
    >
      <div class="gear-header">
        <div class="gear-header__copy">
          <p v-if="props.eyebrow || props.variant === 'rail'" class="gear-header__eyebrow">{{ props.eyebrow || 'Matchday picks' }}</p>
          <h3 class="gear-header__title">{{ props.title }}</h3>
          <p v-if="props.subtitle" class="gear-header__subtitle">{{ props.subtitle }}</p>
        </div>
        <span class="gear-badge">Sponsored</span>
      </div>

      <div class="gear-grid" :class="props.variant === 'rail' ? 'gear-grid--rail' : 'gear-grid--panel'">
        <a
          v-for="(p, idx) in visibleProducts"
          :key="`global-${idx}-${p.productName}`"
          :href="buildTrackUrl(p)"
          target="_blank"
          rel="nofollow sponsored noopener"
          class="gear-card"
          :class="props.variant === 'rail' ? 'gear-card--rail' : 'gear-card--panel'"
          @click="handleClick(p)"
        >
          <div class="gear-card__inner">
            <div class="gear-card__img-wrap">
              <img
                :src="p.imgUrl"
                :alt="p.productName"
                class="gear-card__img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div class="gear-card__body">
              <div class="gear-card__partner">{{ p.partner }}</div>
              <div class="gear-card__name" :title="p.productName">{{ p.productName }}</div>
              <div class="gear-card__footer">
                <span class="gear-card__btn">View</span>
              </div>
            </div>
          </div>
        </a>
      </div>

      <p class="gear-disclosure" :class="props.variant === 'rail' ? 'gear-disclosure--rail' : ''">
        {{ t('affiliate.disclosure') }}<br>
        As an Amazon Associate I earn from qualifying purchases.
      </p>
    </div>
  </section>
</template>

<style scoped>
.watch-party-gear {
  width: 100%;
}

.gear-shell {
  border: 1px solid #e8edf5;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(0, 15, 73, 0.05);
}

.gear-shell--panel {
  padding: 24px;
}

.gear-shell--rail {
  padding: 18px 18px 14px;
}

.gear-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.gear-header__copy {
  min-width: 0;
}

.gear-header__eyebrow {
  margin: 0 0 4px;
  color: #4a5578;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.gear-header__title {
  margin: 0;
  color: #000f49;
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 800;
}

.gear-header__subtitle {
  margin: 6px 0 0;
  color: #667085;
  font-size: 13px;
}

.gear-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #fff3b0;
  color: #000f49;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  white-space: nowrap;
}

.gear-grid {
  display: grid;
  gap: 16px;
}

.gear-grid--panel {
  grid-template-columns: 1fr;
}

.gear-grid--rail {
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .gear-grid--panel,
  .gear-grid--rail {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .gear-grid--panel,
  .gear-grid--rail {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.gear-card {
  text-decoration: none;
  color: inherit;
  border: 1px solid #edf1f7;
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.gear-card:hover {
  transform: translateY(-2px);
  border-color: #d7dfef;
  box-shadow: 0 10px 24px rgba(0, 15, 73, 0.08);
}

.gear-card__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.gear-card__img-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  padding: 12px;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef3fb 100%);
  border-bottom: 1px solid #f1f4f9;
}

.gear-card--rail .gear-card__inner {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.gear-card--rail .gear-card__img-wrap {
  aspect-ratio: auto;
  height: 88px;
  padding: 10px;
  border-right: 1px solid #f1f4f9;
  border-bottom: none;
}

.gear-card__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.gear-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px 14px;
}

.gear-card--rail .gear-card__body {
  padding: 12px 12px 12px 0;
}

.gear-card__partner {
  color: #7f8797;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.gear-card__name {
  min-height: 38px;
  overflow: hidden;
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.gear-card--rail .gear-card__name {
  min-height: 0;
}

.gear-card__footer {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: auto;
  padding-top: 8px;
}

.gear-card__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  min-height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  background: #000f49;
  color: #ffd700;
  font-size: 12px;
  font-weight: 800;
}

.gear-disclosure {
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px dashed #e7ebf3;
  color: #8a93a6;
  font-size: 11px;
  line-height: 1.55;
}

.gear-disclosure--rail {
  margin-top: 12px;
  padding-top: 10px;
}

@media (max-width: 639px) {
  .gear-shell--panel {
    padding: 18px;
  }

  .gear-shell--rail {
    padding: 16px 14px 12px;
  }

  .gear-card--rail .gear-card__inner {
    grid-template-columns: 76px minmax(0, 1fr);
    gap: 10px;
  }

  .gear-card--rail .gear-card__img-wrap {
    height: 76px;
  }
}
</style>
