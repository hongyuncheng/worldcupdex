# WorldCupDex & KickIQ 跨站流量合作追踪方案

为了更好地评估双方站点的互导流量效果，并为后续的合作（如资源互换、转化评估）提供准确的数据支撑，我们建议基于 Google Analytics 4 (GA4) 的 UTM 参数机制，建立统一的跨站追踪共识。

---

## 1. 核心追踪机制

我们采用业界标准的**双端归因方案**：
* **跳转方（发起端）**：负责通过事件埋点记录“点击出站”的准确次数。
* **接收方（落地端）**：负责通过解析 URL 中的 `UTM 参数` 记录“实际到达”的会话数及后续转化行为。

这种双端核对机制可以有效计算出流量的**实际到达率**（排除网络异常、中途关闭或广告拦截插件的影响），保证数据对账的透明性。

---

## 2. 从 WorldCupDex 跳转至 KickIQ 的规范

当用户在 WorldCupDex 网站上点击“AI 预测”等跳转按钮时，我们将统一携带以下参数前往 KickIQ 网站。

### 跳转链接结构
`https://kickiq.org/[目标路径]?team1=[球队A英文名]&team2=[球队B英文名]&utm_source=worldcupdex&utm_medium=[来源位置]`

### 参数定义
| 参数名 | 取值 | 说明 |
| :--- | :--- | :--- |
| `team1` | 动态（如：Mexico） | 比赛主队标准英文名称（用于 AI 预测功能） |
| `team2` | 动态（如：South Africa） | 比赛客队标准英文名称（用于 AI 预测功能） |
| `utm_source` | **`worldcupdex`** | **固定值**。标识流量来自我们的网站 |
| `utm_medium` | 动态（见下表） | 标识用户具体点击了哪个位置的引流按钮 |

### `utm_medium` 取值约定表（KickIQ 侧可见）
在 KickIQ 的 GA4 后台中，您可以通过按“媒介 (Medium)”进行拆分，看到以下具体的流量入口来源：

* `ai_predict_btn`：来自各处比赛卡片上的“AI 预测”按钮
* `quiz_result`：来自 WorldCupDex 单场预测完成后的结果页广告位
* `champion_result`：来自 WorldCupDex 冠军预测完成后的结果页广告位
* `partner_link`：其他常规合作链接或底部友链

---

## 3. 从 KickIQ 跳转至 WorldCupDex 的规范

当贵站需要挂载指向 WorldCupDex 的链接时，请务必在 URL 结尾携带标准的 UTM 参数，以便我们的 GA4 能够准确归因贵方带来的流量。

### 推荐的跳转链接格式
`https://worldcupdex.org/[目标路径]?utm_source=kickiq&utm_medium=[来源位置]&utm_campaign=cross_promo`

### 参数定义
| 参数名 | 取值要求 | 说明 |
| :--- | :--- | :--- |
| `utm_source` | **`kickiq`** | **固定值**。请务必统一使用此名称，切勿使用大小写混写（如 KickIq, KICKIQ），以免 GA4 拆分为不同来源。 |
| `utm_medium` | 建议自定义 | 建议贵方定义具体入口，例如 `top_banner`, `result_page_cta`, `footer_link` 等。 |
| `utm_campaign` | `cross_promo` (建议) | 用于标识此次流量互换的活动名称。 |

---

## 4. 数据查看与对账建议

### 如何在 GA4 中查看对方带来的流量？
无论是在 WorldCupDex 还是 KickIQ 的 GA4 后台，查看方式完全一致：
1. 登录 GA4 后台。
2. 导航至：**报告 (Reports) -> 生命周期 (Life cycle) -> 流量获取 (Acquisition) -> 流量获取 (Traffic acquisition)**。
3. 将数据表格左上角的主要维度（通常默认为“默认渠道组 Session default channel group”）点击切换为 **“会话来源/媒介” (Session source/medium)**。
4. 搜索框中输入 `worldcupdex` (KickIQ 侧操作) 或 `kickiq` (WorldCupDex 侧操作)，即可清晰看到由对方带来的独立会话数、参与度、停留时间等指标。

### 定期对账机制
建议在每月底或重要节点，双方导出各自后台的统计数据进行对比：
* **WorldCupDex 提供**：点击前往 KickIQ 的总出站点击数。
* **KickIQ 提供**：GA4 记录到的 `utm_source=worldcupdex` 的实际会话到达数。

> **注**：通常由于页面加载耗时、用户提前关闭网页、或部分用户开启了 AdBlocker 广告拦截插件（导致 GA4 无法上报），到达数会比点击数低 15%~30%，属于业界正常的数据损耗范围。

---

希望以上方案能作为双方技术与运营层面达成共识的基础，如有任何参数命名或业务上的调整需求，欢迎随时沟通！