import type { QuizQuestion, QuizResult, TeamListItem } from '~/types'
import quizHistoryData from '~/data/quiz-history.json'

// 预定义知名球员和球队映射（避免大量API请求）
const FAMOUS_PLAYERS: { nameZh: string; nameEn: string; teamId: string; teamZh: string; teamEn: string }[] = [
  { nameZh: '梅西', nameEn: 'Messi', teamId: 'argentina', teamZh: '阿根廷', teamEn: 'Argentina' },
  { nameZh: '姆巴佩', nameEn: 'Mbappé', teamId: 'france', teamZh: '法国', teamEn: 'France' },
  { nameZh: '维尼修斯', nameEn: 'Vinícius Jr', teamId: 'brazil', teamZh: '巴西', teamEn: 'Brazil' },
  { nameZh: '哈兰德', nameEn: 'Haaland', teamId: 'norway', teamZh: '挪威', teamEn: 'Norway' },
  { nameZh: '贝林厄姆', nameEn: 'Bellingham', teamId: 'england', teamZh: '英格兰', teamEn: 'England' },
  { nameZh: '佩德里', nameEn: 'Pedri', teamId: 'spain', teamZh: '西班牙', teamEn: 'Spain' },
  { nameZh: '穆西亚拉', nameEn: 'Musiala', teamId: 'germany', teamZh: '德国', teamEn: 'Germany' },
  { nameZh: '德布劳内', nameEn: 'De Bruyne', teamId: 'belgium', teamZh: '比利时', teamEn: 'Belgium' },
  { nameZh: '范迪克', nameEn: 'Van Dijk', teamId: 'netherlands', teamZh: '荷兰', teamEn: 'Netherlands' },
  { nameZh: '莫德里奇', nameEn: 'Modrić', teamId: 'croatia', teamZh: '克罗地亚', teamEn: 'Croatia' },
  { nameZh: '孙兴慜', nameEn: 'Son Heung-min', teamId: 'south-korea', teamZh: '韩国', teamEn: 'South Korea' },
  { nameZh: '萨拉赫', nameEn: 'Salah', teamId: 'egypt', teamZh: '埃及', teamEn: 'Egypt' },
  { nameZh: '苏亚雷斯', nameEn: 'Suárez', teamId: 'uruguay', teamZh: '乌拉圭', teamEn: 'Uruguay' },
  { nameZh: '莱万多夫斯基', nameEn: 'Lewandowski', teamId: 'poland', teamZh: '波兰', teamEn: 'Poland' },
  { nameZh: 'C罗', nameEn: 'Cristiano Ronaldo', teamId: 'portugal', teamZh: '葡萄牙', teamEn: 'Portugal' },
  { nameZh: '内马尔', nameEn: 'Neymar', teamId: 'brazil', teamZh: '巴西', teamEn: 'Brazil' },
  { nameZh: '凯恩', nameEn: 'Kane', teamId: 'england', teamZh: '英格兰', teamEn: 'England' },
  { nameZh: '格列兹曼', nameEn: 'Griezmann', teamId: 'france', teamZh: '法国', teamEn: 'France' },
  { nameZh: '阿尔瓦雷斯', nameEn: 'Álvarez', teamId: 'argentina', teamZh: '阿根廷', teamEn: 'Argentina' },
  { nameZh: '亚马尔', nameEn: 'Yamal', teamId: 'spain', teamZh: '西班牙', teamEn: 'Spain' },
  { nameZh: '久保建英', nameEn: 'Kubo', teamId: 'japan', teamZh: '日本', teamEn: 'Japan' },
  { nameZh: '奥斯梅恩', nameEn: 'Osimhen', teamId: 'nigeria', teamZh: '尼日利亚', teamEn: 'Nigeria' },
  { nameZh: '福登', nameEn: 'Foden', teamId: 'england', teamZh: '英格兰', teamEn: 'England' },
  { nameZh: '京多安', nameEn: 'Gündogan', teamId: 'germany', teamZh: '德国', teamEn: 'Germany' },
  { nameZh: '努涅斯', nameEn: 'Núñez', teamId: 'uruguay', teamZh: '乌拉圭', teamEn: 'Uruguay' },
]

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getRandomItems<T>(arr: T[], count: number): T[] {
  return shuffleArray(arr).slice(0, count)
}

