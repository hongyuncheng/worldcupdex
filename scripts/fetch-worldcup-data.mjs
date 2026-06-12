/**
 * 2026 FIFA World Cup Data Fetcher
 * Fetches data from football-data.org v4 API and writes to local JSON files.
 * 
 * Usage: FOOTBALL_DATA_API_KEY=your_key node scripts/fetch-worldcup-data.mjs
 */

import 'dotenv/config';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { updateDataMeta } from './lib/update-data-meta.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const DATA_DIR = join(PROJECT_ROOT, 'data');
const TEAMS_DIR = join(DATA_DIR, 'teams');

// ============================================================
// Configuration
// ============================================================

const API_BASE = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const REQUEST_DELAY_MS = 6000; // 6 seconds between requests (free tier: 10 req/min)
const MAX_RETRIES = 3;

// ============================================================
// Team Name Mappings (English -> Chinese)
// ============================================================

const TEAM_NAME_MAP = {
  'Mexico': { zh: '墨西哥', code: 'mx', group: 'A' },
  'Ecuador': { zh: '厄瓜多尔', code: 'ec', group: 'A' },
  'Colombia': { zh: '哥伦比亚', code: 'co', group: 'A' },
  'Argentina': { zh: '阿根廷', code: 'ar', group: 'A' },
  'United States': { zh: '美国', code: 'us', group: 'B' },
  'USA': { zh: '美国', code: 'us', group: 'B' },
  'Panama': { zh: '巴拿马', code: 'pa', group: 'B' },
  'Chile': { zh: '智利', code: 'cl', group: 'B' },
  'Brazil': { zh: '巴西', code: 'br', group: 'B' },
  'UAE': { zh: '阿联酋', code: 'ae', group: 'C' },
  'United Arab Emirates': { zh: '阿联酋', code: 'ae', group: 'C' },
  'Bolivia': { zh: '玻利维亚', code: 'bo', group: 'C' },
  'New Zealand': { zh: '新西兰', code: 'nz', group: 'C' },
  'England': { zh: '英格兰', code: 'gb-eng', group: 'C' },
  'Canada': { zh: '加拿大', code: 'ca', group: 'D' },
  'Nigeria': { zh: '尼日利亚', code: 'ng', group: 'D' },
  'Paraguay': { zh: '巴拉圭', code: 'py', group: 'D' },
  'Spain': { zh: '西班牙', code: 'es', group: 'D' },
  'Costa Rica': { zh: '哥斯达黎加', code: 'cr', group: 'E' },
  'Indonesia': { zh: '印度尼西亚', code: 'id', group: 'E' },
  'Japan': { zh: '日本', code: 'jp', group: 'E' },
  'Germany': { zh: '德国', code: 'de', group: 'E' },
  'Iran': { zh: '伊朗', code: 'ir', group: 'F' },
  'Morocco': { zh: '摩洛哥', code: 'ma', group: 'F' },
  'France': { zh: '法国', code: 'fr', group: 'F' },
  'Peru': { zh: '秘鲁', code: 'pe', group: 'G' },
  'Serbia': { zh: '塞尔维亚', code: 'rs', group: 'G' },
  'Australia': { zh: '澳大利亚', code: 'au', group: 'G' },
  'Netherlands': { zh: '荷兰', code: 'nl', group: 'G' },
  'Denmark': { zh: '丹麦', code: 'dk', group: 'H' },
  'El Salvador': { zh: '萨尔瓦多', code: 'sv', group: 'H' },
  'Trinidad and Tobago': { zh: '特立尼达和多巴哥', code: 'tt', group: 'H' },
  'Portugal': { zh: '葡萄牙', code: 'pt', group: 'H' },
  'South Africa': { zh: '南非', code: 'za', group: 'I' },
  'Saudi Arabia': { zh: '沙特阿拉伯', code: 'sa', group: 'I' },
  'Italy': { zh: '意大利', code: 'it', group: 'I' },
  'Cameroon': { zh: '喀麦隆', code: 'cm', group: 'J' },
  'South Korea': { zh: '韩国', code: 'kr', group: 'J' },
  'Korea Republic': { zh: '韩国', code: 'kr', group: 'J' },
  'Uruguay': { zh: '乌拉圭', code: 'uy', group: 'J' },
  'Belgium': { zh: '比利时', code: 'be', group: 'J' },
  'Jamaica': { zh: '牙买加', code: 'jm', group: 'K' },
  'Tunisia': { zh: '突尼斯', code: 'tn', group: 'K' },
  'Senegal': { zh: '塞内加尔', code: 'sn', group: 'K' },
  'Croatia': { zh: '克罗地亚', code: 'hr', group: 'K' },
  'Ghana': { zh: '加纳', code: 'gh', group: 'L' },
  'Venezuela': { zh: '委内瑞拉', code: 've', group: 'L' },
  'Wales': { zh: '威尔士', code: 'gb-wls', group: 'L' },
  'Turkey': { zh: '土耳其', code: 'tr', group: 'L' },
  'Türkiye': { zh: '土耳其', code: 'tr', group: 'L' },
  // 额外球队（非原始 48 队，根据实际数据补充）
  'Algeria': { zh: '阿尔及利亚', code: 'dz', group: '' },
  'Switzerland': { zh: '瑞士', code: 'ch', group: '' },
  'Sweden': { zh: '瑞典', code: 'se', group: '' },
  'Czechia': { zh: '捷克', code: 'cz', group: '' },
  'Czech Republic': { zh: '捷克', code: 'cz', group: '' },
  'Austria': { zh: '奥地利', code: 'at', group: '' },
  'Egypt': { zh: '埃及', code: 'eg', group: '' },
  'Haiti': { zh: '海地', code: 'ht', group: '' },
  'Bosnia-Herzegovina': { zh: '波黑', code: 'ba', group: '' },
  'Bosnia and Herzegovina': { zh: '波黑', code: 'ba', group: '' },
  'Cape Verde Islands': { zh: '佛得角', code: 'cv', group: '' },
  'Cape Verde': { zh: '佛得角', code: 'cv', group: '' },
  'Congo DR': { zh: '刚果(金)', code: 'cd', group: '' },
  'DR Congo': { zh: '刚果(金)', code: 'cd', group: '' },
  'Ivory Coast': { zh: '科特迪瓦', code: 'ci', group: '' },
  "C\u00f4te d'Ivoire": { zh: '科特迪瓦', code: 'ci', group: '' },
  'Qatar': { zh: '卡塔尔', code: 'qa', group: '' },
  'Jordan': { zh: '约旦', code: 'jo', group: '' },
  'Iraq': { zh: '伊拉克', code: 'iq', group: '' },
  'Uzbekistan': { zh: '乌兹别克斯坦', code: 'uz', group: '' },
  'Norway': { zh: '挪威', code: 'no', group: '' },
  'Scotland': { zh: '苏格兰', code: 'gb-sct', group: '' },
  'Cura\u00e7ao': { zh: '库拉索', code: 'cw', group: '' },
};

