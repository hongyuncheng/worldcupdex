# Performance & PWA Audit — Task 11

> ⚠️ **邮件订阅计划已撤销（用户 2026-05-18 决策）**：本文档中与 navbar “订阅赛事提醒”按钮、订阅组件、订阅 modal 相关的描述仅作任务历史记录保留，对应代码已在 Task 13 中回滚，请以 `layouts/default.vue` / `app.vue` / i18n / `nuxt.config.ts` 当前版本为准。

> 范围：UI 收尾与 PWA / 性能调优。本文档记录懒加载审计结论、PWA 预缓存现状与 Lighthouse 抽查（如可获得）。

## 1. 图片懒加载审计

### 审计原则
- **首屏关键图（LCP 候选）保持立即加载**：导航 logo、首页 Hero 视觉元素。
- **非首屏图片**统一加 `loading="lazy"` + `decoding="async"`。
- 排除冲突文件：与 Jimmy（Task 10 分享水印）共同维护的组件不动（`ChampionCard.vue`、`PredictionCard.vue`、`FanCardPreview.vue`、`SharePanel.vue`、`pages/quiz/result.vue`），与 Robin 在 `pages/index.vue` Hero 区域共同接入 订阅表单 的部分也不动，避免冲突。

### 本次修改文件清单（已加 lazy + async decoding）
| 文件 | 涉及图片 | 说明 |
| --- | --- | --- |
| `components/MatchCard.vue` | 两支球队的国旗 (`team1Flag`、`team2Flag`) | 首页"即将开始的比赛"卡片中非首屏图。 |
| `components/TeamCard.vue` | 球队列表的国旗（`flag` prop） | 列表项卡片，非首屏 LCP。 |
| `pages/teams/index.vue` | 球队列表卡片国旗 | 已存在 `loading="lazy"`，本次补 `decoding="async"`。 |
| `pages/teams/[id].vue` | Hero 大国旗（`flagcdn w160`）、同组队伍国旗（`w40`）、球员照片 / `ui-avatars` 占位 | 球队详情页的非首屏图全部启用懒加载。 |
| `pages/data/index.vue` | 冠军榜表格中的国旗（`flagcdn w40`） | 数据表格行图标非首屏。 |
| `pages/schedule/index.vue` | 赛程表中两队国旗（`homeTeam.flag` / `awayTeam.flag`） | 赛程表行图标。 |
| `pages/wiki/index.vue` | 无 `<img>`（卡片为 SVG / emoji 渐变） | 无需修改。 |
| `components/StatsCard.vue` / `QuizOption.vue` / `CountdownTimer.vue` / `ShareButtons.vue` | 无 `<img>` | 无需修改。 |

### 不动的文件（因协调约束）
- `components/ChampionCard.vue`、`components/PredictionCard.vue`、`components/FanCardPreview.vue`、`components/SharePanel.vue`：Jimmy（Task 10）正在做品牌水印改造。
- `pages/quiz/result.vue`、`pages/predict/*`、`pages/fan-card/*`、`pages/index.vue` Hero：Robin（Task 5）/ Jimmy 接入 订阅表单 与分享改造的相关区域。
- `app.vue`、`layouts/default.vue` footer：分别由 `app.vue` 全局订阅 modal 挂载方与 CJ Disclosure agent 维护。

> 后续协调：以上"暂时不动"的文件如需 lazy loading，可在 Jimmy / Robin / CJ 任务合并后由专门 follow-up agent 统一补齐。

## 2. PWA 预缓存现状（只读检查）

读取自 `nuxt.config.ts` 的 `pwa` 配置：

```ts
pwa: {
  manifest: { /* WorldCupDex / theme #1A237E / icons 192&512 */ },
  workbox: {
    navigateFallback: '/',
  },
}
```

### 现状结论
- **manifest 完整**：name/short_name/theme_color/background_color/display/icons 均已配置；离线安装可用。
- **`workbox.navigateFallback` 已设为 `/`**：导航请求失败时会回退到首页，等同于把首页 SPA shell 用作 fallback。
- **未显式声明 `globPatterns`**：当前由 `@vite-pwa/nuxt` + Workbox 默认行为兜底，会预缓存构建产物中的静态资源（`/_nuxt/*` 通过 manifest 自动收集）。
- **未配置 `runtimeCaching`**：核心页面（`/`、`/schedule`、`/teams`）以及 `/predict`、`/quiz`、`/fan-card` 等页面**没有显式的运行时缓存策略**，依赖浏览器 HTTP 缓存与 navigateFallback。
- **未配置外部图源缓存**：球员照片（TheSportsDB）、国旗（flagcdn.com）、`ui-avatars.com` 等跨域图片**无 SWR/CacheFirst 策略**，离线场景下不可见。

