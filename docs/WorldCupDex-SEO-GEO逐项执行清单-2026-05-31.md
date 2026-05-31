# WorldCupDex SEO / GEO 逐项执行清单

制定日期：`2026-05-31`  
适用站点：<https://worldcupdex.org/>  
执行方式：**一次只执行一项。每项完成后必须核查、记录结果，并由人工确认通过，才能进入下一项。**

依据文档：

- `docs/WorldCupDex-SEO-GEO调研与优化建议-2026-05-31.md`
- `docs/SEO-GEO-Action-Plan.md`

## 1. 执行原则

### 1.1 闸门规则

每个事项都必须完成以下闭环：

1. 执行前记录当前状态。
2. 只修改该事项涉及的文件。
3. 运行静态检查。
4. 运行构建测试。
5. 在本地预览环境验证。
6. 部署后进行线上复查。
7. 填写执行记录。
8. 人工确认通过。
9. 再开始下一项。

没有通过时：

- 不进入下一项。
- 不混入其他优化。
- 先定位失败原因。
- 必要时回滚本项修改。

### 1.2 工作区保护

开始每项前执行：

```powershell
git status --short
```

要求：

- 记录已有修改。
- 不覆盖与本项无关的用户改动。
- 不使用 `git reset --hard`。
- 不使用 `git checkout --` 撤销不属于本项的文件。

### 1.3 通用验证命令

每项按需使用：

```powershell
npm run build
```

```powershell
git diff --stat
```

```powershell
git diff -- <涉及文件>
```

部署后按需使用：

```powershell
curl.exe -I https://worldcupdex.org/
```

```powershell
curl.exe -s https://worldcupdex.org/sitemap.xml
```

### 1.4 优先级定义

| 优先级 | 含义 |
| --- | --- |
| `P0` | 数据错误、索引错误或结构化数据错误，优先处理 |
| `P1` | 明显影响 SEO / GEO 效果，应在扩展内容前完成 |
| `P2` | 增长扩展，建立在 P0 与 P1 已通过的基础上 |

## 2. 总览

| 顺序 | 优先级 | 事项 | 核心目标 |
| ---: | --- | --- | --- |
| 1 | P0 | 建立数据状态模型 | 区分官方、临时、不完整、预测数据 |
| 2 | P0 | 增加数据一致性校验脚本 | 防止错误分组和错误名单进入生产 |
| 3 | P0 | 自动化数据更新时间 | 页面不再显示写死的过期日期 |
| 4 | P0 | 修正球队叙事事实错误 | 移除错误赛制描述和无来源概率 |
| 5 | P0 | 修复首页多语言 SEO | 默认英文路径输出英文 Meta |
| 6 | P0 | 修复 Blog canonical | 英文博客 canonical 指向真实公开路径 |
| 7 | P0 | 修复 Blog hreflang | 只输出真实存在的翻译页 |
| 8 | P0 | 修复 Schema Logo | 结构化数据引用真实可访问图片 |
| 9 | P0 | 补齐默认 OG 图片 | 分享卡片不再引用缺失资源 |
| 10 | P0 | 处理 SearchAction | 接通真实搜索或移除错误声明 |
| 11 | P1 | 审计 URL 与尾斜杠策略 | 先理解生产行为，再决定规范 URL |
| 12 | P1 | 实施 URL 收敛 | 统一 canonical、内部链接、sitemap 与 301 |
| 13 | P1 | 显式配置 AI 搜索爬虫 | 允许 ChatGPT Search 抓取，单独决定训练抓取 |
| 14 | P1 | 增加 BreadcrumbList Schema | 增强页面层级表达 |
| 15 | P1 | 增加 GEO 可引用答案块 | 让球队页和赛程页更易被提取 |
| 16 | P1 | 增强数据来源链接 | 让关键事实可验证 |
| 17 | P1 | 重点球队页优化 | 先提升 France、Spain、Canada、USA |
| 18 | P1 | Blog 可引用性优化 | 增加 TL;DR、更新时间、作者和来源 |
| 19 | P1 | 重新生成 sitemap 并提交 GSC | 让修复后的 URL 进入重新抓取流程 |
| 20 | P1 | 观察期与复盘 | 用 GSC、GA4 和线上抓取验证效果 |
| 21 | P2 | 规划下一轮程序化 SEO | 决定比赛页、城市页和时区页优先级 |

---

## 3. Item 1：建立数据状态模型

优先级：`P0`  
目标：避免将临时名单、不完整名单或预测数据包装成官方最终数据。

### 3.1 背景

当前球队详情数据中的名单人数不统一：

- Spain：`27`
- England：`35`
- Mexico：`12`
- Iran：`18`

世界杯最终名单窗口为 26 人，但名单发布期间允许存在临时状态。不能简单规定“不是 26 人就阻断构建”。

### 3.2 设计要求

为球队数据增加名单状态：

```ts
type SquadStatus = 'official' | 'provisional' | 'incomplete'
```

建议字段：

```json
{
  "squadStatus": "provisional",
  "squadLastUpdated": "2026-05-31",
  "squadSourceUrl": "https://..."
}
```

语义：

| 状态 | 含义 | 页面展示 |
| --- | --- | --- |
| `official` | 已依据官方最终名单确认 | `Official 26-player squad` |
| `provisional` | 临时名单或扩展名单 | `Provisional squad` |
| `incomplete` | 数据尚未补齐 | `Squad data is being updated` |

### 3.3 涉及文件

