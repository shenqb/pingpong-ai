import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// 历史记录存储文件
const HISTORY_FILE = path.join(__dirname, '../../data/history.json')

// 确保数据目录存在
const dataDir = path.join(__dirname, '../../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// 初始化历史记录文件
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify({ records: [] }, null, 2))
}

/**
 * GET /api/history/list
 * 获取分析历史记录
 */
router.get('/list', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'))
    // 按时间倒序排列，返回最近 20 条
    const records = data.records
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20)
    
    res.json({
      success: true,
      data: {
        total: data.records.length,
        records
      }
    })
  } catch (error) {
    console.error('获取历史记录失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/history/save
 * 保存分析记录
 */
router.post('/save', (req, res) => {
  try {
    const { actionType, angle, score, level, filePath } = req.body
    
    if (!actionType || !score) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      })
    }
    
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'))
    
    const newRecord = {
      id: Date.now().toString(),
      actionType,
      angle,
      score,
      level,
      filePath,
      timestamp: new Date().toISOString()
    }
    
    data.records.push(newRecord)
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2))
    
    res.json({
      success: true,
      data: newRecord
    })
  } catch (error) {
    console.error('保存历史记录失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * DELETE /api/history/:id
 * 删除单条记录
 */
router.delete('/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'))
    data.records = data.records.filter(r => r.id !== req.params.id)
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2))
    
    res.json({
      success: true
    })
  } catch (error) {
    console.error('删除记录失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/history/stats
 * 获取统计信息
 */
router.get('/stats', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'))
    const records = data.records
    
    if (records.length === 0) {
      return res.json({
        success: true,
        data: {
          total: 0,
          avgScore: 0,
          bestScore: 0,
          actionStats: {}
        }
      })
    }
    
    // 计算平均分
    const totalScore = records.reduce((sum, r) => sum + (r.score || 0), 0)
    const avgScore = Math.round(totalScore / records.length)
    
    // 计算最高分
    const bestScore = Math.max(...records.map(r => r.score || 0))
    
    // 按动作类型统计
    const actionStats = {}
    records.forEach(r => {
      const type = r.actionType || 'unknown'
      if (!actionStats[type]) {
        actionStats[type] = { count: 0, totalScore: 0 }
      }
      actionStats[type].count++
      actionStats[type].totalScore += (r.score || 0)
    })
    
    // 计算每种动作的平均分
    Object.keys(actionStats).forEach(type => {
      actionStats[type].avgScore = Math.round(
        actionStats[type].totalScore / actionStats[type].count
      )
    })
    
    res.json({
      success: true,
      data: {
        total: records.length,
        avgScore,
        bestScore,
        actionStats
      }
    })
  } catch (error) {
    console.error('获取统计信息失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
