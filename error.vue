<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: {
    type: Object as () => NuxtError,
    required: true
  }
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#F5F5F5] text-[#333]">
    <!-- Simple Header -->
    <header class="bg-[#000F49] text-white py-4 px-6 shadow-md">
      <div class="max-w-7xl mx-auto flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center font-bold text-[#000F49]">
          W
        </div>
        <span class="font-bold text-xl tracking-tight" style="font-family: 'Montserrat', sans-serif;">
          WorldCupDex
        </span>
      </div>
    </header>

    <!-- Error Content -->
    <main class="flex-grow flex items-center justify-center p-6">
      <div class="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-2xl w-full text-center border-t-4 border-[#000F49]">
        
        <div class="text-6xl md:text-8xl font-black text-gray-200 mb-4" style="font-family: 'Montserrat', sans-serif;">
          {{ error.statusCode }}
        </div>
        
        <h1 class="text-2xl md:text-3xl font-bold text-[#000F49] mb-4">
          {{ error.statusCode === 404 ? 'Oops! This page is offside.' : 'Something went wrong.' }}
        </h1>
        
        <p class="text-gray-600 mb-8 text-lg">
          {{ 
            error.statusCode === 404 
              ? "We couldn't find the page you're looking for. It might have been moved or doesn't exist." 
              : error.message || "An unexpected error occurred. Please try again later."
          }}
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            @click="handleError"
            class="w-full sm:w-auto px-8 py-3 bg-[#000F49] text-white font-bold rounded-lg hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Back to Home
          </button>
          
          <a 
            href="/teams" 
            class="w-full sm:w-auto px-8 py-3 bg-[#FFD700] text-[#000F49] font-bold rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Explore Teams
          </a>
        </div>
      </div>
    </main>

    <!-- Simple Footer -->
    <footer class="bg-gray-100 py-6 text-center text-gray-500 text-sm">
      <p>&copy; 2026 WorldCupDex. All rights reserved.</p>
    </footer>
  </div>
</template>
