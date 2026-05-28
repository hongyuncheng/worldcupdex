import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy || 'http://127.0.0.1:10809';
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

const {
  GSC_CLIENT_ID,
  GSC_CLIENT_SECRET,
  GSC_REFRESH_TOKEN,
  GA4_PROPERTY_ID = '538207577'
} = process.env;

// 通用的 GA4 数据请求封装函数
async function fetchGa4Report(token, propertyId, requestBody) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
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
    throw new Error(`GA4 API 报错 (${response.status}): ${errText}`);
  }
  return await response.json();
}

// 辅助函数：将 API 响应转换为 Markdown 表格
function buildMarkdownTable(data, columns) {
  let table = `| ${columns.join(' | ')} |\n`;
  table += `| ${columns.map(() => ':---').join(' | ')} |\n`;

  if (data.rows && data.rows.length > 0) {
    data.rows.forEach(row => {
      const rowData = [];
      if (row.dimensionValues) row.dimensionValues.forEach(d => rowData.push(d.value));
      if (row.metricValues) row.metricValues.forEach(m => rowData.push(m.value));
      table += `| ${rowData.join(' | ')} |\n`;
    });
  } else {
    table += `| ${columns.map(() => '-').join(' | ')} |\n`;
  }
  return table + '\n';
}

async function main() {
  if (!GSC_CLIENT_ID || !GSC_CLIENT_SECRET || !GSC_REFRESH_TOKEN) {
    console.error('❌ 缺少必要的 OAuth2 环境变量');
    process.exit(1);
  }

  const propertyId = GA4_PROPERTY_ID;
  console.log(`正在获取 GA4 (Property ID: ${propertyId}) 的多维度运营数据...`);

  try {
    // 1. 获取 Token
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

    let reportMarkdown = `# 网站持续运营数据看板 (GA4)\n\n`;
    reportMarkdown += `> **生成时间**: ${new Date().toLocaleString()}\n`;
    reportMarkdown += `> **数据范围**: 过去 7 天\n\n`;

    // 维度 1: 流量获取 (他们从哪里来？)
    console.log('拉取 流量获取 数据...');
    const trafficData = await fetchGa4Report(token, propertyId, {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionSourceMedium' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10
    });
    reportMarkdown += `## 1. 流量来源池 (Traffic Acquisition)\n`;
    reportMarkdown += `*💡 **运营建议**: 监控哪些渠道带来的用户最多。如果是 direct，说明品牌效应在建立；如果是 referral，看是哪个社交平台发力了。*\n\n`;
    reportMarkdown += buildMarkdownTable(trafficData, ['来源/媒介', '活跃用户数', '会话数']);
    reportMarkdown += `**📋 数据名词解释与洞察：**\n`;
    reportMarkdown += `- **(direct) / (none)**：直接流量。代表用户直接在浏览器输入网址或通过书签访问了你的网站。\n`;
    reportMarkdown += `- **referral (引荐流量)**：从其他外部网站点击链接跳过来的流量。例如 \`kickiq / referral\` 意味着从兄弟网站 kickiq 导流过来的用户。如果“活跃用户数”为 4，“会话数”为 17，说明有 **4个真实的独立用户** 点了链接过来，并且他们总共发起了 **17次访问**（这代表从 kickiq 过来的用户粘性极高，不仅来了，还会反复打开网站）。\n`;
    reportMarkdown += `- **带下划线的参数 (如 match_card_ai_btn)**：这是自定义的 UTM 追踪标记，代表通过带有特定标记的分享链接或按钮拉回来的流量。\n\n`;

    // 维度 2: 国家/地区分布 (用户是谁？)
    console.log('拉取 国家/地区 数据...');
    const geoData = await fetchGa4Report(token, propertyId, {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10
    });
    reportMarkdown += `## 2. 受众地域分布 (User Geography)\n`;
    reportMarkdown += `*💡 **运营建议**: 指导亚马逊联盟的选品和地域。如果美国用户多，就主推 Amazon.com；如果拉美用户多，就要考虑不同国家的购物习惯和多语言支持。*\n\n`;
    reportMarkdown += buildMarkdownTable(geoData, ['国家/地区', '活跃用户数']);

    // 维度 3: 页面受欢迎程度 (他们喜欢看什么？)
    console.log('拉取 页面浏览 数据...');
    const pagesData = await fetchGa4Report(token, propertyId, {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10
    });
    reportMarkdown += `## 3. 热门内容排行 (Top Pages)\n`;
    reportMarkdown += `*💡 **运营建议**: 看用户最喜欢停留在哪个页面（比如是球队详情、毒奶预测还是球迷卡）。把 **商业推广位** 和 **Ko-fi 打赏按钮** 集中放在流量最大的页面上。*\n\n`;
    reportMarkdown += buildMarkdownTable(pagesData, ['页面路径', '浏览量 (PV)', '活跃用户数']);

    // 维度 4: 核心互动事件 (他们做了什么动作？)
    console.log('拉取 核心事件 数据...');
    const eventsData = await fetchGa4Report(token, propertyId, {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 15
    });
    reportMarkdown += `## 4. 用户行为与转化 (Core Events)\n`;
    reportMarkdown += `*💡 **运营建议**: 关注用户是否高频点击了特定按钮。这里会展示自带事件(如 page_view, scroll)和我们埋点的高价值事件(如生成卡片、点击外链、分享)。*\n\n`;
    reportMarkdown += buildMarkdownTable(eventsData, ['事件名称', '触发次数']);

    // 维度 5: 设备分布 (用什么看？)
    console.log('拉取 设备分布 数据...');
    const deviceData = await fetchGa4Report(token, propertyId, {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
    });
    reportMarkdown += `## 5. 访问设备 (Device Category)\n`;
    reportMarkdown += `*💡 **运营建议**: 如果 Mobile 占比超过 80%，在开发新功能（如球迷卡生成）时，必须优先保证手机端的操作体验和截图兼容性。*\n\n`;
    reportMarkdown += buildMarkdownTable(deviceData, ['设备类型', '活跃用户数']);

    // Save report
    const reportsDir = path.resolve(rootDir, 'reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

    const dateStr = new Date().toISOString().split('T')[0];
    const reportPath = path.resolve(reportsDir, `ga4-dashboard-${dateStr}.md`);
    fs.writeFileSync(reportPath, reportMarkdown, 'utf-8');

    console.log(`✅ 详细运营看板生成成功！`);
    console.log(`📄 报告已保存至: ${reportPath}`);

  } catch (error) {
    console.error('❌ 获取 GA4 数据失败:', error);
  }
}

main();