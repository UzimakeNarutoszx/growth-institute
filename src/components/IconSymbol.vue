<template>
  <view class="icon-symbol" :style="iconStyle">
    <text>{{ icon }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  icon: string
  size?: number
  color?: string
  bgColor?: string
}>(), {
  size: 80,
  color: '#4A9EFF',
  bgColor: '#F0F8FF'
})

const iconStyle = computed(() => ({
  width: props.size + 'rpx',
  height: props.size + 'rpx',
  fontSize: (props.size * 0.5) + 'rpx',
  background: props.bgColor,
  borderRadius: (props.size * 0.25) + 'rpx'
}))
</script>

<style scoped lang="scss">
.icon-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
