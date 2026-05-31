import { readFileSync, readdirSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const dataDir = join(projectRoot, 'data');
const teamsDir = join(dataDir, 'teams');
const allowedPlaceholderTeamIds = new Set(['tbd']);
const validSquadStatuses = new Set(['official', 'provisional', 'incomplete']);

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function loadDataset() {
  const teams = readJson(join(dataDir, 'teams.json'));
  const matches = readJson(join(dataDir, 'matches.json'));
  const meta = readJson(join(dataDir, 'meta.json'));
  const details = readdirSync(teamsDir)
    .filter(file => file.endsWith('.json'))
    .sort()
    .map(file => ({
      file,
      data: readJson(join(teamsDir, file)),
    }));

  return { teams, details, matches, meta };
}

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isValidTime(value) {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(':').map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function isValidTimestamp(value) {
  if (typeof value === 'number') return Number.isFinite(value) && !Number.isNaN(new Date(value).getTime());
  if (typeof value === 'string') return value.length > 0 && !Number.isNaN(new Date(value).getTime());
  return false;
}

function validateDataset(dataset) {
  const errors = [];
  const warnings = [];
  const error = (code, message) => errors.push({ code, message });
  const warn = (code, message) => warnings.push({ code, message });
  const { teams, details, matches } = dataset;
  const listById = new Map();
  const detailById = new Map();
  for (const field of ['scheduleLastUpdated', 'teamsLastUpdated', 'squadsLastUpdated', 'rankingsLastUpdated']) {
    if (!isValidTimestamp(dataset.meta[field])) {
      error('invalid-data-meta-timestamp', `data/meta.json has invalid ${field} "${dataset.meta[field]}".`);
    }
  }
  if (!dataset.meta.source || typeof dataset.meta.source !== 'string') {
    error('invalid-data-meta-source', 'data/meta.json must include a non-empty source string.');
  }

  for (const team of teams) {
    if (!team.id) {
      error('team-list-missing-id', 'data/teams.json contains a team without an id.');
      continue;
    }
    if (listById.has(team.id)) {
      error('duplicate-team-id', `data/teams.json contains duplicate team id "${team.id}".`);
      continue;
    }
    listById.set(team.id, team);
  }

  for (const { file, data: detail } of details) {
    const expectedId = basename(file, '.json');
    if (!detail.id) {
      error('team-detail-missing-id', `${file} is missing id.`);
      continue;
    }
    if (detail.id !== expectedId) {
      error('team-detail-file-id-mismatch', `${file} declares id "${detail.id}", expected "${expectedId}".`);
    }
    if (detailById.has(detail.id)) {
      error('duplicate-team-detail-id', `Team detail id "${detail.id}" appears in multiple files.`);
      continue;
    }
    detailById.set(detail.id, detail);
  }

  for (const [id, listTeam] of listById) {
    const detail = detailById.get(id);
    if (!detail) {
      error('missing-team-detail', `Team "${id}" is listed in data/teams.json but data/teams/${id}.json is missing.`);
      continue;
    }

    for (const field of ['id', 'group', 'nameEn']) {
      if (listTeam[field] !== detail[field]) {
        error('team-detail-mismatch', `Team "${id}" has inconsistent ${field}: list="${listTeam[field]}", detail="${detail[field]}".`);
      }
    }
  }

  for (const id of detailById.keys()) {
    if (!listById.has(id)) {
      error('orphan-team-detail', `data/teams/${id}.json has no matching entry in data/teams.json.`);
    }
  }

  for (const [id, detail] of detailById) {
    const squad = Array.isArray(detail.squad) ? detail.squad : [];
    const status = detail.squadStatus;

    if (!validSquadStatuses.has(status)) {
      error('invalid-squad-status', `Team "${id}" has invalid squadStatus "${status}".`);
    } else if (status === 'official' && squad.length !== 26) {
      error('invalid-official-squad-size', `Team "${id}" is official but has ${squad.length} players; expected 26.`);
    } else if (status === 'provisional' && squad.length !== 26) {
      warn('provisional-squad-size', `Team "${id}" is provisional and has ${squad.length} players.`);
    } else if (status === 'incomplete' && squad.length < 26) {
      warn('incomplete-squad-size', `Team "${id}" is incomplete and has ${squad.length} players.`);
    }

    if (!isValidDate(detail.squadLastUpdated)) {
      error('invalid-squad-updated-date', `Team "${id}" has invalid squadLastUpdated "${detail.squadLastUpdated}".`);
    }

    const missingPhotos = squad.filter(player => !player.photo).length;
    const missingNumbers = squad.filter(player => player.shirtNumber === null || player.shirtNumber === undefined || player.shirtNumber === '').length;
    if (missingPhotos > 0) warn('missing-player-photo', `Team "${id}" is missing ${missingPhotos}/${squad.length} player photos.`);
    if (missingNumbers > 0) warn('missing-player-number', `Team "${id}" is missing ${missingNumbers}/${squad.length} player shirt numbers.`);
    if (!detail.founded) warn('missing-founded-year', `Team "${id}" is missing founded year.`);
    if (!detail.venue) warn('missing-venue', `Team "${id}" is missing venue information.`);

    for (const player of squad) {
      if (player.dateOfBirth && !isValidDate(player.dateOfBirth)) {
        error('invalid-player-birth-date', `Team "${id}" player "${player.name}" has invalid dateOfBirth "${player.dateOfBirth}".`);
      }
    }

    for (const recentMatch of detail.recentMatches || []) {
      if (recentMatch.date && !isValidDate(recentMatch.date)) {
        error('invalid-recent-match-date', `Team "${id}" has invalid recent match date "${recentMatch.date}".`);
      }
    }
  }

  const seenMatchIds = new Set();
  for (const match of matches) {
    if (seenMatchIds.has(match.id)) {
      error('duplicate-match-id', `data/matches.json contains duplicate match id "${match.id}".`);
    }
    seenMatchIds.add(match.id);

    for (const side of ['homeTeam', 'awayTeam']) {
      const teamId = match[side]?.id;
      if (!teamId) {
        error('match-missing-team-id', `Match "${match.id}" is missing ${side}.id.`);
      } else if (!listById.has(teamId) && !allowedPlaceholderTeamIds.has(teamId)) {
        error('unknown-match-team-id', `Match "${match.id}" references unknown ${side}.id "${teamId}".`);
      }
    }

    if (!isValidDate(match.date)) {
      error('invalid-match-date', `Match "${match.id}" has invalid date "${match.date}".`);
    }
    if (!isValidTime(match.time)) {
      error('invalid-match-time', `Match "${match.id}" has invalid time "${match.time}".`);
    }
    if (match.timestamp !== undefined && match.timestamp !== null && !isValidTimestamp(match.timestamp)) {
      error('invalid-match-timestamp', `Match "${match.id}" has invalid timestamp "${match.timestamp}".`);
    }
  }

  return { errors, warnings };
}

function printIssues(label, issues) {
  console.log(`\n${label}: ${issues.length}`);
  for (const issue of issues) {
    console.log(`  - [${issue.code}] ${issue.message}`);
  }
}

function printSummary(dataset, result) {
  console.log('WorldCupDex data validation');
  console.log(`  Teams: ${dataset.teams.length}`);
  console.log(`  Team detail files: ${dataset.details.length}`);
  console.log(`  Matches: ${dataset.matches.length}`);
  printIssues('Warnings', result.warnings);
  printIssues('Errors', result.errors);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertSelfTest(condition, message) {
  if (!condition) throw new Error(`Self-test failed: ${message}`);
}

function runSelfTest(dataset) {
  const baseResult = validateDataset(dataset);
  assertSelfTest(baseResult.errors.length === 0, 'baseline dataset must have no blocking errors');

  const mismatch = clone(dataset);
  mismatch.details[0].data.group = `${mismatch.details[0].data.group}-test`;
  assertSelfTest(
    validateDataset(mismatch).errors.some(issue => issue.code === 'team-detail-mismatch'),
    'list/detail group mismatch must fail',
  );

  const official = clone(dataset);
  official.details[0].data.squadStatus = 'official';
  official.details[0].data.squad = official.details[0].data.squad.slice(0, 25);
  assertSelfTest(
    validateDataset(official).errors.some(issue => issue.code === 'invalid-official-squad-size'),
    'official squad with a non-26 size must fail',
  );

  const provisional = clone(dataset);
  provisional.details[0].data.squadStatus = 'provisional';
  provisional.details[0].data.squad = provisional.details[0].data.squad.slice(0, 25);
  const provisionalResult = validateDataset(provisional);
  assertSelfTest(
    provisionalResult.errors.length === 0
      && provisionalResult.warnings.some(issue => issue.code === 'provisional-squad-size'),
    'provisional squad with a non-26 size must warn without failing',
  );

  console.log('Self-test passed: mismatch error, official-size error, and provisional-size warning behave as expected.');
}

const dataset = loadDataset();

if (process.argv.includes('--self-test')) {
  runSelfTest(dataset);
} else {
  const result = validateDataset(dataset);
  printSummary(dataset, result);
  if (result.errors.length > 0) process.exitCode = 1;
}
