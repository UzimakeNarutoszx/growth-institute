import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 后端服务地址
const API_BASE = 'http://localhost:3000'

// 用户信息 Store
export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  const phone = ref('')
  const nickname = ref('')
  const avatar = ref('')
  const token = ref('')
  const userId = ref(0)
  const childName = ref('')
  const childAge = ref(0)
  const childGender = ref<'male' | 'female'>('male')
  const childHeight = ref(0)
  const childWeight = ref(0)
  const isVip = ref(false)

  const childInfo = computed(() => {
    if (!childName.value && !childAge.value) return '请完善孩子信息'
    const parts = []
    if (childName.value) parts.push(childName.value)
    if (childAge.value) parts.push(`${childAge.value}岁`)
    if (childHeight.value) parts.push(`身高${childHeight.value}cm`)
    return parts.join(' | ')
  })

  /**
   * 通过后端返回的数据设置登录状态
   */
  function setLoginData(data: any) {
    isLoggedIn.value = true
    userId.value = data.user_id || 0
    phone.value = data.phone || ''
    nickname.value = data.nickname || ''
    avatar.value = data.avatar || ''
    token.value = data.token || ''
    isVip.value = !!data.is_vip
    if (data.child) {
      childName.value = data.child.name || ''
      childGender.value = data.child.gender || 'male'
      childHeight.value = data.child.height || 0
      childWeight.value = data.child.weight || 0
    }
    // 持久化 token
    uni.setStorageSync('auth_token', data.token)
  }

  /**
   * 注册
   */
  function register(phoneNum: string, password: string): Promise<{ code: number; message: string; data?: any }> {
    return new Promise((resolve) => {
      uni.request({
        url: `${API_BASE}/api/auth/register`,
        method: 'POST',
        data: { phone: phoneNum, password },
        success: (res: any) => {
          const result = res.data
          if (result.code === 0) {
            setLoginData(result.data)
          }
          resolve(result)
        },
        fail: () => {
          resolve({ code: -99, message: '网络错误，请检查后端服务是否启动' })
        }
      })
    })
  }

  /**
   * 登录
   */
  function login(phoneNum: string, password: string): Promise<{ code: number; message: string; data?: any }> {
    return new Promise((resolve) => {
      uni.request({
        url: `${API_BASE}/api/auth/login`,
        method: 'POST',
        data: { phone: phoneNum, password },
        success: (res: any) => {
          const result = res.data
          if (result.code === 0) {
            setLoginData(result.data)
          }
          resolve(result)
        },
        fail: () => {
          resolve({ code: -99, message: '网络错误，请检查后端服务是否启动' })
        }
      })
    })
  }

  /**
   * Token 自动登录
   */
  function autoLogin(): Promise<boolean> {
    const savedToken = uni.getStorageSync('auth_token')
    if (!savedToken) return Promise.resolve(false)

    return new Promise((resolve) => {
      uni.request({
        url: `${API_BASE}/api/auth/verify`,
        method: 'POST',
        data: { token: savedToken },
        success: (res: any) => {
          const result = res.data
          if (result.code === 0) {
            setLoginData(result.data)
            resolve(true)
          } else {
            uni.removeStorageSync('auth_token')
            resolve(false)
          }
        },
        fail: () => {
          resolve(false)
        }
      })
    })
  }

  function logout() {
    const savedToken = token.value
    // 通知后端
    if (savedToken) {
      uni.request({
        url: `${API_BASE}/api/auth/logout`,
        method: 'POST',
        data: { token: savedToken }
      })
    }
    isLoggedIn.value = false
    userId.value = 0
    phone.value = ''
    nickname.value = ''
    avatar.value = ''
    token.value = ''
    childName.value = ''
    childAge.value = 0
    childHeight.value = 0
    childWeight.value = 0
    uni.removeStorageSync('auth_token')
  }

  function updateChildInfo(info: Partial<{
    name: string
    age: number
    gender: 'male' | 'female'
    height: number
    weight: number
  }>) {
    if (info.name) childName.value = info.name
    if (info.age) childAge.value = info.age
    if (info.gender) childGender.value = info.gender
    if (info.height) childHeight.value = info.height
    if (info.weight) childWeight.value = info.weight
  }

  return {
    isLoggedIn,
    phone,
    nickname,
    avatar,
    token,
    userId,
    childName,
    childAge,
    childGender,
    childHeight,
    childWeight,
    isVip,
    childInfo,
    setLoginData,
    register,
    login,
    autoLogin,
    logout,
    updateChildInfo
  }
})

