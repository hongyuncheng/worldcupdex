<template>
  <div class="prediction-landing-page">
    <div v-if="team" class="container mx-auto px-4 py-8">
      <header class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          {{ team.nameEn }} World Cup 2026 Predictions
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          Get the latest predictions, odds, and analysis for {{ team.nameEn }} in the 2026 World Cup.
        </p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-2xl font-semibold mb-4">Team Overview</h2>
          <div class="flex items-center space-x-4 mb-4">
            <img :src="team.flag" :alt="`${team.nameEn} flag`" class="w-16 h-auto shadow-sm" />
            <div>
              <p class="text-lg font-medium">{{ team.nameEn }} ({{ team.nameZh }})</p>
              <p class="text-sm text-gray-500">FIFA Rank: {{ team.fifaRank }}</p>
            </div>
          </div>
          <ul class="space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Confederation:</strong> {{ team.confederation }}</li>
            <li><strong>Group:</strong> Group {{ team.group }}</li>
            <li v-if="team.coach"><strong>Coach:</strong> {{ team.coach.nameEn }}</li>
          </ul>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col justify-center items-center text-center">
          <h2 class="text-2xl font-semibold mb-4">Make Your Prediction</h2>
          <p class="mb-6 text-gray-600 dark:text-gray-400">
            Will {{ team.nameEn }} go all the way? Generate your AI-powered prediction card and share it with friends!
          </p>
          <NuxtLink to="/predict" class="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full transition duration-300">
            Create Prediction Card
          </NuxtLink>
        </div>
      </div>
      
      <!-- Schema.org Data -->
      <SchemaOrg v-if="faqSchemaData" type="FAQPage" :data="faqSchemaData" />
    </div>
    <div v-else class="container mx-auto px-4 py-8 text-center">
      <h1 class="text-3xl font-bold mb-4">Team Not Found</h1>
      <p>We couldn't find predictions for this team.</p>
      <NuxtLink to="/teams" class="text-primary-600 hover:underline">View all teams</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getStaticTeamDetail } from '~/composables/useStaticWorldCupData'
import { useSeoConfig } from '~/composables/useSeoConfig'

const route = useRoute()

// Extract team slug from the route parameter.
// Example route: /predictions/usmnt-world-cup-2026
// We assume the route param 'slug' contains 'usmnt-world-cup-2026'
const routeSlug = route.params.slug as string

// Try to extract the actual team ID. This might need refinement based on exact slugs in teams.json.
// For simplicity, let's assume the slug might start with the team ID.
const teamId = routeSlug.replace('-world-cup-2026', '')

const team = computed(() => {
  return getStaticTeamDetail(teamId)
})

// Dynamic SEO configuration
if (team.value) {
  const teamName = team.value.nameEn
  useSeoConfig({
    title: `${teamName} World Cup 2026 Predictions, Odds & Picks`,
    description: `Get the latest ${teamName} World Cup 2026 predictions. Will ${teamName} win it all? Check out our AI predictions, group analysis, and generate your fan card.`,
    ogImage: team.value.flag,
    ogType: 'article'
  })
}

// Structured Data for FAQ to win rich snippets
const faqSchemaData = computed(() => {
  if (!team.value) return null
  return {
    mainEntity: [
      {
        "@type": "Question",
        "name": `Will ${team.value.nameEn} play in the 2026 World Cup?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, ${team.value.nameEn} is participating in the 2026 World Cup. They are placed in Group ${team.value.group}.`
        }
      },
      {
        "@type": "Question",
        "name": `What is ${team.value.nameEn}'s FIFA ranking?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${team.value.nameEn} is currently ranked ${team.value.fifaRank} in the world by FIFA.`
        }
      },
      {
        "@type": "Question",
        "name": `Who is the coach for ${team.value.nameEn}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": team.value.coach ? `${team.value.coach.nameEn} is the head coach for ${team.value.nameEn}.` : `The coach for ${team.value.nameEn} is currently not listed.`
        }
      }
    ]
  }
})
</script>
