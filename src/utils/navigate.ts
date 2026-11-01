/**
 * 页面导航工具函数
 */

// Tab页面列表
const TAB_PAGES = [
  '/pages/homePage/index',
  '/pages/assessmentHomePage/index',
  '/pages/growthRecordPage/index',
  '/pages/profilePage/index'
]

/**
 * 跳转到指定页面
 */
export function navigateTo(url: string, params?: Record<string, string | number>) {
  let fullUrl = url
  if (params) {
    const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
    fullUrl = `${url}?${query}`
  }

  // 判断是否是 tab 页面
  if (TAB_PAGES.includes(url)) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url: fullUrl })
  }
}

/**
 * 返回上一页
 */
export function navigateBack(delta = 1) {
  uni.navigateBack({ delta })
}

/**
 * 重定向到指定页面
 */
export function redirectTo(url: string) {
  if (TAB_PAGES.includes(url)) {
    uni.switchTab({ url })
  } else {
    uni.redirectTo({ url })
  }
}

/**
 * 显示 Toast 提示
 */
export function showToast(title: string, icon: 'success' | 'none' | 'error' = 'none') {
  uni.showToast({ title, icon, duration: 2000 })
}

/**
 * 显示确认对话框
 */
export function showConfirm(title: string, content: string): Promise<boolean> {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}
