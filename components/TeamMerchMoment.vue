<script setup lang="ts">
import affiliateProducts from '~/data/affiliate-products.json'
import { AnalyticsEvents } from '~/composables/analyticsEvents'

interface MerchTeam {
  id: string
  name: string
  flag?: string
}

interface AffiliateProduct {
  teamId: string
  partner: string
  productName: string
  productUrl: string
  imgUrl: string
  price: number
  currency: string
}

const props = withDefaults(defineProps<{
  teams: MerchTeam[]
  context?: 'fan-card' | 'prediction' | 'team'
}>(), {
  context: 'team',
})

const { locale, t } = useI18n()
const { track } = useAnalytics()

const productList = computed<AffiliateProduct[]>(() => {
  return ((affiliateProducts as unknown as any[]) || []).filter((p) => {
    return typeof p?.teamId === 'string'
      && p.teamId.length > 0
      && typeof p.productUrl === 'string'
      && p.productUrl.length > 0
  }) as AffiliateProduct[]
})

const genericProducts = computed(() => productList.value.filter(p => p.teamId === 'generic'))

const offers = computed(() => {
  return props.teams
    .filter(team => team.id && team.name)
    .map((team, index) => {
      const product = productList.value.find(p => p.teamId === team.id) || genericProducts.value[index % Math.max(genericProducts.value.length, 1)]
      return product ? { team, product } : null
    })
    .filter(Boolean) as Array<{ team: MerchTeam; product: AffiliateProduct }>
})

const copy = computed(() => {
  const isZh = locale.value === 'zh'
  const isEs = locale.value === 'es'

  if (props.context === 'fan-card') {
    return {
      title: isZh ? '把这张身份卡配上主队装备' : isEs ? 'Completa tu tarjeta con colores del equipo' : 'Complete the fan moment with team gear',
      subtitle: isZh ? '刚生成球迷身份卡时，是最适合支持主队的时刻。' : isEs ? 'El mejor momento para apoyar a tu equipo es justo después de crear tu tarjeta.' : 'Right after creating a fan card is the natural moment to back your team.',
    }
  }

  if (props.context === 'prediction') {
    return {
      title: isZh ? '为这场对决准备支持装备' : isEs ? 'Prepara tu equipo para este partido' : 'Gear up for this matchup',
      subtitle: isZh ? '预测完成后，选择你真正想支持的一方。' : isEs ? 'Después de predecir, elige el lado que quieres apoyar.' : 'After making a prediction, choose the side you actually want to back.',
    }
  }

  return {
    title: isZh ? '官方球衣与球迷装备' : isEs ? 'Camisetas y accesorios del equipo' : 'Official jerseys and fan gear',
    subtitle: isZh ? '适合收藏、观赛日穿搭或送给同队球迷。' : isEs ? 'Para coleccionar, ver partidos o regalar a otros fans.' : 'For match day, collections, or gifts for fellow fans.',
  }
})

function buildTrackUrl(product: AffiliateProduct): string {
  const params = new URLSearchParams({
    teamId: product.teamId,
    partner: product.partner,
    productName: product.productName,
  })
  return `/api/track-affiliate?${params.toString()}`
}

function handleClick(product: AffiliateProduct, team: MerchTeam): void {
  track(AnalyticsEvents.AFFILIATE_CLICK, {
    team_id: team.id,
    resolved_team_id: product.teamId,
    partner: product.partner,
    product_name: product.productName,
    placement: props.context,
    currency: product.currency,
    price: product.price,
  })
}
</script>

