<template>
  <view class="page-container">
    <NavBar title="个人信息" />

    <view class="form-wrap mx-lg">
      <!-- 家长信息 -->
      <view class="section-title">
        <text class="section-title-text">家长信息</text>
      </view>
      <view class="form-card">
        <view class="form-item">
          <text class="form-label">昵称</text>
          <input class="form-input" v-model="form.nickname" placeholder="请输入昵称" placeholder-class="placeholder" />
        </view>
        <view class="form-item">
          <text class="form-label">手机号</text>
          <text class="form-value-readonly">{{ userStore.phone }}</text>
        </view>
      </view>

      <!-- 孩子信息 -->
      <view class="section-title">
        <text class="section-title-text">孩子信息</text>
      </view>
      <view class="form-card">
        <view class="form-item">
          <text class="form-label">姓名</text>
          <input class="form-input" v-model="form.childName" placeholder="请输入孩子姓名" placeholder-class="placeholder" />
        </view>
        <view class="form-item">
          <text class="form-label">性别</text>
          <view class="gender-group">
            <view class="gender-btn clickable" :class="{ 'gender-active': form.childGender === 'male' }" @tap="form.childGender = 'male'">
              <text class="gender-text">男</text>
            </view>
            <view class="gender-btn clickable" :class="{ 'gender-active': form.childGender === 'female' }" @tap="form.childGender = 'female'">
              <text class="gender-text">女</text>
            </view>
          </view>
        </view>
        <view class="form-item">
          <text class="form-label">出生日期</text>
          <picker mode="date" :value="form.childBirthday" @change="onBirthdayChange">
            <text :class="form.childBirthday ? 'form-value' : 'form-placeholder'">{{ form.childBirthday || '请选择出生日期' }}</text>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">身高 (cm)</text>
          <input class="form-input" v-model="form.childHeight" type="digit" placeholder="请输入身高" placeholder-class="placeholder" />
        </view>
        <view class="form-item">
          <text class="form-label">体重 (kg)</text>
          <input class="form-input" v-model="form.childWeight" type="digit" placeholder="请输入体重" placeholder-class="placeholder" />
        </view>
      </view>

      <!-- 父母身高 -->
      <view class="section-title">
        <text class="section-title-text">父母信息（用于遗传身高预测）</text>
      </view>
      <view class="form-card">
        <view class="form-item">
          <text class="form-label">父亲身高 (cm)</text>
          <input class="form-input" v-model="form.fatherHeight" type="digit" placeholder="请输入父亲身高" placeholder-class="placeholder" />
        </view>
        <view class="form-item">
          <text class="form-label">母亲身高 (cm)</text>
          <input class="form-input" v-model="form.motherHeight" type="digit" placeholder="请输入母亲身高" placeholder-class="placeholder" />
        </view>
        <view class="form-item">
          <text class="form-label">过敏情况</text>
          <input class="form-input" v-model="form.allergies" placeholder="如：无、牛奶、花生等" placeholder-class="placeholder" />
        </view>
      </view>

      <!-- 保存按钮 -->
      <view class="save-btn clickable" :class="{ 'save-btn-disabled': saving }" @tap="onSave">
        <text class="save-btn-text">{{ saving ? '保存中...' : '保存信息' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const API_BASE = 'http://localhost:3000'
const saving = ref(false)

const form = ref({
  nickname: '',
  childName: '',
  childGender: 'male' as 'male' | 'female',
  childBirthday: '',
  childHeight: '',
  childWeight: '',
  fatherHeight: '',
  motherHeight: '',
  allergies: ''
})

onMounted(() => {
  // 从 store 加载已有数据
  form.value.nickname = userStore.nickname || ''
  form.value.childName = userStore.childName || ''
  form.value.childGender = userStore.childGender || 'male'
  form.value.childHeight = userStore.childHeight ? String(userStore.childHeight) : ''
  form.value.childWeight = userStore.childWeight ? String(userStore.childWeight) : ''
})

function onBirthdayChange(e: any) {
  form.value.childBirthday = e.detail.value
}

async function onSave() {
  if (saving.value) return
  saving.value = true

  const token = uni.getStorageSync('auth_token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    saving.value = false
    return
  }

  // 更新本地 store
  userStore.nickname = form.value.nickname
  userStore.childName = form.value.childName
  userStore.childGender = form.value.childGender
  userStore.childHeight = Number(form.value.childHeight) || 0
  userStore.childWeight = Number(form.value.childWeight) || 0

  // 保存到后端
  uni.request({
    url: `${API_BASE}/api/auth/update-profile`,
    method: 'POST',
    header: { 'x-token': token },
    data: {
      nickname: form.value.nickname,
      child_name: form.value.childName,
      child_gender: form.value.childGender,
      child_birthday: form.value.childBirthday,
      child_height: Number(form.value.childHeight) || 0,
      child_weight: Number(form.value.childWeight) || 0,
      father_height: Number(form.value.fatherHeight) || 0,
      mother_height: Number(form.value.motherHeight) || 0,
      allergies: form.value.allergies || '无'
    },
    success: (res: any) => {
      saving.value = false
      if (res.data.code === 0) {
        uni.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 1500)
      } else {
        uni.showToast({ title: res.data.message || '保存失败', icon: 'none' })
      }
    },
    fail: () => {
      saving.value = false
      uni.showToast({ title: '网络错误', icon: 'none' })
    }
  })
}
</script>

<style scoped lang="scss">
.page-container { min-height: 100vh; background: #F8FAFF; }

.form-wrap { padding-top: 24rpx; padding-bottom: 60rpx; }

.section-title { margin-bottom: 16rpx; margin-top: 32rpx; }
.section-title:first-child { margin-top: 0; }
.section-title-text { font-size: 28rpx; font-weight: 600; color: #333; }

.form-card {
  background: #fff; border-radius: 20rpx; padding: 0 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.form-item {
  display: flex; align-items: center; justify-content: space-between;
  min-height: 96rpx; border-bottom: 1rpx solid #f5f5f5;
}
.form-item:last-child { border-bottom: none; }

.form-label { font-size: 28rpx; color: #333; flex-shrink: 0; width: 200rpx; }

.form-input {
  flex: 1; text-align: right; font-size: 28rpx; color: #333; height: 96rpx;
}
.placeholder { color: #ccc; }

.form-value { font-size: 28rpx; color: #333; }
.form-value-readonly { font-size: 28rpx; color: #999; }
.form-placeholder { font-size: 28rpx; color: #ccc; }

.gender-group { display: flex; gap: 16rpx; }
.gender-btn {
  padding: 8rpx 32rpx; border-radius: 24rpx;
  border: 2rpx solid #ddd; background: #fff;
}
.gender-active { border-color: #4A9EFF; background: #F0F8FF; }
.gender-text { font-size: 26rpx; color: #333; }
.gender-active .gender-text { color: #4A9EFF; font-weight: 600; }

.save-btn {
  margin-top: 48rpx; background: linear-gradient(135deg, #4A9EFF, #36C2AA);
  border-radius: 48rpx; height: 96rpx;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(74,158,255,0.3);
}
.save-btn-disabled { background: #ccc; box-shadow: none; }
.save-btn-text { font-size: 32rpx; color: #fff; font-weight: 600; }
</style>
