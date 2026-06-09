<template>
  <div class="max-w-3xl mx-auto px-4 py-8 lg:py-12" style="color: #1F2937;">
    <header class="mb-8 pb-6 border-b" style="border-color: #E5E7EB;">
      <h1
        class="font-bold mb-2"
        style="font-family: 'Montserrat', sans-serif; font-size: 32px; color: #000F49;"
      >
        Terms of Service
      </h1>
      <p class="mb-3" style="font-size: 16px; color: #4B5563;">
        The rules for using WorldCupDex and any optional digital products we offer.
      </p>
      <p style="font-size: 13px; color: #6B7280;">
        Last updated: 2026-06-09
      </p>
    </header>

    <article class="space-y-8">
      <section v-for="section in sections" :key="section.title" class="space-y-3">
        <h2 class="font-bold" style="font-size: 22px; color: #000F49;">
          {{ section.title }}
        </h2>
        <p
          v-for="paragraph in section.body"
          :key="paragraph"
          class="leading-relaxed"
          style="font-size: 15px; color: #374151;"
        >
          {{ paragraph }}
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="font-bold" style="font-size: 22px; color: #000F49;">
          10. Contact
        </h2>
        <p style="font-size: 15px; color: #374151; line-height: 1.7;">
          Questions about these Terms can be sent to
          <a href="mailto:contact@worldcupdex.org" style="color: #1A237E; text-decoration: underline;">contact@worldcupdex.org</a>.
        </p>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
const sections = [
  {
    title: '1. Acceptance',
    body: [
      'These Terms of Service apply to worldcupdex.org and its subdomains, operated as an independent fan information and utility site for the 2026 FIFA World Cup.',
      'By accessing or using the site, you agree to these Terms. If you do not agree, please stop using the site.',
    ],
  },
  {
    title: '2. Our Service',
    body: [
      'WorldCupDex provides schedules, team profiles, public sports data, prediction tools, quizzes, fan-card generation and related editorial content.',
      'We are not affiliated with FIFA, national football associations, leagues, teams, players, sponsors or ticketing providers unless explicitly stated.',
    ],
  },
  {
    title: '3. Accounts And User Content',
    body: [
      'The site currently does not require account registration for its core features. Some generated content, such as nicknames, predictions and fan-card drafts, may be stored locally in your browser.',
      'You are responsible for any nickname, text or other content you enter. Do not submit unlawful, abusive, misleading, infringing or harmful material.',
    ],
  },
  {
    title: '4. Paid Digital Products',
    body: [
      'We may offer optional paid digital products such as premium personalization packs, downloadable fan assets, or other digital upgrades.',
      'When a Paddle checkout is used, Paddle acts as the merchant of record and handles payment processing, tax calculation, receipts and payment security. Product access remains provided by WorldCupDex unless stated otherwise.',
    ],
  },
  {
    title: '5. Acceptable Use',
    body: [
      'You may not interfere with the site, bypass technical controls, scrape at unreasonable volume, reverse engineer protected areas, upload malware, or use the site for fraudulent activity.',
      'We may limit, suspend or block access where needed to protect the service, users, partners or legal compliance.',
    ],
  },
  {
    title: '6. Intellectual Property',
    body: [
      'WorldCupDex branding, page design, generated templates, code and original editorial content belong to WorldCupDex or its licensors.',
      'Third-party names, team names, flags, trademarks, player data and sports information remain the property of their respective owners and are used for identification, commentary and fan information purposes.',
    ],
  },
  {
    title: '7. Data Accuracy',
    body: [
      'We work to keep schedules, team data, rankings and predictions useful and up to date, but sports data can change quickly and may contain errors or delays.',
      'WorldCupDex content is provided for information and entertainment only. It is not betting, financial, legal or travel advice.',
    ],
  },
  {
    title: '8. Disclaimers And Liability',
    body: [
      'The site is provided on an as-is and as-available basis. We do not guarantee uninterrupted access, perfect accuracy, or that all features will remain available forever.',
      'To the maximum extent permitted by law, WorldCupDex is not liable for indirect, incidental, special or consequential damages arising from your use of the site.',
    ],
  },
  {
    title: '9. Changes',
    body: [
      'We may update these Terms from time to time. The updated version will be posted on this page with a revised date.',
      'Continuing to use the site after changes are posted means you accept the updated Terms.',
    ],
  },
]

useSeoConfig({
  title: 'Terms of Service - WorldCupDex',
  description: 'WorldCupDex Terms of Service for using the site, free tools and optional paid digital products.',
  path: '/terms',
})
</script>
