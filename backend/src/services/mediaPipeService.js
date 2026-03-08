/**
 * MediaPipe Pose 姿态检测服务
 * 用于乒乓球动作分析
 */

/**
 * 使用 MediaPipe Pose 分析姿态
 * @param {string} imagePath - 图片路径
 * @returns {Promise<Object>} 姿态关键点数据
 */
export async function detectPose(imagePath) {
  console.log('MediaPipe Pose 检测:', imagePath)
  
  // MVP 阶段：模拟 MediaPipe 检测结果
  // TODO: 实际集成 @mediapipe/pose
  
  // 模拟 33 个关键点
  const landmarks = []
  for (let i = 0; i < 33; i++) {
    landmarks.push({
      x: 0.5 + (Math.random() - 0.5) * 0.4,
      y: 0.5 + (Math.random() - 0.5) * 0.4,
      z: 0,
      visibility: 0.8 + Math.random() * 0.2
    })
  }
  
  return {
    landmarks,
    confidence: 0.92,
    timestamp: new Date().toISOString()
  }
}

/**
 * 分析乒乓球动作
 * @param {Array} landmarks - 姿态关键点
 * @param {string} actionType - 动作类型 (forehand/backhand/serve)
 * @returns {Object} 动作分析结果
 */
export function analyzeTableTennisAction(landmarks, actionType) {
  // 提取关键点
  const leftShoulder = landmarks[11]
  const rightShoulder = landmarks[12]
  const leftElbow = landmarks[13]
  const rightElbow = landmarks[14]
  const leftWrist = landmarks[15]
  const rightWrist = landmarks[16]
  const leftHip = landmarks[23]
  const rightHip = landmarks[24]
  const leftKnee = landmarks[25]
  const rightKnee = landmarks[26]
  
  // 计算角度和距离
  const angles = calculateAngles(landmarks)
  const distances = calculateDistances(landmarks)
  
  // 根据动作类型评估
  const evaluation = evaluateAction(actionType, angles, distances)
  
  return {
    angles,
    distances,
    evaluation,
    timestamp: new Date().toISOString()
  }
}

/**
 * 计算关键角度
 */
function calculateAngles(landmarks) {
  // 计算肘部角度
  const elbowAngle = calculateAngle(
    landmarks[11], // shoulder
    landmarks[13], // elbow
    landmarks[15]  // wrist
  )
  
  // 计算膝部角度
  const kneeAngle = calculateAngle(
    landmarks[23], // hip
    landmarks[25], // knee
    landmarks[27]  // ankle
  )
  
  // 计算躯干角度
  const torsoAngle = calculateAngle(
    landmarks[11], // left shoulder
    landmarks[23], // left hip
    landmarks[24]  // right hip
  )
  
  return {
    elbow: elbowAngle,
    knee: kneeAngle,
    torso: torsoAngle
  }
}

/**
 * 计算三点角度
 */
function calculateAngle(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }
  
  const dot = ab.x * cb.x + ab.y * cb.y
  const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y)
  const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y)
  
  const cosAngle = dot / (magAB * magCB)
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI
  
  return Math.round(angle)
}

/**
 * 计算关键点距离
 */
function calculateDistances(landmarks) {
  const shoulderWidth = distance(landmarks[11], landmarks[12])
  const hipWidth = distance(landmarks[23], landmarks[24])
  const armLength = distance(landmarks[11], landmarks[15])
  
  return {
    shoulderWidth: shoulderWidth.toFixed(3),
    hipWidth: hipWidth.toFixed(3),
    armLength: armLength.toFixed(3)
  }
}

/**
 * 计算两点距离
 */
function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

/**
 * 评估动作质量
 */
function evaluateAction(actionType, angles, distances) {
  const issues = []
  const strengths = []
  
  // 肘部角度评估（正手攻球理想角度：80-120 度）
  if (angles.elbow < 80) {
    issues.push({
      part: '肘部',
      issue: '肘部弯曲过度',
      severity: 'medium',
      suggestion: '保持肘部自然弯曲，不要过度收紧'
    })
  } else if (angles.elbow > 120) {
    issues.push({
      part: '肘部',
      issue: '肘部伸展过度',
      severity: 'medium',
      suggestion: '适当弯曲肘部，保持放松状态'
    })
  } else {
    strengths.push('肘部角度合理')
  }
  
  // 躯干角度评估
  if (angles.torso > 15) {
    issues.push({
      part: '躯干',
      issue: '身体倾斜过大',
      severity: 'light',
      suggestion: '保持身体正直，重心稳定'
    })
  } else {
    strengths.push('躯干姿态稳定')
  }
  
  // 膝部角度评估
  if (angles.knee < 120) {
    strengths.push('膝盖弯曲良好，重心降低')
  } else {
    issues.push({
      part: '膝部',
      issue: '膝盖过于伸直',
      severity: 'light',
      suggestion: '适当弯曲膝盖，降低重心'
    })
  }
  
  return {
    score: calculateScore(issues, strengths),
    issues,
    strengths
  }
}

/**
 * 计算总分
 */
function calculateScore(issues, strengths) {
  const baseScore = 100
  const issuePenalty = {
    severe: 20,
    medium: 10,
    light: 5
  }
  
  let penalty = 0
  issues.forEach(issue => {
    penalty += issuePenalty[issue.severity] || 5
  })
  
  // 每个优点加 2 分
  const bonus = strengths.length * 2
  
  const score = Math.max(0, Math.min(100, baseScore - penalty + bonus))
  return score
}
