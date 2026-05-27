# WorldCupDex 线上问题修复执行清单

日期：2026-05-27  
依据文档：`docs/WorldCupDex全站调研报告-2026-05-27.md`  
执行原则：**一项一项修复，每完成一项必须测试通过，再进入下一项。**

## 执行总原则

每一项都按同一个闭环执行：

1. 定位问题原因。
2. 做最小范围修复。
3. 本地构建或静态检查。
4. 线上/本地浏览器回归验证。
5. 记录结果。
6. 通过后再进入下一项。

禁止同时改多个互相无关的问题。尤其是路由、部署、移动端样式、SEO 内容这几类，不要混在一个改动里。

## 优先级总览

| 顺序 | 优先级 | 事项 | 为什么先做 | 通过后解锁 |
| --- | --- | --- | --- | --- |
| 1 | P0 | 修复 Quiz Start Challenge Loading | 直接阻断核心互动转化 | Quiz 可继续做结果页/分享验证 |
| 2 | P0 | 修复 Nuxt `_payload.json` 预取/重定向异常 | 影响客户端跳转、控制台健康、潜在白屏 | 可稳定测试站内导航 |
| 3 | P0 | 确认并修复线上 `/api/*` 404 | 数据接口策略不清，后续功能有隐患 | 可明确生产部署模型 |
| 4 | P1 | 修复 `/schedule`、`/teams` hydration mismatch | SSR/客户端不一致，可能导致交互不稳 | 可继续做样式和体验优化 |
| 5 | P1 | 修复 Blog 封面图 404 | 影响内容可信度，修复成本低 | Blog 可进入 SEO 优化 |
| 6 | P1 | 移动端首页首屏重排 | 手机流量核心入口，当前奖杯/浮窗遮挡 | 首页主路径可优化 |
| 7 | P1 | 移动端赛程筛选区重排 | 赛程是核心工具，当前 tab 溢出 | 赛程可做“我的球队”入口 |
| 8 | P1 | 预测页移动端首屏压缩 | 预测工具入口被 hero 消耗 | 预测转化路径更短 |
| 9 | P1 | 首页定位与主路径收敛 | 当前功能多但动作不够聚焦 | 可以开始增长实验 |
| 10 | P2 | 数据来源与更新时间展示 | 增强工具站可信度 | SEO 和用户信任提升 |
| 11 | P2 | 程序化 SEO 页面规划 | 长尾流量基础 | 后续内容生产自动化 |
| 12 | P2 | 商业化位重排 | 把广告/联盟推荐贴近情绪动作 | 变现测试 |

---

## 1. 修复 Quiz Start Challenge Loading

**目标**  
用户从 `/quiz` 点击 `Start Challenge` 后，必须稳定进入题目页，而不是停在 Loading。

**已知现象**  
自动化点击后进入 `https://worldcupdex.org/quiz/play`，页面停在 Loading。直接访问 `https://worldcupdex.org/quiz/play/` 正常。

**怀疑原因**  
生产环境存在 trailing slash 规范化：`/quiz/play` 308 到 `/quiz/play/`。客户端导航、payload 预取或 route path 与部署端规范不一致。

**涉及文件**

- `pages/quiz/index.vue`
- `pages/quiz/play.vue`
- `nuxt.config.ts`
- 可能涉及 i18n localePath 生成规则

**执行步骤**

1. 检查 `pages/quiz/index.vue` 中 `handleStart()` 的跳转路径。
2. 检查生产环境是否统一对页面路由追加 trailing slash。
3. 将 Quiz 跳转路径统一为生产可用路径。
4. 检查其他入口是否也跳到 `/quiz/play`。
5. 若 Nuxt 配置中存在 trailing slash 相关设置，统一站点策略，不做局部 hack。

**测试方法**

- 本地：点击 `/quiz` 的 Start Challenge。
- 线上：部署后访问 `https://worldcupdex.org/quiz`，点击 Start Challenge。
- 命令：`curl -I https://worldcupdex.org/quiz/play` 与 `curl -I https://worldcupdex.org/quiz/play/`。
- 浏览器：截图题目页，确认出现 `Question 1/5` 和选项。

**通过标准**

- 点击 Start Challenge 后 2 秒内进入题目页。
- URL 最终稳定，不反复重定向。
- 控制台无 Quiz 相关 payload 失败。
- 直接访问 `/quiz/play` 和 `/quiz/play/` 至少有一个规范入口，另一个能正确跳转。

### 执行记录

