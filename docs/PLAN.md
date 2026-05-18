# WorldCupDex 赛前推进与商业化计划
> 批准日期：2026-05-18 ｜ 状态：实施中 ｜ 来源：Leader Plan

## 项目现状速览

- **完成度**：13 个核心页面全部完整实现，48 队/1200+ 球员/104 场比赛数据齐全；分享系统、IQ 测试、球迷卡片、预测卡片四大病毒互动功能就绪；中/英/西三语国际化完整。
- **缺口**：商业化（AdSense/CJ/邮件）0%；分析追踪（GA4/CF Analytics）0%；CI/CD 自动化缺失；SEO 仅基础（缺 structured data、部分页面 OG 不全）；付费功能未实施。
- **部署**：CF Pages（Nitro 自动适配），构建产物 `dist/` 已就绪，但无 wrangler.toml、无 GitHub Actions。
- **约束**：用户选定"先变现"路线，赛后付费功能本次不做方案设计。

---

## 一、待办任务 — 网站本身（非商业化）

### Task 1.1 修复唯一遗留 TODO（P3）
- 位置：`tool/worldcupdex/components/MatchCard.vue` 第 62 行
- 现状：注释 `// TODO: 跳转或弹出 AI 预测详情。现阶段不做处理。`
- 决策建议：保持现状，仅删除 TODO 注释；AI 预测详情未来由付费方案承接。

### Task 1.2 补全 SEO 基础（P2）
- 在 `composables/useSeoConfig.ts` 中扩展默认 OG 与 Twitter Card 字段，让所有页面统一带上 `og:title / og:description / og:image / twitter:card`，目前仅 `predict/champion.vue` 完整。
- 新增 `components/SchemaOrg.vue` 或在 `useSeoConfig` 中注入 JSON-LD：
  - 全站：`Organization` schema
  - `/teams/[id]`：`SportsTeam` schema
  - `/schedule` 比赛项：`SportsEvent` schema
  - `/quiz`：`Quiz` schema
- 验证：`npm run generate` 后用 Google Rich Results Test 抽查 3 个页面。

### Task 1.3 数据自动更新机制（P1）
- 当前所有数据脚本需要手动 `npm run fetch-data`，赛事开始后赛果不会自动更新。
- 方案：在 GitHub Actions 中加 `cron` 工作流（赛中 30 分钟一次，赛前 1 天一次）：
  1. 跑 `scripts/fetch-worldcup-data.mjs` 与 `scripts/fetch-recent-matches.mjs`
  2. 自动 commit 到 main 分支，触发 CF Pages 重建
- 备选：用 Cloudflare Workers Cron Trigger 直接写入 KV，但与当前 JSON 方案冲突，赛前不切。

### Task 1.4 CI/CD（P1）
- 新建 `.github/workflows/ci.yml`：PR 时跑 `npm run build` 做最小冒烟。
- 新建 `.github/workflows/deploy.yml`：main 推送时构建并通过 `cloudflare/wrangler-action` 推送到 CF Pages。
- 补 `wrangler.toml`（pages_build_output_dir = "dist"），把 `FOOTBALL_DATA_API_KEY` 配为 GitHub Secrets。

### Task 1.5 占位/UI 优化（P3）
- `layouts/default.vue` 第 ~100 行登录按钮目前是占位，赛前隐藏或改成"邮件订阅"入口（与 Task 2.4 联动）。
- `pages/matches/index.vue` 重定向逻辑保留。

### Task 1.6 PWA 与性能（P3）
- 检查 PWA 离线策略：核心页面（首页/赛程/球队列表）应预缓存。
- Lighthouse 抽查首页与球队详情页，目标 Performance ≥ 85。
- 球员图片懒加载：确认 `<img loading="lazy">` 已用全。

---

## 二、待办任务 — 商业化

### Task 2.1 Google AdSense 接入（P1，关键）
**前置**：需用户提供 AdSense 发布商 ID 或先去 https://www.google.com/adsense 申请（域名 worldcupdex.org 必须先有内容，目前满足）。
- 在 `nuxt.config.ts` 的 `app.head.script` 中注入 AdSense 脚本（含 `data-ad-client`）。
- 新增 `components/AdSlot.vue` 封装 `<ins class="adsbygoogle">`，支持 `slot`、`format` props。
- 投放位置（基于 CTR 与不打扰原则）：
  - `/schedule` 顶部和列表中间（信息型，CPM 高）
  - `/teams/[id]` 阵容上方与底部
  - `/data` 右栏
  - `/quiz/result` 结果卡上方（避免遮挡分享按钮）
  - **不投放**：`/predict/[id]`、`/fan-card/result`（会污染分享卡片）
- 在 `dist/_headers` 中确保 AdSense 域名 CSP 通过。
- 同步申请 ads.txt 并放到 `public/ads.txt`。

### Task 2.2 Google Analytics 4 + 事件埋点（P1）
- 注入 `gtag.js`（与 AdSense 共存）。
- 关键事件：
  - `share_card_export`：参数 `card_type`（champion/match/quiz/fan）
  - `predict_submit`：参数 `match_id` 或 `champion_team`
  - `quiz_complete`：参数 `score`
  - `email_subscribe`：参数 `source`
  - `affiliate_click`：参数 `partner`、`team_id`
- 在 `composables/useAnalytics.ts` 新增统一封装函数 `track(event, params)`，业务页调用。
- 在 GA4 后台标记 `email_subscribe`、`affiliate_click` 为转化事件。

