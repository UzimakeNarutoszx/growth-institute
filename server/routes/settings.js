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
 * GET /api/settings
 * 获取用户设置
 */
router.get('/', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    let settings = queryOne('SELECT * FROM user_settings WHERE user_id = ?', [userId])
    if (!settings) {
      // 创建默认设置
      runSQL('INSERT INTO user_settings (user_id) VALUES (?)', [userId])
      settings = queryOne('SELECT * FROM user_settings WHERE user_id = ?', [userId])
    }

    res.json({
      code: 0,
      data: {
        notification_enabled: !!settings.notification_enabled,
        push_assessment: !!settings.push_assessment,
        push_growth: !!settings.push_growth,
        push_article: !!settings.push_article,
        allow_data_collection: !!settings.allow_data_collection
      }
    })
  } catch (err) {
    console.error('[获取设置错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * POST /api/settings/update
 * 更新用户设置
 */
router.post('/update', (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.json({ code: -1, message: '请先登录' })

    const { key, value } = req.body
    const allowedKeys = ['notification_enabled', 'push_assessment', 'push_growth', 'push_article', 'allow_data_collection']

    if (!allowedKeys.includes(key)) {
      return res.json({ code: -1, message: '无效的设置项' })
    }

    // 确保有记录
    const existing = queryOne('SELECT id FROM user_settings WHERE user_id = ?', [userId])
    if (!existing) {
      runSQL('INSERT INTO user_settings (user_id) VALUES (?)', [userId])
    }

    runSQL(`UPDATE user_settings SET ${key} = ?, updated_at = datetime('now', 'localtime') WHERE user_id = ?`, [value ? 1 : 0, userId])

    res.json({ code: 0, message: '设置已更新' })
  } catch (err) {
    console.error('[更新设置错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

module.exports = router