function generateTeamGroupQuestion(teams: TeamListItem[], locale: string): QuizQuestion {
  const validTeams = teams.filter(t => t.group)
  const target = validTeams[Math.floor(Math.random() * validTeams.length)]
  const allGroups = [...new Set(validTeams.map(t => t.group))]
  const wrongGroups = allGroups.filter(g => g !== target.group)
  const options3 = getRandomItems(wrongGroups, 3)

  const correctOption = { zh: `${target.group}组`, en: `Group ${target.group}`, es: `Grupo ${target.group}` }
  const wrongOptions = options3.map(g => ({ zh: `${g}组`, en: `Group ${g}`, es: `Grupo ${g}` }))

  const allOptions = shuffleArray([correctOption, ...wrongOptions])
  const correctIndex = allOptions.findIndex(o => o.en === correctOption.en)

  const teamName = locale === 'zh' ? target.nameZh : target.nameEn
  return {
    id: `tg_${target.id}`,
    type: 'team_group',
    question: {
      zh: `${target.nameZh}在2026世界杯中被分在哪个小组？`,
      en: `Which group is ${target.nameEn} in at the 2026 World Cup?`,
      es: `¿En qué grupo está ${target.nameEn} en el Mundial 2026?`,
    },
    options: allOptions,
    correctIndex,
    difficulty: 1,
  }
}

function generateTeamRankQuestion(teams: TeamListItem[]): QuizQuestion {
  const validTeams = teams.filter(t => t.group && t.fifaRank > 0)
  const selected = getRandomItems(validTeams, 4)
  const sorted = [...selected].sort((a, b) => a.fifaRank - b.fifaRank)
  const highest = sorted[0]

  const options = selected.map(t => ({ zh: t.nameZh, en: t.nameEn, es: t.nameEn }))
  const correctIndex = options.findIndex(o => o.en === highest.nameEn)

  return {
    id: `tr_${Date.now()}`,
    type: 'team_rank',
    question: {
      zh: '以下哪支球队FIFA排名最高？',
      en: 'Which of these teams has the highest FIFA ranking?',
      es: '¿Cuál de estos equipos tiene el ranking FIFA más alto?',
    },
    options,
    correctIndex,
    difficulty: 2,
  }
}

function generateTeamCoachQuestion(teams: TeamListItem[]): QuizQuestion {
  const validTeams = teams.filter(t => t.group && t.coach && t.coach.nameEn)
  const target = validTeams[Math.floor(Math.random() * validTeams.length)]
  const otherTeams = validTeams.filter(t => t.id !== target.id && t.coach.nameEn !== target.coach.nameEn)
  const wrongCoaches = getRandomItems(otherTeams, 3)

  const correctOption = { zh: target.coach.nameZh || target.coach.nameEn, en: target.coach.nameEn, es: target.coach.nameEn }
  const wrongOptions = wrongCoaches.map(t => ({
    zh: t.coach.nameZh || t.coach.nameEn,
    en: t.coach.nameEn,
    es: t.coach.nameEn,
  }))

  const allOptions = shuffleArray([correctOption, ...wrongOptions])
  const correctIndex = allOptions.findIndex(o => o.en === correctOption.en)

  return {
    id: `tc_${target.id}`,
    type: 'team_coach',
    question: {
      zh: `谁是${target.nameZh}队的主教练？`,
      en: `Who is the head coach of ${target.nameEn}?`,
      es: `¿Quién es el director técnico de ${target.nameEn}?`,
    },
    options: allOptions,
    correctIndex,
    difficulty: 2,
  }
}

