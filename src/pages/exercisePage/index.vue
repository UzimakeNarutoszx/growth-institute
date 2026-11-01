<template>
  <view class="page-container">
    <NavBar title="运动计划" :showBack="true" />

    <!-- 运动数据仪表盘 -->
    <view class="card dashboard">
      <view class="dashboard-ring-wrap">
        <ProgressRing
          :value="exerciseStore.weekCompleted"
          :total="exerciseStore.weekTarget"
          :size="180"
          :thickness="25"
          primaryColor="#4A9EFF"
          secondaryColor="#36C2AA"
        >
          <view class="ring-inner-content">
            <text class="ring-value">{{ exerciseStore.weekCompleted }}</text>
            <text class="ring-unit">分钟</text>
          </view>
        </ProgressRing>
      </view>
      <view class="dashboard-info">
        <text class="dashboard-label">本周：{{ exerciseStore.weekCompleted }}/{{ exerciseStore.weekTarget }}分钟</text>
        <text class="dashboard-cal">约消耗 {{ exerciseStore.calories }} 卡路里</text>
      </view>
    </view>

    <!-- 今日运动任务 -->
    <SectionTitle title="今日推荐运动" :marginTop="24" />
    <scroll-view scroll-x class="exercise-scroll mx-lg">
      <view class="exercise-row">
        <view
          v-for="exercise in exerciseStore.todayExercises"
          :key="exercise.id"
          class="exercise-card clickable"
          @tap="onExerciseTap(exercise)"
        >
          <view class="exercise-icon-wrap">
            <text class="exercise-emoji">{{ exercise.icon }}</text>
          </view>
          <text class="exercise-name">{{ exercise.name }}</text>
          <text class="exercise-duration">{{ exercise.duration }}</text>
          <view class="exercise-stars">
            <text v-for="n in 3" :key="n" :class="{ 'star-active': n <= exercise.difficulty }">★</text>
          </view>
          <view class="btn-start" @tap.stop="onStartTraining(exercise)">
            <text>开始训练</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 运动视频库 -->
    <SectionTitle title="运动视频库" :more="true" @more="onMoreVideos" :marginTop="24" />
    <view class="video-tabs mx-lg">
      <text
        v-for="tab in videoTabs"
        :key="tab.id"
        class="video-tab"
        :class="{ active: activeVideoTab === tab.id }"
        @tap="activeVideoTab = tab.id"
      >{{ tab.label }}</text>
    </view>
    <view class="video-grid mx-lg mt-sm">
      <view
        v-for="video in filteredVideos"
        :key="video.id"
        class="video-card clickable"
        @tap="onVideoTap(video)"
      >
        <view class="video-cover" :style="{ background: video.bg }">
          <text class="video-emoji">{{ video.icon }}</text>
          <view class="play-btn">
            <text class="play-icon">▶</text>
          </view>
          <text class="video-duration">{{ video.duration }}</text>
        </view>
        <text class="video-title">{{ video.title }}</text>
      </view>
    </view>

    <!-- 运动日历 -->
    <SectionTitle title="运动日历" :marginTop="24" />
    <view class="card calendar-card">
      <view class="calendar-header flex-between">
        <text class="calendar-month">2024年10月</text>
        <text class="calendar-stat">本月运动达标：{{ exerciseStore.exerciseDays.length }}天</text>
      </view>
      <view class="calendar-grid mt-sm">
        <text class="calendar-week-label" v-for="w in weekLabels" :key="w">{{ w }}</text>
        <view
          v-for="day in calendarDays"
          :key="day.num"
          class="calendar-day"
          :class="{ 'day-active': day.active, 'day-empty': day.num === 0 }"
        >
          <text v-if="day.num > 0">{{ day.num }}</text>
          <view v-if="day.active" class="day-dot" />
        </view>
      </view>
    </view>

    <!-- 运动提醒 -->
    <SectionTitle title="每日运动提醒" :marginTop="24" />
    <view class="card reminder-card flex-between">
      <view>
        <text class="reminder-time">17:30</text>
        <text class="reminder-desc">晚饭前运动提醒</text>
      </view>
      <switch :checked="reminderOn" color="#4A9EFF" @change="reminderOn = !reminderOn" />
    </view>

    <!-- 激励徽章 -->
    <SectionTitle title="已获得徽章" :marginTop="24" />
    <view class="badges-row mx-lg">
      <view
        v-for="badge in exerciseStore.badges"
        :key="badge.id"
        class="badge-item"
        :class="{ 'badge-locked': !badge.unlocked }"
        @tap="onBadgeTap(badge)"
      >
        <text class="badge-icon">{{ badge.icon }}</text>
        <text class="badge-name">{{ badge.name }}</text>
      </view>
    </view>

    <view style="height: 40rpx;" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import NavBar from '@/components/NavBar.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import ProgressRing from '@/components/ProgressRing.vue'
import { useExerciseStore } from '@/store'

const exerciseStore = useExerciseStore()
const activeVideoTab = ref('grow')
const reminderOn = ref(true)

const videoTabs = [
  { id: 'grow', label: '长高专项' },
  { id: 'fun', label: '趣味运动' },
  { id: 'parent', label: '亲子互动' }
]

