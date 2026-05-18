<template>
  <div class="max-w-3xl mx-auto px-4 py-8 lg:py-12" style="color: #1F2937;">
    <!-- Hero -->
    <header class="mb-8 pb-6 border-b" style="border-color: #E5E7EB;">
      <h1
        class="font-bold mb-2"
        style="font-family: 'Montserrat', sans-serif; font-size: 32px; color: #000F49;"
      >
        {{ t('pages.privacy.title') }}
      </h1>
      <p class="mb-3" style="font-size: 16px; color: #4B5563;">
        {{ t('pages.privacy.subtitle') }}
      </p>
      <p style="font-size: 13px; color: #6B7280;">
        {{ t('pages.privacy.lastUpdated', { date: t('pages.privacy.lastUpdatedDate') }) }}
      </p>
    </header>

    <!-- Main content -->
    <article class="space-y-10">
      <!-- 1. Introduction -->
      <section class="space-y-3">
        <h2
          class="font-bold"
          style="font-family: 'Montserrat', sans-serif; font-size: 22px; color: #000F49;"
        >
          {{ t('pages.privacy.sections.introduction.title') }}
        </h2>
        <p
          v-for="(p, i) in tm('pages.privacy.sections.introduction.body')"
          :key="`intro-${i}`"
          class="leading-relaxed"
          style="font-size: 15px; color: #374151;"
        >
          {{ rt(p) }}
        </p>
      </section>

      <!-- 2. Information Collected -->
      <section class="space-y-3">
        <h2
          class="font-bold"
          style="font-family: 'Montserrat', sans-serif; font-size: 22px; color: #000F49;"
        >
          {{ t('pages.privacy.sections.informationCollected.title') }}
        </h2>
        <p style="font-size: 15px; color: #374151;">
          {{ t('pages.privacy.sections.informationCollected.intro') }}
        </p>
        <div
          v-for="(group, gi) in tm('pages.privacy.sections.informationCollected.groups')"
          :key="`info-${gi}`"
          class="space-y-2"
        >
          <h3 class="font-semibold" style="font-size: 16px; color: #1F2937;">
            {{ rt((group as any).heading) }}
          </h3>
          <ul class="list-disc list-outside pl-6 space-y-1.5">
            <li
              v-for="(item, ii) in (group as any).items"
              :key="`info-${gi}-${ii}`"
              style="font-size: 15px; color: #374151; line-height: 1.6;"
            >
              {{ rt(item) }}
            </li>
          </ul>
        </div>
      </section>

      <!-- 3. How We Use -->
      <section class="space-y-3">
        <h2
          class="font-bold"
          style="font-family: 'Montserrat', sans-serif; font-size: 22px; color: #000F49;"
        >
          {{ t('pages.privacy.sections.howWeUse.title') }}
        </h2>
        <p style="font-size: 15px; color: #374151;">
          {{ t('pages.privacy.sections.howWeUse.intro') }}
        </p>
        <ul class="list-disc list-outside pl-6 space-y-1.5">
          <li
            v-for="(item, i) in tm('pages.privacy.sections.howWeUse.items')"
            :key="`use-${i}`"
            style="font-size: 15px; color: #374151; line-height: 1.6;"
          >
            {{ rt(item) }}
          </li>
        </ul>
      </section>

      <!-- 4. Cookies -->
      <section class="space-y-3">
        <h2
          class="font-bold"
          style="font-family: 'Montserrat', sans-serif; font-size: 22px; color: #000F49;"
        >
          {{ t('pages.privacy.sections.cookies.title') }}
        </h2>
        <p style="font-size: 15px; color: #374151;">
          {{ t('pages.privacy.sections.cookies.intro') }}
        </p>
        <div class="space-y-3">
          <div
            v-for="(item, i) in tm('pages.privacy.sections.cookies.items')"
            :key="`cookie-${i}`"
            class="rounded-lg p-4 border"
            style="background: #FAFBFC; border-color: #E5E7EB;"
          >
            <div class="font-semibold mb-1" style="font-size: 15px; color: #000F49;">
              {{ rt((item as any).name) }}
            </div>
            <div style="font-size: 14px; color: #4B5563; line-height: 1.6;">
              {{ rt((item as any).desc) }}
            </div>
          </div>
        </div>
        <p class="pt-1" style="font-size: 14px; color: #6B7280; font-style: italic;">
          {{ t('pages.privacy.sections.cookies.footer') }}
        </p>
      </section>

      <!-- 5. Third Party -->
      <section class="space-y-3">
        <h2
          class="font-bold"
          style="font-family: 'Montserrat', sans-serif; font-size: 22px; color: #000F49;"
        >
          {{ t('pages.privacy.sections.thirdParty.title') }}
        </h2>
        <p style="font-size: 15px; color: #374151;">
          {{ t('pages.privacy.sections.thirdParty.intro') }}
        </p>
        <ul class="space-y-2">
          <li
            v-for="(item, i) in tm('pages.privacy.sections.thirdParty.items')"
            :key="`tp-${i}`"
            class="leading-relaxed"
            style="font-size: 15px; color: #374151;"
          >
            <span class="font-semibold" style="color: #1F2937;">{{ rt((item as any).name) }}</span>
            <span> — {{ rt((item as any).desc) }} </span>
            <a
              :href="(item as any).href"
              target="_blank"
              rel="noopener noreferrer nofollow"
              class="link link-hover"
              style="color: #1A237E; text-decoration: underline;"
            >
              {{ rt((item as any).linkLabel) }}
            </a>
          </li>
        </ul>
      </section>

      <!-- 6. GDPR -->
      <section class="space-y-3">
        <h2
          class="font-bold"
          style="font-family: 'Montserrat', sans-serif; font-size: 22px; color: #000F49;"
        >
          {{ t('pages.privacy.sections.gdpr.title') }}
        </h2>
        <p style="font-size: 15px; color: #374151;">
          {{ t('pages.privacy.sections.gdpr.intro') }}
        </p>
        <ul class="list-disc list-outside pl-6 space-y-1.5">
          <li
            v-for="(item, i) in tm('pages.privacy.sections.gdpr.items')"
            :key="`gdpr-${i}`"
            style="font-size: 15px; color: #374151; line-height: 1.6;"
          >
            {{ rt(item) }}
          </li>
        </ul>
        <p class="pt-1" style="font-size: 14px; color: #4B5563;">
          {{ t('pages.privacy.sections.gdpr.footer') }}
        </p>
      </section>

      <!-- 7. Children -->
      <section class="space-y-3">
        <h2
          class="font-bold"
          style="font-family: 'Montserrat', sans-serif; font-size: 22px; color: #000F49;"
        >
          {{ t('pages.privacy.sections.children.title') }}
        </h2>
        <p
          v-for="(p, i) in tm('pages.privacy.sections.children.body')"
          :key="`child-${i}`"
          class="leading-relaxed"
          style="font-size: 15px; color: #374151;"
        >
          {{ rt(p) }}
        </p>
      </section>

      <!-- 8. Changes -->
      <section class="space-y-3">
        <h2
          class="font-bold"
          style="font-family: 'Montserrat', sans-serif; font-size: 22px; color: #000F49;"
        >
          {{ t('pages.privacy.sections.changes.title') }}
        </h2>
        <p
          v-for="(p, i) in tm('pages.privacy.sections.changes.body')"
          :key="`chg-${i}`"
          class="leading-relaxed"
          style="font-size: 15px; color: #374151;"
        >
          {{ rt(p) }}
        </p>
      </section>

      <!-- 9. Contact -->
      <section class="space-y-3">
        <h2
          class="font-bold"
          style="font-family: 'Montserrat', sans-serif; font-size: 22px; color: #000F49;"
        >
          {{ t('pages.privacy.sections.contact.title') }}
        </h2>
        <p
          v-for="(p, i) in tm('pages.privacy.sections.contact.body')"
          :key="`pcontact-${i}`"
          class="leading-relaxed"
          style="font-size: 15px; color: #374151;"
        >
          {{ rt(p) }}
        </p>
        <div>
          <NuxtLinkLocale
            to="/contact"
            class="inline-block px-4 py-2 rounded-lg font-semibold transition-colors"
            style="background: #000F49; color: #FFFFFF; font-size: 14px;"
          >
            {{ t('pages.privacy.sections.contact.cta') }}
          </NuxtLinkLocale>
        </div>
      </section>
    </article>

    <!-- JSON-LD: WebSite -->
    <SchemaOrg
      type="WebSite"
      :data="{
        name: 'WorldCupDex',
        url: 'https://worldcupdex.org',
        description: t('pages.privacy.metaDescription'),
      }"
    />
  </div>
</template>

<script setup lang="ts">
const { t, tm, rt } = useI18n()

useSeoConfig({
  title: `${t('pages.privacy.title')} - WorldCupDex`,
  description: t('pages.privacy.metaDescription'),
  path: '/privacy',
})
</script>
