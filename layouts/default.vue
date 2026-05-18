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

          <!-- Right: Language switcher + Login -->
          <div class="flex items-center gap-2">
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
        <div v-if="mobileMenuOpen" class="lg:hidden border-t border-white/15 bg-white/10 backdrop-blur-sm">
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
          <NuxtLinkLocale to="/privacy" class="link link-hover hover:text-[#FFD700] transition-colors">{{ $t('nav.privacy') }}</NuxtLinkLocale>
          <NuxtLinkLocale to="/contact" class="link link-hover hover:text-[#FFD700] transition-colors">{{ $t('nav.contact') }}</NuxtLinkLocale>
          <NuxtLinkLocale to="/about" class="link link-hover hover:text-[#FFD700] transition-colors">{{ $t('nav.about') }}</NuxtLinkLocale>
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
