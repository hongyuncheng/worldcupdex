/**
 * 补充脚本：重新获取缺失照片的球员
 * 使用多种搜索策略提高命中率
 * 
 * 用法: node scripts/retry-missing-photos.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = resolve(__dirname, '..', 'data');

// TheSportsDB 免费 API 配置
const API_KEY = '3';
const SEARCH_PLAYER_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/searchplayers.php`;

// 请求间隔 3 秒
const REQUEST_DELAY_MS = 3000;
// 遇到 429 后的等待时间
const RATE_LIMIT_WAIT_MS = 15000;
// 重试次数
const MAX_RETRIES = 3;

// 统计
let stats = { total: 0, success: 0, failed: 0 };
const successPlayers = [];
const failedPlayers = [];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * 带重试的 fetch 请求
 */
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        if (attempt < retries) {
          console.log(`    ⚠ 限流 429 (尝试 ${attempt + 1}/${retries + 1}), 等待 ${RATE_LIMIT_WAIT_MS / 1000}s...`);
          await sleep(RATE_LIMIT_WAIT_MS);
          continue;
        }
        throw new Error('API 限流 (429)，已达最大重试次数');
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      if (err.message.includes('429') || err.message.includes('限流')) {
        throw err;
      }
      if (attempt < retries) {
        console.log(`    ⚠ 请求失败 (尝试 ${attempt + 1}/${retries + 1}): ${err.message}, 重试中...`);
        await sleep(REQUEST_DELAY_MS);
      } else {
        throw err;
      }
    }
  }
}

/**
 * 搜索球员并验证国籍
 */
async function searchAndVerify(searchName, nationality) {
  const url = `${SEARCH_PLAYER_URL}?p=${encodeURIComponent(searchName)}`;
  
  try {
    const data = await fetchWithRetry(url);
    
    if (!data || !data.player || data.player.length === 0) {
      return null;
    }

    // 只要足球运动员
    const soccerPlayers = data.player.filter(p =>
      p.strSport && p.strSport.toLowerCase() === 'soccer'
    );

    if (soccerPlayers.length === 0) return null;

    // 优先匹配国籍
    let bestMatch = null;
    if (soccerPlayers.length === 1) {
      bestMatch = soccerPlayers[0];
    } else {
      const nationalityMatch = soccerPlayers.find(p =>
        p.strNationality &&
        normalizeNationality(p.strNationality) === normalizeNationality(nationality)
      );
      bestMatch = nationalityMatch || null; // 多结果时必须匹配国籍
    }

    if (!bestMatch) return null;

    // 验证国籍匹配
    if (bestMatch.strNationality &&
        normalizeNationality(bestMatch.strNationality) !== normalizeNationality(nationality)) {
      // 单结果但国籍不匹配，也放过（可能是双国籍）
      // 但如果差异太大就拒绝
      if (!isRelatedNationality(bestMatch.strNationality, nationality)) {
        return null;
      }
    }

    const cutout = bestMatch.strCutout || null;
    const thumb = bestMatch.strThumb || null;
    
    // 至少需要有一个照片 URL
    if (!cutout && !thumb) return null;
    
    return { cutout, thumb };
  } catch (err) {
    console.log(`      ✗ 搜索失败 [${searchName}]: ${err.message}`);
    return null;
  }
}

/**
 * 标准化国籍名称
 */
function normalizeNationality(nat) {
  if (!nat) return '';
  const mapping = {
    'south korea': 'korea republic',
    'korea republic': 'korea republic',
    'republic of korea': 'korea republic',
    'korea': 'korea republic',
    'ivory coast': "cote d'ivoire",
    "cote d'ivoire": "cote d'ivoire",
    'usa': 'united states',
    'united states': 'united states',
    'us': 'united states',
    'congo dr': 'dr congo',
    'dr congo': 'dr congo',
    'democratic republic of the congo': 'dr congo',
    'congo': 'dr congo',
    'cape verde': 'cape verde islands',
    'cape verde islands': 'cape verde islands',
    'cabo verde': 'cape verde islands',
    'curacao': 'curacao',
    'curaçao': 'curacao',
    'cura ao': 'curacao',
    'bosnia': 'bosnia and herzegovina',
    'bosnia and herzegovina': 'bosnia and herzegovina',
    'bosnia-herzegovina': 'bosnia and herzegovina',
    'czechia': 'czech republic',
    'czech republic': 'czech republic',
    'holland': 'netherlands',
    'netherlands': 'netherlands',
    'the netherlands': 'netherlands',
  };
  const lower = nat.toLowerCase().trim();
  return mapping[lower] || lower;
}

