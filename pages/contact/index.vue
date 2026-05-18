<!--
  TODO: 待运营提供真实联系邮箱后替换 contact@worldcupdex.org 占位符
  TODO: 待运营开通公开 Discord 邀请链接后替换 Coming soon 占位
-->
<template>
  <div class="max-w-3xl mx-auto px-4 py-8 lg:py-12" style="color: #1F2937;">
    <!-- Hero -->
    <header class="mb-8 pb-6 border-b" style="border-color: #E5E7EB;">
      <h1
        class="font-bold mb-2"
        style="font-family: 'Montserrat', sans-serif; font-size: 32px; color: #000F49;"
      >
        {{ t('pages.contact.title') }}
      </h1>
      <p style="font-size: 16px; color: #4B5563;">
        {{ t('pages.contact.subtitle') }}
      </p>
    </header>

    <!-- Intro -->
    <p class="mb-6 leading-relaxed" style="font-size: 15px; color: #374151;">
      {{ t('pages.contact.intro') }}
    </p>

    <!-- Contact channels -->
    <div class="space-y-4">
      <!-- Email -->
      <section
        class="rounded-xl p-5 border"
        style="background: #FFFFFF; border-color: #E5E7EB;"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style="background: #EEF2FF;"
            aria-hidden="true"
          >
            <span style="font-size: 20px;">✉️</span>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-bold mb-1" style="font-size: 16px; color: #000F49;">
              {{ t('pages.contact.emailLabel') }}
            </h2>
            <a
              href="mailto:contact@worldcupdex.org"
              class="font-mono break-all"
              style="font-size: 15px; color: #1A237E; text-decoration: underline;"
            >
              contact@worldcupdex.org
            </a>
            <p class="mt-1.5" style="font-size: 14px; color: #4B5563; line-height: 1.6;">
              {{ t('pages.contact.emailNote') }}
            </p>
          </div>
        </div>
      </section>

      <!-- GitHub Issues -->
      <section
        class="rounded-xl p-5 border"
        style="background: #FFFFFF; border-color: #E5E7EB;"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style="background: #F3F4F6;"
            aria-hidden="true"
          >
            <span style="font-size: 20px;">💻</span>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-bold mb-1" style="font-size: 16px; color: #000F49;">
              {{ t('pages.contact.githubLabel') }}
            </h2>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
              {{ t('pages.contact.githubNote') }}
            </p>
            <a
              href="https://github.com/hongyuncheng/worldcupdex/issues"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block mt-2 px-3 py-1.5 rounded-md font-semibold transition-colors"
              style="background: #1F2937; color: #FFFFFF; font-size: 13px;"
            >
              {{ t('pages.contact.githubCta') }}
            </a>
          </div>
        </div>
      </section>

      <!-- Discord (Coming Soon) -->
      <section
        class="rounded-xl p-5 border"
        style="background: #FAFBFC; border-color: #E5E7EB;"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style="background: #EEF2FF;"
            aria-hidden="true"
          >
            <span style="font-size: 20px;">💬</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <h2 class="font-bold" style="font-size: 16px; color: #000F49;">
                {{ t('pages.contact.discordLabel') }}
              </h2>
              <span
                class="inline-block px-2 py-0.5 rounded font-semibold"
                style="background: #FEF3C7; color: #92400E; font-size: 11px;"
              >
                {{ t('pages.contact.discordComingSoon') }}
              </span>
            </div>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
              {{ t('pages.contact.discordNote') }}
            </p>
          </div>
        </div>
      </section>
    </div>

    <!-- Response note -->
    <p
      class="mt-6 p-4 rounded-lg"
      style="background: #F9FAFB; font-size: 13px; color: #6B7280; line-height: 1.6;"
    >
      {{ t('pages.contact.responseNote') }}
    </p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()


useSeoConfig({
  title: `${t('pages.contact.title')} - WorldCupDex`,
  description: t('pages.contact.metaDescription'),
  path: '/contact',
})
</script>
