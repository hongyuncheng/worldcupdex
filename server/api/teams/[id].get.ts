import type { TeamDetail } from '~/types'

// 构建时通过 glob 导入所有球队详情 JSON
const teamModules = import.meta.glob<TeamDetail>('../../../data/teams/*.json', {
  eager: true,
  import: 'default',
})

// 构建 id → TeamDetail 的查找表
const teamsMap = new Map<string, TeamDetail>()
for (const [path, data] of Object.entries(teamModules)) {
  const id = path.split('/').pop()?.replace('.json', '')
  if (id && data) {
    teamsMap.set(id, data)
  }
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少球队 ID 参数。',
    })
  }

  const team = teamsMap.get(id)

  if (!team) {
    throw createError({
      statusCode: 404,
      statusMessage: `未找到球队 "${id}" 的数据。请确认球队 ID 正确，或先运行 \`npm run fetch-data\` 获取数据。`,
    })
  }

  return team
})
