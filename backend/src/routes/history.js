import express from 'express'
import db from '../config/database.js'

const router = express.Router()

/**
 * GET /api/history/list
 * 获取分析历史记录
 */
router.get('/list', async (req, res) => {
  try {
    const { page = 1, limit: limitParam = 20 } = req.query
    const limit = parseInt(limitParam)
    const offset = (parseInt(page) - 1) * limit
    
    const [rows] = await db.getPool().execute(
      'SELECT * FROM analysis_records ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    )
    
    const [[{ total }]] = await db.getPool().execute(`
      SELECT COUNT(*) as total FROM analysis_records
    `)
    
    res.json({
      success: true,
      data: {
        total,
        records: rows
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
router.post('/save', async (req, res) => {
  try {
    const { 
      userId, sessionId, actionType, actionName, angle, 
      score, level, durationMs, keypoints, differences,
      filePath, fileType, fileSize 
    } = req.body
    
    if (!actionType || !score) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      })
    }
    
    const result = await db.query(`
      INSERT INTO analysis_records 
      (user_id, session_id, action_type, action_name, angle, score, level, 
       duration_ms, keypoints_json, differences_json, file_path, file_type, file_size)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId || null,
      sessionId || null,
      actionType,
      actionName || null,
      angle || null,
      score,
      level || null,
      durationMs || null,
      keypoints ? JSON.stringify(keypoints) : null,
      differences ? JSON.stringify(differences) : null,
      filePath || null,
      fileType || null,
      fileSize || null
    ])
    
    const newRecord = await db.queryOne(`
      SELECT * FROM analysis_records WHERE id = ?
    `, [result.insertId])
    
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
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM analysis_records WHERE id = ?', [req.params.id])
    
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
router.get('/stats', async (req, res) => {
  try {
    const [[{ total }]] = await db.getPool().execute(`
      SELECT COUNT(*) as total FROM analysis_records
    `)
    
    if (total === 0) {
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
    
    const [[{ avgScore }]] = await db.getPool().execute(`
      SELECT ROUND(AVG(score)) as avgScore FROM analysis_records WHERE score IS NOT NULL
    `)
    
    const [[{ bestScore }]] = await db.getPool().execute(`
      SELECT MAX(score) as bestScore FROM analysis_records
    `)
    
    const actionStatsRows = await db.query(`
      SELECT 
        action_type,
        COUNT(*) as count,
        ROUND(AVG(score)) as avgScore
      FROM analysis_records 
      WHERE action_type IS NOT NULL
      GROUP BY action_type
    `)
    
    const actionStats = {}
    actionStatsRows.forEach(row => {
      actionStats[row.action_type] = {
        count: row.count,
        avgScore: row.avgScore
      }
    })
    
    res.json({
      success: true,
      data: {
        total,
        avgScore: avgScore || 0,
        bestScore: bestScore || 0,
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
