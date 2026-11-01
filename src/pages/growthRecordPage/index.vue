<template>
  <view class="page-container">
    <NavBar title="成长记录" />

    <!-- 无数据时的空状态提示 -->
    <view v-if="!growthStore.hasRecords" class="empty-state">
      <text class="empty-icon">📏</text>
      <text class="empty-text">还没有成长记录</text>
      <text class="empty-hint">请在下方录入孩子的身高和体重数据，开始记录成长轨迹</text>
    </view>

    <!-- 有数据时显示筛选和图表 -->
    <template v-if="growthStore.hasRecords">
      <!-- 时间筛选器 -->
      <view class="filter-tabs mx-lg mt-sm">
        <view
          v-for="tab in timeFilters"
          :key="tab.id"
          class="filter-tab"
          :class="{ active: activeFilter === tab.id }"
          @tap="activeFilter = tab.id"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>

      <!-- 生长曲线图（简化展示） -->
      <view class="card chart-card">
        <text class="chart-title">生长曲线</text>
        <view class="chart-placeholder">
          <view class="chart-area">
            <!-- 标准区间背景 -->
            <view class="chart-band" />
            <!-- 简化的曲线展示 -->
            <view class="chart-line">
              <view
                v-for="(record, index) in filteredRecords"
                :key="index"
                class="chart-point"
                :style="{
                  left: filteredRecords.length > 1 ? (index / (filteredRecords.length - 1)) * 100 + '%' : '50%',
                  bottom: maxHeight > minHeight ? ((record.height - minHeight) / (maxHeight - minHeight)) * 100 + '%' : '50%'
                }"
                @tap="showPointDetail(record)"
              >
                <view class="point-dot" />
                <text class="point-label" v-if="index === filteredRecords.length - 1">{{ record.height }}cm</text>
              </view>
            </view>
            <!-- Y轴标签 -->
            <view class="y-axis">
              <text class="y-label">{{ maxHeight }}cm</text>
              <text class="y-label">{{ ((maxHeight + minHeight) / 2).toFixed(1) }}cm</text>
              <text class="y-label">{{ minHeight }}cm</text>
            </view>
          </view>
          <view class="chart-legend flex-row mt-sm">
            <view class="legend-item"><view class="legend-dot legend-actual" /><text class="legend-text">实际身高</text></view>
            <view class="legend-item"><view class="legend-dot legend-standard" /><text class="legend-text">标准区间</text></view>
            <view class="legend-item"><view class="legend-dot legend-genetic" /><text class="legend-text">遗传靶身高</text></view>
          </view>
        </view>
      </view>
    </template>

    <!-- 数据录入卡片 -->
    <SectionTitle title="记录今日数据" :marginTop="24" />
    <view class="card input-card">
      <view class="input-row flex-row">
        <view class="input-group flex-1">
          <text class="input-label">身高（cm）</text>
          <input
            class="input-field"
            type="digit"
            v-model="inputHeight"
            placeholder="请输入"
            placeholder-class="input-placeholder"
          />
        </view>
        <view class="input-divider" />
        <view class="input-group flex-1">
          <text class="input-label">体重（kg）</text>
          <input
            class="input-field"
            type="digit"
            v-model="inputWeight"
            placeholder="请输入"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>
      <view class="quick-actions flex-row mt-md">
        <view class="btn-secondary quick-btn" @tap="fillLastMonth">与上月相同</view>
        <view class="btn-secondary quick-btn" @tap="onPhoto">📷 拍照记录</view>
      </view>
      <view class="btn-primary save-btn mt-md" @tap="onSaveRecord">保存记录</view>
    </view>

    <!-- 里程碑时间轴 -->
    <template v-if="growthStore.milestones.length > 0">
      <SectionTitle title="成长里程碑" :marginTop="24" />
      <view class="timeline mx-lg">
        <view
          v-for="(milestone, index) in growthStore.milestones"
          :key="index"
          class="timeline-item clickable"
          @tap="onMilestoneTap(milestone)"
        >
          <view class="timeline-left">
            <view class="timeline-dot" />
            <view class="timeline-line" v-if="index < growthStore.milestones.length - 1" />
          </view>
          <view class="timeline-content card">
            <text class="timeline-date">{{ milestone.date }}</text>
            <text class="timeline-event">{{ milestone.icon }} {{ milestone.event }}</text>
          </view>
        </view>
      </view>
    </template>

    <!-- 数据统计卡片组（至少有2条记录才显示） -->
    <template v-if="growthStore.records.length >= 2">
      <SectionTitle title="生长统计" :marginTop="24" />
      <view class="stats-grid mx-lg">
        <view class="stat-card clickable" @tap="onStatTap('month')">
          <text class="stat-value">{{ growthStore.monthGrowth }}cm</text>
          <text class="stat-label">本月增长</text>
        </view>
        <view class="stat-card clickable" @tap="onStatTap('quarter')">
          <text class="stat-value">{{ growthStore.quarterGrowth }}cm</text>
          <text class="stat-label">本季增长</text>
        </view>
        <view class="stat-card clickable" @tap="onStatTap('year')">
          <text class="stat-value">{{ growthStore.yearGrowth }}cm</text>
          <text class="stat-label">本年增长</text>
        </view>
        <view class="stat-card clickable" @tap="onStatTap('compare')">
          <text class="stat-value positive">+{{ growthStore.compareLastYear }}cm</text>
          <text class="stat-label">比去年同期</text>
        </view>
      </view>
    </template>

    <view style="height: 40rpx;" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import NavBar from '@/components/NavBar.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import { useGrowthStore } from '@/store'
import { showToast } from '@/utils/navigate'

