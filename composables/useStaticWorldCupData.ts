import type { ListResponse, MatchItem, PaginatedResponse, TeamDetail, TeamListItem, VenueItem } from '~/types'
import matchesData from '~/data/matches.json'
import teamsData from '~/data/teams.json'
import venuesData from '~/data/venues.json'

interface StaticMatchParams {
  stage?: string
  group?: string
  date?: string
  venue?: string
  team?: string
}

interface StaticTeamParams {
  group?: string
  confederation?: string
  search?: string
  sort?: string
  page?: number
  pageSize?: number
}

const teamDetailModules = import.meta.glob('../data/teams/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, TeamDetail>

const teamDetailsById = Object.fromEntries(
  Object.entries(teamDetailModules).map(([path, team]) => {
    const id = path.split('/').pop()?.replace('.json', '') || team.id
    return [id, team]
  }),
) as Record<string, TeamDetail>

const venueTimeZones: Record<string, string> = {
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
  Guadalajara: 'America/Mexico_City',
  Monterrey: 'America/Monterrey',
  Toronto: 'America/Toronto',
  Vancouver: 'America/Vancouver',
}

const getTimeZoneOffsetMs = (timeZone: string, utcMs: number): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(utcMs))

  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  const zonedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  )

  return zonedAsUtc - utcMs
}

const getMatchTimestamp = (match: MatchItem): number => {
  if (Number.isFinite(match.timestamp)) return match.timestamp

  const [year, month, day] = match.date.split('-').map(Number)
  const [hour, minute] = (match.time || '00:00').split(':').map(Number)
  const timeZone = venueTimeZones[match.venue.city] || 'UTC'
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0)
  const offset = getTimeZoneOffsetMs(timeZone, localAsUtc)
  const firstPass = localAsUtc - offset
  const correctedOffset = getTimeZoneOffsetMs(timeZone, firstPass)

  return localAsUtc - correctedOffset
}

const staticMatches = (matchesData as MatchItem[]).map(match => ({
  ...match,
  timestamp: getMatchTimestamp(match),
}))
const staticTeams = teamsData as TeamListItem[]
const staticVenues = venuesData as VenueItem[]

export function getStaticMatchList(params: StaticMatchParams = {}): ListResponse<MatchItem> {
  let filtered = [...staticMatches]

  if (params.stage) {
    filtered = filtered.filter(match => match.stage === params.stage)
  }

  if (params.group) {
    filtered = filtered.filter(match => match.group === params.group)
  }

  if (params.date) {
    filtered = filtered.filter(match => match.date === params.date)
  }

  if (params.venue) {
    const venueKeyword = params.venue.toLowerCase()
    filtered = filtered.filter(match =>
      match.venue.name.toLowerCase().includes(venueKeyword) ||
      match.venue.nameZh.includes(params.venue as string),
    )
  }

  if (params.team) {
    filtered = filtered.filter(match =>
      match.homeTeam.id === params.team || match.awayTeam.id === params.team,
    )
  }

  return {
    data: filtered,
    total: filtered.length,
  }
}

export function getStaticUpcomingMatches(limit = 5): MatchItem[] {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const today = `${year}-${month}-${day}`

  return staticMatches
    .filter(match => match.date >= today)
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.time.localeCompare(b.time)
    })
    .slice(0, limit)
}

export function getStaticTeamList(params: StaticTeamParams = {}): PaginatedResponse<TeamListItem> {
  let filtered = [...staticTeams]

  if (params.group) {
    filtered = filtered.filter(team => team.group === params.group)
  }

  if (params.confederation) {
    filtered = filtered.filter(team => team.confederation === params.confederation)
  }

  if (params.search) {
    const keyword = params.search.toLowerCase()
    filtered = filtered.filter(team =>
      team.nameZh.toLowerCase().includes(keyword) ||
      team.nameEn.toLowerCase().includes(keyword),
    )
  }

  if (params.sort === 'fifaRank' || params.sort === 'rank') {
    filtered.sort((a, b) => a.fifaRank - b.fifaRank)
  } else {
    filtered.sort((a, b) => a.group.localeCompare(b.group))
  }

  const total = filtered.length
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.max(1, Number(params.pageSize) || 48)
  const start = (page - 1) * pageSize

  return {
    data: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  }
}

export function getStaticTeamDetail(id: string): TeamDetail | null {
  if (!id) return null
  return teamDetailsById[id] || null
}

export function getStaticVenueList(): ListResponse<VenueItem> {
  return {
    data: staticVenues,
    total: staticVenues.length,
  }
}