// ============================================================
// Coach Name Mappings (English -> Chinese)
// ============================================================

const COACH_NAME_MAP = {
  'Lionel Scaloni': '利奥内尔·斯卡洛尼',
  'Dorival Júnior': '多里瓦尔·儒尼奥尔',
  'Didier Deschamps': '迪迪埃·德尚',
  'Luis de la Fuente': '路易斯·德拉富恩特',
  'Julian Nagelsmann': '尤利安·纳格尔斯曼',
  'Gareth Southgate': '加雷斯·索斯盖特',
  'Thomas Tuchel': '托马斯·图赫尔',
  'Ronald Koeman': '罗纳德·科曼',
  'Zlatko Dalić': '兹拉特科·达利奇',
  'Roberto Martínez': '罗伯托·马丁内斯',
  'Marcelo Bielsa': '马塞洛·贝尔萨',
  'Hervé Renard': '埃尔韦·勒纳尔',
  'Walid Regragui': '瓦利德·雷格拉吉',
  'Luciano Spalletti': '卢恰诺·斯帕莱蒂',
  'Roberto Mancini': '罗伯托·曼奇尼',
  'Néstor Lorenzo': '内斯托尔·洛伦索',
  'Mauricio Pochettino': '毛里西奥·波切蒂诺',
  'Jesse Marsch': '杰西·马尔施',
  'Dragan Stojković': '德拉甘·斯托伊科维奇',
  'Hajime Moriyasu': '森保一',
  'Shin Tae-yong': '申台龙',
  'Hong Myung-bo': '洪明甫',
  'Aliou Cissé': '阿利乌·西塞',
  'Vincenzo Montella': '文森佐·蒙特拉',
  'Rob Page': '罗布·佩奇',
  'Graham Arnold': '格雷厄姆·阿诺德',
  'Ricardo Gareca': '里卡多·加雷卡',
  'Gustavo Alfaro': '古斯塔沃·阿尔法罗',
  'Thomas Christiansen': '托马斯·克里斯蒂安森',
};

