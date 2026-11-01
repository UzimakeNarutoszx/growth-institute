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
 * POST /api/growth/add
 * 添加成长记录
 */
router.post('/add', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    const { height, weight, date } = req.body

    if (!height || !weight) {
      return res.json({ code: -1, message: '请填写身高和体重' })
    }

    const recordDate = date || new Date().toISOString().split('T')[0]

    // 每天只能记录一次
    const existing = queryOne(
      'SELECT id FROM growth_records WHERE user_id = ? AND date = ?',
      [userId, recordDate]
    )
    if (existing) {
      // 更新当天记录
      runSQL(
        'UPDATE growth_records SET height = ?, weight = ? WHERE id = ?',
        [height, weight, existing.id]
      )
      return res.json({ code: 0, message: '今日记录已更新' })
    }

    runSQL(
      'INSERT INTO growth_records (user_id, height, weight, date) VALUES (?, ?, ?, ?)',
      [userId, height, weight, recordDate]
    )

    res.json({ code: 0, message: '记录添加成功' })
  } catch (err) {
    console.error('[成长记录添加错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * GET /api/growth/list
 * 获取成长记录列表
 */
router.get('/list', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    const records = queryAll(
      'SELECT id, height, weight, date FROM growth_records WHERE user_id = ? ORDER BY date DESC',
      [userId]
    )

    res.json({
      code: 0,
      data: records.map(r => ({
        id: r.id,
        height: r.height,
        weight: r.weight,
        date: r.date
      }))
    })
  } catch (err) {
    console.error('[成长记录列表错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

module.exports = router
