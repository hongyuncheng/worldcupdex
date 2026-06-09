<template>
  <div class="max-w-3xl mx-auto px-4 py-8 lg:py-12" style="color: #1F2937;">
    <header class="mb-8 pb-6 border-b" style="border-color: #E5E7EB;">
      <h1
        class="font-bold mb-2"
        style="font-family: 'Montserrat', sans-serif; font-size: 32px; color: #000F49;"
      >
        Pricing
      </h1>
      <p class="leading-relaxed" style="font-size: 16px; color: #4B5563;">
        WorldCupDex offers a free fan toolkit for the 2026 World Cup. Paid digital upgrades may be introduced for premium personalization features.
      </p>
    </header>

    <article class="space-y-8">
      <section
        class="rounded-xl p-5 border"
        style="background: #FFFFFF; border-color: #E5E7EB;"
      >
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 class="font-bold mb-2" style="font-size: 20px; color: #000F49;">
              Free Access
            </h2>
            <p style="font-size: 15px; color: #374151; line-height: 1.7;">
              Browse team profiles, match schedules, predictions, quizzes, blog content and standard fan-card tools at no cost.
            </p>
          </div>
          <div
            class="px-4 py-2 rounded-lg font-bold"
            style="background: #EEF2FF; color: #1A237E; font-size: 18px;"
          >
            $0
          </div>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="font-bold" style="font-size: 22px; color: #000F49;">
          Optional Paid Digital Features
        </h2>
        <p style="font-size: 15px; color: #374151; line-height: 1.7;">
          We may offer optional paid digital products such as premium prediction-card backgrounds, advanced personalization packs, or other downloadable fan assets. Any paid item will show its final price, currency, taxes and checkout terms before payment.
        </p>
        <ul class="list-disc list-outside pl-6 space-y-1.5">
          <li style="font-size: 15px; color: #374151; line-height: 1.7;">
            Paid products are optional and are not required to use the core WorldCupDex experience.
          </li>
          <li style="font-size: 15px; color: #374151; line-height: 1.7;">
            Payments are processed by Paddle, our merchant of record, when a Paddle checkout is used.
          </li>
          <li style="font-size: 15px; color: #374151; line-height: 1.7;">
            Access details and delivery instructions are provided on the checkout page and after successful payment.
          </li>
        </ul>
      </section>

      <section class="space-y-3">
        <h2 class="font-bold" style="font-size: 22px; color: #000F49;">
          Billing And Support
        </h2>
        <p style="font-size: 15px; color: #374151; line-height: 1.7;">
          If you have a billing question, need a receipt, or believe a charge was made in error, contact us at
          <a href="mailto:contact@worldcupdex.org" style="color: #1A237E; text-decoration: underline;">contact@worldcupdex.org</a>.
          Refund requests are handled under our refund policy.
        </p>
        <div class="flex flex-wrap gap-3">
          <NuxtLinkLocale
            to="/refund"
            class="inline-block px-4 py-2 rounded-lg font-semibold transition-colors"
            style="background: #000F49; color: #FFFFFF; font-size: 14px;"
          >
            Refund Policy
          </NuxtLinkLocale>
          <NuxtLinkLocale
            to="/terms"
            class="inline-block px-4 py-2 rounded-lg font-semibold transition-colors"
            style="background: #EEF2FF; color: #1A237E; font-size: 14px;"
          >
            Terms of Service
          </NuxtLinkLocale>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
useSeoConfig({
  title: 'Pricing - WorldCupDex',
  description: 'WorldCupDex pricing information for free access and optional paid digital fan features.',
  path: '/pricing',
})
</script>