// ============================================================
// Player Name Mappings (English -> Chinese, famous players only)
// ============================================================

const PLAYER_NAME_MAP = {
  'Lionel Messi': '利奥内尔·梅西',
  'Neymar': '内马尔',
  'Neymar da Silva Santos Júnior': '内马尔',
  'Vinícius Júnior': '维尼修斯·儒尼奥尔',
  'Kylian Mbappé': '基利安·姆巴佩',
  'Antoine Griezmann': '安托万·格列兹曼',
  'Cristiano Ronaldo': '克里斯蒂亚诺·罗纳尔多',
  'Bruno Fernandes': '布鲁诺·费尔南德斯',
  'Bernardo Silva': '贝尔纳多·席尔瓦',
  'Kevin De Bruyne': '凯文·德布劳内',
  'Romelu Lukaku': '罗梅卢·卢卡库',
  'Luka Modrić': '卢卡·莫德里奇',
  'Virgil van Dijk': '维吉尔·范迪克',
  'Frenkie de Jong': '弗兰基·德容',
  'Memphis Depay': '孟菲斯·德佩',
  'Pedri': '佩德里',
  'Gavi': '加维',
  'Lamine Yamal': '拉明·亚马尔',
  'Jude Bellingham': '裘德·贝林厄姆',
  'Harry Kane': '哈里·凯恩',
  'Bukayo Saka': '布卡约·萨卡',
  'Phil Foden': '菲尔·福登',
  'Florian Wirtz': '弗洛里安·维尔茨',
  'Jamal Musiala': '贾马尔·穆西亚拉',
  'Toni Kroos': '托尼·克罗斯',
  'Emiliano Martínez': '埃米利亚诺·马丁内斯',
  'Julián Álvarez': '胡利安·阿尔瓦雷斯',
  'Ángel Di María': '安赫尔·迪马里亚',
  'Son Heung-min': '孙兴慜',
  'Son Heung-Min': '孙兴慜',
  'Sadio Mané': '萨迪奥·马内',
  'Mohamed Salah': '穆罕默德·萨拉赫',
  'Achraf Hakimi': '阿什拉夫·哈基米',
  'Takefusa Kubo': '久保建英',
  'Erling Haaland': '埃尔林·哈兰德',
  'Christian Eriksen': '克里斯蒂安·埃里克森',
  'Robert Lewandowski': '罗伯特·莱万多夫斯基',
  'Luis Suárez': '路易斯·苏亚雷斯',
  'Darwin Núñez': '达尔文·努涅斯',
  'Federico Valverde': '费德里科·巴尔韦德',
  'Alphonso Davies': '阿方索·戴维斯',
  'Christian Pulisic': '克里斯蒂安·普利希奇',
  'Weston McKennie': '韦斯顿·麦肯尼',
};

// ============================================================
// Venue Name Mappings
// ============================================================

