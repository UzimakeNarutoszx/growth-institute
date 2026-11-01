<template>
  <view class="page-container">
    <NavBar title="收藏文章" />

    <view v-if="loading" class="loading-wrap">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="favorites.length === 0" class="empty-wrap">
      <text class="empty-icon">⭐</text>
      <text class="empty-text">暂无收藏</text>
      <text class="empty-desc">在文章或社区帖子中点击收藏，即可在这里查看</text>
    </view>

    <view v-else class="list-wrap mx-lg">
      <view
        v-for="(item, index) in favorites"
        :key="index"
        class="fav-card clickable"
        @tap="goArticle(item)"
      >
        <image v-if="item.image" class="fav-cover" :src="item.image" mode="aspectFill" />
        <view class="fav-info">
          <text class="fav-title">{{ item.title }}</text>
          <view class="fav-meta">
            <text class="fav-source">{{ item.source === 'community' ? '社区' : '文章' }}</text>
            <text class="fav-date">{{ item.created_at }}</text>
          </view>
        </view>
        <view class="fav-remove clickable" @tap.stop="removeFavorite(item, index)">
          <text class="fav-remove-text">取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'

const API_BASE = 'http://localhost:3000'
const loading = ref(true)
const favorites = ref<any[]>([])

onMounted(() => {
  loadFavorites()
})

function loadFavorites() {
  const token = uni.getStorageSync('auth_token')
  if (!token) { loading.value = false; return }
  uni.request({
    url: `${API_BASE}/api/favorites/list`,
    method: 'GET',
    header: { 'x-token': token },
    success: (res: any) => {
      if (res.data.code === 0) {
        favorites.value = res.data.data || []
      }
      loading.value = false
    },
    fail: () => { loading.value = false }
  })
}

function goArticle(item: any) {
  uni.navigateTo({ url: `/pages/articlePage/index?id=${item.article_id}` })
}

function removeFavorite(item: any, index: number) {
  const token = uni.getStorageSync('auth_token')
  uni.request({
    url: `${API_BASE}/api/favorites/remove`,
    method: 'POST',
    header: { 'x-token': token },
    data: { article_id: item.article_id },
    success: () => {
      favorites.value.splice(index, 1)
      uni.showToast({ title: '已取消收藏', icon: 'none' })
    }
  })
}
</script>

<style scoped lang="scss">
.page-container { min-height: 100vh; background: #F8FAFF; }

.loading-wrap, .empty-wrap {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding-top: 200rpx;
}
.loading-text { font-size: 28rpx; color: #999; }
.empty-icon { font-size: 100rpx; margin-bottom: 24rpx; }
.empty-text { font-size: 32rpx; color: #333; font-weight: 600; }
.empty-desc { font-size: 26rpx; color: #999; margin-top: 12rpx; text-align: center; padding: 0 60rpx; }

.list-wrap { padding-top: 24rpx; padding-bottom: 40rpx; }

.fav-card {
  display: flex; align-items: center; background: #fff;
  border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.fav-cover {
  width: 120rpx; height: 90rpx; border-radius: 12rpx;
  flex-shrink: 0; margin-right: 20rpx;
}
.fav-info { flex: 1; }
.fav-title { font-size: 28rpx; color: #333; font-weight: 500; display: block;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fav-meta { display: flex; gap: 16rpx; margin-top: 8rpx; }
.fav-source { font-size: 22rpx; color: #4A9EFF; background: #F0F8FF;
  padding: 2rpx 12rpx; border-radius: 8rpx; }
.fav-date { font-size: 22rpx; color: #999; }
.fav-remove {
  flex-shrink: 0; padding: 12rpx 20rpx; margin-left: 12rpx;
}
.fav-remove-text { font-size: 24rpx; color: #FF4444; }
</style>