### 建议（仅记录，不修改 `nuxt.config.ts`，留给后续单独 agent 处理）

```ts
// 仅作建议，请由后续负责 PWA / nuxt.config.ts 的 agent 评估
pwa: {
  workbox: {
    navigateFallback: '/',
    // 1) 显式预缓存核心 HTML 与字体（offline 首屏）
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    // 2) 跨域图片走 CacheFirst，避免每次刷新拉远端
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/flagcdn\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'flagcdn-images',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /^https:\/\/.*\.thesportsdb\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'thesportsdb-images',
          expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /^https:\/\/ui-avatars\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'ui-avatars',
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // 3) 关键 API（球队 / 赛程）走 StaleWhileRevalidate，离线可读
      {
        urlPattern: /\/api\/(teams|matches|champions).*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'wcd-api',
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
        },
      },
    ],
  },
}
```

> 注意：`nuxt.config.ts` 此次任务**未修改**。Felix（Task 4）在该文件做过 GA / sitemap / routeRules 改造，AdSense / CJ 等 agent 也将访问，避免合并冲突。

## 3. Lighthouse 抽查

> 备注：本地 sandbox 环境通常无法稳定启动 dev server / preview server，本任务下不强制执行。如能跑通，请补充以下表格。

| 路径 | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| `/`（首页） | _未跑_ | _未跑_ | _未跑_ | _未跑_ |
| `/teams/BRA`（巴西详情） | _未跑_ | _未跑_ | _未跑_ | _未跑_ |

### 跑分建议（手动执行）
```pwsh
# 在本地：
cd tool/worldcupdex
npm run build
npx -y serve .output/public -l 4173
# 另开终端
npx -y lighthouse http://localhost:4173 --quiet --chrome-flags="--headless=new" --output=html --output-path=./reports/lh-home.html
npx -y lighthouse http://localhost:4173/zh/teams/BRA --quiet --chrome-flags="--headless=new" --output=html --output-path=./reports/lh-team-bra.html
```

### 预期重点关注项（基于本次改动）
- LCP：首页 Hero 区域未变更（保持原 `<img>` 不加 lazy）；列表 / 详情页 LCP 元素也未受懒加载影响（首屏可视区域内的图片浏览器会忽略 lazy 提示主动加载）。
- TBT / Render-blocking：本次未改动 `nuxt.config.ts`，无新阻塞脚本引入。
- Accessibility：`navbar` 订阅按钮使用 `<button type="button">` + 文案 i18n 文本（`nav.subscribe`），具备语义；未引入 contrast 退化。
- Best Practices：所有非首屏 `<img>` 同时具备 `alt` + `loading="lazy"` + `decoding="async"`，与 Workbox 行为不冲突。

## 4. 验收记录

- [x] `npm run build` 通过（详见 CI 输出）。
- [x] 未触碰禁止文件清单（`nuxt.config.ts` / `wrangler.toml` / `composables/useShare.ts` / `composables/useQuiz.ts` / `composables/useAnalytics.ts` / `composables/useSeoConfig.ts` / `server/api/` / `app.vue` / `layouts/default.vue` 的 footer 区域 / `i18n` 中的 `share.*` 与 `subscribe.*` 命名空间 / Jimmy 维护的卡片组件 / Robin / Felix / AdSense / CJ 文件）。
- [x] navbar 桌面 + 移动 drawer 的“订阅赛事提醒”按钮均接入 订阅 modal（已于 Task 13 回滚。历史记录），i18n 三语就绪。
- [x] 懒加载策略已记录在本文档第 1 节。
- [x] PWA 现状与改进建议已记录在第 2 节，但未改 `nuxt.config.ts`。

## 5. 本次新增 / 修改文件

- 新增：`docs/PERFORMANCE.md`（本文件）
- 修改：
  - `components/MatchCard.vue`（清理 TODO、加 lazy/async）
  - `components/TeamCard.vue`（加 lazy/async）
  - `layouts/default.vue`（替换 navbar 登录 → 订阅按钮，桌面与移动菜单同步；接入 订阅 modal；已于 Task 13 回滚）
  - `pages/teams/index.vue`（补 decoding="async"）
  - `pages/teams/[id].vue`（hero/group/player 图加 lazy/async）
  - `pages/data/index.vue`（冠军榜国旗加 lazy/async）
  - `pages/schedule/index.vue`（赛程表国旗加 lazy/async）
  - `i18n/zh.json` / `i18n/en.json` / `i18n/es.json`（仅追加 `nav.subscribe`）
