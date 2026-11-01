<template>
  <view class="page-container">
    <!-- 顶部进度条 -->
    <view class="question-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-inner">
        <view class="nav-back clickable" @tap="onBack">
          <text class="back-text">‹</text>
        </view>
        <view class="nav-progress">
          <text class="progress-text">{{ currentIndex + 1 }}/{{ questions.length }}</text>
        </view>
        <view class="nav-pause clickable" @tap="onPause">
          <text class="pause-text">暂存</text>
        </view>
      </view>
      <view class="progress-bar-full">
        <view class="progress-bar-fill" :style="{ width: progressPercent + '%' }" />
      </view>
    </view>
    <view :style="{ height: (statusBarHeight + 56) + 'px' }" />

    <!-- 题目展示区 -->
    <view class="question-area mx-lg mt-md">
      <view class="question-header">
        <text class="question-number">Q{{ currentIndex + 1 }}</text>
        <text class="part-label">{{ partTitle }}</text>
      </view>
      <text class="question-text">{{ currentQuestion.text }}</text>
    </view>

    <!-- 选项卡片区 -->
    <view class="options-area mx-lg mt-md">
      <view
        v-for="(option, index) in currentQuestion.options"
        :key="index"
        class="option-card"
        :class="{ selected: selectedOption === index }"
        @tap="selectOption(index)"
      >
        <view class="option-indicator" :class="{ 'indicator-selected': selectedOption === index }">
          <text class="indicator-text">{{ String.fromCharCode(65 + index) }}</text>
        </view>
        <view class="option-content flex-1">
          <text class="option-desc">{{ option.text }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-action safe-bottom">
      <view
        v-if="currentIndex > 0"
        class="btn-prev clickable"
        @tap="prevQuestion"
      >
        <text>上一题</text>
      </view>
      <view v-else class="btn-placeholder" />
      <view
        class="btn-next clickable"
        :class="{ 'btn-submit': isLastQuestion }"
        @tap="nextQuestion"
      >
        <text>{{ isLastQuestion ? '提交' : '下一题' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAssessmentStore } from '@/store'
import { navigateBack, showConfirm } from '@/utils/navigate'

const assessmentStore = useAssessmentStore()

const statusBarHeight = ref(0)
// #ifdef MP-WEIXIN || APP-PLUS
const sysInfo = uni.getSystemInfoSync()
statusBarHeight.value = sysInfo.statusBarHeight || 20
// #endif

const currentIndex = ref(0)
const selectedOption = ref<number | null>(null)
const partId = ref('nutrition')
const partTitle = ref('饮食营养评估')

// 完整题库
const allQuestions: Record<string, any[]> = {
  basic: [
    { text: '孩子的出生日期是？', options: [{ text: '已记录' }, { text: '需要补充' }, { text: '不确定' }] },
    { text: '父亲身高是多少？', options: [{ text: '170cm以上' }, { text: '165-170cm' }, { text: '165cm以下' }] },
    { text: '母亲身高是多少？', options: [{ text: '160cm以上' }, { text: '155-160cm' }, { text: '155cm以下' }] },
    { text: '孩子是否有过早产或低体重出生？', options: [{ text: '否，足月正常体重' }, { text: '轻度早产（34-37周）' }, { text: '重度早产（<34周）' }] },
    { text: '孩子目前的身高百分位？', options: [{ text: 'P50以上（中等偏上）' }, { text: 'P25-P50（中等偏下）' }, { text: 'P25以下（偏矮）' }] },
    { text: '家族中是否有晚发育（晚长）的情况？', options: [{ text: '有，家族有晚长史' }, { text: '没有' }, { text: '不确定' }] },
    { text: '孩子是否做过骨龄检测？', options: [{ text: '做过，骨龄正常' }, { text: '做过，骨龄偏大/偏小' }, { text: '未做过' }] },
    { text: '孩子目前是否在进行任何医学干预？', options: [{ text: '否' }, { text: '是' }, { text: '曾经有过' }] }
  ],
  nutrition: [
    { text: '孩子每天摄入优质蛋白质的情况？', options: [{ text: '3种及以上，总量达标' }, { text: '1-2种，总量基本达标' }, { text: '摄入不足，种类单一' }] },
    { text: '孩子每天的奶制品摄入量？', options: [{ text: '500ml及以上' }, { text: '250-500ml' }, { text: '不到250ml或不喝奶' }] },
    { text: '孩子每天吃蔬菜水果的情况？', options: [{ text: '每餐都有，种类丰富' }, { text: '偶尔吃，种类较少' }, { text: '很少吃蔬菜或水果' }] },
    { text: '孩子是否有补充维生素D的习惯？', options: [{ text: '每天补充400-800IU' }, { text: '偶尔补充，不规律' }, { text: '从未补充' }] },
    { text: '孩子的主食摄入情况？', options: [{ text: '粗细搭配，量适中' }, { text: '以精米白面为主' }, { text: '主食偏少，零食较多' }] },
    { text: '孩子是否经常吃零食或甜食？', options: [{ text: '很少吃，有良好习惯' }, { text: '偶尔吃，频率较低' }, { text: '经常吃，影响正餐' }] },
    { text: '孩子是否挑食？', options: [{ text: '不挑食，大多数食物都吃' }, { text: '轻度挑食，个别食物不吃' }, { text: '严重挑食，很多食物不吃' }] },
    { text: '孩子是否有补充钙剂的习惯？', options: [{ text: '有，每天定量补充' }, { text: '偶尔补充' }, { text: '从未补充' }] },
    { text: '孩子是否有补充锌的习惯？', options: [{ text: '有定期补充' }, { text: '偶尔补充' }, { text: '从未补充' }] },
    { text: '孩子早餐的情况？', options: [{ text: '每天吃，营养丰富' }, { text: '经常吃，但较简单' }, { text: '经常不吃早餐' }] },
    { text: '孩子的饮水量如何？', options: [{ text: '每天800-1200ml白水' }, { text: '喝水较少或以饮料为主' }, { text: '很少主动喝水' }] },
    { text: '晚餐时间和量的情况？', options: [{ text: '18:00前，量适中' }, { text: '较晚但量正常' }, { text: '很晚且量较大' }] },
    { text: '孩子是否经常喝碳酸饮料？', options: [{ text: '从不喝' }, { text: '偶尔喝' }, { text: '经常喝' }] },
    { text: '孩子的食欲如何？', options: [{ text: '食欲好，每餐都能吃饱' }, { text: '食欲一般' }, { text: '食欲差，经常不想吃' }] },
    { text: '是否关注过食品的营养标签？', options: [{ text: '经常关注，注意营养搭配' }, { text: '偶尔关注' }, { text: '从不关注' }] }
  ],
  lifestyle: [
    { text: '孩子每天的睡眠时间？', options: [{ text: '9小时以上' }, { text: '8-9小时' }, { text: '不到8小时' }] },
    { text: '孩子通常几点入睡？', options: [{ text: '21:30前' }, { text: '21:30-22:30' }, { text: '22:30以后' }] },
    { text: '孩子每天户外运动时间？', options: [{ text: '1小时以上' }, { text: '30分钟-1小时' }, { text: '不到30分钟' }] },
    { text: '孩子经常做哪类运动？', options: [{ text: '跳跃类（跳绳、篮球等）' }, { text: '跑步、游泳等' }, { text: '很少运动' }] },
    { text: '孩子使用电子屏幕的时间？', options: [{ text: '每天不超过1小时' }, { text: '1-3小时' }, { text: '超过3小时' }] },
    { text: '孩子的情绪状态？', options: [{ text: '开朗乐观，心情好' }, { text: '偶有情绪波动' }, { text: '经常焦虑或情绪低落' }] },
    { text: '孩子的学业压力？', options: [{ text: '较轻松' }, { text: '适中' }, { text: '压力较大' }] },
    { text: '孩子睡觉前的习惯？', options: [{ text: '安静阅读或放松' }, { text: '看电视/手机' }, { text: '剧烈活动或兴奋状态' }] },
    { text: '孩子的坐姿是否正确？', options: [{ text: '姿态良好' }, { text: '偶有驼背' }, { text: '经常弯腰驼背' }] },
    { text: '孩子是否经常生病？', options: [{ text: '很少生病，体质好' }, { text: '偶尔感冒' }, { text: '经常生病' }] }
  ],
  growth: [
    { text: '过去6个月孩子长高了多少？', options: [{ text: '3cm以上' }, { text: '2-3cm' }, { text: '不到2cm' }] },
    { text: '孩子近1年的体重变化？', options: [{ text: '增长2-3kg，匀速增长' }, { text: '增长过快或过慢' }, { text: '体重波动大或不稳定' }] },
    { text: '与同龄孩子相比，身高处于什么水平？', options: [{ text: '中等偏上' }, { text: '中等' }, { text: '偏矮' }] },
    { text: '是否出现过生长突增？', options: [{ text: '有明显的生长加速期' }, { text: '增长比较平稳' }, { text: '似乎增长停滞' }] },
    { text: '最近一次体检的身高体重数据？', options: [{ text: '各项指标正常' }, { text: '部分指标偏高或偏低' }, { text: '多项指标异常' }] }
  ]
}

const questions = ref<any[]>([])

onLoad((options: any) => {
  if (options?.part) {
    partId.value = options.part
    const part = assessmentStore.parts.find(p => p.id === options.part)
    if (part) {
      partTitle.value = part.title
    }
  }
  questions.value = allQuestions[partId.value] || allQuestions.nutrition
})

const currentQuestion = computed(() => questions.value[currentIndex.value] || { text: '', hint: '', options: [] })
const isLastQuestion = computed(() => currentIndex.value === questions.value.length - 1)
const progressPercent = computed(() => ((currentIndex.value + 1) / questions.value.length) * 100)

function selectOption(index: number) {
  selectedOption.value = index
  assessmentStore.setAnswer(`${partId.value}_${currentIndex.value}`, String(index))
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    // 恢复之前的选择
    const saved = assessmentStore.answers[`${partId.value}_${currentIndex.value}`]
    selectedOption.value = saved !== undefined ? Number(saved) : null
  }
}

function nextQuestion() {
  if (selectedOption.value === null) {
    uni.showToast({ title: '请选择一个选项', icon: 'none' })
    return
  }

  if (isLastQuestion.value) {
    // 提交，标记当前部分为已完成
    assessmentStore.updatePartStatus(partId.value, 'completed')
    // 计算总进度
    const completed = assessmentStore.parts.filter(p => p.status === 'completed').length
    assessmentStore.totalProgress = Math.round((completed / assessmentStore.parts.length) * 100)
    // 更新 currentPart 为下一个未完成的部分索引
    const nextIndex = assessmentStore.parts.findIndex(p => p.status !== 'completed')
    assessmentStore.currentPart = nextIndex >= 0 ? nextIndex : assessmentStore.parts.length - 1

    if (assessmentStore.totalProgress >= 100) {
      assessmentStore.isCompleted = true
      assessmentStore.score = 78
      const now = new Date()
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      const summary = '生长潜力良好，营养有优化空间'
      // 本地记录
      assessmentStore.historyReports.push({
        id: String(Date.now()),
        date: dateStr,
        score: 78,
        summary
      })
      // 同步到后端（不阻塞页面跳转）
      assessmentStore.submitToBackend(78, summary)
      // 发送通知到后端
      const token = uni.getStorageSync('auth_token')
      if (token) {
        uni.request({
          url: 'http://localhost:3000/api/notifications/add',
          method: 'POST',
          header: { 'x-token': token },
          data: {
            type: 'assessment',
            title: '测评完成',
            content: `您已完成全部测评，综合得分 78 分。${summary}`
          }
        })
      }
      // 跳转到加载过渡页
      uni.redirectTo({ url: '/pages/loadingPage/index' })
    } else {
      const nextPart = assessmentStore.parts[assessmentStore.currentPart]
      uni.showToast({ title: `本部分已完成！下一步：${nextPart.title}`, icon: 'none', duration: 2000 })
      setTimeout(() => navigateBack(), 2000)
    }
  } else {
    currentIndex.value++
    selectedOption.value = null
    // 检查是否有保存的答案
    const saved = assessmentStore.answers[`${partId.value}_${currentIndex.value}`]
    if (saved !== undefined) selectedOption.value = Number(saved)
  }
}

async function onBack() {
  // 如果还没开始答题（第一题且未选择），直接返回
  if (currentIndex.value === 0 && selectedOption.value === null) {
    safeNavigateBack()
    return
  }
  // 有答题进度时弹确认框
  const confirm = await showConfirm('退出测评', '当前答题进度已自动保存，确定要退出吗？')
  if (confirm) {
    assessmentStore.updatePartStatus(partId.value, 'in_progress')
    safeNavigateBack()
  }
}

function safeNavigateBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    navigateBack()
  } else {
    // 页面栈中没有上一页，跳转到测评首页
    uni.reLaunch({ url: '/pages/assessmentHomePage/index' })
  }
}