- `types/index.ts`
- `data/teams/*.json`
- `components/DataSourceNote.vue`
- `composables/useDataSourceMeta.ts`
- `pages/teams/[id]/index.vue`

### 3.4 执行步骤

1. 在类型定义中增加 `SquadStatus`。
2. 为球队详情数据增加状态字段。
3. 对人数为 26 且来源明确的球队标记 `official`。
4. 对人数多于 26 的名单标记 `provisional`。
5. 对人数少于 26 且明显未补齐的名单标记 `incomplete`。
6. 在球队详情页名单标题附近展示状态。
7. 状态展示必须 SSR 可见。
8. 不在本项修改名单内容。

### 3.5 测试方法

```powershell
rg -n '"squadStatus"' data\teams types pages components composables
```

浏览器抽查：

- `/teams/spain`
- `/teams/england`
- `/teams/mexico`
- `/teams/united-states`

### 3.6 通过标准

- 每个球队详情数据都有 `squadStatus`。
- 页面不会将临时名单称为最终名单。
- `official` 状态只用于 26 人且有明确来源的名单。
- SSR HTML 中可以看到名单状态。
- `npm run build` 通过。

### 3.7 执行记录

- 执行日期：`2026-05-31`
- 修改文件：`types/index.ts`、`pages/teams/[id]/index.vue`、`data/teams/*.json`（48 个球队文件）
- 数据结果：`provisional = 27`、`incomplete = 21`、`official = 0`
- 测试结果：通过。48 个 JSON 均包含 `squadStatus`、`squadLastUpdated`、`squadSourceUrl`；缺失字段 `0`；状态规则冲突 `0`；`git diff --check` 无空白错误；生产构建通过。
- SSR 抽查：通过。`/teams/spain` 显示 `Provisional squad`，`/teams/mexico` 显示 `Squad data is being updated`，`/zh/teams/spain` 显示 `临时名单`，`/es/teams/spain` 显示 `Plantilla provisional`；抽查页面均输出更新时间 `2026-05-25`。
- 人工确认：等待确认。
- 备注：本项未修改任何球员名单内容。由于当前没有逐队完成官方最终名单来源确认，暂不使用 `official`。首次构建验收时发现 `.nuxt/cache/nitro/routes` 复用了默认英文球队页旧 HTML；已将旧缓存隔离为 `.nuxt/cache/nitro-routes-item1-stale` 并重新构建，英文 SSR 输出已确认更新。

---

## 4. Item 2：增加数据一致性校验脚本

优先级：`P0`  
目标：在构建前阻止错误分组、数据源冲突和错误官方名单进入生产。

### 4.1 脚本形式

建议新增：

```text
scripts/validate-data.mjs
```

当前项目使用 Node `.mjs` 脚本，不建议新增需要额外执行器的 `.ts` 脚本。

### 4.2 校验规则

阻断构建的错误：

- `data/teams.json` 与 `data/teams/{id}.json` 的 `id`、`group`、`nameEn` 不一致。
- `official` 状态名单人数不是 `26`。
- 球队 ID 重复。
- 球队列表缺少对应详情文件。
- 详情文件缺少列表球队。
- 比赛引用不存在的球队 ID。
- 日期或时间戳无法解析。

只输出 warning，不阻断构建：

- `provisional` 状态名单人数不是 `26`。
- `incomplete` 状态名单人数少于 `26`。
- 缺少球员照片。
- 缺少球员号码。
- 缺少成立年份或场馆信息。

### 4.3 涉及文件

- `scripts/validate-data.mjs`
- `package.json`

### 4.4 执行步骤

1. 编写校验脚本。
2. 增加命令：

```json
"validate-data": "node scripts/validate-data.mjs"
```

3. 暂时不要立即挂到 `prebuild`。
4. 手动运行并整理现有错误。
5. 修完现有阻断错误后，再增加：

```json
"prebuild": "npm run validate-data"
```

### 4.5 测试方法

```powershell
npm run validate-data
```

人为制造一个临时测试错误后验证：

- 列表与详情分组不一致时应失败。
- `official` 名单人数不是 26 时应失败。
- `provisional` 名单不是 26 时只 warning。

完成后恢复测试数据。

### 4.6 通过标准

- 校验脚本能识别错误和 warning。
- 构建前自动运行。
- 当前真实数据可以通过阻断检查。
- 不会因临时名单人数变化阻断构建。
- `npm run build` 通过。

### 4.7 执行记录

- 执行日期：`2026-05-31`
- 新增脚本：`scripts/validate-data.mjs`
- 命令接入：`validate-data = node scripts/validate-data.mjs`；`prebuild = npm run validate-data`
- 当前 warning 数量：`151`
- warning 分类：`incomplete-squad-size = 21`、`provisional-squad-size = 11`、`missing-player-photo = 45`、`missing-player-number = 48`、`missing-venue = 24`、`missing-founded-year = 2`
- 当前 error 数量：`0`
- 测试结果：通过。真实数据校验覆盖 48 支球队、48 个详情文件、104 场比赛；允许尚未确认席位使用 `tbd` 占位符。`node scripts/validate-data.mjs --self-test` 使用内存副本验证：列表与详情分组不一致会失败、`official` 非 26 人会失败、`provisional` 非 26 人只 warning。`git diff --check` 无空白错误；Nuxt 生产构建通过。
- 环境说明：当前 Codex 桌面运行时仅暴露 `node.exe`，没有可调用的 npm CLI，因此本地使用 Node 直接运行校验脚本与 Nuxt 构建入口完成验收；`package.json` 中的 `prebuild` 自动钩子已配置。
- 人工确认：等待确认。

