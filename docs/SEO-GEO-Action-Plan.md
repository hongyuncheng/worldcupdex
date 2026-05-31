# WorldCupDex SEO & GEO 优化落地执行计划

本文档基于前期的调研与分析，整理了高度自动化、可落地的分步执行计划。我们将按照此计划在代码中逐步实施。

## 阶段一：URL 收敛与爬虫配置 (P1 & P0)
**目标**：集中 SEO 权重，避免重复索引，并拥抱 AI 搜索引擎。
- 显式开放 AI 爬虫抓取：在 `public/robots.txt` 中增加 `OAI-SearchBot`。
- 修复重复 URL 权重分散：配置 301 重定向，消除带有 `/en/` 前缀的冗余路由（强制重定向至无前缀路径）。
- 统一全站尾斜杠策略（强制去斜杠）。

## 阶段二：底层数据防腐与自动化时间戳 (P0)
**目标**：保证 AI 与用户获取的数据绝对真实、可靠，同时降低维护成本。
- 集成数据校验卡点：编写 `scripts/validate-data.ts` 脚本，在 `build` 前校验球队人数、分组等核心信息。如果不符合当前赛制，则阻断构建。
- 时间戳自动化：修改现有的 `fetch-data` 逻辑（或补充脚本），在更新数据时自动生成 `data/meta.json` 记录精准拉取时间。
- 重构数据来源声明：更新 `composables/useDataSourceMeta.ts`，废弃手动写死的时间，改为全局读取 `meta.json`。

## 阶段三：技术 SEO 修复与升级 (P0)
**目标**：修复基础的 Title、Canonical、Schema 等报错，保证爬虫正确识别。
- 修复首页多语言的 SEO title 与 description 混用问题。
- 修复 Blog 的 canonical 链接指向错误路径（去除英文版的 `/en` 前缀）。
- 修正 Schema 中的 Logo 相对/绝对路径问题。
- 清理或接通 Schema 中声明但不可用的站内搜索功能（SearchAction）。
- 引入或补齐 `og-default.png`（或使用 Nuxt 官方 `nuxt-og-image` 自动化生成）。

## 阶段四：GEO 专项优化 - 答案块与结构化数据 (P1)
**目标**：极大提升内容被 ChatGPT Search、Google AI Overviews 提取、引用的概率。
- 引入顶部“可引用答案块”：在球队详情与赛程页增加高浓度、短文本的数据汇总块（对手、时间、场馆、状态）。
- 结构化数据增强：结合答案块，注入符合标准的 `FAQPage` 或 `QAPage` JSON-LD。
- 来源增强：为各种数据类型标注具体的、可点击的外部验证来源（如 FIFA 官方链接）。
