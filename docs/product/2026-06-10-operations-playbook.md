# WorldCupDex Operations Playbook

## Project
- Project name: WorldCupDex
- Project code: wcd
- Production domain: https://worldcupdex.org
- Local workspace: E:\pc_workspace\tool\worldcupdex
- Primary report language: Chinese

## Goal
Build measurable search, traffic, trust, and monetization readiness without hurting long-term SEO, account safety, or user trust.

## Daily Routine
1. Run `npm run ops:report`.
2. Review `reports/ops/YYYY-MM-DD-ops-report.md`.
3. Publish the daily report as a child page under the Notion page `wcd - WorldCupDex operations`.
4. Act only on low-risk technical and content fixes directly.
5. Ask for confirmation before paid services, ad/affiliate account changes, DNS, Cloudflare security policy changes, or privacy-sensitive tracking.

## Weekly Focus
- Monday: SEO and traffic review.
- Wednesday: technical health and data quality review.
- Friday: monetization readiness review.

## Data Boundaries
- Use only this repository and this project's local environment files.
- Do not read other projects' `.env`, credentials, or reports.
- Stop and report an attribution issue if GSC, GA4, or Cloudflare data does not belong to `worldcupdex.org`.

## Current Main Actions
- Keep GSC and GA4 attribution filtered to `worldcupdex.org`.
- Watch core routes, sitemap availability, 404/5xx status, search impressions, and conversion events.
- Treat monetization as readiness work until ad/affiliate accounts are explicitly confirmed.
- During matchdays, follow `docs/product/2026-06-13-daily-matchday-content-playbook.md` for daily content selection, drafting, publishing, and review.
