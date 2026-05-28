import type { MatchItem, TeamDetail, TeamListItem } from '~/types'
import { getStaticMatchList, getStaticTeamDetail, getStaticTeamList } from '~/composables/useStaticWorldCupData'

export interface TeamRouteSlot {
  finish: '1st' | '2nd' | '3rd'
  label: string
  description: string
}

export interface TeamRouteData {
  team: TeamDetail
  group: string
  matches: MatchItem[]
  groupMatches: MatchItem[]
  relatedGroupMatches: MatchItem[]
  groupTeams: TeamListItem[]
  opponents: MatchItem['homeTeam'][]
  nextMatch: MatchItem | null
  slots: TeamRouteSlot[]
  hasKnownGroup: boolean
}

function sortMatches(matches: MatchItem[]) {
  return [...matches].sort((a, b) => a.timestamp - b.timestamp)
}

function getOpponent(match: MatchItem, teamId: string) {
  return match.homeTeam.id === teamId ? match.awayTeam : match.homeTeam
}

function matchTeamToListItem(matchTeam: MatchItem['homeTeam'], team: TeamDetail, group: string): TeamListItem {
  return {
    id: matchTeam.id,
    nameZh: matchTeam.nameZh,
    nameEn: matchTeam.nameEn,
    code: matchTeam.code,
    group,
    confederation: team.confederation || '',
    fifaRank: team.fifaRank || 0,
    flag: matchTeam.flag,
    coach: team.coach,
  }
}

function buildSlots(group: string): TeamRouteSlot[] {
  if (!group) return []

  return [
    {
      finish: '1st',
      label: `Group ${group} winner slot`,
      description: `If this team wins Group ${group}, it enters the official Round of 32 slot assigned to the Group ${group} winner.`,
    },
    {
      finish: '2nd',
      label: `Group ${group} runner-up slot`,
      description: `If this team finishes second in Group ${group}, it enters the official Round of 32 slot assigned to the Group ${group} runner-up.`,
    },
    {
      finish: '3rd',
      label: `Possible best third-place route`,
      description: 'Third-place qualification depends on the full tournament table and is not simulated on WorldCupDex.',
    },
  ]
}

export function getTeamRoute(teamId: string): TeamRouteData | null {
  const team = getStaticTeamDetail(teamId)
  if (!team) return null

  const matches = sortMatches(getStaticMatchList({ team: teamId }).data)
  const group = matches.find(match => match.group)?.group || team.group || ''
  const hasKnownGroup = Boolean(group)
  const groupMatches = hasKnownGroup
    ? sortMatches(getStaticMatchList({ group }).data.filter(match => match.stage === 'GROUP_STAGE'))
    : []
  const teamsById = Object.fromEntries(getStaticTeamList({ pageSize: 100 }).data.map(item => [item.id, item]))
  const groupTeamMap = new Map<string, TeamListItem>()

  matches.forEach((match) => {
    ;[match.homeTeam, match.awayTeam].forEach((matchTeam) => {
      if (!matchTeam.id || matchTeam.id === 'tbd') return
      const detail = getStaticTeamDetail(matchTeam.id)
      groupTeamMap.set(
        matchTeam.id,
        teamsById[matchTeam.id] || (detail ? matchTeamToListItem(matchTeam, detail, group) : {
          id: matchTeam.id,
          nameZh: matchTeam.nameZh,
          nameEn: matchTeam.nameEn,
          code: matchTeam.code,
          group,
          confederation: '',
          fifaRank: 0,
          flag: matchTeam.flag,
          coach: { nameEn: '', nameZh: '', nationality: '' },
        }),
      )
    })
  })

  const groupTeamIds = new Set(groupTeamMap.keys())
  const relatedGroupMatches = groupMatches.filter(match =>
    match.homeTeam.id !== teamId
    && match.awayTeam.id !== teamId
    && groupTeamIds.has(match.homeTeam.id)
    && groupTeamIds.has(match.awayTeam.id),
  )

  return {
    team,
    group,
    matches,
    groupMatches,
    relatedGroupMatches,
    groupTeams: Array.from(groupTeamMap.values()).sort((a, b) => {
      if (a.id === teamId) return -1
      if (b.id === teamId) return 1
      return a.nameEn.localeCompare(b.nameEn)
    }),
    opponents: matches.map(match => getOpponent(match, teamId)),
    nextMatch: matches.find(match => !match.score) || matches[0] || null,
    slots: buildSlots(group),
    hasKnownGroup,
  }
}
