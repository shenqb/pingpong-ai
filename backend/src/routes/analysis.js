import express from 'express'
import { analyzePose } from '../services/analysis.js'

const router = express.Router()

/**
 * POST /api/analysis/analyze
 * 分析上传的动作图片/视频
 */
router.post('/analyze', async (req, res) => {
  try {
    const { filePath, actionType, angle } = req.body
    
    if (!filePath) {
      return res.status(400).json({ error: '缺少文件路径' })
    }
    
    // 调用姿态分析服务
    const result = await analyzePose(filePath, actionType, angle)
    
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('分析失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/analysis/history
 * 获取用户分析历史
 */
router.get('/history', (req, res) => {
  // TODO: 从数据库获取历史记录
  res.json({
    success: true,
    data: []
  })
})

export default router
