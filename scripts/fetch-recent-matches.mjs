/**
 * Fetch Recent Matches for World Cup Teams
 * 
 * For each team in the 2026 FIFA World Cup, fetches their last 5 finished matches
 * from football-data.org and writes the data into the team detail JSON files.
 *
 * Usage: FOOTBALL_DATA_API_KEY=your_key node scripts/fetch-recent-matches.mjs
 */

import { readFile, writeFile } from 'fs/promises';
import { updateDataMeta } from './lib/update-data-meta.mjs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const DATA_DIR = join(PROJECT_ROOT, 'data');
const TEAMS_DIR = join(DATA_DIR, 'teams');

// ============================================================
// Configuration
// ============================================================

const API_BASE = 'https://api.football-data.org/v4';
const REQUEST_DELAY_MS = 6200; // 6.2s between requests (free tier: 10 req/min)
const MAX_RETRIES = 3;

// Load API key from environment or .env file
let API_KEY = process.env.FOOTBALL_DATA_API_KEY;
if (!API_KEY) {
  try {
    const envContent = await readFile(join(PROJECT_ROOT, '.env'), 'utf-8');
    const match = envContent.match(/FOOTBALL_DATA_API_KEY=(.+)/);
    if (match) API_KEY = match[1].trim();
  } catch { /* .env file not found, that's ok */ }
}

// ============================================================
// Team Name Aliases (API name → normalized name for matching)
// ============================================================

const NAME_ALIASES = {
  'Korea Republic': 'South Korea',
  'Korea, Republic of': 'South Korea',
  'USA': 'United States',
  'Türkiye': 'Turkey',
  'Bosnia and Herzegovina': 'Bosnia-Herzegovina',
  'DR Congo': 'Congo DR',
  "Côte d'Ivoire": 'Ivory Coast',
  'Cape Verde': 'Cape Verde Islands',
  'Curaçao': 'Curaçao',
  'United Arab Emirates': 'UAE',
};

// ============================================================
// Utility Functions
// ============================================================

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function normalizeTeamName(name) {
  if (!name) return '';
  return NAME_ALIASES[name] || name;
}

// ============================================================
// API Fetch with Retry (exponential backoff)
// ============================================================

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log(`  Fetching: ${url} (attempt ${attempt}/${retries})`);
      const response = await fetch(url, {
        headers: { 'X-Auth-Token': API_KEY },
      });

      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt) * 30000; // 30s, 60s, 120s
        log(`  ⚠ Rate limited (429). Waiting ${waitTime / 1000}s before retry...`);
        await delay(waitTime);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Failed after ${retries} attempts: ${error.message}`);
      }
      const backoffTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      log(`  ✗ Error: ${error.message}. Retrying in ${backoffTime / 1000}s...`);
      await delay(backoffTime);
    }
  }
}

// ============================================================
// Build team ID mapping: football-data numeric ID → our team id
// ============================================================

async function buildTeamMapping(apiTeams, localTeams) {
  const mapping = new Map(); // numericId → { ourId, nameEn }

  // Index local teams by normalized nameEn (lowercase)
  const localByName = new Map();
  for (const t of localTeams) {
    localByName.set(t.nameEn.toLowerCase(), t.id);
    // Also index by normalized alias
    const normalized = normalizeTeamName(t.nameEn);
    if (normalized !== t.nameEn) {
      localByName.set(normalized.toLowerCase(), t.id);
    }
  }

  for (const apiTeam of apiTeams) {
    const numericId = apiTeam.id;
    const apiName = apiTeam.name || apiTeam.shortName || '';
    const apiShortName = apiTeam.shortName || '';
    const apiTla = apiTeam.tla || '';

    // Try matching in order: name → normalized name → shortName → TLA
    const candidates = [
      apiName,
      normalizeTeamName(apiName),
      apiShortName,
      normalizeTeamName(apiShortName),
    ];

    let ourId = null;
    for (const candidate of candidates) {
      if (candidate && localByName.has(candidate.toLowerCase())) {
        ourId = localByName.get(candidate.toLowerCase());
        break;
      }
    }

    if (ourId) {
      mapping.set(numericId, { ourId, nameEn: apiName });
      log(`  ✓ Mapped: ${apiName} (API #${numericId}) → ${ourId}`);
    } else {
      log(`  ⚠ No match for API team: ${apiName} (#${numericId})`);
    }
  }

  return mapping;
}

// ============================================================
// Determine match result relative to the given team
// ============================================================

function getResult(match, teamNumericId) {
  const homeScore = match.score?.fullTime?.home;
  const awayScore = match.score?.fullTime?.away;
  if (homeScore == null || awayScore == null) return null;

  const isHome = match.homeTeam?.id === teamNumericId;
  const teamScore = isHome ? homeScore : awayScore;
  const opponentScore = isHome ? awayScore : homeScore;

  if (teamScore > opponentScore) return 'W';
  if (teamScore < opponentScore) return 'L';
  return 'D';
}

// ============================================================
// Process a single match into our recentMatches format
// ============================================================