async function onPause() {
  const confirm = await showConfirm('暂停测评', '当前进度已自动保存，确定要退出吗？')
  if (confirm) {
    assessmentStore.updatePartStatus(partId.value, 'in_progress')
    safeNavigateBack()
  }
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #F8FAFF;
  padding-bottom: 180rpx;
}

/* 导航栏 */
.question-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #FFFFFF;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 32rpx;
}

.nav-back {
  padding: 10rpx;
}

.back-text {
  font-size: 44rpx;
  font-weight: bold;
  color: #333333;
}

.nav-progress {
  flex: 1;
  text-align: center;
}

.progress-text {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
}

.nav-pause {
  padding: 10rpx;
}

.pause-text {
  font-size: 28rpx;
  color: #4A9EFF;
}

.progress-bar-full {
  height: 6rpx;
  background: #E8F3FF;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4A9EFF, #36C2AA);
  transition: width 0.3s ease;
}

/* 题目区域 */
.question-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.question-number {
  font-size: 40rpx;
  font-weight: 700;
  color: #4A9EFF;
}

.part-label {
  font-size: 24rpx;
  color: #999999;
  background: #F0F8FF;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.question-text {
  font-size: 34rpx;
  font-weight: 500;
  color: #333333;
  line-height: 1.6;
  display: block;
}

/* 选项卡片 */
.option-card {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  border: 2rpx solid #E8F3FF;
  margin-bottom: 16rpx;
  transition: all 0.15s ease;
}

.option-card.selected {
  border-color: #4A9EFF;
  background: #F0F8FF;
}

.option-indicator {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background: #E8F3FF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.option-indicator.indicator-selected {
  background: #4A9EFF;
}

.indicator-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #4A9EFF;
}

.indicator-selected .indicator-text {
  color: #FFFFFF;
}

.option-desc {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.5;
  display: block;
}

/* 底部操作栏 */
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  background: #FFFFFF;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.btn-placeholder {
  width: 200rpx;
}

.btn-prev {
  width: 200rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F0F8FF;
  color: #4A9EFF;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.btn-next {
  width: 200rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4A9EFF;
  color: #FFFFFF;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.btn-submit {
  background: linear-gradient(135deg, #4A9EFF, #36C2AA);
  width: 260rpx;
}
</style>
