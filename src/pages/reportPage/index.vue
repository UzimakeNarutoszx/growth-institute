<template>
  <view class="page-container">
    <NavBar title="生长评估报告" :showBack="true">
      <template #right>
        <view class="clickable" @tap="onShare">
          <text class="share-icon">📤</text>
        </view>
      </template>
    </NavBar>

    <!-- 未完成测评：空状态 -->
    <template v-if="!assessmentStore.isCompleted">
      <view class="empty-state-wrap">
        <view class="empty-state-card card">
          <text class="empty-icon">📋</text>
          <text class="empty-title">尚未完成测评</text>
          <text class="empty-desc">完成一次完整的科学测评后，将为您生成专属的生长评估报告</text>
          <view class="empty-link clickable" @tap="goAssessment">
            <text class="empty-link-text">点击跳转测评 ›</text>
          </view>
        </view>
      </view>
    </template>

    <!-- 已完成测评：完整报告 -->
    <template v-else>
      <!-- 报告头部 -->
      <view class="report-header card">
        <view class="child-info-row flex-row">
          <view class="child-avatar">
            <text class="avatar-emoji">👦</text>
          </view>
          <view class="child-details flex-1">
            <text class="child-name">{{ userStore.childInfo }}</text>
            <text class="report-time">报告生成时间：{{ latestReportDate }}</text>
          </view>
        </view>
      </view>

      <!-- 综合评分展示 -->
      <view class="score-card card">
        <view class="score-ring-wrap">
          <ProgressRing
            :value="latestScore"
            :total="100"
            :size="240"
            :thickness="30"
            primaryColor="#4A9EFF"
            secondaryColor="#36C2AA"
          >
            <view class="score-inner">
              <text class="score-number">{{ latestScore }}</text>
              <text class="score-total">/100</text>
            </view>
          </ProgressRing>
        </view>
        <text class="score-desc">{{ latestSummary }}</text>
      </view>

      <!-- 关键指标模块 -->
      <SectionTitle title="关键指标" :marginTop="24" />

      <view v-for="(indicator, index) in indicators" :key="index" class="card indicator-card">
        <view class="indicator-header flex-between clickable" @tap="toggleIndicator(index)">
          <view class="flex-row">
            <text class="indicator-icon">{{ indicator.icon }}</text>
            <text class="indicator-title">{{ indicator.title }}</text>
          </view>
          <text class="indicator-arrow" :class="{ 'arrow-expanded': indicator.expanded }">›</text>
        </view>
        <view class="indicator-content" v-if="indicator.expanded">
          <text class="indicator-detail">{{ indicator.detail }}</text>
        </view>
      </view>

      <!-- 补剂推荐模块 -->
      <SectionTitle title="个性化营养方案" :marginTop="24" />
      <view class="supplement-list">
        <view
          v-for="sup in supplements"
          :key="sup.id"
          class="card supplement-card clickable"
          @tap="showSupplementDetail(sup)"
        >
          <view class="sup-row">
            <view class="sup-img-wrap">
              <image class="sup-img" :src="sup.image" mode="aspectFill" />
            </view>
            <view class="sup-info flex-1">
              <text class="sup-name">{{ sup.name }}</text>
              <text class="sup-desc">{{ sup.desc }}</text>
              <text class="sup-dose">推荐剂量：{{ sup.dose }}</text>
              <text class="sup-cycle">服用周期：{{ sup.cycle }}</text>
            </view>
          </view>
          <view class="sup-bottom flex-between">
            <text class="sup-tag">{{ sup.tag }}</text>
            <text class="sup-arrow">查看详情 ›</text>
          </view>
        </view>
      </view>

      <!-- 生活方式建议 -->
      <SectionTitle title="生活方式建议" :marginTop="24" />
      <view class="card advice-card">
        <view v-for="(advice, index) in adviceList" :key="index" class="advice-item flex-row">
          <text class="advice-icon">{{ advice.icon }}</text>
          <view class="advice-content flex-1">
            <text class="advice-label">{{ advice.label }}</text>
            <text class="advice-text">{{ advice.text }}</text>
          </view>
        </view>
      </view>

      <!-- 行动按钮组 -->
      <view class="action-group mx-lg mt-lg">
        <view class="btn-gradient" @tap="onSavePlan">
          保存为我的方案
        </view>
        <view class="flex-row mt-md" style="gap: 16rpx;">
          <view class="btn-secondary flex-1" @tap="onBookExpert">
            豆包AI咨询
          </view>
          <view class="btn-secondary flex-1" @tap="onRemindRetest">
            3个月后提醒复测
          </view>
        </view>
      </view>

      <!-- 补剂详情弹窗 -->
      <view class="modal-overlay" v-if="showModal" @tap="showModal = false">
        <view class="modal-content" @tap.stop>
          <view class="modal-header flex-between">
            <text class="modal-title">{{ modalData.name }}</text>
            <text class="modal-close clickable" @tap="showModal = false">✕</text>
          </view>
          <view class="modal-body">
            <text class="modal-label">成分说明</text>
            <text class="modal-text">{{ modalData.ingredient }}</text>
            <text class="modal-label mt-md">作用机理</text>
            <text class="modal-text">{{ modalData.effect }}</text>
            <text class="modal-label mt-md">注意事项</text>
            <text class="modal-text">{{ modalData.notice }}</text>
          </view>
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
import ProgressRing from '@/components/ProgressRing.vue'
import { useUserStore, useAssessmentStore } from '@/store'
import { navigateTo } from '@/utils/navigate'

