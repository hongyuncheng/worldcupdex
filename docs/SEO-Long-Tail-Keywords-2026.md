# 2026 World Cup Programmatic SEO (pSEO) Long-Tail Keywords Strategy

This document outlines the strategy for generating long-tail keywords based on the 48 participating teams for the 2026 World Cup. These keywords will be used to automatically generate highly targeted pages, driving organic traffic to the `worldcupdex` platform without resorting to off-topic clickbait.

## 1. Core Keyword Formula

Instead of targeting broad, highly competitive terms like "World Cup 2026", we will target specific user intents combining team names with prediction, schedule, and analysis modifiers.

**Formula:** `[Team Name / Team Code] + [Modifier]`

*   **Teams (Examples):** USMNT, USA, Argentina, Brazil, England, Mexico, etc.
*   **Modifiers:**
    *   `world cup 2026 predictions`
    *   `world cup 2026 schedule`
    *   `world cup 2026 odds`
    *   `world cup 2026 picks`
    *   `vs [Opponent Name] predictions` (e.g., USMNT vs England predictions)
    *   `world cup 2026 squad`
    *   `route to final`

## 2. Categorized Keyword Matrices

Here is a breakdown of the key page types we will programmatically generate and the corresponding SEO keywords they will target.

### 2.1. Team-Specific Prediction Pages (High Intent)
*Goal: Capture users looking for analysis on how a specific team will perform.*
*Target URL Pattern:* `/predictions/[team-slug]-world-cup-2026`

*   **Keywords (Primary):**
    *   `[Team] world cup 2026 predictions` (e.g., *USMNT world cup 2026 predictions*)
    *   `[Team] world cup predictions 2026`
*   **Keywords (Secondary/LSI):**
    *   `will [Team] win the world cup 2026`
    *   `how far will [Team] go in world cup 2026`
    *   `[Team] world cup 2026 odds`
*   **CTA (Call to Action):** "Generate your AI Prediction Card for [Team]" -> Links to `/predict`

### 2.2. Match-Specific Prediction Pages (H2H)
*Goal: Capture search traffic right before and during specific matches.*
*Target URL Pattern:* `/predictions/[teamA]-vs-[teamB]-world-cup-2026`

*   **Keywords:**
    *   `[Team A] vs [Team B] world cup 2026 predictions`
    *   `[Team A] vs [Team B] picks and odds`
    *   `who will win [Team A] vs [Team B] 2026`
*   **CTA:** "Predict the winner of [Team A] vs [Team B]" -> Links to `/predict/[matchId]`

### 2.3. Free / AI Tool Queries (Feature-Specific)
*Goal: Capture users looking for interactive tools.*
*Target URL Pattern:* (These can be static landing pages optimized for these terms)

*   **Keywords:**
    *   `free world cup 2026 prediction card` -> Maps to `/free-world-cup-prediction-card`
    *   `ai world cup predictions 2026` -> Maps to `/ai-world-cup-predictions`
    *   `world cup 2026 match predictor tool` -> Maps to `/world-cup-2026-match-predictor`
    *   `world cup bracket predictor 2026`
*   **CTA:** Direct usage of the tool.

### 2.4. Fan Identity / Merch (Commercial Intent)
*Goal: Drive traffic to the Fan Card generator and affiliate links.*
*Target URL Pattern:* `/fan-card/[team-slug]`

*   **Keywords:**
    *   `[Team] world cup 2026 fan card`
    *   `support [Team] world cup 2026`
    *   `[Team] world cup 2026 jersey` (If we integrate affiliate links here)

## 3. Implementation Plan (pSEO)

To implement this without manually creating hundreds of pages:

1.  **Data Source:** Utilize `data/teams.json` to get the list of 48 teams (Name, Slug, Code).
2.  **Dynamic Routing:** Create a single Nuxt page component (e.g., `pages/predictions/[slug].vue`).
3.  **Content Injection:** Based on the `[slug]`, fetch the relevant team data and inject it into the page (Stats, Coach, Group).
4.  **SEO Metadata Injection:** Use `useSeoConfig` to dynamically set the `<title>`, `<meta description>`, and `<link rel="canonical">` based on the targeted keyword formula.
5.  **Sitemap Generation:** Write a script to iterate through `teams.json` and automatically add all 48 `predictions/[team-slug]` URLs to `sitemap.xml`.

## 4. Next Steps for Execution

1.  [ ] Review and approve this keyword strategy.
2.  [ ] Create the dynamic route component (`pages/predictions/[slug].vue`).
3.  [ ] Implement dynamic SEO tags using `useSeoConfig`.
4.  [ ] Update the sitemap generation logic to include these new dynamic routes.
