<template>
  <view class="page-container">
    <NavBar title="登录" />

    <view class="login-wrap">
      <!-- Logo -->
      <view class="logo-section">
        <view class="logo-circle">
          <text class="logo-emoji">🌱</text>
        </view>
        <text class="logo-title">生长研究院</text>
        <text class="logo-desc">科学守护孩子每一厘米成长</text>
      </view>

      <!-- 模式切换 -->
      <view class="mode-tabs mx-lg">
        <view
          class="mode-tab clickable"
          :class="{ 'mode-tab-active': mode === 'login' }"
          @tap="mode = 'login'"
        >
          <text class="mode-tab-text" :class="{ 'mode-tab-text-active': mode === 'login' }">登录</text>
        </view>
        <view
          class="mode-tab clickable"
          :class="{ 'mode-tab-active': mode === 'register' }"
          @tap="mode = 'register'"
        >
          <text class="mode-tab-text" :class="{ 'mode-tab-text-active': mode === 'register' }">注册</text>
        </view>
      </view>

      <!-- 表单区 -->
      <view class="form-section mx-lg">
        <!-- 手机号 -->
        <view class="input-group">
          <text class="input-label">手机号</text>
          <view class="input-row">
            <text class="area-code">+86</text>
            <view class="input-divider" />
            <input
              class="form-input"
              v-model="phone"
              type="number"
              maxlength="11"
              placeholder="请输入手机号"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <!-- 密码 -->
        <view class="input-group">
          <text class="input-label">密码</text>
          <view class="input-row">
            <input
              class="form-input flex-1"
              v-model="password"
              :password="!showPassword"
              maxlength="20"
              :placeholder="mode === 'register' ? '请设置密码（至少6位）' : '请输入密码'"
              placeholder-class="input-placeholder"
            />
            <view class="eye-btn clickable" @tap="showPassword = !showPassword">
              <text class="eye-icon">{{ showPassword ? '👁️' : '🔒' }}</text>
            </view>
          </view>
        </view>

        <!-- 确认密码（仅注册） -->
        <view class="input-group" v-if="mode === 'register'">
          <text class="input-label">确认密码</text>
          <view class="input-row">
            <input
              class="form-input flex-1"
              v-model="confirmPassword"
              :password="!showPassword"
              maxlength="20"
              placeholder="请再次输入密码"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <!-- 提交按钮 -->
        <view
          class="submit-btn clickable"
          :class="{ 'submit-btn-disabled': !canSubmit || loading }"
          @tap="onSubmit"
        >
          <text class="submit-btn-text">{{ loading ? '请稍候...' : (mode === 'login' ? '登录' : '注册') }}</text>
        </view>

        <!-- 协议 -->
        <view class="agreement">
          <view class="agree-check clickable" :class="{ checked: agreed }" @tap="agreed = !agreed">
            <text v-if="agreed" class="agree-check-mark">✓</text>
          </view>
          <text class="agree-text">我已阅读并同意</text>
          <text class="agree-link" @tap="onAgreement('service')">《用户协议》</text>
          <text class="agree-text">和</text>
          <text class="agree-link" @tap="onAgreement('privacy')">《隐私政策》</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { useUserStore, useAssessmentStore, useGrowthStore } from '@/store'

const userStore = useUserStore()
const assessmentStore = useAssessmentStore()
const growthStore = useGrowthStore()

const mode = ref<'login' | 'register'>('login')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreed = ref(false)
const showPassword = ref(false)
const loading = ref(false)

const canSubmit = computed(() => {
  const base = phone.value.length === 11 && password.value.length >= 6 && agreed.value
  if (mode.value === 'register') {
    return base && confirmPassword.value.length >= 6
  }
  return base
})