function processRecentMatch(match, teamNumericId) {
  const homeScore = match.score?.fullTime?.home;
  const awayScore = match.score?.fullTime?.away;
  const date = match.utcDate ? match.utcDate.split('T')[0] : '';
  const competition = match.competition?.name || '';
  const homeTeam = match.homeTeam?.name || match.homeTeam?.shortName || 'Unknown';
  const awayTeam = match.awayTeam?.name || match.awayTeam?.shortName || 'Unknown';

  return {
    date,
    competition,
    homeTeam,
    awayTeam,
    scoreHome: homeScore ?? null,
    scoreAway: awayScore ?? null,
    result: getResult(match, teamNumericId),
  };
}

// ============================================================
// Main Script
// ============================================================

async function main() {
  console.log('='.repeat(60));
  console.log('  Fetch Recent Matches for World Cup Teams');
  console.log('='.repeat(60));
  console.log('');

  // Check API Key
  if (!API_KEY) {
    console.error('❌ Error: FOOTBALL_DATA_API_KEY is not set.');
    console.error('Set it via environment variable or in .env file.');
    process.exit(1);
  }

  // ---- Step 1: Load local teams.json ----
  log('Step 1: Loading local teams.json...');
  let localTeams;
  try {
    const raw = await readFile(join(DATA_DIR, 'teams.json'), 'utf-8');
    localTeams = JSON.parse(raw);
    log(`  ✓ Loaded ${localTeams.length} local teams`);
  } catch (error) {
    console.error(`❌ Failed to read teams.json: ${error.message}`);
    console.error('  Run "npm run fetch-data" first to generate teams.json');
    process.exit(1);
  }

  // ---- Step 2: Fetch WC teams from API for numeric IDs ----
  log('Step 2: Fetching WC teams from API...');
  let apiTeamsData;
  try {
    apiTeamsData = await fetchWithRetry(`${API_BASE}/competitions/WC/teams`);
    log(`  ✓ Received ${apiTeamsData.teams?.length || 0} teams from API`);
  } catch (error) {
    console.error(`❌ Failed to fetch WC teams: ${error.message}`);
    process.exit(1);
  }

  // ---- Step 3: Build mapping ----
  log('Step 3: Building team ID mapping...');
  const teamMapping = await buildTeamMapping(apiTeamsData.teams || [], localTeams);
  log(`  ✓ Successfully mapped ${teamMapping.size} teams`);

  await delay(REQUEST_DELAY_MS);

  // ---- Step 4: Fetch recent matches for each team ----
  log('Step 4: Fetching recent matches for each team...');
  const stats = { success: 0, failed: 0, skipped: 0, totalMatches: 0 };
  const entries = Array.from(teamMapping.entries());

  for (let i = 0; i < entries.length; i++) {
    const [numericId, { ourId, nameEn }] = entries[i];
    log(`  [${i + 1}/${entries.length}] ${nameEn} (#${numericId}) → ${ourId}`);

    try {
      const matchesData = await fetchWithRetry(
        `${API_BASE}/teams/${numericId}/matches?status=FINISHED&limit=5`
      );

      const matches = (matchesData.matches || []).map(m => processRecentMatch(m, numericId));
      // Sort by date descending (most recent first)
      matches.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

      // Read existing team detail file and merge recentMatches
      const teamFilePath = join(TEAMS_DIR, `${ourId}.json`);
      let teamData;
      try {
        const raw = await readFile(teamFilePath, 'utf-8');
        teamData = JSON.parse(raw);
      } catch {
        log(`    ⚠ Team file not found: ${ourId}.json, skipping...`);
        stats.skipped++;
        if (i < entries.length - 1) await delay(REQUEST_DELAY_MS);
        continue;
      }

      teamData.recentMatches = matches;
      await writeFile(teamFilePath, JSON.stringify(teamData, null, 2), 'utf-8');
      log(`    ✓ Wrote ${matches.length} recent matches to ${ourId}.json`);

      stats.success++;
      stats.totalMatches += matches.length;
    } catch (error) {
      log(`    ✗ Failed: ${error.message}`);
      stats.failed++;
    }

    // Rate limit: wait between requests
    if (i < entries.length - 1) {
      await delay(REQUEST_DELAY_MS);
    }
  }

  if (stats.success > 0) {
    updateDataMeta(['squadsLastUpdated'], 'fetch-recent-matches');
  }

  // ---- Summary ----
  console.log('');
  console.log('='.repeat(60));
  console.log('  Fetch Recent Matches Complete! Summary:');
  console.log('='.repeat(60));
  console.log(`  📋 Teams mapped:     ${teamMapping.size}`);
  console.log(`  ✅ Success:          ${stats.success}`);
  console.log(`  ❌ Failed:           ${stats.failed}`);
  console.log(`  ⏭  Skipped:          ${stats.skipped}`);
  console.log(`  ⚽ Total matches:    ${stats.totalMatches}`);
  console.log(`  📁 Output:           ${TEAMS_DIR}`);
  console.log('='.repeat(60));
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