---

## 5. Item 3：自动化数据更新时间

优先级：`P0`  
目标：移除写死的 `2026-05-25`，让页面展示真实更新时间。

### 5.1 设计要求

新增：

```text
data/meta.json
```

建议结构：

```json
{
  "scheduleLastUpdated": "2026-05-31T08:00:00Z",
  "teamsLastUpdated": "2026-05-31T08:00:00Z",
  "squadsLastUpdated": "2026-05-31T08:00:00Z",
  "rankingsLastUpdated": "2026-05-31T08:00:00Z",
  "source": "scheduled-workflow"
}
```

### 5.2 涉及文件

- `data/meta.json`
- `scripts/fetch-worldcup-data.mjs`
- 其他实际更新球队数据的脚本
- `composables/useDataSourceMeta.ts`
- `components/DataSourceNote.vue`

### 5.3 执行步骤

1. 建立 `data/meta.json`。
2. 更新数据同步脚本：只有在成功写入数据后才更新时间。
3. 不允许脚本启动时提前更新时间。
4. `useDataSourceMeta` 改为读取对应字段。
5. 页面继续显示用户友好的日期。
6. 保留 UTC 时间用于调试。

### 5.4 测试方法

```powershell
Get-Content -LiteralPath 'data\meta.json'
```

浏览器抽查：

- `/schedule`
- `/teams`
- `/teams/spain`
- `/data`

### 5.5 通过标准

- 页面不再显示写死日期。
- 各类数据可以展示各自更新时间。
- 同步脚本失败时不会错误刷新时间。
- `npm run build` 通过。

### 5.6 执行记录

- 执行日期：`2026-05-31`
- 新增文件：`data/meta.json`、`scripts/lib/update-data-meta.mjs`
- 页面修改：`composables/useDataSourceMeta.ts`、`components/DataSourceNote.vue`、`pages/data/index.vue`
- 同步脚本修改：`scripts/fetch-worldcup-data.mjs`、`scripts/enrich-data.mjs`、`scripts/fetch-recent-matches.mjs`、`scripts/fetch-player-photos.mjs`、`scripts/retry-missing-photos.mjs`、`scripts/restore-player-photos.mjs`、`scripts/fetch-wikimedia-photos.mjs`
- 门禁修改：`scripts/validate-data.mjs` 增加 `data/meta.json` UTC 时间戳和来源字段校验。
- 测试结果：通过。`meta.json` 按赛程、球队、名单、排名保存独立 UTC 时间；页面不再依赖写死日期；同步 helper 临时文件自测通过；`fetch-worldcup-data.mjs` 在缺少 API key 时退出 `1` 且 `meta.json` 哈希保持不变；9 个 `.mjs` 文件语法检查通过；真实数据校验仍为 `Warnings: 151`、`Errors: 0`；Nuxt 生产构建通过。
- SSR 抽查：通过。`/schedule`、`/teams`、`/teams/spain`、`/data` 均显示用户友好日期 `May 25, 2026`，并保留 `datetime="2026-05-25T00:00:00Z"` 供调试和机器读取。
- 备注：联网数据同步未在本次执行中真实拉取，避免在人工确认前改写现有数据。首次 SSR 抽查时球队详情命中了旧 Nitro 路由缓存；隔离缓存并重新构建后已确认更新。`nuxt.config.ts` 的现有修改不属于本项。
- 人工确认：等待确认。

---

## 6. Item 4：修正球队叙事事实错误

优先级：`P0`  
目标：移除错误赛制描述与无来源概率，避免 AI 搜索引用错误内容。

### 6.1 涉及文件

- `composables/useTeamNarrative.ts`

### 6.2 必须修正

错误描述：

```text
third-placed teams may still qualify via a playoff round
```

改为：

```text
the eight best third-placed teams also advance to the Round of 32
```

中文和西语同步修正。

无来源描述：

```text
teams winning their first group match advance with over 85% probability
```

处理方式二选一：

1. 增加可靠来源、样本范围和计算方法。
2. 改成不带具体概率的定性描述。

推荐先选方式 2。

### 6.3 测试方法

```powershell
rg -n "playoff|85%|third-placed|小组第三|tercer" composables\useTeamNarrative.ts
```

浏览器抽查：

- `/teams/france`
- `/teams/spain`
- `/zh/teams/france`
- `/es/teams/france`

### 6.4 通过标准

- 三种语言不再出现错误 playoff 描述。
- 页面不再出现无来源的 `85%`。
- 叙事内容仍自然可读。
- `npm run build` 通过。

### 6.5 执行记录

- 执行日期：`2026-05-31`
- 修改文件：`composables/useTeamNarrative.ts`
- 修正内容：三种语言统一为每组前两名与 8 支成绩最好的小组第三名晋级 32 强；移除 `playoff`、`repesca`、`附加赛` 等错误描述；将首战 `85%` 与排名百分比区间改为定性展望。
- 测试结果：通过。叙事源码文本扫描不再包含错误赛制与无来源概率；真实数据校验结果为 `Warnings: 151`、`Errors: 0`；Nuxt 生产构建通过；SSR 抽查 `/teams/france`、`/teams/spain`、`/zh/teams/france`、`/es/teams/france` 均已输出新规则。预渲染 HTML 中仍可扫描到的 `85%` 仅来自 Tailwind `.text-white/85` 透明度样式，不是叙事内容。
- 备注：构建仍存在原有西语 i18n key 缺失与依赖 warning，不属于本项。
- 人工确认：等待确认。

