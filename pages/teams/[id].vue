<template>
  <div style="background: #FAFAFA; min-height: 100vh;">
    <!-- Breadcrumb -->
    <div class="max-w-7xl mx-auto px-4 lg:px-8" style="padding-top: 20px; padding-bottom: 16px;">
      <nav style="font-size: 13px; color: #999;">
        <NuxtLinkLocale to="/" class="hover:text-[#000F49] transition-colors">{{ $t('nav.home') }}</NuxtLinkLocale>
        <span style="margin: 0 6px;">&gt;</span>
        <NuxtLinkLocale to="/teams" class="hover:text-[#000F49] transition-colors">{{ $t('teams.title') }}</NuxtLinkLocale>
        <span style="margin: 0 6px;">&gt;</span>
        <span style="color: #666;">{{ locale === 'en' ? team.nameEn : team.nameZh }}</span>
      </nav>
    </div>

    <!-- Hero Banner -->
    <div class="max-w-7xl mx-auto px-4 lg:px-8" style="padding-bottom: 24px;">
      <div class="relative overflow-hidden" style="background: #000F49; border-radius: 16px;">
        <!-- Background decoration -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute right-0 top-0 bottom-0 w-1/2" style="background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.05) 100%);"></div>
        </div>
        <div style="padding: 32px 32px; position: relative; z-index: 10;">
        <div class="hero-layout">
          <!-- Left: Flag + Info -->
          <div class="hero-main">
            <!-- Flag -->
            <img
              :src="`https://flagcdn.com/w160/${team.code}.png`"
              :alt="team.nameEn"
              class="hero-flag"
              style="width: 120px; height: 80px; object-fit: cover; border: 3px solid rgba(255,255,255,0.9); border-radius: 8px; flex-shrink: 0;"
            />
            <div style="flex: 1;">
              <!-- Names -->
              <h1 class="font-bold text-white" style="font-family: 'Montserrat', sans-serif; font-size: 36px; line-height: 1.2; margin-bottom: 4px;">
                {{ locale === 'en' ? team.nameEn : team.nameZh }}
              </h1>
              <p style="font-size: 18px; color: rgba(255,255,255,0.75); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                {{ locale === 'en' ? team.nameZh : team.nameEn }}
                <svg class="w-5 h-5 text-blue-400" style="flex-shrink: 0;" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              </p>
              <!-- Key Stats Row -->
              <div style="display: flex; flex-wrap: wrap; gap: 24px;">
                <div>
                  <div style="font-size: 13px; color: rgba(255,255,255,0.55);">{{ $t('teams.appearances') }}</div>
                  <div class="font-bold text-white" style="font-size: 16px;">{{ team.appearances }}{{ $t('teams.times') }}</div>
                </div>
                <div>
                  <div style="font-size: 13px; color: rgba(255,255,255,0.55);">{{ $t('teams.bestResult') }}</div>
                  <div class="font-bold text-white" style="font-size: 16px;">{{ $t('teams.champion') }} ({{ team.bestYears }})</div>
                </div>
                <div>
                  <div style="font-size: 13px; color: rgba(255,255,255,0.55);">{{ $t('teams.fifaRanking') }}</div>
                  <div class="font-bold text-white" style="font-size: 16px;">#{{ team.fifaRank }}</div>
                </div>
                <div>
                  <div style="font-size: 13px; color: rgba(255,255,255,0.55);">{{ $t('teams.confederation') }}</div>
                  <div class="font-bold text-white" style="font-size: 16px;">{{ team.confederation }}</div>
                </div>
              </div>
            </div>
          </div>
          <!-- Right: Group Card -->
          <div class="hero-group-card">
            <div class="rounded-xl p-4" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <span class="text-white font-bold" style="font-size: 14px;">{{ $t('teams.worldCupGroup') }}</span>
                <span style="background: #E53935; color: white; padding: 2px 12px; border-radius: 999px; font-size: 12px; font-weight: 700;">{{ team.group }}{{ locale === 'zh' ? '组' : '' }}</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div
                  v-for="mate in groupTeams"
                  :key="mate.code"
                  style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px;"
                  :style="mate.code === team.code ? 'background: rgba(255,255,255,0.12);' : ''"
                >
                  <img :src="`https://flagcdn.com/w40/${mate.code}.png`" :alt="mate.nameEn" style="width: 24px; height: 16px; object-fit: cover; border-radius: 2px;" />
                  <span class="text-white" :class="mate.code === team.code ? 'font-bold' : ''" style="font-size: 13px;">
                    {{ locale === 'en' ? mate.nameEn : mate.nameZh }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      <div class="flex gap-6 border-b" style="border-color: #E0E0E0;">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="py-3 px-1 text-sm font-semibold transition-colors relative cursor-pointer"
          :style="activeTab === tab.key
            ? 'color: #000F49;'
            : 'color: #999;'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span
            v-if="activeTab === tab.key"
            class="absolute bottom-0 left-0 right-0 h-[3px] rounded-t"
            style="background: #000F49;"
          ></span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="overview-grid">
        <!-- Left Column -->
        <div class="overview-left" style="display: flex; flex-direction: column; gap: 24px;">
          <!-- Team Info Card -->
          <div class="bg-white rounded-xl p-5" style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <h3 class="font-bold mb-4" style="font-family: 'Montserrat', sans-serif; font-size: 16px; color: #000F49;">{{ $t('teams.teamInfo') }}</h3>
            <div class="flex flex-col gap-3.5">
              <div class="flex items-start gap-3">
                <span style="font-size: 16px;">📅</span>
                <div class="flex-1 flex items-center justify-between">
                  <span style="font-size: 13px; color: #666;">{{ $t('teams.founded') }}</span>
                  <span class="font-semibold" style="font-size: 13px; color: #333;">{{ team.founded }}{{ locale === 'zh' ? '年' : '' }}</span>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span style="font-size: 16px;">🌐</span>
                <div class="flex-1 flex items-center justify-between">
                  <span style="font-size: 13px; color: #666;">{{ $t('teams.joinedFifa') }}</span>
                  <span class="font-semibold" style="font-size: 13px; color: #333;">{{ team.joinedFifa }}{{ locale === 'zh' ? '年' : '' }}</span>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span style="font-size: 16px;">👔</span>
                <div class="flex-1">
                  <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                    <span style="font-size: 13px; color: #666; white-space: nowrap; flex-shrink: 0;">{{ $t('teams.headCoach') }}</span>
                    <span class="font-semibold" style="font-size: 13px; color: #333; text-align: right;">{{ locale === 'en' ? team.coachEn : team.coachZh }}</span>
                  </div>
                  <div style="font-size: 12px; color: #999; text-align: right;">{{ locale === 'en' ? team.coachZh : team.coachEn }}</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span style="font-size: 16px;">©️</span>
                <div class="flex-1">
                  <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                    <span style="font-size: 13px; color: #666; white-space: nowrap; flex-shrink: 0;">{{ $t('teams.captain') }}</span>
                    <span class="font-semibold" style="font-size: 13px; color: #333; text-align: right;">{{ locale === 'en' ? team.captainEn : team.captainZh }}</span>
                  </div>
                  <div style="font-size: 12px; color: #999; text-align: right;">{{ locale === 'en' ? team.captainZh : team.captainEn }}</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span style="font-size: 16px;">🏟️</span>
                <div class="flex-1">
                  <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                    <span style="font-size: 13px; color: #666; white-space: nowrap; flex-shrink: 0;">{{ $t('teams.homeStadium') }}</span>
                    <span class="font-semibold" style="font-size: 13px; color: #333; text-align: right;">{{ locale === 'en' ? team.stadiumEn : team.stadiumZh }}</span>
                  </div>
                  <div style="font-size: 12px; color: #999; text-align: right;">{{ locale === 'en' ? team.stadiumLocationEn : team.stadiumLocationZh }}</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span style="font-size: 16px;">⚡</span>
                <div style="flex: 1; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                  <span style="font-size: 13px; color: #666; white-space: nowrap; flex-shrink: 0;">{{ $t('teams.nickname') }}</span>
                  <span class="font-semibold" style="font-size: 13px; color: #333; text-align: right;">{{ locale === 'en' ? team.nicknameEn : team.nicknameZh }}</span>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span style="font-size: 16px;">🎨</span>
                <div class="flex-1 flex items-center justify-between">
                  <span style="font-size: 13px; color: #666;">{{ $t('teams.teamColors') }}</span>
                  <div class="flex items-center gap-1.5">
                    <span v-for="(color, i) in team.colors" :key="i" class="inline-block w-4 h-4 rounded-full border" :style="`background: ${color}; border-color: #ddd;`"></span>
                    <span style="font-size: 12px; color: #999; margin-left: 4px;">{{ locale === 'en' ? team.colorNameEn : team.colorNameZh }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Honors Card -->
          <div class="bg-white rounded-xl p-5" style="box-shadow: 0 2px 8px rgba(0,0,0,0.06); flex: 1; display: flex; flex-direction: column;">
            <h3 class="font-bold mb-4" style="font-family: 'Montserrat', sans-serif; font-size: 16px; color: #000F49;">{{ $t('teams.honors') }}</h3>
            <div class="flex flex-col gap-3" style="flex: 1;">
              <div v-for="(honor, i) in team.honors" :key="i" class="flex items-center gap-2">
                <span style="font-size: 16px;">🏆</span>
                <span class="flex-1" style="font-size: 13px; color: #333;">{{ locale === 'en' ? honor.nameEn : honor.nameZh }}</span>
                <span class="font-semibold" style="font-size: 13px; color: #000F49;">{{ honor.count }}{{ locale === 'zh' ? '次' : '' }} {{ honor.years ? `(${honor.years})` : '' }}</span>
              </div>
            </div>
            <div class="btn-view-more-wrapper">
              <button class="btn-view-more">{{ $t('teams.viewAllHonors') }}</button>
            </div>
          </div>
        </div>

        <!-- Center Column -->
        <div class="overview-center" style="display: flex; flex-direction: column; gap: 24px;">
          <!-- Key Stats Card -->
          <div class="bg-white rounded-xl p-5" style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 16px; color: #000F49;">{{ $t('teams.keyStats') }}</h3>
              <span style="font-size: 12px; color: #999;">{{ $t('teams.asOf') }}</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; text-align: center;">
              <div>
                <div class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 28px; color: #FFD700;">{{ team.stats.ranking }}</div>
                <div style="font-size: 12px; color: #666;">{{ $t('teams.fifaRanking') }}</div>
                <div style="font-size: 11px; color: #999;">{{ $t('teams.worldRanking') }}</div>
              </div>
              <div>
                <div class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 28px; color: #FFD700;">{{ team.stats.points }}</div>
                <div style="font-size: 12px; color: #666;">{{ locale === 'zh' ? '积分' : 'Points' }}</div>
                <div style="font-size: 11px; color: #999;">{{ $t('teams.fifaPoints') }}</div>
              </div>
              <div>
                <div class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 28px; color: #FFD700;">{{ team.stats.winRate }}</div>
                <div style="font-size: 12px; color: #666;">{{ $t('teams.winRate') }}</div>
                <div style="font-size: 11px; color: #999;">{{ $t('teams.last50') }}</div>
              </div>
              <div>
                <div class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 28px; color: #FFD700;">{{ team.stats.goalsPerMatch }}</div>
                <div style="font-size: 12px; color: #666;">{{ $t('teams.goalsPerMatch') }}</div>
                <div style="font-size: 11px; color: #999;">{{ $t('teams.last50') }}</div>
              </div>
              <div>
                <div class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 28px; color: #FFD700;">{{ team.stats.concededPerMatch }}</div>
                <div style="font-size: 12px; color: #666;">{{ $t('teams.concededPerMatch') }}</div>
                <div style="font-size: 11px; color: #999;">{{ $t('teams.last50') }}</div>
              </div>
            </div>
          </div>

          <!-- Recent Matches Card -->
          <div class="bg-white rounded-xl p-5" style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <h3 class="font-bold mb-4" style="font-family: 'Montserrat', sans-serif; font-size: 16px; color: #000F49;">{{ $t('teams.recentMatches') }}</h3>
            <div class="overflow-x-auto">
              <table class="w-full" style="font-size: 13px;">
                <tbody>
                  <tr v-for="(match, i) in team.recentMatches" :key="i" class="border-b last:border-b-0" style="border-color: #F0F0F0;">
                    <td class="py-2.5 pr-2" style="color: #999; white-space: nowrap; font-size: 12px;">
                      {{ match.date }}<br>
                      <span style="font-size: 11px;">{{ locale === 'en' ? match.competitionEn : match.competitionZh }}</span>
                    </td>
                    <td class="py-2.5 px-2">
                      <div class="flex items-center gap-1.5">
                        <img :src="`https://flagcdn.com/w40/${match.homeCode}.png`" style="width: 20px; height: 14px; object-fit: cover; border-radius: 1px;" />
                        <span :class="match.homeCode === team.code ? 'font-semibold' : ''" style="color: #333;">{{ locale === 'en' ? match.homeEn : match.homeZh }}</span>
                      </div>
                    </td>
                    <td class="py-2.5 px-2 text-center font-bold" style="color: #000F49; white-space: nowrap;">{{ match.score }}</td>
                    <td class="py-2.5 px-2">
                      <div class="flex items-center gap-1.5">
                        <img :src="`https://flagcdn.com/w40/${match.awayCode}.png`" style="width: 20px; height: 14px; object-fit: cover; border-radius: 1px;" />
                        <span :class="match.awayCode === team.code ? 'font-semibold' : ''" style="color: #333;">{{ locale === 'en' ? match.awayEn : match.awayZh }}</span>
                      </div>
                    </td>
                    <td class="py-2.5 pl-2 text-right">
                      <span
                        class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                        :style="match.result === 'win' ? 'background: #4CAF50;' : match.result === 'loss' ? 'background: #F44336;' : 'background: #FF9800;'"
                      >
                        {{ match.result === 'win' ? $t('teams.win') : match.result === 'loss' ? $t('teams.loss') : $t('teams.draw') }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="btn-view-more-wrapper">
              <button class="btn-view-more">{{ $t('teams.viewAllMatches') }}</button>
            </div>
          </div>

          <!-- World Cup History Card -->
          <div class="bg-white rounded-xl p-5" style="box-shadow: 0 2px 8px rgba(0,0,0,0.06); flex: 1; display: flex; flex-direction: column;">
            <h3 class="font-bold mb-4" style="font-family: 'Montserrat', sans-serif; font-size: 16px; color: #000F49;">{{ $t('teams.worldCupHistory') }}</h3>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; text-align: center; margin-bottom: 20px;">
              <div v-for="(stat, i) in team.wcStats" :key="i">
                <div class="font-bold" :style="`font-family: 'Montserrat', sans-serif; font-size: 24px; color: ${i === 0 ? '#FFD700' : '#000F49'};`">{{ stat.value }}</div>
                <div style="font-size: 11px; color: #666;">{{ locale === 'en' ? stat.labelEn : stat.labelZh }}</div>
              </div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; padding-top: 12px; border-top: 1px solid #F0F0F0;">
              <div class="flex items-center gap-2">
                <span style="font-size: 18px;">🏆</span>
                <div>
                  <div style="font-size: 12px; color: #999;">{{ $t('teams.wcBestResult') }}</div>
                  <div class="font-bold" style="font-size: 14px; color: #000F49;">{{ $t('teams.champion') }} {{ team.bestYears }}</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span style="font-size: 18px;">⚽</span>
                <div>
                  <div style="font-size: 12px; color: #999;">{{ $t('teams.wcLatest') }}</div>
                  <div class="font-bold" style="font-size: 14px; color: #000F49;">2022 {{ locale === 'zh' ? '卡塔尔世界杯' : 'Qatar World Cup' }} 🏆 {{ $t('teams.champion') }}</div>
                </div>
              </div>
            </div>
            <div class="btn-view-more-wrapper" style="margin-top: auto; padding-top: 16px;">
              <button class="btn-view-more">{{ $t('teams.viewDetailHistory') }}</button>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="overview-right" style="display: flex; flex-direction: column; gap: 24px;">
          <!-- Key Players Card -->
          <div class="bg-white rounded-xl p-5" style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <h3 class="font-bold mb-4" style="font-family: 'Montserrat', sans-serif; font-size: 16px; color: #000F49;">{{ $t('teams.keyPlayers') }}</h3>
            <div class="flex flex-col gap-3">
              <div v-for="(player, i) in team.keyPlayers" :key="i" class="flex items-center gap-3">
                <img
                  :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(player.nameEn)}&background=000F49&color=fff&size=80`"
                  :alt="player.nameEn"
                  class="flex-shrink-0 rounded-full"
                  style="width: 40px; height: 40px; object-fit: cover;"
                />
                <div class="flex-1 min-w-0">
                  <div class="font-semibold truncate" style="font-size: 13px; color: #333;">{{ locale === 'en' ? player.nameEn : player.nameZh }}</div>
                  <div class="truncate" style="font-size: 11px; color: #999;">{{ locale === 'en' ? player.nameZh : player.nameEn }}</div>
                </div>
                <div class="text-right flex-shrink-0">
                  <div style="font-size: 12px; color: #666;">{{ locale === 'en' ? player.positionEn : player.positionZh }}</div>
                </div>
                <div class="font-bold flex-shrink-0" style="font-size: 14px; color: #000F49; min-width: 24px; text-align: right;">{{ player.number }}</div>
              </div>
            </div>
            <div class="btn-view-more-wrapper">
              <button class="btn-view-more">{{ $t('teams.viewFullSquad') }}</button>
            </div>
          </div>

          <!-- Formation Card -->
          <div class="bg-white rounded-xl p-5" style="box-shadow: 0 2px 8px rgba(0,0,0,0.06); flex: 1;">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold" style="font-family: 'Montserrat', sans-serif; font-size: 16px; color: #000F49;">{{ $t('teams.formation') }}</h3>
              <span class="font-bold" style="font-size: 16px; color: #333;">4-3-3</span>
            </div>
            <!-- Football pitch -->
            <div class="relative mx-auto" style="width: 100%; aspect-ratio: 3/4; background: #2E7D32; border-radius: 8px; overflow: hidden;">
              <!-- Pitch lines -->
              <div class="absolute inset-2" style="border: 2px solid rgba(255,255,255,0.4); border-radius: 4px;"></div>
              <!-- Center line -->
              <div class="absolute left-2 right-2" style="top: 50%; height: 2px; background: rgba(255,255,255,0.4);"></div>
              <!-- Center circle -->
              <div class="absolute" style="top: 50%; left: 50%; width: 60px; height: 60px; transform: translate(-50%, -50%); border: 2px solid rgba(255,255,255,0.4); border-radius: 50%;"></div>
              <!-- Top penalty area -->
              <div class="absolute" style="top: 8px; left: 50%; transform: translateX(-50%); width: 55%; height: 18%; border: 2px solid rgba(255,255,255,0.4); border-radius: 0 0 2px 2px;"></div>
              <!-- Bottom penalty area -->
              <div class="absolute" style="bottom: 8px; left: 50%; transform: translateX(-50%); width: 55%; height: 18%; border: 2px solid rgba(255,255,255,0.4); border-radius: 2px 2px 0 0;"></div>
              <!-- Players - 4-3-3 formation (attacking upward) -->
              <!-- GK -->
              <div class="absolute flex items-center justify-center rounded-full text-white text-xs font-bold" style="width: 28px; height: 28px; background: #000F49; border: 2px solid #FFD700; bottom: 6%; left: 50%; transform: translateX(-50%);">23</div>
              <!-- Defenders (4) -->
              <div class="absolute flex items-center justify-center rounded-full text-white text-xs font-bold" style="width: 28px; height: 28px; background: #000F49; border: 2px solid white; bottom: 22%; left: 12%;">3</div>
              <div class="absolute flex items-center justify-center rounded-full text-white text-xs font-bold" style="width: 28px; height: 28px; background: #000F49; border: 2px solid white; bottom: 22%; left: 35%;">19</div>
              <div class="absolute flex items-center justify-center rounded-full text-white text-xs font-bold" style="width: 28px; height: 28px; background: #000F49; border: 2px solid white; bottom: 22%; right: 35%;">13</div>
              <div class="absolute flex items-center justify-center rounded-full text-white text-xs font-bold" style="width: 28px; height: 28px; background: #000F49; border: 2px solid white; bottom: 22%; right: 12%;">26</div>
              <!-- Midfielders (3) -->
              <div class="absolute flex items-center justify-center rounded-full text-white text-xs font-bold" style="width: 28px; height: 28px; background: #000F49; border: 2px solid white; bottom: 44%; left: 18%;">7</div>
              <div class="absolute flex items-center justify-center rounded-full text-white text-xs font-bold" style="width: 28px; height: 28px; background: #000F49; border: 2px solid white; bottom: 44%; left: 50%; transform: translateX(-50%);">24</div>
              <div class="absolute flex items-center justify-center rounded-full text-white text-xs font-bold" style="width: 28px; height: 28px; background: #000F49; border: 2px solid white; bottom: 44%; right: 18%;">20</div>
              <!-- Forwards (3) -->
              <div class="absolute flex items-center justify-center rounded-full text-white text-xs font-bold" style="width: 28px; height: 28px; background: #1565C0; border: 2px solid #FFD700; top: 14%; left: 15%;">10</div>
              <div class="absolute flex items-center justify-center rounded-full text-white text-xs font-bold" style="width: 28px; height: 28px; background: #1565C0; border: 2px solid #FFD700; top: 14%; left: 50%; transform: translateX(-50%);">22</div>
              <div class="absolute flex items-center justify-center rounded-full text-white text-xs font-bold" style="width: 28px; height: 28px; background: #1565C0; border: 2px solid #FFD700; top: 14%; right: 15%;">11</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Other tabs placeholder -->
      <div v-else class="text-center py-20">
        <div style="font-size: 48px; margin-bottom: 16px;">🚧</div>
        <p style="font-size: 18px; color: #666; font-family: 'Montserrat', sans-serif; font-weight: 600;">{{ $t('teams.tabPlaceholder') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()

const activeTab = ref('overview')

const tabs = computed(() => [
  { key: 'overview', label: t('teams.overview') },
  { key: 'squad', label: t('teams.squad') },
  { key: 'history', label: t('teams.matchHistory') },
  { key: 'stats', label: t('teams.statistics') },
  { key: 'news', label: t('teams.newsTab') },
])

// Mock data for Argentina
const team = {
  id: 'argentina',
  nameZh: '阿根廷',
  nameEn: 'Argentina',
  code: 'ar',
  group: 'A',
  confederation: 'CONMEBOL',
  fifaRank: 1,
  appearances: 18,
  bestYears: '1978, 1986',
  founded: 1893,
  joinedFifa: 1912,
  coachZh: '莱昂内尔·斯卡洛尼',
  coachEn: 'Lionel Scaloni',
  captainZh: '莱昂内尔·梅西',
  captainEn: 'Lionel Messi',
  stadiumZh: '纪念碑球场 (Estadio Monumental)',
  stadiumEn: 'Estadio Monumental',
  stadiumLocationZh: '布宜诺斯艾利斯, 阿根廷',
  stadiumLocationEn: 'Buenos Aires, Argentina',
  nicknameZh: '潘帕斯雄鹰 (La Albiceleste)',
  nicknameEn: 'La Albiceleste',
  colors: ['#75AADB', '#FFFFFF'],
  colorNameZh: '天蓝白',
  colorNameEn: 'Sky Blue & White',
  honors: [
    { nameZh: '世界杯冠军', nameEn: 'World Cup', count: 2, years: '1978, 1986' },
    { nameZh: '美洲杯冠军', nameEn: 'Copa América', count: 15, years: '' },
    { nameZh: '联合会杯冠军', nameEn: 'Confederations Cup', count: 1, years: '1992' },
    { nameZh: '联美杯冠军', nameEn: 'CONMEBOL–UEFA Cup', count: 1, years: '1993' },
  ],
  stats: {
    ranking: 1,
    points: '1855.2',
    winRate: '85.7%',
    goalsPerMatch: '2.1',
    concededPerMatch: '0.8',
  },
  recentMatches: [
    { date: '2024-03-21', competitionZh: '友谊赛', competitionEn: 'Friendly', homeZh: '阿根廷', homeEn: 'Argentina', homeCode: 'ar', score: '3 - 1', awayZh: '哥斯达黎加', awayEn: 'Costa Rica', awayCode: 'cr', result: 'win' },
    { date: '2024-03-23', competitionZh: '友谊赛', competitionEn: 'Friendly', homeZh: '阿根廷', homeEn: 'Argentina', homeCode: 'ar', score: '2 - 0', awayZh: '萨尔瓦多', awayEn: 'El Salvador', awayCode: 'sv', result: 'win' },
    { date: '2023-11-22', competitionZh: '友谊赛', competitionEn: 'Friendly', homeZh: '阿根廷', homeEn: 'Argentina', homeCode: 'ar', score: '1 - 0', awayZh: '巴西', awayEn: 'Brazil', awayCode: 'br', result: 'win' },
    { date: '2023-11-17', competitionZh: '世预赛', competitionEn: 'WC Qualifier', homeZh: '阿根廷', homeEn: 'Argentina', homeCode: 'ar', score: '0 - 2', awayZh: '乌拉圭', awayEn: 'Uruguay', awayCode: 'uy', result: 'loss' },
    { date: '2023-10-18', competitionZh: '友谊赛', competitionEn: 'Friendly', homeZh: '阿根廷', homeEn: 'Argentina', homeCode: 'ar', score: '1 - 0', awayZh: '秘鲁', awayEn: 'Peru', awayCode: 'pe', result: 'win' },
  ],
  wcStats: [
    { value: 18, labelZh: '参赛次数', labelEn: 'Appearances' },
    { value: 81, labelZh: '总场次', labelEn: 'Matches' },
    { value: 46, labelZh: '胜场', labelEn: 'Wins' },
    { value: 17, labelZh: '平场', labelEn: 'Draws' },
    { value: 18, labelZh: '负场', labelEn: 'Losses' },
    { value: 137, labelZh: '进球', labelEn: 'Goals' },
    { value: 80, labelZh: '失球', labelEn: 'Conceded' },
  ],
  keyPlayers: [
    { nameZh: '莱昂内尔·梅西', nameEn: 'Lionel Messi', positionZh: '前锋', positionEn: 'Forward', number: 10 },
    { nameZh: '劳塔罗·马丁内斯', nameEn: 'Lautaro Martinez', positionZh: '前锋', positionEn: 'Forward', number: 22 },
    { nameZh: '罗德里戈·德保罗', nameEn: 'Rodrigo De Paul', positionZh: '中场', positionEn: 'Midfielder', number: 7 },
    { nameZh: '恩佐·费尔南德斯', nameEn: 'Enzo Fernández', positionZh: '中场', positionEn: 'Midfielder', number: 24 },
    { nameZh: '克里斯蒂安·罗梅罗', nameEn: 'Cristian Romero', positionZh: '后卫', positionEn: 'Defender', number: 13 },
  ],
}

// Group A teams for the group card
const groupTeams = [
  { nameZh: '阿根廷', nameEn: 'Argentina', code: 'ar' },
  { nameZh: '墨西哥', nameEn: 'Mexico', code: 'mx' },
  { nameZh: '波兰', nameEn: 'Poland', code: 'pl' },
  { nameZh: '沙特阿拉伯', nameEn: 'Saudi Arabia', code: 'sa' },
]

// SEO
useHead({
  title: () => `${locale.value === 'en' ? team.nameEn : team.nameZh} - WorldCupDex`,
});
</script>

<style scoped>
/* Hero layout */
.hero-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.hero-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  flex: 1;
}
.hero-group-card {
  width: 100%;
  min-width: 220px;
}

@media (min-width: 768px) {
  .hero-main {
    flex-direction: row;
    align-items: center;
  }
}

@media (min-width: 1024px) {
  .hero-layout {
    flex-direction: row;
    align-items: center;
    gap: 40px;
  }
  .hero-group-card {
    width: auto;
    flex-shrink: 0;
  }
}

/* Overview grid */
.overview-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 1024px) {
  .overview-grid {
    grid-template-columns: 3fr 6fr 3fr;
  }
}
</style>
