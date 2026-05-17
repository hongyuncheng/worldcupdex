import { getTeamDetail } from '../../utils/teams-manifest'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少球队 ID 参数。',
    })
  }

  const team = getTeamDetail(id)

  if (!team) {
    throw createError({
      statusCode: 404,
      statusMessage: `未找到球队 "${id}" 的数据。请确认球队 ID 正确，或先运行 \`npm run fetch-data\` 获取数据。`,
    })
  }

  return team
})
