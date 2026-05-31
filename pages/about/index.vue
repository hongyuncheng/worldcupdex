<template>
  <div class="max-w-3xl mx-auto px-4 py-8 lg:py-12" style="color: #1F2937;">
    <!-- Hero -->
    <header class="mb-8 pb-6 border-b" style="border-color: #E5E7EB;">
      <h1
        class="font-bold mb-2"
        style="font-family: 'Montserrat', sans-serif; font-size: 32px; color: #000F49;"
      >
        {{ t('pages.about.title') }}
      </h1>
      <p class="mb-4" style="font-size: 16px; color: #4B5563;">
        {{ t('pages.about.subtitle') }}
      </p>
      <div
        class="rounded-xl p-5"
        style="background: linear-gradient(135deg, #000F49 0%, #1A237E 100%);"
      >
        <p
          class="font-semibold"
          style="font-family: 'Montserrat', sans-serif; font-size: 18px; color: #FFFFFF; line-height: 1.5;"
        >
          {{ t('pages.about.hero.tagline') }}
        </p>
      </div>
    </header>

    <!-- Sections -->
    <article class="space-y-10">
      <!-- 1. What is WorldCupDex -->
      <section class="space-y-3">
        <h2
          class="font-bold"
          style="font-family: 'Montserrat', sans-serif; font-size: 22px; color: #000F49;"
        >
          {{ t('pages.about.sections.whatIs.title') }}
        </h2>
        <p
          v-for="(p, i) in tm('pages.about.sections.whatIs.body')"
          :key="`what-${i}`"
          class="leading-relaxed"
          style="font-size: 15px; color: #374151;"
        >
          {{ rt(p) }}
        </p>
      </section>

      <!-- 2. Data Sources -->
      <section class="space-y-3">
        <h2
          class="font-bold"
          style="font-family: 'Montserrat', sans-serif; font-size: 22px; color: #000F49;"
        >
          {{ t('pages.about.sections.dataSources.title') }}
        </h2>
        <p
          v-for="(p, i) in tm('pages.about.sections.dataSources.body')"
          :key="`data-${i}`"
          class="leading-relaxed"
          style="font-size: 15px; color: #374151;"
        >
          {{ rt(p) }}
        </p>
      </section>

      <!-- 3. Sister Sites: KickIQ -->
      <section class="space-y-3">
        <h2
          class="font-bold"
          style="font-family: 'Montserrat', sans-serif; font-size: 22px; color: #000F49;"
        >
          {{ t('pages.about.sections.sisterSites.title') }}
        </h2>
        <p
          v-for="(p, i) in tm('pages.about.sections.sisterSites.body')"
          :key="`sister-${i}`"
          class="leading-relaxed"
          style="font-size: 15px; color: #374151;"
        >
          {{ rt(p) }}
        </p>
        <div>
          <a
            :href="t('pages.about.sections.sisterSites.href')"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block px-4 py-2 rounded-lg font-semibold transition-colors"
            style="background: #000F49; color: #FFFFFF; font-size: 14px;"
          >
            {{ t('pages.about.sections.sisterSites.cta') }}
          </a>
        </div>
      </section>
    </article>

    <!-- JSON-LD: Organization -->
    <SchemaOrg
      type="Organization"
      :data="{
        name: 'WorldCupDex',
        url: 'https://worldcupdex.org',
        logo: 'https://worldcupdex.org/images/logo.png',
        description: t('pages.about.metaDescription'),
        sameAs: ['https://kickiq.app'],
      }"
    />
  </div>
</template>

<script setup lang="ts">
const { t, tm, rt } = useI18n()

useSeoConfig({
  title: `${t('pages.about.title')} - WorldCupDex`,
  description: t('pages.about.metaDescription'),
  path: '/about',
})
</script>
