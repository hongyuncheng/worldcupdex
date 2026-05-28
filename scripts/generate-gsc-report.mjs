import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '.env') });

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy || 'http://127.0.0.1:10809';
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

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

// ============ API 调用层 ============

async function fetchGscReport(token, siteUrl, requestBody) {
  const encodedSiteUrl = encodeURIComponent(siteUrl);
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
    agent
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GSC API 报错 (${response.status}): ${errText}`);
  }
  
  return await response.json();
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function withRetry(fn, label) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('403')) {
        throw new Error(`${label} 认证失败：请检查 GSC_REFRESH_TOKEN 是否有效。`);
      }
      if (err.message.includes('429') || attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`   ⚠️ ${label} 第${attempt}次请求失败，${delay/1000}s 后重试... (${err.message})`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
}

// ============ 主流程 ============

async function main() {
  console.log('📊 开始获取 Google Search Console 数据...');
  const { start, end } = getDateRange();
  console.log(`   数据范围: ${start} ~ ${end} (GSC数据通常有 2-3 天延迟)`);
  console.log(`   站点 URL: ${GSC_SITE_URL}`);

  try {
    // 0. 获取 Access Token
    console.log('   ▶ 正在刷新 Access Token...');
    const tokenParams = new URLSearchParams({
      client_id: GSC_CLIENT_ID,
      client_secret: GSC_CLIENT_SECRET,
      refresh_token: GSC_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    });

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
      agent
    });

    if (!tokenResponse.ok) throw new Error(`Token 刷新失败`);
    const { access_token: token } = await tokenResponse.json();

    // 1. 获取全局趋势 (按天)
    console.log('   ▶ 获取每日搜索趋势...');
    const dailyRes = await withRetry(() => fetchGscReport(token, GSC_SITE_URL, {
      startDate: start,
      endDate: end,
      dimensions: ['date'],
      rowLimit: 100
    }), '每日趋势');

    // 2. 获取热门查询词 (Top Queries)
    console.log('   ▶ 获取热门搜索词...');
    const queryRes = await withRetry(() => fetchGscReport(token, GSC_SITE_URL, {
      startDate: start,
      endDate: end,
      dimensions: ['query'],
      rowLimit: 50
    }), '热门搜索词');

    // 3. 获取热门落地页 (Top Pages)
    console.log('   ▶ 获取热门落地页...');
    const pageRes = await withRetry(() => fetchGscReport(token, GSC_SITE_URL, {
      startDate: start,
      endDate: end,
      dimensions: ['page'],
      rowLimit: 30
    }), '热门落地页');

    // 4. 获取国家/地区分布 (Countries)
    console.log('   ▶ 获取国家/地区分布...');
    const countryRes = await withRetry(() => fetchGscReport(token, GSC_SITE_URL, {
      startDate: start,
      endDate: end,
      dimensions: ['country'],
      rowLimit: 20
    }), '国家分布');

    // 5. 获取设备分布 (Devices)
    console.log('   ▶ 获取设备分布...');
    const deviceRes = await withRetry(() => fetchGscReport(token, GSC_SITE_URL, {
      startDate: start,
      endDate: end,
      dimensions: ['device'],
      rowLimit: 10
    }), '设备分布');

    console.log('   ▶ 聚合数据并生成洞察报告...');

    const dailyRows = dailyRes.rows || [];
    const queryRows = queryRes.rows || [];
    const pageRows = pageRes.rows || [];
    const countryRows = countryRes.rows || [];
    const deviceRows = deviceRes.rows || [];

    // 计算全局数据
    let totalClicks = 0, totalImpressions = 0;
    dailyRows.forEach(row => {
      totalClicks += row.clicks;
      totalImpressions += row.impressions;
    });
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) : 0;
    // 近似计算平均排名 (以展示量加权)
    let posSum = 0;
    dailyRows.forEach(row => posSum += (row.position * row.impressions));
    const avgPosition = totalImpressions > 0 ? (posSum / totalImpressions) : 0;

    let md = `# Google 搜索表现与 SEO 运营分析报告 (GSC)\n`;
    md += `> **生成时间**：${new Date().toLocaleString('zh-CN', { hour12: false })}\n`;
    md += `> **数据范围**：${start} ~ ${end}（最近 7 天，注：GSC 数据存在 2-3 天延迟）\n`;
    md += `> **分析站点**：\`${GSC_SITE_URL}\`\n\n`;

    md += `## 💡 核心 SEO 结论与建议 (TL;DR)\n`;
    md += `- **搜索大盘**：最近 7 天共获得 **${formatNumber(totalImpressions)}** 次谷歌搜索曝光，产生了 **${formatNumber(totalClicks)}** 次点击。\n`;
    
    // 自动寻找 "低垂的果实" (SEO Opportunities)
    const opportunities = queryRows.filter(row => row.position > 10 && row.position <= 30 && row.impressions > 10).slice(0, 5);
    
    if (opportunities.length > 0) {
      md += `- **🚀 快速增长机会 (低垂的果实)**：发现以下关键词目前排名在第 2-3 页，但已经有自然曝光。**强烈建议**在文章中增加这些词的密度，或为它们建立专属落地页/获取外链，一旦挤进前 10 名，流量将成倍爆发：\n`;
      opportunities.forEach(opp => {
        md += `  - \`${opp.keys[0]}\` (当前排名：${formatPosition(opp.position)}，展示量：${formatNumber(opp.impressions)})\n`;
      });
    } else {
      md += `- **🚀 增长机会**：目前关键词基数较少，建议持续产出高质量内容以覆盖更多长尾词。\n`;
    }

    // 寻找标题优化机会
    const lowCtrHighImpr = queryRows.filter(row => row.position <= 10 && row.ctr < 0.02 && row.impressions > 50).slice(0, 3);
    if (lowCtrHighImpr.length > 0) {
      md += `- **⚠️ 标题优化警告**：以下关键词已经排在首页，但点击率 (CTR) 低于 2%，说明用户看到了你的网站但没点进来。建议立刻修改对应页面的 Title 和 Description，增加吸引力（如加上年份、免费等字眼）：\n`;
      lowCtrHighImpr.forEach(opp => {
        md += `  - \`${opp.keys[0]}\` (CTR：${formatPercent(opp.ctr)}，展示量：${formatNumber(opp.impressions)})\n`;
      });
    }

    md += `\n`;

    md += `## 一、全局搜索表现\n`;
    md += `| 核心指标 | 数值 | 运营意义 |\n`;
    md += `|---|---|---|\n`;
    md += `| **总点击次数 (Clicks)** | ${formatNumber(totalClicks)} | 真正从谷歌进入你网站的真实访客数 |\n`;
    md += `| **总展示次数 (Impressions)** | ${formatNumber(totalImpressions)} | 你的网站在谷歌搜索结果中被看到的次数 |\n`;
    md += `| **平均点击率 (CTR)** | ${formatPercent(avgCtr)} | 标题和描述够不够吸引人。低于 2% 需优化 Meta Title/Description |\n`;
    md += `| **平均排名 (Position)** | ${formatPosition(avgPosition)} | 全站关键词在谷歌的平均位置 |\n\n`;

    md += `## 二、搜索词排行 (Top Queries)\n`;
    md += `*指导内容创作：用户在谷歌搜什么词看到了你？点击率低的词，说明你的标题没有吸引力。*\n\n`;
    md += `| 搜索词 (Query) | 排名 (Pos) | 点击量 | 展示量 | 点击率 (CTR) |\n`;
    md += `|---|---|---|---|---|\n`;
    queryRows.slice(0, 15).forEach(row => {
      md += `| ${row.keys[0]} | ${formatPosition(row.position)} | ${formatNumber(row.clicks)} | ${formatNumber(row.impressions)} | ${formatPercent(row.ctr)} |\n`;
    });
    md += `\n`;

    md += `## 三、最吸流页面 (Top Landing Pages)\n`;
    md += `*指导商业变现：这些是谷歌最偏爱的页面。一定要在这些页面里放上最核心的亚马逊联盟链接或打赏按钮。*\n\n`;
    md += `| 落地页路径 | 排名 (Pos) | 点击量 | 展示量 | 点击率 (CTR) |\n`;
    md += `|---|---|---|---|---|\n`;
    pageRows.slice(0, 10).forEach(row => {
      let pagePath = row.keys[0].replace('https://worldcupdex.org', '').replace('http://worldcupdex.org', '');
      if (pagePath === '') pagePath = '/';
      md += `| ${pagePath} | ${formatPosition(row.position)} | ${formatNumber(row.clicks)} | ${formatNumber(row.impressions)} | ${formatPercent(row.ctr)} |\n`;
    });
    md += `\n`;

    md += `## 四、搜索用户国家分布 (Countries)\n`;
    md += `*指导联盟选品：与 GA4 互为验证。GSC 显示的是纯粹的谷歌搜索自然流量来源。*\n\n`;
    md += `| 国家/地区 | 点击量 | 展示量 | 排名 (Pos) |\n`;
    md += `|---|---|---|---|\n`;
    countryRows.slice(0, 10).forEach(row => {
      md += `| ${getCountryName(row.keys[0])} | ${formatNumber(row.clicks)} | ${formatNumber(row.impressions)} | ${formatPosition(row.position)} |\n`;
    });
    md += `\n`;

    md += `## 五、搜索设备分布 (Devices)\n`;
    md += `*指导页面排版：如果 Mobile 搜索曝光大，但点击率极低，说明你的网页在移动端搜索结果里长得很丑（可能缺了 Favicon 或者移动端 Title 被截断了）。*\n\n`;
    md += `| 设备类型 | 点击量 | 展示量 | 点击率 (CTR) | 排名 (Pos) |\n`;
    md += `|---|---|---|---|---|\n`;
    deviceRows.forEach(row => {
      md += `| ${getDeviceName(row.keys[0])} | ${formatNumber(row.clicks)} | ${formatNumber(row.impressions)} | ${formatPercent(row.ctr)} | ${formatPosition(row.position)} |\n`;
    });

    const reportDir = resolve(__dirname, '../reports');
    try { mkdirSync(reportDir, { recursive: true }); } catch(e) {}
    
    const filePath = resolve(reportDir, `${end}-gsc-dashboard.md`);
    writeFileSync(filePath, md, 'utf-8');

    console.log(`✅ 深度 SEO 运营报告已生成: ${filePath}`);

  } catch (err) {
    console.error('❌ 生成报告失败:', err.message);
  }
}

main();
