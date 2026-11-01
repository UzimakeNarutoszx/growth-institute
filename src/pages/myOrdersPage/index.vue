<template>
  <view class="page-container">
    <NavBar title="我的订单" />

    <view class="empty-wrap">
      <text class="empty-icon">📦</text>
      <text class="empty-text">暂无订单</text>
      <text class="empty-desc">您还没有任何订单记录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
</script>

<style scoped lang="scss">
.page-container { min-height: 100vh; background: #F8FAFF; }
.empty-wrap {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding-top: 200rpx;
}
.empty-icon { font-size: 100rpx; margin-bottom: 24rpx; }
.empty-text { font-size: 32rpx; color: #333; font-weight: 600; }
.empty-desc { font-size: 26rpx; color: #999; margin-top: 12rpx; }
</style>
