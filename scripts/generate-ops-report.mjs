import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { ProxyAgent, setGlobalDispatcher } from "undici";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

dotenv.config({ path: path.resolve(rootDir, ".env") });
dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });

const proxyUrl = process.env.OPS_HTTPS_PROXY
  || process.env.HTTPS_PROXY
  || process.env.HTTP_PROXY
  || process.env.https_proxy
  || process.env.http_proxy;

if (proxyUrl) {
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
}

const PROJECT = {
  name: "WorldCupDex",
  code: "wcd",
  siteUrl: "https://worldcupdex.org",
  host: "worldcupdex.org",
  repo: "https://github.com/hongyuncheng/worldcupdex",
};

const HEALTH_PATHS = [
  "/",
  "/teams",
  "/schedule",
  "/predict",
  "/quiz",
  "/fan-card",
  "/data",
  "/blog",
  "/privacy",
  "/sitemap.xml",
];

const REPORTS_DIR = path.resolve(rootDir, "reports", "ops");
const OUTPUT_DATE = formatDate(new Date());

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatNumber(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num.toLocaleString("en-US") : "0";
}

function formatPercent(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? `${num.toFixed(2)}%` : "0.00%";
}

function sumMetric(rows, field) {
  return rows.reduce((sum, row) => sum + Number(row[field] || 0), 0);
}

function gscDateRange() {
  const end = new Date();
  end.setDate(end.getDate() - 3);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return { start: formatDate(start), end: formatDate(end) };
}

function sevenDayRangeThroughYesterday() {
  const end = new Date();
  end.setDate(end.getDate() - 1);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return { start: formatDate(start), end: formatDate(end) };
}

function dateList(startDate, endDate) {
  const dates = [];
  const current = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  while (current <= end) {
    dates.push(formatDate(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

function abortSignal(timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, cancel: () => clearTimeout(timeout) };
}

async function checkedFetch(url, options = {}, timeoutMs = 15000) {
  const { signal, cancel } = abortSignal(timeoutMs);
  try {
    return await fetch(url, { ...options, signal });
  } finally {
    cancel();
  }
}

async function getGoogleAccessToken() {
  try {
    const { GSC_CLIENT_ID, GSC_CLIENT_SECRET, GSC_REFRESH_TOKEN } = process.env;
    if (!GSC_CLIENT_ID || !GSC_CLIENT_SECRET || !GSC_REFRESH_TOKEN) {
      return { ok: false, reason: "缺少 GSC_CLIENT_ID / GSC_CLIENT_SECRET / GSC_REFRESH_TOKEN" };
    }

    const params = new URLSearchParams({
      client_id: GSC_CLIENT_ID,
      client_secret: GSC_CLIENT_SECRET,
      refresh_token: GSC_REFRESH_TOKEN,
      grant_type: "refresh_token",
    });

    const response = await checkedFetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      return { ok: false, reason: `Google OAuth 失败：HTTP ${response.status}` };
    }

    const json = await response.json();
    return { ok: true, token: json.access_token };
  } catch (error) {
    return { ok: false, reason: `Google OAuth 请求失败：${error.message}` };
  }
}

async function runHealthChecks() {
  const checks = [];
  for (const urlPath of HEALTH_PATHS) {
    const url = `${PROJECT.siteUrl}${urlPath}`;
    const started = Date.now();
    try {
      const response = await checkedFetch(url, {
        method: "GET",
        headers: { "User-Agent": "WorldCupDex-OpsBot/1.0" },
        redirect: "follow",
      }, 12000);
      checks.push({
        path: urlPath,
        status: response.status,
        ok: response.ok,
        ms: Date.now() - started,
      });
    } catch (error) {
      checks.push({
        path: urlPath,
        status: "ERROR",
        ok: false,
        ms: Date.now() - started,
        error: error.name === "AbortError" ? "timeout" : error.message,
      });
    }
  }
  return checks;
}

async function fetchGsc(token) {
  const siteUrl = process.env.GSC_SITE_URL || `sc-domain:${PROJECT.host}`;
  if (!siteUrl.includes(PROJECT.host)) {
    return { ok: false, reason: `GSC_SITE_URL 不属于当前项目：${siteUrl}` };
  }

  const { start, end } = gscDateRange();
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

  async function query(body) {
    const response = await checkedFetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`GSC API HTTP ${response.status}`);
    }
    return response.json();
  }

  try {
    const [daily, queries, pages] = await Promise.all([
      query({ startDate: start, endDate: end, dimensions: ["date"], rowLimit: 100 }),
      query({ startDate: start, endDate: end, dimensions: ["query"], rowLimit: 25 }),
      query({ startDate: start, endDate: end, dimensions: ["page"], rowLimit: 25 }),
    ]);

    const dailyRows = daily.rows || [];
    const queryRows = queries.rows || [];
    const pageRows = pages.rows || [];
    const clicks = sumMetric(dailyRows, "clicks");
    const impressions = sumMetric(dailyRows, "impressions");
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const avgPosition = dailyRows.length
      ? dailyRows.reduce((sum, row) => sum + Number(row.position || 0), 0) / dailyRows.length
      : 0;

    return {
      ok: true,
      siteUrl,
      start,
      end,
      clicks,
      impressions,
      ctr,
      avgPosition,
      queries: queryRows.map((row) => ({
        query: row.keys?.[0] || "-",
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: Number(row.ctr || 0) * 100,
        position: row.position || 0,
      })),
      pages: pageRows.map((row) => ({
        page: row.keys?.[0] || "-",
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        position: row.position || 0,
      })),
    };
  } catch (error) {
    return { ok: false, reason: error.message };
  }
}

