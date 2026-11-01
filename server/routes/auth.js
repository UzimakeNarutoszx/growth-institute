const express = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { getDB, saveDB } = require('../db')

const router = express.Router()

/**
 * 生成 token
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * 手机号脱敏
 */
function maskPhone(phone) {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * sql.js 辅助：查询单行
 */
function queryOne(sql, params = []) {
  const db = getDB()
  const stmt = db.prepare(sql)
  stmt.bind(params)
  let row = null
  if (stmt.step()) {
    row = stmt.getAsObject()
  }
  stmt.free()
  return row
}

/**
 * sql.js 辅助：执行写操作
 */
function runSQL(sql, params = []) {
  const db = getDB()
  db.run(sql, params)
  saveDB()
}

/**
 * POST /api/auth/register
 * 注册：手机号 + 密码
 */
router.post('/register', (req, res) => {
  try {
    const { phone, password } = req.body

    // 参数校验
    if (!phone || !/^1\d{10}$/.test(phone)) {
      return res.json({ code: -1, message: '请输入正确的11位手机号' })
    }
    if (!password || password.length < 6) {
      return res.json({ code: -1, message: '密码至少6位' })
    }

    // 检查手机号是否已注册
    const existing = queryOne('SELECT id FROM users WHERE phone = ?', [phone])
    if (existing) {
      return res.json({ code: -2, message: '该手机号已注册，请直接登录' })
    }

    // 密码加密
    const hashedPassword = bcrypt.hashSync(password, 10)
    const token = generateToken()
    const nickname = maskPhone(phone)

    // 插入用户
    runSQL(
      'INSERT INTO users (phone, password, nickname, token) VALUES (?, ?, ?, ?)',
      [phone, hashedPassword, nickname, token]
    )

    // 获取新插入的用户 id
    const newUser = queryOne('SELECT id FROM users WHERE phone = ?', [phone])

    res.json({
      code: 0,
      message: '注册成功',
      data: {
        user_id: newUser ? newUser.id : 0,
        phone: phone,
        nickname: nickname,
        token: token
      }
    })
  } catch (err) {
    console.error('[注册错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * POST /api/auth/login
 * 登录：手机号 + 密码
 */
router.post('/login', (req, res) => {
  try {
    const { phone, password } = req.body

    if (!phone || !password) {
      return res.json({ code: -1, message: '请输入手机号和密码' })
    }

    // 查找用户
    const user = queryOne('SELECT * FROM users WHERE phone = ?', [phone])
    if (!user) {
      return res.json({ code: -2, message: '手机号未注册' })
    }

    // 校验密码
    const isMatch = bcrypt.compareSync(password, user.password)
    if (!isMatch) {
      return res.json({ code: -3, message: '密码错误' })
    }

    // 生成新 token
    const token = generateToken()
    runSQL('UPDATE users SET token = ? WHERE id = ?', [token, user.id])

    res.json({
      code: 0,
      message: '登录成功',
      data: {
        user_id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        is_vip: !!user.is_vip,
        token: token,
        child: {
          name: user.child_name || '',
          birthday: user.child_birthday || '',
          gender: user.child_gender || 'male',
          height: user.child_height || 0,
          weight: user.child_weight || 0
        }
      }
    })
  } catch (err) {
    console.error('[登录错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * POST /api/auth/verify
 * Token 验证（自动登录）
 */
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.json({ code: -1, message: '未提供 token' })
    }

    const user = queryOne('SELECT * FROM users WHERE token = ?', [token])
    if (!user) {
      return res.json({ code: -2, message: 'token 无效，请重新登录' })
    }

    res.json({
      code: 0,
      data: {
        user_id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        is_vip: !!user.is_vip,
        token: user.token,
        child: {
          name: user.child_name || '',
          birthday: user.child_birthday || '',
          gender: user.child_gender || 'male',
          height: user.child_height || 0,
          weight: user.child_weight || 0
        }
      }
    })
  } catch (err) {
    console.error('[Token验证错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * POST /api/auth/update-profile
 * 更新个人信息
 */
router.post('/update-profile', (req, res) => {
  try {
    const token = req.headers['x-token'] || req.body.token
    if (!token) return res.json({ code: -1, message: '请先登录' })

    const user = queryOne('SELECT id FROM users WHERE token = ?', [token])
    if (!user) return res.json({ code: -2, message: 'token 无效' })

    const {
      nickname, child_name, child_gender, child_birthday,
      child_height, child_weight, father_height, mother_height, allergies
    } = req.body

    runSQL(`
      UPDATE users SET
        nickname = ?, child_name = ?, child_gender = ?, child_birthday = ?,
        child_height = ?, child_weight = ?, father_height = ?, mother_height = ?, allergies = ?
      WHERE id = ?
    `, [
      nickname || '', child_name || '', child_gender || 'male', child_birthday || '',
      child_height || 0, child_weight || 0, father_height || 0, mother_height || 0,
      allergies || '无', user.id
    ])

    res.json({ code: 0, message: '信息已更新' })
  } catch (err) {
    console.error('[更新个人信息错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

/**
 * POST /api/auth/logout
 * 退出登录
 */
router.post('/logout', (req, res) => {
  try {
    const { token } = req.body

    if (token) {
      runSQL('UPDATE users SET token = "" WHERE token = ?', [token])
    }

    res.json({ code: 0, message: '已退出登录' })
  } catch (err) {
    console.error('[退出登录错误]', err)
    res.json({ code: -99, message: '服务器错误: ' + err.message })
  }
})

module.exports = router
