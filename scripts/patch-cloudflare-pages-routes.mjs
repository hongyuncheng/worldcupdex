import { readFile, writeFile } from 'node:fs/promises'

const routesPath = new URL('../dist/_routes.json', import.meta.url)
const requiredExcludes = ['/blog/*', '/zh/blog/*', '/es/blog/*']

const routes = JSON.parse(await readFile(routesPath, 'utf8'))
const existingExcludes = Array.isArray(routes.exclude) ? routes.exclude : []
const dedupedExcludes = [
  ...requiredExcludes,
  ...existingExcludes.filter(route => (
    !requiredExcludes.includes(route)
    && !/^\/(?:zh\/|es\/)?blog\/.+/.test(route)
  )),
]

routes.exclude = dedupedExcludes

await writeFile(routesPath, `${JSON.stringify(routes, null, 2)}\n`)
console.log(`Patched Cloudflare Pages routes: ${requiredExcludes.join(', ')}`)