const VENUE_NAME_MAP = {
  'Estadio Azteca': { zh: '阿兹特克球场', city: 'Mexico City', cityZh: '墨西哥城', country: 'Mexico', countryZh: '墨西哥' },
  'MetLife Stadium': { zh: '大都会人寿体育场', city: 'East Rutherford', cityZh: '东卢瑟福', country: 'USA', countryZh: '美国' },
  'Rose Bowl': { zh: '玫瑰碗球场', city: 'Pasadena', cityZh: '帕萨迪纳', country: 'USA', countryZh: '美国' },
  'AT&T Stadium': { zh: 'AT&T体育场', city: 'Arlington', cityZh: '阿灵顿', country: 'USA', countryZh: '美国' },
  'SoFi Stadium': { zh: 'SoFi体育场', city: 'Inglewood', cityZh: '英格尔伍德', country: 'USA', countryZh: '美国' },
  'Hard Rock Stadium': { zh: '硬石体育场', city: 'Miami Gardens', cityZh: '迈阿密花园', country: 'USA', countryZh: '美国' },
  'NRG Stadium': { zh: 'NRG体育场', city: 'Houston', cityZh: '休斯顿', country: 'USA', countryZh: '美国' },
  'Mercedes-Benz Stadium': { zh: '梅赛德斯-奔驰体育场', city: 'Atlanta', cityZh: '亚特兰大', country: 'USA', countryZh: '美国' },
  'Lumen Field': { zh: '流明球场', city: 'Seattle', cityZh: '西雅图', country: 'USA', countryZh: '美国' },
  'Lincoln Financial Field': { zh: '林肯金融球场', city: 'Philadelphia', cityZh: '费城', country: 'USA', countryZh: '美国' },
  'Arrowhead Stadium': { zh: '箭头体育场', city: 'Kansas City', cityZh: '堪萨斯城', country: 'USA', countryZh: '美国' },
  'Levi\'s Stadium': { zh: '李维斯球场', city: 'Santa Clara', cityZh: '圣克拉拉', country: 'USA', countryZh: '美国' },
  'BMO Field': { zh: 'BMO球场', city: 'Toronto', cityZh: '多伦多', country: 'Canada', countryZh: '加拿大' },
  'BC Place': { zh: 'BC体育馆', city: 'Vancouver', cityZh: '温哥华', country: 'Canada', countryZh: '加拿大' },
  'Estadio BBVA': { zh: 'BBVA球场', city: 'Monterrey', cityZh: '蒙特雷', country: 'Mexico', countryZh: '墨西哥' },
  'Estadio Akron': { zh: '阿克隆球场', city: 'Guadalajara', cityZh: '瓜达拉哈拉', country: 'Mexico', countryZh: '墨西哥' },
  'Gillette Stadium': { zh: '吉列体育场', city: 'Foxborough', cityZh: '福克斯堡', country: 'USA', countryZh: '美国' },
  'TQL Stadium': { zh: 'TQL体育场', city: 'Cincinnati', cityZh: '辛辛那提', country: 'USA', countryZh: '美国' },
  'Geodis Park': { zh: 'Geodis公园球场', city: 'Nashville', cityZh: '纳什维尔', country: 'USA', countryZh: '美国' },
};

// ============================================================
// Position Mappings
// ============================================================

const POSITION_MAP = {
  'Goalkeeper': '门将',
  'Defence': '后卫',
  'Midfield': '中场',
  'Offence': '前锋',
  'Attacker': '前锋',
  'Forward': '前锋',
  'Defender': '后卫',
  'Midfielder': '中场',
};

// ============================================================
// Confederation Mappings
// ============================================================

