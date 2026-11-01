<template>
  <view class="page-container">
    <NavBar title="成长档案" />

    <view v-if="loading" class="loading-wrap">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="reports.length === 0" class="empty-wrap">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无测评记录</text>
      <text class="empty-desc">完成测评后，记录将自动保存在这里</text>
      <view class="empty-btn clickable" @tap="goAssessment">
        <text class="empty-btn-text">去测评</text>
      </view>
    </view>

    <view v-else class="list-wrap mx-lg">
      <view
        v-for="(item, index) in reports"
        :key="index"
        class="report-card clickable"
        @tap="goReport"
      >
        <view class="report-header">
          <text class="report-score">{{ item.score }}分</text>
          <text class="report-date">{{ item.date }}</text>
        </view>
        <text class="report-summary">{{ item.summary }}</text>
        <view class="report-footer">
          <text class="report-label">第{{ reports.length - index }}次测评</text>
          <text class="report-arrow">查看详情 ›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'

const API_BASE = 'http://localhost:3000'
const loading = ref(true)
const reports = ref<any[]>([])

onMounted(() => {
  const token = uni.getStorageSync('auth_token')
  if (!token) {
    loading.value = false
    return
  }
  uni.request({
    url: `${API_BASE}/api/assessment/history`,
    method: 'GET',
    header: { 'x-token': token },
    success: (res: any) => {
      if (res.data.code === 0) {
        reports.value = res.data.data || []
      }
      loading.value = false
    },
    fail: () => { loading.value = false }
  })
})

function goAssessment() {
  uni.switchTab({ url: '/pages/assessmentHomePage/index' })
}

function goReport() {
  uni.navigateTo({ url: '/pages/reportPage/index' })
}
</script>

<style scoped lang="scss">
.page-container { min-height: 100vh; background: #F8FAFF; }

.loading-wrap, .empty-wrap {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding-top: 200rpx;
}
.loading-text { font-size: 28rpx; color: #999; }
.empty-icon { font-size: 100rpx; margin-bottom: 24rpx; }
.empty-text { font-size: 32rpx; color: #333; font-weight: 600; }
.empty-desc { font-size: 26rpx; color: #999; margin-top: 12rpx; }
.empty-btn {
  margin-top: 40rpx; background: linear-gradient(135deg, #4A9EFF, #36C2AA);
  border-radius: 40rpx; padding: 20rpx 80rpx;
}
.empty-btn-text { font-size: 28rpx; color: #fff; font-weight: 600; }

.list-wrap { padding-top: 24rpx; padding-bottom: 40rpx; }

.report-card {
  background: #fff; border-radius: 20rpx; padding: 32rpx;
  margin-bottom: 24rpx; box-shadow: 0 4rpx 16rpx rgba(74,158,255,0.08);
}
.report-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16rpx;
}
.report-score { font-size: 40rpx; font-weight: 700; color: #4A9EFF; }
.report-date { font-size: 24rpx; color: #999; }
.report-summary { font-size: 28rpx; color: #666; line-height: 1.6; display: block; }
.report-footer {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 20rpx; padding-top: 20rpx; border-top: 1rpx solid #f0f0f0;
}
.report-label { font-size: 24rpx; color: #999; }
.report-arrow { font-size: 24rpx; color: #4A9EFF; }
</style>