<template>
  <section v-if="offers.length > 0" class="merch-moment" :class="`merch-moment--${context}`">
    <div class="merch-moment__header">
      <div>
        <div class="merch-moment__eyebrow">{{ t('affiliate.sponsored') }}</div>
        <h3 class="merch-moment__title">{{ copy.title }}</h3>
        <p class="merch-moment__subtitle">{{ copy.subtitle }}</p>
      </div>
    </div>

    <div class="merch-moment__grid">
      <a
        v-for="{ team, product } in offers"
        :key="`${context}-${team.id}-${product.productName}`"
        :href="buildTrackUrl(product)"
        target="_blank"
        rel="nofollow sponsored noopener"
        class="merch-offer"
        @click="handleClick(product, team)"
      >
        <div class="merch-offer__media">
          <img
            v-if="team.flag"
            :src="team.flag"
            :alt="team.name"
            class="merch-offer__flag"
            loading="lazy"
            decoding="async"
          />
          <img
            :src="product.imgUrl"
            :alt="product.productName"
            class="merch-offer__product"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div class="merch-offer__body">
          <div class="merch-offer__team">{{ team.name }}</div>
          <div class="merch-offer__name">{{ product.productName }}</div>
          <span class="merch-offer__cta">{{ t('affiliate.viewProduct') }}</span>
        </div>
      </a>
    </div>

    <p class="merch-moment__disclosure">
      {{ t('affiliate.disclosure') }}<br />
      As an Amazon Associate I earn from qualifying purchases.
    </p>
  </section>
</template>

<style scoped>
.merch-moment {
  width: 100%;
  max-width: 760px;
  margin: 0 auto 40px;
  padding: 20px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(0, 15, 73, 0.10);
  box-shadow: 0 12px 32px rgba(0, 15, 73, 0.10);
}

.merch-moment--fan-card {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.merch-moment__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.merch-moment__eyebrow {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #fff4bf;
  color: #000f49;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.merch-moment__title {
  margin-top: 10px;
  font-family: 'Montserrat', sans-serif;
  font-size: 20px;
  line-height: 1.25;
  font-weight: 800;
  color: #000f49;
}

.merch-moment--fan-card .merch-moment__title {
  color: #fff;
}

.merch-moment__subtitle {
  margin-top: 6px;
  color: #5f6675;
  font-size: 14px;
  line-height: 1.5;
}

.merch-moment--fan-card .merch-moment__subtitle {
  color: rgba(255, 255, 255, 0.72);
}

.merch-moment__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.merch-offer {
  display: grid;
  grid-template-columns: 86px 1fr;
  gap: 12px;
  min-height: 112px;
  padding: 12px;
  border-radius: 14px;
  background: #f8fafc;
  color: inherit;
  text-decoration: none;
  border: 1px solid #edf1f7;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.merch-moment--fan-card .merch-offer {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.14);
}

.merch-offer:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 215, 0, 0.65);
  box-shadow: 0 10px 22px rgba(0, 15, 73, 0.10);
}

.merch-offer__media {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  padding: 10px;
}

.merch-offer__flag {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 28px;
  height: 20px;
  object-fit: cover;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
}

.merch-offer__product {
  width: 100%;
  height: 100%;
  max-height: 72px;
  object-fit: contain;
}

.merch-offer__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.merch-offer__team {
  font-size: 12px;
  font-weight: 800;
  color: #000f49;
}

.merch-moment--fan-card .merch-offer__team {
  color: #ffd700;
}

.merch-offer__name {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.35;
  color: #374151;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.merch-moment--fan-card .merch-offer__name {
  color: rgba(255, 255, 255, 0.82);
}

.merch-offer__cta {
  margin-top: auto;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: #000f49;
  color: #ffd700;
  font-size: 12px;
  font-weight: 800;
}

.merch-moment__disclosure {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed rgba(148, 163, 184, 0.45);
  font-size: 11px;
  line-height: 1.5;
  color: #7a8291;
}

.merch-moment--fan-card .merch-moment__disclosure {
  color: rgba(255, 255, 255, 0.48);
}

@media (max-width: 520px) {
  .merch-moment {
    padding: 16px;
    border-radius: 14px;
  }

  .merch-offer {
    grid-template-columns: 72px 1fr;
    min-height: 100px;
  }
}
</style>
