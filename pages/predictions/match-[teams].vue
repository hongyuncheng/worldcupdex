<template>
  <div class="prediction-landing-page">
    <div v-if="match" class="container mx-auto px-4 py-8">
      <header class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          {{ match.homeTeam.nameEn }} vs {{ match.awayTeam.nameEn }} World Cup 2026 Predictions
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          Get the latest predictions, odds, and picks for the highly anticipated clash between {{ match.homeTeam.nameEn }} and {{ match.awayTeam.nameEn }}.
        </p>
      </header>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-12 max-w-4xl mx-auto">
        <div class="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <!-- Home Team -->
          <div class="flex flex-col items-center flex-1">
            <img :src="match.homeTeam.flag" :alt="match.homeTeam.nameEn" class="w-24 h-auto shadow-md mb-4" />
            <h2 class="text-2xl font-bold">{{ match.homeTeam.nameEn }}</h2>
          </div>
          
          <!-- VS -->
          <div class="text-4xl font-black text-gray-400">VS</div>
          
          <!-- Away Team -->
          <div class="flex flex-col items-center flex-1">
            <img :src="match.awayTeam.flag" :alt="match.awayTeam.nameEn" class="w-24 h-auto shadow-md mb-4" />
            <h2 class="text-2xl font-bold">{{ match.awayTeam.nameEn }}</h2>
          </div>
        </div>

        <div class="text-center border-t dark:border-gray-700 pt-8">
          <p class="mb-6 text-lg text-gray-600 dark:text-gray-400">
            Who do you think will win this {{ match.stage === 'GROUP_STAGE' ? 'Group Stage' : 'Knockout' }} match on {{ formatMatchShortDateTime(match, 'en', 'venue') }}?
          </p>
          <NuxtLink :to="`/predict/${match.id}`" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full text-lg transition duration-300 inline-block shadow-md">
            Predict the Winner Now
          </NuxtLink>
        </div>
      </div>
      
      <!-- Schema.org Data -->
      <SchemaOrg v-if="faqSchemaData" type="FAQPage" :data="faqSchemaData" />
    </div>
    <div v-else class="container mx-auto px-4 py-8 text-center">
      <h1 class="text-3xl font-bold mb-4">Match Not Found</h1>
      <p>We couldn't find predictions for this specific match.</p>
      <NuxtLink to="/schedule" class="text-primary-600 hover:underline">View Schedule</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getStaticMatchList } from '~/composables/useStaticWorldCupData'
import { useSeoConfig } from '~/composables/useSeoConfig'

const route = useRoute()

// Extract team slugs from the route parameter.
// Example route: /predictions/match-mexico-vs-south-africa-world-cup-2026
const routeSlug = (route.params.teams as string) || ''

// Try to parse the team IDs
const teamsPart = routeSlug.replace('match-', '').replace('-world-cup-2026', '')
const [homeTeamId, awayTeamId] = teamsPart.split('-vs-')

// Find the match
const match = computed(() => {
  if (!homeTeamId || !awayTeamId) return null
  const allMatches = getStaticMatchList().data
  return allMatches.find(m => 
    (m.homeTeam.id === homeTeamId && m.awayTeam.id === awayTeamId) ||
    (m.homeTeam.id === awayTeamId && m.awayTeam.id === homeTeamId)
  ) || null
})

// Dynamic SEO configuration
if (match.value) {
  const title = `${match.value.homeTeam.nameEn} vs ${match.value.awayTeam.nameEn} World Cup 2026 Predictions`
  useSeoConfig({
    title: `${title} & Odds`,
    description: `Expert predictions, odds, and picks for ${match.value.homeTeam.nameEn} vs ${match.value.awayTeam.nameEn} at the 2026 World Cup. Will ${match.value.homeTeam.nameEn} secure the victory?`,
    ogType: 'article'
  })
}

// Structured Data for FAQ
const faqSchemaData = computed(() => {
  if (!match.value) return null
  return {
    mainEntity: [
      {
        "@type": "Question",
        "name": `When is the ${match.value.homeTeam.nameEn} vs ${match.value.awayTeam.nameEn} match?`,
        "acceptedAnswer": {
          "@type": "Answer",
            "text": `The match between ${match.value.homeTeam.nameEn} and ${match.value.awayTeam.nameEn} is scheduled for ${formatMatchShortDateTime(match.value, 'en', 'venue')}.`
        }
      },
      {
        "@type": "Question",
        "name": `Where is ${match.value.homeTeam.nameEn} vs ${match.value.awayTeam.nameEn} being played?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `This match will take place at ${match.value.venue.name} in ${match.value.venue.city}.`
        }
      }
    ]
  }
})
</script>
