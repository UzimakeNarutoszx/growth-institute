<template>
  <view class="page-container">
    <NavBar title="账号与安全" />

    <view class="section-wrap mx-lg">
      <!-- 账号信息 -->
      <view class="section-title-text">账号信息</view>
      <view class="settings-card">
        <view class="setting-item">
          <text class="setting-label">手机号</text>
          <text class="setting-value">{{ userStore.phone }}</text>
        </view>
        <view class="setting-item clickable" @tap="onChangePassword">
          <text class="setting-label">修改密码</text>
          <text class="setting-arrow">›</text>
        </view>
      </view>

      <!-- 通知权限 -->
      <view class="section-title-text">通知权限</view>
      <view class="settings-card">
        <view class="setting-item">
          <text class="setting-label">消息通知总开关</text>
          <switch :checked="settings.notification_enabled" color="#4A9EFF" @change="onToggle('notification_enabled', $event)" />
        </view>
        <view class="setting-item">
          <text class="setting-label">测评完成提醒</text>
          <switch :checked="settings.push_assessment" color="#4A9EFF" @change="onToggle('push_assessment', $event)" />
        </view>
        <view class="setting-item">
          <text class="setting-label">成长记录提醒</text>
          <switch :checked="settings.push_growth" color="#4A9EFF" @change="onToggle('push_growth', $event)" />
        </view>
        <view class="setting-item">
          <text class="setting-label">文章推荐推送</text>
          <switch :checked="settings.push_article" color="#4A9EFF" @change="onToggle('push_article', $event)" />
        </view>
      </view>

      <!-- 数据权限 -->
      <view class="section-title-text">数据权限</view>
      <view class="settings-card">
        <view class="setting-item">
          <view class="setting-label-wrap">
            <text class="setting-label">允许数据分析</text>
            <text class="setting-desc">用于优化测评结果和个性化推荐</text>
          </view>
          <switch :checked="settings.allow_data_collection" color="#4A9EFF" @change="onToggle('allow_data_collection', $event)" />
        </view>
      </view>

      <!-- 账号操作 -->
      <view class="section-title-text">账号操作</view>
      <view class="settings-card">
        <view class="setting-item clickable" @tap="onDeleteAccount">
          <text class="setting-label" style="color: #FF4444;">注销账号</text>
          <text class="setting-arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { useUserStore } from '@/store'

const API_BASE = 'http://localhost:3000'
const userStore = useUserStore()

const settings = reactive({
  notification_enabled: true,
  push_assessment: true,
  push_growth: true,
  push_article: true,
  allow_data_collection: true
})

onMounted(() => {
  loadSettings()
})

function loadSettings() {
  const token = uni.getStorageSync('auth_token')
  if (!token) return
  uni.request({
    url: `${API_BASE}/api/settings`,
    method: 'GET',
    header: { 'x-token': token },
    success: (res: any) => {
      if (res.data.code === 0 && res.data.data) {
        Object.assign(settings, res.data.data)
      }
    }
  })
}

function onToggle(key: string, e: any) {
  const val = e.detail.value
  ;(settings as any)[key] = val

  const token = uni.getStorageSync('auth_token')
  if (!token) return
  uni.request({
    url: `${API_BASE}/api/settings/update`,
    method: 'POST',
    header: { 'x-token': token },
    data: { key, value: val },
    success: () => {
      uni.showToast({ title: val ? '已开启' : '已关闭', icon: 'none' })
    }
  })
}

function onChangePassword() {
  uni.showToast({ title: '修改密码功能开发中', icon: 'none' })
}

function onDeleteAccount() {
  uni.showModal({
    title: '注销账号',
    content: '注销后所有数据将被清除且无法恢复，确定要注销吗？',
    confirmColor: '#FF4444',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '账号注销功能开发中', icon: 'none' })
      }
    }
  })
}
</script>

<style scoped lang="scss">
.page-container { min-height: 100vh; background: #F8FAFF; }

.section-wrap { padding-top: 24rpx; padding-bottom: 40rpx; }

.section-title-text {
  font-size: 26rpx; color: #999; margin-top: 32rpx; margin-bottom: 12rpx;
  padding-left: 8rpx;
}
.section-title-text:first-child { margin-top: 0; }

.settings-card {
  background: #fff; border-radius: 20rpx; padding: 0 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.setting-item {
  display: flex; align-items: center; justify-content: space-between;
  min-height: 96rpx; border-bottom: 1rpx solid #f5f5f5;
}
.setting-item:last-child { border-bottom: none; }

.setting-label { font-size: 28rpx; color: #333; }
.setting-value { font-size: 28rpx; color: #999; }
.setting-arrow { font-size: 32rpx; color: #ccc; }

.setting-label-wrap { flex: 1; }
.setting-desc { font-size: 22rpx; color: #999; display: block; margin-top: 4rpx; }
</style>
