const initSqlJs = require('sql.js')
const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, 'growth.db')

let db = null

/**
 * 初始化数据库
 */
async function initDB() {
  const SQL = await initSqlJs()

  // 如果数据库文件已存在，加载它
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(fileBuffer)
    console.log('[数据库] 已加载现有数据库:', DB_PATH)
  } else {
    db = new SQL.Database()
    console.log('[数据库] 已创建新数据库:', DB_PATH)
  }

  // 创建用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      child_name TEXT DEFAULT '',
      child_birthday TEXT DEFAULT '',
      child_gender TEXT DEFAULT 'male',
      child_height REAL DEFAULT 0,
      child_weight REAL DEFAULT 0,
      child_bone_age REAL,
      father_height REAL DEFAULT 0,
      mother_height REAL DEFAULT 0,
      expected_height REAL DEFAULT 0,
      allergies TEXT DEFAULT '无',
      is_vip INTEGER DEFAULT 0,
      token TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)

  // 创建测评记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      answers TEXT DEFAULT '{}',
      score INTEGER DEFAULT 0,
      summary TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)

  // 创建成长记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS growth_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      height REAL NOT NULL,
      weight REAL NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)

  // 创建聊天记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)

  // 创建用户设置表
  db.run(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      notification_enabled INTEGER DEFAULT 1,
      push_assessment INTEGER DEFAULT 1,
      push_growth INTEGER DEFAULT 1,
      push_article INTEGER DEFAULT 1,
      allow_data_collection INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)

  // 创建通知消息表
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)

  // 创建社区帖子表
  db.run(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      username TEXT DEFAULT '',
      avatar TEXT DEFAULT '👤',
      content TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)

  // 创建收藏文章表
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      article_id TEXT NOT NULL,
      title TEXT NOT NULL,
      image TEXT DEFAULT '',
      source TEXT DEFAULT 'article',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      UNIQUE(user_id, article_id)
    )
  `)

  saveDB()
  return db
}

/**
 * 将数据库保存到文件
 */
function saveDB() {
  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(DB_PATH, buffer)
  }
}

/**
 * 获取数据库实例
 */
function getDB() {
  return db
}

module.exports = { initDB, getDB, saveDB }