---

## 7. Item 5：修复首页多语言 SEO

优先级：`P0`  
目标：默认英文路径 `/` 输出英文 title 和 description。

### 7.1 涉及文件

- `pages/index.vue`
- `i18n/en.json`
- `i18n/zh.json`
- `i18n/es.json`

### 7.2 执行步骤

1. 增加首页 SEO i18n key。
2. 使用 computed 根据 locale 输出：
   - title
   - description
3. 保证 `/` 为英文。
4. 保证 `/zh` 为中文。
5. 保证 `/es` 为西语。

### 7.3 测试方法

本地查看页面 HTML：

```powershell
curl.exe -s http://127.0.0.1:3000/ | Select-String '<title>|description'
```

```powershell
curl.exe -s http://127.0.0.1:3000/zh | Select-String '<title>|description'
```

```powershell
curl.exe -s http://127.0.0.1:3000/es | Select-String '<title>|description'
```

### 7.4 通过标准

- 三种语言 title 与 description 匹配当前语言。
- 英文 title 不包含中文。
- title 与 description 长度合理。
- `npm run build` 通过。

### 7.5 执行记录

- 执行日期：`2026-05-31`
- 修改文件：`pages/index.vue`、`i18n/es.json`
- 修正内容：首页 SEO 的 `title` 与 `description` 改为根据当前 locale 读取 `home.title` 和 `home.description`；补齐西语首页 SEO 文案。
- 测试结果：通过。三种语言 JSON 可解析；真实数据校验结果为 `Warnings: 151`、`Errors: 0`；Nuxt 生产构建通过；SSR 抽查 `/`、`/zh`、`/es` 的 title、description 与 canonical 均匹配当前语言；默认英文 `/` 不再包含旧中文 SEO 文案；英文首页 hreflang 已正确指向 `/`、`/zh`、`/es` 与 `x-default`。
- 备注：首次构建时默认 `/` 复用了旧 Nitro 路由缓存，已隔离 `.nuxt/cache/nitro/routes` 后重新构建。构建仍存在原有西语球队 i18n key 缺失与依赖 warning，不属于本项。
- 人工确认：等待确认。

---

## 8. Item 6：修复 Blog canonical

优先级：`P0`  
目标：英文博客 canonical 指向公开路由，而不是内容数据库路径。

### 8.1 涉及文件

- `pages/blog/[slug].vue`

### 8.2 执行步骤

1. 保留 `contentPath` 用于查询 Nuxt Content。
2. canonical 使用公开路由 `route.path`。
3. 不将内容存储路径 `/en/blog/...` 当作公开 URL。

### 8.3 测试方法

抽查：

```text
/blog/2026-world-cup-format-explained
/zh/blog/2026-world-cup-format-explained
```

检查：

```html
<link rel="canonical" ...>
```

### 8.4 通过标准

- 英文博客 canonical 为 `/blog/{slug}`。
- 中文博客 canonical 为 `/zh/blog/{slug}`。
- canonical URL 可访问。
- `npm run build` 通过。

### 8.5 执行记录

- 执行日期：`2026-05-31`
- 修改文件：`pages/blog/[slug].vue`
- 修正内容：保留内部 `contentPath` 仅用于 Nuxt Content 查询；博客详情页 SEO canonical 与 `og:url` 改为使用公开路由 `route.path`，不再将内容存储路径 `/en/blog/...` 暴露为英文 canonical。
- 测试结果：通过。真实数据校验结果为 `Warnings: 151`、`Errors: 0`；Nuxt 生产构建通过；SSR 抽查 `/blog/2026-world-cup-format-explained`、`/zh/blog/2026-world-cup-format-explained`、`/blog/road-to-2026-world-cup-host-cities` 的 canonical 与 `og:url` 均为公开可访问路径；三篇英文博客预渲染产物均不再包含内部 `/en/blog/...` canonical。
- 备注：构建前已隔离 `.nuxt/cache/nitro/routes`，避免旧预渲染 HTML 干扰验收。构建仍存在原有西语球队 i18n key 缺失与依赖 warning，不属于本项。
- 人工确认：等待确认。

---

## 9. Item 7：修复 Blog hreflang

优先级：`P0`  
目标：博客只输出真实存在的翻译页面。

### 9.1 涉及文件

- `composables/useSeoConfig.ts`
- `pages/blog/[slug].vue`
- 可能涉及 Blog sitemap 配置

### 9.2 设计要求

为 `useSeoConfig` 增加可选参数：

```ts
availableLocales?: Array<'en' | 'zh' | 'es'>
```

默认：

```ts
['en', 'zh', 'es']
```

博客详情页：

- 根据真实存在的内容文件计算 locales。
- 只输出真实页面。
- `x-default` 指向英文页；没有英文页时指向首个真实页面。

### 9.3 测试方法

抽查：

```text
/blog/road-to-2026-world-cup-host-cities
/zh/blog/2026-shijiebei-zhubanchengshi
```

确认不存在的 `/es/blog/...` 不会出现在 hreflang。

### 9.4 通过标准

- hreflang 只指向可访问页面。
- `x-default` 合理。
- 非博客页面仍输出三语言 alternate。
- `npm run build` 通过。

### 9.5 执行记录

