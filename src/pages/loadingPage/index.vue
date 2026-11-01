<template>
  <view class="loading-page">
    <view class="loading-content">
      <!-- 动画环 -->
      <view class="loading-ring-outer">
        <view class="loading-ring-inner">
          <view class="loading-icon">
            <text class="loading-emoji">🧬</text>
          </view>
        </view>
      </view>

      <!-- 文案 -->
      <text class="loading-title">正在分析生长数据...</text>
      <text class="loading-desc">{{ loadingSteps[currentStep] }}</text>

      <!-- 进度条 -->
      <view class="loading-progress-wrap">
        <view class="loading-progress-bar">
          <view class="loading-progress-fill" :style="{ width: progress + '%' }" />
        </view>
        <text class="loading-percent">{{ progress }}%</text>
      </view>

      <!-- 提示 -->
      <view class="loading-tips mt-lg">
        <text class="tips-icon">💡</text>
        <text class="tips-text">{{ tips[currentTip] }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAssessmentStore } from '@/store'

const assessmentStore = useAssessmentStore()

const progress = ref(0)
const currentStep = ref(0)
const currentTip = ref(0)

const loadingSteps = [
  '正在收集测评数据...',
  '分析遗传因素中...',
  '评估营养状况...',
  '计算生长速度...',
  '生成个性化方案...',
  '生成评估报告...'
]

const tips = [
  '充足的睡眠是长高的关键，建议22点前入睡',
  '跳绳是最经济有效的长高运动之一',
  '维生素D可促进钙吸收，每天户外15分钟即可',
  '优质蛋白质是骨骼发育的基础营养素',
  '情绪压力会影响生长激素分泌，保持愉悦很重要'
]

let timer: number | null = null
let tipTimer: number | null = null

onMounted(() => {
  // 模拟加载进度
  timer = setInterval(() => {
    if (progress.value < 100) {
      // 前80%较快，后20%较慢
      const increment = progress.value < 80 ? Math.random() * 8 + 2 : Math.random() * 3 + 1
      progress.value = Math.min(100, Math.round(progress.value + increment))

      // 更新步骤文案
      const stepIndex = Math.floor((progress.value / 100) * loadingSteps.length)
      currentStep.value = Math.min(stepIndex, loadingSteps.length - 1)
    } else {
      // 加载完成，跳转报告页
      if (timer) clearInterval(timer)
      setTimeout(() => {
        uni.redirectTo({ url: '/pages/reportPage/index' })
      }, 500)
    }
  }, 200) as unknown as number

  // 轮换提示
  tipTimer = setInterval(() => {
    currentTip.value = (currentTip.value + 1) % tips.length
  }, 3000) as unknown as number
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (tipTimer) clearInterval(tipTimer)
})
</script>

<style scoped lang="scss">
.loading-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F0F8FF, #F8FAFF);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 64rpx;
  width: 100%;
}

/* 加载动画环 */
.loading-ring-outer {
  width: 200rpx;
  height: 200rpx;
  border-radius: 100rpx;
  background: conic-gradient(#4A9EFF, #36C2AA, #4A9EFF);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spin 2s linear infinite;
}

.loading-ring-inner {
  width: 170rpx;
  height: 170rpx;
  border-radius: 85rpx;
  background: #F0F8FF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-icon {
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-emoji {
  font-size: 64rpx;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* 文案 */
.loading-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333333;
  margin-top: 48rpx;
}

.loading-desc {
  font-size: 26rpx;
  color: #999999;
  margin-top: 16rpx;
  transition: opacity 0.3s;
}

/* 进度条 */
.loading-progress-wrap {
  width: 100%;
  max-width: 500rpx;
  margin-top: 48rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.loading-progress-bar {
  flex: 1;
  height: 12rpx;
  background: #E8F3FF;
  border-radius: 6rpx;
  overflow: hidden;
}

.loading-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4A9EFF, #36C2AA);
  border-radius: 6rpx;
  transition: width 0.2s ease;
}

.loading-percent {
  font-size: 28rpx;
  font-weight: 600;
  color: #4A9EFF;
  min-width: 80rpx;
  text-align: right;
}

/* 提示 */
.loading-tips {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16rpx;
  padding: 24rpx;
  width: 100%;
  max-width: 500rpx;
}

.tips-icon {
  font-size: 32rpx;
  flex-shrink: 0;
}

.tips-text {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.6;
}
</style>
