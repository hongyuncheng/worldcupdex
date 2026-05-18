<template>
  <div>
    <!-- Hero Section -->
    <section
      class="relative overflow-hidden"
      style="background: linear-gradient(110deg, #000F49 0%, #1A237E 35%, #2E1A6B 65%, #4A148C 100%); height: 360px;"
    >
      <!-- Right-side glow halo -->
      <div
        class="absolute pointer-events-none"
        style="top: 50%; right: -120px; width: 900px; height: 600px; transform: translateY(-50%); background: radial-gradient(ellipse at center, rgba(124, 58, 237, 0.55) 0%, rgba(124, 58, 237, 0.25) 35%, transparent 65%);"
      ></div>
      <!-- Light rays effect -->
      <div
        class="absolute pointer-events-none hidden md:block"
        style="top: 50%; right: 5%; width: 720px; height: 320px; transform: translateY(-50%); background: radial-gradient(ellipse at right, rgba(96, 165, 250, 0.45) 0%, transparent 60%); filter: blur(8px);"
      ></div>

      <!-- Trophy graphic on right (SVG) -->
      <div
        class="absolute hidden md:flex items-center justify-center pointer-events-none"
        style="top: 0; bottom: 0; right: 4%; width: 420px;"
      >
        <svg viewBox="0 0 200 240" style="width: 100%; height: 90%; filter: drop-shadow(0 12px 40px rgba(255, 200, 50, 0.45));" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="trophyGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#FFE082"/>
              <stop offset="0.45" stop-color="#FFC107"/>
              <stop offset="0.75" stop-color="#F57C00"/>
              <stop offset="1" stop-color="#BF360C"/>
            </linearGradient>
            <linearGradient id="trophyHi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#FFFDE7" stop-opacity="0.9"/>
              <stop offset="1" stop-color="#FFFDE7" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="trophyBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#FFC107"/>
              <stop offset="1" stop-color="#5D4037"/>
            </linearGradient>
          </defs>
          <!-- Trophy body (rounded shape resembling World Cup trophy) -->
          <path d="M100 18 C 78 18, 70 30, 72 50 C 60 50, 50 60, 55 80 C 60 100, 75 110, 90 115 L 90 145 C 90 155, 85 160, 80 162 L 80 175 L 120 175 L 120 162 C 115 160, 110 155, 110 145 L 110 115 C 125 110, 140 100, 145 80 C 150 60, 140 50, 128 50 C 130 30, 122 18, 100 18 Z" fill="url(#trophyGold)"/>
          <!-- Highlight strip -->
          <path d="M82 30 C 78 50, 78 90, 88 110" stroke="url(#trophyHi)" stroke-width="6" stroke-linecap="round" fill="none"/>
          <!-- Base layers -->
          <rect x="66" y="175" width="68" height="14" rx="3" fill="url(#trophyBase)"/>
          <rect x="58" y="189" width="84" height="18" rx="3" fill="#3E2723"/>
          <rect x="52" y="207" width="96" height="16" rx="3" fill="#5D4037"/>
          <!-- Shine spark -->
          <circle cx="155" cy="55" r="3" fill="#FFFDE7" opacity="0.9"/>
          <circle cx="165" cy="45" r="2" fill="#FFFDE7" opacity="0.7"/>
          <circle cx="40" cy="100" r="2" fill="#FFFDE7" opacity="0.6"/>
        </svg>
      </div>

      <!-- Hero content -->
      <div class="max-w-7xl mx-auto px-4 lg:px-8 h-full flex flex-col justify-center relative z-10">
        <h1
          class="font-extrabold text-white mb-3"
          style="font-family: 'Montserrat', sans-serif; font-size: 56px; letter-spacing: 2px; text-shadow: 0 2px 12px rgba(0,0,0,0.35); line-height: 1.1;"
        >
          {{ $t('wiki.title') }}
        </h1>
        <p
          class="text-white/85 mb-7"
          style="font-size: 15px; max-width: 460px;"
        >
          {{ $t('wiki.subtitle') }}
        </p>

        <!-- Search bar -->
        <form
          class="flex items-center gap-3"
          style="max-width: 420px;"
          @submit.prevent="onSearch"
        >
          <div class="relative flex-1">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('wiki.searchPlaceholder')"
              class="w-full pl-4 pr-4 rounded-lg outline-none text-sm"
              style="background: rgba(255,255,255,0.97); color: #333; border: 1px solid rgba(255,255,255,0.4); height: 44px;"
            />
          </div>
          <button
            type="submit"
            class="flex items-center justify-center rounded-lg transition-all hover:opacity-90"
            style="width: 52px; height: 44px; background: #2962FF; box-shadow: 0 4px 12px rgba(41,98,255,0.35);"
            :aria-label="$t('common.search')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>
    </section>

    <!-- Main content -->
    <div class="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <!-- Category Tabs -->
      <div
        class="bg-white rounded-xl px-5 py-4 mb-6 flex flex-wrap items-center gap-2"
        style="box-shadow: 0 2px 8px rgba(0,0,0,0.04);"
      >
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
          :style="selectedCategory === cat.value
            ? 'background: #1A237E; color: white; box-shadow: 0 4px 12px rgba(26,35,126,0.25);'
            : 'background: transparent; color: #555;'"
          @click="selectedCategory = cat.value; currentPage = 1"
        >
          {{ $t(cat.label) }}
        </button>
      </div>

      <!-- Content grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Cards (spans 2 cols) -->
        <div class="lg:col-span-2">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <article
              v-for="card in paginatedCards"
              :key="card.id"
              class="bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);"
            >
             <div
                class="relative w-full overflow-hidden flex items-center justify-center"
                :style="`aspect-ratio: 16/11; background: ${card.gradient};`"
              >
                <!-- Decorative pattern -->
                <div
                  class="absolute inset-0 pointer-events-none"
                  style="background-image: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.12), transparent 45%);"
                ></div>
                <span
                  class="relative z-10 transition-transform duration-300 group-hover:scale-110"
                  style="font-size: 80px; filter: drop-shadow(0 6px 16px rgba(0,0,0,0.25));"
                >{{ card.emoji }}</span>
                <!-- Bottom gradient overlay -->
                <div
                  class="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                  style="background: linear-gradient(to top, rgba(0,0,0,0.25), transparent);"
                ></div>
              </div>
              <div class="p-4">
                <h3
                  class="font-bold mb-2"
                  style="font-family: 'Montserrat', sans-serif; font-size: 17px; color: #000F49;"
                >
                  {{ $t(card.titleKey) }}
                </h3>
                <p
                  class="mb-3"
                  style="font-size: 13px; color: #666; line-height: 1.5; min-height: 38px;"
                >
                  {{ $t(card.descKey) }}
                </p>
                <div class="flex items-center gap-1.5" style="color: #999; font-size: 12px;">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{{ $t('wiki.articleCount', { count: card.articleCount }) }}</span>
                </div>
              </div>
            </article>
          </div>

          <!-- No results -->
          <div v-if="filteredCards.length === 0" class="text-center py-16">
            <p style="color: #999; font-size: 16px;">{{ $t('common.noResults') }}</p>
          </div>

          <!-- Pagination -->
          <div
            v-if="totalPages > 1"
            class="bg-white rounded-xl mt-8 py-4 flex justify-center items-center gap-1.5"
            style="box-shadow: 0 2px 8px rgba(0,0,0,0.04);"
          >
            <button
              v-for="item in paginationItems"
              :key="item.key"
              :disabled="item.disabled"
              class="min-w-[36px] h-9 px-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              :class="item.disabled ? 'cursor-default' : 'cursor-pointer'"
              :style="item.active
                ? 'background: #1A237E; color: white; border: 1px solid #1A237E;'
                : item.disabled
                  ? 'background: transparent; color: #999; border: none;'
                  : 'background: white; color: #555; border: 1px solid #E2E8F0;'"
              @click="!item.disabled && (currentPage = item.page)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <!-- Right Sidebar -->
        <aside class="lg:col-span-1 flex flex-col gap-5">
          <!-- Hot Articles -->
          <div
            class="bg-white rounded-xl p-5"
            style="box-shadow: 0 2px 8px rgba(0,0,0,0.04);"
          >
            <h3
              class="font-bold mb-4"
              style="font-family: 'Montserrat', sans-serif; font-size: 16px; color: #000F49;"
            >
              {{ $t('wiki.hotArticles') }}
            </h3>
            <ul class="flex flex-col gap-3">
              <li
                v-for="(item, index) in hotArticles"
                :key="item.titleKey"
                class="flex items-start gap-3 cursor-pointer group"
              >
                <span
                  class="flex-shrink-0 inline-flex items-center justify-center font-bold text-white rounded"
                  :style="`width: 24px; height: 24px; font-size: 13px; background: ${rankColors[index]};`"
                >
                  {{ index + 1 }}
                </span>
                <div class="flex-1 min-w-0">
                  <p
                    class="font-medium mb-0.5 truncate group-hover:text-[#1A237E] transition-colors"
                    style="font-size: 14px; color: #333;"
                  >
                    {{ $t(item.titleKey) }}
                  </p>
                  <p style="font-size: 12px; color: #999;">
                    {{ $t('wiki.views', { count: item.views }) }}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Knowledge Tip -->
          <div
            class="relative bg-white rounded-xl p-5 overflow-hidden"
            style="box-shadow: 0 2px 8px rgba(0,0,0,0.04);"
          >
            <span
              class="absolute right-2 bottom-2 pointer-events-none select-none"
              style="font-size: 80px; opacity: 0.06;"
            >⚽</span>
            <h3
              class="font-bold mb-3 flex items-center gap-2 relative z-10"
              style="font-family: 'Montserrat', sans-serif; font-size: 16px; color: #000F49;"
            >
              <span>💡</span>
              <span>{{ $t('wiki.tipsTitle') }}</span>
            </h3>
            <p class="relative z-10" style="font-size: 13px; color: #555; line-height: 1.6;">
              {{ $t('wiki.tipsContent') }}
            </p>
          </div>

          <!-- Tag Cloud -->
          <div
            class="bg-white rounded-xl p-5"
            style="box-shadow: 0 2px 8px rgba(0,0,0,0.04);"
          >
            <h3
              class="font-bold mb-4"
              style="font-family: 'Montserrat', sans-serif; font-size: 16px; color: #000F49;"
            >
              {{ $t('wiki.tagCloud') }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tag in tagCloud"
                :key="tag"
                class="px-3 py-1.5 rounded text-xs font-medium transition-all hover:bg-[#1A237E] hover:text-white cursor-pointer"
                style="background: #F0F2F5; color: #555;"
              >
                {{ $t(tag) }}
              </button>
              <span
                class="px-3 py-1.5 rounded text-xs font-medium"
                style="background: #F0F2F5; color: #999;"
              >...</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface WikiCard {
  id: string
  category: string
  titleKey: string
  descKey: string
  emoji: string
  gradient: string
  articleCount: number
}

const categories = [
  { value: 'all', label: 'wiki.catAll' },
  { value: 'history', label: 'wiki.catHistory' },
  { value: 'rules', label: 'wiki.catRules' },
  { value: 'events', label: 'wiki.catEvents' },
  { value: 'culture', label: 'wiki.catCulture' },
  { value: 'players', label: 'wiki.catPlayers' },
  { value: 'terms', label: 'wiki.catTerms' },
]

// Use inline gradient + emoji for stable, network-independent visuals
const cardsData: WikiCard[] = [
  {
    id: 'history',
    category: 'history',
    titleKey: 'wiki.cardHistoryTitle',
    descKey: 'wiki.cardHistoryDesc',
    emoji: '🏆',
    gradient: 'linear-gradient(135deg, #1A237E 0%, #4527A0 60%, #6A1B9A 100%)',
    articleCount: 28,
  },
  {
    id: 'rules',
    category: 'rules',
    titleKey: 'wiki.cardRulesTitle',
    descKey: 'wiki.cardRulesDesc',
    emoji: '🟨',
    gradient: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #43A047 100%)',
    articleCount: 18,
  },
  {
    id: 'events',
    category: 'events',
    titleKey: 'wiki.cardEventsTitle',
    descKey: 'wiki.cardEventsDesc',
    emoji: '⚽',
    gradient: 'linear-gradient(135deg, #0D47A1 0%, #1976D2 50%, #1E88E5 100%)',
    articleCount: 15,
  },
  {
    id: 'culture',
    category: 'culture',
    titleKey: 'wiki.cardCultureTitle',
    descKey: 'wiki.cardCultureDesc',
    emoji: '🎉',
    gradient: 'linear-gradient(135deg, #B71C1C 0%, #C62828 50%, #E53935 100%)',
    articleCount: 42,
  },
  {
    id: 'players',
    category: 'players',
    titleKey: 'wiki.cardPlayersTitle',
    descKey: 'wiki.cardPlayersDesc',
    emoji: '⭐',
    gradient: 'linear-gradient(135deg, #E65100 0%, #F57C00 50%, #FB8C00 100%)',
    articleCount: 56,
  },
  {
    id: 'terms',
    category: 'terms',
    titleKey: 'wiki.cardTermsTitle',
    descKey: 'wiki.cardTermsDesc',
    emoji: '📖',
    gradient: 'linear-gradient(135deg, #006064 0%, #00838F 50%, #00ACC1 100%)',
    articleCount: 73,
  },
]

// Duplicate cards for pagination demo
const allCards: WikiCard[] = Array.from({ length: 60 }, (_, i) => {
  const base = cardsData[i % cardsData.length]
  return { ...base, id: `${base.id}-${i}` }
})

const hotArticles = [
  { titleKey: 'wiki.hotArticle1', views: '12.5k' },
  { titleKey: 'wiki.hotArticle2', views: '9.8k' },
  { titleKey: 'wiki.hotArticle3', views: '8.7k' },
  { titleKey: 'wiki.hotArticle4', views: '6.3k' },
  { titleKey: 'wiki.hotArticle5', views: '5.9k' },
]

const rankColors = ['#E53935', '#FB8C00', '#FDD835', '#9E9E9E', '#9E9E9E']

const tagCloud = [
  'wiki.tagWorldCup',
  'wiki.tagRules',
  'wiki.tagTactics',
  'wiki.tagSkills',
  'wiki.tagHistory',
  'wiki.tagCulture',
  'wiki.tagTraining',
  'wiki.tagPopular',
]

// State
const selectedCategory = ref<string>('all')
const searchQuery = ref('')
const currentPage = ref(1)
const perPage = 6

const filteredCards = computed(() => {
  let result = [...allCards]
  if (selectedCategory.value !== 'all') {
    result = result.filter(c => c.category === selectedCategory.value)
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    result = result.filter(c =>
      t(c.titleKey).toLowerCase().includes(q) ||
      t(c.descKey).toLowerCase().includes(q)
    )
  }
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredCards.value.length / perPage)))