function generatePlayerTeamQuestion(): QuizQuestion {
  const player = FAMOUS_PLAYERS[Math.floor(Math.random() * FAMOUS_PLAYERS.length)]
  const otherPlayers = FAMOUS_PLAYERS.filter(p => p.teamId !== player.teamId)
  const wrongTeams = getRandomItems(otherPlayers, 3)

  const correctOption = { zh: player.teamZh, en: player.teamEn, es: player.teamEn }
  const wrongOptions = wrongTeams.map(p => ({ zh: p.teamZh, en: p.teamEn, es: p.teamEn }))

  // 确保选项不重复
  const uniqueWrong: typeof wrongOptions = []
  const usedNames = new Set([correctOption.en])
  for (const opt of wrongOptions) {
    if (!usedNames.has(opt.en)) {
      uniqueWrong.push(opt)
      usedNames.add(opt.en)
    }
    if (uniqueWrong.length >= 3) break
  }

  // 如果不够3个错误选项，从其他球员补充
  if (uniqueWrong.length < 3) {
    for (const p of FAMOUS_PLAYERS) {
      if (!usedNames.has(p.teamEn)) {
        uniqueWrong.push({ zh: p.teamZh, en: p.teamEn, es: p.teamEn })
        usedNames.add(p.teamEn)
      }
      if (uniqueWrong.length >= 3) break
    }
  }

  const allOptions = shuffleArray([correctOption, ...uniqueWrong.slice(0, 3)])
  const correctIndex = allOptions.findIndex(o => o.en === correctOption.en)

  return {
    id: `pt_${player.teamId}_${Date.now()}`,
    type: 'player_team',
    question: {
      zh: `${player.nameZh}属于哪支国家队？`,
      en: `Which national team does ${player.nameEn} play for?`,
      es: `¿Para qué selección juega ${player.nameEn}?`,
    },
    options: allOptions,
    correctIndex,
    difficulty: 1,
  }
}

function getHistoryQuestion(): QuizQuestion {
  const questions = quizHistoryData as QuizQuestion[]
  return questions[Math.floor(Math.random() * questions.length)]
}

function calculatePercentile(score: number): number {
  if (score >= 100) return 97
  if (score >= 80) return 85
  if (score >= 60) return 65
  if (score >= 40) return 40
  if (score >= 20) return 20
  return 5
}

