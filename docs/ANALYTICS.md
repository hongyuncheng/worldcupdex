# Analytics 埋点规范（GA4）

本项目使用 **Google Analytics 4 (GA4)** 作为统一的网站分析方案，通过 `useAnalytics()` composable 暴露统一调用入口。

> ⚠️ 任何新增埋点必须使用 [`composables/analyticsEvents.ts`](../composables/analyticsEvents.ts) 中导出的事件常量，禁止散落字符串。

---

## 1. 事件清单（Event Schema）

| 事件常量              | 事件名 (GA4)         | 触发时机                                   | 参数 schema                                                                 | 标记为转化 |
|----------------------|----------------------|--------------------------------------------|-----------------------------------------------------------------------------|-----------|
| `SHARE_CARD_EXPORT`  | `share_card_export`  | 球迷卡 / 分享卡片 PNG 导出成功             | `{ card_type: string }`                                                     | 否        |
| `PREDICT_SUBMIT`     | `predict_submit`     | 用户提交一次冠军 / 比分预测                | `{ predict_type: 'champion' \| 'match', team?: string, score?: string }`    | 否        |
| `QUIZ_COMPLETE`      | `quiz_complete`      | 测验五题完成、`getResult()` 结算时         | `{ score, correct_count, total_questions, time_spent, percentile }`         | 否        |
| `AFFILIATE_CLICK`    | `affiliate_click`    | CJ / Amazon 等联盟广告链接被点击           | `{ network: string, product?: string, position?: string }`                  | **是**    |
| `CROSS_SITE_CLICK`   | `cross_site_click`   | KickIQ / 矩阵站外跳转链接被点击            | `{ target: string, source_page: string }`                                   | 否        |
| `SHARE_VARIANT`      | `share_variant`      | 切换分享卡片样式 / 文案变体                | `{ variant: string }`                                                       | 否        |

### GA4 后台必须将下列事件标记为转化（Conversion）

- `affiliate_click`

操作路径：**GA4 后台 → 管理 → 事件 → 标记为转化**。

---

## 2. 调用方式

### 2.1 自定义事件

```ts
const { track } = useAnalytics()

track(AnalyticsEvents.SHARE_CARD_EXPORT, { card_type: 'fan_card' })
```

- SSR 环境会自动静默 no-op，无需手动判断。
- 未配置 `NUXT_PUBLIC_GA_ID` 时同样静默，不会抛错或污染 console。

### 2.2 页面浏览

`page_view` 由 [`plugins/analytics.client.ts`](../plugins/analytics.client.ts) 自动订阅 `router.afterEach` 上报，业务代码**无需**手动调用 `trackPageView`。

> `nuxt.config.ts` 中 gtag.js 初始化时配置了 `send_page_view: false`，避免和路由订阅重复。

---

## 3. 环境变量与 runtimeConfig

`runtimeConfig` 在 [`nuxt.config.ts`](../nuxt.config.ts) 中作为全站统一入口，所有公共/私有 key 含义如下：

| Path                            | 环境变量映射               | 类型 | 用途                                                                 |
|---------------------------------|----------------------------|------|----------------------------------------------------------------------|
| `runtimeConfig.public.gaId`     | `NUXT_PUBLIC_GA_ID`        | 公共 | GA4 衡量 ID（如 `G-XXXXXXXXXX`），存在时才注入 gtag.js               |
| `runtimeConfig.public.adsenseClient` | `NUXT_PUBLIC_ADSENSE_CLIENT` | 公共 | Google AdSense Publisher ID（如 `ca-pub-XXXXXXXXXXXX`）           |
| `runtimeConfig.public.kickiqUrl`| `NUXT_PUBLIC_KICKIQ_URL`   | 公共 | KickIQ 矩阵站点 URL（默认 `https://kickiq.app`）                     |
| `runtimeConfig.public.siteUrl`  | `NUXT_PUBLIC_SITE_URL`     | 公共 | 当前站点 URL（默认 `https://worldcupdex.org`）                       |

### Nuxt `NUXT_xxx` 自动映射规则

Nuxt 3 会按以下规则把环境变量自动注入 `runtimeConfig`：

- `NUXT_FOO_BAR` → `runtimeConfig.fooBar`
- `NUXT_PUBLIC_FOO_BAR` → `runtimeConfig.public.fooBar`

