import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        publishedAt: z.string(),
        updatedAt: z.string().optional(),
        author: z.string().default('WorldCupDex Editorial'),
        cover: z.string().optional(),
        tags: z.array(z.string()).default([]),
        locale: z.enum(['zh', 'en', 'es']).default('en'),
        draft: z.boolean().default(false),
      }),
    }),
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
