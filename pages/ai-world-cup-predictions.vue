<template>
  <div class="ai-prediction-landing bg-slate-900 min-h-screen text-white">
    <!-- Hero Section -->
    <div class="relative overflow-hidden pt-24 pb-32 px-4 text-center">
      <div class="absolute inset-0 z-0 opacity-20 bg-[url('/images/predict-hero-bg.png')] bg-cover bg-center"></div>
      <div class="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-slate-900"></div>
      
      <div class="relative z-10 max-w-4xl mx-auto">
        <div class="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-semibold text-sm tracking-wide uppercase">
          Powered by Advanced Data Models
        </div>
        <h1 class="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
          AI World Cup Predictions 2026
        </h1>
        <p class="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto">
          Don't just guess. Let our AI analyze historical data, current form, and team stats to give you the most accurate World Cup predictions.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <NuxtLink to="/predict" class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-4 px-8 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] transition duration-300">
            Get AI Match Predictions
          </NuxtLink>
          <NuxtLink to="/predict/champion" class="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-lg py-4 px-8 rounded-lg transition duration-300">
            Predict Tournament Champion
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Data Points Section -->
    <div class="max-w-6xl mx-auto px-4 py-16 border-t border-slate-800">
      <h2 class="text-3xl font-bold text-center mb-16">How Our AI Predicts Matches</h2>
      
      <div class="grid md:grid-cols-4 gap-6 text-center">
        <div class="p-6">
          <div class="text-4xl mb-4">📊</div>
          <h3 class="text-lg font-bold mb-2">Historical H2H</h3>
          <p class="text-sm text-slate-400">Analysis of past encounters between the two teams.</p>
        </div>
        <div class="p-6">
          <div class="text-4xl mb-4">📈</div>
          <h3 class="text-lg font-bold mb-2">FIFA Rankings</h3>
          <p class="text-sm text-slate-400">Weighted scoring based on current global standing.</p>
        </div>
        <div class="p-6">
          <div class="text-4xl mb-4">🔥</div>
          <h3 class="text-lg font-bold mb-2">Recent Form</h3>
          <p class="text-sm text-slate-400">Momentum tracking from the last 10 international matches.</p>
        </div>
        <div class="p-6">
          <div class="text-4xl mb-4">🏟️</div>
          <h3 class="text-lg font-bold mb-2">Venue Advantage</h3>
          <p class="text-sm text-slate-400">Factoring in travel distance, climate, and home-continent bias.</p>
        </div>
      </div>
    </div>

    <!-- The "Jinx" Feature Promo -->
    <div class="bg-slate-800/50 py-20 px-4">
      <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div class="flex-1">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-purple-400">Try "Reverse Jinx" Mode</h2>
          <p class="text-lg text-slate-300 mb-6">
            Football fans know the pain of jinxing their own team. Our unique AI feature lets you officially "predict" your rival to win, generating a hilarious card to share while secretly hoping for the opposite outcome!
          </p>
          <ul class="space-y-3 mb-8 text-slate-400">
            <li class="flex items-center gap-2">✓ Funny AI-generated excuses</li>
            <li class="flex items-center gap-2">✓ Protect your team from bad luck</li>
            <li class="flex items-center gap-2">✓ Perfect for trolling rival fans</li>
          </ul>
          <NuxtLink to="/predict" class="text-purple-400 font-bold hover:text-purple-300 flex items-center gap-2">
            Try Jinx Mode Now <span>→</span>
          </NuxtLink>
        </div>
        <div class="flex-1 w-full max-w-sm mx-auto">
           <!-- Placeholder for a nice card graphic -->
           <div class="aspect-[3/4] rounded-2xl bg-gradient-to-tr from-purple-900 to-slate-800 border border-purple-500/30 flex items-center justify-center p-8 text-center shadow-2xl transform rotate-3">
             <div>
               <div class="text-5xl mb-4">🔮</div>
               <div class="font-bold text-xl mb-2">AI Jinx Card</div>
               <div class="text-sm text-purple-300">"I fully expect our rivals to win easily. Please ignore this card."</div>
             </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeoConfig } from '~/composables/useSeoConfig'

useSeoConfig({
  title: 'AI World Cup Predictions 2026 | Data-Driven Match Picks',
  description: 'Get accurate AI World Cup 2026 predictions. Our algorithm analyzes historical data, FIFA rankings, and team form to generate match odds, picks, and fun jinx cards.',
  ogType: 'website'
})
</script>
