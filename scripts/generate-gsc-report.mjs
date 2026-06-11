import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import { loadProjectEnv } from "./load-project-env.mjs";

const { rootDir, rootEnvPath } = loadProjectEnv(import.meta.url);

const {
  GSC_CLIENT_ID,
  GSC_CLIENT_SECRET,
  GSC_REFRESH_TOKEN,
  GSC_SITE_URL = "sc-domain:worldcupdex.org",
} = process.env;

if (!GSC_CLIENT_ID || !GSC_CLIENT_SECRET || !GSC_REFRESH_TOKEN) {
  console.error("缺少 GSC OAuth 三元组。");
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

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function formatPercent(value) {
  return `${(Number(value || 0) * 100).toFixed(2)}%`;
}

function formatPosition(value) {
  return Number(value || 0).toFixed(1);
}

function getDateRange() {
  const end = new Date();
  end.setDate(end.getDate() - 3);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return { start: formatDate(start), end: formatDate(end) };
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

async function fetchGscReport(token, requestBody) {
  const response = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE_URL)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      agent: getProxyAgent(),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GSC API 失败 (${response.status}): ${text}`);
  }

  return response.json();
}

function table(rows, headers, mapper) {
  const head = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.length
    ? rows.map((row) => `| ${mapper(row).join(" | ")} |`).join("\n")
    : `| ${headers.map(() => "-").join(" | ")} |`;

  return `${head}\n${divider}\n${body}\n`;
}

async function main() {
  const { start, end } = getDateRange();
  const token = await refreshAccessToken();

  const [daily, queries, pages, countries, devices] = await Promise.all([
    fetchGscReport(token, { startDate: start, endDate: end, dimensions: ["date"], rowLimit: 100 }),
    fetchGscReport(token, { startDate: start, endDate: end, dimensions: ["query"], rowLimit: 20 }),
    fetchGscReport(token, { startDate: start, endDate: end, dimensions: ["page"], rowLimit: 20 }),
    fetchGscReport(token, { startDate: start, endDate: end, dimensions: ["country"], rowLimit: 10 }),
    fetchGscReport(token, { startDate: start, endDate: end, dimensions: ["device"], rowLimit: 10 }),
  ]);

  const dailyRows = daily.rows || [];
  const totalClicks = dailyRows.reduce((sum, row) => sum + Number(row.clicks || 0), 0);
  const totalImpressions = dailyRows.reduce((sum, row) => sum + Number(row.impressions || 0), 0);
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPosition = totalImpressions > 0
    ? dailyRows.reduce((sum, row) => sum + Number(row.position || 0) * Number(row.impressions || 0), 0) / totalImpressions
    : 0;

  const report = [
    `# Google Search Console 报告 - ${end}`,
    "",
    `- 分析站点：\`${GSC_SITE_URL}\``,
    `- 数据范围：${start} 至 ${end}`,
    `- 总点击：${formatNumber(totalClicks)}`,
    `- 总曝光：${formatNumber(totalImpressions)}`,
    `- 平均 CTR：${formatPercent(avgCtr)}`,
    `- 平均排名：${formatPosition(avgPosition)}`,
    "",
    "## 热门查询",
    table(queries.rows || [], ["Query", "Clicks", "Impressions", "CTR", "Position"], (row) => [
      row.keys?.[0] || "-",
      formatNumber(row.clicks),
      formatNumber(row.impressions),
      formatPercent(row.ctr),
      formatPosition(row.position),
    ]),
    "## 热门落地页",
    table(pages.rows || [], ["Page", "Clicks", "Impressions", "CTR", "Position"], (row) => [
      row.keys?.[0] || "-",
      formatNumber(row.clicks),
      formatNumber(row.impressions),
      formatPercent(row.ctr),
      formatPosition(row.position),
    ]),
    "## 国家",
    table(countries.rows || [], ["Country", "Clicks", "Impressions", "Position"], (row) => [
      row.keys?.[0] || "-",
      formatNumber(row.clicks),
      formatNumber(row.impressions),
      formatPosition(row.position),
    ]),
    "## 设备",
    table(devices.rows || [], ["Device", "Clicks", "Impressions", "CTR", "Position"], (row) => [
      row.keys?.[0] || "-",
      formatNumber(row.clicks),
      formatNumber(row.impressions),
      formatPercent(row.ctr),
      formatPosition(row.position),
    ]),
  ].join("\n");

  const reportsDir = resolve(rootDir, "reports");
  mkdirSync(reportsDir, { recursive: true });

  const reportPath = resolve(reportsDir, `${end}-gsc-dashboard.md`);
  writeFileSync(reportPath, report, "utf8");
  console.log(`GSC report saved: ${reportPath}`);
}

main().catch((error) => {
  console.error(`生成 GSC 报告失败: ${error.message}`);
  process.exit(1);
});
