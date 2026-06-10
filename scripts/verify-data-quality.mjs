import { execFileSync } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const DATA_DIR = join(PROJECT_ROOT, 'data');
const TEAMS_DIR = join(DATA_DIR, 'teams');

const EXPECTED = {
  teams: 48,
  matches: 104,
  venues: 16,
  groupStageMatches: 72,
  knockoutMatches: 32,
};

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function fail(checks, code, message) {
  checks.push({ status: 'fail', code, message });
}

function pass(checks, code, message) {
  checks.push({ status: 'pass', code, message });
}

function warn(checks, code, message) {
  checks.push({ status: 'warn', code, message });
}

function formatTimeInZone(match, timeZone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(`${match.date}T${match.time}:00Z`));
}

function loadCurrentDataset() {
  const teams = readJson(join(DATA_DIR, 'teams.json'));
  const matches = readJson(join(DATA_DIR, 'matches.json'));
  const venues = readJson(join(DATA_DIR, 'venues.json'));
  const details = readdirSync(TEAMS_DIR)
    .filter(file => file.endsWith('.json'))
    .sort()
    .map(file => readJson(join(TEAMS_DIR, file)));
  return { teams, matches, venues, details };
}

function tryGitShowJson(path) {
  try {
    const output = execFileSync('git', ['show', `HEAD:${path}`], {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return JSON.parse(output);
  } catch {
    return null;
  }
}

function verifyCounts(checks, dataset) {
  const groupStage = dataset.matches.filter(match => match.stage === 'GROUP_STAGE').length;
  const knockout = dataset.matches.length - groupStage;
  const assertions = [
    ['teams-count', dataset.teams.length, EXPECTED.teams, 'teams'],
    ['team-detail-count', dataset.details.length, EXPECTED.teams, 'team detail files'],
    ['matches-count', dataset.matches.length, EXPECTED.matches, 'matches'],
    ['venues-count', dataset.venues.length, EXPECTED.venues, 'venues'],
    ['group-stage-count', groupStage, EXPECTED.groupStageMatches, 'group-stage matches'],
    ['knockout-count', knockout, EXPECTED.knockoutMatches, 'knockout matches'],
  ];

  for (const [code, actual, expected, label] of assertions) {
    if (actual === expected) pass(checks, code, `${label}: ${actual}`);
    else fail(checks, code, `${label}: expected ${expected}, received ${actual}`);
  }
}

function verifySchedule(checks, dataset) {
  const blankVenues = dataset.matches.filter(match => !match.venue?.name || !match.venue?.city);
  if (blankVenues.length === 0) pass(checks, 'match-venues-present', 'all 104 matches include venue name and city');
  else fail(checks, 'match-venues-present', `${blankVenues.length} matches are missing venue name/city`);

  const missingTimeZones = dataset.matches.filter(match => !match.venue?.timeZone);
  if (missingTimeZones.length === 0) pass(checks, 'match-venue-timezones', 'all 104 matches include venue time zone');
  else fail(checks, 'match-venue-timezones', `${missingTimeZones.length} matches are missing venue time zone`);

  const venueNames = new Set(dataset.venues.map(venue => venue.name));
  const unknownVenueMatches = dataset.matches.filter(match => !venueNames.has(match.venue?.name));
  if (unknownVenueMatches.length === 0) pass(checks, 'match-venues-known', 'all match venues exist in data/venues.json');
  else fail(checks, 'match-venues-known', `${unknownVenueMatches.length} matches reference venues not listed in data/venues.json`);

  const venueTimeZoneMismatch = dataset.matches.filter((match) => {
    const venue = dataset.venues.find(candidate => candidate.name === match.venue?.name);
    return venue?.timeZone && match.venue?.timeZone !== venue.timeZone;
  });
  if (venueTimeZoneMismatch.length === 0) pass(checks, 'match-venue-timezone-consistency', 'match venue time zones match data/venues.json');
  else fail(checks, 'match-venue-timezone-consistency', `${venueTimeZoneMismatch.length} matches have venue time zone mismatches`);

  const opener = dataset.matches[0];
  if (
    opener?.homeTeam?.id === 'mexico'
    && opener?.awayTeam?.id === 'south-africa'
    && opener?.venue?.name === 'Mexico City Stadium'
    && opener?.date === '2026-06-11'
    && opener?.time === '19:00'
    && opener?.venue?.timeZone === 'America/Mexico_City'
  ) {
    pass(checks, 'opener-fixture', 'opener is Mexico vs South Africa at Mexico City Stadium, 2026-06-11 19:00 UTC');
  } else {
    fail(checks, 'opener-fixture', `unexpected opener: ${opener?.homeTeam?.nameEn} vs ${opener?.awayTeam?.nameEn} at ${opener?.venue?.name} ${opener?.date} ${opener?.time} ${opener?.venue?.timeZone}`);
  }

  const openerVenueTime = opener ? formatTimeInZone(opener, 'America/Mexico_City') : '';
  if (openerVenueTime === '13:00') pass(checks, 'opener-venue-time', 'opener renders as 13:00 in Mexico City time');
  else fail(checks, 'opener-venue-time', `opener venue time expected 13:00, received ${openerVenueTime || '(missing)'}`);

  const final = dataset.matches.find(match => match.stage === 'FINAL');
  if (final?.venue?.name === 'New York New Jersey Stadium') {
    pass(checks, 'final-venue', 'final venue is New York New Jersey Stadium');
  } else {
    fail(checks, 'final-venue', `unexpected final venue: ${final?.venue?.name || '(missing)'}`);
  }
}

function verifyGroups(checks, dataset) {
  const groupByTeamId = new Map();
  for (const match of dataset.matches.filter(match => match.stage === 'GROUP_STAGE')) {
    if (!match.group) continue;
    for (const side of ['homeTeam', 'awayTeam']) {
      const teamId = match[side]?.id;
      if (teamId && teamId !== 'tbd') groupByTeamId.set(teamId, match.group);
    }
  }

  const mismatches = dataset.teams.filter(team => groupByTeamId.has(team.id) && team.group !== groupByTeamId.get(team.id));
  if (mismatches.length === 0) pass(checks, 'team-group-consistency', 'team groups match group-stage fixtures');
  else fail(checks, 'team-group-consistency', `${mismatches.length} teams have groups inconsistent with fixtures`);
}

function verifySquads(checks, dataset) {
  const detailsById = new Map(dataset.details.map(team => [team.id, team]));
  const missingDetails = dataset.teams.filter(team => !detailsById.has(team.id));
  if (missingDetails.length === 0) pass(checks, 'team-details-present', 'each team has a detail file');
  else fail(checks, 'team-details-present', `${missingDetails.length} teams are missing detail files`);

  const counts = dataset.details.map(team => ({ id: team.id, count: Array.isArray(team.squad) ? team.squad.length : 0 }));
  const underfilled = counts.filter(team => team.count < 26);
  if (underfilled.length === 0) pass(checks, 'squad-min-size', 'all squads have at least 26 players');
  else fail(checks, 'squad-min-size', `${underfilled.length} squads have fewer than 26 players`);

  const overfilled = counts.filter(team => team.count > 26);
  if (overfilled.length === 0) pass(checks, 'squad-size-26', 'all squads have 26 players');
  else warn(checks, 'squad-size-26', `${overfilled.length} squads have more than 26 players: ${overfilled.map(team => `${team.id}=${team.count}`).join(', ')}`);
}

function hasAnyPhoto(player) {
  return Boolean(player?.photo || player?.photoCutout || player?.photoThumb);
}

function verifyPhotoRetention(checks, dataset) {
  if (!existsSync(join(PROJECT_ROOT, '.git'))) {
    warn(checks, 'photo-retention', 'skipped because .git is not available');
    return;
  }

  const currentByTeam = new Map(dataset.details.map(team => [
    team.id,
    new Map((team.squad || []).map(player => [player.name, player])),
  ]));

  let comparable = 0;
  const lost = [];

  for (const currentTeam of dataset.details) {
    const oldTeam = tryGitShowJson(`data/teams/${currentTeam.id}.json`);
    if (!oldTeam) continue;
    for (const oldPlayer of oldTeam.squad || []) {
      if (!hasAnyPhoto(oldPlayer)) continue;
      const currentPlayer = currentByTeam.get(currentTeam.id)?.get(oldPlayer.name);
      if (!currentPlayer) continue;
      comparable++;
      if (!hasAnyPhoto(currentPlayer)) lost.push(`${currentTeam.id}/${oldPlayer.name}`);
    }
  }

  if (lost.length === 0) pass(checks, 'photo-retention', `${comparable} existing player photo records retained`);
  else fail(checks, 'photo-retention', `${lost.length} existing player photo records were lost: ${lost.slice(0, 10).join(', ')}`);
}

function main() {
  const checks = [];
  const dataset = loadCurrentDataset();

  verifyCounts(checks, dataset);
  verifySchedule(checks, dataset);
  verifyGroups(checks, dataset);
  verifySquads(checks, dataset);
  verifyPhotoRetention(checks, dataset);

  const failed = checks.filter(check => check.status === 'fail');
  const warned = checks.filter(check => check.status === 'warn');

  console.log('WorldCupDex data quality verification');
  for (const check of checks) {
    const icon = check.status === 'pass' ? 'PASS' : check.status === 'warn' ? 'WARN' : 'FAIL';
    console.log(`  [${icon}] ${check.code}: ${check.message}`);
  }
  console.log(`Summary: ${checks.length - failed.length - warned.length} passed, ${warned.length} warnings, ${failed.length} failures.`);

  if (failed.length > 0) process.exitCode = 1;
}

main();