const allVideos = ref([
  { id: '1', category: 'grow', title: '跳绳提速训练', duration: '8:30', icon: '🏃', bg: 'linear-gradient(135deg, #E8F3FF, #C8DFFF)' },
  { id: '2', category: 'grow', title: '摸高跳连续训练', duration: '6:15', icon: '🤸', bg: 'linear-gradient(135deg, #E8F8F5, #C8F0E0)' },
  { id: '3', category: 'grow', title: '拉伸长高操', duration: '10:00', icon: '🧘', bg: 'linear-gradient(135deg, #FFF3E8, #FFD8B0)' },
  { id: '4', category: 'grow', title: '篮球弹跳训练', duration: '12:00', icon: '🏀', bg: 'linear-gradient(135deg, #FFE8E8, #FFC8C8)' },
  { id: '5', category: 'fun', title: '趣味障碍跑', duration: '15:00', icon: '🎮', bg: 'linear-gradient(135deg, #F0E8FF, #D8C8FF)' },
  { id: '6', category: 'fun', title: '动物模仿操', duration: '8:00', icon: '🐻', bg: 'linear-gradient(135deg, #FFE8F0, #FFC8D8)' },
  { id: '7', category: 'parent', title: '亲子拉伸操', duration: '10:00', icon: '👨‍👧', bg: 'linear-gradient(135deg, #E8FFE8, #C8F0C8)' },
  { id: '8', category: 'parent', title: '双人跳绳', duration: '8:00', icon: '👫', bg: 'linear-gradient(135deg, #FFF8E8, #FFE8C0)' }
])

const filteredVideos = computed(() => allVideos.value.filter(v => v.category === activeVideoTab.value))

const weekLabels = ['一', '二', '三', '四', '五', '六', '日']

const calendarDays = computed(() => {
  const days = []
  // 假设1号是周二，前面补1个空位
  for (let i = 0; i < 1; i++) {
    days.push({ num: 0, active: false })
  }
  for (let i = 1; i <= 31; i++) {
    days.push({
      num: i,
      active: exerciseStore.exerciseDays.includes(i)
    })
  }
  return days
})

function onExerciseTap(exercise: any) {
  uni.showToast({ title: `${exercise.name}详情`, icon: 'none' })
}

function onStartTraining(exercise: any) {
  uni.showToast({ title: `开始${exercise.name}训练`, icon: 'none' })
}

function onMoreVideos() {
  uni.showToast({ title: '更多视频开发中...', icon: 'none' })
}

function onVideoTap(video: any) {
  uni.showToast({ title: `播放：${video.title}`, icon: 'none' })
}

function onBadgeTap(badge: any) {
  if (badge.unlocked) {
    uni.showToast({ title: `已获得：${badge.name}`, icon: 'none' })
  } else {
    uni.showToast({ title: `未解锁：${badge.name}`, icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #F8FAFF;
  padding-bottom: 20rpx;
}

/* 仪表盘 */
.dashboard {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.dashboard-ring-wrap {
  flex-shrink: 0;
}

.ring-inner-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ring-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #4A9EFF;
}

.ring-unit {
  font-size: 22rpx;
  color: #999999;
}

.dashboard-info {
  flex: 1;
}

.dashboard-label {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  display: block;
}

.dashboard-cal {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
  display: block;
}

/* 运动卡片 */
.exercise-scroll {
  white-space: nowrap;
}

.exercise-row {
  display: flex;
  gap: 16rpx;
  padding: 8rpx 0;
}

.exercise-card {
  width: 240rpx;
  flex-shrink: 0;
  background: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(74, 158, 255, 0.08);
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.exercise-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  background: #F0F8FF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.exercise-emoji {
  font-size: 44rpx;
}

.exercise-name {
  font-size: 26rpx;
  font-weight: 500;
  color: #333333;
  display: block;
}

.exercise-duration {
  font-size: 22rpx;
  color: #999999;
  margin-top: 6rpx;
  display: block;
}

.exercise-stars {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #E0E0E0;
}

.star-active {
  color: #FF9900;
}

.btn-start {
  margin-top: 12rpx;
  background: #4A9EFF;
  color: #FFFFFF;
  font-size: 22rpx;
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
}

/* 视频库 */
.video-tabs {
  display: flex;
  gap: 16rpx;
}

.video-tab {
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #999999;
  background: #FFFFFF;
  transition: all 0.2s;
}

.video-tab.active {
  background: #4A9EFF;
  color: #FFFFFF;
}

.video-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.video-card {
  background: #FFFFFF;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(74, 158, 255, 0.06);
}

.video-cover {
  height: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.video-emoji {
  font-size: 48rpx;
}

.play-btn {
  position: absolute;
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  font-size: 24rpx;
  color: #4A9EFF;
  margin-left: 4rpx;
}

.video-duration {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #FFFFFF;
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
}

.video-title {
  font-size: 26rpx;
  color: #333333;
  padding: 12rpx 16rpx;
  display: block;
}

/* 日历 */
.calendar-header {
}

.calendar-month {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.calendar-stat {
  font-size: 24rpx;
  color: #36C2AA;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4rpx;
  text-align: center;
}

.calendar-week-label {
  font-size: 24rpx;
  color: #999999;
  padding: 12rpx 0;
}

.calendar-day {
  padding: 12rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 26rpx;
  color: #333333;
  position: relative;
}

.day-empty {
  visibility: hidden;
}

.day-active {
  color: #36C2AA;
  font-weight: 500;
}

.day-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 6rpx;
  background: #36C2AA;
  margin-top: 4rpx;
}

/* 提醒 */
.reminder-time {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
  display: block;
}

.reminder-desc {
  font-size: 24rpx;
  color: #999999;
  margin-top: 4rpx;
  display: block;
}

/* 徽章 */
.badges-row {
  display: flex;
  gap: 16rpx;
}

.badge-item {
  flex: 1;
  background: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(74, 158, 255, 0.08);
  padding: 24rpx;
  text-align: center;
}

.badge-locked {
  opacity: 0.4;
}

.badge-icon {
  font-size: 48rpx;
  display: block;
}

.badge-name {
  font-size: 24rpx;
  color: #333333;
  margin-top: 8rpx;
  display: block;
}
</style>