- 执行日期：`2026-05-31`
- 修改文件：`composables/useSeoConfig.ts`、`pages/blog/[slug].vue`
- 修正内容：为 `useSeoConfig` 增加可选 `availableLocales` 参数，默认仍输出 `en`、`zh`、`es` 三语言 alternate；博客详情页根据当前 slug 查询真实存在且非草稿的内容文件，只将可访问语言传入 SEO 配置；`x-default` 优先指向英文页，没有英文时回退到首个真实页面。
- 测试结果：通过。真实数据校验结果为 `Warnings: 151`、`Errors: 0`；Nuxt 生产构建通过；SSR 抽查中英双语文章、仅英文 slug、仅中文 slug 均只输出真实存在的 hreflang，且不包含不存在的西语文章路径；全量博客预渲染 alternate 校验确认所有输出链接均映射到实际 HTML；首页仍正常输出 `en`、`zh`、`es` 与 `x-default`。
- 备注：构建前已隔离 `.nuxt/cache/nitro/routes`，避免旧预渲染 HTML 干扰验收。当前城市文章的中英文 slug 不同，因此各自仅声明自身真实页面；后续如需跨 slug 互链，应新增显式翻译关联字段。构建仍存在原有西语球队 i18n key 缺失与依赖 warning，不属于本项。
- 人工确认：等待确认。

---

## 10. Item 8：修复 Schema Logo

优先级：`P0`  
目标：结构化数据 Logo URL 实际可访问。

### 10.1 涉及文件

- `components/SchemaOrg.vue`
- `pages/index.vue`

### 10.2 执行步骤

将：

```text
https://worldcupdex.org/logo.png
```

改为：

```text
https://worldcupdex.org/images/logo.png
```

### 10.3 测试方法

```powershell
curl.exe -I https://worldcupdex.org/images/logo.png
```

本地检查首页 JSON-LD。

部署后使用：

- <https://validator.schema.org/>

### 10.4 通过标准

- Logo URL 返回 `200`。
- 首页 Organization Schema 正确。
- Blog Article publisher logo 正确。
- `npm run build` 通过。

### 10.5 执行记录

- 执行日期：`2026-05-31`
- 修改文件：`components/SchemaOrg.vue`、`pages/index.vue`、`pages/about/index.vue`
- 修正内容：将首页 Organization Schema、通用 Organization helper、Blog Article publisher logo 与 About 页 Organization Schema 的 Logo URL 统一由 `/logo.png` 改为实际静态资源路径 `/images/logo.png`。
- 测试结果：本地验证通过。旧 `/logo.png` 引用扫描已清零；源码与生产构建产物均存在 `public/images/logo.png`，文件大小为 `212262` bytes；真实数据校验结果为 `Warnings: 151`、`Errors: 0`；Nuxt 生产构建通过；SSR 抽查首页、About 页与 Blog Article JSON-LD 均已输出 `https://worldcupdex.org/images/logo.png`。
- 备注：当前环境无法连接 `https://worldcupdex.org`，且本次修改尚未部署，因此正式域名 Logo URL 的 HTTP `200` 需要部署后复核。构建前已隔离 `.nuxt/cache/nitro/routes`，避免旧预渲染 HTML 干扰验收。构建仍存在原有西语球队 i18n key 缺失与依赖 warning，不属于本项。
- 人工确认：等待确认；部署后需补充正式域名 HTTP `200` 验证。

---

## 11. Item 9：补齐默认 OG 图片

优先级：`P0`  
目标：所有未指定 OG 图片的页面都有可用分享图。

### 11.1 涉及文件

- `public/images/og-default.png`
- 可选：其他页面专属 OG 图片

### 11.2 执行步骤

1. 先补静态默认图，不引入新依赖。
2. 尺寸：

```text
1200x630
```

3. 内容建议：
   - WorldCupDex 品牌名
   - 2026 World Cup fan companion
   - schedules、teams、predictions
4. 保证文字清晰，移动端缩略图仍可辨认。
5. 后续再决定是否引入动态 OG 生成。

### 11.3 测试方法

```powershell
Test-Path -LiteralPath 'public\images\og-default.png'
```

部署后：

```powershell
curl.exe -I https://worldcupdex.org/images/og-default.png
```

### 11.4 通过标准

- 图片存在。
- 尺寸为 `1200x630`。
- URL 返回 `200`。
- X、Facebook、LinkedIn 分享预览正常。
- `npm run build` 通过。

### 11.5 执行记录

- 执行日期：`2026-05-31`
- 新增文件：`public/images/og-default.png`
- 图片内容：使用内置 `imagegen` 生成并缩放为 `1200x630` PNG。画面采用深蓝夜间球场、金色路线线条与清晰品牌信息，包含 `WorldCupDex`、`2026 World Cup fan companion`、`Schedules · Teams · Predictions`、`worldcupdex.org`。
- 测试结果：本地验证通过。源码与生产构建产物均存在 `images/og-default.png`，尺寸为 `1200x630`，文件大小为 `1223982` bytes；真实数据校验结果为 `Warnings: 151`、`Errors: 0`；Nuxt 生产构建通过；SSR 抽查首页、About 页、Blog 列表与球队列表的 `og:image`、`twitter:image` 均为 `https://worldcupdex.org/images/og-default.png`。
- 备注：当前环境无法连接 `https://worldcupdex.org`，且本次图片尚未部署，因此正式域名图片 URL 的 HTTP `200` 以及 X、Facebook、LinkedIn 分享预览需要部署后复核。构建仍存在原有西语球队 i18n key 缺失与依赖 warning，不属于本项。
- 人工确认：等待确认；部署后需补充正式域名 HTTP `200` 与社交平台分享预览验证。

---

## 12. Item 10：处理 WebSite SearchAction

优先级：`P0`  
目标：不向搜索引擎声明无法使用的站内搜索。

