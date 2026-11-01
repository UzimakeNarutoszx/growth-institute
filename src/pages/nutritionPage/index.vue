<template>
  <view class="page-container">
    <NavBar title="营养方案" :showBack="true" />

    <!-- 方案概览卡片 -->
    <view class="card plan-overview">
      <view class="plan-header flex-between">
        <text class="plan-name">{{ nutritionStore.planName }}</text>
        <text class="tag tag-progress">进行中</text>
      </view>
      <view class="plan-progress mt-sm">
        <view class="flex-between">
          <text class="plan-progress-text">已执行：{{ nutritionStore.completedDays }}/{{ nutritionStore.planDays }}天</text>
          <text class="plan-progress-percent">{{ Math.round(nutritionStore.completedDays / nutritionStore.planDays * 100) }}%</text>
        </view>
        <view class="plan-bar mt-sm">
          <view class="plan-bar-fill" :style="{ width: (nutritionStore.completedDays / nutritionStore.planDays * 100) + '%' }" />
        </view>
      </view>
      <text class="plan-effect mt-sm">效果预估：预计助力生长 0.5-0.8cm</text>
    </view>

    <!-- 今日营养任务 -->
    <SectionTitle title="今日营养打卡" :marginTop="24" />
    <view class="card">
      <view
        v-for="task in nutritionStore.todayTasks"
        :key="task.id"
        class="nutrition-task flex-row clickable"
        @tap="nutritionStore.toggleTask(task.id)"
      >
        <view class="task-checkbox" :class="{ checked: task.completed }">
          <text v-if="task.completed" class="check-icon">✓</text>
        </view>
        <text class="task-name" :class="{ completed: task.completed }">{{ task.title }}</text>
      </view>
    </view>

    <!-- 补剂服用提醒 -->
    <SectionTitle title="补剂服用提醒" :marginTop="24" />
    <view class="card supplement-timeline">
      <view
        v-for="(sup, index) in nutritionStore.supplements"
        :key="sup.id"
        class="sup-item flex-row clickable"
        @tap="toggleSupplement(sup)"
      >
        <view class="sup-time-col">
          <text class="sup-time">{{ sup.time }}</text>
          <view class="sup-line" v-if="index < nutritionStore.supplements.length - 1" />
        </view>
        <view class="sup-dot" :class="{ 'dot-taken': sup.taken }" />
        <view class="sup-info flex-1">
          <text class="sup-name">{{ sup.name }}</text>
          <text class="sup-dose">{{ sup.dose }}</text>
        </view>
        <text class="sup-status" :class="{ taken: sup.taken }">{{ sup.taken ? '已服' : '未服' }}</text>
      </view>
    </view>

    <!-- 食谱推荐 -->
    <SectionTitle title="本周推荐食谱" :marginTop="24" />
    <scroll-view scroll-x class="recipe-scroll mx-lg">
      <view class="recipe-row">
        <view
          v-for="(recipe, index) in weekRecipes"
          :key="index"
          class="recipe-card clickable"
          @tap="onRecipeTap(recipe)"
        >
          <view class="recipe-cover" :style="{ background: recipe.bg }">
            <text class="recipe-emoji">{{ recipe.icon }}</text>
          </view>
          <view class="recipe-info">
            <text class="recipe-day">{{ recipe.day }}</text>
            <view class="recipe-tags flex-row">
              <text class="recipe-tag">蛋白{{ recipe.protein }}g</text>
              <text class="recipe-tag">钙{{ recipe.calcium }}mg</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 营养知识Tips -->
    <view class="tips-bar mx-lg mt-md">
      <text class="tips-icon">💡</text>
      <marquee-text :text="tipText" />
      <text class="tips-text">{{ tipText }}</text>
    </view>

    <!-- 操作按钮 -->
    <view class="action-area mx-lg mt-lg">
      <view
        class="btn-checkin"
        :class="{ 'btn-all-done': nutritionStore.allTasksCompleted }"
        @tap="onCheckIn"
      >
        <text>{{ nutritionStore.allTasksCompleted ? '✓ 今日打卡完成' : '完成今日打卡' }}</text>
      </view>
      <view class="flex-row mt-md" style="gap: 16rpx;">
        <view class="btn-secondary flex-1" @tap="onAdjustPlan">调整方案</view>
        <view class="btn-secondary flex-1" @tap="onProblem">遇到问题</view>
      </view>
    </view>

    <view style="height: 40rpx;" />

    <!-- 庆祝动效 -->
    <Celebration
      :visible="showCelebration"
      title="打卡完成！"
      desc="坚持就是胜利，继续加油！"
      @close="showCelebration = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NavBar from '@/components/NavBar.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import Celebration from '@/components/Celebration.vue'
import { useNutritionStore } from '@/store'

const nutritionStore = useNutritionStore()
const showCelebration = ref(false)

const tipText = ref('你知道吗？维生素D能促进钙吸收，户外运动很重要！每天晒太阳15-30分钟效果最佳。')