- 执行日期：2026-05-27
- 修改文件：`pages/quiz/index.vue`、`pages/quiz/result.vue`
- 修复说明：将 Quiz 首页 `Start Challenge` 入口改为 canonical `/quiz/play/` 普通链接，避免 Nuxt 客户端跳转命中生产环境 `/quiz/play` 到 `/quiz/play/` 的 308 规范化后卡在 Loading；同步将结果页 `Play Again` 改为带 trailing slash 的整页跳转。
- 本地测试：通过。`http://127.0.0.1:3000/quiz` 点击 Start Challenge 后进入 `http://127.0.0.1:3000/quiz/play/`，页面出现 `Question 1/5`、倒计时和选项，未出现 Loading，浏览器未捕获 4xx 资源错误。
- 构建测试：`npm run build` 等待约 7 分钟仍未完成，已停止卡住进程；后续需单独排查构建耗时/卡住原因，不阻塞本项功能验证。
- 截图/日志：`reports/item-1-quiz-fix/local-quiz-after-start-final.png`，dev server 日志在 `reports/item-1-quiz-fix/`。
- 线上测试：待部署后复测 `https://worldcupdex.org/quiz` 点击入口；当前修复与线上已验证可用的 `https://worldcupdex.org/quiz/play/` 保持一致。
- 结果：本地通过，待部署后线上复测。
- 后续风险：站点仍存在独立的 Nuxt payload/redirect 问题，应按第 2 项继续处理。

---

## 2. 修复 Nuxt `_payload.json` 预取/重定向异常

**目标**  
消除 `_payload.json` 被重定向到 HTML 页面、客户端按 JSON 解析失败的问题。

**已知现象**

- 首页控制台出现：`Cannot load payload /matches/_payload.json?... Unexpected token '<'`
- `curl -I https://worldcupdex.org/matches/_payload.json?...` 返回 301 到 `/schedule`

**怀疑原因**

- 页面路由 `/matches` 与实际页面 `/schedule` 存在重定向，但 Nuxt 仍预取 `/matches/_payload.json`。
- 站点历史路由、导航 label、routeRules 或部署重写规则不一致。

**涉及文件**

- `layouts/default.vue`
- `pages/matches/index.vue`
- `pages/schedule/index.vue`
- `nuxt.config.ts`
- 可能涉及 Cloudflare Pages `_redirects` 或部署配置

**执行步骤**

1. 梳理所有导航和链接里 `/matches` 与 `/schedule` 的使用。
2. 确认是否需要保留 `/matches` 页面。
3. 如果 `/matches` 只是旧入口，改为服务端/静态层明确 redirect，并避免 NuxtLink 预取其 payload。
4. 如果 `/matches` 应该存在，则补齐页面 payload，避免跳到 `/schedule`。
5. 检查其他 `_payload.json` warning，如 `/predict/*`、`/teams`、`/blog`。

**测试方法**

- 运行线上审计脚本：`node reports/live-audit-2026-05-27.mjs`
- 浏览器检查首页、赛程、预测、博客控制台。
- 命令检查：
  - `curl -I https://worldcupdex.org/matches/_payload.json?...`
  - `curl -I https://worldcupdex.org/schedule/_payload.json?...`

**通过标准**

- 首页不再出现 `Unexpected token '<'` payload warning。
- 站内导航不产生 payload 解析失败。
- 老路由如果保留重定向，不破坏客户端预取。

### 执行记录

- 执行日期：2026-05-27
- 修改文件：`pages/index.vue`、`nuxt.config.ts`、`pages/matches/index.vue`
- 修复说明：将首页“View All Matches / 查看全部赛程”入口从 `/matches` 统一改为 `/schedule`；删除 Nuxt 页面级 `/matches` redirect，避免 NuxtLink 将它当作可预取页面生成 `/matches/_payload.json`；在 `routeRules` 中保留 `/matches`、`/es/matches`、`/zh/matches` 的显式 301 redirect，兼容旧入口。
- 本地测试：通过。`http://127.0.0.1:3000/` 首页没有 `/matches` 链接；网络请求没有 `/matches/_payload.json`；直接访问 `/matches` 跳转到 `/schedule/`。
- 构建测试：通过。`npm run build` 成功完成；构建日志仍有既有的 i18n 缺失 key warning，与本项无关。
- 产物验证：通过核心项。`http://127.0.0.1:3001/matches` 301 到 `/schedule/`；`/matches/_payload.json?test` 返回 JSON 404，不再重定向成 HTML。预览服务本身存在本地 asset MIME/404 噪音，未影响本项 redirect/payload 验证。
- 截图/日志：`reports/item-2-payload-fix/home-after-payload-fix.png`、`reports/item-2-payload-fix/matches-redirect-schedule.png`、`reports/item-2-payload-fix/preview-home-after-payload-fix.png`。
- 线上测试：待部署后复测 `https://worldcupdex.org/` 控制台和 `https://worldcupdex.org/matches/_payload.json?...`。
- 结果：本地与构建通过，待部署后线上复测。
- 后续风险：`/api/matches` 等生产 API 404 仍属于第 3 项；本项只修复 `/matches` 旧路由引发的 payload 预取异常。

