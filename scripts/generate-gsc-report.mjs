/**
 * Google Search Console 搜索表现分析报告生成脚本
 *
 * 使用 GSC API 获取网站搜索表现数据，生成 Markdown 格式分析报告。
 *
 * 使用方法：
 *   node scripts/generate-gsc-report.mjs
 *
 * 环境变量（scripts/.env）：
 *   GSC_CLIENT_ID, GSC_CLIENT_SECRET, GSC_REFRESH_TOKEN, GSC_SITE_URL
 *
 * 首次使用需先运行 gsc-auth.mjs 获取 refresh token。
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, writeFileSync } from 'fs';
import { google } from 'googleapis';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '.env') });

const {
  GSC_CLIENT_ID,
  GSC_CLIENT_SECRET,
  GSC_REFRESH_TOKEN,
  GSC_SITE_URL = 'sc-domain:worldcupdex.org',
} = process.env;

// ============ 环境变量校验 ============

if (!GSC_CLIENT_ID || !GSC_CLIENT_SECRET || !GSC_REFRESH_TOKEN) {
  console.error('❌ 缺少必要的环境变量：');
  if (!GSC_CLIENT_ID) console.error('   - GSC_CLIENT_ID');
  if (!GSC_CLIENT_SECRET) console.error('   - GSC_CLIENT_SECRET');
  if (!GSC_REFRESH_TOKEN) console.error('   - GSC_REFRESH_TOKEN（请先运行 gsc-auth.mjs 获取）');
  console.error('\n   请检查 scripts/.env 文件');
  process.exit(1);
}

// ============ 工具函数 ============

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-US');
}

function formatPercent(value) {
  if (value === null || value === undefined) return '0.00%';
  return (value * 100).toFixed(2) + '%';
}

function formatPosition(pos) {
  if (pos === null || pos === undefined) return '-';
  return pos.toFixed(1);
}

function getDateRange() {
  // GSC 数据有 2-3 天延迟，endDate 设为3天前
  const end = new Date();
  end.setDate(end.getDate() - 3);
  const start = new Date(end);
  start.setDate(start.getDate() - 6); // 共7天
  return { start: formatDate(start), end: formatDate(end) };
}

function getCountryName(code) {
  const countryMap = {
    'chn': '中国', 'usa': '美国', 'jpn': '日本', 'kor': '韩国',
    'gbr': '英国', 'deu': '德国', 'fra': '法国', 'bra': '巴西',
    'ind': '印度', 'can': '加拿大', 'aus': '澳大利亚', 'rus': '俄罗斯',
    'twn': '台湾', 'hkg': '香港', 'sgp': '新加坡', 'mys': '马来西亚',
    'idn': '印尼', 'tha': '泰国', 'vnm': '越南', 'phl': '菲律宾',
    'mex': '墨西哥', 'esp': '西班牙', 'ita': '意大利', 'nld': '荷兰',
    'arg': '阿根廷', 'col': '哥伦比亚', 'chl': '智利', 'per': '秘鲁',
    'egy': '埃及', 'nga': '尼日利亚', 'zaf': '南非', 'sau': '沙特阿拉伯',
  };
  const lower = (code || '').toLowerCase();
  return countryMap[lower] || code.toUpperCase();
}

function getDeviceName(device) {
  const deviceMap = {
    'DESKTOP': '桌面端',
    'MOBILE': '移动端',
    'TABLET': '平板',
  };
  return deviceMap[device] || device;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ============ OAuth 客户端初始化 ============

function createAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    GSC_CLIENT_ID,
    GSC_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({ refresh_token: GSC_REFRESH_TOKEN });
  return oauth2Client;
}

// ============ API 调用层（含重试逻辑） ============

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function withRetry(fn, label) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.response?.status || err?.code;

      if (status === 401 || status === 403) {
        throw new Error(
          `${label} 认证失败 (${status})：请检查 GSC_REFRESH_TOKEN 是否有效。\n` +
          `   如果 Token 已过期，请重新运行 gsc-auth.mjs 获取新的 Refresh Token。`
        );
      }

      if (status === 429 || (status >= 500 && attempt < MAX_RETRIES)) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`   ⚠️ ${label} 第${attempt}次请求失败 (${status})，${delay/1000}s 后重试...`);
        await sleep(delay);
        continue;
      }

      throw err;
    }
  }
}

async function fetchSearchAnalytics(searchconsole, params) {
  return withRetry(async () => {
    const res = await searchconsole.searchanalytics.query({
      siteUrl: GSC_SITE_URL,
      requestBody: params,
    });
    return res.data;
  }, 'SearchAnalytics');
}

async function fetchSitemaps(searchconsole) {
  return withRetry(async () => {
    const res = await searchconsole.sitemaps.list({
      siteUrl: GSC_SITE_URL,
    });
    return res.data;
  }, 'Sitemaps');
}

// ============ 数据获取层 ============

async function fetchAllData(searchconsole, startDate, endDate) {
  console.log('   ▶ 获取搜索表现概览...');
  const overview = await fetchSearchAnalytics(searchconsole, {
    startDate,
    endDate,
    dimensions: [],
    rowLimit: 1,
  });

  console.log('   ▶ 获取每日趋势...');
  const dailyData = await fetchSearchAnalytics(searchconsole, {
    startDate,
    endDate,
    dimensions: ['date'],
    rowLimit: 25000,
  });

  console.log('   ▶ 获取热门查询词 TOP 20...');
  const queryData = await fetchSearchAnalytics(searchconsole, {
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: 20,
    dimensionFilterGroups: [],
  });

  console.log('   ▶ 获取热门页面 TOP 20...');
  const pageData = await fetchSearchAnalytics(searchconsole, {
    startDate,
    endDate,
    dimensions: ['page'],
    rowLimit: 20,
  });

  console.log('   ▶ 获取国家分布 TOP 10...');
  const countryData = await fetchSearchAnalytics(searchconsole, {
    startDate,
    endDate,
    dimensions: ['country'],
    rowLimit: 10,
  });

  console.log('   ▶ 获取设备分布...');
  const deviceData = await fetchSearchAnalytics(searchconsole, {
    startDate,
    endDate,
    dimensions: ['device'],
    rowLimit: 10,
  });

  console.log('   ▶ 获取 Sitemap 状态...');
  let sitemapData = null;
  try {
    sitemapData = await fetchSitemaps(searchconsole);
  } catch (err) {
    console.warn(`   ⚠️ 获取 Sitemap 信息失败: ${err.message}`);
  }

  return { overview, dailyData, queryData, pageData, countryData, deviceData, sitemapData };
}

// ============ 数据聚合层 ============

function aggregateData(rawData) {
  const { overview, dailyData, queryData, pageData, countryData, deviceData, sitemapData } = rawData;

  // 概览数据
  const overviewRow = overview?.rows?.[0] || {};
  const summary = {
    clicks: overviewRow.clicks || 0,
    impressions: overviewRow.impressions || 0,
    ctr: overviewRow.ctr || 0,
    position: overviewRow.position || 0,
  };

  // 每日趋势
  const daily = (dailyData?.rows || []).map(row => ({
    date: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  })).sort((a, b) => a.date.localeCompare(b.date));

  // 热门查询词
  const queries = (queryData?.rows || []).map((row, i) => ({
    rank: i + 1,
    query: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));

  // 热门页面
  const pages = (pageData?.rows || []).map((row, i) => ({
    rank: i + 1,
    page: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));

  // 国家分布
  const countries = (countryData?.rows || []).map((row, i) => ({
    rank: i + 1,
    country: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
  }));

  // 设备分布
  const devices = (deviceData?.rows || []).map(row => ({
    device: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));

  // Sitemap 状态
  const sitemaps = (sitemapData?.sitemap || []).map(sm => ({
    path: sm.path || '',
    lastSubmitted: sm.lastSubmitted ? sm.lastSubmitted.split('T')[0] : '-',
    discovered: sm.contents?.[0]?.submitted || '-',
    indexed: sm.contents?.[0]?.indexed || '-',
  }));

  return { summary, daily, queries, pages, countries, devices, sitemaps };
}

// ============ 问题分析层 ============

function analyzeProblems(data) {
  const problems = [];

  // 排名 > 20 的页面
  const lowRankPages = data.pages.filter(p => p.position > 20);
  if (lowRankPages.length > 0) {
    problems.push(
      `⚠️ ${lowRankPages.length} 个页面平均排名 > 20，排名需要提升：` +
      lowRankPages.slice(0, 3).map(p => `\n  - ${extractPath(p.page)}（排名 ${formatPosition(p.position)}）`).join('')
    );
  }

  // CTR < 2% 且展示 > 100 的查询词
  const lowCtrQueries = data.queries.filter(q => q.ctr < 0.02 && q.impressions > 100);
  if (lowCtrQueries.length > 0) {
    problems.push(
      `⚠️ ${lowCtrQueries.length} 个查询词 CTR < 2%（展示量 > 100），标题/描述需优化：` +
      lowCtrQueries.slice(0, 3).map(q => `\n  - "${q.query}"（CTR ${formatPercent(q.ctr)}，展示 ${q.impressions}）`).join('')
    );
  }

  // 展示量高但点击少的页面（展示>50, CTR<1%）
  const highImprLowClick = data.pages.filter(p => p.impressions > 50 && p.ctr < 0.01);
  if (highImprLowClick.length > 0) {
    problems.push(
      `⚠️ ${highImprLowClick.length} 个页面展示量高但点击少（CTR < 1%），需优化 meta description：` +
      highImprLowClick.slice(0, 3).map(p => `\n  - ${extractPath(p.page)}（展示 ${p.impressions}，CTR ${formatPercent(p.ctr)}）`).join('')
    );
  }

  // 排名在 TOP 3 的关键词
  const top3Queries = data.queries.filter(q => q.position <= 3);
  if (top3Queries.length > 0) {
    problems.push(
      `✅ ${top3Queries.length} 个关键词排名在 TOP 3，成绩良好：` +
      top3Queries.slice(0, 5).map(q => `\n  - "${q.query}"（排名 ${formatPosition(q.position)}）`).join('')
    );
  }

  // 如果整体无数据
  if (data.summary.impressions === 0) {
    problems.push('🚨 暂无搜索展示数据，站点可能尚未被索引或数据延迟中');
  }

  if (problems.length === 0) {
    problems.push('✅ 未发现明显问题，各项搜索指标正常');
  }

  return problems;
}

function extractPath(fullUrl) {
  try {
    const url = new URL(fullUrl);
    return url.pathname || '/';
  } catch {
    return fullUrl;
  }
}

// ============ 建议生成层 ============

function generateSuggestions(data) {
  const suggestions = [];
  let idx = 1;

  // 基于 CTR 问题
  const lowCtrQueries = data.queries.filter(q => q.ctr < 0.02 && q.impressions > 100);
  if (lowCtrQueries.length > 0) {
    suggestions.push(
      `${idx++}. **优化标题和描述**：针对 "${lowCtrQueries[0].query}" 等低 CTR 查询词，改进对应页面的 title 和 meta description，使其更有吸引力`
    );
  }

  // 基于排名问题
  const midRankPages = data.pages.filter(p => p.position > 10 && p.position <= 30);
  if (midRankPages.length > 0) {
    suggestions.push(
      `${idx++}. **提升中等排名页面**：${midRankPages.length} 个页面排名在 10-30 之间，通过优化内容质量和内链结构可以提升至首页`
    );
  }

  // 基于设备分布
  const mobileDevice = data.devices.find(d => d.device === 'MOBILE');
  const desktopDevice = data.devices.find(d => d.device === 'DESKTOP');
  if (mobileDevice && desktopDevice) {
    if (mobileDevice.position > desktopDevice.position + 3) {
      suggestions.push(
        `${idx++}. **优化移动端体验**：移动端平均排名（${formatPosition(mobileDevice.position)}）明显低于桌面端（${formatPosition(desktopDevice.position)}），需改善移动端页面速度和体验`
      );
    }
  }

  // 基于国际化
  if (data.countries.length > 0) {
    const topCountry = data.countries[0];
    const topCountryShare = data.summary.clicks > 0
      ? (topCountry.clicks / data.summary.clicks * 100) : 0;
    if (topCountryShare > 80) {
      suggestions.push(
        `${idx++}. **拓展国际流量**：${getCountryName(topCountry.country)} 占总点击 ${topCountryShare.toFixed(0)}%，建议针对其他目标市场增加多语言内容`
      );
    }
  }

  // 通用建议
  if (data.summary.impressions > 0 && data.summary.ctr < 0.03) {
    suggestions.push(
      `${idx++}. **全站 CTR 优化**：整体 CTR 为 ${formatPercent(data.summary.ctr)}，建议为高展示页面添加结构化数据（Rich Snippets）以提升点击率`
    );
  }

  if (data.summary.clicks < 50) {
    suggestions.push(
      `${idx++}. **增加内容覆盖**：当前搜索点击量较低，建议持续产出高质量内容、覆盖更多长尾关键词，并在社区推广以获取外链`
    );
  }

  if (suggestions.length === 0) {
    suggestions.push('- 各项搜索指标表现良好，建议持续监控并关注排名波动');
  }

  return suggestions;
}

// ============ 报告生成层 ============

function generateReport(data, startDate, endDate) {
  const now = new Date();
  const genTime = `${formatDate(now)} ${now.toTimeString().slice(0, 5)}`;

  const problems = analyzeProblems(data);
  const suggestions = generateSuggestions(data);

  let md = `# WorldCupDex Google 搜索表现报告
> 生成时间：${genTime}
> 数据范围：${startDate} ~ ${endDate}

## 一、搜索表现概览
| 指标 | 数值 |
|------|------|
| 总点击数 | ${formatNumber(data.summary.clicks)} |
| 总展示次数 | ${formatNumber(data.summary.impressions)} |
| 平均点击率 | ${formatPercent(data.summary.ctr)} |
| 平均排名 | ${formatPosition(data.summary.position)} |

## 二、每日搜索趋势
| 日期 | 点击 | 展示 | CTR | 平均排名 |
|------|------|------|-----|----------|
`;

  if (data.daily.length === 0) {
    md += '| - | 暂无足够数据 | - | - | - |\n';
  } else {
    for (const day of data.daily) {
      md += `| ${day.date} | ${formatNumber(day.clicks)} | ${formatNumber(day.impressions)} | ${formatPercent(day.ctr)} | ${formatPosition(day.position)} |\n`;
    }
  }

  md += `
## 三、热门搜索词 TOP 20
| 排名 | 查询词 | 点击 | 展示 | CTR | 平均排名 |
|------|--------|------|------|-----|----------|
`;

  if (data.queries.length === 0) {
    md += '| - | 暂无足够数据 | - | - | - | - |\n';
  } else {
    for (const q of data.queries) {
      md += `| ${q.rank} | ${q.query} | ${formatNumber(q.clicks)} | ${formatNumber(q.impressions)} | ${formatPercent(q.ctr)} | ${formatPosition(q.position)} |\n`;
    }
  }

  md += `
## 四、热门页面 TOP 20
| 排名 | 页面路径 | 点击 | 展示 | CTR | 平均排名 |
|------|----------|------|------|-----|----------|
`;

  if (data.pages.length === 0) {
    md += '| - | 暂无足够数据 | - | - | - | - |\n';
  } else {
    for (const p of data.pages) {
      md += `| ${p.rank} | ${extractPath(p.page)} | ${formatNumber(p.clicks)} | ${formatNumber(p.impressions)} | ${formatPercent(p.ctr)} | ${formatPosition(p.position)} |\n`;
    }
  }

  md += `
## 五、访客来源国家 TOP 10
| 排名 | 国家 | 点击 | 展示 | CTR |
|------|------|------|------|-----|
`;

  if (data.countries.length === 0) {
    md += '| - | 暂无足够数据 | - | - | - |\n';
  } else {
    for (const c of data.countries) {
      md += `| ${c.rank} | ${getCountryName(c.country)} | ${formatNumber(c.clicks)} | ${formatNumber(c.impressions)} | ${formatPercent(c.ctr)} |\n`;
    }
  }

  md += `
## 六、设备分布
| 设备类型 | 点击 | 展示 | CTR | 平均排名 |
|----------|------|------|-----|----------|
`;

  if (data.devices.length === 0) {
    md += '| - | 暂无足够数据 | - | - | - |\n';
  } else {
    for (const d of data.devices) {
      md += `| ${getDeviceName(d.device)} | ${formatNumber(d.clicks)} | ${formatNumber(d.impressions)} | ${formatPercent(d.ctr)} | ${formatPosition(d.position)} |\n`;
    }
  }

  md += `
## 七、Sitemap 状态
| Sitemap | 提交日期 | 已发现URL | 已索引URL |
|---------|----------|-----------|-----------|
`;

  if (data.sitemaps.length === 0) {
    md += '| - | 暂无 Sitemap 数据 | - | - |\n';
  } else {
    for (const sm of data.sitemaps) {
      md += `| ${sm.path} | ${sm.lastSubmitted} | ${sm.discovered} | ${sm.indexed} |\n`;
    }
  }

  md += `
## 八、存在的问题

`;
  for (const p of problems) {
    md += `- ${p}\n`;
  }

  md += `
## 九、优化建议

`;
  for (const s of suggestions) {
    md += `${s}\n`;
  }

  return md;
}

// ============ 主流程 ============

async function main() {
  console.log('📊 开始生成 Google Search Console 分析报告...\n');

  const { start, end } = getDateRange();
  console.log(`   站点: ${GSC_SITE_URL}`);
  console.log(`   数据范围: ${start} ~ ${end}（最近7天，含3天延迟偏移）\n`);

  // 初始化 API 客户端
  let searchconsole;
  try {
    const auth = createAuthClient();
    searchconsole = google.searchconsole({ version: 'v1', auth });
  } catch (err) {
    console.error(`❌ 初始化 GSC API 客户端失败: ${err.message}`);
    process.exit(1);
  }

  // 获取数据
  let rawData;
  try {
    rawData = await fetchAllData(searchconsole, start, end);
  } catch (err) {
    console.error(`\n❌ 数据获取失败: ${err.message}`);
    process.exit(1);
  }

  // 聚合数据
  console.log('\n   ▶ 聚合数据并分析...');
  const aggregated = aggregateData(rawData);

  // 生成报告
  console.log('   ▶ 生成 Markdown 报告...');
  const report = generateReport(aggregated, start, end);

  // 输出文件
  const reportsDir = resolve(__dirname, '..', 'reports');
  mkdirSync(reportsDir, { recursive: true });

  const fileName = `${formatDate(new Date())}-gsc-report.md`;
  const filePath = resolve(reportsDir, fileName);
  writeFileSync(filePath, report, 'utf-8');

  console.log(`\n✅ GSC 报告已生成: ${filePath}`);
}

main();
