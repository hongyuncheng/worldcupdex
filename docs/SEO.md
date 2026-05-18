# SEO 实施清单（OG / Twitter Card / JSON-LD Schema）

本文档记录 WorldCupDex 站点的 SEO 落地情况，包含 Open Graph、Twitter Card、JSON-LD 结构化数据，以及多语言 hreflang 配置。

---

## 1. 总体策略

| 项 | 实施方式 |
| --- | --- |
| 站点级 meta（默认 title/description/OG/Twitter） | `nuxt.config.ts -> app.head` + `composables/useSeoConfig.ts` |
| 页面级 meta（OG / Twitter / canonical / hreflang） | `useSeoConfig({ title, description, ogImage?, ogType?, path? })` |
| 多语言 alternate | `useSeoConfig` / `useHreflang` 自动注入 zh / en / es / x-default |
| 结构化数据 | `<SchemaOrg type="..." :data="..." />` 组件 |
| 站点地图 | `@nuxtjs/sitemap`（`sitemap.autoI18n: true`） |
| siteUrl 来源 | `useRuntimeConfig().public.siteUrl`（默认 `https://worldcupdex.org`） |

> **占位项**：Twitter handle `@worldcupdex` 当前为占位值，账号确认后需在
> `composables/useSeoConfig.ts` 中替换 `twitter:site` 的 content。

---

## 2. 各页面 SEO 实施清单

| 页面 | useSeoConfig | OG/Twitter | JSON-LD Schema |
| --- | :-: | :-: | --- |
| `pages/index.vue` | ✅ | ✅ | `Organization` + `WebSite`（含 SearchAction） |
| `pages/teams/index.vue` | ✅ | ✅ | — |
| `pages/teams/[id].vue` | ✅（动态：球队名 + ogImage 球队旗帜） | ✅ | `SportsTeam`（含 squad → Person 数组） |
| `pages/schedule/index.vue` | ✅ | ✅ | `SportsEvent` × 前 5 场未来比赛 |
| `pages/quiz/index.vue` | ✅ | ✅ | `Quiz` |
| `pages/quiz/play.vue` | ✅ | ✅ | — |
| `pages/quiz/result.vue` | ✅（静态 fallback；分数动态展示靠 SharePanel） | ✅ | — |
| `pages/predict/index.vue` | ✅ | ✅ | — |
| `pages/predict/champion.vue` | ✅ | ✅ | — |
| `pages/predict/[id].vue` | ✅ | ✅ | — |
| `pages/fan-card/index.vue` | ✅ | ✅ | — |
| `pages/fan-card/result.vue` | ✅ | ✅ | — |
| `pages/data/index.vue` | ✅ | ✅ | — |
| `pages/wiki/index.vue` | ✅ | ✅ | — |

---

## 3. `useSeoConfig` API 用法

定义于 [composables/useSeoConfig.ts](../composables/useSeoConfig.ts)。

### 签名

```ts
useSeoConfig(options: {
  title: string          // <title> 与 og:title / twitter:title
  description: string    // meta description / og:description / twitter:description
  ogImage?: string       // 相对路径会自动拼接 siteUrl，绝对 URL 原样使用；缺省为 /images/og-default.png
  ogType?: string        // 默认 'website'，详情页可传 'article' / 'profile' 等
  path?: string          // 覆盖默认 route.path，用于动态 canonical
})
```

### 自动注入项

- `<title>`
- `description`
- `og:title` / `og:description` / `og:image` / `og:type` / `og:url` / `og:site_name`(`WorldCupDex`) / `og:locale`(根据 i18n 当前 locale 推导：zh→`zh_CN`、en→`en_US`、es→`es_ES`)
- `twitter:card`(`summary_large_image`) / `twitter:title` / `twitter:description` / `twitter:image` / `twitter:site`(`@worldcupdex`)
- `link[rel=canonical]`
- `link[rel=alternate]` × 4（zh / en / es / x-default）

### 示例

```vue
<script setup lang="ts">
const { t } = useI18n()

useSeoConfig({
  title: `${t('teams.title')} - WorldCupDex`,
  description: '浏览 2026 世界杯所有参赛球队……',
  ogImage: '/og/teams.png',          // 相对路径，自动 → https://worldcupdex.org/og/teams.png
})
</script>
```

### 动态数据（如详情页）

对 `useFetch`/`useAsyncData` 取得的数据，使用 `watchEffect` 触发：

```ts
watchEffect(() => {
  if (team.value) {
    const teamName = locale.value === 'en' ? team.value.nameEn : team.value.nameZh
    useSeoConfig({
      title: `${teamName} - World Cup 2026 | WorldCupDex`,
      description: `${teamName} 详细资料、阵容、赛程……`,
      ogImage: `https://flagcdn.com/w320/${team.value.code}.png`,
      ogType: 'profile',
    })
  }
})
```

---

## 4. `<SchemaOrg>` 组件用法

定义于 [components/SchemaOrg.vue](../components/SchemaOrg.vue)。
组件本身是 **renderless**：只通过 `useHead` 注入 `<script type="application/ld+json">` 节点，对 DOM 无影响。

### Props

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `type` | `'Organization' \| 'WebSite' \| 'SportsTeam' \| 'SportsEvent' \| 'Quiz'` | schema.org 类型 |
| `data` | `Record<string, any>` | 该类型的属性键值对，组件会自动合并 `@context: https://schema.org` 与 `@type` |

