import express from 'express'
import db from '../config/database.js'

const router = express.Router()

/**
 * POST /api/analysis/analyze
 * AI 动作分析
 */
router.post('/analyze', async (req, res) => {
  try {
    const { keypoints, actionType, standardId } = req.body

    if (!keypoints || !actionType) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      })
    }

    // 计算角度
    const angles = calculateAngles(keypoints)
    
    // 获取标准动作
    let standardAction = null
    if (standardId) {
      const standardActions = await db.query(
        'SELECT * FROM standard_actions WHERE id = ?',
        [standardId]
      )
      standardAction = standardActions[0]
    }

    // 对比评分
    let result = {
      score: 0,
      level: '需改进',
      comparisons: {},
      suggestions: []
    }

    if (standardAction) {
      const standardKeypoints = JSON.parse(standardAction.keypoints_json)
      result = compareWithStandard(angles, standardKeypoints, actionType)
    } else {
      // 无标准动作时，返回基础分析
      result = {
        score: calculateBasicScore(angles),
        level: getLevelFromScore(calculateBasicScore(angles)),
        angles,
        suggestions: generateBasicSuggestions(angles)
      }
    }

    res.json({
      success: true,
      data: {
        angles,
        ...result,
        timestamp: new Date().toISOString()
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

/**
 * 计算角度（简化版）
 */
function calculateAngles(keypoints) {
  const angles = {}

  // 肘部角度
  if (keypoints.left_shoulder && keypoints.left_elbow && keypoints.left_wrist) {
    angles.leftElbow = calculateAngle(
      keypoints.left_shoulder,
      keypoints.left_elbow,
      keypoints.left_wrist
    )
  }

  // 膝部角度
  if (keypoints.left_hip && keypoints.left_knee && keypoints.left_ankle) {
    angles.leftKnee = calculateAngle(
      keypoints.left_hip,
      keypoints.left_knee,
      keypoints.left_ankle
    )
  }

  // 躯干角度
  if (keypoints.left_hip && keypoints.right_hip && keypoints.left_shoulder) {
    angles.torso = calculateAngle(
      keypoints.left_hip,
      keypoints.right_hip,
      keypoints.left_shoulder
    )
  }

  return angles
}

/**
 * 计算两点间角度
 */
function calculateAngle(pointA, pointB, pointC) {
  const BA = {
    x: pointA.x - pointB.x,
    y: pointA.y - pointB.y
  }
  const BC = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y
  }

  const dotProduct = BA.x * BC.x + BA.y * BC.y
  const magnitudeBA = Math.sqrt(BA.x * BA.x + BA.y * BA.y)
  const magnitudeBC = Math.sqrt(BC.x * BC.x + BC.y * BC.y)
  
  let angle = Math.acos(dotProduct / (magnitudeBA * magnitudeBC)) * (180 / Math.PI)
  angle = Math.min(Math.max(angle, 0), 180)
  
  return Math.round(angle)
}

/**
 * 对比标准动作
 */
function compareWithStandard(userAngles, standardKeypoints, actionType) {
  const comparisons = {}
  let totalDiff = 0
  let count = 0

  for (const [key, standard] of Object.entries(standardKeypoints)) {
    const userAngle = userAngles[key] || standard.optimal
    const diff = Math.abs(userAngle - standard.optimal)
    
    comparisons[key] = {
      user: userAngle,
      standard: standard.optimal,
      diff: userAngle - standard.optimal,
      score: Math.max(0, 100 - diff * 2)
    }

    totalDiff += diff
    count++
  }

  const score = count > 0 ? Math.round(100 - (totalDiff / count) * 2) : 0
  
  return {
    comparisons,
    score: Math.min(Math.max(score, 0), 100),
    level: getLevelFromScore(score),
    suggestions: generateSuggestions(comparisons)
  }
}

/**
 * 生成建议
 */
function generateSuggestions(comparisons) {
  const suggestions = []
  
  for (const [key, data] of Object.entries(comparisons)) {
    if (Math.abs(data.diff) > 10) {
      suggestions.push({
        joint: getJointName(key),
        issue: data.diff > 0 ? '角度过大' : '角度过小',
        suggestion: getSuggestion(key, data),
        severity: Math.abs(data.diff) > 20 ? 'high' : 'medium'
      })
    }
  }
  
  return suggestions
}

function getSuggestion(key, data) {
  const suggestions = {
    elbow: data.diff < 0 ? '肘部弯曲不足，建议增加弯曲角度' : '肘部弯曲过度，建议减小角度',
    knee: data.diff < 0 ? '膝部弯曲不足，建议降低重心' : '膝部弯曲过度，建议抬高重心',
    torso: data.diff < 0 ? '躯干前倾不足，建议增加前倾' : '躯干前倾过度，建议挺直身体',
    wrist: data.diff < 0 ? '手腕角度不足，建议调整手腕' : '手腕角度过度，建议放松手腕'
  }
  return suggestions[key] || '请教练现场指导'
}

function getJointName(key) {
  const names = {
    leftElbow: '左肘', rightElbow: '右肘',
    leftKnee: '左膝', rightKnee: '右膝',
    torso: '躯干',
    leftWrist: '左手腕', rightWrist: '右手腕'
  }
  return names[key] || key
}

function getLevelFromScore(score) {
  if (score >= 90) return '优秀'
  if (score >= 75) return '良好'
  if (score >= 60) return '及格'
  return '需改进'
}

function calculateBasicScore(angles) {
  // 简化评分：假设理想角度范围
  let score = 100
  const idealRanges = {
    leftElbow: [80, 120],
    leftKnee: [100, 140],
    torso: [5, 30]
  }

  for (const [key, value] of Object.entries(angles)) {
    const range = idealRanges[key]
    if (range) {
      if (value < range[0] || value > range[1]) {
        score -= 10
      }
    }
  }

  return Math.max(score, 0)
}

function generateBasicSuggestions(angles) {
  const suggestions = []
  const idealRanges = {
    leftElbow: { range: [80, 120], suggestion: '调整肘部角度至 80-120 度' },
    leftKnee: { range: [100, 140], suggestion: '调整膝部角度至 100-140 度' },
    torso: { range: [5, 30], suggestion: '调整躯干前倾角度至 5-30 度' }
  }

  for (const [key, value] of Object.entries(angles)) {
    const config = idealRanges[key]
    if (config && (value < config.range[0] || value > config.range[1])) {
      suggestions.push({
        joint: getJointName(key),
        issue: '角度不在理想范围',
        suggestion: config.suggestion,
        severity: 'medium'
      })
    }
  }

  return suggestions
}

export default router