const userStore = useUserStore()
const assessmentStore = useAssessmentStore()

// 从最新报告中获取数据
const latestReport = computed(() => {
  const reports = assessmentStore.historyReports
  return reports.length > 0 ? reports[reports.length - 1] : null
})

const latestScore = computed(() => latestReport.value?.score ?? assessmentStore.score ?? 78)
const latestSummary = computed(() => latestReport.value?.summary ?? '生长潜力良好，营养有优化空间')
const latestReportDate = computed(() => {
  if (latestReport.value?.date) return latestReport.value.date
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})

function goAssessment() {
  navigateTo('/pages/assessmentHomePage/index')
}

// 关键指标
const indicators = ref([
  { icon: '📏', title: '遗传潜力', detail: '遗传靶身高：172±4cm\n基于父母身高计算，孩子成年预测身高在168-176cm范围', expanded: true },
  { icon: '📊', title: '当前状态', detail: '身高百分位：65%（中等偏上）\nBMI：16.1（正常范围）\n体重与身高比例协调', expanded: false },
  { icon: '📈', title: '生长速度', detail: '近6个月增长：3.5cm（达标）\n年均增长速度：约6.5cm\n处于正常生长速度范围内', expanded: false },
  { icon: '⚡', title: '营养评估', detail: '蛋白质：充足 ✓\n钙：轻微不足 ⚠️\n锌：需要关注 ⚠️\n维生素D：建议补充 ⚠️', expanded: false }
])

function toggleIndicator(index: number) {
  indicators.value[index].expanded = !indicators.value[index].expanded
}

// 补剂推荐
const supplements = ref([
  { id: '1', name: '分离乳清蛋白粉', image: '/static/images/S001.png', desc: '纯牛蛋白·营养火拼', dose: '每日1勺（约10g），温水冲服', cycle: '持续补充', tag: '优质蛋白', ingredient: '分离乳清蛋白、浓缩乳清蛋白', effect: '提供优质蛋白质，促进肌肉和骨骼发育，增强体质，助力生长期营养储备', notice: '建议早餐或运动后30分钟内服用，温水冲调（40°C以下），避免与碳酸饮料同服。' },
  { id: '2', name: '维生素D3软胶囊', image: '/static/images/S002.png', desc: '促进钙吸收·阳光活力', dose: '400IU/天', cycle: '持续补充', tag: '钙吸收', ingredient: '胆钙化醇（维生素D3）', effect: '促进钙、磷吸收，有助于骨骼正常发育，增强免疫力', notice: '建议餐后服用，配合牛奶效果更佳。避免与大剂量维生素A同服。' },
  { id: '3', name: '乳钙咀嚼片', image: '/static/images/S003.png', desc: '骨骼小伙伴·牛奶口味', dose: '钙500mg/天', cycle: '3个月为一周期', tag: '骨骼发育', ingredient: '天然牛乳钙、全脂奶粉', effect: '补充骨骼发育所需钙质，天然乳钙更易吸收，口感好孩子爱吃', notice: '建议分次服用（早晚各一次），避免空腹。与铁剂间隔2小时以上。' },
  { id: '4', name: '葡萄糖酸锌口服液', image: '/static/images/S004.png', desc: '深蓝青口·守护食欲', dose: '锌5mg/天', cycle: '2-3个月为一周期', tag: '促进食欲', ingredient: '葡萄糖酸锌', effect: '锌参与生长激素合成，改善食欲，提高免疫力，促进伤口愈合', notice: '建议饭后服用，避免与牛奶同时服用，间隔1小时以上。' },
  { id: '5', name: '维生素A软胶囊', image: '/static/images/S005.png', desc: '明眸守护者', dose: '1500IU/天', cycle: '持续补充', tag: '视力保护', ingredient: '维生素A（视黄醇棕榈酸酯）', effect: '维护视觉功能，促进细胞生长分化，增强免疫屏障功能', notice: '建议随餐服用，脂溶性维生素需配合食物中的油脂吸收。不可过量服用。' }
])