驼峰命名转下划线大写后加前缀。**无需**手动在 `nuxt.config.ts` 中读取 `process.env`，仅 GA4 注入因为要在构建期生成 `<script>` 标签才显式读取了一次。

---

## 4. 配置方式

### 4.1 本地开发

在 `tool/worldcupdex/.env`（已被 `.gitignore`）中：

```bash
NUXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NUXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXX
NUXT_PUBLIC_KICKIQ_URL=https://kickiq.app
NUXT_PUBLIC_SITE_URL=https://worldcupdex.org
```

### 4.2 生产环境

- **GitHub Actions / Secrets**：在 repo 的 *Settings → Secrets and variables → Actions* 中配置上述变量，CI 构建时通过 `env:` 注入。
- **Cloudflare Pages**：在 *Pages 项目 → Settings → Environment variables* 中配置同名变量（区分 Production / Preview）。

> 任何 `NUXT_PUBLIC_*` 都会进入客户端 bundle，请勿放置敏感信息。

---

## 5. 验证清单

- [ ] 未配置 `NUXT_PUBLIC_GA_ID` 时构建产物中**不应**出现 `googletagmanager.com` 相关 `<script>` 标签
- [ ] 配置后页面 `<head>` 应注入两段脚本，且 `gtag('config', GA_ID, { send_page_view: false })`
- [ ] `useAnalytics().track()` 在 SSR 与未配置场景下**不抛错**
- [ ] GA4 DebugView 能看到 `page_view` / `share_card_export` / `quiz_complete` 事件实时上报

---

## 6. 后续 agent 待接入埋点

> 本轮仅接入 `SHARE_CARD_EXPORT` 与 `QUIZ_COMPLETE` 两个事件。其它事件由对应 feature agent 在自己负责的模块内通过 `useAnalytics().track(AnalyticsEvents.XXX, params)` 接入：

- `PREDICT_SUBMIT` —— 冠军竞猜 / 比分预测页面提交逻辑
- `AFFILIATE_CLICK` —— `JerseyRecommend.vue` 等联盟广告点击
- `CROSS_SITE_CLICK` —— KickIQ 跨站跳转入口
- `SHARE_VARIANT` —— 分享卡片样式切换

---

## 7. 分享 A/B 实验（Share Copy A/B）

本项目对分享卡片文案进行 A/B 实验，目标是找到能带来更高 PNG 导出 / 病毒传播率的文案风格。

### 7.1 Variant 差异

| Variant | 风格定位 | 文案重心 | 典型示例（中文） |
|---------|---------|----------|------------------|
| **A**   | 成就感型（Achievement） | 强调用户做出的预测/选择，正向自豪表达 | "我已锁定 2026 世界杯冠军：{team}！" |
| **B**   | 挑衅型（Challenge）     | 强调分数 / 排名，激发收件人挑战欲     | "我刚通关世界杯 IQ：{score} 分，你敢挑战吗？" |

三语文案统一存放在 `i18n/{zh|en|es}.json` 的 `share.variantA` / `share.variantB` 命名空间下，每套包含 `title` / `description` / `hashtag` / `cta` 四个字段。

### 7.2 分配与上报

- 用户首次进入站点时由 [`composables/useShare.ts`](../composables/useShare.ts) 的 `getShareVariant()` 通过 `Math.random() < 0.5` 随机分配 `A` / `B`，结果持久化到 `localStorage.share_variant`。
- 同次会话仅会上报一次 `SHARE_VARIANT` 事件（`{ variant: 'A' | 'B' }`），由 `localStorage.share_variant_reported` 守护，避免重复污染漏斗。
- 后续 `buildShareText({ team, score, ... })` 始终基于本地 variant 渲染对应文案，保持同一用户的文案稳定一致。

### 7.3 GA4 看板配置

推荐在 GA4 看板中创建一个 **自定义维度 `share_variant`**：

1. **管理 → 自定义定义 → 自定义维度 → 新建**
   - 维度名称：`share_variant`
   - 范围：`Event`
   - 事件参数：`variant`
2. 在 **探索（Explore）** 中创建一个漏斗或自由表：
   - 维度：`share_variant`
   - 指标：`SHARE_VARIANT` 事件计数（曝光/分配数）、`SHARE_CARD_EXPORT` 事件计数（导出转化）
   - 计算转化率：`SHARE_CARD_EXPORT / SHARE_VARIANT` 按 variant 分桶对比
