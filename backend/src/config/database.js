import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// 数据库连接池
let pool = null

/**
 * 获取数据库连接池
 */
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'pingpong',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pingpong_ai',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    })

    console.log('✅ MySQL 连接池已创建')
  }
  return pool
}

/**
 * 测试数据库连接
 */
export async function testConnection() {
  try {
    const connection = await getPool().getConnection()
    await connection.ping()
    connection.release()
    console.log('✅ MySQL 数据库连接成功')
    return true
  } catch (error) {
    console.error('❌ MySQL 数据库连接失败:', error.message)
    return false
  }
}

/**
 * 执行查询
 */
export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params)
  return rows
}

/**
 * 获取单条记录
 */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params)
  return rows[0] || null
}

/**
 * 关闭连接池
 */
export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
    console.log('MySQL 连接池已关闭')
  }
}

export default {
  getPool,
  testConnection,
  query,
  queryOne,
  closePool
}