### 12.1 当前问题

Schema 指向：

```text
/data?q={search_term_string}
```

但 `/data` 未读取 URL 查询参数。

### 12.2 涉及文件

- `components/SchemaOrg.vue`
- `pages/index.vue`
- `pages/data/index.vue`

### 12.3 决策

优先选简单方案：

```text
暂时移除 SearchAction
```

后续如果 `/data?q=` 搜索真正接通，再恢复 Schema。

### 12.4 测试方法

检查首页 JSON-LD，不应再出现：

```text
SearchAction
```

### 12.5 通过标准

- Schema 不声明不可用搜索。
- 首页其他 WebSite Schema 保留。
- `npm run build` 通过。

### 12.6 执行记录

- 执行日期：`2026-05-31`
- 修改文件：`components/SchemaOrg.vue`、`pages/index.vue`
- 修改内容：移除 WebSite Schema 中未接通的 `potentialAction` / `SearchAction` 声明。保留 `name`、`url` 与 `description`，不影响 `/data` 页面现有的本地筛选交互。
- 测试结果：本地验证通过。代码扫描确认 `components`、`pages`、`composables`、`server`、`nuxt.config.ts` 与 `app.vue` 中均不再出现 `SearchAction`、`search_term_string` 或 `potentialAction`；真实数据校验结果为 `Warnings: 151`、`Errors: 0`；隔离旧 Nitro 路由缓存后，Nuxt 生产构建通过；生产预渲染首页仍包含 `WebSite` 与 `Organization` Schema，且不再包含 `SearchAction` 或 `search_term_string`。
- 备注：首次构建复用了旧 Nitro 路由缓存，导致 `.output/public/index.html` 暂时仍包含旧声明。已将 `.nuxt/cache/nitro/routes` 移动到 `.nuxt/cache/nitro-routes-item10-stale-20260531224451` 后重新构建并确认产物更新。构建仍存在原有西语球队 i18n key 缺失与依赖 warning，不属于本项。
- 人工确认：等待确认。

---

## 13. Item 11：审计 URL 与尾斜杠策略

优先级：`P1`  
目标：在修改 URL 之前，先明确生产环境真实行为。

### 13.1 背景

历史上站点存在：

- `/quiz/play` 与 `/quiz/play/` 行为差异
- `/en/schedule`
- `/en/schedule/`
- `/teams/france`
- `/en/teams/france`

因此不能直接决定“强制去斜杠”。

### 13.2 执行步骤

1. 建立 URL 样本清单。
2. 对每个 URL 记录：
   - HTTP 状态码
   - `Location`
   - canonical
   - hreflang
   - sitemap 是否包含
3. 检查 Cloudflare Pages / Wrangler 行为。
4. 明确目标规范。

### 13.3 样本 URL

```text
/
/schedule
/schedule/
/en/schedule
/en/schedule/
/teams/france
/teams/france/
/en/teams/france
/quiz/play
/quiz/play/
/blog/2026-world-cup-format-explained
/blog/2026-world-cup-format-explained/
```

### 13.4 建议产物

新增：

```text
reports/url-canonical-audit-2026-05-31.md
```

### 13.5 通过标准

- 每个样本 URL 都有记录。
- 已明确目标规范 URL。
- 已确认不会重新引入 Quiz Loading 问题。
- 本项不修改路由。

### 13.6 执行记录

- 执行日期：
- 审计报告：
- 推荐策略：
- 人工确认：

---

## 14. Item 12：实施 URL 收敛

优先级：`P1`  
前置条件：Item 11 已通过。  
目标：统一内部链接、canonical、sitemap 和 301。

### 14.1 推荐目标

如果 Item 11 没有发现阻碍，推荐：

```text
/teams/france
/zh/teams/france
/es/teams/france
```

英文不带 `/en`。

尾斜杠以 Item 11 审计结论为准。

### 14.2 涉及文件

- `nuxt.config.ts`
- `composables/useSeoConfig.ts`
- 导航与站内链接组件
- sitemap 配置
- 可能涉及 Cloudflare redirect 配置

### 14.3 执行步骤

1. 添加旧 URL 到规范 URL 的 `301`。
2. 修正内部链接。
3. 修正 canonical。
4. 修正 hreflang。
5. 修正 sitemap。
6. 检查 `_payload.json` 请求。
7. 重点回归 Quiz 跳转。

### 14.4 测试方法

- 重跑 Item 11 的 URL 样本。
- 浏览器回归：
  - 首页
  - 赛程
  - 球队列表
  - 球队详情
  - Blog
  - Quiz
- 检查浏览器控制台和网络请求。

### 14.5 通过标准

- 旧 URL 只做一次 `301`。
- 无重定向链。
- canonical 与最终 URL 一致。
- sitemap 只保留规范 URL。
- 内部链接只指向规范 URL。
- Quiz 正常。
- 无新增 payload 错误。
- `npm run build` 通过。

### 14.6 执行记录

- 执行日期：
- 修改文件：
- URL 审计结果：
- 浏览器回归结果：
- 人工确认：

---

## 15. Item 13：显式配置 AI 搜索爬虫

优先级：`P1`  
目标：允许 ChatGPT Search 抓取，同时单独决定训练抓取策略。

### 15.1 涉及文件

- `public/robots.txt`

### 15.2 推荐配置

```text
User-agent: OAI-SearchBot
Allow: /

User-agent: *
Allow: /
Disallow: /api/
Disallow: /data/

Sitemap: https://worldcupdex.org/sitemap.xml
```