export function useQuiz() {
  const { t, locale } = useI18n()

  const questions = ref<QuizQuestion[]>([])
  const currentIndex = ref(0)
  const answers = ref<(number | null)[]>([])
  const timeLeft = ref(30)
  const isLoading = ref(false)
  const isFinished = ref(false)

  let timerInterval: ReturnType<typeof setInterval> | null = null
  let startTime = 0

  const currentQuestion = computed<QuizQuestion | null>(() => {
    return questions.value[currentIndex.value] || null
  })

  const progress = computed(() => {
    if (questions.value.length === 0) return 0
    return Math.round((currentIndex.value / questions.value.length) * 100)
  })

  async function startQuiz(): Promise<void> {
    isLoading.value = true
    isFinished.value = false
    currentIndex.value = 0
    answers.value = []
    timeLeft.value = 30

    try {
      // 获取球队数据
      const response = await $fetch<{ data: TeamListItem[] }>('/api/teams', {
        params: { pageSize: 100 },
      })

      const teams: TeamListItem[] = response?.data || []
      const validTeams = teams.filter(t => t.group)

      const generatedQuestions: QuizQuestion[] = []

      // 至少1道球队题
      if (validTeams.length >= 4) {
        const teamQuestionTypes = ['team_group', 'team_rank', 'team_coach']
        const randomType = teamQuestionTypes[Math.floor(Math.random() * teamQuestionTypes.length)]
        if (randomType === 'team_group') {
          generatedQuestions.push(generateTeamGroupQuestion(validTeams, locale.value))
        } else if (randomType === 'team_rank') {
          generatedQuestions.push(generateTeamRankQuestion(validTeams))
        } else {
          generatedQuestions.push(generateTeamCoachQuestion(validTeams))
        }
      }

      // 至少1道球员题
      generatedQuestions.push(generatePlayerTeamQuestion())

      // 至少1道历史题
      generatedQuestions.push(getHistoryQuestion())

      // 剩余2题随机
      const allTypes = ['team_group', 'team_rank', 'team_coach', 'player_team', 'history']
      for (let i = 0; i < 2; i++) {
        const type = allTypes[Math.floor(Math.random() * allTypes.length)]
        if (type === 'team_group' && validTeams.length >= 4) {
          generatedQuestions.push(generateTeamGroupQuestion(validTeams, locale.value))
        } else if (type === 'team_rank' && validTeams.length >= 4) {
          generatedQuestions.push(generateTeamRankQuestion(validTeams))
        } else if (type === 'team_coach' && validTeams.length >= 4) {
          generatedQuestions.push(generateTeamCoachQuestion(validTeams))
        } else if (type === 'player_team') {
          generatedQuestions.push(generatePlayerTeamQuestion())
        } else {
          generatedQuestions.push(getHistoryQuestion())
        }
      }

      // 打乱顺序并确保不重复
      const uniqueQuestions: QuizQuestion[] = []
      const usedIds = new Set<string>()
      for (const q of shuffleArray(generatedQuestions)) {
        if (!usedIds.has(q.id)) {
          uniqueQuestions.push(q)
          usedIds.add(q.id)
        }
      }

      // 如果由于重复不够5题，补充
      while (uniqueQuestions.length < 5) {
        const extra = getHistoryQuestion()
        if (!usedIds.has(extra.id)) {
          uniqueQuestions.push(extra)
          usedIds.add(extra.id)
        }
      }

      questions.value = uniqueQuestions.slice(0, 5)
      answers.value = new Array(5).fill(null)
      startTime = Date.now()
      startTimer()
    } finally {
      isLoading.value = false
    }
  }

  function startTimer() {
    stopTimer()
    timeLeft.value = 30
    timerInterval = setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0) {
        // 超时：停止计时器并记录超时答案
        // 由组件的 watch(timeLeft) 负责处理 UI 反馈和题目推进
        stopTimer()
        answers.value[currentIndex.value] = -1 // -1 表示超时
      }
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  function submitAnswer(optionIndex: number): { correct: boolean } {
    stopTimer()
    const question = questions.value[currentIndex.value]
    if (!question) return { correct: false }

    answers.value[currentIndex.value] = optionIndex
    const correct = optionIndex === question.correctIndex
    return { correct }
  }

  function nextQuestion() {
    if (currentIndex.value < questions.value.length - 1) {
      currentIndex.value++
      startTimer()
    } else {
      isFinished.value = true
      stopTimer()
    }
  }

  function getResult(): QuizResult {
    const correctCount = questions.value.reduce((count, q, i) => {
      return count + (answers.value[i] === q.correctIndex ? 1 : 0)
    }, 0)
    const score = correctCount * 20
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    const percentile = calculatePercentile(score)

    const result: QuizResult = {
      score,
      correctCount,
      totalQuestions: questions.value.length,
      timeSpent,
      percentile,
      date: new Date().toISOString(),
    }

    // 保存到 localStorage
    saveResult(result)
    return result
  }

  function getTitle(score: number): string {
    if (score >= 100) return 'quiz.titleEncyclopedia'
    if (score >= 80) return 'quiz.titleMaster'
    if (score >= 60) return 'quiz.titleSenior'
    if (score >= 40) return 'quiz.titleAmateur'
    return 'quiz.titleNewbie'
  }

  function getHistory(): QuizResult[] {
    if (import.meta.server) return []
    try {
      const raw = localStorage.getItem('wcd_quiz_history')
      if (!raw) return []
      return JSON.parse(raw) as QuizResult[]
    } catch {
      return []
    }
  }

  function saveResult(result: QuizResult) {
    if (import.meta.server) return
    try {
      const history = getHistory()
      history.unshift(result)
      // 只保留最近10次
      const trimmed = history.slice(0, 10)
      localStorage.setItem('wcd_quiz_history', JSON.stringify(trimmed))

      // 更新参与次数
      const count = parseInt(localStorage.getItem('wcd_quiz_count') || '0', 10)
      localStorage.setItem('wcd_quiz_count', String(count + 1))
    } catch {
      // ignore
    }
  }

  // 清理定时器
  onUnmounted(() => {
    stopTimer()
  })

  return {
    questions,
    currentIndex,
    answers,
    timeLeft,
    isLoading,
    isFinished,
    currentQuestion,
    progress,
    startQuiz,
    submitAnswer,
    nextQuestion,
    getResult,
    getTitle,
    getHistory,
  }
}