const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredCards.value.slice(start, start + perPage)
})

const paginationItems = computed(() => {
  const items: { key: string; label: string; page: number; active: boolean; disabled: boolean }[] = []
  const total = totalPages.value
  const current = currentPage.value

  items.push({ key: 'prev', label: '‹', page: Math.max(1, current - 1), active: false, disabled: current === 1 })

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      items.push({ key: `p${i}`, label: String(i), page: i, active: i === current, disabled: false })
    }
  } else {
    items.push({ key: 'p1', label: '1', page: 1, active: current === 1, disabled: false })
    if (current > 4) {
      items.push({ key: 'dots1', label: '...', page: 0, active: false, disabled: true })
    }
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) {
      items.push({ key: `p${i}`, label: String(i), page: i, active: i === current, disabled: false })
    }
    if (current < total - 3) {
      items.push({ key: 'dots2', label: '...', page: 0, active: false, disabled: true })
    }
    items.push({ key: `p${total}`, label: String(total), page: total, active: current === total, disabled: false })
  }

  items.push({ key: 'next', label: '›', page: Math.min(total, current + 1), active: false, disabled: current === total })
  return items
})

function onSearch() {
  currentPage.value = 1
}

useSeoConfig({
  title: `${t('wiki.title')} - WorldCupDex`,
  description: t('wiki.subtitle'),
})
</script>
