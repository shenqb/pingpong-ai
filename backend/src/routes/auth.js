import express from 'express'
import db from '../config/database.js'

const router = express.Router()

/**
 * POST /api/auth/send-code
 * 发送验证码
 */
router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        error: '请输入正确的手机号'
      })
    }

    // 生成 6 位验证码
    const code = Math.random().toString().slice(-6)
    
    // TODO: 实际项目中需要调用短信服务商 API
    // 这里仅返回验证码（开发环境）
    console.log(`验证码 [${phone}]: ${code}`)

    // 存储验证码到 Redis（这里用内存模拟）
    // await redis.set(`code:${phone}`, code, 'EX', 300)

    res.json({
      success: true,
      message: '验证码已发送',
      data: { code } // 开发环境返回验证码，生产环境应移除
    })
  } catch (error) {
    console.error('发送验证码失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/auth/login
 * 登录
 */
router.post('/login', async (req, res) => {
  try {
    const { phone, code } = req.body

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        error: '手机号和验证码不能为空'
      })
    }

    // TODO: 验证验证码
    // const storedCode = await redis.get(`code:${phone}`)
    // if (storedCode !== code) {
    //   return res.status(400).json({ success: false, error: '验证码错误' })
    // }

    // 查询或创建用户
    let user = await db.queryOne('SELECT * FROM users WHERE username = ?', [phone])
    
    if (!user) {
      // 自动注册
      const result = await db.query(
        'INSERT INTO users (username, nickname) VALUES (?, ?)',
        [phone, `球友_${phone.slice(-4)}`]
      )
      user = await db.queryOne('SELECT * FROM users WHERE id = ?', [result.insertId])
    }

    // 生成 token（实际项目应使用 JWT）
    const token = `token_${user.id}_${Date.now()}`

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.username,
          nickname: user.nickname,
          avatar: user.avatar_url,
          level: user.level
        }
      }
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/auth/register
 * 注册
 */
router.post('/register', async (req, res) => {
  try {
    const { phone, code, password } = req.body

    if (!phone || !code || !password) {
      return res.status(400).json({
        success: false,
        error: '请填写完整信息'
      })
    }

    // 检查手机号是否已注册
    const existingUser = await db.queryOne('SELECT * FROM users WHERE username = ?', [phone])
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '该手机号已注册'
      })
    }

    // TODO: 验证验证码

    // 创建用户
    const result = await db.query(
      'INSERT INTO users (username, nickname) VALUES (?, ?)',
      [phone, `球友_${phone.slice(-4)}`]
    )

    const user = await db.queryOne('SELECT * FROM users WHERE id = ?', [result.insertId])

    // 生成 token
    const token = `token_${user.id}_${Date.now()}`

    res.json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.username,
          nickname: user.nickname,
          avatar: user.avatar_url,
          level: user.level
        }
      }
    })
  } catch (error) {
    console.error('注册失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/auth/info
 * 获取当前用户信息
 */
router.get('/info', async (req, res) => {
  try {
    // TODO: 从 token 解析用户 ID
    const userId = 1 // 示例
    
    const user = await db.queryOne('SELECT * FROM users WHERE id = ?', [userId])
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      })
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        phone: user.username,
        nickname: user.nickname,
        avatar: user.avatar_url,
        level: user.level
      }
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