### Task 2.3 CJ 联盟接入（P1）
**前置**：用户先在 https://www.cjcni.com 申请发布商账号（审核 1–7 天），与 Adidas/Nike/Fanatics 等体育商家建立合作。
- 选品策略：每个球队详情页推 1–2 件官方球衣或经典款（按地区动态切换：US 市场 Fanatics，EU 市场 Adidas/Nike）。
- 数据：新建 `data/affiliate-products.json`，结构 `{teamId, partner, productUrl, imgUrl, price, currency}`。
- 组件：新增 `components/JerseyRecommend.vue`，在 `pages/teams/[id].vue` 阵容下方插入。
- 链接处理：所有出站链接统一走 `/api/track-affiliate?partner=&team=&dest=`，记录点击后 302 跳转到 CJ 链接，便于与 GA4 对账。
- 合规：在产品卡下方加 "Sponsored" 小标签，footer 加 affiliate disclosure 文案（中/英/西三语）。

### Task 2.4 邮件订阅系统（P1，最重要的赛后资产）
> ⚠️ 已撤销：本次不实施（用户 2026-05-18 决策）
**选型**：推荐 **Resend**（免费 100 封/天 + 3000 封/月，API 友好，CF Pages 兼容）；备选 Mailchimp（免费 500 联系人）。
- 表单组件：`components/SubscribeForm.vue`，含邮箱+地区+喜爱球队三字段，挂载到：
  - 首页 Hero 下方
  - `/predict/[id]` 提交后弹层
  - `/quiz/result` 分享区下方
  - footer 全局
- 服务端：`server/api/subscribe.post.ts`，调用 Resend API 把订阅写入 Resend 的 audience。
- 自动邮件：
  - 欢迎邮件（订阅即触发）
  - 比赛日提醒（赛前 1 小时，按用户喜爱球队推送）
  - 赛后总结（结果+预测对比+下场预告）
- 模板：在 Resend 后台配置 3 个模板，正文带回站 CTA 与 KickIQ 互导链接。
- 反垃圾：表单加 honeypot 字段；订阅成功埋点 `email_subscribe`。

### Task 2.5 KickIQ 矩阵互导（P1）
- 在 `pages/quiz/result.vue` 与 `pages/fan-card/result.vue` 加 "玩更多 Quiz → KickIQ" 按钮。
- 在 KickIQ 的 Quiz/Predict 结果页（朋友站）加返链到 WorldCupDex 球队详情/赛程（需对方配合）。
- UTM 参数统一：`?utm_source=kickiq&utm_medium=cross_site&utm_campaign=worldcup2026`。
- 在 GA4 中观测互导转化与停留时长。

### Task 2.6 内容型 SEO 流量入口（P2）
- 在 `pages/teams/[id].vue` 末尾加"球队历史/夺冠预测/小组形势"自动生成段落（基于现有 AI 预测数据），增加页面字数（目标 ≥ 800 词），利于长尾收录。
- 创建 `/blog/[slug]` 静态路由（5–10 篇手写或半自动文章）：32强分析、夺冠概率排行、最佳阵容预测等，覆盖热搜关键词。
- 提交主关键词到 Google Search Console 验证收录速度。

### Task 2.7 分享文案 A/B 优化（P2）
- 在 `composables/useShare.ts` 中将分享文本做 2 套候选，按用户随机分配，GA4 上报 `share_variant`，赛中观察哪种点击回流更高。
- 在分享卡片底部统一品牌区加上 `worldcupdex.org` 与简短 slogan。

---

## 三、需用户确认的关键问题

1. **AdSense 与 CJ 账号**：是否已申请？发布商 ID 是否可提供？若未申请，是否同意我先准备好接入代码与位置，等账号下来填入即可？
2. **邮件服务商**：默认走 **Resend**（推荐），可改 Mailchimp/ConvertKit；请确认。
3. **数据自动更新位置**：默认走 GitHub Actions cron（自动 commit 触发 CF Pages 重建），如果担心 commit 噪音可改 Cloudflare Workers + KV 方案，但需更大改造。
4. **博客 SEO 入口**：Task 2.6 的 5–10 篇文章，希望由我自动生成草稿后您审稿，还是只搭脚手架由您手写？
5. **联盟商家优先级**：CJ 上 Adidas/Nike/Fanatics 较热门，您是否有偏好或已建立的合作关系？

---

## 四、推进顺序与依赖

```
[阶段一 基础 1-2 天]   wrangler.toml + GitHub Actions CI/CD (Task 1.4)
                       └─ 解锁后续自动部署
[阶段二 数据 1 天]     数据自动更新 cron (Task 1.3)
[阶段三 变现 3-5 天]   并行：
                       ├─ AdSense 接入 (Task 2.1)
                       └─ GA4 埋点   (Task 2.2)
[阶段四 联盟 2-3 天]   CJ 集成 + JerseyRecommend (Task 2.3)
                       前置依赖 CJ 账号审核
[阶段五 SEO 2-3 天]    OG/Schema 补全 (Task 1.2) + 互导 (Task 2.5) + 内容型入口 (Task 2.6)
[阶段六 收尾 1 天]     A/B 文案 (Task 2.7) + Lighthouse 调优 (Task 1.6) + TODO 清理 (Task 1.1, 1.5)
```

总预估：**约 10–14 个工作日**，可在 1 个月窗口内完成；CJ/AdSense 审核期与 GitHub Actions 搭建可并行。

---

## 五、最终产出物

1. 代码改动覆盖：`nuxt.config.ts`、`composables/useAnalytics.ts`、`components/AdSlot.vue`、`components/JerseyRecommend.vue`、`server/api/track-affiliate.get.ts`、`.github/workflows/{ci,deploy,cron-data}.yml`、`wrangler.toml`、`public/ads.txt`。
2. 文档产出：`tool/worldcupdex/docs/PLAN.md`（本计划）。
3. 验证证据：Lighthouse 报告、Google Rich Results 抽查、GA4 实时事件流截图、AdSense 站点验证截图、Resend 测试邮件截图。
