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
  const user = queryOne('SELECT id, nickname FROM users WHERE token = ?', [token])
  return user
}

/**
 * POST /api/community/publish
 * 发布社区帖子
 */
router.post('/publish', (req, res) => {
  try {
    const user = getUserId(req)
    if (!user) return res.json({ code: -1, message: '请先登录' })

    const { content } = req.body
    if (!content || !content.trim()) {
      return res.json({ code: -1, message: '内容不能为空' })
    }

    runSQL(
      'INSERT INTO community_posts (user_id, username, content) VALUES (?, ?, ?)',
      [user.id, user.nickname || `用户${user.id}`, content.trim()]
    )

    // 获取刚插入的帖子
    const post = queryOne(
      'SELECT id, user_id, username, avatar, content, likes, comments, created_at FROM community_posts WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [user.id]
    )

    res.json({
      code: 0,
      message: '发布成功',
      data: post ? {
        id: String(post.id),
        avatar: post.avatar,
        username: post.username,
        content: post.content,
        likes: post.likes,
        comments: post.comments,
        time: post.created_at
      } : null
    })
  } catch (err) {
    console.error('[发布帖子错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * GET /api/community/list
 * 获取社区帖子列表
 */
router.get('/list', (req, res) => {
  try {
    const records = queryAll(
      'SELECT id, user_id, username, avatar, content, likes, comments, created_at FROM community_posts ORDER BY id DESC LIMIT 50'
    )

    res.json({
      code: 0,
      data: records.map(r => ({
        id: String(r.id),
        avatar: r.avatar,
        username: r.username,
        content: r.content,
        likes: r.likes,
        comments: r.comments,
        time: r.created_at
      }))
    })
  } catch (err) {
    console.error('[获取帖子错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

module.exports = router
