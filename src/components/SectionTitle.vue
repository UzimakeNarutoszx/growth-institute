<template>
  <view class="section-title" :style="{ margin: `${marginTop}rpx 32rpx ${marginBottom}rpx` }">
    <view class="title-bar" />
    <text class="title-text">{{ title }}</text>
    <view class="flex-1" />
    <text v-if="more" class="more-text" @tap="$emit('more')">{{ moreText }} ›</text>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  more?: boolean
  moreText?: string
  marginTop?: number
  marginBottom?: number
}>(), {
  more: false,
  moreText: '查看更多',
  marginTop: 32,
  marginBottom: 16
})

defineEmits(['more'])
</script>

<style scoped lang="scss">
.section-title {
  display: flex;
  align-items: center;
}

.title-bar {
  width: 6rpx;
  height: 32rpx;
  background: linear-gradient(180deg, #4A9EFF, #36C2AA);
  border-radius: 3rpx;
  margin-right: 12rpx;
}

.title-text {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
}

.flex-1 {
  flex: 1;
}

.more-text {
  font-size: 24rpx;
  color: #999999;
}
</style>
