import type { MatchItem } from '~/types'

const venueTimeZonesByCity: Record<string, string> = {
  'East Rutherford': 'America/New_York',
  Arlington: 'America/Chicago',
  Inglewood: 'America/Los_Angeles',
  'Miami Gardens': 'America/New_York',
  Philadelphia: 'America/New_York',
  Atlanta: 'America/New_York',
  Houston: 'America/Chicago',
  Seattle: 'America/Los_Angeles',
  Foxborough: 'America/New_York',
  'Kansas City': 'America/Chicago',
  Nashville: 'America/Chicago',
  'Mexico City': 'America/Mexico_City',
  Zapopan: 'America/Mexico_City',
  Guadalupe: 'America/Monterrey',
  Toronto: 'America/Toronto',
  Vancouver: 'America/Vancouver',
  'Santa Clara': 'America/Los_Angeles',
}

export type MatchTimeMode = 'venue' | 'local'

export function getMatchDate(match?: Pick<MatchItem, 'date' | 'time' | 'timestamp'> | null): Date {
  if (!match) return new Date(Number.NaN)
  if (Number.isFinite(match.timestamp)) return new Date(match.timestamp)
  return new Date(`${match.date}T${match.time || '00:00'}:00Z`)
}

export function getMatchTimeZone(match: MatchItem): string {
  return match.venue.timeZone || venueTimeZonesByCity[match.venue.city] || 'UTC'
}

function localeCode(locale: string): string {
  if (locale === 'zh') return 'zh-CN'
  if (locale === 'es') return 'es-ES'
  return 'en-US'
}

function timeZoneOption(match: MatchItem, mode: MatchTimeMode): { timeZone?: string } {
  return mode === 'venue' ? { timeZone: getMatchTimeZone(match) } : {}
}

export function formatMatchDateParts(match: MatchItem, locale: string, mode: MatchTimeMode) {
  const formatter = new Intl.DateTimeFormat(localeCode(locale), {
    ...timeZoneOption(match, mode),
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'long',
  })
  const parts = Object.fromEntries(formatter.formatToParts(getMatchDate(match)).map(part => [part.type, part.value]))

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday: parts.weekday || '',
  }
}

export function formatMatchDateLabel(match: MatchItem, locale: string, mode: MatchTimeMode): string {
  const { year, month, day, weekday } = formatMatchDateParts(match, locale, mode)
  if (locale === 'zh') return `${year}年${month}月${day}日 ${weekday}`
  return new Intl.DateTimeFormat(localeCode(locale), {
    ...timeZoneOption(match, mode),
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(getMatchDate(match))
}

export function formatMatchClock(match: MatchItem, locale: string, mode: MatchTimeMode): string {
  return new Intl.DateTimeFormat(localeCode(locale), {
    ...timeZoneOption(match, mode),
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(getMatchDate(match))
}

export function formatMatchShortDateTime(match: MatchItem, locale: string, mode: MatchTimeMode): string {
  return new Intl.DateTimeFormat(localeCode(locale), {
    ...timeZoneOption(match, mode),
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(getMatchDate(match))
}

export function formatMatchShortDate(match: MatchItem, locale: string, mode: MatchTimeMode): string {
  return new Intl.DateTimeFormat(localeCode(locale), {
    ...timeZoneOption(match, mode),
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(getMatchDate(match))
}

export function getMatchIsoStart(match: MatchItem): string {
  return getMatchDate(match).toISOString()
}
