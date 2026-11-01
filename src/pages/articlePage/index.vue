<template>
  <view class="page-container">
    <NavBar :title="article.title || '文章详情'" :showBack="true">
      <template #right>
        <view class="flex-row" style="gap: 24rpx;">
          <view class="clickable" @tap="onShare">
            <text style="font-size: 36rpx;">📤</text>
          </view>
          <view class="clickable" @tap="toggleCollect">
            <text style="font-size: 36rpx;">{{ collected ? '⭐' : '☆' }}</text>
          </view>
        </view>
      </template>
    </NavBar>

    <scroll-view scroll-y class="article-scroll">
      <!-- 文章封面 -->
      <image class="article-cover-img" :src="article.image" mode="aspectFill" />

      <!-- 文章头部 -->
      <view class="article-header px-lg">
        <text class="article-title-text">{{ article.title }}</text>
        <view class="article-meta flex-row mt-sm">
          <text class="meta-author">{{ article.author }}</text>
          <text class="meta-dot">·</text>
          <text class="meta-time">{{ article.time }}</text>
          <text class="meta-dot">·</text>
          <text class="meta-views">{{ article.views }} 阅读</text>
        </view>
        <view class="article-tags flex-row mt-sm">
          <text v-for="tag in article.tags" :key="tag" class="article-tag">{{ tag }}</text>
        </view>
      </view>

      <view class="divider mx-lg" />

      <!-- 文章内容 -->
      <view class="article-body px-lg">
        <view v-for="(section, index) in article.sections" :key="index" class="content-section">
          <text v-if="section.type === 'heading'" class="section-heading">{{ section.text }}</text>
          <text v-else-if="section.type === 'paragraph'" class="section-paragraph">{{ section.text }}</text>
          <view v-else-if="section.type === 'highlight'" class="section-highlight">
            <text class="highlight-icon">💡</text>
            <text class="highlight-text">{{ section.text }}</text>
          </view>
          <view v-else-if="section.type === 'real-image'" class="section-real-image">
            <image class="section-img" :src="section.src" mode="aspectFill" />
            <text class="image-caption">{{ section.caption }}</text>
          </view>
          <view v-else-if="section.type === 'image'" class="section-image" :style="{ background: section.bg }">
            <text class="image-placeholder">{{ section.icon }}</text>
            <text class="image-caption">{{ section.caption }}</text>
          </view>
          <view v-else-if="section.type === 'list'" class="section-list">
            <view v-for="(item, i) in section.items" :key="i" class="list-item">
              <text class="list-bullet">{{ i + 1 }}.</text>
              <text class="list-text">{{ item }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 作者信息 -->
      <view class="card author-card mx-lg mt-lg">
        <view class="flex-row">
          <view class="author-avatar">
            <text>👨‍⚕️</text>
          </view>
          <view class="author-info flex-1">
            <text class="author-name">{{ article.author }}</text>
            <text class="author-desc">{{ article.authorDesc }}</text>
          </view>
          <view class="btn-follow" @tap="onFollow">
            <text>+ 关注</text>
          </view>
        </view>
      </view>

      <!-- 相关推荐 -->
      <SectionTitle title="相关推荐" :marginTop="32" />
      <view
        v-for="rec in relatedArticles"
        :key="rec.id"
        class="card related-item flex-row mx-lg clickable"
        @tap="onRelatedTap(rec)"
      >
        <image class="related-cover-img" :src="rec.image" mode="aspectFill" />
        <view class="related-info flex-1">
          <text class="related-title">{{ rec.title }}</text>
          <text class="related-meta">{{ rec.views }} 阅读</text>
        </view>
      </view>

      <!-- 底部互动 -->
      <view class="bottom-interact px-lg mt-lg safe-bottom">
        <view class="interact-row flex-row">
          <view class="interact-item clickable" @tap="toggleLike">
            <text>{{ liked ? '❤️' : '🤍' }}</text>
            <text class="interact-count">{{ article.likes + (liked ? 1 : 0) }}</text>
          </view>
          <view class="interact-item clickable">
            <text>💬</text>
            <text class="interact-count">{{ article.comments }}</text>
          </view>
          <view class="interact-item clickable" @tap="onShare">
            <text>📤</text>
            <text class="interact-count">分享</text>
          </view>
        </view>
      </view>

      <view style="height: 40rpx;" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavBar from '@/components/NavBar.vue'
import SectionTitle from '@/components/SectionTitle.vue'

const API_BASE = 'http://localhost:3000'
const liked = ref(false)
const collected = ref(false)

// 文章数据库
const articlesDB: Record<string, any> = {
  '1': {
    id: '1',
    title: '春季是孩子长高的黄金期，这5件事一定要做',
    author: '示例医生',
    authorDesc: '界面示例，不对应真实专家或机构背书',
    time: '2025-02-10',
    views: '2.3万',
    likes: 328,
    comments: 56,
    image: '/static/images/text1.png',
    tags: ['春季长高', '营养建议', '运动指导'],
    sections: [
      { type: 'paragraph', text: '春季（3-5月）是一年中孩子生长最快的季节，世界卫生组织的研究表明，春季儿童的平均身高增长是秋季的2-2.5倍。抓住这个黄金期，可以让孩子的身高增长事半功倍。' },
      { type: 'heading', text: '一、保证充足优质的营养' },
      { type: 'paragraph', text: '春季长高的基础是充足的营养供给。孩子的骨骼发育需要大量的蛋白质、钙、锌、维生素D等关键营养素。' },
      { type: 'list', items: [
        '每天保证500ml牛奶或等量奶制品，提供约500mg钙',
        '优质蛋白质来源：鸡蛋、鱼虾、瘦肉、豆制品',
        '深色蔬菜每天至少200g，补充维生素和矿物质',
        '每天补充维生素D 400-800IU，促进钙吸收'
      ] },
      { type: 'highlight', text: '重要提示：不要盲目给孩子大量进补，均衡营养比单一补充更重要。过度补钙反而可能导致骨骺提前闭合。' },
      { type: 'heading', text: '二、坚持科学运动' },
      { type: 'paragraph', text: '运动能刺激生长激素分泌，促进骨骼生长。研究表明，运动后30分钟内生长激素分泌量可增加3-5倍。' },
      { type: 'list', items: [
        '跳绳：最推荐的长高运动，每天300-500个',
        '篮球、排球等跳跃类运动，每次30分钟以上',
        '游泳：全身伸展运动，有助于脊柱拉伸',
        '拉伸操：睡前10分钟拉伸，放松肌肉'
      ] },
      { type: 'real-image', src: '/static/images/text2.png', caption: '图：推荐长高运动示意' },
      { type: 'heading', text: '三、保证充足睡眠' },
      { type: 'paragraph', text: '生长激素在深睡眠时分泌最旺盛，晚上22:00-凌晨2:00是分泌高峰期。建议孩子在21:30前上床，22:00前进入深睡眠状态。' },
      { type: 'highlight', text: '建议：学龄前儿童每天睡眠10-13小时，学龄儿童9-11小时。睡前避免使用电子设备和剧烈运动。' },
      { type: 'heading', text: '四、保持良好情绪' },
      { type: 'paragraph', text: '长期焦虑、紧张等负面情绪会抑制生长激素分泌。春季多带孩子户外活动，不仅能晒太阳促进维生素D合成，还能改善心情。' },
      { type: 'heading', text: '五、定期监测生长数据' },
      { type: 'paragraph', text: '建议每月固定时间测量身高体重，记录在成长曲线图上。如果发现3个月内身高增长不到1.5cm，或者身高明显低于同龄人，建议及时就医。' },
      { type: 'highlight', text: '总结：春季长高 = 充足营养 + 科学运动 + 好睡眠 + 好心情 + 定期监测。做好这5点，帮助孩子抓住黄金长高期！' }
    ]
  },
  '2': {
    id: '2',
    title: '这3种运动最有助长高',
    author: '示例教练',
    authorDesc: '界面示例，不对应真实专家或机构背书',
    time: '2025-02-08',
    views: '1.8万',
    likes: 256,
    comments: 42,
    image: '/static/images/text2.png',
    tags: ['运动长高', '跳绳', '篮球'],
    sections: [
      { type: 'paragraph', text: '运动是促进孩子长高最有效、最安全的方式之一。适量的体育锻炼可以刺激生长激素分泌，促进骨骼生长板的活跃，帮助孩子充分发挥生长潜力。' },
      { type: 'heading', text: '一、跳绳——性价比最高的长高运动' },
      { type: 'paragraph', text: '跳绳是公认的促进长高效果最好的运动。在跳跃过程中，下肢骨骼受到反复的纵向刺激，能有效促进骨骼生长。研究表明，每天坚持跳绳15-20分钟，生长激素分泌量可提高2倍以上。' },
      { type: 'list', items: [
        '初学者：每天100-200个，分2-3组完成',
        '进阶者：每天300-500个，可变速跳',
        '建议在塑胶场地或草地进行，保护关节',
        '跳绳后做5分钟拉伸，效果更佳'
      ] },
      { type: 'highlight', text: '注意：跳绳虽好，但不宜过量。建议每天不超过30分钟，避免关节损伤。' },
      { type: 'heading', text: '二、篮球——全身性的跳跃运动' },
      { type: 'paragraph', text: '篮球运动中包含大量的跑、跳、拉伸动作，对促进身高增长非常有效。投篮时的手臂拉伸、抢篮板时的跳跃，都能充分刺激骨骼生长。' },
      { type: 'list', items: [
        '建议每次运动30-60分钟',
        '重点练习投篮、运球、跳跃等动作',
        '运动前热身10分钟，预防运动损伤',
        '可结合亲子对抗，增加趣味性'
      ] },
      { type: 'heading', text: '三、游泳——低冲击的全身拉伸' },
      { type: 'paragraph', text: '游泳时身体处于水平伸展状态，脊柱、四肢都得到充分拉伸，且水的浮力减少了关节负担，特别适合体重偏重的孩子。蛙泳和自由泳的拉伸效果最好。' },
      { type: 'list', items: [
        '每周2-3次，每次30-45分钟',
        '蛙泳对下肢拉伸最明显',
        '自由泳能全面锻炼全身肌肉',
        '游泳后注意补充营养和休息'
      ] },
      { type: 'highlight', text: '运动小贴士：最佳运动时间是下午4-6点，此时体温最高，肌肉最灵活，运动效果最好。运动后30分钟是生长激素分泌高峰期！' }
    ]
  },
  '3': {
    id: '3',
    title: '钙片怎么吃最有效？',
    author: '示例营养师',
    authorDesc: '界面示例，不对应真实专家或机构背书',
    time: '2025-02-05',
    views: '3.1万',
    likes: 412,
    comments: 98,
    image: '/static/images/text3.png',
    tags: ['科学补钙', '维生素D', '营养补充'],
    sections: [
      { type: 'paragraph', text: '钙是骨骼生长最重要的矿物质。很多家长都在给孩子补钙，但方法不对，吸收率可能不到30%。掌握正确的补钙方法，才能让每一粒钙片都发挥最大效用。' },
      { type: 'heading', text: '一、选对钙剂种类' },
      { type: 'paragraph', text: '市面上的钙剂主要分为碳酸钙、柠檬酸钙、乳酸钙等。碳酸钙含钙量最高（40%），但需要胃酸帮助吸收，建议随餐服用。柠檬酸钙不依赖胃酸，空腹也能吸收，适合肠胃敏感的孩子。' },
      { type: 'list', items: [
        '碳酸钙：含钙量高，性价比好，随餐服用',
        '柠檬酸钙：吸收率较高，不依赖胃酸',
        '乳酸钙：溶解度好，口感好，适合幼儿',
        '氨基酸螯合钙：吸收率最高，但价格较贵'
      ] },
      { type: 'heading', text: '二、分次服用，少量多次' },
      { type: 'paragraph', text: '人体每次最多吸收300-500mg钙。如果一次性吃1000mg的钙片，大部分都会被排出体外。正确做法是将每日所需钙量分2-3次服用。' },
      { type: 'highlight', text: '建议：每次补充不超过300mg钙。例如每日需800mg，可以早晚各补一次，每次400mg。' },
      { type: 'heading', text: '三、搭配维生素D，事半功倍' },
      { type: 'paragraph', text: '没有维生素D，钙的吸收率只有10-15%。补充足量维生素D后，钙的吸收率可提高到30-40%。建议每天补充维生素D 400-800IU。' },
      { type: 'list', items: [
        '维生素D3 是最佳形式，优于D2',
        '每天晒太阳15-20分钟也能促进维生素D合成',
        '冬季和阴雨天需要额外补充维生素D',
        '维生素D与钙一起服用，吸收效果最好'
      ] },
      { type: 'heading', text: '四、避开这些补钙误区' },
      { type: 'list', items: [
        '误区1：骨头汤补钙——骨头汤含钙极少，脂肪含量高',
        '误区2：越贵越好——选适合的比选贵的更重要',
        '误区3：补钙越多越好——过量补钙可能导致便秘、肾结石',
        '误区4：只补钙不运动——运动能促进钙沉积到骨骼中'
      ] },
      { type: 'highlight', text: '总结：选对钙剂 + 分次服用 + 搭配VD + 适量运动 = 科学补钙。记住这个公式，让孩子的骨骼更强壮！' }
    ]
  }
}

const article = reactive({ ...articlesDB['1'] })

const relatedArticles = ref<any[]>([])

onLoad((options: any) => {
  const id = options?.id || '1'
  const data = articlesDB[id]
  if (data) {
    Object.assign(article, data)
  }
  // 设置相关推荐（排除当前文章）
  relatedArticles.value = Object.values(articlesDB)
    .filter((a: any) => a.id !== id)
    .map((a: any) => ({ id: a.id, title: a.title, image: a.image, views: a.views }))
  // 检查是否已收藏
  checkFavorite()
})

function checkFavorite() {
  const token = uni.getStorageSync('auth_token')
  if (!token) return
  uni.request({
    url: `${API_BASE}/api/favorites/check?article_id=${article.id}`,
    method: 'GET',
    header: { 'x-token': token },
    success: (res: any) => {
      if (res.data.code === 0) {
        collected.value = res.data.data.favorited
      }
    }
  })
}

function toggleLike() {
  liked.value = !liked.value
}

function toggleCollect() {
  const token = uni.getStorageSync('auth_token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  if (collected.value) {
    // 取消收藏
    uni.request({
      url: `${API_BASE}/api/favorites/remove`,
      method: 'POST',
      header: { 'x-token': token },
      data: { article_id: article.id },
      success: (res: any) => {
        if (res.data.code === 0) {
          collected.value = false
          uni.showToast({ title: '已取消收藏', icon: 'none' })
        }
      }
    })
  } else {
    // 收藏
    uni.request({
      url: `${API_BASE}/api/favorites/add`,
      method: 'POST',
      header: { 'x-token': token },
      data: {
        article_id: article.id,
        title: article.title,
        image: article.image,
        source: 'article'
      },
      success: (res: any) => {
        if (res.data.code === 0 || res.data.code === -2) {
          collected.value = true
          uni.showToast({ title: '已收藏', icon: 'success' })
        }
      }
    })
  }
}

function onShare() {
  uni.showActionSheet({
    itemList: ['微信好友', '朋友圈', '复制链接'],
    success: () => {
      uni.showToast({ title: '分享功能开发中', icon: 'none' })
    }
  })
}

function onFollow() {
  uni.showToast({ title: '已关注', icon: 'success' })
}

function onRelatedTap(rec: any) {
  uni.redirectTo({ url: `/pages/articlePage/index?id=${rec.id}` })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #FFFFFF;
}

.article-scroll {
  height: calc(100vh - 44px);
}

/* 封面 */
.article-cover-img {
  width: 100%;
  height: 360rpx;
  display: block;
}

/* 头部 */
.article-header {
  padding-top: 32rpx;
  padding-bottom: 24rpx;
}

.article-title-text {
  font-size: 38rpx;
  font-weight: 600;
  color: #333333;
  line-height: 1.5;
  display: block;
}

.article-meta {
  gap: 12rpx;
}

.meta-author, .meta-time, .meta-views {
  font-size: 24rpx;
  color: #999999;
}

.meta-dot {
  color: #CCCCCC;
}

.article-tags {
  gap: 12rpx;
}

.article-tag {
  font-size: 22rpx;
  color: #4A9EFF;
  background: #E8F3FF;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

/* 内容 */
.article-body {
  padding-top: 24rpx;
}

.content-section {
  margin-bottom: 24rpx;
}

.section-heading {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  display: block;
  margin-top: 16rpx;
  margin-bottom: 12rpx;
  padding-left: 16rpx;
  border-left: 6rpx solid #4A9EFF;
}

.section-paragraph {
  font-size: 28rpx;
  color: #444444;
  line-height: 1.9;
  display: block;
}

.section-highlight {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  background: #FFF8E8;
  border-radius: 12rpx;
  padding: 20rpx;
  border-left: 6rpx solid #FF9900;
}

.highlight-icon {
  font-size: 28rpx;
  flex-shrink: 0;
}

.highlight-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.7;
}

.section-real-image {
  border-radius: 12rpx;
  overflow: hidden;
  text-align: center;
}

.section-img {
  width: 100%;
  height: 280rpx;
  border-radius: 12rpx;
  display: block;
}

.section-image {
  height: 280rpx;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.image-placeholder {
  font-size: 64rpx;
}

.image-caption {
  font-size: 22rpx;
  color: #999999;
  margin-top: 8rpx;
}

.section-list {
  padding-left: 8rpx;
}

.list-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.list-bullet {
  font-size: 26rpx;
  color: #4A9EFF;
  font-weight: 600;
  flex-shrink: 0;
  min-width: 40rpx;
}

.list-text {
  font-size: 28rpx;
  color: #444444;
  line-height: 1.7;
}

/* 作者卡片 */
.author-card {
  padding: 24rpx;
}

.author-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 36rpx;
  background: #E8F3FF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  font-size: 36rpx;
}

.author-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  display: block;
}

.author-desc {
  font-size: 24rpx;
  color: #999999;
  margin-top: 4rpx;
  display: block;
}

.btn-follow {
  background: #4A9EFF;
  color: #FFFFFF;
  font-size: 24rpx;
  padding: 10rpx 24rpx;
  border-radius: 24rpx;
}

/* 相关推荐 */
.related-item {
  gap: 16rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 12rpx;
}

.related-cover-img {
  width: 120rpx;
  height: 90rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.related-title {
  font-size: 26rpx;
  color: #333333;
  display: block;
}

.related-meta {
  font-size: 22rpx;
  color: #999999;
  margin-top: 8rpx;
  display: block;
}

/* 底部互动 */
.interact-row {
  justify-content: space-around;
  padding: 20rpx 0;
  border-top: 1rpx solid #F0F0F0;
}

.interact-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
}

.interact-count {
  font-size: 24rpx;
  color: #999999;
}
</style>
