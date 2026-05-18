# CI/CD 与 Cloudflare Pages 部署说明

本项目通过 GitHub Actions 实现 CI 验证与自动部署到 Cloudflare Pages。

## Workflow 概览

| 文件 | 触发条件 | 作用 |
| ---- | -------- | ---- |
| `.github/workflows/ci.yml` | `pull_request` → `main` | 在 Node.js 20 环境运行 `npm ci` + `npm run build` 做最小冒烟，构建失败即阻断合并 |
| `.github/workflows/deploy.yml` | `push` → `main` | 构建并通过 `cloudflare/wrangler-action@v3` 把 `dist/` 目录推送到 Cloudflare Pages 项目 `worldcupdex` |
| `.github/workflows/cron-data.yml` | `schedule`（`*/30 * * * *`） + `workflow_dispatch` | 定时拉取 football-data.org 数据并把 `data/` 改动 commit 回 `main`，触发 `deploy.yml` 自动重建 |

两个 workflow 都启用了 `actions/setup-node@v4` 自带的 npm 缓存以及对 `node_modules` 目录的额外缓存（key 基于 `package-lock.json` 哈希），以加速重复构建。

## 必需的 GitHub Secrets

请在 GitHub 仓库 **Settings → Secrets and variables → Actions** 中配置以下 secrets：

| Secret 名称 | 含义 | 用途 |
| ----------- | ---- | ---- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token，至少授予 *Pages:Edit* 权限 | `wrangler-action` 鉴权部署 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID | `wrangler-action` 定位目标账户 |
| `FOOTBALL_DATA_API_KEY` | football-data.org API Key | 构建时拉取/校验赛事数据 |
| `NUXT_PUBLIC_GA_ID` | Google Analytics 衡量 ID（如 `G-XXXX`） | 前端埋点 |
| `NUXT_PUBLIC_ADSENSE_CLIENT` | Google AdSense 客户端 ID（`ca-pub-...`） | 广告位脚本 |
| `NUXT_PUBLIC_KICKIQ_URL` | KickIQ 矩阵站点跳转 URL | 站内交叉导流入口 |

> Workflow 中仅以 `${{ secrets.* }}` 引用，**不写死任何明文值**。本地开发请使用 `.env`（已纳入 `.gitignore`）。

## 部署触发说明

1. **PR 检查**：向 `main` 提交 PR 后，`CI` workflow 会自动跑构建冒烟，必须绿灯才能合并。
2. **正式部署**：合并到 `main`（或直接 push）后，`Deploy to Cloudflare Pages` workflow 会：
   - 安装依赖（`npm ci`）
   - 注入上述 `NUXT_PUBLIC_*`、`FOOTBALL_DATA_API_KEY` 环境变量
   - 执行 `npm run build` 产出 `dist/`
   - 通过 `wrangler pages deploy dist --project-name=worldcupdex --branch=main` 推送到 Cloudflare Pages
3. **`wrangler.toml`**：项目根 `wrangler.toml` 锁定 `name`、`pages_build_output_dir`、`compatibility_date`、`compatibility_flags = ["nodejs_compat"]`，作为 `wrangler-action` 推送时的参考配置。
   > 注意：Cloudflare Pages 的 Git 直连构建流水线**不会**应用 `wrangler.toml` 中的 `compatibility_flags`。如果未来切换为 Git 直连构建，仍需在 Cloudflare Dashboard 的「设置 → 运行时 → 兼容性标志」中手动添加 `nodejs_compat`。

## 失败排错入口

- **GitHub Actions 日志**：仓库 → Actions → 选择对应 workflow run → 展开失败 step。
- **构建失败**：常见原因
  - `npm ci` 失败：检查 `package-lock.json` 是否被提交且与 `package.json` 同步。
  - `npm run build` 失败：本地复现 `npm run build`；注意 Node 版本必须为 **20**。
  - 缺少 secret 导致环境变量为空：检查 Settings → Secrets。
- **Cloudflare 部署失败**：
  - `wrangler-action` 鉴权失败 → 校验 `CLOUDFLARE_API_TOKEN` 权限范围与 `CLOUDFLARE_ACCOUNT_ID`。
  - 部署成功但站点报 `Cannot read private member #t` → 在 Cloudflare Dashboard 给该 Pages 项目手动加 `nodejs_compat` 兼容性标志。
  - 边缘运行时 `fs.readFile` 报 ENOENT → 改为 `import` 静态 JSON（参考项目历史经验）。
- **本地复现命令**：
  ```bash
  cd tool/worldcupdex
  npm ci
  npm run build
  npx wrangler pages deploy dist --project-name=worldcupdex --branch=preview
  ```

## 数据自动更新 cron