// 测评 Store
export const useAssessmentStore = defineStore('assessment', () => {
  const currentPart = ref(0)
  const currentQuestion = ref(0)
  const totalProgress = ref(0)
  const answers = ref<Record<string, string>>({})
  const isCompleted = ref(false)
  const score = ref(0)

  const parts = ref([
    { id: 'basic', title: '基础信息测评', questionCount: 8, status: 'not_started' as 'not_started' | 'in_progress' | 'completed', icon: '📋' },
    { id: 'nutrition', title: '饮食营养评估', questionCount: 15, status: 'not_started' as 'not_started' | 'in_progress' | 'completed', icon: '🍎' },
    { id: 'lifestyle', title: '生活习惯评估', questionCount: 10, status: 'not_started' as 'not_started' | 'in_progress' | 'completed', icon: '🏃' },
    { id: 'growth', title: '生长数据评估', questionCount: 5, status: 'not_started' as 'not_started' | 'in_progress' | 'completed', icon: '📈' }
  ])

  const historyReports = ref<{ id: string; date: string; score: number; summary: string }[]>([])

  function setAnswer(questionId: string, answer: string) {
    answers.value[questionId] = answer
  }

  function updatePartStatus(partId: string, status: 'not_started' | 'in_progress' | 'completed') {
    const part = parts.value.find(p => p.id === partId)
    if (part) part.status = status
  }

  function reset() {
    currentPart.value = 0
    currentQuestion.value = 0
    totalProgress.value = 0
    answers.value = {}
    isCompleted.value = false
    parts.value.forEach(p => p.status = 'not_started')
  }

  /**
   * 提交测评到后端
   */
  function submitToBackend(assessmentScore: number, summary: string): Promise<any> {
    const token = uni.getStorageSync('auth_token')
    return new Promise((resolve) => {
      uni.request({
        url: `${API_BASE}/api/assessment/submit`,
        method: 'POST',
        header: { 'x-token': token },
        data: { answers: answers.value, score: assessmentScore, summary },
        success: (res: any) => resolve(res.data),
        fail: () => resolve({ code: -99, message: '网络错误' })
      })
    })
  }

  /**
   * 从后端加载测评历史
   */
  function loadHistory(): Promise<void> {
    const token = uni.getStorageSync('auth_token')
    if (!token) return Promise.resolve()

    return new Promise((resolve) => {
      uni.request({
        url: `${API_BASE}/api/assessment/history`,
        method: 'GET',
        header: { 'x-token': token },
        success: (res: any) => {
          const result = res.data
          if (result.code === 0 && result.data) {
            historyReports.value = result.data
            if (result.data.length > 0) {
              isCompleted.value = true
              score.value = result.data[0].score
              totalProgress.value = 100
            } else {
              // 无记录时重置状态（防止切换账号后残留）
              isCompleted.value = false
              score.value = 0
              totalProgress.value = 0
              parts.value.forEach(p => p.status = 'not_started')
            }
          }
          resolve()
        },
        fail: () => resolve()
      })
    })
  }

  return {
    currentPart,
    currentQuestion,
    totalProgress,
    answers,
    isCompleted,
    score,
    parts,
    historyReports,
    setAnswer,
    updatePartStatus,
    reset,
    submitToBackend,
    loadHistory
  }
})

