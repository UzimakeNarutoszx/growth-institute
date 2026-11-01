<template>
  <view class="page-container">
    <NavBar title="成长社区" :showBack="true" />

    <!-- 发布动态入口 -->
    <view class="card publish-card">
      <view class="publish-input-area">
        <view class="publish-avatar">
          <text class="avatar-mini">👤</text>
        </view>
        <textarea
          v-model="newPostContent"
          class="publish-textarea"
          placeholder="分享你的成长经验..."
          :maxlength="500"
          auto-height
          :adjust-position="true"
        />
      </view>
      <view class="publish-footer">
        <text class="char-count">{{ newPostContent.length }}/500</text>
        <view class="publish-btn clickable" :class="{ disabled: !newPostContent.trim() }" @tap="onPublish">
          <text class="publish-btn-text">发布</text>
        </view>
      </view>
    </view>

    <!-- 在线用户 -->
    <view class="online-bar mx-lg mt-sm flex-row">
      <text class="online-text">当前在线：{{ onlineCount }}人</text>
      <scroll-view scroll-x class="online-avatars flex-1">
        <view class="avatars-row">
          <view v-for="n in 8" :key="n" class="online-avatar-mini">
            <text>{{ ['😊','🧒','👧','👦','😄','🤗','😎','🥰'][n-1] }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 动态信息流 -->
    <view class="feed-list">
      <view
        v-for="post in allPosts"
        :key="post.id"
        class="card feed-card"
      >
        <!-- 用户信息 -->
        <view class="feed-header flex-row">
          <view class="feed-avatar">
            <text class="feed-avatar-emoji">{{ post.avatar }}</text>
          </view>
          <view class="feed-user-info flex-1">
            <text class="feed-username">{{ post.username }}</text>
            <text class="feed-time">{{ post.time }}</text>
          </view>
        </view>

        <!-- 内容 -->
        <text class="feed-content">{{ post.content }}</text>

        <!-- 图片（如有） -->
        <view v-if="post.images && post.images.length > 0" class="feed-images" :class="'images-' + Math.min(post.images.length, 3)">
          <view
            v-for="(img, index) in post.images"
            :key="index"
            class="feed-image"
            :style="{ background: img.bg }"
          >
            <text class="img-placeholder">{{ img.icon }}</text>
          </view>
        </view>

        <!-- 互动区 -->
        <view class="feed-actions flex-row">
          <view class="feed-action clickable" @tap="toggleLike(post)">
            <text :class="{ 'liked': post.liked }">{{ post.liked ? '❤️' : '🤍' }}</text>
            <text class="action-count">{{ post.likes }}</text>
          </view>
          <view class="feed-action clickable" @tap="toggleCollectPost(post)">
            <text>{{ post.collected ? '⭐' : '☆' }}</text>
            <text class="action-count">收藏</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 精华内容 -->
    <SectionTitle title="精华推荐" :marginTop="24" />
    <view class="featured-list">
      <view
        v-for="item in featuredContent"
        :key="item.id"
        class="card featured-card flex-row clickable"
        @tap="onFeaturedTap(item)"
      >
        <image class="featured-cover-img" :src="item.image" mode="aspectFill" />
        <view class="featured-info flex-1">
          <text class="featured-title">{{ item.title }}</text>
          <text class="featured-desc">{{ item.desc }}</text>
          <view class="featured-meta flex-row">
            <text class="meta-item">{{ item.likes }} 赞</text>
            <text class="meta-item">{{ item.comments }} 评论</text>
          </view>
        </view>
      </view>
    </view>

    <view style="height: 40rpx;" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import NavBar from '@/components/NavBar.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import { navigateTo } from '@/utils/navigate'

const API_BASE = 'http://localhost:3000'

const onlineCount = ref(248)
const newPostContent = ref('')

// 预置帖子（示例数据）
const defaultPosts = ref([
  {
    id: 'default_1',
    avatar: '😊',
    username: '乐乐妈妈',
    time: '2小时前',
    content: '今天带宝贝去做了骨龄检测，骨龄比实际年龄小半年，医生说生长空间还很大！开心～接下来要继续坚持营养和运动方案 💪',
    images: [
      { bg: 'linear-gradient(135deg, #E8F3FF, #B8D8FF)', icon: '📊' },
      { bg: 'linear-gradient(135deg, #E8F8F5, #B8E8D8)', icon: '📈' }
    ],
    likes: 32,
    comments: 8,
    liked: false,
    collected: false
  },
  {
    id: 'default_2',
    avatar: '🧒',
    username: '跳绳达人爸爸',
    time: '4小时前',
    content: '坚持跳绳第100天！孩子从128cm长到了132cm，四个月长了4cm！分享一下我们的跳绳计划：每天早晚各200个，周末加量到500个。',
    images: [
      { bg: 'linear-gradient(135deg, #FFE8E8, #FFC8C8)', icon: '🏃' },
      { bg: 'linear-gradient(135deg, #FFF3E8, #FFD8B0)', icon: '📏' },
      { bg: 'linear-gradient(135deg, #E8FFE8, #C8F0C8)', icon: '🎉' }
    ],
    likes: 156,
    comments: 42,
    liked: true,
    collected: false
  },
  {
    id: 'default_3',
    avatar: '👧',
    username: '营养达人Lisa',
    time: '昨天',
    content: '整理了一份适合3-12岁孩子的高钙食谱，每日三餐+两次加餐，轻松达到每日800mg钙摄入。需要的宝妈可以收藏哦～',
    images: [
      { bg: 'linear-gradient(135deg, #FFF8E8, #FFE8C0)', icon: '🥗' }
    ],
    likes: 289,
    comments: 67,
    liked: false,
    collected: false
  }
])

// 从后端加载的帖子
const serverPosts = ref<any[]>([])

// 合并：用户发布的帖子在前，预置帖子在后
const allPosts = computed(() => {
  return [...serverPosts.value, ...defaultPosts.value]
})

const featuredContent = ref([
  { id: '1', title: '春季是孩子长高黄金期', desc: '春季儿童平均身高增长是秋季的2-2.5倍，这5件事一定要做', image: '/static/images/text1.png', likes: 2300, comments: 56 },
  { id: '2', title: '这3种运动最有助长高', desc: '跳绳、篮球、游泳，运动后生长激素分泌增加3-5倍', image: '/static/images/text2.png', likes: 1800, comments: 42 },
  { id: '3', title: '钙片怎么吃最有效？', desc: '分次服用、搭配维生素D，科学补钙让孩子骨骼更强壮', image: '/static/images/text3.png', likes: 3100, comments: 98 }
])

onShow(() => {
  loadPosts()
})

function loadPosts() {
  uni.request({
    url: `${API_BASE}/api/community/list`,
    method: 'GET',
    success: (res: any) => {
      if (res.data.code === 0 && res.data.data) {
        serverPosts.value = res.data.data.map((p: any) => ({
          ...p,
          images: [],
          liked: false,
          collected: false
        }))
      }
    }
  })
}

function onPublish() {
  const content = newPostContent.value.trim()
  if (!content) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }

  const token = uni.getStorageSync('auth_token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  uni.request({
    url: `${API_BASE}/api/community/publish`,
    method: 'POST',
    header: { 'x-token': token },
    data: { content },
    success: (res: any) => {
      if (res.data.code === 0) {
        uni.showToast({ title: '发布成功', icon: 'success' })
        newPostContent.value = ''
        // 重新加载帖子列表
        loadPosts()
      } else {
        uni.showToast({ title: res.data.message || '发布失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.showToast({ title: '网络错误', icon: 'none' })
    }
  })
}

function toggleLike(post: any) {
  post.liked = !post.liked
  post.likes += post.liked ? 1 : -1
}

function toggleCollectPost(post: any) {
  const token = uni.getStorageSync('auth_token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  const articleId = `community_${post.id}`
  if (post.collected) {
    uni.request({
      url: `${API_BASE}/api/favorites/remove`,
      method: 'POST',
      header: { 'x-token': token },
      data: { article_id: articleId },
      success: () => {
        post.collected = false
        uni.showToast({ title: '已取消收藏', icon: 'none' })
      }
    })
  } else {
    const title = post.content.length > 30 ? post.content.substring(0, 30) + '...' : post.content
    uni.request({
      url: `${API_BASE}/api/favorites/add`,
      method: 'POST',
      header: { 'x-token': token },
      data: {
        article_id: articleId,
        title: title,
        image: '',
        source: 'community'
      },
      success: (res: any) => {
        if (res.data.code === 0 || res.data.code === -2) {
          post.collected = true
          uni.showToast({ title: '已收藏', icon: 'success' })
        }
      }
    })
  }
}

function onFeaturedTap(item: any) {
  navigateTo('/pages/articlePage/index', { id: item.id })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #F8FAFF;
  padding-bottom: 20rpx;
}

/* 发布入口 */
.publish-card {
  margin-top: 16rpx;
}

.publish-input-area {
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
}

.publish-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  background: #E8F3FF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-mini {
  font-size: 32rpx;
}

.publish-textarea {
  flex: 1;
  min-height: 100rpx;
  max-height: 300rpx;
  font-size: 28rpx;
  color: #333;
  padding: 12rpx 20rpx;
  background: #F8FAFF;
  border-radius: 16rpx;
  border: 2rpx solid #E8F0FF;
  line-height: 1.6;
}

.publish-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #F0F0F0;
}

.char-count {
  font-size: 24rpx;
  color: #BBBBBB;
}

.publish-btn {
  background: linear-gradient(135deg, #4A9EFF, #36C2AA);
  border-radius: 32rpx;
  padding: 12rpx 48rpx;
}

.publish-btn.disabled {
  opacity: 0.5;
}

.publish-btn-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 在线状态 */
.online-bar {
  gap: 12rpx;
}

.online-text {
  font-size: 24rpx;
  color: #36C2AA;
  white-space: nowrap;
}

.online-avatars {
  white-space: nowrap;
}

.avatars-row {
  display: flex;
  gap: 4rpx;
}

.online-avatar-mini {
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
  background: #E8F3FF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
}

/* 动态流 */
.feed-card {
  margin-top: 16rpx;
}

.feed-header {
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.feed-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 36rpx;
  background: #E8F3FF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feed-avatar-emoji {
  font-size: 36rpx;
}

.feed-username {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  display: block;
}

.feed-time {
  font-size: 22rpx;
  color: #999999;
  margin-top: 4rpx;
  display: block;
}

.feed-content {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.7;
  display: block;
}

/* 图片网格 */
.feed-images {
  display: grid;
  gap: 8rpx;
  margin-top: 16rpx;
  border-radius: 8rpx;
  overflow: hidden;
}

.images-1 { grid-template-columns: 1fr; }
.images-2 { grid-template-columns: 1fr 1fr; }
.images-3 { grid-template-columns: 1fr 1fr 1fr; }

.feed-image {
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
}

.img-placeholder {
  font-size: 48rpx;
}

/* 互动区 */
.feed-actions {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #F5F5F5;
  justify-content: space-around;
}

.feed-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
}

.action-count {
  font-size: 24rpx;
  color: #999999;
}

.liked {
  animation: heartBeat 0.3s ease;
}

@keyframes heartBeat {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* 精华内容 */
.featured-card {
  gap: 16rpx;
  padding: 20rpx 24rpx;
}

.featured-cover-img {
  width: 140rpx;
  height: 120rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.featured-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  display: block;
}

.featured-desc {
  font-size: 24rpx;
  color: #999999;
  margin-top: 6rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.featured-meta {
  margin-top: 8rpx;
  gap: 16rpx;
}

.meta-item {
  font-size: 22rpx;
  color: #CCCCCC;
}
</style>
