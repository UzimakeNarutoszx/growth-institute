<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore, useAssessmentStore, useGrowthStore } from '@/store'

onLaunch(() => {
  console.log('App Launch')
  // 尝试自动登录
  const userStore = useUserStore()
  const assessmentStore = useAssessmentStore()
  const growthStore = useGrowthStore()

  userStore.autoLogin().then((ok) => {
    if (ok) {
      console.log('自动登录成功:', userStore.nickname)
      // 加载用户历史数据
      assessmentStore.loadHistory()
      growthStore.loadRecords()
    }
  })
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
/* 全局样式 */
@import './styles/global.scss';
</style>