async function onSubmit() {
  if (!canSubmit.value || loading.value) {
    if (!agreed.value) {
      uni.showToast({ title: '请先同意用户协议', icon: 'none' })
      return
    }
    if (phone.value.length !== 11) {
      uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    if (password.value.length < 6) {
      uni.showToast({ title: '密码至少6位', icon: 'none' })
      return
    }
    return
  }

  // 注册模式：密码一致性校验
  if (mode.value === 'register' && password.value !== confirmPassword.value) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }

  loading.value = true

  try {
    let result: { code: number; message: string; data?: any }

    if (mode.value === 'register') {
      result = await userStore.register(phone.value, password.value)
    } else {
      result = await userStore.login(phone.value, password.value)
    }

    if (result.code === 0) {
      // 登录/注册成功后加载用户历史数据
      assessmentStore.loadHistory()
      growthStore.loadRecords()
      uni.showToast({ title: mode.value === 'register' ? '注册成功' : '登录成功', icon: 'success' })
      setTimeout(() => {
        const pages = getCurrentPages()
        if (pages.length > 1) {
          uni.navigateBack()
        } else {
          uni.switchTab({ url: '/pages/homePage/index' })
        }
      }, 1500)
    } else if (result.code === -2 && mode.value === 'register') {
      // 手机号已注册，自动切换到登录
      uni.showToast({ title: result.message, icon: 'none' })
      mode.value = 'login'
    } else {
      uni.showToast({ title: result.message, icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '请求失败，请稍后重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function onAgreement(type: string) {
  uni.showToast({ title: `${type === 'service' ? '用户协议' : '隐私政策'}开发中...`, icon: 'none' })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #F8FAFF;
}

.login-wrap {
  padding-top: 40rpx;
}

/* Logo区域 */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0 40rpx;
}

.logo-circle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  background: linear-gradient(135deg, #E8F3FF, #D4ECFF);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(74, 158, 255, 0.15);
}

.logo-emoji {
  font-size: 80rpx;
}

.logo-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #333333;
  margin-top: 24rpx;
}

.logo-desc {
  font-size: 26rpx;
  color: #999999;
  margin-top: 12rpx;
}

/* 模式切换 */
.mode-tabs {
  display: flex;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.mode-tab {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  transition: all 0.3s;
}

.mode-tab-active {
  background: linear-gradient(135deg, #4A9EFF, #36C2AA);
  box-shadow: 0 4rpx 12rpx rgba(74, 158, 255, 0.3);
}

.mode-tab-text {
  font-size: 30rpx;
  color: #999999;
  font-weight: 500;
}

.mode-tab-text-active {
  color: #FFFFFF;
  font-weight: 600;
}

/* 表单区 */
.form-section {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(74, 158, 255, 0.08);
}

.input-group {
  margin-bottom: 32rpx;
}

.input-label {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 16rpx;
  display: block;
}

.input-row {
  display: flex;
  align-items: center;
  background: #F5F7FA;
  border-radius: 16rpx;
  padding: 0 24rpx;
  height: 96rpx;
}

.area-code {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
  flex-shrink: 0;
}

.input-divider {
  width: 2rpx;
  height: 36rpx;
  background: #DDDDDD;
  margin: 0 20rpx;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  height: 96rpx;
  font-size: 30rpx;
  color: #333333;
}

.input-placeholder {
  color: #CCCCCC;
}

/* 密码可见切换 */
.eye-btn {
  flex-shrink: 0;
  padding: 12rpx;
  margin-left: 8rpx;
}

.eye-icon {
  font-size: 36rpx;
}

/* 登录按钮 */
.submit-btn {
  background: linear-gradient(135deg, #4A9EFF, #36C2AA);
  border-radius: 48rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(74, 158, 255, 0.3);
}

.submit-btn-disabled {
  background: #CCCCCC;
  box-shadow: none;
}

.submit-btn-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
  letter-spacing: 4rpx;
}

/* 协议 */
.agreement {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
  flex-wrap: wrap;
}

.agree-check {
  width: 32rpx;
  height: 32rpx;
  border-radius: 8rpx;
  border: 2rpx solid #CCCCCC;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8rpx;
}

.agree-check.checked {
  background: #4A9EFF;
  border-color: #4A9EFF;
}

.agree-check-mark {
  color: #FFFFFF;
  font-size: 20rpx;
  font-weight: bold;
}

.agree-text {
  font-size: 22rpx;
  color: #999999;
}

.agree-link {
  font-size: 22rpx;
  color: #4A9EFF;
}
</style>