3. 漏斗推荐路径：`page_view` → `SHARE_VARIANT` → `SHARE_CARD_EXPORT`，按 `share_variant` 维度切片观察。

### 7.4 收量与停止实验的判断

- **最低收量门槛**：建议在累计 ≥ **1000 次 `SHARE_CARD_EXPORT`** 后再判断显著性，避免小样本噪声。
- **统计显著性**：可用双比例 Z 检验（`p < 0.05`）判断 A、B 两组导出率差异是否显著；样本不足时继续累积。
- **停止条件**（任一即可）：
  - 显著性达成（`p < 0.05`），且优胜方导出率提升 ≥ 10%（业务相关性阈值）。
  - 跑满 14 天 + 样本充足，但仍无显著差异 → 视为打平，可保留默认 variant 或合并发车。
  - 出现明显异常（如某 variant 导致跳出率飙升），可立即停止并回退。
- **下线方式**：直接将 `composables/useShare.ts` 中 `getShareVariant()` 改为固定返回胜出方（如 `return 'A'`），并在 i18n 中清理 loser 文案命名空间。

---

## 8. 矩阵互导（KickIQ）

WorldCupDex 与姊妹站 **KickIQ**（`https://kickiq.app`）作为同一套足球赛事矩阵产品互相导流。WorldCupDex 以「2026 世界杯」为主题拉新，KickIQ 以「AI 出题 + 朋友 PK」为长周期留存能力，两者通过页面后置 CTA 按钮交换流量。

### 8.1 点击事件参数 schema

| 事件名                | 常量                            | 参数                                                       |
|---------------------|---------------------------------|------------------------------------------------------------|
| `cross_site_click`  | `AnalyticsEvents.CROSS_SITE_CLICK` | `{ source: 'quiz_result' \| 'fan_card_result', target: 'kickiq' }` |

- `source`：点击发生的页面上下文，取值与 CTA 部署位置一一对应：
  - `quiz_result`：`pages/quiz/result.vue`（订阅表单下方）
  - `fan_card_result`：`pages/fan-card/result.vue`（分享面板下方）
- `target`：仅 `'kickiq'`。后续若接入其他矩阵站（如 `'rocodex'` 等）可复用同一事件，只需伸展 `target` 取值。

上报调用位于 [`components/KickiqCta.vue`](../components/KickiqCta.vue)，点击同时会同步在新标签页以 `noopener,noreferrer` 打开目标 URL。

### 8.2 UTM 参数规范

跨站跳转统一携带下列 UTM 参数，便于 KickIQ 侧 GA4 / 后台同口径汇总流量：

| 参数             | 取值                                  | 说明                                              |
|------------------|---------------------------------------|--------------------------------------------------|
| `utm_source`     | `worldcupdex`                         | 流量发送方站点标识，固定为本站。              |
| `utm_medium`     | `cross_site`                          | 渠道类型，统一为矩阵互导，与邮件 / 广告 / 社媒区分。 |
| `utm_campaign`   | `worldcup2026`                        | 营销活动 / 主题标识，当前以 2026 世界杯为唯一活动。 |
| `utm_content`    | `quiz_result` \| `fan_card_result`    | 与 `cross_site_click` 的 `source` 参数保持一致，用于区分点击入口。 |

示例完整 URL：

```
https://kickiq.app/?utm_source=worldcupdex&utm_medium=cross_site&utm_campaign=worldcup2026&utm_content=quiz_result
```

> KickIQ 如后续接入多个落地页（如 `/quiz`、`/battle`），URL 路径可调，UTM 参数集以本章为准，勿增减字段。

### 8.3 反向回链（TODO：需 KickIQ 端配合）

本任务仅完成 WorldCupDex → KickIQ 的单向导流。反向从 KickIQ 回链 WorldCupDex **需对方站点配合接入**，后续需交互跳转后才能闭环。后续协调要点：

- KickIQ 需在结果页 / 个人页加上以 `utm_source=kickiq&utm_medium=cross_site&utm_campaign=worldcup2026&utm_content=<source>` 回链 `https://worldcupdex.org`。
- 双方在 GA4 后台同步创建「矩阵互导」漏斗：`page_view` → `cross_site_click` → 对站 `page_view`，依据 UTM 切片评估跨站留存。
- 后续接入更多矩阵站时，本文档需同步补充 `target` 取值枚举，保持事件参数 schema 可枚举。

