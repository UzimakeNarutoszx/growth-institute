<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <NavBar title="生长研究院" :showBack="false">
      <template #right>
        <view v-if="!userStore.isLoggedIn" class="login-entry clickable" @tap="goLogin">
          <text class="login-entry-text">登录</text>
        </view>
        <view v-else class="notification-icon clickable" @tap="onNotification">
          <text class="icon-bell">🔔</text>
          <view class="badge" v-if="hasNotification">
            <text class="badge-text" v-if="unreadCount > 0">{{ unreadCount > 99 ? '99+' : unreadCount }}</text>
          </view>
        </view>
      </template>
    </NavBar>

    <!-- 轮播图 -->
    <view class="swiper-wrap mx-lg mt-md">
      <swiper class="banner-swiper" :autoplay="true" :interval="3000" :circular="true" indicator-dots indicator-color="rgba(74,158,255,0.3)" indicator-active-color="#4A9EFF">
        <swiper-item v-for="(banner, index) in banners" :key="index" @tap="onBannerTap(index)">
          <image class="banner-img" :src="banner.image" mode="aspectFill" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 快速入口网格 -->
    <view class="grid-section mx-lg mt-md">
      <view class="grid-wrap">
        <view
          v-for="item in quickEntries"
          :key="item.id"
          class="grid-item clickable"
          @tap="onGridTap(item)"
        >
          <view class="grid-icon-wrap" :style="{ background: item.bgColor }">
            <text class="grid-icon">{{ item.icon }}</text>
          </view>
          <text class="grid-label">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 今日任务卡片 -->
    <SectionTitle title="今日待办" :marginTop="32" />
    <view class="card task-card">
      <view class="task-header flex-between">
        <text class="task-progress-text">{{ completedTasks }}/{{ totalTasks }} 已完成</text>
        <view class="task-progress-bar">
          <view class="task-progress-fill" :style="{ width: taskProgress + '%' }" />
        </view>
      </view>
      <view class="task-list">
        <view
          v-for="(task, index) in todayTasks"
          :key="index"
          class="task-item flex-row"
          @tap="toggleTask(index)"
        >
          <view class="task-check" :class="{ checked: task.done }">
            <text v-if="task.done" class="check-mark">✓</text>
          </view>
          <text class="task-text" :class="{ 'task-done': task.done }">{{ task.text }}</text>
        </view>
      </view>
    </view>

    <!-- 科普文章推荐 -->
    <SectionTitle title="科学生长指南" />
    <scroll-view scroll-x class="articles-scroll mx-lg">
      <view class="articles-row">
        <view
          v-for="article in articles"
          :key="article.id"
          class="article-card hover-float"
          @tap="onArticleTap(article)"
        >
          <image class="article-cover-img" :src="article.image" mode="aspectFill" />
          <view class="article-info">
            <text class="article-title">{{ article.title }}</text>
            <text class="article-meta">{{ article.views }} 阅读</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部安全间距 -->
    <view style="height: 40rpx;" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import NavBar from '@/components/NavBar.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import { useUserStore } from '@/store'
import { navigateTo } from '@/utils/navigate'

const API_BASE = 'http://localhost:3000'
const userStore = useUserStore()
const hasNotification = ref(false)
const unreadCount = ref(0)

// 每次显示首页时检查未读通知
onShow(() => {
  if (userStore.isLoggedIn) {
    loadUnreadCount()
  }
})

function loadUnreadCount() {
  const token = uni.getStorageSync('auth_token')
  if (!token) return
  uni.request({
    url: `${API_BASE}/api/notifications/unread-count`,
    method: 'GET',
    header: { 'x-token': token },
    success: (res: any) => {
      if (res.data.code === 0) {
        unreadCount.value = res.data.data.count || 0
        hasNotification.value = unreadCount.value > 0
      }
    }
  })
}

// 轮播图数据
const banners = ref([
  { image: '/static/banner/banner1.png' },
  { image: '/static/banner/banner2.png' },
  { image: '/static/banner/banner3.png' }
])

// 快速入口
const quickEntries = ref([
  { id: 'assessment', label: '快速测评', icon: '📋', bgColor: '#E8F3FF', path: '/pages/assessmentHomePage/index' },
  { id: 'record', label: '生长记录', icon: '📏', bgColor: '#E8F8F5', path: '/pages/growthRecordPage/index' },
  { id: 'nutrition', label: '营养方案', icon: '🥗', bgColor: '#FFF8E8', path: '/pages/nutritionPage/index' },
  { id: 'exercise', label: '运动计划', icon: '🏃', bgColor: '#FFE8F0', path: '/pages/exercisePage/index' },
  { id: 'articles', label: '文章推荐', icon: '📚', bgColor: '#F0E8FF', path: '/pages/articlesPage/index' },
  { id: 'expert', label: '豆包AI答疑', icon: '🤖', bgColor: '#E8FFF0', path: '/pages/expertPage/index' },
  { id: 'community', label: '成长社群', icon: '👥', bgColor: '#FFE8E8', path: '/pages/communityPage/index' },
  { id: 'report', label: '健康报告', icon: '📄', bgColor: '#E8F3FF', path: '/pages/reportPage/index' }
])

