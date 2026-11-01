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
 * POST /api/favorites/add
 * 收藏文章
 */
router.post('/add', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    const { article_id, title, image, source } = req.body
    if (!article_id || !title) {
      return res.json({ code: -1, message: '参数不完整' })
    }

    // 检查是否已收藏
    const existing = queryOne(
      'SELECT id FROM favorites WHERE user_id = ? AND article_id = ?',
      [userId, article_id]
    )
    if (existing) {
      return res.json({ code: -2, message: '已经收藏过了' })
    }

    runSQL(
      'INSERT INTO favorites (user_id, article_id, title, image, source) VALUES (?, ?, ?, ?, ?)',
      [userId, article_id, title, image || '', source || 'article']
    )

    res.json({ code: 0, message: '收藏成功' })
  } catch (err) {
    console.error('[收藏错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * POST /api/favorites/remove
 * 取消收藏
 */
router.post('/remove', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    const { article_id } = req.body
    runSQL('DELETE FROM favorites WHERE user_id = ? AND article_id = ?', [userId, article_id])

    res.json({ code: 0, message: '已取消收藏' })
  } catch (err) {
    console.error('[取消收藏错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * GET /api/favorites/list
 * 获取收藏列表
 */
router.get('/list', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    const records = queryAll(
      'SELECT article_id, title, image, source, created_at FROM favorites WHERE user_id = ? ORDER BY id DESC',
      [userId]
    )

    res.json({ code: 0, data: records })
  } catch (err) {
    console.error('[收藏列表错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * GET /api/favorites/check?article_id=xxx
 * 检查是否已收藏
 */
router.get('/check', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: 0, data: { favorited: false } })

    const articleId = req.query.article_id
    const existing = queryOne(
      'SELECT id FROM favorites WHERE user_id = ? AND article_id = ?',
      [userId, articleId]
    )

    res.json({ code: 0, data: { favorited: !!existing } })
  } catch (err) {
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

module.exports = router
