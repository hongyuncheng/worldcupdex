import { readFile, writeFile } from 'node:fs/promises'

const routesPath = new URL('../dist/_routes.json', import.meta.url)
const requiredExcludes = [
  '/blog/*',
  '/zh/blog/*',
  '/es/blog/*',
  '/fan-card/*',
  '/zh/fan-card/*',
  '/es/fan-card/*',
  '/teams/*',
  '/zh/teams/*',
  '/es/teams/*',
  '/predict/*',
  '/zh/predict/*',
  '/es/predict/*',
  '/predictions/*',
  '/zh/predictions/*',
  '/es/predictions/*',
]

function globToRegExp(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
  const withWildcards = escaped.replace(/\*/g, '.+')
  return new RegExp(`^${withWildcards}$`)
}

function isCoveredByOtherPattern(route, patterns) {
  return patterns.some((pattern) => {
    if (pattern === route || !pattern.includes('*')) return false
    return globToRegExp(pattern).test(route)
  })
}

const routes = JSON.parse(await readFile(routesPath, 'utf8'))
const existingExcludes = Array.isArray(routes.exclude) ? routes.exclude : []
const mergedExcludes = [
  ...requiredExcludes,
  ...existingExcludes.filter(route => (
    !requiredExcludes.includes(route)
    && !/^\/(?:zh\/|es\/)?blog\/.+/.test(route)
  )),
]

const dedupedExcludes = [...new Set(mergedExcludes)]
const collapsedExcludes = dedupedExcludes.filter(route => !isCoveredByOtherPattern(route, dedupedExcludes))

routes.exclude = collapsedExcludes

await writeFile(routesPath, `${JSON.stringify(routes, null, 2)}\n`)
console.log(`Patched Cloudflare Pages routes: ${routes.exclude.length} total excludes`)
