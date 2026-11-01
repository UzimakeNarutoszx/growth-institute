'use strict'

// 豆包 API Key 安全存放在云端，前端不再暴露
const API_KEY = process.env.AI_API_KEY || ''
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
const MODEL = 'doubao-seed-1-8-251228'

exports.main = async (event, context) => {
  const { messages } = event

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { code: -1, message: '消息不能为空' }
  }

  try {
    const res = await uniCloud.httpclient.request(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      data: {
        model: MODEL,
        messages: messages
      },
      contentType: 'json',
      dataType: 'json',
      timeout: 30000
    })

    if (res.status === 200 && res.data && res.data.choices && res.data.choices[0]) {
      const reply = res.data.choices[0].message.content

      // 可选：保存对话记录到数据库
      if (event.user_id) {
        const db = uniCloud.database()
        try {
          await db.collection('chat_history').add({
            user_id: event.user_id,
            messages: [
              { role: 'user', content: messages[messages.length - 1].content, time: Date.now() },
              { role: 'assistant', content: reply, time: Date.now() }
            ],
            created_at: Date.now()
          })
        } catch (dbErr) {
          console.warn('保存对话记录失败:', dbErr)
        }
      }

      return { code: 0, data: reply }
    } else {
      console.error('豆包API响应异常:', res.status, res.data)
      return { code: -2, message: 'AI服务暂时不可用，请稍后再试' }
    }
  } catch (error) {
    console.error('请求豆包API失败:', error)
    return { code: -3, message: '网络请求失败，请检查网络连接' }
  }
}
