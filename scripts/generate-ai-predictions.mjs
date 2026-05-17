/**
 * 生成AI预测数据脚本
 * 为2026世界杯104场比赛生成AI预测结果
 * 使用固定随机种子确保结果可复现
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '..', 'data');

// ============ 固定随机种子（线性同余法） ============
class SeededRandom {
  constructor(seed = 2026) {
    this.seed = seed;
  }
  next() {
    // 线性同余生成器: a=1664525, c=1013904223, m=2^32
    this.seed = (this.seed * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (this.seed >>> 0) / 0xFFFFFFFF;
  }
}

const rng = new SeededRandom(20260611); // 用开幕日期做种子

// ============ 加载数据 ============
const matches = JSON.parse(readFileSync(join(dataDir, 'matches.json'), 'utf-8'));
const teams = JSON.parse(readFileSync(join(dataDir, 'teams.json'), 'utf-8'));

// 构建球队查找表
const teamMap = {};
for (const team of teams) {
  teamMap[team.id] = team;
}

// 东道主列表
const HOST_COUNTRIES = ['united-states', 'mexico', 'canada'];

// ============ 核心预测算法 ============
function calculateWinProbability(homeRank, awayRank, stage, isHostCountry) {
  const rankDiff = awayRank - homeRank; // 正数=主队更强

  // 基础胜率（基于排名差）
  let homeWinProb = 0.4 + (rankDiff / 100) * 0.3;

  // 主场优势（美/加/墨球队在本届有加成）
  if (isHostCountry) homeWinProb += 0.08;

  // 淘汰赛阶段更不确定（平局概率上升）
  if (stage !== 'GROUP_STAGE') {
    homeWinProb = 0.33 + (homeWinProb - 0.33) * 0.6;
  }

  // 加入随机波动（±10%），让预测不那么死板
  homeWinProb += (rng.next() - 0.5) * 0.1;

  // 确保在合理范围内
  homeWinProb = Math.max(0.15, Math.min(0.7, homeWinProb));

  const drawProb = stage === 'GROUP_STAGE' ? 0.25 : 0.15;
  let awayWinProb = 1 - homeWinProb - drawProb;

  // 确保客队胜率不为负
  if (awayWinProb < 0.1) {
    awayWinProb = 0.1;
    homeWinProb = 1 - drawProb - awayWinProb;
  }

  return { homeWin: homeWinProb, draw: drawProb, awayWin: awayWinProb };
}

// ============ 预测结果判定 ============
function determineResult(probs) {
  const rand = rng.next();
  if (rand < probs.homeWin) return 'HOME_WIN';
  if (rand < probs.homeWin + probs.draw) return 'DRAW';
  return 'AWAY_WIN';
}

// ============ 比分生成 ============
function generateScore(result, stage) {
  const groupScores = {
    HOME_WIN: [[1, 0], [2, 1], [2, 0], [3, 1], [3, 0], [1, 0], [2, 1]],
    DRAW: [[1, 1], [0, 0], [2, 2], [1, 1], [0, 0], [1, 1]],
    AWAY_WIN: [[0, 1], [1, 2], [0, 2], [1, 3], [0, 1], [1, 2]]
  };
  const knockoutScores = {
    HOME_WIN: [[1, 0], [2, 1], [2, 0], [3, 1], [3, 2], [1, 0], [2, 1]],
    DRAW: [[1, 1], [0, 0], [2, 2], [1, 1]],
    AWAY_WIN: [[0, 1], [1, 2], [0, 2], [1, 3], [0, 1], [2, 3]]
  };

  const scores = stage === 'GROUP_STAGE' ? groupScores[result] : knockoutScores[result];
  const idx = Math.floor(rng.next() * scores.length);
  const [home, away] = scores[idx];
  return { home, away };
}

// ============ 置信度计算 ============
function calculateConfidence(probs, result) {
  let mainProb;
  if (result === 'HOME_WIN') mainProb = probs.homeWin;
  else if (result === 'DRAW') mainProb = probs.draw;
  else mainProb = probs.awayWin;

  // 置信度 = 主预测概率映射到 50-90 区间
  const confidence = Math.round(50 + mainProb * 50);
  return Math.max(45, Math.min(92, confidence));
}

// ============ 关键因素生成 ============
function generateKeyFactors(homeTeam, awayTeam, stage, matchday, isHostCountry, result) {
  const factors = [];
  const homeRank = homeTeam.fifaRank;
  const awayRank = awayTeam.fifaRank;
  const rankDiff = Math.abs(homeRank - awayRank);

  // 排名因素
  if (rankDiff > 15) {
    factors.push(result === 'AWAY_WIN' ? 'FIFA排名优势' : (homeRank < awayRank ? 'FIFA排名优势' : 'FIFA排名劣势逆袭'));
  } else if (rankDiff <= 5) {
    factors.push('FIFA排名接近');
  } else {
    factors.push(homeRank < awayRank ? 'FIFA排名优势' : 'FIFA排名优势');
  }

  // 主场因素
  if (isHostCountry) {
    factors.push('主场优势');
  } else if (HOST_COUNTRIES.includes(awayTeam.id)) {
    factors.push('客场挑战');
  }

  // 阶段因素
  if (stage === 'GROUP_STAGE') {
    if (matchday === 1) factors.push('小组赛首场');
    else if (matchday === 3) factors.push('小组出线关键战');
  } else {
    factors.push('淘汰赛压力');
  }

  // 球队特性因素
  if (homeRank <= 5 || awayRank <= 5) {
    factors.push('历史强队底蕴');
  }
  if (homeRank >= 45 || awayRank >= 45) {
    factors.push('新军冲击力');
  }

  // 额外因素补充
  if (factors.length < 2) {
    if (rng.next() > 0.5) factors.push('攻击力突出');
    else factors.push('防守稳固');
  }

  // 返回2-3个最相关因素
  return factors.slice(0, 3);
}

// ============ 分析文本生成 ============
function generateAnalysis(homeTeam, awayTeam, stage, matchday, probs, result, score, isHostCountry) {
  const homeRank = homeTeam.fifaRank;
  const awayRank = awayTeam.fifaRank;
  const homeName = homeTeam.nameZh;
  const awayName = awayTeam.nameZh;

  // 排名对比描述
  let rankCompare = '';
  const rankDiff = Math.abs(homeRank - awayRank);
  if (rankDiff <= 5) {
    rankCompare = `${homeName}(FIFA第${homeRank})与${awayName}(FIFA第${awayRank})排名接近，实力在伯仲之间`;
  } else if (homeRank < awayRank) {
    rankCompare = `${homeName}(FIFA第${homeRank})排名领先于${awayName}(FIFA第${awayRank})，纸面实力占优`;
  } else {
    rankCompare = `${awayName}(FIFA第${awayRank})排名高于${homeName}(FIFA第${homeRank})，客队实力更强`;
  }

  // 阶段描述
  let stageDesc = '';
  if (stage === 'GROUP_STAGE') {
    if (matchday === 1) stageDesc = '作为小组赛首轮比赛，双方都希望取得开门红，建立信心';
    else if (matchday === 2) stageDesc = '小组赛第二轮，双方对形势都有了更清晰的判断，战术针对性更强';
    else stageDesc = '小组赛末轮生死战，出线形势使得比赛充满变数和紧迫感';
  } else {
    stageDesc = '淘汰赛单场定胜负的赛制增加了比赛的不确定性，心理素质成为关键';
  }

  // 主场优势描述
  let hostDesc = '';
  if (isHostCountry) {
    hostDesc = `${homeName}作为东道主之一，主场氛围将成为重要的第十二人。`;
  }

  // 预测结论
  let conclusion = '';
  if (result === 'HOME_WIN') {
    conclusion = `综合分析，AI预测${homeName}将以${score.home}-${score.away}取胜。`;
  } else if (result === 'DRAW') {
    conclusion = `综合分析，AI预测双方将以${score.home}-${score.away}握手言和。`;
  } else {
    conclusion = `综合分析，AI预测${awayName}将以客场${score.away}-${score.home}取胜。`;
  }

  return `${rankCompare}。${stageDesc}。${hostDesc}${conclusion}`;
}

// ============ 获取阶段中文名 ============
function getStageName(stage) {
  const map = {
    'GROUP_STAGE': '小组赛',
    'LAST_32': '32强赛',
    'LAST_16': '16强赛',
    'QUARTER_FINALS': '四分之一决赛',
    'SEMI_FINALS': '半决赛',
    'THIRD_PLACE': '三四名决赛',
    'FINAL': '决赛'
  };
  return map[stage] || stage;
}

// ============ 主逻辑：生成所有预测 ============
const predictions = [];
let stats = { homeWin: 0, draw: 0, awayWin: 0, totalConfidence: 0, generated: 0, skipped: 0 };

for (const match of matches) {
  const homeId = match.homeTeam.id;
  const awayId = match.awayTeam.id;

  // 跳过TBD比赛（淘汰赛未确定球队）
  if (homeId === 'tbd' || awayId === 'tbd') {
    predictions.push({
      matchId: match.id,
      result: null,
      score: null,
      confidence: 0,
      homeWinProb: 33,
      drawProb: 34,
      awayWinProb: 33,
      analysis: `${getStageName(match.stage)}对阵双方尚未确定，AI将在小组赛结束后更新预测。`,
      keyFactors: ['淘汰赛压力', '待定对阵'],
      pending: true
    });
    stats.skipped++;
    continue;
  }

  const homeTeam = teamMap[homeId];
  const awayTeam = teamMap[awayId];

  if (!homeTeam || !awayTeam) {
    console.warn(`⚠️ 找不到球队数据: ${homeId} 或 ${awayId}，跳过比赛 ${match.id}`);
    stats.skipped++;
    continue;
  }

  const isHostCountry = HOST_COUNTRIES.includes(homeId);
  const matchday = match.matchday;

  // 计算概率
  const probs = calculateWinProbability(
    homeTeam.fifaRank,
    awayTeam.fifaRank,
    match.stage,
    isHostCountry
  );

  // 判定结果
  const result = determineResult(probs);

  // 生成比分
  const score = generateScore(result, match.stage);

  // 计算置信度
  const confidence = calculateConfidence(probs, result);

  // 生成关键因素
  const keyFactors = generateKeyFactors(homeTeam, awayTeam, match.stage, matchday, isHostCountry, result);

  // 生成分析文本
  const analysis = generateAnalysis(homeTeam, awayTeam, match.stage, matchday, probs, result, score, isHostCountry);

  const prediction = {
    matchId: match.id,
    result,
    score,
    confidence,
    homeWinProb: Math.round(probs.homeWin * 100),
    drawProb: Math.round(probs.draw * 100),
    awayWinProb: Math.round(probs.awayWin * 100),
    analysis,
    keyFactors
  };

  predictions.push(prediction);
  stats.generated++;
  stats.totalConfidence += confidence;

  // 统计
  if (result === 'HOME_WIN') stats.homeWin++;
  else if (result === 'DRAW') stats.draw++;
  else stats.awayWin++;
}

// ============ 写入文件 ============
writeFileSync(
  join(dataDir, 'predictions.json'),
  JSON.stringify(predictions, null, 2),
  'utf-8'
);

// ============ 打印统计 ============
console.log('\n🤖 AI预测数据生成完成！');
console.log('═══════════════════════════════════════');
console.log(`📊 总比赛数: ${matches.length}`);
console.log(`✅ 已生成预测: ${stats.generated} 场`);
console.log(`⏳ 待定(TBD): ${stats.skipped} 场`);
console.log('───────────────────────────────────────');
console.log(`🏠 主队胜: ${stats.homeWin} 场 (${(stats.homeWin / stats.generated * 100).toFixed(1)}%)`);
console.log(`🤝 平  局: ${stats.draw} 场 (${(stats.draw / stats.generated * 100).toFixed(1)}%)`);
console.log(`✈️  客队胜: ${stats.awayWin} 场 (${(stats.awayWin / stats.generated * 100).toFixed(1)}%)`);
console.log('───────────────────────────────────────');
console.log(`📈 平均置信度: ${(stats.totalConfidence / stats.generated).toFixed(1)}%`);
console.log(`📁 输出文件: data/predictions.json`);
console.log('═══════════════════════════════════════\n');
