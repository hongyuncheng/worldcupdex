import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import { loadProjectEnv } from "./load-project-env.mjs";

const { rootDir, rootEnvPath } = loadProjectEnv(import.meta.url);

const {
  GSC_CLIENT_ID,
  GSC_CLIENT_SECRET,
  GSC_REFRESH_TOKEN,
  GA4_PROPERTY_ID = "538207577",
  GA4_HOSTNAME = "worldcupdex.org",
} = process.env;

if (!GSC_CLIENT_ID || !GSC_CLIENT_SECRET || !GSC_REFRESH_TOKEN) {
  console.error("缺少 Google OAuth 三元组。");
  console.error(`请检查 ${rootEnvPath} 中是否包含：`);
  if (!GSC_CLIENT_ID) console.error("- GSC_CLIENT_ID");
  if (!GSC_CLIENT_SECRET) console.error("- GSC_CLIENT_SECRET");
  if (!GSC_REFRESH_TOKEN) console.error("- GSC_REFRESH_TOKEN");
  process.exit(1);
}

function getProxyAgent() {
  const proxyUrl = process.env.OPS_HTTPS_PROXY
    || process.env.HTTPS_PROXY
    || process.env.HTTP_PROXY
    || process.env.https_proxy
    || process.env.http_proxy;

  return proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function table(rows, headers, mapper) {
  const head = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.length
    ? rows.map((row) => `| ${mapper(row).join(" | ")} |`).join("\n")
    : `| ${headers.map(() => "-").join(" | ")} |`;

  return `${head}\n${divider}\n${body}\n`;
}

async function refreshAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GSC_CLIENT_ID,
      client_secret: GSC_CLIENT_SECRET,
      refresh_token: GSC_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }).toString(),
    agent: getProxyAgent(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google OAuth 刷新失败 (${response.status}): ${text}`);
  }

  const json = await response.json();
  return json.access_token;
}

async function fetchGa4Report(token, requestBody) {
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...requestBody,
      dimensionFilter: {
        filter: {
          fieldName: "hostName",
          stringFilter: { matchType: "EXACT", value: GA4_HOSTNAME },
        },
      },
    }),
    agent: getProxyAgent(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GA4 API 失败 (${response.status}): ${text}`);
  }

  return response.json();
}

function mapRows(response, mapper) {
  return (response.rows || []).map(mapper);
}

async function main() {
  const token = await refreshAccessToken();

  const [traffic, pages, events, devices] = await Promise.all([
    fetchGa4Report(token, {
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "hostName" }, { name: "sessionSourceMedium" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    }),
    fetchGa4Report(token, {
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "hostName" }, { name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    }),
    fetchGa4Report(token, {
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "hostName" }, { name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 15,
    }),
    fetchGa4Report(token, {
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
  const dateStr = new Date().toISOString().split("T")[0];

  const report = [
    `# GA4 Dashboard - ${dateStr}`,
    "",
    `- Property ID: \`${GA4_PROPERTY_ID}\``,
    `- Hostname filter: \`${GA4_HOSTNAME}\``,
    `- 近 7 天 PV: ${formatNumber(pageViews)}`,
    `- 近 7 天活跃用户: ${formatNumber(activeUsers)}`,
    `- 近 7 天会话: ${formatNumber(sessions)}`,
    "",
    "## 流量来源",
    table(mapRows(traffic, (row) => ({
      sourceMedium: row.dimensionValues?.[1]?.value || "-",
      activeUsers: row.metricValues?.[0]?.value || 0,
      sessions: row.metricValues?.[1]?.value || 0,
    })), ["Source / Medium", "Active Users", "Sessions"], (row) => [
      row.sourceMedium,
      formatNumber(row.activeUsers),
      formatNumber(row.sessions),
    ]),
    "## 热门页面",
    table(mapRows(pages, (row) => ({
      pagePath: row.dimensionValues?.[1]?.value || "-",
      views: row.metricValues?.[0]?.value || 0,
      activeUsers: row.metricValues?.[1]?.value || 0,
    })), ["Page Path", "Views", "Active Users"], (row) => [
      row.pagePath,
      formatNumber(row.views),
      formatNumber(row.activeUsers),
    ]),
    "## 核心事件",
    table(mapRows(events, (row) => ({
      eventName: row.dimensionValues?.[1]?.value || "-",
      count: row.metricValues?.[0]?.value || 0,
    })), ["Event", "Count"], (row) => [
      row.eventName,
      formatNumber(row.count),
    ]),
    "## 设备",
    table(mapRows(devices, (row) => ({
      device: row.dimensionValues?.[1]?.value || "-",
      activeUsers: row.metricValues?.[0]?.value || 0,
    })), ["Device", "Active Users"], (row) => [
      row.device,
      formatNumber(row.activeUsers),
    ]),
  ].join("\n");

  const reportsDir = path.resolve(rootDir, "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.resolve(reportsDir, `ga4-dashboard-${dateStr}.md`);
  fs.writeFileSync(reportPath, report, "utf8");
  console.log(`GA4 report saved: ${reportPath}`);
}

main().catch((error) => {
  console.error(`生成 GA4 报告失败: ${error.message}`);
  process.exit(1);
});
