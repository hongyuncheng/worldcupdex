/**
 * 从 git 历史提交中恢复球员照片字段
 * 用法: node scripts/restore-player-photos.mjs [commit-hash]
 *   默认从 a36a2d0（上次完整抓取照片的提交）恢复
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { updateDataMeta } from './lib/update-data-meta.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const teamsDir = join(__dirname, '..', 'data', 'teams');
const DEFAULT_COMMIT = 'a36a2d0';
const commit = process.argv[2] || DEFAULT_COMMIT;

const files = readdirSync(teamsDir).filter(f => f.endsWith('.json'));

let totalRestored = 0;
let totalPlayers = 0;

for (const file of files) {
  const currentPath = join(teamsDir, file);

  // 读取当前文件
  const current = JSON.parse(readFileSync(currentPath, 'utf-8'));

  // 从历史提交读取
  let historical;
  try {
    const historicalRaw = execSync(`git show ${commit}:data/teams/${file}`, {
      encoding: 'utf-8',
      cwd: join(__dirname, '..'),
    });
    historical = JSON.parse(historicalRaw);
  } catch (e) {
    console.log(`⚠️  ${file} - 在提交 ${commit} 中未找到，跳过`);
    continue;
  }

  if (!historical.squad || !current.squad) {
    console.log(`⏭️  ${file} - 无 squad 数据，跳过`);
    continue;
  }

  const historicalMap = new Map();
  for (const p of historical.squad) {
    historicalMap.set(p.name, p);
  }

  let restored = 0;
  for (const player of current.squad) {
    totalPlayers++;
    const hist = historicalMap.get(player.name);
    if (hist && hist.photo) {
      player.photo = hist.photo;
      if (hist.photoCutout !== undefined) player.photoCutout = hist.photoCutout;
      if (hist.photoThumb !== undefined) player.photoThumb = hist.photoThumb;
      restored++;
    }
  }

  writeFileSync(currentPath, JSON.stringify(current, null, 2), 'utf-8');
  totalRestored += restored;

  const status = restored > 0 ? `✅ 恢复 ${restored} 张` : '⚠️ 无照片可恢复';
  console.log(`${file} - ${current.squad.length} 名球员, ${status}`);
}

console.log(`\n=== 恢复完成 ===`);
console.log(`处理文件: ${files.length}`);
console.log(`当前总球员: ${totalPlayers}`);
console.log(`恢复照片数: ${totalRestored}`);

if (totalRestored > 0) {
  updateDataMeta(['squadsLastUpdated'], 'restore-player-photos');
}