async function fetchGa4(token) {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const hostname = process.env.GA4_HOSTNAME || PROJECT.host;
  if (!propertyId) {
    return { ok: false, reason: "缺少 GA4_PROPERTY_ID" };
  }
  if (hostname !== PROJECT.host) {
    return { ok: false, reason: `GA4_HOSTNAME 不属于当前项目：${hostname}` };
  }

  const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

  async function query(body) {
    const response = await checkedFetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        dimensionFilter: {
          filter: {
            fieldName: "hostName",
            stringFilter: { matchType: "EXACT", value: hostname },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`GA4 API HTTP ${response.status}`);
    }
    return response.json();
  }

  try {
    const [traffic, pages, events, devices] = await Promise.all([
      query({
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "hostName" }, { name: "sessionSourceMedium" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      }),
      query({
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "hostName" }, { name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
      query({
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "hostName" }, { name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 15,
      }),
      query({
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "hostName" }, { name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 5,
      }),
    ]);

    const pageViews = (pages.rows || []).reduce((sum, row) => sum + Number(row.metricValues?.[0]?.value || 0), 0);
    const activeUsers = (traffic.rows || []).reduce((sum, row) => sum + Number(row.metricValues?.[0]?.value || 0), 0);
    const sessions = (traffic.rows || []).reduce((sum, row) => sum + Number(row.metricValues?.[1]?.value || 0), 0);

    return {
      ok: true,
      hostname,
      pageViews,
      activeUsers,
      sessions,
      traffic: mapGaRows(traffic, ["sourceMedium", "activeUsers", "sessions"], 1),
      pages: mapGaRows(pages, ["pagePath", "views", "activeUsers"], 1),
      events: mapGaRows(events, ["eventName", "count"], 1),
      devices: mapGaRows(devices, ["device", "activeUsers"], 1),
    };
  } catch (error) {
    return { ok: false, reason: error.message };
  }
}

function mapGaRows(response, columns, dimensionOffset = 0) {
  return (response.rows || []).map((row) => {
    const item = {};
    const dimensions = row.dimensionValues || [];
    const metrics = row.metricValues || [];
    const dimensionColumnCount = columns.length - metrics.length;
    for (let i = 0; i < dimensionColumnCount; i += 1) {
      item[columns[i]] = dimensions[i + dimensionOffset]?.value || "-";
    }
    metrics.forEach((metric, index) => {
      item[columns[dimensionColumnCount + index]] = metric.value;
    });
    return item;
  });
}

async function fetchCloudflare() {
  const { CF_ANALYTICS_API_TOKEN, CF_ZONE_ID } = process.env;
  if (!CF_ANALYTICS_API_TOKEN || !CF_ZONE_ID) {
    return { ok: false, reason: "缺少 CF_ANALYTICS_API_TOKEN / CF_ZONE_ID" };
  }

  try {
    const zoneResponse = await checkedFetch(`https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}`, {
      headers: { Authorization: `Bearer ${CF_ANALYTICS_API_TOKEN}` },
    });
    if (!zoneResponse.ok) {
      return { ok: false, reason: `Cloudflare Zone 校验失败：HTTP ${zoneResponse.status}` };
    }
    const zoneJson = await zoneResponse.json();
    const zoneName = zoneJson?.result?.name;
    if (zoneName !== PROJECT.host) {
      return { ok: false, reason: `CF_ZONE_ID 属于 ${zoneName || "未知域名"}，不是 ${PROJECT.host}` };
    }

    const { start, end } = sevenDayRangeThroughYesterday();
    const query = `{
  viewer {
    zones(filter: { zoneTag: "${CF_ZONE_ID}" }) {
      httpRequests1dGroups(filter: { date_geq: "${start}", date_leq: "${end}" }, orderBy: [date_ASC], limit: 10000) {
        dimensions { date }
        sum {
          pageViews
          requests
          bytes
          cachedBytes
          responseStatusMap { edgeResponseStatus requests }
        }
        uniq { uniques }
      }
    }
  }
}`;

    const response = await checkedFetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_ANALYTICS_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) {
      return { ok: false, reason: `Cloudflare GraphQL HTTP ${response.status}` };
    }
    const json = await response.json();
    if (json.errors?.length) {
      return { ok: false, reason: `Cloudflare GraphQL 返回错误：${json.errors[0].message}` };
    }

    const zone = json.data?.viewer?.zones?.[0] || {};
    const groups = zone.httpRequests1dGroups || [];
    const statusMap = new Map();
    let pageViews = 0;
    let requests = 0;
    let uniques = 0;
    let bytes = 0;
    let cachedBytes = 0;

    for (const group of groups) {
      pageViews += Number(group.sum?.pageViews || 0);
      requests += Number(group.sum?.requests || 0);
      uniques += Number(group.uniq?.uniques || 0);
      bytes += Number(group.sum?.bytes || 0);
      cachedBytes += Number(group.sum?.cachedBytes || 0);
      for (const status of group.sum?.responseStatusMap || []) {
        const code = String(status.edgeResponseStatus);
        statusMap.set(code, (statusMap.get(code) || 0) + Number(status.requests || 0));
      }
    }

    const status = [...statusMap.entries()]
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);

    const abnormalPaths = await fetchCloudflareErrorPaths(CF_ANALYTICS_API_TOKEN, CF_ZONE_ID, start, end);

    return {
      ok: true,
      zoneName,
      start,
      end,
      pageViews,
      requests,
      uniques,
      cacheRatio: bytes > 0 ? (cachedBytes / bytes) * 100 : 0,
      status,
      abnormalPaths,
    };
  } catch (error) {
    return { ok: false, reason: error.message };
  }
}

