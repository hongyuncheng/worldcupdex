import historicalStats from '~/data/team-historical-stats.json'
import teamsData from '~/data/teams.json'
import type { TeamDetail } from '~/types'

interface HistoricalStat {
  titles: number
  titleYears: number[]
  appearances: number
  bestResult: string
  legends: { en: string[]; zh: string[]; es: string[] }
  nickname: { en: string; zh: string; es: string }
  lastTitleGap: number
}

interface TeamNarrative {
  history: string
  prediction: string
  groupAnalysis: string
}

type Locale = 'zh' | 'en' | 'es'

const stats = historicalStats as Record<string, HistoricalStat>

/**
 * Get group mates for a given team (excluding itself).
 */
function getGroupMates(teamId: string, group: string) {
  return (teamsData as Array<{ id: string; nameZh: string; nameEn: string; fifaRank: number; group: string }>)
    .filter((t) => t.group === group && t.id !== teamId)
}

/**
 * Rank tier description based on FIFA ranking.
 */
function getRankTier(rank: number, locale: Locale): string {
  if (locale === 'zh') {
    if (rank <= 5) return '世界顶级强队'
    if (rank <= 15) return '一流劲旅'
    if (rank <= 30) return '实力不容小觑的队伍'
    return '充满拼劲的参赛队'
  }
  if (locale === 'es') {
    if (rank <= 5) return 'una de las mejores selecciones del mundo'
    if (rank <= 15) return 'una selección de primer nivel'
    if (rank <= 30) return 'un equipo con gran potencial'
    return 'un equipo competitivo'
  }
  if (rank <= 5) return 'one of the world\'s elite football teams'
  if (rank <= 15) return 'a top-tier footballing nation'
  if (rank <= 30) return 'a formidable contender'
  return 'a competitive participant'
}

function getAdvanceOdds(rank: number, locale: Locale): string {
  if (locale === 'zh') {
    if (rank <= 5) return '极高（>90%）'
    if (rank <= 15) return '很高（75-90%）'
    if (rank <= 30) return '中等偏上（55-75%）'
    return '有一定挑战（40-55%）'
  }
  if (locale === 'es') {
    if (rank <= 5) return 'muy alta (>90%)'
    if (rank <= 15) return 'alta (75-90%)'
    if (rank <= 30) return 'moderada-alta (55-75%)'
    return 'moderada (40-55%)'
  }
  if (rank <= 5) return 'very high (>90%)'
  if (rank <= 15) return 'high (75-90%)'
  if (rank <= 30) return 'moderate to high (55-75%)'
  return 'moderate (40-55%)'
}

// ========== Chinese Templates ==========

function generateHistoryZh(team: TeamDetail, stat: HistoricalStat | undefined): string {
  const name = team.nameZh
  if (stat) {
    const titleStr = stat.titleYears.join('、')
    const legends = stat.legends.zh.join('、')
    return `${name}（${stat.nickname.zh}）是世界足球历史上最具传奇色彩的球队之一。自${team.founded}年成立以来，他们已经${stat.appearances}次出征世界杯决赛圈，并${stat.titles}次捧起大力神杯（${titleStr}），在国际足坛享有崇高声望。

球队历史上涌现过无数传奇巨星，${legends}等名字至今仍被全球球迷津津乐道。他们的比赛风格深深烙印着本国足球文化的精髓——无论是技术流的华丽传控，还是坚韧不拔的防守反击，都在世界杯的舞台上留下了浓墨重彩的一笔。

距离上一次夺冠已过去${stat.lastTitleGap}年，${name}球迷对新一座奖杯的渴望与日俱增。2026年美加墨世界杯将是他们证明自己的又一次绝佳机会。以FIFA排名第${team.fifaRank}位的身份出征，${name}有能力也有底气在这场全球最大的足球盛宴中走得更远。`
  }

  return `${name}是一支来自${team.confederation}的国家队，成立于${team.founded}年，目前FIFA世界排名第${team.fifaRank}位。尽管他们在世界杯历史上尚未问鼎冠军宝座，但每一次踏上世界杯赛场都承载着全国球迷的梦想与期待。

在主教练${team.coach.nameZh}的带领下，${name}队正经历着令人振奋的上升期。球队阵容中不乏效力于欧洲顶级联赛的实力派球员，他们在各自俱乐部的出色表现为国家队注入了强大的竞争力。

2026年美加墨世界杯对${name}而言是一个重要的里程碑。分在${team.group}组的他们将面对实力各异的对手，但凭借扎实的技战术体系和团队凝聚力，${name}完全有可能在小组赛中脱颖而出，甚至在淘汰赛阶段创造惊喜。这支球队的每一场比赛都值得球迷的关注与期待。`
}