### 静态默认数据助手

```ts
import { getOrganizationSchema, getWebSiteSchema } from '~/components/SchemaOrg.vue'

const orgData = getOrganizationSchema(siteUrl, kickiqUrl)
const webSiteData = getWebSiteSchema(siteUrl)
```

### 模板用法

```vue
<template>
  <div>
    <SchemaOrg type="Organization" :data="organizationData" />
    <SchemaOrg type="WebSite" :data="webSiteData" />
    <!-- 其余页面内容 -->
  </div>
</template>
```

### 各类型 schema 字段范例（已落地）

| `type` | 关键字段 |
| --- | --- |
| `Organization` | `name`、`url`、`logo`、`sameAs[]`（含 KickIQ） |
| `WebSite` | `name`、`url`、`description`、`potentialAction.SearchAction → /data?q={search_term_string}` |
| `SportsTeam` | `name`、`alternateName`、`sport: 'Football'`、`logo`、`foundingDate`、`member[].Person` |
| `SportsEvent` | `name`、`startDate`、`location.Place`、`homeTeam`、`awayTeam`、`competitor[]`、`eventStatus` |
| `Quiz` | `name`、`about`、`educationalLevel`、`description` |

---

## 5. 添加新页面 SEO 的 checklist

新增任何 `pages/**` 路由时按下表自检：

- [ ] 在 `<script setup>` 顶部调用 `useSeoConfig({ title, description })`
- [ ] 准备页面专属的 `ogImage`（落到 `public/og/*.png`，1200×630）
- [ ] 详情类页面传入 `ogType: 'article' | 'profile'`
- [ ] 动态数据页面用 `watchEffect` 包裹 `useSeoConfig`
- [ ] 业务实体型页面追加合适的 `<SchemaOrg>`：球队 → `SportsTeam`，比赛 → `SportsEvent`，文章 → `Article`
- [ ] 验证 i18n（zh/en/es）下 title/description 不被截断（`<60` / `<160` 字符）
- [ ] `npm run build` 通过

---

## 6. Rich Results / Sharing 验证方法

### 本地预览

```powershell
# 在 worldcupdex 根目录
npm run build
node .output/server/index.mjs   # 启动 SSR 服务，默认 :3000
```

或预览 prerender 后的静态产物（如未来切换到静态部署）：

```powershell
npm run build
npx -y serve .output/public -l 4173
```

然后用浏览器 DevTools 查看页面 `<head>` 中的：
- `<meta property="og:*">`
- `<meta name="twitter:*">`
- `<script type="application/ld+json">`

### 在线验证（部署后）

| 工具 | URL |
| --- | --- |
| Google Rich Results Test | https://search.google.com/test/rich-results |
| Schema.org Validator | https://validator.schema.org/ |
| Twitter Card Validator | https://cards-dev.twitter.com/validator |
| Facebook Sharing Debugger | https://developers.facebook.com/tools/debug/ |
| LinkedIn Post Inspector | https://www.linkedin.com/post-inspector/ |

> ⚠️ 当前开发环境无外网，无法在 CI 中调用 Google Rich Results Test。请在每次部署到 Cloudflare Pages 后，由人工抽查若干页面。

### 建议抽查页面（5 条）

1. `/`（Organization + WebSite + SearchAction）
2. `/teams/BRA`（任意有效球队，验证 SportsTeam）
3. `/schedule`（验证 SportsEvent × 5）
4. `/quiz`（验证 Quiz）
5. `/predict/champion`（验证 OG 图与 Twitter Card）

---

## 7. 注意事项 / 已知占位

- **Twitter handle**：`@worldcupdex` 是占位，未来确认账号后在 `composables/useSeoConfig.ts` → `twitter:site` 字段替换。
- **默认 OG 图**：`public/images/og-default.png` 必须存在（1200×630 PNG），否则分享卡片会回退到默认图标。
- **球队头像**：`SportsTeam.logo` 当前用 `flagcdn.com` 国旗，若未来接入官方队徽源，更新 `pages/teams/[id].vue` 中的 `logo` 字段。
- **结果页动态分数**：`quiz/result.vue`、`fan-card/result.vue` 的 SEO 使用静态 fallback；动态分数仅在客户端 share 时通过 `SharePanel` 写入分享卡片图片中——SEO 抓取看到的是静态描述，符合预期。
- **siteUrl 切换**：本地与生产 siteUrl 由 `runtimeConfig.public.siteUrl` 控制；可通过环境变量 `NUXT_PUBLIC_SITE_URL` 覆盖。
