<template>
  <view class="page-container">
    <NavBar title="科学测评" />

    <!-- 顶部进度指示器 -->
    <view class="card progress-card" v-if="assessmentStore.totalProgress > 0 && !assessmentStore.isCompleted">
      <view class="flex-between">
        <text class="text-subtitle">当前进度</text>
        <text class="progress-percent">{{ assessmentStore.totalProgress }}%</text>
      </view>
      <view class="progress-bar-wrap mt-sm">
        <view class="progress-bar-fill" :style="{ width: assessmentStore.totalProgress + '%' }" />
      </view>
    </view>

    <!-- 测评分类卡片区 -->
    <SectionTitle title="测评项目" :marginTop="24" />
    <view class="parts-list">
      <view
        v-for="part in assessmentStore.parts"
        :key="part.id"
        class="part-card card clickable"
        @tap="onPartTap(part)"
      >
        <view class="flex-row">
          <view class="part-icon-wrap">
            <text class="part-icon">{{ part.icon }}</text>
          </view>
          <view class="part-info flex-1">
            <text class="part-title">{{ part.title }}</text>
            <text class="part-count">共{{ part.questionCount }}题</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 核心数据看板（测评完成后显示） -->
    <view v-if="assessmentStore.isCompleted">
      <SectionTitle title="核心数据" :marginTop="32" />
      <view class="data-cards flex-row flex-wrap mx-lg">
        <view class="data-card clickable" @tap="onDataCardTap('height')">
          <text class="data-icon">📏</text>
          <text class="data-label">遗传靶身高</text>
          <text class="data-value">168-178cm</text>
        </view>
        <view class="data-card clickable" @tap="onDataCardTap('speed')">
          <text class="data-icon">📈</text>
          <text class="data-label">生长速度(6月)</text>
          <text class="data-value">3.2cm <text class="tag tag-completed">正常</text></text>
        </view>
        <view class="data-card clickable" @tap="onDataCardTap('nutrition')">
          <text class="data-icon">⚡</text>
          <text class="data-label">营养缺口</text>
          <text class="data-value">钙、锌、维D</text>
        </view>
      </view>
    </view>

    <!-- 开始/继续测评按钮 -->
    <view class="action-wrap mx-lg mt-lg">
      <view class="btn-gradient" @tap="onStartAssessment">
        {{ buttonText }}
      </view>
      <view v-if="assessmentStore.isCompleted" class="btn-reassess clickable" @tap="onReassess">
        <text class="btn-reassess-text">再次测评</text>
      </view>
    </view>

    <!-- 历史测评记录 -->
    <SectionTitle title="历史测评报告" :marginTop="32" />
    <view v-if="assessmentStore.historyReports.length === 0" class="empty-state" style="padding: 40rpx 0;">
      <text class="empty-icon">📝</text>
      <text class="empty-text">暂无测评记录，完成测评后将自动生成</text>
    </view>
    <view v-else class="history-list">
      <view
        v-for="report in assessmentStore.historyReports"
        :key="report.id"
        class="card history-item flex-between clickable"
        @tap="onViewReport(report)"
      >
        <view>
          <text class="history-date">{{ report.date }}</text>
          <text class="history-summary">{{ report.summary }}</text>
        </view>
        <view class="flex-row">
          <text class="history-score">{{ report.score }}分</text>
          <text class="arrow-right">›</text>
        </view>
      </view>
    </view>

    <view style="height: 40rpx;" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import NavBar from '@/components/NavBar.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import { useAssessmentStore, useUserStore } from '@/store'
import { navigateTo } from '@/utils/navigate'

const assessmentStore = useAssessmentStore()
const userStore = useUserStore()

// 每次页面显示时从后端刷新数据
onShow(() => {
  if (userStore.isLoggedIn) {
    assessmentStore.loadHistory()
  }
})

const buttonText = computed(() => {
  if (assessmentStore.isCompleted) return '查看测评报告'
  if (assessmentStore.totalProgress > 0) {
    const nextPart = assessmentStore.parts.find(p => p.status !== 'completed')
    if (nextPart) {
      const partIndex = assessmentStore.parts.indexOf(nextPart)
      return `继续测评（第${partIndex + 1}部分 · ${nextPart.title}）`
    }
  }
  return '开始科学测评'
})

function onPartTap(part: any) {
  navigateTo('/pages/questionPage/index', { part: part.id })
}

function getNextIncompletePart() {
  // 找到第一个未完成的部分
  const next = assessmentStore.parts.find(p => p.status !== 'completed')
  return next || assessmentStore.parts[0]
}

function onStartAssessment() {
  // 已完成全部测评，跳转到报告页
  if (assessmentStore.isCompleted) {
    navigateTo('/pages/reportPage/index')
    return
  }
  const nextPart = getNextIncompletePart()
  navigateTo('/pages/questionPage/index', { part: nextPart.id })
}

function onViewReport(report: any) {
  navigateTo('/pages/reportPage/index', { id: report.id })
}

function onReassess() {
  uni.showModal({
    title: '再次测评',
    content: '将重新开始所有测评项目，历史记录不会丢失。确定开始吗？',
    confirmText: '开始',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        assessmentStore.reset()
        const firstPart = assessmentStore.parts[0]
        navigateTo('/pages/questionPage/index', { part: firstPart.id })
      }
    }
  })
}

function onDataCardTap(type: string) {
  uni.showToast({ title: '数据详情开发中...', icon: 'none' })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #F8FAFF;
  padding-bottom: 20rpx;
}

/* 进度卡片 */
.progress-card {
  margin-top: 16rpx;
}

.progress-percent {
  font-size: 30rpx;
  font-weight: 600;
  color: #36C2AA;
}

.progress-bar-wrap {
  height: 12rpx;
  background: #E8F3FF;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #36C2AA, #4A9EFF);
  border-radius: 6rpx;
  transition: width 0.5s ease;
}

/* 测评部分卡片 */
.part-card {
  border: 1rpx solid #E8F3FF;
}

.part-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: #F0F8FF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.part-icon {
  font-size: 40rpx;
}

.part-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  display: block;
}

.part-count {
  font-size: 24rpx;
  color: #999999;
  margin-top: 6rpx;
  display: block;
}

.arrow-right {
  font-size: 36rpx;
  color: #CCCCCC;
  margin-left: 12rpx;
}

/* 数据看板 */
.data-cards {
  gap: 16rpx;
}

.data-card {
  flex: 1;
  min-width: calc(50% - 16rpx);
  background: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(74, 158, 255, 0.08);
  padding: 20rpx;
  display: flex;
  flex-direction: column;
}

.data-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.data-label {
  font-size: 22rpx;
  color: #999999;
}

.data-value {
  font-size: 26rpx;
  font-weight: 500;
  color: #333333;
  margin-top: 8rpx;
}

/* 操作区 */
.action-wrap {
  margin-top: 32rpx;
}

.btn-reassess {
  margin-top: 20rpx;
  text-align: center;
  padding: 20rpx;
  border: 2rpx solid #4A9EFF;
  border-radius: 48rpx;
}

.btn-reassess-text {
  font-size: 28rpx;
  color: #4A9EFF;
  font-weight: 500;
}

/* 历史记录 */
.history-item {
  padding: 20rpx 24rpx;
}

.history-date {
  font-size: 26rpx;
  color: #333333;
  display: block;
}

.history-summary {
  font-size: 24rpx;
  color: #999999;
  margin-top: 6rpx;
  display: block;
}

.history-score {
  font-size: 28rpx;
  font-weight: 500;
  color: #4A9EFF;
}
</style>
