import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const metaPath = resolve(__dirname, '..', '..', 'data', 'meta.json');

const defaultMeta = {
  scheduleLastUpdated: null,
  teamsLastUpdated: null,
  squadsLastUpdated: null,
  rankingsLastUpdated: null,
  source: 'unknown',
};

export function updateDataMeta(fields, source, targetPath = metaPath) {
  const current = JSON.parse(readFileSync(targetPath, 'utf-8'));
  const updatedAt = new Date().toISOString();
  const next = { ...defaultMeta, ...current, source };

  for (const field of fields) {
    if (!(field in defaultMeta) || field === 'source') {
      throw new Error(`Unknown data meta field: ${field}`);
    }
    next[field] = updatedAt;
  }

  writeFileSync(targetPath, `${JSON.stringify(next, null, 2)}\n`, 'utf-8');
  return updatedAt;
}
