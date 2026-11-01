<template>
  <view class="progress-ring" :style="ringContainerStyle">
    <view class="ring-bg" :style="ringBgStyle" />
    <view class="ring-fill" :style="ringFillStyle" />
    <view class="ring-inner" :style="ringInnerStyle">
      <slot>
        <text class="ring-value" :style="{ fontSize: (size * 0.3) + 'rpx', color: primaryColor }">{{ value }}</text>
        <text class="ring-label" :style="{ fontSize: (size * 0.15) + 'rpx' }">{{ label }}</text>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value: number | string
  total?: number
  label?: string
  size?: number
  thickness?: number
  primaryColor?: string
  secondaryColor?: string
  bgColor?: string
}>(), {
  total: 100,
  label: '',
  size: 200,
  thickness: 20,
  primaryColor: '#4A9EFF',
  secondaryColor: '#36C2AA',
  bgColor: '#E8F3FF'
})

const percent = computed(() => {
  const num = typeof props.value === 'string' ? parseFloat(props.value) : props.value
  return Math.min(100, Math.max(0, (num / props.total) * 100))
})

const deg = computed(() => (percent.value / 100) * 360)

const ringContainerStyle = computed(() => ({
  width: props.size + 'rpx',
  height: props.size + 'rpx'
}))

const ringBgStyle = computed(() => ({
  width: props.size + 'rpx',
  height: props.size + 'rpx',
  borderRadius: (props.size / 2) + 'rpx',
  background: props.bgColor
}))

const ringFillStyle = computed(() => ({
  width: props.size + 'rpx',
  height: props.size + 'rpx',
  borderRadius: (props.size / 2) + 'rpx',
  background: `conic-gradient(${props.secondaryColor} 0deg, ${props.primaryColor} ${deg.value}deg, transparent ${deg.value}deg)`
}))

const ringInnerStyle = computed(() => {
  const innerSize = props.size - props.thickness * 2
  return {
    width: innerSize + 'rpx',
    height: innerSize + 'rpx',
    borderRadius: (innerSize / 2) + 'rpx'
  }
})
</script>

<style scoped lang="scss">
.progress-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-bg {
  position: absolute;
}

.ring-fill {
  position: absolute;
  transition: background 0.5s ease;
}

.ring-inner {
  position: relative;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.ring-value {
  font-weight: 700;
}

.ring-label {
  color: #999999;
  margin-top: 4rpx;
}
</style>
