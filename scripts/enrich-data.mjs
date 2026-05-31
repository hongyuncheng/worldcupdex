/**
 * enrich-data.mjs
 * 补充 FIFA 排名、教练名称、场馆信息到已有 JSON 数据
 * 修复国旗代码（确保使用 ISO 3166-1 alpha-2 标准代码）
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { PLAYER_NAME_ZH } from './player-names-zh.mjs'
import { updateDataMeta } from './lib/update-data-meta.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(__dirname, '..', 'data')

// ============ A0: 国旗代码修复映射 ============
// key: 球队 id, value: 正确的 ISO 3166-1 alpha-2 代码（flagcdn.com 使用）
const FLAG_CODE_FIXES = {
  'algeria': 'dz',
  'switzerland': 'ch',
  'sweden': 'se',
  'czechia': 'cz',
  'austria': 'at',
  'egypt': 'eg',
  'haiti': 'ht',
  'bosnia-herzegovina': 'ba',
  'cape-verde-islands': 'cv',
  'congo-dr': 'cd',
  'ivory-coast': 'ci',
  'qatar': 'qa',
  'jordan': 'jo',
  'iraq': 'iq',
  'uzbekistan': 'uz',
  'norway': 'no',
  'scotland': 'gb-sct',
  'cura-ao': 'cw',
}

// ============ A0.5: 中文名修复映射 ============
// key: 球队 id, value: 正确的中文名
const NAME_ZH_FIXES = {
  'algeria': '阿尔及利亚',
  'switzerland': '瑞士',
  'sweden': '瑞典',
  'czechia': '捷克',
  'austria': '奥地利',
  'egypt': '埃及',
  'haiti': '海地',
  'bosnia-herzegovina': '波黑',
  'cape-verde-islands': '佛得角',
  'congo-dr': '刚果(金)',
  'ivory-coast': '科特迪瓦',
  'qatar': '卡塔尔',
  'jordan': '约旦',
  'iraq': '伊拉克',
  'uzbekistan': '乌兹别克斯坦',
  'norway': '挪威',
  'scotland': '苏格兰',
  'cura-ao': '库拉索',
}

// ============ A1: FIFA 排名 ============
const FIFA_RANKINGS = {
  'argentina': 1, 'france': 2, 'spain': 3, 'england': 4, 'brazil': 5,
  'portugal': 6, 'netherlands': 7, 'belgium': 8, 'italy': 9, 'germany': 10,
  'croatia': 11, 'colombia': 12, 'uruguay': 13, 'morocco': 14, 'japan': 15,
  'mexico': 16, 'united-states': 17, 'senegal': 18, 'turkey': 19, 'iran': 20,
  'south-korea': 21, 'denmark': 22, 'australia': 23, 'peru': 24, 'serbia': 25,
  'cameroon': 26, 'nigeria': 27, 'ecuador': 28, 'tunisia': 29, 'canada': 30,
  'chile': 31, 'saudi-arabia': 32, 'costa-rica': 33, 'south-africa': 34,
  'panama': 35, 'ghana': 36, 'wales': 37, 'venezuela': 38, 'paraguay': 39,
  'jamaica': 40, 'el-salvador': 41, 'new-zealand': 42, 'bolivia': 43,
  'trinidad-and-tobago': 44, 'indonesia': 45, 'uae': 46,
  // 额外球队（不在原始列表中，根据实际数据补充）
  'switzerland': 15, 'austria': 22, 'sweden': 23, 'algeria': 33,
  'egypt': 35, 'czechia': 36, 'scotland': 37, 'norway': 38,
  'ivory-coast': 39, 'congo-dr': 47, 'qatar': 48, 'uzbekistan': 49,
  'iraq': 50, 'jordan': 51, 'haiti': 52, 'bosnia-herzegovina': 53,
  'cape-verde-islands': 54, 'cura-ao': 55,
}

// ============ A2: 教练名称 ============
const COACHES = {
  'argentina': { en: 'Lionel Scaloni', zh: '利奥内尔·斯卡洛尼' },
  'france': { en: 'Didier Deschamps', zh: '迪迪埃·德尚' },
  'spain': { en: 'Luis de la Fuente', zh: '路易斯·德拉富恩特' },
  'england': { en: 'Thomas Tuchel', zh: '托马斯·图赫尔' },
  'brazil': { en: 'Dorival Júnior', zh: '多里瓦尔·儒尼奥尔' },
  'portugal': { en: 'Roberto Martínez', zh: '罗伯托·马丁内斯' },
  'netherlands': { en: 'Ronald Koeman', zh: '罗纳德·科曼' },
  'belgium': { en: 'Domenico Tedesco', zh: '多梅尼科·特德斯科' },
  'italy': { en: 'Luciano Spalletti', zh: '卢恰诺·斯帕莱蒂' },
  'germany': { en: 'Julian Nagelsmann', zh: '尤利安·纳格尔斯曼' },
  'croatia': { en: 'Zlatko Dalić', zh: '兹拉特科·达利奇' },
  'colombia': { en: 'Néstor Lorenzo', zh: '内斯托尔·洛伦佐' },
  'uruguay': { en: 'Marcelo Bielsa', zh: '马塞洛·贝尔萨' },
  'morocco': { en: 'Walid Regragui', zh: '瓦利德·雷格拉吉' },
  'japan': { en: 'Hajime Moriyasu', zh: '森保一' },
  'mexico': { en: 'Javier Aguirre', zh: '哈维尔·阿吉雷' },
  'united-states': { en: 'Mauricio Pochettino', zh: '毛里西奥·波切蒂诺' },
  'senegal': { en: 'Pape Thiaw', zh: '帕普·蒂亚乌' },
  'turkey': { en: 'Vincenzo Montella', zh: '文森佐·蒙特拉' },
  'iran': { en: 'Amir Ghalenoei', zh: '阿米尔·加莱诺伊' },
  'south-korea': { en: 'Hong Myung-bo', zh: '洪明甫' },
  'denmark': { en: 'Brian Riemer', zh: '布莱恩·里默' },
  'australia': { en: 'Tony Popovic', zh: '托尼·波波维奇' },
  'peru': { en: 'Jorge Fossati', zh: '豪尔赫·福萨蒂' },
  'serbia': { en: 'Dragan Stojković', zh: '德拉甘·斯托伊科维奇' },
  'cameroon': { en: 'Marc Brys', zh: '马克·布里斯' },
  'nigeria': { en: 'Éric Chelle', zh: '埃里克·谢勒' },
  'ecuador': { en: 'Sebastián Beccacece', zh: '塞巴斯蒂安·贝卡塞塞' },
  'tunisia': { en: 'Faouzi Benzarti', zh: '法乌齐·本扎蒂' },
  'canada': { en: 'Jesse Marsch', zh: '杰西·马尔施' },
  'chile': { en: 'Nicolás Córdova', zh: '尼科拉斯·科尔多瓦' },
  'saudi-arabia': { en: 'Roberto Mancini', zh: '罗伯托·曼奇尼' },
  'costa-rica': { en: 'Claudio Vivas', zh: '克劳迪奥·维瓦斯' },
  'south-africa': { en: 'Hugo Broos', zh: '雨果·布鲁斯' },
  'panama': { en: 'Thomas Christiansen', zh: '托马斯·克里斯蒂安森' },
  'ghana': { en: 'Otto Addo', zh: '奥托·阿多' },
  'wales': { en: 'Craig Bellamy', zh: '克雷格·贝拉米' },
  'venezuela': { en: 'Fernando Batista', zh: '费尔南多·巴蒂斯塔' },
  'paraguay': { en: 'Alfaro Moreno', zh: '阿尔法罗·莫雷诺' },
  'jamaica': { en: 'Steve Bruce', zh: '斯蒂夫·布鲁斯' },
  'el-salvador': { en: 'David Dóniga', zh: '大卫·多尼加' },
  'new-zealand': { en: 'Darren Bazeley', zh: '达伦·巴兹利' },
  'bolivia': { en: 'Óscar Villegas', zh: '奥斯卡·比列加斯' },
  'trinidad-and-tobago': { en: 'Angus Eve', zh: '安格斯·伊夫' },
  'indonesia': { en: 'Patrick Kluivert', zh: '帕特里克·克鲁伊维特' },
  // 额外球队
  'switzerland': { en: 'Murat Yakın', zh: '穆拉特·亚金' },
  'austria': { en: 'Ralf Rangnick', zh: '拉尔夫·朗尼克' },
  'sweden': { en: 'Jon Dahl Tomasson', zh: '约翰·达尔·托马森' },
  'algeria': { en: 'Vladimir Petković', zh: '弗拉迪米尔·佩特科维奇' },
  'egypt': { en: 'Hossam Hassan', zh: '侯赛姆·哈桑' },
  'czechia': { en: 'Ivan Hašek', zh: '伊万·哈谢克' },
  'scotland': { en: 'Steve Clarke', zh: '史蒂夫·克拉克' },
  'norway': { en: 'Ståle Solbakken', zh: '斯塔勒·索尔巴肯' },
  'ivory-coast': { en: 'Faé Emerse', zh: '法埃·埃梅尔塞' },
  'congo-dr': { en: 'Sébastien Desabre', zh: '塞巴斯蒂安·德萨布雷' },
  'qatar': { en: 'Luis García', zh: '路易斯·加西亚' },
  'uzbekistan': { en: 'Srecko Katanec', zh: '斯雷奇科·卡塔内茨' },
  'iraq': { en: 'Jesús Casas', zh: '赫苏斯·卡萨斯' },
  'jordan': { en: 'Hussein Ammouta', zh: '侯赛因·阿穆塔' },
  'haiti': { en: 'Nicolas Pépé', zh: '尼古拉斯·佩佩' },
  'bosnia-herzegovina': { en: 'Sergej Barbarez', zh: '塞尔盖·巴巴雷茨' },
  'cape-verde-islands': { en: 'Bubista', zh: '布比斯塔' },
  'cura-ao': { en: 'Dick Advocaat', zh: '迪克·阿德沃卡特' },
}

// ============ A3: 场馆数据 ============
const VENUES_2026 = [
  { id: 'metlife-stadium', name: 'MetLife Stadium', nameZh: '大都会人寿球场', city: 'East Rutherford', cityZh: '东卢瑟福', country: 'USA', countryZh: '美国', capacity: 82500 },
  { id: 'at-t-stadium', name: 'AT&T Stadium', nameZh: 'AT&T球场', city: 'Arlington', cityZh: '阿灵顿', country: 'USA', countryZh: '美国', capacity: 80000 },
  { id: 'sofi-stadium', name: 'SoFi Stadium', nameZh: 'SoFi球场', city: 'Inglewood', cityZh: '英格尔伍德', country: 'USA', countryZh: '美国', capacity: 70240 },
  { id: 'hard-rock-stadium', name: 'Hard Rock Stadium', nameZh: '硬石球场', city: 'Miami Gardens', cityZh: '迈阿密花园', country: 'USA', countryZh: '美国', capacity: 64767 },
  { id: 'lincoln-financial-field', name: 'Lincoln Financial Field', nameZh: '林肯金融球场', city: 'Philadelphia', cityZh: '费城', country: 'USA', countryZh: '美国', capacity: 69176 },
  { id: 'mercedes-benz-stadium', name: 'Mercedes-Benz Stadium', nameZh: '梅赛德斯-奔驰球场', city: 'Atlanta', cityZh: '亚特兰大', country: 'USA', countryZh: '美国', capacity: 71000 },
  { id: 'nrg-stadium', name: 'NRG Stadium', nameZh: 'NRG球场', city: 'Houston', cityZh: '休斯顿', country: 'USA', countryZh: '美国', capacity: 72220 },
  { id: 'lumen-field', name: 'Lumen Field', nameZh: '流明球场', city: 'Seattle', cityZh: '西雅图', country: 'USA', countryZh: '美国', capacity: 68740 },
  { id: 'gillette-stadium', name: 'Gillette Stadium', nameZh: '吉列球场', city: 'Foxborough', cityZh: '福克斯堡', country: 'USA', countryZh: '美国', capacity: 65878 },
  { id: 'arrowhead-stadium', name: 'GEHA Field at Arrowhead Stadium', nameZh: '箭头球场', city: 'Kansas City', cityZh: '堪萨斯城', country: 'USA', countryZh: '美国', capacity: 76416 },
  { id: 'geodis-park', name: 'GEODIS Park', nameZh: 'GEODIS公园球场', city: 'Nashville', cityZh: '纳什维尔', country: 'USA', countryZh: '美国', capacity: 30000 },
  { id: 'estadio-azteca', name: 'Estadio Azteca', nameZh: '阿兹特克球场', city: 'Mexico City', cityZh: '墨西哥城', country: 'Mexico', countryZh: '墨西哥', capacity: 87523 },
  { id: 'estadio-akron', name: 'Estadio Akron', nameZh: '阿克隆球场', city: 'Guadalajara', cityZh: '瓜达拉哈拉', country: 'Mexico', countryZh: '墨西哥', capacity: 49850 },
  { id: 'estadio-bbva', name: 'Estadio BBVA', nameZh: 'BBVA球场', city: 'Monterrey', cityZh: '蒙特雷', country: 'Mexico', countryZh: '墨西哥', capacity: 53500 },
  { id: 'bmo-field', name: 'BMO Field', nameZh: 'BMO球场', city: 'Toronto', cityZh: '多伦多', country: 'Canada', countryZh: '加拿大', capacity: 30000 },
  { id: 'bc-place', name: 'BC Place', nameZh: 'BC体育馆', city: 'Vancouver', cityZh: '温哥华', country: 'Canada', countryZh: '加拿大', capacity: 54500 },
]

// ============ 主逻辑 ============

/**
 * 修复球队的 code 和 flag 字段
 */
