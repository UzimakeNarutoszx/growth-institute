const express = require('express')
const { getDB, saveDB } = require('../db')

const router = express.Router()

function queryOne(sql, params = []) {
  const db = getDB()
  const stmt = db.prepare(sql)
  stmt.bind(params)
  let row = null
  if (stmt.step()) row = stmt.getAsObject()
  stmt.free()
  return row
}

function queryAll(sql, params = []) {
  const db = getDB()
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const rows = []
  while (stmt.step()) rows.push(stmt.getAsObject())
  stmt.free()
  return rows
}

function runSQL(sql, params = []) {
  const db = getDB()
  db.run(sql, params)
  saveDB()
}

function getUserId(req) {
  const token = req.headers['x-token'] || req.body.token
  if (!token) return null
  const user = queryOne('SELECT id FROM users WHERE token = ?', [token])
  return user ? user.id : null
}

/**
 * POST /api/notifications/add
 * 添加通知
 */
router.post('/add', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    const { type, title, content } = req.body
    if (!type || !title) return res.json({ code: -1, message: '参数不完整' })

    runSQL(
      'INSERT INTO notifications (user_id, type, title, content) VALUES (?, ?, ?, ?)',
      [userId, type, title, content || '']
    )

    res.json({ code: 0, message: '通知已添加' })
  } catch (err) {
    console.error('[添加通知错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * GET /api/notifications/list
 * 获取通知列表
 */
router.get('/list', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    const records = queryAll(
      'SELECT id, type, title, content, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50',
      [userId]
    )

    res.json({
      code: 0,
      data: records.map(r => ({
        id: r.id,
        type: r.type,
        title: r.title,
        content: r.content,
        isRead: !!r.is_read,
        time: r.created_at
      }))
    })
  } catch (err) {
    console.error('[获取通知错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * GET /api/notifications/unread-count
 * 获取未读通知数量
 */
router.get('/unread-count', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: 0, data: { count: 0 } })

    const result = queryOne(
      'SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    )

    res.json({ code: 0, data: { count: result ? result.cnt : 0 } })
  } catch (err) {
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * POST /api/notifications/read-all
 * 标记全部已读
 */
router.post('/read-all', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    runSQL('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId])

    res.json({ code: 0, message: '已全部标记已读' })
  } catch (err) {
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

module.exports = router
