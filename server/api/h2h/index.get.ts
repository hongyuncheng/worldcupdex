import h2hData from '~/data/h2h-worldcup.json'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const teamA = String(query.teamA || '').toLowerCase().trim()
  const teamB = String(query.teamB || '').toLowerCase().trim()

  if (!teamA || !teamB) {
    throw createError({ statusCode: 400, statusMessage: 'teamA and teamB are required' })
  }

  // 按字母顺序排序，保证 key 唯一
  const [first, second] = [teamA, teamB].sort()
  const key = `${first}-${second}`

  const record = (h2hData as unknown as Record<string, { wins: number; draws: number; losses: number }>)[key]

  if (!record) {
    return { data: null }
  }

  // wins/draws/losses 是从 teamA 视角（first team 视角）
  // 如果 teamA 是排序后的 first，则直接返回；否则交换胜负
  const isSwapped = teamA !== first

  return {
    data: {
      teamA,
      teamB,
      wins: isSwapped ? record.losses : record.wins,
      draws: record.draws,
      losses: isSwapped ? record.wins : record.losses,
      total: record.wins + record.draws + record.losses,
    },
  }
})
