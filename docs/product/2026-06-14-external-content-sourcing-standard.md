# WorldCupDex 每日 SEO 文章外部采集标准

## 目标

把每日 SEO 文章流程改成“官网优先、社区辅助、站内校验”的固定流程，避免直接用本地 `data/` 作为当天选题和赛事实锚点。

## 结论先行

- 官方事实来源必须优先于本地数据。
- 社区来源用于提取热词、讨论焦点、球员关注点和用户真实疑问，不用于单独确认事实。
- 本地 `data/`、`ops report`、GA4、GSC 只用于交叉校验和站内承接判断，不再作为当天文章主选题来源。

## 每日文章标准流程

### 1. 官方事实采集

先收集今天和明天相关比赛的官方信息，至少覆盖：

- FIFA World Cup 2026 tournament hub
- FIFA Match Centre
- FIFA scores and fixtures
- 必要时补充球队官方页面或赛事官方页面

必须记录：

- 比赛日期
- 开球时间
- 对阵双方
- 小组/阶段
- 球场和城市
- 官方链接

规则：

- 这些字段以官方来源为准。
- 若本地 `data/` 和官方不一致，以官方为准，并把本地数据标记为“待校验”。
- 没有官方链接，不进入正文写作。

### 2. 社区热词采集

围绕今天和明天的比赛，从公开社区收集“用户正在讨论什么”，至少覆盖 2 类来源：

- Reddit：优先 `r/soccer`、`r/worldcup` 的 daily hub、match thread、pre-match thread、post-match thread
- YouTube：官方或主流媒体的赛前/赛后视频评论区
- 可选：X、论坛、新闻评论区；如果抓取稳定性差，只做辅助，不做硬依赖

必须整理的不是“逐条搬运评论”，而是下面这些结构化信号：

- 高频问题：例如“谁会首发”“这场是否决定出线”“某球员是否健康”
- 高频人物：球星、门将、教练、争议球员
- 高频主题：状态、伤病、战术、主场气氛、裁判、炎热天气、旅途、赛程顺序
- 情绪方向：乐观、担忧、争议、看衰、观望

规则：

- 不伪造“很多用户认为”。
- 可以写“公开讨论里反复出现的焦点包括……”。
- 需要引用具体社区内容时，只保留短摘录并标注来源链接。
- 社区内容只能作为“讨论信号”，不能单独作为事实依据。

### 3. 站内承接判断

完成外部采集后，再回到站内判断这篇文章值不值得写，以及写完后导流到哪里：

- 查看 `reports/ops/YYYY-MM-DD-ops-report.md`
- 看 GSC 最近可用搜索词
- 看 GA4/Cloudflare 当前热门页面
- 看站内是否已有可承接页面：球队页、赛程页、预测页、球迷卡、既有博客

必须输出：

- 主目标关键词
- 2-3 个次级关键词
- 站内 3 个以上承接链接
- 这篇文章最终要把流量导向哪个页面

规则：

- 如果社区热词和站内没有承接入口，不写泛流量文章。
- 如果站内已有同题文章，优先更新旧文，而不是重复新建。

### 4. 写作前简报

正文开始前，先形成一个简短 briefing，至少包含：

- 文章标题候选 2 个
- 主关键词
- 目标用户问题
- 官方来源列表
- 社区来源列表
- 站内承接链接列表
- 风险点：是否有时间/对阵/伤病信息尚未确认

没有 briefing，不进入正文。

### 5. 正文写作

建议结构：

1. 快速回答搜索意图
2. 今天/明天的相关赛程和背景
3. 公开讨论里最反复出现的 2-3 个焦点
4. 编辑部判断：只做清晰分析，不做赌博导向表达
5. 站内下一步动作：球队页、赛程页、预测页、球迷卡
6. Sources and official references
7. FAQ

硬规则：

- 至少 3 个站内链接
- 至少 2 个官方链接
- 至少 2 类公开社区/讨论来源
- 不能把社区观点写成事实
- 不能只复述新闻

### 6. 发布前核对

发布前逐项确认：

- 比赛时间、对阵、球场、城市和阶段已用官方来源核对
- 文中所有社区观点都被表述为“讨论焦点”而非“事实”
- `publishedAt` 和 `updatedAt` 为当天日期
- 标题、描述、slug 不与既有文章重复
- 至少 3 个站内链接可访问

建议命令：

```bash
npm run validate-data
npm run build
```

### 7. 部署后核对

- 文章 URL 返回 `200`
- 博客列表页出现新文章
- sitemap 包含新 URL
- 必要时提交 `https://worldcupdex.org/sitemap.xml`

## 来源优先级

1. FIFA 官方页面
2. 赛事/球队官方页面
3. 公开社区讨论
4. 本地 `data/` 和站内观测数据

注意：

- 本地 `data/` 可以用于发现异常，但不能覆盖官方事实。
- GSC/GA4/Cloudflare 只能决定“写哪类问题更值”，不能决定“比赛事实是什么”。

## 默认执行建议

在没有额外指令时，默认按下面顺序执行：

1. 先查 FIFA 今天、明天的比赛和 match centre。
2. 再查 Reddit daily hub / match thread 和 YouTube 评论区的高频问题。
3. 再用当天 ops report 判断哪篇最能承接站内流量。
4. 出 briefing。
5. 写文、构建、部署、复核。

## 当前默认来源池

- Official:
  - `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026`
  - `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/match-center`
  - `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures`
- Community:
  - `https://www.reddit.com/r/soccer/`
  - `https://www.reddit.com/r/worldcup/`
  - YouTube 官方或主流媒体相关视频评论区

## 不再允许的旧做法

- 直接基于本地 `data/matches.json` 决定今天写什么
- 先写正文，再回头找来源补链
- 只凭站内 GSC/GA4 热词就写“赛事实文”
- 用未经核实的社区评论去替代官方信息