`.github/workflows/cron-data.yml` 负责赛事数据的定时拉取与回写，避免每次都靠人工 commit。

### 双频策略

| 阶段 | 时间窗口（UTC） | 实际执行频率 | 业务含义 |
| ---- | --------------- | ------------ | -------- |
| 赛前 / 赛后 | `< 2026-06-11` 或 `> 2026-07-20` | 每日 1 次：`04:00 UTC`（≈ 北京 12:00） | 每天同步赛程/分组等慢变数据即可 |
| 赛中 | `2026-06-11` ~ `2026-07-20` | 每 30 分钟 1 次（`*/30 * * * *`） | 比赛日需要尽快刷新比分、近期赛果 |

GitHub Actions 的 `schedule` 仅支持单一 cron 表达式，因此 workflow 统一以 `'*/30 * * * *'` 为触发频率，由 job 内部的 **stage gate** 步骤过滤掉赛前阶段非整点 04:00 的执行。

### stage gate 判断逻辑

stage gate 步骤（`Stage gate (...)`）使用 `bash` 计算当前 UTC 日期/时分：

1. 若 `github.event_name == 'workflow_dispatch'`（手动触发）：直接放行。
2. 若 `2026-06-11 <= TODAY <= 2026-07-20`（赛中）：直接放行，每 30 分钟跑一次。
3. 否则（赛前 / 赛后）：仅当 `HOUR == 04 && MIN == 00` 时放行；其他时刻设置 step output `skip=true`，后续步骤通过 `if: steps.gate.outputs.skip != 'true'` 全部跳过（job 仍标记为 success，不污染 Actions 历史）。

> 注意：步骤里的 shell 表达式在 GHA 的 Linux runner 上以 `bash` 执行，**不要用 PowerShell 复测**——本地排查时请在 WSL/Linux/Git Bash 中跑。Windows PowerShell 不识别 `[[ ]]`、`$(date -u +...)` 等语法。

### 步骤拆解

1. `actions/checkout@v4`（`ref: main`，保留凭证以便后续 `git push`）
2. `actions/setup-node@v4`（Node.js 20 + npm 缓存）+ `actions/cache@v4` 缓存 `node_modules`
3. **stage gate**：决定是否跳过本次执行
4. `npm ci`
5. `npm run fetch-data`（即 `node scripts/fetch-worldcup-data.mjs`），注入 `FOOTBALL_DATA_API_KEY`
6. `node scripts/fetch-recent-matches.mjs`，注入 `FOOTBALL_DATA_API_KEY`
7. `git diff --quiet -- data/` 判断是否有改动；无改动则 step output `changed=false`，后续步骤跳过
8. 配置 git 身份（`worldcupdex-bot <actions-bot@users.noreply.github.com>`）
9. `git add data/ && git commit -m "chore(data): auto-update WorldCup data <UTC ISO 时间戳>" && git push origin main`
10. push 触发 `deploy.yml`，由 Cloudflare Pages 重新构建发布——`cron-data.yml` 内**不再**显式调用部署。

### 安全控制

- `permissions: contents: write`：仅赋予 commit 数据所需的最小权限。
- `concurrency: { group: cron-data, cancel-in-progress: false }`：同一时间只允许一份数据更新作业运行，且不会取消进行中的作业，避免 push 冲突或半成品 commit。
- `if: github.repository == 'hongyuncheng/worldcupdex'`：fork 仓库不会触发，防止误触和 secret 泄露。

### 手动触发与调试

- **手动触发**：GitHub → Actions → `Auto update WorldCup data` → `Run workflow`，选择 `main` 分支。`workflow_dispatch` 路径会绕过 stage gate，立即跑完整流程。
- **PR 调试**：在 feature 分支临时改 stage gate 的日期范围（例如把 `2026-06-11` 改成今天）即可在 PR 上验证赛中分支逻辑；调通后**务必恢复**正式日期再合入 main。
- **本地干跑（不写回 Git）**：
  ```bash
  cd tool/worldcupdex
  npm ci
  FOOTBALL_DATA_API_KEY=xxx npm run fetch-data
  FOOTBALL_DATA_API_KEY=xxx node scripts/fetch-recent-matches.mjs
  git status data/
  ```
- 查看历史执行：Actions → `Auto update WorldCup data` → 选 run → 展开 `Stage gate ...` 步骤日志确认放行/跳过原因。

### 依赖的 Secret

cron 仅依赖 `FOOTBALL_DATA_API_KEY`（已在 `deploy.yml` 注释/上文 secrets 表中登记）。若该 secret 缺失或失效，stage gate 会通过，但 `fetch-data` / `fetch-recent-matches` 会因鉴权失败导致 job 红灯——届时去 `Settings → Secrets and variables → Actions` 重新配置即可。