async function fetchCloudflareErrorPaths(token, zoneId, startDate, endDate) {
  const aggregate = new Map();

  for (const date of dateList(startDate, endDate)) {
    const query = `{
  viewer {
    zones(filter: { zoneTag: "${zoneId}" }) {
      httpRequestsAdaptiveGroups(
        filter: { date: "${date}", edgeResponseStatus_geq: 400 }
        orderBy: [count_DESC]
        limit: 50
      ) {
        count
        dimensions { clientRequestPath edgeResponseStatus }
      }
    }
  }
}`;

    try {
      const response = await checkedFetch("https://api.cloudflare.com/client/v4/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) continue;
      const json = await response.json();
      if (json.errors?.length) continue;

      for (const row of json.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || []) {
        const status = String(row.dimensions?.edgeResponseStatus || "");
        const path = String(row.dimensions?.clientRequestPath || "");
        if (!status || !path) continue;
        const key = `${status}\t${path}`;
        aggregate.set(key, (aggregate.get(key) || 0) + Number(row.count || 0));
      }
    } catch {
      // Keep the main report usable even when the per-day diagnostic query fails.
    }
  }

  return [...aggregate.entries()]
    .map(([key, count]) => {
      const [status, path] = key.split("\t");
      return { status, path, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
}

function buildActions({ health, gsc, ga4, cf }) {
  const actions = [];
  const failedHealth = health.filter((item) => !item.ok);
  if (failedHealth.length) {
    actions.push(`排查健康检查失败路径：${failedHealth.map((item) => `${item.path} (${item.status})`).join(", ")}。`);
  }

  if (cf.ok) {
    const errors5xx = cf.status.filter((item) => String(item.code).startsWith("5")).reduce((sum, item) => sum + item.count, 0);
    const errors404 = cf.status.find((item) => item.code === "404")?.count || 0;
    if (errors5xx > 0) actions.push(`排查 Cloudflare 近 7 天 5xx 响应：${formatNumber(errors5xx)} 次请求。`);
    if (errors404 > 100) actions.push(`复盘近 7 天 404 来源：${formatNumber(errors404)} 次请求，区分爬虫探测与真实死链。`);
    if (cf.cacheRatio < 50 && cf.requests > 0) actions.push(`检查静态资源缓存策略，当前 Cloudflare 缓存比例为 ${formatPercent(cf.cacheRatio)}。`);
    if (cf.abnormalPaths.length) {
      const top = cf.abnormalPaths.slice(0, 5).map((item) => `${item.path} (${item.status}, ${formatNumber(item.count)})`).join(", ");
      actions.push(`处理重复异常路径：${top}。`);
    }
  }

  if (gsc.ok) {
    const opportunityQueries = gsc.queries
      .filter((item) => item.impressions >= 5 && item.position >= 8 && item.position <= 25)
      .slice(0, 5)
      .map((item) => item.query);
    if (opportunityQueries.length) {
      actions.push(`加强接近首页排名的搜索词内容与内链：${opportunityQueries.join(", ")}。`);
    }
  }

  if (ga4.ok) {
    const affiliateClicks = ga4.events.find((event) => event.eventName === "affiliate_click");
    if (!affiliateClicks) {
      actions.push("检查联盟点击事件是否已在 GA4 中稳定出现，必要时补充转化验证。");
    }
  }

  if (!actions.length) {
    actions.push("保持当前巡检节奏，优先观察搜索曝光、核心页面访问和商业化事件。");
  }

  return actions.slice(0, 7);
}

function renderList(items, renderItem) {
  if (!items.length) return "- 暂无数据\n";
  return items.map(renderItem).join("\n") + "\n";
}

function renderReport(data) {
  const { health, gsc, ga4, cf, actions } = data;
  const healthOk = health.every((item) => item.ok);
  const healthStatus = healthOk ? "核心页面健康检查通过" : "存在页面健康检查异常";
  const searchSummary = gsc.ok
    ? `GSC 点击 ${formatNumber(gsc.clicks)}，曝光 ${formatNumber(gsc.impressions)}，CTR ${formatPercent(gsc.ctr)}，平均排名 ${gsc.avgPosition.toFixed(1)}`
    : `GSC 跳过：${gsc.reason}`;
  const trafficSummary = ga4.ok
    ? `GA4 PV ${formatNumber(ga4.pageViews)}，活跃用户 ${formatNumber(ga4.activeUsers)}，会话 ${formatNumber(ga4.sessions)}`
    : `GA4 跳过：${ga4.reason}`;
  const cfSummary = cf.ok
    ? `Cloudflare PV ${formatNumber(cf.pageViews)}，请求 ${formatNumber(cf.requests)}，独立访客 ${formatNumber(cf.uniques)}，缓存比例 ${formatPercent(cf.cacheRatio)}`
    : `Cloudflare 跳过：${cf.reason}`;

  return `# ${PROJECT.name} 日报 - ${OUTPUT_DATE}

## 老板先看结论
${healthStatus}。
${searchSummary}。
${trafficSummary}。
${cfSummary}。
当前行动项：${actions.join("；")}

---

## 基础信息
- 项目：${PROJECT.name}（${PROJECT.code}）
- 网站：${PROJECT.siteUrl}
- 仓库：${PROJECT.repo}
- 本地目录：${rootDir}
- 报告生成时间：${new Date().toISOString()}

## 健康状态
${renderList(health, (item) => `- 路径：${item.path}，状态：${item.status}${item.ok ? " OK" : ""}，响应时间：${item.ms} ms${item.error ? `，错误：${item.error}` : ""}`)}
## 搜索
${gsc.ok
    ? `- 数据范围：${gsc.start} to ${gsc.end}（GSC 通常有 2-3 天延迟）
- 点击：${formatNumber(gsc.clicks)}
- 曝光：${formatNumber(gsc.impressions)}
- CTR：${formatPercent(gsc.ctr)}
- 平均排名：${gsc.avgPosition.toFixed(1)}

### 搜索词机会
${renderList(gsc.queries.slice(0, 10), (item) => `- ${item.query}：点击 ${formatNumber(item.clicks)}，曝光 ${formatNumber(item.impressions)}，CTR ${formatPercent(item.ctr)}，排名 ${Number(item.position).toFixed(1)}`)}
### 搜索落地页
${renderList(gsc.pages.slice(0, 8), (item) => `- ${item.page}：点击 ${formatNumber(item.clicks)}，曝光 ${formatNumber(item.impressions)}，排名 ${Number(item.position).toFixed(1)}`)}`
    : `- ${gsc.reason}`}

## 流量与转化
${ga4.ok
    ? `- Hostname：${ga4.hostname}
- 页面浏览：${formatNumber(ga4.pageViews)}
- 活跃用户：${formatNumber(ga4.activeUsers)}
- 会话：${formatNumber(ga4.sessions)}

### 来源渠道
${renderList(ga4.traffic, (item) => `- ${item.sourceMedium}：活跃用户 ${formatNumber(item.activeUsers)}，会话 ${formatNumber(item.sessions)}`)}
### 热门页面
${renderList(ga4.pages, (item) => `- ${item.pagePath}：PV ${formatNumber(item.views)}，活跃用户 ${formatNumber(item.activeUsers)}`)}
### 核心事件
${renderList(ga4.events.slice(0, 10), (item) => `- ${item.eventName}：${formatNumber(item.count)} 次`)}
### 设备
${renderList(ga4.devices, (item) => `- ${item.device}：活跃用户 ${formatNumber(item.activeUsers)}`)}`
    : `- ${ga4.reason}`}

## Cloudflare 运维
${cf.ok
    ? `- 数据范围：${cf.start} to ${cf.end}
- 页面浏览：${formatNumber(cf.pageViews)}
- 请求数：${formatNumber(cf.requests)}
- 独立访客：${formatNumber(cf.uniques)}
- 缓存比例：${formatPercent(cf.cacheRatio)}

### 状态码
${renderList(cf.status.slice(0, 12), (item) => `- ${item.code}：${formatNumber(item.count)} 次`)}
### 异常路径
${renderList(cf.abnormalPaths.slice(0, 15), (item) => `- ${item.path}：${item.status}，${formatNumber(item.count)} 次`)}`
    : `- ${cf.reason}`}

## 下一步
${renderList(actions, (item) => `- ${item}`)}
## 需要老板确认
当前没有需要老板立即确认的事项。涉及广告账户、联盟账户、DNS、付费服务、生产安全策略或可能影响隐私的追踪工具时，需要单独确认。
`;
}

async function main() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  console.log(`Generating ${PROJECT.name} ops report...`);
  const health = await runHealthChecks();
  const googleToken = await getGoogleAccessToken();
  const [gsc, ga4, cf] = await Promise.all([
    googleToken.ok ? fetchGsc(googleToken.token) : Promise.resolve({ ok: false, reason: googleToken.reason }),
    googleToken.ok ? fetchGa4(googleToken.token) : Promise.resolve({ ok: false, reason: googleToken.reason }),
    fetchCloudflare(),
  ]);

  const actions = buildActions({ health, gsc, ga4, cf });
  const report = renderReport({ health, gsc, ga4, cf, actions });
  const reportPath = path.resolve(REPORTS_DIR, `${OUTPUT_DATE}-ops-report.md`);
  fs.writeFileSync(reportPath, report, "utf8");

  console.log(`Ops report saved: ${reportPath}`);
  if (!gsc.ok) console.log(`GSC skipped: ${gsc.reason}`);
  if (!ga4.ok) console.log(`GA4 skipped: ${ga4.reason}`);
  if (!cf.ok) console.log(`Cloudflare skipped: ${cf.reason}`);
}

main().catch((error) => {
  console.error(`Ops report failed: ${error.message}`);
  process.exit(1);
});
