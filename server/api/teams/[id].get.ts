import { readFile } from 'fs/promises'
import { resolve } from 'path'
import type { TeamDetail } from '~/types'

// 模块级缓存（按 id 存储）
const teamDetailCache = new Map<string, TeamDetail>()

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少球队 ID 参数。',
    })
  }

  // 检查缓存
  if (teamDetailCache.has(id)) {
    return teamDetailCache.get(id)
  }

  const filePath = resolve(process.cwd(), `data/teams/${id}.json`)
  try {
    const raw = await readFile(filePath, 'utf-8')
    const team = JSON.parse(raw) as TeamDetail
    teamDetailCache.set(id, team)
    return team
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw createError({
        statusCode: 404,
        statusMessage: `未找到球队 "${id}" 的数据。请确认球队 ID 正确，或先运行 \`npm run fetch-data\` 获取数据。`,
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: '读取球队数据时发生错误。',
    })
  }
})
