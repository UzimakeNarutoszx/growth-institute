const express = require('express')
const { getDB, saveDB } = require('../db')

const router = express.Router()

// sql.js 辅助
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

/**
 * 通过 token 获取用户ID（简易鉴权中间件）
 */
function getUserId(req) {
  const token = req.headers['x-token'] || req.body.token
  if (!token) return null
  const user = queryOne('SELECT id FROM users WHERE token = ?', [token])
  return user ? user.id : null
}

/**
 * POST /api/assessment/submit
 * 提交测评结果
 */
router.post('/submit', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    const { answers, score, summary } = req.body

    runSQL(
      'INSERT INTO assessments (user_id, answers, score, summary) VALUES (?, ?, ?, ?)',
      [userId, JSON.stringify(answers || {}), score || 0, summary || '生长潜力良好，营养有优化空间']
    )

    // 查询新插入的记录
    const record = queryOne(
      'SELECT * FROM assessments WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [userId]
    )

    res.json({
      code: 0,
      message: '测评提交成功',
      data: {
        id: record.id,
        score: record.score,
        summary: record.summary,
        date: record.created_at
      }
    })
  } catch (err) {
    console.error('[测评提交错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * GET /api/assessment/history
 * 获取测评历史
 */
router.get('/history', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    const records = queryAll(
      'SELECT id, score, summary, created_at FROM assessments WHERE user_id = ? ORDER BY id DESC',
      [userId]
    )

    res.json({
      code: 0,
      data: records.map(r => ({
        id: String(r.id),
        score: r.score,
        summary: r.summary,
        date: r.created_at
      }))
    })
  } catch (err) {
    console.error('[测评历史错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * GET /api/assessment/latest
 * 获取最新测评
 */
router.get('/latest', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    const record = queryOne(
      'SELECT * FROM assessments WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [userId]
    )

    if (!record) {
      return res.json({ code: 0, data: null })
    }

    res.json({
      code: 0,
      data: {
        id: String(record.id),
        score: record.score,
        summary: record.summary,
        answers: JSON.parse(record.answers || '{}'),
        date: record.created_at
      }
    })
  } catch (err) {
    console.error('[最新测评错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

module.exports = router
