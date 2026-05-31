/**
 * 球员照片获取脚本
 * 从 TheSportsDB 免费 API 获取球员照片 URL
 * 
 * 用法: node scripts/fetch-player-photos.mjs [--team teamId] [--limit N]
 *   --team teamId   只处理指定球队（用于测试）
 *   --limit N       只处理前 N 支球队
 */

import { readFileSync, writeFileSync } from 'fs';
import { updateDataMeta } from './lib/update-data-meta.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = resolve(__dirname, '..', 'data');

// TheSportsDB 免费 API 配置
const API_KEY = '3';
const SEARCH_PLAYER_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/searchplayers.php`;

// 请求间隔 3 秒（API 限制严格，需要多留余量）
const REQUEST_DELAY_MS = 3000;

// 遇到 429 后的等待时间
const RATE_LIMIT_WAIT_MS = 15000;

// 重试次数
const MAX_RETRIES = 3;

// 统计数据
let stats = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0 // 已有 photoCutout/photoThumb 的跳过
};

// 失败记录
const failedPlayers = [];
let writtenTeamFiles = 0;

/**
 * 延迟函数
 */
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = { team: null, limit: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--team' && args[i + 1]) {
      options.team = args[i + 1];
      i++;
    } else if (args[i] === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[i + 1], 10);
      i++;
    }
  }
  return options;
}

/**
 * 带重试的 fetch 请求
 */
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        // 遇到限流，等待更长时间
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
 * 搜索球员照片
 * @param {string} playerName - 球员英文名
 * @param {string} nationality - 球员国籍（用于辅助匹配）
 * @returns {{cutout: string|null, thumb: string|null}|null} 照片对象或 null（API 无结果时）
 */
async function searchPlayerPhoto(playerName, nationality) {
  const url = `${SEARCH_PLAYER_URL}?p=${encodeURIComponent(playerName)}`;
  
  try {
    const data = await fetchWithRetry(url);
    
    if (!data || !data.player || data.player.length === 0) {
      return null;
    }

    // 过滤: 只要足球运动员
    const soccerPlayers = data.player.filter(p => 
      p.strSport && p.strSport.toLowerCase() === 'soccer'
    );

    if (soccerPlayers.length === 0) {
      return null;
    }

    let bestMatch = null;

    if (soccerPlayers.length === 1) {
      bestMatch = soccerPlayers[0];
    } else {
      // 多个结果时，优先匹配国籍
      const nationalityMatch = soccerPlayers.find(p => 
        p.strNationality && 
        p.strNationality.toLowerCase() === nationality.toLowerCase()
      );
      bestMatch = nationalityMatch || soccerPlayers[0];
    }

    // 分别提取 strCutout 和 strThumb
    const cutout = bestMatch.strCutout || null;
    const thumb = bestMatch.strThumb || null;
    return { cutout, thumb };
  } catch (err) {
    console.log(`    ✗ 搜索失败 [${playerName}]: ${err.message}`);
    return null;
  }
}

/**
 * 处理一支球队
 */
async function processTeam(teamId, teamIndex, totalTeams) {
  const teamFilePath = resolve(dataDir, 'teams', `${teamId}.json`);
  let teamData;
  
  try {
    teamData = JSON.parse(readFileSync(teamFilePath, 'utf-8'));
  } catch (err) {
    console.log(`✗ 无法读取球队文件: ${teamFilePath}`);
    return;
  }

  const squad = teamData.squad;
  if (!squad || squad.length === 0) {
    console.log(`[${teamIndex + 1}/${totalTeams}] ${teamData.nameEn} (${teamId}) - 无球员数据，跳过`);
    return;
  }

  console.log(`\n[${teamIndex + 1}/${totalTeams}] 处理 ${teamData.nameEn} (${teamId}) - ${squad.length} 名球员`);

  let teamSuccess = 0;
  let teamFailed = 0;
  let teamSkipped = 0;

  for (let i = 0; i < squad.length; i++) {
    const player = squad[i];
    stats.total++;

    // 增量更新：如果已有 photoCutout 和 photoThumb（都不为 undefined）则跳过
    if (player.photoCutout !== undefined && player.photoThumb !== undefined) {
      stats.skipped++;
      teamSkipped++;
      continue;
    }

    // 搜索球员照片
    const result = await searchPlayerPhoto(player.name, player.nationality || '');

    if (result) {
      player.photoCutout = result.cutout;
      player.photoThumb = result.thumb;
      // 向后兼容：photo = cutout || thumb || null
      player.photo = result.cutout || result.thumb || null;
      stats.success++;
      teamSuccess++;
      console.log(`  ✓ [${i + 1}/${squad.length}] ${player.name} (cutout: ${result.cutout ? '✓' : '✗'}, thumb: ${result.thumb ? '✓' : '✗'})`);
    } else {
      player.photoCutout = null;
      player.photoThumb = null;
      player.photo = null;
      stats.failed++;
      teamFailed++;
      failedPlayers.push(`${player.name} (${teamData.nameEn})`);
      console.log(`  ✗ [${i + 1}/${squad.length}] ${player.name} - 未找到照片`);
    }

    // 请求间隔（最后一个球员不需要等待）
    if (i < squad.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  // 保存更新后的文件
  writeFileSync(teamFilePath, JSON.stringify(teamData, null, 2), 'utf-8');
  writtenTeamFiles++;
  console.log(`  → 完成: 成功 ${teamSuccess}, 失败 ${teamFailed}, 跳过 ${teamSkipped}`);
}

/**
 * 主函数
 */
async function main() {
  const options = parseArgs();
  
  console.log('=== 球员照片获取脚本 ===');
  console.log(`API Key: ${API_KEY}`);
  console.log(`请求间隔: ${REQUEST_DELAY_MS}ms`);
  console.log('');

  // 读取球队列表
  const teamsFilePath = resolve(dataDir, 'teams.json');
  const teams = JSON.parse(readFileSync(teamsFilePath, 'utf-8'));

  // 过滤球队
  let teamsToProcess = teams;
  if (options.team) {
    teamsToProcess = teams.filter(t => t.id === options.team);
    if (teamsToProcess.length === 0) {
      console.log(`错误: 未找到球队 "${options.team}"`);
      process.exit(1);
    }
    console.log(`指定球队模式: ${options.team}`);
  } else if (options.limit) {
    teamsToProcess = teams.slice(0, options.limit);
    console.log(`限制模式: 只处理前 ${options.limit} 支球队`);
  }

  console.log(`共 ${teamsToProcess.length} 支球队待处理\n`);

  // 逐个处理球队
  for (let i = 0; i < teamsToProcess.length; i++) {
    await processTeam(teamsToProcess[i].id, i, teamsToProcess.length);
    
    // 球队之间也需要间隔（避免连续请求）
    if (i < teamsToProcess.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  if (writtenTeamFiles > 0) {
    updateDataMeta(['squadsLastUpdated'], 'fetch-player-photos');
  }

  // 打印统计摘要
  console.log('\n\n=== 统计摘要 ===');
  console.log(`总球员数: ${stats.total}`);
  console.log(`成功获取: ${stats.success}`);
  console.log(`未找到照片: ${stats.failed}`);
  console.log(`已有照片(跳过): ${stats.skipped}`);
  console.log(`成功率: ${stats.total > 0 ? ((stats.success / (stats.total - stats.skipped)) * 100).toFixed(1) : 0}%`);

  if (failedPlayers.length > 0) {
    console.log(`\n--- 未找到照片的球员 (${failedPlayers.length}) ---`);
    failedPlayers.forEach(p => console.log(`  - ${p}`));
  }

  console.log('\n完成!');
}

main().catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