---

## 3. 确认并修复线上 `/api/*` 404

**目标**  
明确生产环境到底是纯静态站，还是 Nitro API 站。当前 `/api/matches`、`/api/teams`、`/api/venues` 返回 404，必须做出一致决策。

**已知现象**

- `https://worldcupdex.org/api/matches` 404
- `https://worldcupdex.org/api/teams` 404
- `https://worldcupdex.org/api/venues` 404
- 页面首屏仍可显示，说明主要依赖 prerender payload 或静态数据。

**决策分支**

方案 A：保留 API  
适合后续需要投票、AI 预测、数据实时更新。

方案 B：纯静态部署  
适合 Cloudflare Pages 静态输出，所有读取改为 JSON/payload。

**涉及文件**

- `server/api/**`
- `nuxt.config.ts`
- `wrangler.toml`
- `composables/useMatches.ts`
- `composables/useTeams.ts`
- `composables/useVenues.ts`

**执行步骤**

1. 确认 Cloudflare Pages 当前构建产物是 `.output/public` 还是 SSR worker。
2. 检查 `wrangler.toml` 与 Cloudflare Pages framework preset。
3. 如果选择 API，修复 Nitro preset/functions 输出。
4. 如果选择纯静态，改 composables，避免客户端请求 `/api/*`。
5. 更新 `robots.txt` 中 `/api/` 策略，使其与实际部署一致。

**测试方法**

- `curl -I https://worldcupdex.org/api/matches`
- 页面刷新 `/schedule`、`/teams`、`/fan-card`。
- 断网/慢网模拟时确认数据不会空白。

**通过标准**

- 生产 API 策略清晰。
- 如果保留 API，核心接口返回 200。
- 如果纯静态，页面不再依赖 404 API。
- 控制台无 `/api/*` 相关失败。

### 执行记录

- 执行日期：2026-05-27
- 决策：选择方案 B，生产环境按纯静态数据站处理。`data/` 由 `.github/workflows/cron-data.yml` 定时任务更新并提交，前端页面不应在运行时依赖 `/api/matches`、`/api/teams`、`/api/venues`。
- 修改文件：`composables/useStaticWorldCupData.ts`、`composables/useMatches.ts`、`composables/useTeams.ts`、`composables/useVenues.ts`、`composables/useFanCard.ts`、`composables/useQuiz.ts`、`pages/fan-card/index.vue`、`pages/fan-card/result.vue`、`pages/predict/index.vue`、`pages/predict/champion.vue`、`pages/predict/[id].vue`、`nuxt.config.ts`。
- 修复说明：新增静态数据访问层，直接从 `data/matches.json`、`data/teams.json`、`data/venues.json`、`data/teams/*.json` 读取数据，并复用原 API 的过滤/分页/详情逻辑；移除前端对 `/api/matches`、`/api/teams`、`/api/venues` 的运行时调用；删除 `nuxt.config.ts` 中这些 API 的 SWR 规则，避免误导部署策略。
- 静态检查：通过。`rg` 确认 `pages`、`components`、`composables`、`nuxt.config.ts` 中已无 `/api/matches`、`/api/teams`、`/api/venues` 调用。
- 构建测试：通过。`npm run build` 成功完成；仍有既有的西语 i18n 缺失 key warning，与本项无关。
- 浏览器测试：通过。访问 `/`、`/schedule`、`/teams`、`/teams/argentina`、`/predict`、`/predict/champion`、`/fan-card`、`/quiz`、`/quiz/play/`，均无 `/api/matches`、`/api/teams`、`/api/venues` 网络请求，页面数据正常显示。
- 截图/日志：`reports/item-3-static-data-fix/`。
- 线上测试：待部署后复测核心页面 Network/Console，并确认线上 `/api/*` 404 不再影响页面。
- 结果：本地与构建通过，待部署后线上复测。
- 后续风险：`/api/vote`、`/api/track-affiliate` 等交互/追踪接口仍是独立问题，不属于本项静态数据读取；`/schedule`、`/teams` 仍有 hydration mismatch，按第 4 项继续处理。

---

## 4. 修复 Hydration Mismatch

**目标**  
消除 `/schedule`、`/teams` 的 `Hydration completed but contains mismatches.`。

