import { defineEventHandler, getRequestURL, sendRedirect } from 'h3'

const trailingSlashExceptions = new Set([
  '/quiz/play/',
  '/es/quiz/play/',
  '/zh/quiz/play/',
])

function shouldSkip(path: string) {
  return path.startsWith('/api/')
    || path.startsWith('/_nuxt/')
    || path.startsWith('/images/')
    || path.startsWith('/__sitemap__/')
    || path.includes('.')
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const originalPath = url.pathname

  if (originalPath === '/' || shouldSkip(originalPath)) {
    return
  }

  let canonicalPath = originalPath
    .replace(/^\/en(?=\/|$)/, '') || '/'

  canonicalPath = canonicalPath
    .replace(/^\/(es|zh)\/\1(?=\/|$)/, '/$1')
    .replace(/^\/(es|zh)?\/?matches\/?$/, (_, locale?: string) => locale ? `/${locale}/schedule` : '/schedule')

  if (trailingSlashExceptions.has(`${canonicalPath}/`)) {
    canonicalPath = `${canonicalPath}/`
  }

  if (
    canonicalPath.length > 1
    && canonicalPath.endsWith('/')
    && !trailingSlashExceptions.has(canonicalPath)
  ) {
    canonicalPath = canonicalPath.slice(0, -1)
  }

  if (canonicalPath !== originalPath) {
    return sendRedirect(event, `${canonicalPath}${url.search}`, 301)
  }
})
