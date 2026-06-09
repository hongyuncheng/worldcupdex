<template>
  <div class="min-h-screen flex flex-col" style="background-color: #F5F5F5;">
    <!-- Navbar -->
    <header
      class="sticky top-0 z-50 shadow-lg"
      style="background: #000F49; height: 90px;"
      role="navigation"
      aria-label="Main navigation"
    >
      <div class="max-w-7xl mx-auto px-4 lg:px-8">
        <div class="flex items-center justify-between" style="height: 90px;">
          <!-- Left: Logo + Mobile menu -->
          <div class="flex items-center gap-3">
            <!-- Mobile hamburger -->
            <button
              class="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-white/90 hover:bg-white/15 transition-colors"
              aria-label="Open menu"
              @click="mobileMenuOpen = !mobileMenuOpen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Logo -->
            <NuxtLinkLocale to="/" class="flex items-center gap-2 group" @click="mobileMenuOpen = false">
              <span class="text-2xl">🏆</span>
              <span class="font-bold text-lg text-white" style="font-family: 'Montserrat', sans-serif;">WorldCupDex</span>
            </NuxtLinkLocale>
          </div>

          <!-- Center: Desktop nav links -->
          <nav class="hidden lg:flex items-center gap-0.5">
            <NuxtLinkLocale
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="nav-link px-3 py-2 text-sm font-semibold text-white/85 hover:text-white transition-all duration-200 relative"
              active-class="nav-link-active"
            >
              {{ $t(link.label) }}
            </NuxtLinkLocale>
          </nav>

          <!-- Right: Language switcher + Discord -->
          <div class="flex items-center gap-2">
            <a
              :href="discordUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-ghost btn-sm text-white/90 hover:bg-[#5865F2] hover:border-[#5865F2] hover:text-white border border-white/30 rounded-full px-2 lg:px-4 flex items-center transition-all"
              aria-label="Join Discord"
              style="height: 36px;"
            >
              <svg viewBox="0 0 24 24" class="w-[20px] h-[20px]" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.618-1.25.077.077 0 00-.079-.037 19.736 19.736 0 00-4.885 1.515.07.07 0 00-.032.028C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.1.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.946 2.418-2.157 2.418z"/></svg>
              <span class="hidden lg:inline-block ml-1.5 text-[15px] font-bold">Discord</span>
            </a>

            <div class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-ghost btn-sm text-white/90 hover:bg-white/15 border border-white/30 rounded-full px-3">
                <span class="text-sm font-semibold">{{ currentLocaleName }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </label>
              <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-40 mt-2">
                <li v-for="loc in availableLocales" :key="loc.code">
                  <button
                    class="text-sm"
                    :class="{ 'font-bold text-primary': locale === loc.code }"
                    @click="setLocale(loc.code as any)"
                  >
                    {{ loc.name }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile menu dropdown -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="mobileMenuOpen" class="lg:hidden absolute left-0 right-0 top-[90px] border-t border-white/15 bg-[#000F49] shadow-xl">
          <nav class="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            <NuxtLinkLocale
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 font-semibold hover:bg-white/15 transition-colors"
              active-class="!bg-white/25 !text-white"
              @click="mobileMenuOpen = false"
            >
              {{ $t(link.label) }}
            </NuxtLinkLocale>
          </nav>
        </div>
      </Transition>
    </header>

    <!-- Main content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Back to top button -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <button
        v-show="showBackToTop"
        class="fixed bottom-8 right-6 z-50 w-11 h-11 rounded-full bg-primary text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
        @click="scrollToTop"
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </Transition>

    <!-- Footer -->
    <footer style="background: #1A237E;" role="contentinfo">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-4">
        <!-- Compliance links: Privacy / Contact / About -->
        <div class="flex flex-wrap justify-center gap-4 text-sm mb-2" style="color: rgba(255,255,255,0.85); font-family: 'Inter', sans-serif;">
          <NuxtLinkLocale to="/pricing" class="link link-hover hover:text-[#FFD700] transition-colors">Pricing</NuxtLinkLocale>
          <NuxtLinkLocale to="/terms" class="link link-hover hover:text-[#FFD700] transition-colors">Terms</NuxtLinkLocale>
          <NuxtLinkLocale to="/privacy" class="link link-hover hover:text-[#FFD700] transition-colors">{{ $t('nav.privacy') }}</NuxtLinkLocale>
          <NuxtLinkLocale to="/refund" class="link link-hover hover:text-[#FFD700] transition-colors">Refunds</NuxtLinkLocale>
          <NuxtLinkLocale to="/contact" class="link link-hover hover:text-[#FFD700] transition-colors">{{ $t('nav.contact') }}</NuxtLinkLocale>
          <NuxtLinkLocale to="/about" class="link link-hover hover:text-[#FFD700] transition-colors">{{ $t('nav.about') }}</NuxtLinkLocale>
          <a :href="discordUrl" target="_blank" rel="noopener noreferrer" class="link link-hover hover:text-[#5865F2] transition-colors flex items-center gap-1.5 font-semibold">
            <svg viewBox="0 0 24 24" class="w-[18px] h-[18px]" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.618-1.25.077.077 0 00-.079-.037 19.736 19.736 0 00-4.885 1.515.07.07 0 00-.032.028C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.1.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.946 2.418-2.157 2.418z"/></svg>
            Join Discord
          </a>
        </div>
        <div class="flex items-center justify-between flex-wrap gap-3" style="min-height: 56px;">
          <div class="flex items-center gap-2">
            <span class="text-xl">🏆</span>
            <span class="font-bold text-white" style="font-family: 'Montserrat', sans-serif;">WorldCupDex</span>
          </div>
          <div class="hidden md:flex items-center gap-6">
            <NuxtLinkLocale to="/" class="text-white hover:text-[#FFD700] transition-colors" style="font-family: 'Inter', sans-serif; font-size: 14px;">{{ $t('nav.home') }}</NuxtLinkLocale>
            <NuxtLinkLocale to="/teams" class="text-white hover:text-[#FFD700] transition-colors" style="font-family: 'Inter', sans-serif; font-size: 14px;">{{ $t('nav.teams') }}</NuxtLinkLocale>
            <NuxtLinkLocale to="/schedule" class="text-white hover:text-[#FFD700] transition-colors" style="font-family: 'Inter', sans-serif; font-size: 14px;">{{ $t('nav.matches') }}</NuxtLinkLocale>
            <NuxtLinkLocale to="/predict" class="text-white hover:text-[#FFD700] transition-colors" style="font-family: 'Inter', sans-serif; font-size: 14px;">{{ $t('nav.predict') }}</NuxtLinkLocale>
          </div>
          <span style="font-family: 'Inter', sans-serif; font-size: 12px; color: #CCCCCC;">{{ $t('footer.copyright') }}</span>
        </div>
        <div class="text-xs mt-2 pt-2 border-t border-white/10" style="color: rgba(255,255,255,0.55); font-family: 'Inter', sans-serif; line-height: 1.5;">
          {{ $t('affiliate.footerDisclosure') }}
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale, locales } = useI18n()
const runtimeConfig = useRuntimeConfig()

const discordUrl = computed(() => runtimeConfig.public.discordUrl as string)

const mobileMenuOpen = ref(false)
const showBackToTop = ref(false)

const availableLocales = computed(() =>
  (locales.value as Array<{ code: string; name: string }>)
)

const currentLocaleName = computed(() =>
  availableLocales.value.find(l => l.code === locale.value)?.name || locale.value
)

const navLinks = [
  { to: '/', label: 'nav.home' },
  { to: '/teams', label: 'nav.teams' },
  { to: '/schedule', label: 'nav.matches' },
  { to: '/fan-card', label: 'nav.fanCard' },
  { to: '/predict', label: 'nav.predict' },
  { to: '/quiz', label: 'nav.quiz' },
  { to: '/blog', label: 'nav.blog' },
]

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', () => {
    showBackToTop.value = window.scrollY > 300
  })
})
</script>

<style scoped>
.nav-link {
  position: relative;
}
.nav-link-active {
  color: white !important;
}
.nav-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 3px;
  background-color: #FFD700;
  border-radius: 2px;
}
</style>