### 15.3 需要人工决定

是否允许训练用途抓取：

- 允许：单独配置相应爬虫。
- 禁止：显式禁止训练用途爬虫。

搜索发现与训练用途应分别处理。

### 15.4 测试方法

```powershell
Get-Content -LiteralPath 'public\robots.txt'
```

部署后：

```powershell
curl.exe -s https://worldcupdex.org/robots.txt
```

### 15.5 通过标准

- `OAI-SearchBot` 明确允许。
- 原有 `/api/` 与 `/data/` 规则保留。
- 已记录训练爬虫决策。
- `npm run build` 通过。

### 15.6 执行记录

- 执行日期：
- 训练爬虫决策：
- 修改文件：
- 测试结果：
- 人工确认：

---

## 16. Item 14：增加 BreadcrumbList Schema

优先级：`P1`  
目标：让搜索引擎与 AI 引擎更清楚页面层级。

### 16.1 覆盖页面

- Blog 详情
- 球队详情
- 球队赛程
- 球队路线
- 预测页

### 16.2 涉及文件

- `components/SchemaOrg.vue`
- 可选新增：`components/BreadcrumbSchema.vue`
- 对应页面文件

### 16.3 执行步骤

1. 为 Schema 类型增加 `BreadcrumbList`。
2. 每个页面输出：
   - `position`
   - `name`
   - `item`
3. URL 使用规范 canonical。
4. 可视化 breadcrumb 与 Schema 保持一致。

### 16.4 测试方法

本地检查 JSON-LD。

部署后使用：

- <https://validator.schema.org/>
- <https://search.google.com/test/rich-results>

### 16.5 通过标准

- 页面存在合法 `BreadcrumbList`。
- URL 使用规范路径。
- breadcrumb 层级正确。
- `npm run build` 通过。

### 16.6 执行记录

- 执行日期：
- 修改文件：
- 验证 URL：
- 测试结果：
- 人工确认：

---

## 17. Item 15：增加 GEO 可引用答案块

优先级：`P1`  
目标：让搜索引擎和 AI 工具快速提取球队下一场、时间、球场和状态。

### 17.1 第一批覆盖

- `pages/teams/[id]/world-cup-2026-route.vue`
- `pages/teams/[id]/schedule.vue`
- 可选：`pages/teams/[id]/index.vue`

### 17.2 答案块字段

示例：

```text
Canada's next World Cup match

Opponent:
Kickoff:
Venue:
Local time:
Group:
Squad status:
Last verified:
Source:
```

### 17.3 设计要求

- SSR 输出。
- 使用语义化 HTML。
- 内容短。
- 不隐藏在折叠组件后。
- 数据来自现有可靠数据层。
- 有可点击来源链接。
- 不强行套用 `FAQPage` 或 `QAPage`。

说明：

- `QAPage` 仅适用于用户可以提交多个答案的单一问题页。
- Google 的 FAQ 富摘要目前主要面向权威政府和医疗网站。
- 球队页优先使用 `SportsTeam`、`SportsEvent`、`BreadcrumbList`。

### 17.4 测试方法

抽查：

```text
/teams/france/world-cup-2026-route
/teams/canada/world-cup-2026-route
/teams/spain/schedule
```

检查 SSR HTML 是否直接包含答案字段。

### 17.5 通过标准

- 答案块无需 JavaScript 即可读取。
- 数据与页面其他位置一致。
- 来源可点击。
- 移动端不拥挤。
- `npm run build` 通过。

### 17.6 执行记录

- 执行日期：
- 修改文件：
- 测试 URL：
- 测试结果：
- 人工确认：

---

## 18. Item 16：增强数据来源链接

优先级：`P1`  
目标：让关键事实可以被用户和生成式搜索验证。

### 18.1 涉及文件

- `composables/useDataSourceMeta.ts`
- `components/DataSourceNote.vue`
- `data/meta.json`

### 18.2 执行步骤

1. 为数据来源增加 URL 字段。
2. 将 FIFA 官方页面、协会名单页或公开来源链接展示为可点击链接。
3. 区分：
   - 赛程来源
   - 球队来源
   - 名单来源
   - 排名来源
4. 保留非官方声明。
5. 预测内容继续明确标记娱乐用途。

### 18.3 测试方法

浏览器抽查：

- `/schedule`
- `/teams`
- `/teams/france`
- `/predict/537327`

### 18.4 通过标准

- 来源链接可访问。
- 页面状态、来源和更新时间一致。
- 官方数据与预测内容边界清晰。
- `npm run build` 通过。

### 18.5 执行记录

- 执行日期：
- 修改文件：
- 来源链接：
- 测试结果：
- 人工确认：

---

## 19. Item 17：重点球队页优化

优先级：`P1`  
前置条件：数据可信度与技术 SEO 已通过。  
目标：先提升已有曝光页面 CTR 和可引用性。

### 19.1 第一批球队

```text
France
Spain
Canada
United States
```

### 19.2 每页检查项

- 分组准确
- 名单状态准确
- 下一场比赛
- 完整小组赛路线
- 当地时间
- 日历导出
- 可点击来源
- 最后更新时间
- 独立 title
- 独立 description
- 独立 OG 图
- BreadcrumbList
- 简短 FAQ 文本区

注意：

- FAQ 文本可以存在。
- 不需要为了 FAQ 文本强行增加 `FAQPage` Schema。

### 19.3 建议关键词

```text
france world cup 2026 squad
france world cup schedule
spain world cup squad
canada world cup 2026 group
usa world cup schedule
```

