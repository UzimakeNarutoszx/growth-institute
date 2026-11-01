<template>
  <view class="page-container">
    <NavBar title="关于生长研究院" />

    <scroll-view scroll-y class="content-scroll">
      <!-- 顶部 Logo & 版本 -->
      <view class="hero-section">
        <view class="logo-circle">
          <text class="logo-icon">🌱</text>
        </view>
        <text class="app-name">生长研究院</text>
        <text class="version-tag">v1.0.0 萌芽版 · Sprout</text>
        <text class="slogan">用科学，陪伴每一次成长</text>
      </view>

      <!-- 关于生长研究院 -->
      <view class="section-card mx-lg">
        <view class="section-header">
          <text class="section-icon">🌱</text>
          <text class="section-title">关于生长研究院</text>
        </view>
        <view class="section-body">
          <text class="paragraph">生长研究院，不是一个冰冷的测评工具。</text>
          <text class="paragraph">它诞生于一个简单的发现：太多家长为了孩子的身高焦虑，却不知道去哪里获得真正科学、可执行的指导。</text>
          <text class="paragraph">网上信息鱼龙混杂，亲戚经验因人而异，医院挂号难、问诊短，回到家依然不知道明天该做什么。</text>
          <text class="paragraph highlight">所以我们想：能不能有一个地方，把散落在医学论文、营养指南、临床实践里的生长知识，变成每个家庭都能看懂、能用上的个性化方案？</text>
          <text class="paragraph">生长研究院，因此而来。</text>
          <text class="paragraph">我们不是要替代医生，而是做<text class="bold">家长与专业医学之间的那座桥梁</text>。用数据读懂孩子的生长节奏，用科学回应家长的每一个"怎么办"。</text>
        </view>
      </view>

      <!-- 我们的名字 -->
      <view class="section-card mx-lg">
        <view class="section-header">
          <text class="section-icon">🧪</text>
          <text class="section-title">我们的名字</text>
        </view>
        <view class="section-body">
          <text class="paragraph"><text class="bold">"生长"</text>，是骨骼的延长，是体重的增加，更是每一天的积累、每一次的突破。</text>
          <text class="paragraph"><text class="bold">"研究院"</text>，不是自负为权威机构，而是承诺一种态度——<text class="bold">每一个建议，都有出处；每一个方案，都有依据</text>。</text>
          <text class="paragraph">我们不生产"偏方"，只翻译"科学"。</text>
        </view>
      </view>

      <!-- 核心功能 -->
      <view class="section-card mx-lg">
        <view class="section-header">
          <text class="section-icon">✨</text>
          <text class="section-title">v1.0.0 核心功能</text>
        </view>
        <view class="section-body">
          <!-- 多维科学测评 -->
          <view class="feature-block">
            <text class="feature-title">🔬 多维科学测评</text>
            <text class="feature-item">• 整合遗传靶身高、生长速度、骨龄、BMI、饮食运动等15+维度</text>
            <text class="feature-item">• 告别"一刀切"建议，每一份报告都只属于你的孩子</text>
            <text class="feature-item">• 已覆盖3-19岁全年龄段，精确到月的生长标准对照</text>
          </view>

          <!-- 生长档案可视化 -->
          <view class="feature-block">
            <text class="feature-title">📊 生长档案可视化</text>
            <text class="feature-item">• 自动生成身高、体重生长曲线，与WHO标准区间同屏对比</text>
            <text class="feature-item">• 长按图表，可查看任意时间点的具体数值</text>
            <text class="feature-item">• 记录每一次"长高了0.5cm"的微小喜悦</text>
          </view>

          <!-- 个性化营养方案 -->
          <view class="feature-block">
            <text class="feature-title">🥗 个性化营养方案</text>
            <text class="feature-item">• 基于测评缺口，推荐精准补剂与膳食调整</text>
            <text class="feature-item">• 自动过滤过敏原（牛奶/大豆/坚果等）</text>
            <text class="feature-item">• 每日营养打卡，把"知道"变成"做到"</text>
          </view>

          <!-- 适龄运动计划 -->
          <view class="feature-block">
            <text class="feature-title">🏃 适龄运动计划</text>
            <text class="feature-item">• 根据年龄、骨龄推荐安全有效的长高运动</text>
            <text class="feature-item">• 跳绳、摸高、拉伸……配有动作指导与视频库</text>
            <text class="feature-item">• 亲子互动设计，让运动不再是"任务"</text>
          </view>

          <!-- 成长社区 -->
          <view class="feature-block">
            <text class="feature-title">👪 成长社区</text>
            <text class="feature-item">• 真实家长的食谱分享、运动打卡、心得交流</text>
            <text class="feature-item">• 这里没有焦虑贩卖，只有"我懂你"的陪伴</text>
          </view>
        </view>
      </view>

      <!-- 关于设计 -->
      <view class="section-card mx-lg">
        <view class="section-header">
          <text class="section-icon">🎨</text>
          <text class="section-title">关于设计</text>
        </view>
        <view class="section-body">
          <text class="paragraph">图标"生长之阶"，由<text class="bold">三段渐次升高的圆弧模块</text>构成。</text>
          <text class="paragraph">它是嫩芽，柔软向上，象征生命与希望；</text>
          <text class="paragraph">它是阶梯，层层递进，寓意基于数据的科学生长。</text>
          <text class="paragraph"><text class="bold">科技蓝</text>为基，代表理性与专业；</text>
          <text class="paragraph"><text class="bold">生机绿</text>为顶，代表活力与成长。</text>
          <text class="paragraph">它不说话，但它指向同一个方向——<text class="bold">向上</text>。</text>
        </view>
      </view>

      <!-- 致第一批用户 -->
      <view class="section-card mx-lg letter-card">
        <view class="section-header">
          <text class="section-icon">💚</text>
          <text class="section-title">致第一批用户</text>
        </view>
        <view class="section-body">
          <text class="paragraph">谢谢你，愿意把孩子的生长数据托付给我们。</text>
          <text class="paragraph">这意味着信任，也意味着责任。</text>
          <text class="paragraph">生长研究院现在还很小，功能还不够完美，但我们会像关心自己孩子一样，认真对待每一条数据、每一次测评、每一个"为什么"。</text>
          <text class="paragraph highlight">如果你觉得有用，请分享给一个同样需要的朋友。</text>
          <text class="paragraph">如果你有任何建议，请在「我的-客服中心」告诉我们。</text>
          <text class="paragraph bold" style="margin-top: 20rpx;">让我们一起，陪孩子走过每一次长高。</text>
        </view>
      </view>

      <!-- 底部信息 -->
      <view class="footer-section">
        <text class="footer-brand">生长研究院 · 让生长有迹可循</text>
        <text class="footer-version">v1.0.0 萌芽版 · 2026年2月</text>
        <view class="footer-divider" />
        <text class="footer-disclaimer">本产品所有营养建议均参考《中国居民膳食营养素参考摄入量（2023版）》《儿童骨龄评估临床应用专家共识》等公开文献。本工具为健康管理辅助工具，不提供医疗诊断服务。</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #F8FAFF;
  display: flex;
  flex-direction: column;
}