// 成长记录 Store
export const useGrowthStore = defineStore('growth', () => {
  const records = ref<{ date: string; height: number; weight: number }[]>([])

  const milestones = ref<{ date: string; event: string; icon: string }[]>([])

  const hasRecords = computed(() => records.value.length > 0)

  const monthGrowth = computed(() => {
    if (records.value.length < 2) return 0
    const last = records.value[records.value.length - 1]
    const prev = records.value[records.value.length - 2]
    return Number((last.height - prev.height).toFixed(1))
  })

  const quarterGrowth = computed(() => {
    if (records.value.length < 4) return 0
    const last = records.value[records.value.length - 1]
    const prev = records.value[Math.max(0, records.value.length - 4)]
    return Number((last.height - prev.height).toFixed(1))
  })

  const yearGrowth = computed(() => {
    if (records.value.length < 2) return 0
    const last = records.value[records.value.length - 1]
    const first = records.value[0]
    return Number((last.height - first.height).toFixed(1))
  })

  const compareLastYear = computed(() => 0)

  function addRecord(height: number, weight: number) {
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    records.value.push({ date: dateStr, height, weight })
    // 同步到后端
    addRecordToBackend(height, weight, dateStr)
  }

  function addRecordToBackend(height: number, weight: number, date: string) {
    const token = uni.getStorageSync('auth_token')
    if (!token) return
    uni.request({
      url: `${API_BASE}/api/growth/add`,
      method: 'POST',
      header: { 'x-token': token },
      data: { height, weight, date }
    })
  }

  function loadRecords(): Promise<void> {
    const token = uni.getStorageSync('auth_token')
    if (!token) return Promise.resolve()

    return new Promise((resolve) => {
      uni.request({
        url: `${API_BASE}/api/growth/list`,
        method: 'GET',
        header: { 'x-token': token },
        success: (res: any) => {
          const result = res.data
          if (result.code === 0 && result.data) {
            records.value = result.data
          }
          resolve()
        },
        fail: () => resolve()
      })
    })
  }

  function addMilestone(event: string, icon: string) {
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    milestones.value.push({ date: dateStr, event, icon })
  }

  return {
    records,
    milestones,
    hasRecords,
    monthGrowth,
    quarterGrowth,
    yearGrowth,
    compareLastYear,
    addRecord,
    loadRecords,
    addMilestone
  }
})

// 营养方案 Store
export const useNutritionStore = defineStore('nutrition', () => {
  const planName = ref('春季生长加速方案')
  const planDays = ref(30)
  const completedDays = ref(15)

  const todayTasks = ref([
    { id: '1', title: '早餐：鸡蛋1个 + 牛奶250ml', completed: false },
    { id: '2', title: '午餐：鱼肉/瘦肉50g', completed: false },
    { id: '3', title: '加餐：坚果一小把', completed: false },
    { id: '4', title: '晚餐：豆腐/豆制品', completed: false }
  ])

  const supplements = ref([
    { id: '1', time: '08:00', name: '维生素D', dose: '400IU', taken: false },
    { id: '2', time: '12:00', name: '乳钙', dose: '500mg', taken: false },
    { id: '3', time: '20:00', name: '锌补充剂', dose: '5mg', taken: false }
  ])

  const completedTaskCount = computed(() => todayTasks.value.filter(t => t.completed).length)
  const allTasksCompleted = computed(() => todayTasks.value.every(t => t.completed))

  function toggleTask(id: string) {
    const task = todayTasks.value.find(t => t.id === id)
    if (task) task.completed = !task.completed
  }

  function toggleSupplement(id: string) {
    const sup = supplements.value.find(s => s.id === id)
    if (sup) sup.taken = !sup.taken
  }

  return {
    planName,
    planDays,
    completedDays,
    todayTasks,
    supplements,
    completedTaskCount,
    allTasksCompleted,
    toggleTask,
    toggleSupplement
  }
})

// 运动计划 Store
export const useExerciseStore = defineStore('exercise', () => {
  const weekTarget = ref(300) // 分钟
  const weekCompleted = ref(180)
  const calories = ref(850)

  const todayExercises = ref([
    { id: '1', name: '跳绳训练', duration: '15分钟', difficulty: 3, icon: '🏃' },
    { id: '2', name: '摸高跳练习', duration: '10分钟', difficulty: 2, icon: '🤸' },
    { id: '3', name: '伸展运动', duration: '10分钟', difficulty: 1, icon: '🧘' }
  ])

  const badges = ref([
    { id: '1', name: '连续7天', icon: '🔥', unlocked: true },
    { id: '2', name: '月度达人', icon: '⭐', unlocked: true },
    { id: '3', name: '高度突破', icon: '🏆', unlocked: false }
  ])

  // 本月运动日历数据
  const exerciseDays = ref([3, 5, 6, 7, 10, 11, 12, 14, 15, 17, 18, 19, 21, 22, 24, 25, 26, 28])

  return {
    weekTarget,
    weekCompleted,
    calories,
    todayExercises,
    badges,
    exerciseDays
  }
})
