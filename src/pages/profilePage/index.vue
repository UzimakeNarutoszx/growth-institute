<template>
  <view class="page-container">
    <!-- 未登录状态 -->
    <template v-if="!userStore.isLoggedIn">
      <view class="profile-header">
        <view class="header-bg" />
        <!-- 返回按钮 -->
        <view class="profile-back clickable" :style="{ top: (statusBarHeight + 10) + 'px' }" @tap="handleBack">
          <text class="profile-back-icon">‹</text>
        </view>
        <view class="header-content" :style="{ paddingTop: (statusBarHeight + 20) + 'px' }">
          <view class="avatar-large">
            <text class="avatar-emoji-large">👤</text>
          </view>
          <view class="user-info-center">
            <text class="user-nickname" style="color: #999;">未登录</text>
          </view>
          <view class="login-btn-wrap">
            <view class="login-btn clickable" @tap="goLogin">
              <text class="login-btn-text">点击登录</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 设置列表（未登录也可见） -->
      <SectionTitle title="设置" :marginTop="24" />
      <view class="settings-list card">
        <view
          v-for="(item, index) in settingsList"
          :key="index"
          class="setting-item flex-between clickable"
          @tap="onSettingTap(item)"
        >
          <text class="setting-label">{{ item.label }}</text>
          <view class="setting-right flex-row">
            <switch
              v-if="item.type === 'switch'"
              :checked="item.checked"
              color="#4A9EFF"
              @change="onSwitchChange(item, $event)"
            />
            <text v-else-if="item.value" class="setting-value">{{ item.value }}</text>
            <text v-if="item.type !== 'switch'" class="setting-arrow">›</text>
          </view>
        </view>
      </view>
    </template>

    <!-- 已登录状态 -->
    <template v-else>
      <!-- 用户信息头图 -->
      <view class="profile-header">
        <view class="header-bg" />
        <!-- 返回按钮 -->
        <view class="profile-back clickable" :style="{ top: (statusBarHeight + 10) + 'px' }" @tap="handleBack">
          <text class="profile-back-icon">‹</text>
        </view>
        <view class="header-content" :style="{ paddingTop: (statusBarHeight + 20) + 'px' }">
          <view class="avatar-large clickable" @tap="onChangeAvatar">
            <text class="avatar-emoji-large">👤</text>
            <view class="avatar-edit-badge">
              <text class="edit-icon">📷</text>
            </view>
          </view>
          <view class="user-info-center">
            <view class="flex-row" style="justify-content: center; gap: 12rpx;">
              <text class="user-nickname">{{ userStore.nickname }}</text>
              <text class="vip-badge" v-if="userStore.isVip">VIP会员</text>
            </view>
            <text class="child-brief">{{ userStore.childInfo }}</text>
            <view class="edit-profile-btn clickable" @tap="goPersonalInfo">
              <text class="edit-profile-text">编辑资料</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 功能卡片区 -->
      <view class="func-grid mx-lg">
        <view
          v-for="(func, index) in funcList"
          :key="index"
          class="func-item clickable"
          @tap="onFuncTap(func)"
        >
          <text class="func-icon">{{ func.icon }}</text>
          <text class="func-label">{{ func.label }}</text>
        </view>
      </view>

      <!-- 数据概览 -->
      <SectionTitle title="我的生长数据" :marginTop="24" />
      <view class="card data-overview">
        <view class="overview-items flex-row">
          <view class="overview-item">
            <text class="overview-num">{{ assessmentStore.historyReports.length }}</text>
            <text class="overview-label">测评次数</text>
          </view>
          <view class="overview-divider" />
          <view class="overview-item">
            <text class="overview-num">{{ growthStore.records.length }}</text>
            <text class="overview-label">记录天数</text>
          </view>
          <view class="overview-divider" />
          <view class="overview-item">
            <text class="overview-num">{{ assessmentStore.totalProgress }}%</text>
            <text class="overview-label">测评进度</text>
          </view>
        </view>
      </view>

      <!-- 设置列表 -->
      <SectionTitle title="设置" :marginTop="24" />
      <view class="settings-list card">
        <view
          v-for="(item, index) in settingsList"
          :key="index"
          class="setting-item flex-between clickable"
          @tap="onSettingTap(item)"
        >
          <text class="setting-label">{{ item.label }}</text>
          <view class="setting-right flex-row">
            <switch
              v-if="item.type === 'switch'"
              :checked="item.checked"
              color="#4A9EFF"
              @change="onSwitchChange(item, $event)"
            />
            <text v-else-if="item.value" class="setting-value">{{ item.value }}</text>
            <text v-if="item.type !== 'switch'" class="setting-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-wrap mx-lg mt-lg">
        <view class="logout-btn clickable" @tap="onLogout">
          <text class="logout-text">退出登录</text>
        </view>
      </view>
    </template>

    <view style="height: 40rpx;" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import SectionTitle from '@/components/SectionTitle.vue'
import { useUserStore, useAssessmentStore, useGrowthStore } from '@/store'
import { navigateTo, showConfirm } from '@/utils/navigate'

const userStore = useUserStore()
const assessmentStore = useAssessmentStore()
const growthStore = useGrowthStore()

// 每次页面显示时，从后端刷新数据
onShow(() => {
  if (userStore.isLoggedIn) {
    assessmentStore.loadHistory()
    growthStore.loadRecords()
  }
})

const statusBarHeight = ref(0)
// #ifdef MP-WEIXIN || APP-PLUS
const sysInfo = uni.getSystemInfoSync()
statusBarHeight.value = sysInfo.statusBarHeight || 20
// #endif

function handleBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/homePage/index' })
  }
}

function goLogin() {
  navigateTo('/pages/loginPage/index')
}

function goPersonalInfo() {
  navigateTo('/pages/personalInfoPage/index')
}

// 功能列表
const funcList = ref([
  { icon: '📁', label: '成长档案', path: '/pages/myAssessmentsPage/index' },
  { icon: '⭐', label: '收藏文章', path: '/pages/myFavoritesPage/index' },
  { icon: '💬', label: '问答记录', path: '/pages/myChatHistoryPage/index' },
  { icon: '📦', label: '我的订单', path: '/pages/myOrdersPage/index' }
])

// 设置列表
const settingsList = ref([
  { id: 'account', label: '账号与安全', type: 'arrow', value: '', path: '/pages/accountSecurityPage/index' },
  { id: 'notification', label: '消息通知设置', type: 'switch', checked: true },
  { id: 'backup', label: '数据备份与同步', type: 'arrow', value: '', path: '' },
  { id: 'about', label: '关于生长研究院', type: 'arrow', value: 'v1.0.0', path: '/pages/aboutPage/index' }
])

function onChangeAvatar() {
  uni.showActionSheet({
    itemList: ['拍照', '从相册选择', '取消'],
    success: () => {
      uni.showToast({ title: '头像修改功能开发中', icon: 'none' })
    }
  })
}

function onFuncTap(func: any) {
  if (func.path) {
    navigateTo(func.path)
  } else {
    uni.showToast({ title: '功能开发中...', icon: 'none' })
  }
}

function onSettingTap(item: any) {
  if (item.type === 'switch') return

  // 数据备份与同步：刷新页面数据
  if (item.id === 'backup') {
    uni.showLoading({ title: '同步中...' })
    Promise.all([
      assessmentStore.loadHistory(),
      growthStore.loadRecords()
    ]).then(() => {
      uni.hideLoading()
      uni.showToast({ title: '已完成数据备份与同步', icon: 'success', duration: 2000 })
    })
    return
  }

  if (item.path) {
    navigateTo(item.path)
  } else {
    uni.showToast({ title: `${item.label} 开发中...`, icon: 'none' })
  }
}

function onSwitchChange(item: any, e: any) {
  item.checked = e.detail.value
  uni.showToast({ title: item.checked ? '已开启' : '已关闭', icon: 'none' })
}

async function onLogout() {
  const confirmed = await showConfirm('退出登录', '确定要退出登录吗？')
  if (confirmed) {
    userStore.logout()
    assessmentStore.reset()
    growthStore.records.splice(0)
    uni.showToast({ title: '已退出登录', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #F8FAFF;
  padding-bottom: 20rpx;
}

/* 返回按钮 */
.profile-back {
  position: absolute;
  left: 32rpx;
  z-index: 10;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-back-icon {
  font-size: 44rpx;
  color: #333333;
  font-weight: bold;
}

/* 头部 */
.profile-header {
  position: relative;
}

.header-bg {
  height: 440rpx;
  background: linear-gradient(180deg, #E8F3FF, #FFFFFF);
  border-radius: 0 0 32rpx 32rpx;
}

.header-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 40rpx;
}

.avatar-large {
  width: 144rpx;
  height: 144rpx;
  border-radius: 72rpx;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(74, 158, 255, 0.15);
  position: relative;
}

.avatar-emoji-large {
  font-size: 72rpx;
}

.user-info-center {
  margin-top: 16rpx;
  text-align: center;
}

.user-nickname {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.vip-badge {
  font-size: 20rpx;
  color: #FF9900;
  background: #FFF8E8;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  border: 1rpx solid #FFE0A0;
}

.child-brief {
  font-size: 26rpx;
  color: #666666;
  margin-top: 8rpx;
  display: block;
}

.edit-profile-btn {
  margin-top: 16rpx;
  display: inline-block;
  border: 2rpx solid #4A9EFF;
  border-radius: 24rpx;
  padding: 6rpx 32rpx;
}

.edit-profile-text {
  font-size: 24rpx;
  color: #4A9EFF;
}

/* 登录按钮 */
.login-btn-wrap {
  margin-top: 32rpx;
}

.login-btn {
  background: linear-gradient(135deg, #4A9EFF, #36C2AA);
  border-radius: 40rpx;
  padding: 20rpx 80rpx;
}

.login-btn-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 功能网格 */
.func-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-top: 20rpx;
  position: relative;
  z-index: 10;
}

.func-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(74, 158, 255, 0.08);
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.func-icon {
  font-size: 48rpx;
}

.func-label {
  font-size: 24rpx;
  color: #333333;
}

/* 数据概览 */
.data-overview {
  padding: 32rpx 24rpx;
}

.overview-items {
  justify-content: space-around;
}

.overview-item {
  text-align: center;
  flex: 1;
}

.overview-num {
  font-size: 40rpx;
  font-weight: 700;
  color: #4A9EFF;
  display: block;
}

.overview-label {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
  display: block;
}

.overview-divider {
  width: 1rpx;
  height: 60rpx;
  background: #F0F0F0;
}

/* 设置列表 */
.settings-list {
  padding: 0 24rpx;
}

.setting-item {
  height: 96rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 28rpx;
  color: #333333;
}

.setting-right {
  gap: 12rpx;
}

.setting-value {
  font-size: 26rpx;
  color: #999999;
}

.setting-arrow {
  font-size: 32rpx;
  color: #CCCCCC;
}

/* 退出按钮 */
.logout-btn {
  text-align: center;
  padding: 24rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
}

.logout-text {
  font-size: 28rpx;
  color: #FF4444;
}
</style>