### 19.4 测试方法

逐页检查：

- 桌面端
- 移动端
- SSR HTML
- canonical
- hreflang
- OG
- Schema

### 19.5 通过标准

- 四个页面数据准确。
- 页面标题与描述自然，不堆关键词。
- 页面有明确答案块。
- 页面移动端易读。
- `npm run build` 通过。

### 19.6 执行记录

- 执行日期：
- 修改文件：
- 验证页面：
- 测试结果：
- 人工确认：

---

## 20. Item 18：Blog 可引用性优化

优先级：`P1`  
目标：让博客文章更适合搜索摘要和生成式搜索引用。

### 20.1 第一批文章

- 48 队赛制解释
- 主办城市指南
- 热门球队分析

### 20.2 每篇文章增加

- TL;DR
- 发布日期
- 更新时间
- 作者
- 数据来源
- 官方参考链接
- FAQ 文本

### 20.3 内容要求

- 不复制官方文章。
- 不堆关键词。
- 事实优先。
- 观点与事实分开。
- 对预测文章明确标注主观看法。

### 20.4 测试方法

- 检查文章 HTML。
- 检查 Article Schema。
- 检查 canonical。
- 检查 hreflang。
- 检查封面图。

### 20.5 通过标准

- 三篇文章结构清晰。
- 来源可访问。
- Article Schema 正确。
- 不存在破图。
- `npm run build` 通过。

### 20.6 执行记录

- 执行日期：
- 修改文章：
- 测试结果：
- 人工确认：

---

## 21. Item 19：重新生成 sitemap 并提交 GSC

优先级：`P1`  
前置条件：Item 12 URL 收敛已通过。  
目标：让 Google 重新发现规范 URL。

### 21.1 执行步骤

1. 构建站点。
2. 检查 sitemap。
3. 确认只包含规范 URL。
4. 确认球队赛程页与路线页存在。
5. 确认不存在无内容的博客翻译页。
6. 部署。
7. 在 Google Search Console 重新提交：

```text
https://worldcupdex.org/sitemap.xml
```

### 21.2 测试方法

```powershell
curl.exe -s https://worldcupdex.org/sitemap.xml
```

搜索检查：

```powershell
curl.exe -s https://worldcupdex.org/sitemap.xml | Select-String '/en/'
```

### 21.3 通过标准

- sitemap 可访问。
- 无不需要的 `/en/` URL。
- 无重复 URL。
- 无不存在的翻译页。
- GSC 成功接收 sitemap。

### 21.4 执行记录

- 执行日期：
- sitemap URL 数量：
- GSC 提交结果：
- 人工确认：

---

## 22. Item 20：观察期与复盘

优先级：`P1`  
目标：确认优化是否改善抓取、曝光和引荐流量。

### 22.1 观察周期

建议：

```text
7 天
```

必要时延长至：

```text
14 天
```

### 22.2 监控指标

GSC：

- 已发现 URL
- 已索引 URL
- 总曝光
- 总点击
- CTR
- France、Spain、Canada、USA 页面排名
- 重复 canonical 警告
- 抓取异常

GA4：

- `google / organic`
- `chatgpt.com / referral`
- 重点球队落地页 PV
- 赛程页 PV
- 日历导出
- 预测入口点击

### 22.3 建议产物

新增：

```text
reports/seo-geo-review-2026-06-07.md
```

### 22.4 通过标准

- 没有新增索引异常。
- 规范 URL 开始进入索引。
- 重复 URL 曝光逐步下降。
- 重点球队页曝光和 CTR 有可解释变化。
- 已决定下一轮扩展方向。

### 22.5 执行记录

- 复盘日期：
- GSC 结论：
- GA4 结论：
- 下一步：
- 人工确认：

---

## 23. Item 21：规划下一轮程序化 SEO

优先级：`P2`  
前置条件：观察期完成。  
目标：根据真实数据决定扩展页面，而不是盲目批量生成内容。

### 23.1 候选方向

比赛页：

```text
/matches/{home}-vs-{away}
```

主办城市页：

```text
/host-cities/{city}
```

时区页：

```text
/world-cup-2026-time-in-{country}
```

西语重点球队：

```text
Mexico
Argentina
Spain
Colombia
Uruguay
Brazil
United States
```

### 23.2 决策依据

- GSC 查询词
- GA4 落地页
- 社媒 UTM 流量
- 用户使用的工具入口
- 内容维护成本
- 数据准确性保障能力

### 23.3 通过标准

- 只选择一个新模板试点。
- 先做 5 至 10 个高质量页面。
- 每页必须有真实工具或数据。
- 不批量生成低价值 AI 文案。
- 新模板具备 canonical、hreflang、OG、Schema 和 sitemap。

### 23.4 执行记录

- 决策日期：
- 选择模板：
- 首批 URL：
- 数据依据：
- 人工确认：

---

## 24. 人工确认问题

开始 Item 1 前，请确认：

1. 名单状态是否采用：

```text
official | provisional | incomplete
```

2. 是否允许 ChatGPT Search 抓取：

```text
OAI-SearchBot: Allow
```

3. 是否禁止训练用途抓取？

4. 英文默认路径是否确认采用无前缀形式：

```text
/teams/france
```

5. URL 尾斜杠策略是否同意先审计，再决定？

6. 第一批重点球队是否确认为：

```text
France
Spain
Canada
United States
```

## 25. 当前暂停点

本清单创建完成后，执行应暂停在：

```text
Item 1：建立数据状态模型
```

等待人工确认后再开始修改代码。
