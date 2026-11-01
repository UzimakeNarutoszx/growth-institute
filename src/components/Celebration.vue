<template>
  <view class="celebration-overlay" v-if="visible" @tap="close">
    <view class="confetti-container">
      <view
        v-for="n in 30"
        :key="n"
        class="confetti-piece"
        :style="confettiStyle(n)"
      />
    </view>
    <view class="celebration-content">
      <text class="celebration-emoji">🎉</text>
      <text class="celebration-title">{{ title }}</text>
      <text class="celebration-desc">{{ desc }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  visible: boolean
  title?: string
  desc?: string
  autoClose?: number
}>(), {
  title: '太棒了！',
  desc: '继续保持，你做得很好！',
  autoClose: 3000
})

const emit = defineEmits(['close'])

watch(() => props.visible, (val) => {
  if (val && props.autoClose > 0) {
    setTimeout(() => {
      emit('close')
    }, props.autoClose)
  }
})

function close() {
  emit('close')
}

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98FB98', '#FF9900', '#4A9EFF', '#36C2AA']

function confettiStyle(n: number) {
  const left = Math.random() * 100
  const delay = Math.random() * 2
  const duration = 2 + Math.random() * 2
  const color = colors[n % colors.length]
  const size = 8 + Math.random() * 12
  const rotation = Math.random() * 360

  return {
    left: left + '%',
    animationDelay: delay + 's',
    animationDuration: duration + 's',
    background: color,
    width: size + 'rpx',
    height: size * (0.5 + Math.random()) + 'rpx',
    transform: `rotate(${rotation}deg)`
  }
}
</script>

<style scoped lang="scss">
.celebration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  top: -20rpx;
  border-radius: 4rpx;
  animation: confettiFall linear forwards;
}

@keyframes confettiFall {
  0% {
    top: -5%;
    opacity: 1;
    transform: translateX(0) rotate(0deg);
  }
  100% {
    top: 105%;
    opacity: 0;
    transform: translateX(100rpx) rotate(720deg);
  }
}

.celebration-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 48rpx 64rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.15);
  z-index: 1;
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.celebration-emoji {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.celebration-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.celebration-desc {
  font-size: 26rpx;
  color: #999999;
  margin-top: 12rpx;
}
</style>
