import { readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { updateDataMeta } from './lib/update-data-meta.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const DATA_DIR = join(PROJECT_ROOT, 'data');
const FALLBACK_SCHEDULE_PATH = join(DATA_DIR, 'official-schedule-venues.json');

const BRITANNICA_SCHEDULE_URL = process.env.OFFICIAL_SCHEDULE_URL || 'https://www.britannica.com/event/2026-FIFA-World-Cup';
const ESPN_KNOCKOUT_SCHEDULE_URL = 'https://www.espn.com/soccer/story/_/id/48939282/2026-fifa-world-cup-fixtures-results-match-schedule-group-stage-knockout-rounds-bracket';

const VENUES = {
  'Atlanta Stadium': {
    id: 'atlanta-stadium',
    name: 'Atlanta Stadium',
    nameZh: '亚特兰大体育场',
    city: 'Atlanta',
    cityZh: '亚特兰大',
    country: 'USA',
    countryZh: '美国',
    usualName: 'Mercedes-Benz Stadium',
  },
  'BC Place Vancouver': {
    id: 'bc-place-vancouver',
    name: 'BC Place Vancouver',
    nameZh: '温哥华 BC 体育场',
    city: 'Vancouver',
    cityZh: '温哥华',
    country: 'Canada',
    countryZh: '加拿大',
    usualName: 'BC Place',
  },
  'Boston Stadium': {
    id: 'boston-stadium',
    name: 'Boston Stadium',
    nameZh: '波士顿体育场',
    city: 'Foxborough',
    cityZh: '福克斯堡',
    country: 'USA',
    countryZh: '美国',
    usualName: 'Gillette Stadium',
  },
  'Dallas Stadium': {
    id: 'dallas-stadium',
    name: 'Dallas Stadium',
    nameZh: '达拉斯体育场',
    city: 'Arlington',
    cityZh: '阿灵顿',
    country: 'USA',
    countryZh: '美国',
    usualName: 'AT&T Stadium',
  },
  'Estadio Guadalajara': {
    id: 'estadio-guadalajara',
    name: 'Estadio Guadalajara',
    nameZh: '瓜达拉哈拉体育场',
    city: 'Zapopan',
    cityZh: '萨波潘',
    country: 'Mexico',
    countryZh: '墨西哥',
    usualName: 'Estadio Akron',
  },
  'Estadio Monterrey': {
    id: 'estadio-monterrey',
    name: 'Estadio Monterrey',
    nameZh: '蒙特雷体育场',
    city: 'Guadalupe',
    cityZh: '瓜达卢佩',
    country: 'Mexico',
    countryZh: '墨西哥',
    usualName: 'Estadio BBVA',
  },
  'Houston Stadium': {
    id: 'houston-stadium',
    name: 'Houston Stadium',
    nameZh: '休斯顿体育场',
    city: 'Houston',
    cityZh: '休斯顿',
    country: 'USA',
    countryZh: '美国',
    usualName: 'NRG Stadium',
  },
  'Kansas City Stadium': {
    id: 'kansas-city-stadium',
    name: 'Kansas City Stadium',
    nameZh: '堪萨斯城体育场',
    city: 'Kansas City',
    cityZh: '堪萨斯城',
    country: 'USA',
    countryZh: '美国',
    usualName: 'GEHA Field at Arrowhead Stadium',
  },
  'Los Angeles Stadium': {
    id: 'los-angeles-stadium',
    name: 'Los Angeles Stadium',
    nameZh: '洛杉矶体育场',
    city: 'Inglewood',
    cityZh: '英格尔伍德',
    country: 'USA',
    countryZh: '美国',
    usualName: 'SoFi Stadium',
  },
  'Mexico City Stadium': {
    id: 'mexico-city-stadium',
    name: 'Mexico City Stadium',
    nameZh: '墨西哥城体育场',
    city: 'Mexico City',
    cityZh: '墨西哥城',
    country: 'Mexico',
    countryZh: '墨西哥',
    usualName: 'Estadio Banorte',
  },
  'Miami Stadium': {
    id: 'miami-stadium',
    name: 'Miami Stadium',
    nameZh: '迈阿密体育场',
    city: 'Miami Gardens',
    cityZh: '迈阿密花园',
    country: 'USA',
    countryZh: '美国',
    usualName: 'Hard Rock Stadium',
  },
  'New York New Jersey Stadium': {
    id: 'new-york-new-jersey-stadium',
    name: 'New York New Jersey Stadium',
    nameZh: '纽约新泽西体育场',
    city: 'East Rutherford',
    cityZh: '东卢瑟福',
    country: 'USA',
    countryZh: '美国',
    usualName: 'MetLife Stadium',
  },
  'Philadelphia Stadium': {
    id: 'philadelphia-stadium',
    name: 'Philadelphia Stadium',
    nameZh: '费城体育场',
    city: 'Philadelphia',
    cityZh: '费城',
    country: 'USA',
    countryZh: '美国',
    usualName: 'Lincoln Financial Field',
  },
  'San Francisco Bay Area Stadium': {
    id: 'san-francisco-bay-area-stadium',
    name: 'San Francisco Bay Area Stadium',
    nameZh: '旧金山湾区体育场',
    city: 'Santa Clara',
    cityZh: '圣克拉拉',
    country: 'USA',
    countryZh: '美国',
    usualName: "Levi's Stadium",
  },
  'Seattle Stadium': {
    id: 'seattle-stadium',
    name: 'Seattle Stadium',
    nameZh: '西雅图体育场',
    city: 'Seattle',
    cityZh: '西雅图',
    country: 'USA',
    countryZh: '美国',
    usualName: 'Lumen Field',
  },
  'Toronto Stadium': {
    id: 'toronto-stadium',
    name: 'Toronto Stadium',
    nameZh: '多伦多体育场',
    city: 'Toronto',
    cityZh: '多伦多',
    country: 'Canada',
    countryZh: '加拿大',
    usualName: 'BMO Field',
  },
};

const KNOCKOUT_VENUES = [
  'Los Angeles Stadium',
  'Houston Stadium',
  'Boston Stadium',
  'Estadio Monterrey',
  'Dallas Stadium',
  'New York New Jersey Stadium',
  'Mexico City Stadium',
  'Atlanta Stadium',
  'Seattle Stadium',
  'San Francisco Bay Area Stadium',
  'Los Angeles Stadium',
  'Toronto Stadium',
  'BC Place Vancouver',
  'Dallas Stadium',
  'Miami Stadium',
  'Kansas City Stadium',
  'Houston Stadium',
  'Philadelphia Stadium',
  'New York New Jersey Stadium',
  'Mexico City Stadium',
  'Dallas Stadium',
  'Seattle Stadium',
  'Atlanta Stadium',
  'BC Place Vancouver',
  'Boston Stadium',
  'Los Angeles Stadium',
  'Miami Stadium',
  'Kansas City Stadium',
  'Dallas Stadium',
  'Atlanta Stadium',
  'Miami Stadium',
  'New York New Jersey Stadium',
];

const VENUE_TIME_ZONES_BY_CITY = {
  Atlanta: 'America/New_York',
  Vancouver: 'America/Vancouver',
  Foxborough: 'America/New_York',
  Arlington: 'America/Chicago',
  Zapopan: 'America/Mexico_City',
  Guadalupe: 'America/Monterrey',
  Houston: 'America/Chicago',
  'Kansas City': 'America/Chicago',
  Inglewood: 'America/Los_Angeles',
  'Mexico City': 'America/Mexico_City',
  'Miami Gardens': 'America/New_York',
  'East Rutherford': 'America/New_York',
  Philadelphia: 'America/New_York',
  'Santa Clara': 'America/Los_Angeles',
  Seattle: 'America/Los_Angeles',
  Toronto: 'America/Toronto',
};

const TEAM_ALIASES = new Map([
  ['Bosnia and Herzegovina', 'Bosnia-Herzegovina'],
  ['Cabo Verde', 'Cape Verde Islands'],
  ['Côte d’Ivoire', 'Ivory Coast'],
  ["Côte d'Ivoire", 'Ivory Coast'],
  ['Democratic Republic of the Congo (DRC)', 'Congo DR'],
  ['Korea Republic', 'South Korea'],
  ['Türkiye', 'Turkey'],
]);

function cleanHtml(value) {
  return value
    .replace(/<span[^>]*class="text-smallcaps"[^>]*>([\s\S]*?)<\/span>/gi, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&rsquo;/g, '’')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTeamName(value) {
  return TEAM_ALIASES.get(value) || value;
}

function parseGroupVenueRows(html) {
  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/g)].map(match => match[0]);
  const rows = [];

  for (const table of tables.slice(0, 3)) {
    for (const tr of table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
      const cells = [...tr[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map(match => cleanHtml(match[1]));
      if (!/^\d+$/.test(cells[0] || '')) continue;

      const [homeRaw, awayRaw] = cells[4].split(/\s+vs\.\s+/);
      const venueName = cells[5].split(',')[0].trim();
      if (!homeRaw || !awayRaw || !VENUES[venueName]) {
        throw new Error(`Unable to parse official schedule row: ${cells.join(' | ')}`);
      }

      rows.push({
        matchNo: Number(cells[0]),
        group: cells[3],
        homeTeam: normalizeTeamName(homeRaw.trim()),
        awayTeam: normalizeTeamName(awayRaw.trim()),
        venueName,
      });
    }
  }

  if (rows.length !== 72) {
    throw new Error(`Expected 72 group-stage rows from official schedule source, received ${rows.length}.`);
  }

  return rows;
}

async function readFallbackGroupVenueRows() {
  const rows = JSON.parse(await readFile(FALLBACK_SCHEDULE_PATH, 'utf-8'));
  if (!Array.isArray(rows) || rows.length !== 72) {
    throw new Error(`Expected 72 fallback schedule rows, received ${Array.isArray(rows) ? rows.length : 'invalid JSON'}.`);
  }

  for (const row of rows) {
    if (!row.id || !row.group || !row.homeTeam || !row.awayTeam || !VENUES[row.venueName]) {
      throw new Error(`Invalid fallback schedule row: ${JSON.stringify(row)}`);
    }
  }

  return rows;
}

async function fetchOfficialGroupVenueRows() {
  try {
    console.log('Fetching official schedule venue source...');
    const response = await fetch(BRITANNICA_SCHEDULE_URL, {
      headers: { 'user-agent': 'WorldCupDex data refresh (+https://worldcupdex.org)' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const rows = parseGroupVenueRows(html);
    return { rows, source: 'remote' };
  } catch (error) {
    console.warn(`Official schedule source unavailable (${error.message}); using checked-in fallback schedule venues.`);
    return {
      rows: await readFallbackGroupVenueRows(),
      source: 'fallback',
    };
  }
}

function toMatchVenue(venueName) {
  const venue = VENUES[venueName];
  if (!venue) throw new Error(`Unknown venue: ${venueName}`);
  return {
    name: venue.name,
    nameZh: venue.nameZh,
    city: venue.city,
    cityZh: venue.cityZh,
    timeZone: VENUE_TIME_ZONES_BY_CITY[venue.city] || 'UTC',
  };
}

function toVenueItem(venue) {
  return {
    ...venue,
    timeZone: VENUE_TIME_ZONES_BY_CITY[venue.city] || 'UTC',
  };
}

function groupMatchKey(match) {
  return [
    match.group,
    match.homeTeam?.nameEn,
    match.awayTeam?.nameEn,
  ].join('|');
}

async function main() {
  const { rows: officialGroupRows, source: scheduleSource } = await fetchOfficialGroupVenueRows();
  const groupVenueByKey = new Map(
    officialGroupRows.map(row => [
      [row.group, row.homeTeam, row.awayTeam].join('|'),
      row.venueName,
    ]),
  );
  const groupVenueById = new Map(officialGroupRows.map(row => [String(row.id), row.venueName]));

  const matchesPath = join(DATA_DIR, 'matches.json');
  const matches = JSON.parse(await readFile(matchesPath, 'utf-8'));
  const groupMatches = matches.filter(match => match.stage === 'GROUP_STAGE');
  const knockoutMatches = matches.filter(match => match.stage !== 'GROUP_STAGE');

  let groupUpdated = 0;
  for (const match of groupMatches) {
    const venueName = groupVenueByKey.get(groupMatchKey(match)) || groupVenueById.get(String(match.id));
    if (!venueName) {
      throw new Error(`No official venue found for group match ${match.id}: ${groupMatchKey(match)}`);
    }
    match.venue = toMatchVenue(venueName);
    groupUpdated++;
  }

  const sortedKnockout = [...knockoutMatches].sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`) || String(a.id).localeCompare(String(b.id)),
  );
  if (sortedKnockout.length !== KNOCKOUT_VENUES.length) {
    throw new Error(`Expected ${KNOCKOUT_VENUES.length} knockout matches, received ${sortedKnockout.length}.`);
  }

  let knockoutUpdated = 0;
  for (let i = 0; i < sortedKnockout.length; i++) {
    sortedKnockout[i].venue = toMatchVenue(KNOCKOUT_VENUES[i]);
    knockoutUpdated++;
  }

  await writeFile(matchesPath, `${JSON.stringify(matches, null, 2)}\n`, 'utf-8');

  const venuesPath = join(DATA_DIR, 'venues.json');
  const venues = Object.values(VENUES).map(toVenueItem);
  await writeFile(venuesPath, `${JSON.stringify(venues, null, 2)}\n`, 'utf-8');
  updateDataMeta(['scheduleLastUpdated'], 'official-schedule-venues');
  const metaPath = join(DATA_DIR, 'meta.json');
  const meta = JSON.parse(await readFile(metaPath, 'utf-8'));
  meta.sourceUrls = {
    ...meta.sourceUrls,
    scheduleVenueTable: BRITANNICA_SCHEDULE_URL,
    knockoutVenueCrossCheck: ESPN_KNOCKOUT_SCHEDULE_URL,
  };
  await writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf-8');

  console.log(`Updated ${groupUpdated} group-stage venues and ${knockoutUpdated} knockout venues.`);
  console.log(`Written ${venues.length} venues to data/venues.json.`);
  console.log(`Schedule venue source: ${scheduleSource}.`);
}

main().catch(error => {
  console.error(`Official schedule venue update failed: ${error.message}`);
  process.exit(1);
});
