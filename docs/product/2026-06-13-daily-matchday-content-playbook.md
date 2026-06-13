# WorldCupDex 每日赛事实时内容运营手册

## 目标

在世界杯赛期内，通过每日短文持续提升：

- SEO 覆盖：捕捉当天比赛、球队分组、赛程、球迷争议、热门问题等长尾搜索。
- 用户粘性：让用户每天都有理由回到 WorldCupDex 查看赛程、球队资料、预测和球迷卡。
- AdSense 内容质量：增加原创编辑判断、真实数据引用、内部链接和可持续更新内容，降低“低价值内容”风险。

## 核心原则

1. 不编造用户观点。只使用公开可核验来源、站内真实行为数据，或明确标注为编辑部观察。
2. 不做纯新闻搬运。每篇文章必须包含 WorldCupDex 自己的结构化赛程数据、站内入口、编辑判断或用户视角整理。
3. 不追求长文。赛期每日文章以 600-1200 字为主，重点是快、准、可读、可持续。
4. 不使用博彩导向表达。可以写预测、形势、看点，但避免赔率诱导和下注暗示。
5. 先保证事实正确。比赛时间、球队、场馆、比分、出线规则必须在发布前核对。

## 每日工作流

### 1. 早间运营检查

运行：

```bash
npm run ops:report
```

查看：

- `reports/ops/YYYY-MM-DD-ops-report.md`
- 今日 GA4 页面访问和来源
- GSC 最近可用搜索词
- Cloudflare 请求量、状态码、异常路径
- 站内当前热门页面

输出结论：

- 今日最值得写的 1 个主话题
- 2-3 个备选话题
- 是否有技术问题需要先修复

### 2. 今日选题规则

优先级从高到低：

1. 今天或明天有比赛的球队、分组、赛程问题。
2. GSC 已有曝光但点击率低、排名在 5-30 的关键词。
3. GA4/Cloudflare 今日访问明显升温的球队或页面。
4. 社交平台、论坛、新闻中被反复讨论的争议问题。
5. 站内功能可承接的内容，例如预测卡、球队页、赛程页、球迷卡。

合格选题示例：

- `Iran World Cup 2026 group: fixture order, Group G outlook and key fan questions`
- `Belgium vs Iran preview: what matters most before Group G kickoff`
- `Why fans are watching Egypt in Group G`
- `Today at WorldCupDex: matches to follow, schedule links and prediction prompts`

不合格选题示例：

- 没有新信息的泛泛“世界杯很精彩”
- 只改写别站新闻
- 没有来源的“网友都说”
- 夸张标题党或无法兑现的预测

### 3. 数据收集清单

每篇文章至少使用其中 3 类：

- 站内数据：`data/matches.json`、`data/teams.json`、球队页、赛程页、预测页。
- 运营数据：GSC 搜索词、GA4 热门页面、Cloudflare 热门路径。
- 官方来源：FIFA tournament hub、FIFA Match Centre、官方球队/赛事页面。
- 公开讨论：Reddit、X、新闻评论区、YouTube 评论等公开页面。
- 编辑部观察：基于球队实力、赛程顺序、出线规则形成的分析。

公开用户观点使用规则：

- 可以总结趋势，例如“部分球迷关注伊朗首战能否先拿分”。
- 需要引用具体观点时，保留短引文并链接来源。
- 不得伪造“很多用户认为”。
- 没有足够公开证据时，写成“编辑部观察”而不是“用户观点”。

### 4. 文章结构模板

建议文件路径：

- 英文：`content/en/blog/YYYY-MM-DD-topic-slug.md`
- 中文：`content/zh/blog/YYYY-MM-DD-topic-slug.md`
- 西语：`content/es/blog/YYYY-MM-DD-topic-slug.md`

Frontmatter：

```md
---
title: ""
description: ""
publishedAt: "YYYY-MM-DD"
updatedAt: "YYYY-MM-DD"
author: "WorldCupDex Editorial"
cover: "/images/blog/format-change.webp"
tags: []
locale: "en"
draft: false
---
```

正文结构：

