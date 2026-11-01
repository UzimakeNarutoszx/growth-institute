'use strict'

const db = uniCloud.database()
const usersCollection = db.collection('users')

// 内存中存储验证码（生产环境应使用 Redis 或云数据库临时集合）
// uniCloud 云函数是无状态的，此处仅作 MVP 演示
// 生产环境建议使用 uniCloud 的 uni-id 模块 或 将验证码存入数据库
const verifyCodeStore = {}

/**
 * 生成6位随机验证码
 */
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

/**
 * 生成简易 token
 */
function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token + '_' + Date.now()
}

/**
 * 手机号脱敏
 */
function maskPhone(phone) {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

exports.main = async (event, context) => {
  const { action, phone, code, token, child } = event

  switch (action) {
    // ========== 发送验证码 ==========
    case 'sendCode': {
      if (!phone || phone.length !== 11) {
        return { code: -1, message: '请输入正确的手机号' }
      }

      const verifyCode = generateCode()

      // 存储验证码（5分钟有效）
      verifyCodeStore[phone] = {
        code: verifyCode,
        expireAt: Date.now() + 5 * 60 * 1000
      }

      // TODO: 接入真实短信服务（如腾讯云SMS）
      // 目前 MVP 阶段将验证码打印到云函数日志，方便测试
      // Privacy: verification codes are not logged.

      // 生产环境取消下面的注释，接入腾讯云短信：
      // const smsRes = await uniCloud.sendSms({
      //   appid: '__UNI__GROWTH_INST',
      //   smsKey: 'your-sms-key',
      //   smsSecret: 'your-sms-secret',
      //   phone: phone,
      //   templateId: 'your-template-id',
      //   data: { code: verifyCode }
      // })

      return {
        code: 0,
        message: '验证码已发送',
        // MVP 阶段直接返回验证码方便测试，生产环境务必删除此字段！
        _debug_code: verifyCode
      }
    }

    // ========== 验证码登录 ==========
    case 'loginByCode': {
      if (!phone || phone.length !== 11) {
        return { code: -1, message: '请输入正确的手机号' }
      }
      if (!code || code.length < 4) {
        return { code: -1, message: '请输入验证码' }
      }

      // 校验验证码
      const stored = verifyCodeStore[phone]
      if (!stored) {
        return { code: -2, message: '请先获取验证码' }
      }
      if (Date.now() > stored.expireAt) {
        delete verifyCodeStore[phone]
        return { code: -2, message: '验证码已过期，请重新获取' }
      }
      if (stored.code !== code) {
        return { code: -2, message: '验证码错误' }
      }

      // 验证成功，清除验证码
      delete verifyCodeStore[phone]

      // 查找或创建用户
      const userQuery = await usersCollection.where({ phone: phone }).get()
      let userId, userData

      if (userQuery.data && userQuery.data.length > 0) {
        // 用户已存在，更新 token
        userData = userQuery.data[0]
        userId = userData._id
        const newToken = generateToken()
        await usersCollection.doc(userId).update({
          token: newToken
        })
        userData.token = newToken
      } else {
        // 新用户注册
        const newToken = generateToken()
        const newUser = {
          phone: phone,
          nickname: maskPhone(phone),
          avatar: '',
          child: {
            name: '',
            birthday: '',
            gender: 'male',
            height: 0,
            weight: 0,
            bone_age: null,
            father_height: 0,
            mother_height: 0,
            expected_height: 0,
            allergies: ['无']
          },
          is_vip: false,
          token: newToken,
          created_at: Date.now()
        }
        const addRes = await usersCollection.add(newUser)
        userId = addRes.id
        userData = { _id: userId, ...newUser }
      }

      return {
        code: 0,
        message: '登录成功',
        data: {
          user_id: userId,
          phone: userData.phone,
          nickname: userData.nickname,
          avatar: userData.avatar,
          child: userData.child,
          is_vip: userData.is_vip,
          token: userData.token
        }
      }
    }

    // ========== Token 验证（自动登录） ==========
    case 'verifyToken': {
      if (!token) {
        return { code: -1, message: '未提供 token' }
      }

      const tokenQuery = await usersCollection.where({ token: token }).get()
      if (!tokenQuery.data || tokenQuery.data.length === 0) {
        return { code: -2, message: 'token 无效，请重新登录' }
      }

      const user = tokenQuery.data[0]
      return {
        code: 0,
        data: {
          user_id: user._id,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar,
          child: user.child,
          is_vip: user.is_vip,
          token: user.token
        }
      }
    }

    // ========== 更新孩子信息 ==========
    case 'updateChild': {
      if (!token) {
        return { code: -1, message: '请先登录' }
      }
      if (!child) {
        return { code: -1, message: '缺少孩子信息' }
      }

      const authQuery = await usersCollection.where({ token: token }).get()
      if (!authQuery.data || authQuery.data.length === 0) {
        return { code: -2, message: 'token 无效' }
      }

      const uid = authQuery.data[0]._id
      await usersCollection.doc(uid).update({ child: child })

      return { code: 0, message: '信息更新成功' }
    }

    // ========== 退出登录 ==========
    case 'logout': {
      if (!token) {
        return { code: 0, message: '已退出' }
      }

      const logoutQuery = await usersCollection.where({ token: token }).get()
      if (logoutQuery.data && logoutQuery.data.length > 0) {
        await usersCollection.doc(logoutQuery.data[0]._id).update({ token: '' })
      }

      return { code: 0, message: '已退出登录' }
    }

    default:
      return { code: -1, message: `未知操作: ${action}` }
  }
}
