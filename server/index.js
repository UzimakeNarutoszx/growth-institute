const express = require('express')
const cors = require('cors')
const { initDB } = require('./db')
const authRoutes = require('./routes/auth')
const assessmentRoutes = require('./routes/assessment')
const growthRoutes = require('./routes/growth')
const chatRoutes = require('./routes/chat')
const favoritesRoutes = require('./routes/favorites')
const settingsRoutes = require('./routes/settings')
const notificationsRoutes = require('./routes/notifications')
const communityRoutes = require('./routes/community')

const app = express()
const PORT = 3000

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/assessment', assessmentRoutes)
app.use('/api/growth', growthRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/community', communityRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: '服务运行正常', time: new Date().toLocaleString('zh-CN') })
})

// 先初始化数据库，再启动服务
initDB().then(() => {
  app.listen(PORT, () => {
    console.log('')
    console.log('========================================')
    console.log('  生长研究院 后端服务已启动')
    console.log(`  地址: http://localhost:${PORT}`)
    console.log('  接口:')
    console.log('    [认证]')
    console.log('      POST /api/auth/register    - 注册')
    console.log('      POST /api/auth/login       - 登录')
    console.log('      POST /api/auth/verify      - Token验证')
    console.log('      POST /api/auth/logout      - 退出登录')
    console.log('    [测评]')
    console.log('      POST /api/assessment/submit - 提交测评')
    console.log('      GET  /api/assessment/history- 测评历史')
    console.log('      GET  /api/assessment/latest - 最新测评')
    console.log('    [成长记录]')
    console.log('      POST /api/growth/add       - 添加记录')
    console.log('      GET  /api/growth/list      - 记录列表')
    console.log('    [AI聊天]')
    console.log('      POST /api/chat/save        - 保存消息')
    console.log('      GET  /api/chat/history     - 聊天历史')
    console.log('      DEL  /api/chat/clear       - 清空记录')
    console.log('    [其他]')
    console.log('      GET  /api/health           - 健康检查')
    console.log('========================================')
    console.log('')
  })
}).catch(err => {
  console.error('[启动失败]', err)
  process.exit(1)
})