1. 快速答案：2-3 句话回答搜索意图。
2. 今日比赛/赛程数据：列出对阵、时间、场馆、站内链接。
3. 热点问题：整理 1 个球迷最关心的问题。
4. 编辑部判断：给出清晰但不过度承诺的分析。
5. 站内行动入口：链接到球队页、赛程页、预测页、球迷卡。
6. Sources and official references：列出官方或公开来源。
7. FAQ：3 个短问短答，覆盖长尾搜索。

### 5. 发布前核对

必须检查：

- 比赛日期、时间、场馆、对阵是否正确。
- 中文、英文、西语文章的 `locale` 是否正确。
- 内部链接是否存在并返回 200。
- `publishedAt` 和 `updatedAt` 是否为当天日期。
- 文章是否包含至少 3 个站内链接。
- 是否有官方来源或公开来源。
- 没有未经证实的用户观点。

建议运行：

```bash
npm run validate-data
npm run build
```

部署后抽检：

- 文章 URL 返回 200。
- 页面标题是文章标题，不是 `Blog - WorldCupDex`。
- 三语 sitemap 包含新 URL。
- 博客列表能看到新文章。

### 6. 发布后动作

1. 部署到 Cloudflare Pages。
2. 检查生产 URL。
3. 检查 sitemap：
   - `https://worldcupdex.org/__sitemap__/en-US.xml`
   - `https://worldcupdex.org/__sitemap__/zh-CN.xml`
   - `https://worldcupdex.org/__sitemap__/es-ES.xml`
4. 在 Search Console 中重新提交 `https://worldcupdex.org/sitemap.xml`，如果当前自动凭据没有写权限，需要人工提交。
5. 记录当天文章、URL、目标关键词和后续观察点。

## 每日运营台账

建议在当天 ops report 末尾追加：

```md
## 今日内容运营

- 发布文章：
- 目标关键词：
- 使用数据来源：
- 站内承接入口：
- 发布 URL：
- sitemap 状态：
- 需要人工复核：
- 明日跟进：
```

## 选题库

### 比赛日预览

- `[Team A] vs [Team B] preview: schedule, venue and key question`
- `[Team] World Cup group outlook before today’s match`
- `Today’s World Cup matches: what to watch and where each team stands`

### 分组与出线

- `[Team] World Cup 2026 group: opponents, fixtures and qualification outlook`
- `Can [Team] reach the Round of 32? Group path explained`
- `Best third-place path for [Team] at World Cup 2026`

### 球迷争议与观点

- `Why fans are debating [Team] before [Match]`
- `The biggest question around [Team] today`
- `What supporters are watching in [Group]`

### 站内功能承接

- `Make your [Team] prediction card before kickoff`
- `Follow [Team] schedule and build your fan pass`
- `WorldCupDex daily prediction prompt: today’s match to call`

## 指标看板

每天观察：

- 新文章 24 小时 PV
- 新文章入口来源
- 新文章内部链接点击路径
- 对应关键词 GSC impressions/clicks
- 博客列表 PV
- 预测页、球队页、赛程页转化访问
- AdSense 审核状态或政策提示

一篇文章是否有效的初步标准：

- 48 小时内有搜索曝光，或
- 24 小时内带来站内深度访问，或
- 成功承接到球队页、赛程页、预测页、球迷卡中的任意入口。

## 自动化路线

### 第一阶段：人工运营

- 每天人工选择选题。
- Codex 起草文章。
- 人工确认争议观点和公开来源。
- Codex 发布、部署、核对。

### 第二阶段：半自动草稿

增加脚本：

- 从 `data/matches.json` 找出今日/明日比赛。
- 从 ops report 提取热门路径和关键词。
- 生成 Markdown 草稿到 `content/*/blog`。
- 用户或运营者确认后再发布。

### 第三阶段：复盘驱动选题

每周复盘：

- 哪些球队/比赛文章有曝光。
- 哪些标题 CTR 低。
- 哪些站内 CTA 有点击。
- 根据数据调整下一周选题。

## 风险边界

需要用户确认：

- 使用付费数据源。
- 开启新的第三方抓取或 API。
- 直接引用社交平台用户原文超过短引用。
- 修改隐私、广告、Cookie、追踪策略。
- 批量自动发布大量文章。

可以直接执行：

- 基于站内数据和官方来源写每日短文。
- 修复文章路由、sitemap、内部链接等低风险问题。
- 补充多语言版本。
- 生成当天运营报告。
- 部署已经验证通过的内容更新。