// 今日任务
const todayTasks = ref([
  { text: '记录身高体重', done: false },
  { text: '完成营养打卡', done: false },
  { text: '运动30分钟', done: false },
  { text: '补剂服用', done: false },
  { text: '22:00前入睡', done: false }
])

const completedTasks = computed(() => todayTasks.value.filter(t => t.done).length)
const totalTasks = computed(() => todayTasks.value.length)
const taskProgress = computed(() => (completedTasks.value / totalTasks.value) * 100)

function toggleTask(index: number) {
  todayTasks.value[index].done = !todayTasks.value[index].done
}

// 文章数据
const articles = ref([
  { id: '1', title: '春季是孩子长高黄金期', image: '/static/images/text1.png', views: '2.3万' },
  { id: '2', title: '这3种运动最有助长高', image: '/static/images/text2.png', views: '1.8万' },
  { id: '3', title: '钙片怎么吃最有效？', image: '/static/images/text3.png', views: '3.1万' }
])

function goLogin() {
  navigateTo('/pages/loginPage/index')
}

function onNotification() {
  if (unreadCount.value === 0) {
    uni.showToast({ title: '暂无新消息', icon: 'none' })
    return
  }
  // 获取通知列表并展示
  const token = uni.getStorageSync('auth_token')
  uni.request({
    url: `${API_BASE}/api/notifications/list`,
    method: 'GET',
    header: { 'x-token': token },
    success: (res: any) => {
      if (res.data.code === 0 && res.data.data.length > 0) {
        const latest = res.data.data[0]
        uni.showModal({
          title: latest.title,
          content: latest.content,
          confirmText: '知道了',
          showCancel: false,
          success: () => {
            // 标记全部已读
            uni.request({
              url: `${API_BASE}/api/notifications/read-all`,
              method: 'POST',
              header: { 'x-token': token },
              success: () => {
                hasNotification.value = false
                unreadCount.value = 0
              }
            })
          }
        })
      }
    }
  })
}

function onBannerTap(index: number) {
  const pages = ['/pages/assessmentHomePage/index', '/pages/nutritionPage/index', '/pages/growthRecordPage/index']
  navigateTo(pages[index])
}

function onGridTap(item: any) {
  if (item.path) {
    navigateTo(item.path)
  } else {
    uni.showToast({ title: '功能开发中...', icon: 'none' })
  }
}


function onArticleTap(article: any) {
  navigateTo('/pages/articlePage/index', { id: article.id })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #F8FAFF;
  padding-bottom: 20rpx;
}

/* 登录入口 */
.login-entry {
  background: #4A9EFF;
  border-radius: 24rpx;
  padding: 8rpx 24rpx;
}

.login-entry-text {
  font-size: 26rpx;
  color: #FFFFFF;
  font-weight: 500;
}

/* 轮播图 */
.banner-swiper {
  height: 320rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

/* 快速入口网格 */
.grid-wrap {
  display: flex;
  flex-wrap: wrap;
  background: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(74, 158, 255, 0.08);
  padding: 20rpx 0;
}

.grid-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
}

.grid-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-icon {
  font-size: 44rpx;
}

.grid-label {
  font-size: 24rpx;
  color: #333333;
  margin-top: 10rpx;
}

/* 通知图标 */
.notification-icon {
  position: relative;
}

.icon-bell {
  font-size: 40rpx;
}

.badge {
  position: absolute;
  top: -8rpx;
  right: -12rpx;
  min-width: 28rpx;
  height: 28rpx;
  background: #FF4444;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6rpx;
}

.badge-text {
  font-size: 18rpx;
  color: #FFFFFF;
  font-weight: 600;
  line-height: 1;
}

/* 任务卡片 */
.task-header {
  margin-bottom: 16rpx;
}

.task-progress-text {
  font-size: 24rpx;
  color: #999999;
}

.task-progress-bar {
  width: 200rpx;
  height: 8rpx;
  background: #E8F3FF;
  border-radius: 4rpx;
  overflow: hidden;
}

.task-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4A9EFF, #36C2AA);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.task-item {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F5F5F5;
}

.task-item:last-child {
  border-bottom: none;
}

.task-check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
  border: 2rpx solid #CCCCCC;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  transition: all 0.2s;
}

.task-check.checked {
  background: #36C2AA;
  border-color: #36C2AA;
}

.check-mark {
  color: #FFFFFF;
  font-size: 24rpx;
  font-weight: bold;
}

.task-text {
  font-size: 28rpx;
  color: #333333;
  transition: all 0.2s;
}

.task-done {
  color: #CCCCCC;
  text-decoration: line-through;
}

/* 文章推荐 */
.articles-scroll {
  white-space: nowrap;
}

.articles-row {
  display: flex;
  gap: 20rpx;
  padding: 8rpx 0 16rpx;
}

.article-card {
  width: 300rpx;
  flex-shrink: 0;
  background: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(74, 158, 255, 0.08);
  overflow: hidden;
}

.article-cover-img {
  width: 100%;
  height: 180rpx;
  display: block;
}

.article-info {
  padding: 16rpx 20rpx;
}

.article-title {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
  display: block;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-meta {
  font-size: 22rpx;
  color: #999999;
  margin-top: 8rpx;
  display: block;
}
</style>
