# WorldCupDex 脚本说明

所有本地凭据统一放在项目根目录 `.env`，不要再使用 `scripts/.env`。

如果本机访问 Google API 需要代理，也把代理写在根目录 `.env`：

```env
HTTPS_PROXY=http://127.0.0.1:10809
```

## 关键脚本

| 脚本 | 用途 | 命令 | 必要变量 |
| --- | --- | --- | --- |
| `gsc-auth.mjs` | 获取 Google OAuth refresh token | `node scripts/gsc-auth.mjs` | `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET` |
| `generate-gsc-report.mjs` | 生成 GSC 搜索报告 | `npm run gsc-report` | `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET`, `GSC_REFRESH_TOKEN`, `GSC_SITE_URL` |
| `generate-ga4-report.mjs` | 生成 GA4 流量报告 | `npm run ga4-report` | `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET`, `GSC_REFRESH_TOKEN`, `GA4_PROPERTY_ID`, `GA4_HOSTNAME` |
| `generate-ops-report.mjs` | 生成每日运营报告 | `npm run ops:report` | 上述 Google 变量 + Cloudflare 变量 |

## `.env` 最小配置

参考根目录 `.env.example`。至少需要以下变量：

```env
GA4_PROPERTY_ID=538207577
GA4_HOSTNAME=worldcupdex.org
GSC_SITE_URL=sc-domain:worldcupdex.org
GSC_CLIENT_ID=your_client_id.apps.googleusercontent.com
GSC_CLIENT_SECRET=your_client_secret
GSC_REFRESH_TOKEN=your_refresh_token
```

## 建立 Google OAuth 三元组

1. 在 Google Cloud Console 创建 OAuth Client，类型选 Desktop app。
2. 将 `GSC_CLIENT_ID` 和 `GSC_CLIENT_SECRET` 写入根目录 `.env`。
3. 确保同一个 Google 账号同时拥有：
   - Search Console 对 `sc-domain:worldcupdex.org` 的读取权限
   - GA4 Property `538207577` 的读取权限
4. 运行：

```bash
node scripts/gsc-auth.mjs
```

5. 浏览器完成授权后，把终端打印出的 `GSC_REFRESH_TOKEN` 写回根目录 `.env`。

## 验证

```bash
npm run gsc-report
npm run ga4-report
npm run ops:report
```

如果 Google 变量可用，这三个命令都不应再报“缺少 Google OAuth 三元组”。
