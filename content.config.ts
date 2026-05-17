import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    teams: defineCollection({
      type: 'data',
      source: 'teams/**',
      schema: z.object({
        id: z.string(),
        name: z.string(),
        code: z.string(),
        group: z.string(),
        flag: z.string().optional(),
        fifaRanking: z.number().optional(),
      }),
    }),
    matches: defineCollection({
      type: 'data',
      source: 'matches/**',
      schema: z.object({
        id: z.string(),
        homeTeam: z.string(),
        awayTeam: z.string(),
        date: z.string(),
        venue: z.string().optional(),
        stage: z.string().optional(),
      }),
    }),
    venues: defineCollection({
      type: 'data',
      source: 'venues/**',
      schema: z.object({
        id: z.string(),
        name: z.string(),
        city: z.string(),
        country: z.string(),
        capacity: z.number().optional(),
      }),
    }),
  },
})