function generatePredictionZh(team: TeamDetail, stat: HistoricalStat | undefined): string {
  const name = team.nameZh
  const tier = getRankTier(team.fifaRank, 'zh')
  const odds = getAdvanceOdds(team.fifaRank, 'zh')

  if (stat && stat.titles >= 2) {
    return `作为${tier}，${name}以FIFA排名第${team.fifaRank}位的身份来到2026年世界杯。凭借${stat.titles}次夺冠的深厚底蕴和丰富的大赛经验，他们是本届赛事夺冠热门之一。

小组出线概率预估为${odds}。在主教练${team.coach.nameZh}的战术体系下，球队的整体配合与临场应变能力都处于上乘水平。如果核心球员保持健康且状态稳定，${name}有望在淘汰赛阶段走得很远，甚至再次站上最高领奖台。

不过世界杯向来是充满变数的赛事。密集的赛程、陌生的气候条件以及对手的针对性部署都可能成为变量。${name}能否在2026年重返巅峰，让我们拭目以待。`
  }

  return `${name}目前FIFA排名第${team.fifaRank}位，被视为${tier}。在主教练${team.coach.nameZh}的执教下，球队展现出了不错的竞技状态和战术纪律性。

根据目前的排名和近期表现，${name}的小组出线概率预估为${odds}。虽然他们可能不是夺冠的最大热门，但在世界杯这样的舞台上，任何球队都有创造奇迹的可能。

2026年世界杯采用48队赛制，小组前两名直接出线，这为更多球队提供了晋级机会。${name}若能在小组赛中把握住关键比赛，完全有机会闯入淘汰赛阶段。球迷们期待着${name}在这届世界杯上留下属于自己的精彩篇章。`
}

function generateGroupAnalysisZh(team: TeamDetail): string {
  const name = team.nameZh
  const mates = getGroupMates(team.id, team.group)
  const mateNames = mates.map((m) => `${m.nameZh}（FIFA排名第${m.fifaRank}位）`).join('、')

  return `${name}被分入${team.group}组，同组对手包括${mateNames}。这个小组的整体实力分布将直接影响${name}的出线前景。

从FIFA排名来看，${name}在${team.group}组中${team.fifaRank <= Math.min(...mates.map(m => m.fifaRank)) ? '排名最高，理论上占据一定优势' : '需要全力以赴才能确保出线'}。2026年世界杯采用全新的48队赛制，每组4支球队，前两名直接晋级32强淘汰赛，第三名仍有可能通过附加赛获得晋级资格。

小组赛的关键在于首战。世界杯历史数据表明，首战取胜的球队出线概率超过85%。${name}需要在首场比赛中就展现出最佳状态，建立信心和节奏。同时，合理的轮换策略和板凳深度也将成为小组赛阶段的重要考量。无论排名高低，世界杯小组赛从来不缺冷门，每一场比赛都可能改写出线格局。`
}

// ========== English Templates ==========