/**
 * 判断两个国籍是否可能相关（双国籍等情况）
 */
function isRelatedNationality(nat1, nat2) {
  const n1 = normalizeNationality(nat1);
  const n2 = normalizeNationality(nat2);
  if (n1 === n2) return true;
  // 允许一些宽松匹配
  if (n1.includes(n2) || n2.includes(n1)) return true;
  return false;
}

// =================== 搜索策略 ===================

/**
 * 去除变音符号
 */
function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * 名字反转 (First Last → Last First, 或反过来)
 */
function reverseNameParts(name) {
  const parts = name.split(/\s+/);
  if (parts.length === 2) {
    return [parts[1] + ' ' + parts[0]];
  }
  if (parts.length === 3) {
    // Try "Last FirstMiddle" and "Last First Middle"
    return [
      parts[2] + ' ' + parts[0] + ' ' + parts[1],
      parts[1] + ' ' + parts[2] + ' ' + parts[0],
    ];
  }
  return [];
}

/**
 * 去除常见前缀/后缀，简化名字
 */
function simplifyName(name) {
  const results = [];
  const prefixes = ['de', 'van', 'von', 'dos', 'das', 'da', 'del', 'el', 'al', 'ben', 'ibn', 'di', 'le', 'la'];
  const parts = name.split(/\s+/);
  
  // 去除前缀词
  const filtered = parts.filter(p => !prefixes.includes(p.toLowerCase()));
  if (filtered.length > 0 && filtered.join(' ') !== name) {
    results.push(filtered.join(' '));
  }
  
  // 对于 "Danilo dos Santos de Oliveira" 这类，试只用 first + last
  if (parts.length > 2) {
    results.push(parts[0] + ' ' + parts[parts.length - 1]);
    // 也试只用第一个名字
    results.push(parts[0]);
  }
  
  return results;
}

/**
 * 只用姓氏搜索
 */
function lastNameOnly(name) {
  const parts = name.split(/\s+/);
  if (parts.length >= 2) {
    return [parts[parts.length - 1]];
  }
  return [];
}

/**
 * 去除连字符
 */
function removeHyphens(name) {
  const results = [];
  if (name.includes('-')) {
    results.push(name.replace(/-/g, ' '));
    results.push(name.replace(/-/g, ''));
  }
  return results;
}

/**
 * 只用名搜索（第一个词）
 */
function firstNameOnly(name) {
  const parts = name.split(/\s+/);
  if (parts.length >= 2 && parts[0].length > 3) {
    return [parts[0]];
  }
  return [];
}

/**
 * 生成所有搜索变体（按优先级排序）
 */
function generateSearchVariants(originalName) {
  const variants = [];
  const seen = new Set();
  
  function addVariant(v) {
    const normalized = v.trim().toLowerCase();
    if (normalized && !seen.has(normalized) && normalized !== originalName.toLowerCase()) {
      seen.add(normalized);
      variants.push(v.trim());
    }
  }
  
  // 策略1: 去除变音符号
  const noDiacritics = removeDiacritics(originalName);
  if (noDiacritics !== originalName) {
    addVariant(noDiacritics);
  }
  
  // 策略2: 名字反转
  reverseNameParts(originalName).forEach(addVariant);
  // 也试去除变音后反转
  if (noDiacritics !== originalName) {
    reverseNameParts(noDiacritics).forEach(addVariant);
  }
  
  // 策略3: 去除连字符
  removeHyphens(originalName).forEach(addVariant);
  if (noDiacritics !== originalName) {
    removeHyphens(noDiacritics).forEach(addVariant);
  }
  
  // 策略4: 简化名字（去前缀）
  simplifyName(originalName).forEach(addVariant);
  if (noDiacritics !== originalName) {
    simplifyName(noDiacritics).forEach(addVariant);
  }
  
  // 策略5: 只用姓氏
  lastNameOnly(originalName).forEach(addVariant);
  if (noDiacritics !== originalName) {
    lastNameOnly(noDiacritics).forEach(addVariant);
  }
  
  // 策略6: 只用名
  firstNameOnly(originalName).forEach(addVariant);
  
  return variants;
}

