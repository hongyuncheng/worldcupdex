import type { TeamDetail } from '~/types'

let _teamsMap: Map<string, TeamDetail> | null = null

async function getTeamsMap(): Promise<Map<string, TeamDetail>> {
  if (!_teamsMap) {
    const teamModules = import.meta.glob<{ default: TeamDetail }>('../../../data/teams/*.json')
    _teamsMap = new Map<string, TeamDetail>()
    for (const [path, loader] of Object.entries(teamModules)) {
      const id = path.split('/').pop()?.replace('.json', '')
      if (id) {
        const mod = await loader()
        _teamsMap.set(id, mod.default)
      }
    }
  }
  return _teamsMap
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少球队 ID 参数。',
    })
  }

  const teamsMap = await getTeamsMap()
  const team = teamsMap.get(id)

  if (!team) {
    throw createError({
      statusCode: 404,
      statusMessage: `未找到球队 "${id}" 的数据。请确认球队 ID 正确，或先运行 \`npm run fetch-data\` 获取数据。`,
    })
  }

  return team
})