**怀疑原因**

- SSR 和客户端时间格式不一致。
- `Date.now()`、本地时区、localStorage、随机数、ClientOnly 边界处理不一致。
- i18n locale 初始化与 SSR 输出不一致。

**涉及文件**

- `pages/schedule/index.vue`
- `pages/teams/index.vue`
- `components/AddToCalendarButton.vue`
- `composables/useFavorites.ts`

**执行步骤**

1. 在本地 dev/preview 下复现 hydration warning。
2. 优先检查日期和时区格式。
3. 将依赖浏览器环境的内容包进 `ClientOnly` 或 mounted 后再渲染。
4. 确保 SSR placeholder 与客户端首帧结构一致。

**测试方法**

- Chrome 控制台打开 `/schedule`、`/teams`。
- 运行线上审计脚本。
- 桌面和移动端各测一次。

**通过标准**

- `/schedule`、`/teams` 控制台无 hydration mismatch。
- 页面首屏无明显闪动。
- 收藏、筛选、时区切换仍正常。

**执行记录（2026-05-27）**

- 已完成：将 `composables/useFavorites.ts` 的 `localStorage` 读取从客户端 setup 阶段延后到 `onMounted`，避免 SSR 首屏无收藏按钮、客户端首轮渲染已有收藏按钮导致 DOM 不一致。
- 构建验证：`npm run build` 通过；仍存在西语 i18n 缺失 key 的既有警告，非本项引入。
- 浏览器验证：Playwright 桌面访问 `/schedule`、`/teams`、`/teams/argentina`，预置收藏数据后均无 `Hydration` / `mismatch` 日志。
- 移动端验证：390x844 访问 `/schedule`、`/teams`，无 hydration 日志、无失败请求。
- 验证截图：`reports/item-4-hydration-fix/schedule.png`、`reports/item-4-hydration-fix/teams.png`、`reports/item-4-hydration-fix/mobile-schedule.png`、`reports/item-4-hydration-fix/mobile-teams.png`。

---

## 5. 修复 Blog 封面图 404

**目标**  
博客卡片不再显示破图。

**涉及文件**

- `content/en/blog/*.md`
- `content/zh/blog/*.md`
- `pages/blog/index.vue`
- `public/images/blog/**`

**执行步骤**

1. 找到文章 frontmatter 中的 cover/image 字段。
2. 补齐缺失图片：
   - `/images/blog/favorites.jpg`
   - `/images/blog/format-change.jpg`
   - `/images/blog/host-cities-cover.jpg`
3. 或改为已存在图片。
4. 给博客卡片增加 fallback image。

**测试方法**

- `curl -I https://worldcupdex.org/images/blog/favorites.jpg`
- 浏览器打开 `/blog`。
- 移动端检查博客卡片。

**通过标准**

- 三张图片线上 200。
- `/blog` 无 404 控制台错误。
- 卡片视觉完整。

---

## 6. 移动端首页首屏重排

**目标**  
让手机用户在首屏清楚看到：赛事主题、倒计时、主 CTA，不被奖杯和浮窗遮挡。

**当前问题**

- 奖杯图压到倒计时和按钮区域。
- Discord 浮动按钮遮挡 Upcoming Matches 卡片。
- 首屏信息密度高但行动路径不够清楚。

**涉及文件**

- `pages/index.vue`
- `components/DraggableDiscord.vue`
- `assets/css/main.css`

**执行步骤**

1. 移动端降低奖杯图尺寸或隐藏一部分。
2. CTA 改成垂直/紧凑布局，避免两个按钮互相挤压。
3. Discord 浮窗移动端延迟出现、缩小，或避开内容区。
4. 确保 Upcoming Matches 标题与第一张卡不被遮挡。

**测试方法**

- 390x844、430x932 两个移动宽度截图。
- 点击 Start Predicting、View Schedule。
- 检查 Discord 浮窗拖拽或关闭能力。

**通过标准**

- 首屏无遮挡。
- 两个 CTA 都可点击。
- 第一张比赛卡不被 Discord 挡住核心内容。

---

## 7. 移动端赛程筛选区重排

**目标**  
赛程页移动端筛选器可完整使用，不横向裁切。

**当前问题**

`All Matches / Group Stage / Knockout / My Schedule` 在 390px 下右侧被裁切。

**涉及文件**

- `pages/schedule/index.vue`

**执行步骤**

1. 将 stage tabs 改成横向可滚动 segmented control，并显示滚动 affordance。
2. 或改成两行网格。
3. 筛选 dropdown 统一全宽。
4. 保证 Export Schedule 不挤压筛选器。