function generateHistoryEn(team: TeamDetail, stat: HistoricalStat | undefined): string {
  const name = team.nameEn
  if (stat) {
    const titleStr = stat.titleYears.join(', ')
    const legends = stat.legends.en.join(', ')
    return `${name} (${stat.nickname.en}) stands as one of the most storied national teams in football history. Since their founding in ${team.founded}, they have appeared in ${stat.appearances} World Cup tournaments, lifting the trophy ${stat.titles} time${stat.titles > 1 ? 's' : ''} (${titleStr}) — a record that cements their place among football's all-time greats.

The team's legacy is defined by legendary players who have graced the world stage: ${legends}, among many others. Their distinctive playing style — shaped by decades of footballing tradition — has produced some of the most iconic moments in World Cup history, from breathtaking individual brilliance to masterful tactical displays.

With ${stat.lastTitleGap} years since their last World Cup triumph, the hunger for another title is palpable. Entering the 2026 FIFA World Cup in the USA, Canada and Mexico ranked #${team.fifaRank} in the world, ${name} have both the pedigree and the talent pool to mount a serious challenge. Under head coach ${team.coach.nameEn}, this squad blends experienced veterans with exciting young talent, making them one of the most compelling teams to watch.`
  }

  return `${name} is a national football team representing the ${team.confederation} confederation, founded in ${team.founded} and currently ranked #${team.fifaRank} in the FIFA World Rankings. While they may not count World Cup titles among their honors, their journey to the 2026 tournament represents years of dedication and growth.

Under the guidance of head coach ${team.coach.nameEn}, ${name} have been steadily building a competitive squad capable of challenging established footballing nations. Their roster features players who ply their trade in top leagues around the world, bringing tactical awareness and big-game experience back to the national setup.

The 2026 FIFA World Cup marks a significant milestone for ${name}. Drawn into Group ${team.group}, they face a challenging but navigable path. With the expanded 48-team format offering more opportunities than ever, ${name} are well-positioned to make their mark. Every match at the World Cup is an opportunity to write history, and this squad has the talent and determination to produce memorable performances.`
}

function generatePredictionEn(team: TeamDetail, stat: HistoricalStat | undefined): string {
  const name = team.nameEn
  const tier = getRankTier(team.fifaRank, 'en')
  const odds = getAdvanceOdds(team.fifaRank, 'en')

  if (stat && stat.titles >= 2) {
    return `As ${tier}, ${name} arrive at the 2026 World Cup ranked #${team.fifaRank} in the world. With ${stat.titles} World Cup titles in their trophy cabinet, they carry the weight of history and the expectation of success in equal measure.

Their probability of advancing from the group stage is assessed as ${odds}. Head coach ${team.coach.nameEn} has developed a tactical system that maximizes the squad's strengths, blending individual flair with collective discipline. If key players stay fit and hit peak form, ${name} have the quality to go deep into the knockout rounds and challenge for the ultimate prize.

However, the World Cup is famously unpredictable. Fixture congestion, climate variations across three host countries, and opponents' targeted game plans all represent potential obstacles. Whether ${name} can translate their ranking and heritage into another championship run remains one of the most compelling storylines of the 2026 tournament.`
  }

  return `Ranked #${team.fifaRank} by FIFA, ${name} enter the 2026 World Cup as ${tier}. Under the tactical direction of ${team.coach.nameEn}, the team has shown promising form and competitive discipline in recent qualifying campaigns.

Based on current rankings and recent performances, their group-stage advancement probability is estimated at ${odds}. While they may not be among the outright favorites, the World Cup has a long tradition of producing upsets and breakthrough performances from underdog teams.

The 2026 World Cup's expanded 48-team format means the top two teams from each group advance directly to the Round of 32, providing more pathways to the knockout stage. If ${name} can deliver in the decisive group-stage matches, a place in the elimination rounds is well within reach. Fans and pundits alike will be watching closely to see if this squad can produce a tournament to remember.`
}