const showModal = ref(false)
const modalData = ref<any>({})

function showSupplementDetail(sup: any) {
  modalData.value = sup
  showModal.value = true
}

// 生活建议
const adviceList = ref([
  { icon: '🥛', label: '饮食建议', text: '增加奶制品摄入，每日500ml；多吃深色蔬菜和优质蛋白' },
  { icon: '🏃', label: '运动建议', text: '每日户外运动≥1小时，推荐跳绳、篮球等纵向跳跃运动' },
  { icon: '🌙', label: '睡眠建议', text: '保证9小时睡眠，22:00前入睡，避免睡前使用电子设备' }
])

function onShare() {
  uni.showActionSheet({
    itemList: ['保存为图片', '导出PDF'],
    success: (res) => {
      uni.showToast({ title: '分享功能开发中...', icon: 'none' })
    }
  })
}

function onSavePlan() {
  uni.showToast({ title: '方案已保存', icon: 'success' })
}

function onBookExpert() {
  navigateTo('/pages/expertPage/index')
}

function onRemindRetest() {
  uni.showToast({ title: '已设置3个月后提醒', icon: 'success' })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #F8FAFF;
  padding-bottom: 20rpx;
}

/* 空状态 */
.empty-state-wrap {
  display: flex;
  justify-content: center;
  padding-top: 120rpx;
}

.empty-state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
  text-align: center;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999999;
  line-height: 1.6;
  margin-bottom: 40rpx;
}

.empty-link {
  background: linear-gradient(135deg, #4A9EFF, #36C2AA);
  border-radius: 40rpx;
  padding: 20rpx 60rpx;
}

.empty-link-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 报告头部 */
.child-info-row {
  gap: 16rpx;
}

.child-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  background: #E8F3FF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-emoji {
  font-size: 40rpx;
}

.child-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  display: block;
}

.report-time {
  font-size: 24rpx;
  color: #999999;
  margin-top: 6rpx;
  display: block;
}

.share-icon {
  font-size: 36rpx;
}

/* 评分环形图 */
.score-card {
  text-align: center;
  padding: 40rpx 24rpx;
}

.score-ring-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 20rpx;
}

.score-inner {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.score-number {
  font-size: 60rpx;
  font-weight: 700;
  color: #4A9EFF;
}

.score-total {
  font-size: 28rpx;
  color: #999999;
}

.score-desc {
  font-size: 28rpx;
  color: #666666;
}

/* 指标折叠面板 */
.indicator-header {
  padding: 4rpx 0;
}

.indicator-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.indicator-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.indicator-arrow {
  font-size: 36rpx;
  color: #CCCCCC;
  transition: transform 0.3s ease;
  display: inline-block;
}

.arrow-expanded {
  transform: rotate(90deg);
}

.indicator-content {
  padding-top: 16rpx;
  border-top: 1rpx solid #F0F0F0;
  margin-top: 12rpx;
}

.indicator-detail {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.8;
  white-space: pre-line;
}

/* 补剂卡片 */
.supplement-card {
  padding: 20rpx 24rpx;
}

.sup-row {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
}

.sup-img-wrap {
  width: 180rpx;
  height: 180rpx;
  border-radius: 16rpx;
  overflow: hidden;
  flex-shrink: 0;
  background: #F5F8FF;
}

.sup-img {
  width: 100%;
  height: 100%;
}

.sup-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  display: block;
}

.sup-desc {
  font-size: 24rpx;
  color: #4A9EFF;
  margin-top: 6rpx;
  display: block;
}

.sup-dose, .sup-cycle {
  font-size: 24rpx;
  color: #999999;
  margin-top: 6rpx;
  display: block;
}

.sup-bottom {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #F0F0F0;
}

.sup-tag {
  font-size: 22rpx;
  color: #36C2AA;
  background: #E8F8F5;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.sup-arrow {
  font-size: 24rpx;
  color: #4A9EFF;
  white-space: nowrap;
}

/* 建议 */
.advice-item {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F5F5F5;
  align-items: flex-start;
}

.advice-item:last-child {
  border-bottom: none;
}

.advice-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
  margin-top: 4rpx;
}

.advice-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #333333;
  display: block;
}

.advice-text {
  font-size: 24rpx;
  color: #666666;
  margin-top: 6rpx;
  line-height: 1.6;
  display: block;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-content {
  width: 100%;
  max-height: 70vh;
  background: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;
}

.modal-header {
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
}

.modal-close {
  font-size: 32rpx;
  color: #999999;
  padding: 10rpx;
}

.modal-body {
  padding-top: 20rpx;
}

.modal-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.modal-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.7;
  display: block;
}

/* 行动按钮 */
.action-group .btn-secondary {
  text-align: center;
  padding: 20rpx 0;
}
</style>