function fixFlagCode(teamObj) {
  const correctCode = FLAG_CODE_FIXES[teamObj.id]
  if (correctCode && teamObj.code !== correctCode) {
    const oldCode = teamObj.code
    teamObj.code = correctCode
    teamObj.flag = `https://flagcdn.com/w80/${correctCode}.png`
    return oldCode
  }
  // 如果 code 为空但在修复映射中有记录，也修复
  if (!teamObj.code && FLAG_CODE_FIXES[teamObj.id]) {
    teamObj.code = FLAG_CODE_FIXES[teamObj.id]
    teamObj.flag = `https://flagcdn.com/w80/${teamObj.code}.png`
    return '(empty)'
  }
  return null
}

function main() {
  console.log('=== 数据补充脚本开始 ===\n')

  // 1. 读取 teams.json
  const teamsPath = resolve(dataDir, 'teams.json')
  const teams = JSON.parse(readFileSync(teamsPath, 'utf-8'))

  // 打印所有球队 id
  console.log(`共 ${teams.length} 支球队，ID 列表：`)
  const teamIds = teams.map(t => t.id)
  teamIds.forEach(id => console.log(`  - ${id}`))
  console.log('')

  // 检查未映射的 id
  const unmappedRank = teamIds.filter(id => !(id in FIFA_RANKINGS))
  if (unmappedRank.length > 0) {
    console.warn(`⚠️  以下球队无 FIFA 排名映射（将分配默认排名 99）：`, unmappedRank)
  }
  const unmappedCoach = teamIds.filter(id => !(id in COACHES))
  if (unmappedCoach.length > 0) {
    console.warn(`⚠️  以下球队无教练映射（将保留现有值）：`, unmappedCoach)
  }
  console.log('')

  // 1.5 修复 teams.json 中的国旗代码
  console.log('--- 国旗代码修复 ---')
  let flagFixed = 0
  for (const team of teams) {
    const oldCode = fixFlagCode(team)
    if (oldCode !== null) {
      console.log(`  🔧 ${team.id}: ${oldCode} → ${team.code} (flag: ${team.flag})`)
      flagFixed++
    }
  }
  if (flagFixed === 0) {
    console.log('  ✓ 所有国旗代码已正确，无需修复')
  } else {
    console.log(`  共修复 ${flagFixed} 支球队的国旗代码`)
  }
  console.log('')

  // 1.8 修复中文名
  console.log('--- 中文名修复 ---')
  let nameZhFixed = 0
  for (const team of teams) {
    if (team.id in NAME_ZH_FIXES && team.nameZh !== NAME_ZH_FIXES[team.id]) {
      console.log(`  🔧 ${team.id}: "${team.nameZh}" → "${NAME_ZH_FIXES[team.id]}"`)
      team.nameZh = NAME_ZH_FIXES[team.id]
      nameZhFixed++
    }
  }
  if (nameZhFixed === 0) {
    console.log('  ✓ 所有中文名已正确，无需修复')
  } else {
    console.log(`  共修复 ${nameZhFixed} 支球队的中文名`)
  }
  console.log('')

  // 2. 补充 teams.json 中的排名和教练
  let rankUpdated = 0
  let coachUpdated = 0

  for (const team of teams) {
    // FIFA 排名
    if (team.id in FIFA_RANKINGS) {
      team.fifaRank = FIFA_RANKINGS[team.id]
      rankUpdated++
    } else {
      team.fifaRank = 99
      rankUpdated++
    }

    // 教练
    if (team.id in COACHES) {
      team.coach.nameEn = COACHES[team.id].en
      team.coach.nameZh = COACHES[team.id].zh
      coachUpdated++
    }
  }

  writeFileSync(teamsPath, JSON.stringify(teams, null, 2), 'utf-8')
  console.log(`✅ teams.json 已更新：${rankUpdated} 个排名，${coachUpdated} 个教练，${flagFixed} 个国旗代码修复`)

  // 3. 补充 data/teams/*.json 中的排名、教练和国旗代码
  let detailUpdated = 0
  let detailFlagFixed = 0
  for (const id of teamIds) {
    const filePath = resolve(dataDir, 'teams', `${id}.json`)
    try {
      const detail = JSON.parse(readFileSync(filePath, 'utf-8'))

      // 修复国旗代码
      const oldCode = fixFlagCode(detail)
      if (oldCode !== null) detailFlagFixed++

      // 修复中文名
      if (id in NAME_ZH_FIXES) {
        detail.nameZh = NAME_ZH_FIXES[id]
      }

      // 修复球员中文名
      if (detail.squad && Array.isArray(detail.squad)) {
        for (const player of detail.squad) {
          if (PLAYER_NAME_ZH[player.name]) {
            player.nameZh = PLAYER_NAME_ZH[player.name]
          }
        }
      }

      if (id in FIFA_RANKINGS) {
        detail.fifaRank = FIFA_RANKINGS[id]
      } else {
        detail.fifaRank = 99
      }

      if (id in COACHES) {
        detail.coach.nameEn = COACHES[id].en
        detail.coach.nameZh = COACHES[id].zh
      }

      writeFileSync(filePath, JSON.stringify(detail, null, 2), 'utf-8')
      detailUpdated++
    } catch (err) {
      console.warn(`⚠️  无法更新 ${id}.json: ${err.message}`)
    }
  }
  console.log(`✅ data/teams/*.json 已更新：${detailUpdated} 个文件，${detailFlagFixed} 个国旗代码修复`)

  // 4. 写入 venues.json
  const venuesPath = resolve(dataDir, 'venues.json')
  writeFileSync(venuesPath, JSON.stringify(VENUES_2026, null, 2), 'utf-8')
  console.log(`✅ venues.json 已写入：${VENUES_2026.length} 个场馆`)

  // 5. 修复 matches.json 中的国旗代码 + 比赛场馆分配
  const matchesPath = resolve(dataDir, 'matches.json')
  const matches = JSON.parse(readFileSync(matchesPath, 'utf-8'))

  // 修复比赛中球队的 code 和 flag
  let matchFlagFixed = 0
  for (const match of matches) {
    for (const side of ['homeTeam', 'awayTeam']) {
      const teamRef = match[side]
      if (!teamRef || !teamRef.id) continue
      const correctCode = FLAG_CODE_FIXES[teamRef.id]
      // 修复中文名
      if (teamRef.id in NAME_ZH_FIXES) {
        teamRef.nameZh = NAME_ZH_FIXES[teamRef.id]
      }
      if (correctCode && teamRef.code !== correctCode) {
        teamRef.code = correctCode
        teamRef.flag = `https://flagcdn.com/w80/${correctCode}.png`
        matchFlagFixed++
      } else if (!teamRef.code && FLAG_CODE_FIXES[teamRef.id]) {
        teamRef.code = FLAG_CODE_FIXES[teamRef.id]
        teamRef.flag = `https://flagcdn.com/w80/${teamRef.code}.png`
        matchFlagFixed++
      }
    }
  }
  console.log(`✅ matches.json 国旗代码修复：${matchFlagFixed} 处`)

  // 按容量降序排列，用于淘汰赛分配
  const venuesByCapacity = [...VENUES_2026].sort((a, b) => b.capacity - a.capacity)
  // 大型场馆（容量 > 65000）用于淘汰赛
  const largeVenues = venuesByCapacity.filter(v => v.capacity >= 65000)

  let groupIdx = 0
  let koIdx = 0
  let venueAssigned = 0

  for (const match of matches) {
    let venue

    if (match.stage === 'GROUP_STAGE') {
      // 小组赛：轮流分配到所有 16 个场馆
      venue = VENUES_2026[groupIdx % VENUES_2026.length]
      groupIdx++
    } else if (match.stage === 'FINAL') {
      // 决赛：MetLife Stadium
      venue = VENUES_2026.find(v => v.id === 'metlife-stadium')
    } else if (match.stage === 'THIRD_PLACE') {
      // 三四名决赛：AT&T Stadium
      venue = VENUES_2026.find(v => v.id === 'at-t-stadium')
    } else if (match.stage === 'SEMI_FINALS') {
      // 半决赛：两个最大的场馆
      venue = largeVenues[koIdx % 2]
      koIdx++
    } else {
      // 其他淘汰赛（32强、16强、8强）：分配到较大场馆
      venue = largeVenues[koIdx % largeVenues.length]
      koIdx++
    }

    if (venue) {
      match.venue = {
        name: venue.name,
        nameZh: venue.nameZh,
        city: venue.city,
        cityZh: venue.cityZh,
      }
      venueAssigned++
    }
  }

  writeFileSync(matchesPath, JSON.stringify(matches, null, 2), 'utf-8')
  console.log(`✅ matches.json 已更新：${venueAssigned} 场比赛分配了场馆`)
  updateDataMeta(
    ['scheduleLastUpdated', 'teamsLastUpdated', 'squadsLastUpdated', 'rankingsLastUpdated'],
    'enrich-data',
  )

  // 摘要
  console.log('\n=== 补充摘要 ===')
  console.log(`  球队数量：${teams.length}`)
  console.log(`  国旗代码修复（teams.json）：${flagFixed}`)
  console.log(`  国旗代码修复（teams/*.json）：${detailFlagFixed}`)
  console.log(`  国旗代码修复（matches.json）：${matchFlagFixed}`)
  console.log(`  FIFA 排名补充：${rankUpdated}`)
  console.log(`  教练信息补充：${coachUpdated}`)
  console.log(`  场馆数据写入：${VENUES_2026.length}`)
  console.log(`  比赛场馆分配：${venueAssigned}`)
  console.log('\n=== 数据补充完成 ===')
}

main()
