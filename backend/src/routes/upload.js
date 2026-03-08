import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { analyzePose } from '../services/analysis.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

/**
 * POST /api/upload/file
 * 上传文件
 */
router.post('/file', (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未找到上传的文件' })
    }
    
    const fileUrl = `/uploads/${req.file.filename}`
    
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: fileUrl,
        fullPath: path.join(__dirname, '../../uploads', req.file.filename)
      }
    })
  } catch (error) {
    console.error('上传失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/upload/analyze
 * 上传并分析文件
 */
router.post('/analyze', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未找到上传的文件' })
    }
    
    const { actionType = 'forehand', angle = 'side' } = req.body
    const filePath = path.join(__dirname, '../../uploads', req.file.filename)
    
    console.log('开始分析:', { 
      filename: req.file.filename,
      actionType, 
      angle 
    })
    
    // 调用分析服务
    const analysisResult = await analyzePose(filePath, actionType, angle)
    
    // 保存到历史记录
    try {
      const historyData = {
        actionType,
        angle,
        score: analysisResult.score,
        level: analysisResult.level,
        filePath: `/uploads/${req.file.filename}`
      }
      
      // 异步保存，不阻塞响应
      fetch('http://localhost:8000/api/history/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyData)
      }).catch(err => console.error('保存历史记录失败:', err))
    } catch (err) {
      console.error('保存历史记录异常:', err)
    }
    
    res.json({
      success: true,
      data: {
        file: {
          filename: req.file.filename,
          path: `/uploads/${req.file.filename}`
        },
        analysis: analysisResult
      }
    })
  } catch (error) {
    console.error('分析失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
