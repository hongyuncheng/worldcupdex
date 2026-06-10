# WorldCupDex Operations Automation Standard

## Automation
- Name: `ops-wcd-daily-report`
- Frequency: daily at 09:30 in the user's local timezone
- Workspace: `E:\pc_workspace\tool\worldcupdex`
- Command: `npm run ops:report`
- Local output: `reports/ops/YYYY-MM-DD-ops-report.md`
- Notion output: child page under `wcd - WorldCupDex operations` in the Notion `运营目录`

## Automation Prompt Requirements
The automation must include:
- Project name: WorldCupDex
- Project code: wcd
- Production domain: https://worldcupdex.org
- Local workspace: E:\pc_workspace\tool\worldcupdex
- Use only the current project directory.
- Do not read other project configuration, credentials, or reports.
- Do not print secrets or raw tokens.
- If data attribution does not match `worldcupdex.org`, stop and tell the user.
- Write the daily report in Chinese.
- Create or update the day's Notion daily report page under the WorldCupDex operations page.

## Verification
Run these checks after script or automation changes:

```bash
node --check scripts/generate-ops-report.mjs
npm run ops:report
```

For full Nuxt validation, run:

```bash
npm run validate-data
npm run generate
```

## Report Template
```text
WorldCupDex 日报 - YYYY-MM-DD

健康状态：
流量：
搜索：
变现准备：
今日完成：
下一步：
需要老板确认：
```