function generateGroupAnalysisEn(team: TeamDetail): string {
  const name = team.nameEn
  const mates = getGroupMates(team.id, team.group)
  const mateDesc = mates.map((m) => `${m.nameEn} (FIFA #${m.fifaRank})`).join(', ')

  return `${name} have been drawn into Group ${team.group}, where they will face ${mateDesc}. The competitive balance within this group will play a decisive role in determining ${name}'s path to the knockout stage.

In terms of FIFA rankings, ${name} ${team.fifaRank <= Math.min(...mates.map(m => m.fifaRank)) ? 'hold the highest position in the group, giving them a theoretical edge' : 'will need to be at their best to secure qualification'}. The 2026 World Cup introduces a new 48-team format with groups of four, where the top two teams advance directly to the Round of 32 and third-placed teams may still qualify via a playoff round.

The opening match is critical. Historical World Cup data shows that teams winning their first group match advance with over 85% probability. ${name} must come out strong and set the tone early. Squad depth, rotation management and adaptability across different venues and conditions will be equally important. Regardless of rankings, the World Cup group stage never fails to deliver surprises — every matchday has the potential to reshape the qualification picture.`
}

// ========== Spanish Templates ==========

function generateHistoryEs(team: TeamDetail, stat: HistoricalStat | undefined): string {
  const name = team.nameEn
  if (stat) {
    const titleStr = stat.titleYears.join(', ')
    const legends = stat.legends.es.join(', ')
    return `${name} (${stat.nickname.es}) es una de las selecciones más legendarias en la historia del fútbol mundial. Desde su fundación en ${team.founded}, han participado en ${stat.appearances} ediciones de la Copa del Mundo, levantando el trofeo en ${stat.titles} ocasión${stat.titles > 1 ? 'es' : ''} (${titleStr}), lo que les sitúa entre los gigantes del fútbol internacional.

Su legado está marcado por jugadores que definieron épocas enteras: ${legends}, entre muchos otros. Su estilo de juego, forjado a lo largo de décadas de tradición futbolística, ha producido algunos de los momentos más icónicos en la historia mundialista, desde genialidades individuales hasta exhibiciones tácticas magistrales.

Con ${stat.lastTitleGap} años desde su último título mundial, la sed de gloria es cada vez mayor. Llegando al Mundial 2026 en Estados Unidos, Canadá y México como número ${team.fifaRank} del ranking FIFA, ${name} cuenta con el linaje y el talento necesarios para ser protagonistas. Bajo la dirección de ${team.coach.nameEn}, esta plantilla combina experiencia y juventud de forma ilusionante.`
  }

  return `${name} es una selección nacional que representa a la ${team.confederation}, fundada en ${team.founded} y actualmente ubicada en el puesto #${team.fifaRank} del Ranking FIFA. Aunque aún no han conquistado la Copa del Mundo, cada participación en el torneo refleja años de esfuerzo y crecimiento.

Bajo la dirección técnica de ${team.coach.nameEn}, ${name} ha construido un plantel competitivo capaz de medirse con las potencias del fútbol mundial. Su roster incluye jugadores que militan en las principales ligas del mundo, aportando visión táctica y experiencia en partidos de alto nivel.

El Mundial 2026 representa un hito importante para ${name}. Ubicados en el Grupo ${team.group}, enfrentan un camino exigente pero transitable. Con el nuevo formato de 48 selecciones, las oportunidades de avanzar son mayores que nunca. Cada partido mundialista es una oportunidad para escribir historia, y esta plantilla tiene el talento y la determinación para protagonizar actuaciones memorables.`
}

