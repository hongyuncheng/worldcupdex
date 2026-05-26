# Amazon 联盟替换 CJ 联盟详细设计方案

## 1. 现状分析
目前网站已经具备了基础的联盟营销商品展示框架，主要涉及以下几个文件：
*   **数据源**：`data/affiliate-products.json` (目前存储的是带 `anrdoezrs.net` 的 CJ 联盟占位链接)。
*   **前端展示**：`components/JerseyRecommend.vue` (负责按 `teamId` 渲染对应的球衣/周边商品)。
*   **中转与统计**：`server/api/track-affiliate.get.ts` (负责接收前端点击，打印服务端日志，并 302 重定向到真实的联盟链接)。

**痛点**：CJ 联盟审核未通过，无法拿到真实的广告主（如 Nike/Adidas）推广权限；且 CJ 的 deeplink 结构相对复杂。
**契机**：用户已成功注册 Amazon Associates（拥有 StoreID：`worldcupdex20-20`），其门槛极低（前3单免审），且涵盖了大量的体育周边、看球设备（投影仪、啤酒机）等商品。

---

## 2. 选品困难症的“偷懒”与高转化策略 (核心)
如果你不会选品，或者担心选的具体某一件球衣突然**断货**导致链接失效，**千万不要去推广单一商品**。我们采用以下两种“一劳永逸”的策略：

### 策略 A：推广“搜索结果页” (推荐)
不要搜出一件阿根廷球衣放上去，而是直接在 Amazon 搜索框输入 `Argentina Soccer Fan Gear` (阿根廷足球粉丝周边)。
*   将这个**搜索结果页**生成联盟链接。
*   **好处**：页面里有球衣、帽子、围巾、旗帜，用户点进去总能看到有货的、自己喜欢的东西。只要他把你带过去的页面里的任何东西加进购物车，你都有佣金。
*   **展示文案**：在我们的网站上不写“2024阿根廷主场球衣”，而是写 **"Explore Argentina Fan Shop" (探索阿根廷球迷商店)**。

### 策略 B：推广“看球通用神器” (万能钥匙)
所有球迷都需要看球设备，完全不用管他是哪个队的球迷。你可以单独设置几个通用推广位：
*   **商品词**：`4K Projector for Sports` (看球4K投影仪)、`Mini Beer Keg` (迷你啤酒机)、`Soccer Party Decorations` (足球派对装饰)。
*   **好处**：单价高（如投影仪几百美金），一旦成交一单，你的 3 单免审任务瞬间完成，且佣金丰厚。

---

## 3. 保姆级：如何生成你的专属 Amazon 链接

在你登录了 Amazon Associates 后台的前提下：

1.  **打开工具条**：直接在同一个浏览器打开普通的买家版网站 `www.amazon.com`。你会看到页面最顶部多了一条灰色的长条，叫做 **Amazon Associates SiteStripe**。
2.  **搜索商品/页面**：在亚马逊搜索框搜你想推的词（比如 `Brazil Soccer Shirt`），然后回车，进入搜索结果页。
3.  **获取链接**：
    *   点击顶部 SiteStripe 工具条左上角的 **"Text" (文本)**。
    *   在弹出的框里，选择 **"Short Link" (短链接)**。
    *   复制那个 `https://amzn.to/xxxxxx` 格式的链接。
4.  **填入数据源**：把这个短链接粘贴到我们项目 `data/affiliate-products.json` 里的 `productUrl` 字段即可。

---

## 4. Amazon 联盟对接策略与代码改造

### 4.1 链接格式与图片合规性
*   **链接**：现有的 302 重定向机制 (`/api/track-affiliate.get.ts`) 完全兼容 Amazon 的 `amzn.to` 短链，直接填入 JSON 即可。
*   **图片合规**：**严禁私自下载亚马逊图片并存到本地！** 我们短期内继续使用 `/images/jersey-placeholder.svg` 作为通用占位图，只要文案写得好（如 "Shop Argentina Gear on Amazon"），没有真实图片依然有转化。

### 4.2 强制合规声明 (Mandatory Disclosure - 必须加)
Amazon 联盟条款要求必须在网站显眼位置声明身份，否则会被封号。
*   **改造点**：修改 `components/JerseyRecommend.vue` 的底部声明部分（`.jersey-disclosure`）。
*   **英文文案**："As an Amazon Associate I earn from qualifying purchases."

### 4.3 国际化流量变现 (Amazon OneLink)
为了防止英国用户点击美国亚马逊链接不买单：
*   在 Amazon Associates 后台开启 **OneLink** 功能。
*   获取一段 JS 脚本片段，后续我们会通过 Nuxt 的 `useHead` 注入到全局，它会自动识别用户 IP 并重定向到对应的国家站点。

---

## 5. 行动路线图 (Next Steps)
1.  **修改合规文案**：由 AI 协助修改 `JerseyRecommend.vue`，加上 Amazon 强制要求的免责声明。
2.  **更新数据结构**：由 AI 协助将 `affiliate-products.json` 中的 CJ 链接清理，换成“搜索页策略”的占位数据结构。
3.  **用户实操**：站长根据第 3 节的教程，去亚马逊自己抓 2-3 个短链接（如阿根廷球迷店、看球投影仪），填入 JSON 文件。
4.  **上线跑单**：通过我们的“梗文化”和预测卡片引流，尽快促成前 3 笔有效订单，保住账号。
