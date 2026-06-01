# Buffer 草稿自动化

目标流程：

```text
生成 reports/social-promotion-YYYY-MM-DD/
执行 npm run buffer:prepare 同步图片到 public/social/YYYY-MM-DD/
部署站点
npm run buffer:drafts
人工在 Buffer Drafts 检查并排期
```

## 首次配置

在 <https://publish.buffer.com/settings/api> 创建 Personal Key，然后在项目根目录创建：

```text
secrets/buffer-token.txt
```

文件只放一行完整 key，不加 `Bearer`。`secrets/` 已被 `.gitignore` 忽略。

检查三个渠道是否匹配：

```bash
npm run buffer:channels
```

当前发布包使用：

```text
CupDex66613 = X / Twitter
nguyenvandung000862026 = Instagram
worldcupdex = Pinterest
```

## 日常命令

先同步图片并检查本次会提交给 Buffer 的内容：

```bash
npm run buffer:prepare
npm run buffer:drafts:dry-run
```

站点部署完成，确认图片公网 URL 已经可访问后，创建 Drafts：

```bash
npm run buffer:drafts
```

脚本自动选择最新的 `reports/social-promotion-*/buffer-posts.json`，逐条校验公网图片 URL，并调用 Buffer GraphQL API 创建草稿。结果写入同目录的 `buffer-results.json`。再次运行会跳过已经成功创建的条目，避免重复草稿。

如需指定某一天：

```bash
node scripts/buffer-create-drafts.mjs --input reports/social-promotion-2026-06-01/buffer-posts.json
```

`--force` 会重新创建已有条目，仅在确认需要重复草稿时使用。