const weekRecipes = ref([
  { day: '周一', icon: '🍳', bg: 'linear-gradient(135deg, #FFF8E8, #FFE8C0)', protein: 45, calcium: 520 },
  { day: '周二', icon: '🐟', bg: 'linear-gradient(135deg, #E8F8F5, #C8F0E0)', protein: 50, calcium: 480 },
  { day: '周三', icon: '🥩', bg: 'linear-gradient(135deg, #FFE8E8, #FFC8C8)', protein: 48, calcium: 510 },
  { day: '周四', icon: '🥚', bg: 'linear-gradient(135deg, #E8F3FF, #C8DFFF)', protein: 42, calcium: 550 },
  { day: '周五', icon: '🍤', bg: 'linear-gradient(135deg, #FFE8F0, #FFC0D8)', protein: 46, calcium: 530 },
  { day: '周六', icon: '🥗', bg: 'linear-gradient(135deg, #E8FFE8, #C0F0C0)', protein: 44, calcium: 500 },
  { day: '周日', icon: '🍲', bg: 'linear-gradient(135deg, #FFF0E8, #FFD8B8)', protein: 52, calcium: 540 }
])

function toggleSupplement(sup: any) {
  nutritionStore.toggleSupplement(sup.id)
}

function onRecipeTap(recipe: any) {
  uni.showToast({ title: `${recipe.day}食谱详情开发中`, icon: 'none' })
}

function onCheckIn() {
  if (nutritionStore.allTasksCompleted) {
    showCelebration.value = true
  } else {
    uni.showToast({ title: '请先完成所有营养任务', icon: 'none' })
  }
}

function onAdjustPlan() {
  uni.showToast({ title: '方案定制页开发中...', icon: 'none' })
}

function onProblem() {
  uni.showToast({ title: '营养师咨询开发中...', icon: 'none' })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #F8FAFF;
  padding-bottom: 20rpx;
}

/* 方案概览 */
.plan-overview {
  margin-top: 16rpx;
  background: linear-gradient(135deg, #E8F8F5, #F0F8FF);
}

.plan-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.plan-progress-text {
  font-size: 24rpx;
  color: #666666;
}

.plan-progress-percent {
  font-size: 24rpx;
  font-weight: 500;
  color: #36C2AA;
}

.plan-bar {
  height: 12rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6rpx;
  overflow: hidden;
}

.plan-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #36C2AA, #4A9EFF);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.plan-effect {
  font-size: 24rpx;
  color: #666666;
}

/* 营养任务 */
.nutrition-task {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F5F5F5;
}

.nutrition-task:last-child {
  border-bottom: none;
}

.task-checkbox {
  width: 44rpx;
  height: 44rpx;
  border-radius: 22rpx;
  border: 2rpx solid #CCCCCC;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  transition: all 0.2s;
}

.task-checkbox.checked {
  background: #36C2AA;
  border-color: #36C2AA;
}

.check-icon {
  color: #FFFFFF;
  font-size: 26rpx;
  font-weight: bold;
}

.task-name {
  font-size: 28rpx;
  color: #333333;
  transition: all 0.2s;
}

.task-name.completed {
  color: #CCCCCC;
  text-decoration: line-through;
}

/* 补剂时间轴 */
.sup-item {
  padding: 16rpx 0;
  gap: 16rpx;
  position: relative;
}

.sup-time-col {
  width: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sup-time {
  font-size: 24rpx;
  color: #666666;
  font-weight: 500;
}

.sup-line {
  width: 2rpx;
  height: 40rpx;
  background: #E0E0E0;
  margin-top: 8rpx;
}

.sup-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 10rpx;
  background: #E0E0E0;
  flex-shrink: 0;
  margin-top: 6rpx;
  transition: background 0.2s;
}

.dot-taken {
  background: #36C2AA;
}

.sup-name {
  font-size: 28rpx;
  color: #333333;
  display: block;
}

.sup-dose {
  font-size: 24rpx;
  color: #999999;
  margin-top: 4rpx;
  display: block;
}

.sup-status {
  font-size: 24rpx;
  color: #FF9900;
  padding: 4rpx 16rpx;
  background: #FFF8E8;
  border-radius: 20rpx;
  align-self: flex-start;
  margin-top: 4rpx;
}

.sup-status.taken {
  color: #36C2AA;
  background: #E8F8F5;
}

/* 食谱 */
.recipe-scroll {
  white-space: nowrap;
}

.recipe-row {
  display: flex;
  gap: 16rpx;
  padding: 8rpx 0;
}

.recipe-card {
  width: 200rpx;
  flex-shrink: 0;
  background: #FFFFFF;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(74, 158, 255, 0.06);
  overflow: hidden;
}

.recipe-cover {
  height: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recipe-emoji {
  font-size: 52rpx;
}

.recipe-info {
  padding: 12rpx 16rpx;
}

.recipe-day {
  font-size: 26rpx;
  font-weight: 500;
  color: #333333;
  display: block;
}

.recipe-tags {
  margin-top: 6rpx;
  gap: 8rpx;
}

.recipe-tag {
  font-size: 20rpx;
  color: #36C2AA;
  background: #E8F8F5;
  padding: 2rpx 10rpx;
  border-radius: 10rpx;
}

/* Tips */
.tips-bar {
  display: flex;
  align-items: center;
  background: #FFF8E8;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  gap: 12rpx;
}

.tips-icon {
  font-size: 32rpx;
  flex-shrink: 0;
}

.tips-text {
  font-size: 24rpx;
  color: #FF9900;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 打卡按钮 */
.btn-checkin {
  background: #4A9EFF;
  color: #FFFFFF;
  text-align: center;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 30rpx;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-all-done {
  background: #36C2AA;
}

.action-area .btn-secondary {
  text-align: center;
  padding: 20rpx 0;
}
</style>
