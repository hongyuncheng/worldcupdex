# WorldCupDex 脚本工具集

这里包含了用于维护和监控 WorldCupDex 网站数据的自动化脚本。

## 脚本列表

| 脚本文件 | 功能说明 | 运行命令 | 所需环境变量 / 配置 |
|----------|----------|----------|---------------------|
| `fetch-worldcup-data.mjs` | 获取世界杯基础数据 | `npm run fetch-data` | `FOOTBALL_DATA_API_KEY` |
| `enrich-data.mjs` | 丰富球队与比赛数据 | `npm run enrich-data` | - |
| `fetch-recent-matches.mjs` | 获取近期比赛结果 | `npm run fetch-recent` | `FOOTBALL_DATA_API_KEY` |
| `fetch-player-photos.mjs` | 抓取球员头像 | `npm run fetch-photos` | - |
| `generate-ai-predictions.mjs` | 生成 AI 预测数据 | `npm run generate-predictions`| - |

| `gsc-auth.mjs` | Google Search Console 授权 | `npm run gsc-auth` | 需配置 `credentials.json` |
| `generate-gsc-report.mjs` | 生成 GSC 数据报告 | `npm run gsc-report` | 需先完成 `gsc-auth` 授权 |
| `generate-ga4-report.mjs` | **生成 GA4 流量分析报告** | `npm run ga4-report` | 需配置 `credentials.json` 及 `GA4_PROPERTY_ID` |
| `generate-analytics-report.mjs` | 生成 Cloudflare 分析报告 | `npm run cf-report` | `CF_ANALYTICS_API_TOKEN`, `CF_ZONE_ID` |

## Google Analytics 4 (GA4) 报告配置

基于你提供的 GA4 数据视图链接（`.../a395191586p538207577/...`），你的 Property ID 是 **538207577**。

1. **设置认证凭据**：GA4 脚本使用与 GSC 相同的 Google Cloud 服务账号。请确保项目根目录下已有 `credentials.json`，且该服务账号邮箱已被添加为你 GA4 媒体资源（Property）的“查看者”权限。
2. **设置环境变量**：在项目根目录 `.env` 文件中，添加你的 Property ID：
   ```env
   GA4_PROPERTY_ID=538207577
   ```
3. **运行脚本**：
   ```bash
   npm run ga4-report
   ```
4. 脚本会拉取最近 7 天的“来源/媒介 (Source/Medium)”维度流量数据，保存在 `reports/ga4-report-YYYY-MM-DD.md` 中。