const CONFEDERATION_MAP = {
  'AFC': 'AFC',
  'CAF': 'CAF',
  'CONCACAF': 'CONCACAF',
  'CONMEBOL': 'CONMEBOL',
  'OFC': 'OFC',
  'UEFA': 'UEFA',
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

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getTeamId(name) {
  return slugify(name);
}

function getTeamMapping(name) {
  if (!name) return null;
  // Try exact match first
  if (TEAM_NAME_MAP[name]) return TEAM_NAME_MAP[name];
  // Try case-insensitive match
  const key = Object.keys(TEAM_NAME_MAP).find(k => k.toLowerCase() === name.toLowerCase());
  if (key) return TEAM_NAME_MAP[key];
  return null;
}

function getCoachZhName(name) {
  if (!name) return name;
  if (COACH_NAME_MAP[name]) return COACH_NAME_MAP[name];
  // Try partial match
  const key = Object.keys(COACH_NAME_MAP).find(k => name.includes(k) || k.includes(name));
  if (key) return COACH_NAME_MAP[key];
  return name;
}

function getPlayerZhName(name) {
  if (!name) return name;
  if (PLAYER_NAME_MAP[name]) return PLAYER_NAME_MAP[name];
  const key = Object.keys(PLAYER_NAME_MAP).find(k => name.includes(k) || k.includes(name));
  if (key) return PLAYER_NAME_MAP[key];
  return name;
}

function getVenueMapping(name) {
  if (!name) return null;
  if (VENUE_NAME_MAP[name]) return VENUE_NAME_MAP[name];
  const key = Object.keys(VENUE_NAME_MAP).find(k => 
    name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase())
  );
  if (key) return VENUE_NAME_MAP[key];
  return null;
}

function getPositionZh(position) {
  if (!position) return '';
  return POSITION_MAP[position] || position;
}

function getFlagUrl(code) {
  if (!code) return '';
  return `https://flagcdn.com/w80/${code}.png`;
}

// ============================================================
// API Fetch with Retry
// ============================================================

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log(`  Fetching: ${url} (attempt ${attempt}/${retries})`);
      const response = await fetch(url, {
        headers: {
          'X-Auth-Token': API_KEY,
        },
      });

      if (response.status === 429) {
        const waitTime = attempt * 60000; // wait longer on rate limit
        log(`  Rate limited. Waiting ${waitTime / 1000}s before retry...`);
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
      const backoffTime = Math.pow(2, attempt) * 1000;
      log(`  Error: ${error.message}. Retrying in ${backoffTime / 1000}s...`);
      await delay(backoffTime);
    }
  }
}

// ============================================================
// Data Processing
// ============================================================

function processTeam(apiTeam) {
  const name = apiTeam.name || apiTeam.shortName || '';
  const mapping = getTeamMapping(name) || getTeamMapping(apiTeam.shortName) || getTeamMapping(apiTeam.tla);
  
  const code = mapping?.code || (apiTeam.tla ? apiTeam.tla.toLowerCase() : slugify(name).substring(0, 2));
  const group = mapping?.group || '';
  const nameZh = mapping?.zh || name;

  const coachData = apiTeam.coach || {};
  const coach = {
    nameEn: coachData.name || '',
    nameZh: getCoachZhName(coachData.name),
    nationality: coachData.nationality || '',
  };

  return {
    id: getTeamId(name),
    nameZh,
    nameEn: name,
    code,
    group,
    confederation: apiTeam.area?.name ? getConfederation(apiTeam) : '',
    fifaRank: apiTeam.clubColors ? null : null, // API doesn't provide FIFA rank directly
    flag: getFlagUrl(code),
    coach,
  };
}

