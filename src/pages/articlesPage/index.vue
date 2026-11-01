<template>
  <view class="page-container">
    <NavBar title="文章推荐" />

    <view class="articles-list mx-lg">
      <view
        v-for="article in articles"
        :key="article.id"
        class="article-card card clickable"
        @tap="onArticleTap(article)"
      >
        <image class="article-cover" :src="article.image" mode="aspectFill" />
        <view class="article-body">
          <text class="article-title">{{ article.title }}</text>
          <text class="article-desc">{{ article.desc }}</text>
          <view class="article-meta">
            <text class="meta-views">{{ article.views }} 阅读</text>
            <text class="meta-tag">{{ article.tag }}</text>
          </view>
        </view>
      </view>
    </view>

    <view style="height: 40rpx;" />
  </view>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import { navigateTo } from '@/utils/navigate'

const articles = [
  {
    id: '1',
    title: '春季是孩子长高黄金期',
    desc: '春季儿童平均身高增长是秋季的2-2.5倍，抓住这个黄金季节，做好这5件事，帮助孩子多长几厘米。',
    image: '/static/images/text1.png',
    views: '2.3万',
    tag: '科学长高'
  },
  {
    id: '2',
    title: '这3种运动最有助长高',
    desc: '跳绳、篮球、游泳，运动后生长激素分泌增加3-5倍。每天坚持30分钟，效果看得见。',
    image: '/static/images/text2.png',
    views: '1.8万',
    tag: '运动指导'
  },
  {
    id: '3',
    title: '钙片怎么吃最有效？',
    desc: '分次服用、搭配维生素D，科学补钙让孩子骨骼更强壮。避开这些常见误区，钙才能真正吸收。',
    image: '/static/images/text3.png',
    views: '3.1万',
    tag: '营养补充'
  }
]

function onArticleTap(article: any) {
  navigateTo('/pages/articlePage/index', { id: article.id })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #F8FAFF;
}

.articles-list {
  padding-top: 24rpx;
}

.article-card {
  margin-bottom: 24rpx;
  padding: 0;
  overflow: hidden;
  border-radius: 20rpx;
}

.article-cover {
  width: 100%;
  height: 320rpx;
}

.article-body {
  padding: 24rpx 28rpx;
}

.article-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1A1A1A;
  display: block;
  margin-bottom: 12rpx;
}

.article-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.7;
  display: block;
  margin-bottom: 16rpx;
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meta-views {
  font-size: 24rpx;
  color: #999;
}

.meta-tag {
  font-size: 22rpx;
  color: #4A9EFF;
  background: rgba(74, 158, 255, 0.08);
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
}
</style>
