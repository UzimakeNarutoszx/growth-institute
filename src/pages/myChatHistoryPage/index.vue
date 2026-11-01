<template>
  <view class="page-container">
    <NavBar title="问答记录" />

    <view v-if="loading" class="loading-wrap">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="chatMessages.length === 0" class="empty-wrap">
      <text class="empty-icon">💬</text>
      <text class="empty-text">暂无问答记录</text>
      <text class="empty-desc">与豆包AI对话后，记录将自动保存</text>
      <view class="empty-btn clickable" @tap="goChat">
        <text class="empty-btn-text">去提问</text>
      </view>
    </view>

    <view v-else class="chat-list mx-lg">
      <view
        v-for="(msg, index) in chatMessages"
        :key="index"
        class="chat-bubble"
        :class="msg.role === 'user' ? 'bubble-user' : 'bubble-ai'"
      >
        <view class="bubble-header">
          <text class="bubble-role">{{ msg.role === 'user' ? '我' : '豆包AI' }}</text>
          <text class="bubble-time">{{ msg.time }}</text>
        </view>
        <text class="bubble-content">{{ msg.content }}</text>
      </view>

      <!-- 清空按钮 -->
      <view class="clear-wrap">
        <view class="clear-btn clickable" @tap="clearHistory">
          <text class="clear-text">清空聊天记录</text>
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
const chatMessages = ref<any[]>([])

onMounted(() => {
  loadHistory()
})

function loadHistory() {
  const token = uni.getStorageSync('auth_token')
  if (!token) { loading.value = false; return }
  uni.request({
    url: `${API_BASE}/api/chat/history`,
    method: 'GET',
    header: { 'x-token': token },
    success: (res: any) => {
      if (res.data.code === 0) {
        chatMessages.value = res.data.data || []
      }
      loading.value = false
    },
    fail: () => { loading.value = false }
  })
}

function goChat() {
  uni.navigateTo({ url: '/pages/expertPage/index' })
}

async function clearHistory() {
  const [err, res]: any = await uni.showModal({ title: '确认清空', content: '确定要清空所有聊天记录吗？', confirmText: '确定', cancelText: '取消' })
  if (res && res.confirm) {
    const token = uni.getStorageSync('auth_token')
    uni.request({
      url: `${API_BASE}/api/chat/clear`,
      method: 'DELETE',
      header: { 'x-token': token },
      success: () => {
        chatMessages.value = []
        uni.showToast({ title: '已清空', icon: 'none' })
      }
    })
  }
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

.chat-list { padding-top: 24rpx; padding-bottom: 40rpx; }

.chat-bubble {
  padding: 24rpx; border-radius: 16rpx; margin-bottom: 16rpx;
}
.bubble-user { background: #E8F3FF; margin-left: 80rpx; }
.bubble-ai { background: #FFFFFF; margin-right: 80rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }

.bubble-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12rpx;
}
.bubble-role { font-size: 24rpx; font-weight: 600; color: #4A9EFF; }
.bubble-user .bubble-role { color: #333; }
.bubble-time { font-size: 20rpx; color: #ccc; }
.bubble-content { font-size: 28rpx; color: #333; line-height: 1.6; display: block; }

.clear-wrap { margin-top: 40rpx; text-align: center; }
.clear-btn { display: inline-block; padding: 16rpx 48rpx; }
.clear-text { font-size: 26rpx; color: #FF4444; }
</style>