function getConfederation(apiTeam) {
  // Infer confederation from area or use known mappings
  const area = apiTeam.area?.name || '';
  const continentMap = {
    'South America': 'CONMEBOL',
    'Europe': 'UEFA',
    'Africa': 'CAF',
    'Asia': 'AFC',
    'North America': 'CONCACAF',
    'Oceania': 'OFC',
    'Central America': 'CONCACAF',
    'North/Central America': 'CONCACAF',
  };
  
  // Check parent area or known mapping
  if (apiTeam.area?.parentArea) {
    return continentMap[apiTeam.area.parentArea] || '';
  }
  
  // Fallback: infer from team name
  const teamConfMap = {
    'Argentina': 'CONMEBOL', 'Brazil': 'CONMEBOL', 'Uruguay': 'CONMEBOL',
    'Colombia': 'CONMEBOL', 'Ecuador': 'CONMEBOL', 'Paraguay': 'CONMEBOL',
    'Peru': 'CONMEBOL', 'Chile': 'CONMEBOL', 'Venezuela': 'CONMEBOL',
    'Bolivia': 'CONMEBOL',
    'Mexico': 'CONCACAF', 'United States': 'CONCACAF', 'USA': 'CONCACAF',
    'Canada': 'CONCACAF', 'Costa Rica': 'CONCACAF', 'Panama': 'CONCACAF',
    'Jamaica': 'CONCACAF', 'El Salvador': 'CONCACAF', 'Trinidad and Tobago': 'CONCACAF',
    'England': 'UEFA', 'France': 'UEFA', 'Germany': 'UEFA', 'Spain': 'UEFA',
    'Italy': 'UEFA', 'Netherlands': 'UEFA', 'Portugal': 'UEFA', 'Belgium': 'UEFA',
    'Croatia': 'UEFA', 'Denmark': 'UEFA', 'Serbia': 'UEFA', 'Turkey': 'UEFA',
    'Türkiye': 'UEFA', 'Wales': 'UEFA',
    'Japan': 'AFC', 'South Korea': 'AFC', 'Korea Republic': 'AFC',
    'Saudi Arabia': 'AFC', 'Iran': 'AFC', 'Australia': 'AFC',
    'UAE': 'AFC', 'United Arab Emirates': 'AFC', 'Indonesia': 'AFC',
    'Morocco': 'CAF', 'Senegal': 'CAF', 'Cameroon': 'CAF',
    'Nigeria': 'CAF', 'Ghana': 'CAF', 'South Africa': 'CAF', 'Tunisia': 'CAF',
    'New Zealand': 'OFC',
  };

  const teamName = apiTeam.name || apiTeam.shortName || '';
  return teamConfMap[teamName] || teamConfMap[apiTeam.shortName] || '';
}

function processTeamDetail(apiTeam, basicTeam) {
  const squad = (apiTeam.squad || []).map(player => ({
    name: player.name || '',
    nameZh: getPlayerZhName(player.name),
    position: player.position || '',
    positionZh: getPositionZh(player.position),
    dateOfBirth: player.dateOfBirth || '',
    nationality: player.nationality || '',
    shirtNumber: player.shirtNumber || null,
  }));

  return {
    ...basicTeam,
    founded: apiTeam.founded || null,
    venue: apiTeam.venue || '',
    squad,
  };
}

function processMatch(apiMatch, matchIndex) {
  const homeTeamName = apiMatch.homeTeam?.name || apiMatch.homeTeam?.shortName || 'TBD';
  const awayTeamName = apiMatch.awayTeam?.name || apiMatch.awayTeam?.shortName || 'TBD';

  const homeMapping = getTeamMapping(homeTeamName) || getTeamMapping(apiMatch.homeTeam?.shortName);
  const awayMapping = getTeamMapping(awayTeamName) || getTeamMapping(apiMatch.awayTeam?.shortName);

  const homeCode = homeMapping?.code || '';
  const awayCode = awayMapping?.code || '';

  // Parse date and time
  const utcDate = apiMatch.utcDate || '';
  const dateObj = utcDate ? new Date(utcDate) : null;
  const date = dateObj ? dateObj.toISOString().split('T')[0] : '';
  const time = dateObj ? `${String(dateObj.getUTCHours()).padStart(2, '0')}:${String(dateObj.getUTCMinutes()).padStart(2, '0')}` : '';

  // Venue info
  const venueName = apiMatch.venue || '';
  const venueMapping = getVenueMapping(venueName);

  // Score
  let score = null;
  if (apiMatch.score && apiMatch.score.fullTime && apiMatch.score.fullTime.home !== null) {
    score = {
      home: apiMatch.score.fullTime.home,
      away: apiMatch.score.fullTime.away,
    };
  }

  // Stage/Group
  const stage = apiMatch.stage || '';
  const group = apiMatch.group ? apiMatch.group.replace('GROUP_', '') : '';

  return {
    id: apiMatch.id || matchIndex + 1,
    date,
    time,
    homeTeam: {
      id: getTeamId(homeTeamName),
      nameZh: homeMapping?.zh || homeTeamName,
      nameEn: homeTeamName,
      code: homeCode,
      flag: getFlagUrl(homeCode),
    },
    awayTeam: {
      id: getTeamId(awayTeamName),
      nameZh: awayMapping?.zh || awayTeamName,
      nameEn: awayTeamName,
      code: awayCode,
      flag: getFlagUrl(awayCode),
    },
    venue: {
      name: venueName,
      nameZh: venueMapping?.zh || venueName,
      city: venueMapping?.city || '',
      cityZh: venueMapping?.cityZh || '',
    },
    group,
    stage,
    matchday: apiMatch.matchday || null,
    score,
  };
}