.content-scroll {
  flex: 1;
  height: calc(100vh - 88rpx);
}

/* 顶部 Hero */
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx 48rpx;
  background: linear-gradient(180deg, #E8F3FF 0%, #F8FAFF 100%);
}

.logo-circle {
  width: 140rpx;
  height: 140rpx;
  border-radius: 70rpx;
  background: linear-gradient(135deg, #4A9EFF 0%, #36D997 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(74, 158, 255, 0.25);
}

.logo-icon {
  font-size: 64rpx;
}

.app-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #1A1A1A;
  margin-top: 24rpx;
  letter-spacing: 2rpx;
}

.version-tag {
  font-size: 24rpx;
  color: #4A9EFF;
  margin-top: 12rpx;
  padding: 6rpx 24rpx;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 20rpx;
}

.slogan {
  font-size: 26rpx;
  color: #666;
  margin-top: 16rpx;
  font-style: italic;
}

/* 内容卡片 */
.section-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 36rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #F0F4FF;
}

.section-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1A1A1A;
}

.section-body {
  display: flex;
  flex-direction: column;
}

.paragraph {
  font-size: 28rpx;
  color: #444;
  line-height: 1.8;
  margin-bottom: 16rpx;
}

.paragraph.highlight {
  color: #4A9EFF;
  font-weight: 600;
  padding: 16rpx 20rpx;
  background: rgba(74, 158, 255, 0.06);
  border-radius: 12rpx;
  border-left: 6rpx solid #4A9EFF;
}

.bold {
  font-weight: 700;
  color: #333;
}

/* 功能区块 */
.feature-block {
  margin-bottom: 28rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #F5F5F5;
}
.feature-block:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.feature-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.feature-item {
  font-size: 26rpx;
  color: #555;
  line-height: 1.8;
  padding-left: 8rpx;
  display: block;
}

/* 致用户信件风格 */
.letter-card {
  background: linear-gradient(135deg, #FAFFFA 0%, #F0FFF4 100%);
  border: 2rpx solid rgba(54, 217, 151, 0.15);
}
.letter-card .section-header {
  border-bottom-color: rgba(54, 217, 151, 0.15);
}

/* 底部 */
.footer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 40rpx 80rpx;
}

.footer-brand {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.footer-version {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.footer-divider {
  width: 120rpx;
  height: 2rpx;
  background: #E0E0E0;
  margin: 28rpx 0;
}

.footer-disclaimer {
  font-size: 22rpx;
  color: #ACACAC;
  line-height: 1.6;
  text-align: center;
  padding: 0 20rpx;
}
</style>
