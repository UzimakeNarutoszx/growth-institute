<template>
  <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="navbar-inner">
      <view class="navbar-left" v-if="showBack" @tap="handleBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="navbar-left" v-else>
        <slot name="left" />
      </view>
      <view class="navbar-center">
        <text class="navbar-title-text">{{ title }}</text>
      </view>
      <view class="navbar-right-slot">
        <slot name="right" />
      </view>
    </view>
  </view>
  <!-- 占位 -->
  <view :style="{ height: (statusBarHeight + 44) + 'px' }" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  showBack?: boolean
}>(), {
  title: '',
  showBack: true
})

const statusBarHeight = ref(0)

// #ifdef MP-WEIXIN || APP-PLUS
const sysInfo = uni.getSystemInfoSync()
statusBarHeight.value = sysInfo.statusBarHeight || 20
// #endif
// #ifdef H5
statusBarHeight.value = 0
// #endif

function handleBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    // 没有上一页时，回到首页
    uni.switchTab({ url: '/pages/homePage/index' })
  }
}
</script>

<style scoped lang="scss">
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #FFFFFF;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  position: relative;
  padding: 0 32rpx;
}

.navbar-left {
  position: absolute;
  left: 32rpx;
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 44rpx;
  color: #333333;
  font-weight: bold;
  padding: 0 10rpx;
}

.navbar-center {
  display: flex;
  align-items: center;
}

.navbar-title-text {
  font-size: 34rpx;
  font-weight: 500;
  color: #333333;
}

.navbar-right-slot {
  position: absolute;
  right: 32rpx;
  display: flex;
  align-items: center;
}
</style>