function extractVenues(matches) {
  const venueMap = new Map();

  for (const match of matches) {
    const venueName = match.venue?.name;
    if (!venueName || venueName === 'TBD' || venueMap.has(venueName)) continue;

    const mapping = getVenueMapping(venueName);
    venueMap.set(venueName, {
      id: slugify(venueName),
      name: venueName,
      nameZh: mapping?.zh || venueName,
      city: mapping?.city || match.venue?.city || '',
      cityZh: mapping?.cityZh || '',
      country: mapping?.country || '',
      countryZh: mapping?.countryZh || '',
    });
  }

  return Array.from(venueMap.values());
}

// ============================================================
// Main Script
// ============================================================

async function main() {
  console.log('='.repeat(60));
  console.log('  2026 FIFA World Cup Data Fetcher');
  console.log('='.repeat(60));
  console.log('');

  // Check API Key
  if (!API_KEY) {
    console.error('❌ Error: FOOTBALL_DATA_API_KEY environment variable is not set.');
    console.error('');
    console.error('Please set it before running this script:');
    console.error('  export FOOTBALL_DATA_API_KEY=your_api_key_here');
    console.error('');
    console.error('Get a free API key at: https://www.football-data.org/client/register');
    process.exit(1);
  }

  // Ensure output directories exist
  log('Creating output directories...');
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(TEAMS_DIR, { recursive: true });

  // ---- Step 1: Fetch competition info ----
  log('Step 1/3: Fetching competition info...');
  let competitionData;
  try {
    competitionData = await fetchWithRetry(`${API_BASE}/competitions/WC`);
    log(`  ✓ Competition: ${competitionData.name} (${competitionData.area?.name})`);
  } catch (error) {
    console.error(`❌ Failed to fetch competition info: ${error.message}`);
    process.exit(1);
  }

  await delay(REQUEST_DELAY_MS);

  // ---- Step 2: Fetch teams ----
  log('Step 2/3: Fetching teams...');
  let teamsData;
  try {
    teamsData = await fetchWithRetry(`${API_BASE}/competitions/WC/teams`);
    log(`  ✓ Received ${teamsData.teams?.length || 0} teams`);
  } catch (error) {
    console.error(`❌ Failed to fetch teams: ${error.message}`);
    process.exit(1);
  }

  await delay(REQUEST_DELAY_MS);

  // ---- Step 3: Fetch matches ----
  log('Step 3/3: Fetching matches...');
  let matchesData;
  try {
    matchesData = await fetchWithRetry(`${API_BASE}/competitions/WC/matches`);
    log(`  ✓ Received ${matchesData.matches?.length || 0} matches`);
  } catch (error) {
    console.error(`❌ Failed to fetch matches: ${error.message}`);
    process.exit(1);
  }

  // ---- Process Data ----
  log('Processing data...');

  // Process teams
  const apiTeams = teamsData.teams || [];
  const teamsBasic = apiTeams.map(t => processTeam(t));
  const teamsDetailed = apiTeams.map((t, i) => processTeamDetail(t, teamsBasic[i]));

  // Process matches
  const apiMatches = matchesData.matches || [];
  const matches = apiMatches.map((m, i) => processMatch(m, i));

  // Use the match feed as the source of truth for group assignment. The
  // football-data team endpoint does not expose 2026 groups, and the fallback
  // mapping above can go stale after the draw changes.
  const groupByTeamId = new Map();
  for (const match of matches) {
    if (match.stage !== 'GROUP_STAGE' || !match.group) continue;
    for (const side of ['homeTeam', 'awayTeam']) {
      const teamId = match[side]?.id;
      if (teamId && teamId !== 'tbd') groupByTeamId.set(teamId, match.group);
    }
  }
  for (const team of teamsBasic) {
    const group = groupByTeamId.get(team.id);
    if (group) team.group = group;
  }
  for (const team of teamsDetailed) {
    const group = groupByTeamId.get(team.id);
    if (group) team.group = group;
  }

  // Extract venues
  const venues = extractVenues(matches);

  // ---- Write Files ----
  log('Writing output files...');

  // Write teams.json (basic info only)
  const teamsOutput = teamsBasic.map(t => ({
    id: t.id,
    nameZh: t.nameZh,
    nameEn: t.nameEn,
    code: t.code,
    group: t.group,
    confederation: t.confederation,
    fifaRank: t.fifaRank,
    flag: t.flag,
    coach: t.coach,
  }));
  await writeFile(join(DATA_DIR, 'teams.json'), JSON.stringify(teamsOutput, null, 2), 'utf-8');
  log(`  ✓ Written teams.json (${teamsOutput.length} teams)`);

  // Write matches.json
  await writeFile(join(DATA_DIR, 'matches.json'), JSON.stringify(matches, null, 2), 'utf-8');
  log(`  ✓ Written matches.json (${matches.length} matches)`);

  // Write venues.json
  await writeFile(join(DATA_DIR, 'venues.json'), JSON.stringify(venues, null, 2), 'utf-8');
  log(`  ✓ Written venues.json (${venues.length} venues)`);

  // Write individual team files
  let totalPlayers = 0;
  for (const team of teamsDetailed) {
    const filePath = join(TEAMS_DIR, `${team.id}.json`);

    // ---- Merge existing player photos to avoid overwriting them ----
    let existingSquadMap = new Map();
    let existingTeam = null;
    try {
      const existingRaw = await readFile(filePath, 'utf-8');
      const existing = JSON.parse(existingRaw);
      existingTeam = existing;
      if (existing.squad && Array.isArray(existing.squad)) {
        for (const p of existing.squad) {
          existingSquadMap.set(p.name, p);
        }
      }
    } catch (e) {
      // File doesn't exist yet — ignore
    }

    if (team.squad && existingSquadMap.size > 0) {
      for (const player of team.squad) {
        const existing = existingSquadMap.get(player.name);
        if (existing) {
          if (existing.photo !== undefined) player.photo = existing.photo;
          if (existing.photoCutout !== undefined) player.photoCutout = existing.photoCutout;
          if (existing.photoThumb !== undefined) player.photoThumb = existing.photoThumb;
        }
      }
    }
    // ---- End photo merge ----

    team.squadStatus = existingTeam?.squadStatus || (team.squad.length >= 26 ? 'provisional' : 'incomplete');
    team.squadLastUpdated = new Date().toISOString().slice(0, 10);
    team.squadSourceUrl = existingTeam?.squadSourceUrl
      || 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/all-world-cup-squad-announcements';

    await writeFile(filePath, JSON.stringify(team, null, 2), 'utf-8');
    totalPlayers += team.squad?.length || 0;
  }
  log(`  ✓ Written ${teamsDetailed.length} team detail files to data/teams/`);
  updateDataMeta(
    ['scheduleLastUpdated', 'teamsLastUpdated', 'squadsLastUpdated', 'rankingsLastUpdated'],
    'fetch-worldcup-data',
  );

  // ---- Summary ----
  console.log('');
  console.log('='.repeat(60));
  console.log('  Fetch Complete! Summary:');
  console.log('='.repeat(60));
  console.log(`  📋 Teams:    ${teamsOutput.length}`);
  console.log(`  ⚽ Matches:  ${matches.length}`);
  console.log(`  🏟️  Venues:   ${venues.length}`);
  console.log(`  👥 Players:  ${totalPlayers}`);
  console.log(`  📁 Output:   ${DATA_DIR}`);
  console.log('='.repeat(60));
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
