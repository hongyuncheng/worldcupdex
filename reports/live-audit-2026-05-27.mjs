import { chromium, devices } from 'playwright-core'
import fs from 'node:fs/promises'
import path from 'node:path'

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const base = 'https://worldcupdex.org'
const outDir = path.resolve('reports/live-audit-2026-05-27')
await fs.mkdir(outDir, { recursive: true })

const pages = [
  ['home', '/'],
  ['schedule', '/schedule'],
  ['predict', '/predict'],
  ['champion', '/predict/champion'],
  ['fan-card', '/fan-card'],
  ['quiz', '/quiz'],
  ['teams', '/teams'],
  ['blog', '/blog'],
]

const browser = await chromium.launch({
  headless: true,
  executablePath: chrome,
  args: ['--disable-gpu', '--no-sandbox'],
})

const results = []

async function auditPage(name, route, profileName, contextOptions) {
  const context = await browser.newContext(contextOptions)
  const page = await context.newPage()
  const consoleErrors = []
  const requestFailures = []
  const responses = []

  page.on('console', msg => {
    if (['error', 'warning'].includes(msg.type())) {
      consoleErrors.push({ type: msg.type(), text: msg.text().slice(0, 500) })
    }
  })
  page.on('requestfailed', req => {
    requestFailures.push({ url: req.url(), failure: req.failure()?.errorText || '' })
  })
  page.on('response', res => {
    const status = res.status()
    if (status >= 400) responses.push({ url: res.url(), status })
  })

  const url = `${base}${route}`
  const started = Date.now()
  let ok = true
  let error = ''
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(1200)
  } catch (e) {
    ok = false
    error = e.message
  }
  const elapsedMs = Date.now() - started

  const info = await page.evaluate(() => {
    const visibleText = document.body?.innerText || ''
    const links = [...document.querySelectorAll('a[href]')].slice(0, 80).map(a => ({
      text: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120),
      href: a.href,
    }))
    return {
      title: document.title,
      h1: [...document.querySelectorAll('h1')].map(h => h.textContent?.trim()).filter(Boolean),
      metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
      jsonLdCount: document.querySelectorAll('script[type="application/ld+json"]').length,
      textSample: visibleText.slice(0, 1200),
      hasMojibake: /鈫|馃|锛|涓栫晫|�/.test(visibleText),
      links,
      bodyLength: visibleText.length,
    }
  }).catch(e => ({ evaluateError: e.message }))

  const screenshot = path.join(outDir, `${profileName}-${name}.png`)
  await page.screenshot({ path: screenshot, fullPage: false }).catch(() => {})

  await context.close()
  results.push({
    name,
    route,
    profileName,
    url,
    ok,
    error,
    elapsedMs,
    screenshot,
    consoleErrors,
    requestFailures,
    badResponses: responses,
    info,
  })
}

const desktop = { viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 }
const mobile = { ...devices['iPhone 13'], locale: 'en-US' }

for (const [name, route] of pages) {
  await auditPage(name, route, 'desktop', desktop)
}

for (const [name, route] of pages.slice(0, 6)) {
  await auditPage(name, route, 'mobile', mobile)
}

// Interaction smoke checks.
const context = await browser.newContext(desktop)
const page = await context.newPage()
const interaction = { steps: [], errors: [] }
page.on('console', msg => {
  if (['error', 'warning'].includes(msg.type())) interaction.errors.push(`${msg.type()}: ${msg.text().slice(0, 400)}`)
})

try {
  await page.goto(`${base}/schedule`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForTimeout(1000)
  const buttons = await page.locator('button').evaluateAll(btns => btns.map((b, i) => ({
    i,
    text: b.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80),
    aria: b.getAttribute('aria-label') || '',
  })).slice(0, 80))
  interaction.steps.push({ page: 'schedule', buttons })
  const exportButton = page.getByRole('button', { name: /Export Schedule|导出|瀵煎嚭/i })
  if (await exportButton.count()) {
    await exportButton.first().click({ timeout: 5000 }).catch(e => interaction.errors.push(`schedule export click: ${e.message}`))
    interaction.steps.push({ page: 'schedule', exportClicked: true })
  }

  await page.goto(`${base}/fan-card`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForTimeout(1000)
  const teamButtons = await page.locator('button').evaluateAll(btns => btns.map((b, i) => ({
    i,
    text: b.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80),
  })).filter(x => x.text).slice(0, 40))
  interaction.steps.push({ page: 'fan-card', firstButtons: teamButtons })
  const argentina = page.getByText('Argentina', { exact: true })
  if (await argentina.count()) {
    await argentina.first().click({ timeout: 5000 }).catch(e => interaction.errors.push(`fan-card Argentina click: ${e.message}`))
    await page.waitForTimeout(1200)
    await page.screenshot({ path: path.join(outDir, 'desktop-fan-card-after-team.png'), fullPage: false })
    interaction.steps.push({ page: 'fan-card', selectedArgentina: true })
  }

  await page.goto(`${base}/quiz`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForTimeout(1000)
  const start = page.getByRole('button', { name: /Start Challenge|开始|寮€始/i })
  if (await start.count()) {
    await start.first().click({ timeout: 5000 }).catch(e => interaction.errors.push(`quiz start click: ${e.message}`))
    await page.waitForTimeout(1200)
    interaction.steps.push({ page: 'quiz', urlAfterStart: page.url(), title: await page.title() })
    await page.screenshot({ path: path.join(outDir, 'desktop-quiz-after-start.png'), fullPage: false })
  }
} catch (e) {
  interaction.errors.push(e.message)
} finally {
  await context.close()
}

await browser.close()

const report = { generatedAt: new Date().toISOString(), base, results, interaction }
await fs.writeFile(path.join(outDir, 'results.json'), JSON.stringify(report, null, 2), 'utf8')

const summary = results.map(r => ({
  page: `${r.profileName}/${r.name}`,
  ok: r.ok,
  elapsedMs: r.elapsedMs,
  title: r.info?.title,
  h1: r.info?.h1,
  bodyLength: r.info?.bodyLength,
  hasMojibake: r.info?.hasMojibake,
  consoleErrors: r.consoleErrors.length,
  requestFailures: r.requestFailures.length,
  badResponses: r.badResponses.length,
  screenshot: r.screenshot,
}))

console.log(JSON.stringify({ summary, interaction }, null, 2))