/**
 * 多策略搜索球员照片
 */
async function multiStrategySearch(playerName, nationality) {
  // 先用原名重试一次（可能 API 数据已更新）
  let result = await searchAndVerify(playerName, nationality);
  if (result) return { result, strategy: '原名重试' };
  
  // 生成搜索变体
  const variants = generateSearchVariants(playerName);
  
  for (const variant of variants) {
    await sleep(REQUEST_DELAY_MS);
    result = await searchAndVerify(variant, nationality);
    if (result) return { result, strategy: variant };
  }
  
  return null;
}

/**
 * 主函数
 */
async function main() {
  console.log('=== 球员照片补充获取脚本（多策略搜索）===');
  console.log(`API Key: ${API_KEY}`);
  console.log(`请求间隔: ${REQUEST_DELAY_MS}ms`);
  console.log('');

  // 收集所有缺失照片的球员
  const teamsDir = resolve(dataDir, 'teams');
  const teamFiles = readdirSync(teamsDir).filter(f => f.endsWith('.json'));
  
  const missingPlayers = []; // { teamFile, teamName, playerIndex, player }
  
  for (const file of teamFiles) {
    const filePath = resolve(teamsDir, file);
    const teamData = JSON.parse(readFileSync(filePath, 'utf-8'));
    if (!teamData.squad) continue;
    
    teamData.squad.forEach((player, idx) => {
      if (player.photo === null) {
        missingPlayers.push({
          teamFile: file,
          teamFilePath: filePath,
          teamName: teamData.nameEn,
          playerIndex: idx,
          player
        });
      }
    });
  }

  console.log(`共找到 ${missingPlayers.length} 个缺失照片的球员\n`);
  stats.total = missingPlayers.length;

  // 逐个处理
  for (let i = 0; i < missingPlayers.length; i++) {
    const { teamFile, teamFilePath, teamName, playerIndex, player } = missingPlayers[i];
    
    console.log(`[${i + 1}/${missingPlayers.length}] ${player.name} (${teamName})`);
    
    const searchResult = await multiStrategySearch(player.name, player.nationality || teamName);
    
    if (searchResult) {
      const { result, strategy } = searchResult;
      // 更新球员数据
      const teamData = JSON.parse(readFileSync(teamFilePath, 'utf-8'));
      teamData.squad[playerIndex].photoCutout = result.cutout;
      teamData.squad[playerIndex].photoThumb = result.thumb;
      teamData.squad[playerIndex].photo = result.cutout || result.thumb || null;
      writeFileSync(teamFilePath, JSON.stringify(teamData, null, 2), 'utf-8');
      
      stats.success++;
      successPlayers.push(`${player.name} (${teamName}) [策略: ${strategy}]`);
      console.log(`  ✓ 找到! 策略: "${strategy}" (cutout: ${result.cutout ? '✓' : '✗'}, thumb: ${result.thumb ? '✓' : '✗'})`);
    } else {
      stats.failed++;
      failedPlayers.push(`${player.name} (${teamName})`);
      console.log(`  ✗ 所有策略均失败`);
    }
    
    // 球员间间隔
    if (i < missingPlayers.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  // 打印统计
  console.log('\n\n=== 统计摘要 ===');
  console.log(`总缺失球员: ${stats.total}`);
  console.log(`成功找到: ${stats.success}`);
  console.log(`仍然失败: ${stats.failed}`);
  console.log(`成功率: ${stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0}%`);

  if (successPlayers.length > 0) {
    console.log(`\n--- 成功找到的球员 (${successPlayers.length}) ---`);
    successPlayers.forEach(p => console.log(`  ✓ ${p}`));
  }

  if (failedPlayers.length > 0) {
    console.log(`\n--- 仍未找到的球员 (${failedPlayers.length}) ---`);
    failedPlayers.forEach(p => console.log(`  ✗ ${p}`));
  }

  console.log('\n完成!');
}

main().catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
