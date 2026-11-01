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
 * POST /api/chat/save
 * 保存一条聊天消息
 */
router.post('/save', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    const { role, content } = req.body

    if (!role || !content) {
      return res.json({ code: -1, message: '消息内容不能为空' })
    }

    runSQL(
      'INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)',
      [userId, role, content]
    )

    res.json({ code: 0, message: '保存成功' })
  } catch (err) {
    console.error('[聊天保存错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * GET /api/chat/history
 * 获取聊天历史（最近50条）
 */
router.get('/history', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    const records = queryAll(
      'SELECT role, content, created_at FROM chat_history WHERE user_id = ? ORDER BY id DESC LIMIT 50',
      [userId]
    )

    // 倒序查出来后翻转成正序
    records.reverse()

    res.json({
      code: 0,
      data: records.map(r => ({
        role: r.role,
        content: r.content,
        time: r.created_at
      }))
    })
  } catch (err) {
    console.error('[聊天历史错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * DELETE /api/chat/clear
 * 清空聊天记录
 */
router.delete('/clear', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    runSQL('DELETE FROM chat_history WHERE user_id = ?', [userId])

    res.json({ code: 0, message: '聊天记录已清空' })
  } catch (err) {
    console.error('[清空聊天错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

module.exports = router
