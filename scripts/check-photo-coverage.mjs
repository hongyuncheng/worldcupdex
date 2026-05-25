import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const dir = 'data/teams';
const files = readdirSync(dir).filter(f => f.endsWith('.json'));

let total = 0;
let missing = 0;
const teamMissing = [];

for (const f of files) {
  const d = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
  if (!d.squad) continue;
  const m = d.squad.filter(p => !p.photo);
  total += d.squad.length;
  missing += m.length;
  if (m.length > 0) {
    teamMissing.push({ file: f, total: d.squad.length, missing: m.length, names: m.map(p => p.name).slice(0, 5) });
  }
}

console.log('总球员:', total, ' 缺照片:', missing, ' 覆盖率:', ((total - missing) / total * 100).toFixed(1) + '%');
console.log('\n缺照片最多的球队:');
teamMissing.sort((a, b) => b.missing - a.missing).slice(0, 15).forEach(t => {
  console.log(`  ${t.file}: ${t.missing}/${t.total} 缺照片, 示例: ${t.names.join(', ')}`);
});