function generatePredictionEs(team: TeamDetail, stat: HistoricalStat | undefined): string {
  const name = team.nameEn
  const tier = getRankTier(team.fifaRank, 'es')
  const odds = getAdvanceOdds(team.fifaRank, 'es')

  if (stat && stat.titles >= 2) {
    return `Como ${tier}, ${name} llega al Mundial 2026 como número ${team.fifaRank} del ranking FIFA. Con ${stat.titles} títulos mundiales en su palmarés, cargan tanto con el peso de la historia como con la expectativa de éxito.

Su probabilidad de avanzar de la fase de grupos se estima como ${odds}. El seleccionador ${team.coach.nameEn} ha desarrollado un sistema táctico que potencia las virtudes del plantel, combinando talento individual con disciplina colectiva. Si los jugadores clave mantienen la forma, ${name} tiene calidad de sobra para avanzar lejos en la fase eliminatoria y disputar el trofeo.

Sin embargo, el Mundial es famoso por su imprevisibilidad. La acumulación de partidos, las variaciones climáticas entre tres países sede y los planteamientos específicos de los rivales representan variables que pueden alterar cualquier pronóstico. Si ${name} logrará traducir su ranking y su legado en otra gesta mundialista es una de las grandes incógnitas del torneo.`
  }

  return `En el puesto ${team.fifaRank} del ranking FIFA, ${name} llega al Mundial 2026 como ${tier}. Bajo la batuta de ${team.coach.nameEn}, el equipo ha mostrado una forma prometedora y buena disciplina táctica en las recientes eliminatorias.

Según el ranking y las actuaciones recientes, su probabilidad de avanzar de la fase de grupos es ${odds}. Aunque quizá no estén entre los máximos favoritos, el Mundial tiene una larga tradición de sorpresas y revelaciones.

El formato ampliado de 48 selecciones del Mundial 2026 clasifica a los dos primeros de cada grupo directamente a los octavos de final, ofreciendo más vías hacia la fase eliminatoria. Si ${name} logra imponerse en los partidos decisivos, alcanzar la siguiente ronda está al alcance de la mano. Aficionados y analistas estarán atentos para ver si este equipo puede protagonizar un torneo para el recuerdo.`
}

function generateGroupAnalysisEs(team: TeamDetail): string {
  const name = team.nameEn
  const mates = getGroupMates(team.id, team.group)
  const mateDesc = mates.map((m) => `${m.nameEn} (FIFA #${m.fifaRank})`).join(', ')

  return `${name} ha quedado encuadrado en el Grupo ${team.group}, donde se enfrentará a ${mateDesc}. El equilibrio competitivo dentro de este grupo será determinante en el camino hacia la fase eliminatoria.

En términos de ranking FIFA, ${name} ${team.fifaRank <= Math.min(...mates.map(m => m.fifaRank)) ? 'ocupa la posición más alta del grupo, lo que le otorga una ventaja teórica' : 'necesitará rendir al máximo para asegurar la clasificación'}. El Mundial 2026 introduce un nuevo formato de 48 selecciones con grupos de cuatro, donde los dos primeros avanzan directamente a los octavos y el tercer clasificado aún podría obtener plaza vía repesca.

El partido inaugural es crucial. Los datos históricos de Mundiales demuestran que las selecciones que ganan su primer encuentro de grupo avanzan con más del 85% de probabilidad. ${name} debe salir con todo desde el primer minuto y marcar el ritmo. La profundidad de plantilla, la gestión de rotaciones y la capacidad de adaptación a distintas sedes y condiciones serán igualmente importantes. Sea cual sea el ranking, la fase de grupos del Mundial nunca defrauda — cada jornada tiene el potencial de alterar el panorama de clasificación.`
}

// ========== Main Composable ==========

export function useTeamNarrative(team: Ref<TeamDetail | null>, locale: Ref<string>): ComputedRef<TeamNarrative | null> {
  return computed(() => {
    if (!team.value) return null

    const t = team.value
    const lang = (locale.value || 'zh') as Locale
    const stat = stats[t.id]

    if (lang === 'en') {
      return {
        history: generateHistoryEn(t, stat),
        prediction: generatePredictionEn(t, stat),
        groupAnalysis: generateGroupAnalysisEn(t),
      }
    }

    if (lang === 'es') {
      return {
        history: generateHistoryEs(t, stat),
        prediction: generatePredictionEs(t, stat),
        groupAnalysis: generateGroupAnalysisEs(t),
      }
    }

    // Default: zh
    return {
      history: generateHistoryZh(t, stat),
      prediction: generatePredictionZh(t, stat),
      groupAnalysis: generateGroupAnalysisZh(t),
    }
  })
}