const growthStore = useGrowthStore()

const activeFilter = ref('all')
const inputHeight = ref('')
const inputWeight = ref('')

const timeFilters = [
  { id: 'all', label: '全部' },
  { id: '3m', label: '近3月' },
  { id: '6m', label: '近6月' },
  { id: '1y', label: '近1年' }
]

const filteredRecords = computed(() => {
  const records = growthStore.records
  switch (activeFilter.value) {
    case '3m': return records.slice(-3)
    case '6m': return records.slice(-6)
    case '1y': return records.slice(-12)
    default: return records
  }
})

const minHeight = computed(() => {
  const heights = filteredRecords.value.map(r => r.height)
  return Math.floor(Math.min(...heights) - 1)
})

const maxHeight = computed(() => {
  const heights = filteredRecords.value.map(r => r.height)
  return Math.ceil(Math.max(...heights) + 1)
})

function showPointDetail(record: any) {
  uni.showToast({ title: `${record.date}: ${record.height}cm / ${record.weight}kg`, icon: 'none', duration: 2000 })
}

function fillLastMonth() {
  if (growthStore.records.length === 0) {
    uni.showToast({ title: '暂无历史记录', icon: 'none' })
    return
  }
  const last = growthStore.records[growthStore.records.length - 1]
  inputHeight.value = String(last.height)
  inputWeight.value = String(last.weight)
}

function onPhoto() {
  uni.showToast({ title: '拍照功能开发中...', icon: 'none' })
}

function onSaveRecord() {
  const h = parseFloat(inputHeight.value)
  const w = parseFloat(inputWeight.value)
  if (!h || !w) {
    showToast('请输入完整的身高和体重数据')
    return
  }
  growthStore.addRecord(h, w)
  showToast('记录保存成功', 'success')
  inputHeight.value = ''
  inputWeight.value = ''
}

function onMilestoneTap(milestone: any) {
  uni.showToast({ title: milestone.event, icon: 'none', duration: 2000 })
}

function onStatTap(type: string) {
  uni.showToast({ title: '数据趋势分析开发中...', icon: 'none' })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #F8FAFF;
  padding-bottom: 20rpx;
}

/* 空状态 */
.empty-hint {
  font-size: 24rpx;
  color: #CCCCCC;
  margin-top: 12rpx;
  text-align: center;
  padding: 0 60rpx;
}

/* 时间筛选 */
.filter-tabs {
  display: flex;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(74, 158, 255, 0.08);
}

.filter-tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 26rpx;
  color: #999999;
  border-radius: 12rpx;
  transition: all 0.2s;
}

.filter-tab.active {
  background: #4A9EFF;
  color: #FFFFFF;
  font-weight: 500;
}

/* 图表区域 */
.chart-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  display: block;
  margin-bottom: 20rpx;
}

.chart-area {
  position: relative;
  height: 300rpx;
  margin-left: 80rpx;
}

.chart-band {
  position: absolute;
  left: 0;
  right: 0;
  top: 20%;
  bottom: 20%;
  background: rgba(232, 243, 255, 0.5);
  border-radius: 8rpx;
}

.chart-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

.chart-point {
  position: absolute;
  transform: translateX(-50%);
}

.point-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
  background: #4A9EFF;
  border: 3rpx solid #FFFFFF;
  box-shadow: 0 2rpx 6rpx rgba(74, 158, 255, 0.3);
}

.point-label {
  position: absolute;
  top: -40rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 22rpx;
  color: #4A9EFF;
  white-space: nowrap;
  font-weight: 500;
}

.y-axis {
  position: absolute;
  left: -80rpx;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.y-label {
  font-size: 20rpx;
  color: #999999;
}

.chart-legend {
  justify-content: center;
  gap: 32rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
}

.legend-actual {
  background: #4A9EFF;
}

.legend-standard {
  background: #E8F3FF;
}

.legend-genetic {
  background: #36C2AA;
  border: 2rpx dashed #36C2AA;
}

.legend-text {
  font-size: 22rpx;
  color: #999999;
}

/* 数据录入 */
.input-row {
  gap: 20rpx;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 12rpx;
}

.input-field {
  background: #F8FAFF;
  border: 1rpx solid #E0E0E0;
  border-radius: 8rpx;
  padding: 16rpx 20rpx;
  font-size: 28rpx;
  color: #333333;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #4A9EFF;
}

.input-divider {
  width: 1rpx;
  background: #F0F0F0;
  align-self: stretch;
}

.quick-actions {
  gap: 16rpx;
}

.quick-btn {
  flex: 1;
  font-size: 24rpx;
  padding: 14rpx 0;
}

.save-btn {
  width: 100%;
  text-align: center;
}

/* 时间轴 */
.timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 16rpx;
  margin-bottom: 0;
}

.timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40rpx;
}

.timeline-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 12rpx;
  background: #4A9EFF;
  border: 4rpx solid #E8F3FF;
  flex-shrink: 0;
  z-index: 1;
}

.timeline-line {
  width: 4rpx;
  flex: 1;
  background: #CCCCCC;
  margin: 4rpx 0;
}

.timeline-content {
  flex: 1;
  margin-bottom: 16rpx;
  padding: 16rpx 20rpx;
}

.timeline-date {
  font-size: 22rpx;
  color: #999999;
  display: block;
}

.timeline-event {
  font-size: 26rpx;
  color: #333333;
  margin-top: 6rpx;
  display: block;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.stat-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(74, 158, 255, 0.08);
  padding: 24rpx;
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #4A9EFF;
  display: block;
}

.stat-value.positive {
  color: #36C2AA;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
  display: block;
}
</style>