**测试方法**

- 390px、430px 移动截图。
- 逐个点击 All / Group / Knockout / My Schedule。
- 切换 Venue Time / My Time。

**通过标准**

- 所有筛选项可见或可明显滚动访问。
- 无文本裁切。
- 筛选结果正常变化。

---

## 8. 预测页移动端首屏压缩

**目标**  
移动端进入 `/predict` 后，尽快看到“冠军预测 / 单场预测 / Upcoming Matches”。

**当前问题**

Hero 背景和两张入口卡占据过多高度，具体比赛下沉。

**涉及文件**

- `pages/predict/index.vue`

**执行步骤**

1. 移动端压缩 hero 高度。
2. 两个入口卡改为紧凑横条或 2 列小卡。
3. Upcoming Matches 上移。
4. 保留视觉资产，但不要牺牲工具入口。

**测试方法**

- 移动端截图。
- 点击 Tournament Winner。
- 点击 Match Prediction。
- 点击第一场 Make Pick。

**通过标准**

- 390px 首屏内能看到至少一个核心预测入口。
- 滚动一屏内能看到具体比赛。
- 跳转正常。

---

## 9. 首页定位与主路径收敛

**目标**  
首页从“功能展示”改为“完成球迷核心动作”：选主队、看赛程、做预测、分享。

**建议主路径**

1. Choose your team。
2. Build my schedule。
3. Make a prediction。
4. Generate/share fan card。

**涉及文件**

- `pages/index.vue`
- `components/MatchCard.vue`
- `components/TeamCard.vue`
- `components/FanCardPreview.vue`

**执行步骤**

1. 首页首屏文案改为第二屏工具箱定位。
2. 增加“选择主队”入口。
3. 首页赛程优先展示用户主队/热门球队赛程。
4. 降低 Ad Space 的视觉打断。

**测试方法**

- 新用户首次访问。
- 已收藏球队用户访问。
- 移动端和桌面端截图。

**通过标准**

- 用户 10 秒内理解站点用途。
- 首页主 CTA 不超过两个。
- 收藏/预测/分享路径更短。

---

## 10. 数据来源与更新时间展示

**目标**  
增强工具站可信度。

**涉及页面**

- `/schedule`
- `/teams`
- `/teams/[id]`
- `/predict/[id]`
- `/data`

**执行步骤**

1. 统一设计 `DataSourceNote` 组件。
2. 展示 source、lastUpdated、是否 AI-generated。
3. 对预测内容明确标注娱乐/非博彩/非官方。
4. 增加错误反馈入口。

**测试方法**

- 抽查核心页面。
- 检查移动端不占过多空间。
- 检查 SEO 文案不过度堆砌。

**通过标准**

- 用户能看到数据更新时间。
- AI 预测与官方数据边界清晰。

---

## 11. 程序化 SEO 页面规划

**目标**  
建立世界杯长尾流量页面矩阵。

**页面清单**

- `/teams/{team}/schedule`
- `/matches/{home}-vs-{away}`
- `/host-cities/{city}`
- `/world-cup-2026-time-in-{country}`
- `/predictions/{team}-world-cup-2026`

**执行步骤**

1. 先选 1 个模板试点，不同时做全部。
2. 定义数据来源和模板结构。
3. 生成 sitemap。
4. 检查 canonical、hreflang、OG。

**测试方法**

- Rich Results 抽查。
- Sitemap 包含新页面。
- 页面无薄内容。

**通过标准**

- 每页有独立搜索意图。
- 每页有可用工具或数据，不只是 AI 文案。

---

## 12. 商业化位重排

**目标**  
把广告/联盟推荐放在用户情绪峰值，而不是普通页面中间。

**建议位置**

- Fan Card 结果页：球队球衣。
- 预测结果页：主客队周边。
- 加入日历后：观赛装备。
- 主队页面：官方球衣/围巾。

**执行步骤**

1. 先优化 Fan Card 结果页转化位。
2. 再优化预测结果页。
3. 最后处理通用 Ad Space。

**测试方法**

- 点击 affiliate 链接。
- 检查 `rel="nofollow sponsored noopener"`。
- 检查 disclosure 是否可见。

**通过标准**

- 不影响核心功能。
- 合规披露清楚。
- 点击 tracking 正常。

---

## 每项完成后的记录模板

复制下面模板到本文件对应事项下方，或新建执行日志。

```md
### 执行记录

- 执行日期：
- 修改文件：
- 修复说明：
- 本地测试：
- 线上测试：
- 截图/日志：
- 结果：通过 / 未通过
- 后续风险：
```
