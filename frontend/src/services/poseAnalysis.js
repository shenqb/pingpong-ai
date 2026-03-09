import { Pose } from '@mediapipe/pose'

/**
 * AI 动作分析服务 - 基于 MediaPipe Pose 开源模型
 */
class PoseAnalysisService {
  constructor() {
    this.pose = null
    this.initialized = false
  }

  /**
   * 初始化 MediaPipe Pose
   */
  async init() {
    if (this.initialized) return

    this.pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      }
    })

    this.pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })

    this.initialized = true
    console.log('✅ MediaPipe Pose 初始化完成')
  }

  /**
   * 分析单帧图像
   */
  async analyzeFrame(imageElement) {
    if (!this.pose) {
      await this.init()
    }

    const results = await this.pose.send({ image: imageElement })
    
    if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
      return null
    }

    return this.extractKeypoints(results.poseLandmarks)
  }

  /**
   * 提取关键点位
   */
  extractKeypoints(landmarks) {
    const keypoints = {}
    
    // 33 个关键点位
    const keypointNames = [
      'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
      'right_eye_inner', 'right_eye', 'right_eye_outer',
      'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
      'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
      'left_index', 'right_index', 'left_thumb', 'right_thumb',
      'left_hip', 'right_hip', 'left_knee', 'right_knee',
      'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
      'left_foot_index', 'right_foot_index'
    ]

    landmarks.forEach((landmark, index) => {
      if (landmark.visibility > 0.5) {
        keypoints[keypointNames[index]] = {
          x: landmark.x,
          y: landmark.y,
          z: landmark.z,
          visibility: landmark.visibility
        }
      }
    })

    return keypoints
  }

  /**
   * 计算关节角度
   */
  calculateAngle(pointA, pointB, pointC) {
    // 计算向量 BA 和 BC
    const BA = {
      x: pointA.x - pointB.x,
      y: pointA.y - pointB.y
    }
    const BC = {
      x: pointC.x - pointB.x,
      y: pointC.y - pointB.y
    }

    // 计算点积
    const dotProduct = BA.x * BC.x + BA.y * BC.y
    
    // 计算向量模长
    const magnitudeBA = Math.sqrt(BA.x * BA.x + BA.y * BA.y)
    const magnitudeBC = Math.sqrt(BC.x * BC.x + BC.y * BC.y)
    
    // 计算角度（弧度转角度）
    let angle = Math.acos(dotProduct / (magnitudeBA * magnitudeBC)) * (180 / Math.PI)
    
    // 确保角度在 0-180 之间
    angle = Math.min(Math.max(angle, 0), 180)
    
    return Math.round(angle)
  }

  /**
   * 计算所有关键角度
   */
  calculateAllAngles(keypoints) {
    const angles = {}

    try {
      // 肘部角度（左）
      if (keypoints.left_shoulder && keypoints.left_elbow && keypoints.left_wrist) {
        angles.leftElbow = this.calculateAngle(
          keypoints.left_shoulder,
          keypoints.left_elbow,
          keypoints.left_wrist
        )
      }

      // 肘部角度（右）
      if (keypoints.right_shoulder && keypoints.right_elbow && keypoints.right_wrist) {
        angles.rightElbow = this.calculateAngle(
          keypoints.right_shoulder,
          keypoints.right_elbow,
          keypoints.right_wrist
        )
      }

      // 膝部角度（左）
      if (keypoints.left_hip && keypoints.left_knee && keypoints.left_ankle) {
        angles.leftKnee = this.calculateAngle(
          keypoints.left_hip,
          keypoints.left_knee,
          keypoints.left_ankle
        )
      }

      // 膝部角度（右）
      if (keypoints.right_hip && keypoints.right_knee && keypoints.right_ankle) {
        angles.rightKnee = this.calculateAngle(
          keypoints.right_hip,
          keypoints.right_knee,
          keypoints.right_ankle
        )
      }

      // 躯干角度
      if (keypoints.left_hip && keypoints.right_hip && keypoints.left_shoulder) {
        angles.torso = this.calculateAngle(
          keypoints.left_hip,
          keypoints.right_hip,
          keypoints.left_shoulder
        )
      }

      // 手腕角度（简化）
      if (keypoints.left_elbow && keypoints.left_wrist && keypoints.left_index) {
        angles.leftWrist = this.calculateAngle(
          keypoints.left_elbow,
          keypoints.left_wrist,
          keypoints.left_index
        )
      }
    } catch (error) {
      console.error('计算角度失败:', error)
    }

    return angles
  }

  /**
   * 对比动作并评分
   */
  compareWithStandard(userAngles, standardKeypoints) {
    const comparisons = {}
    let totalDiff = 0
    let count = 0

    // 对比各个角度
    const angleMappings = {
      elbow: ['leftElbow', 'rightElbow'],
      knee: ['leftKnee', 'rightKnee'],
      torso: ['torso'],
      wrist: ['leftWrist', 'rightWrist']
    }

    for (const [angleType, keys] of Object.entries(angleMappings)) {
      const standardAngles = standardKeypoints[angleType]
      if (!standardAngles) continue

      for (const key of keys) {
        const userAngle = userAngles[key]
        if (userAngle === undefined) continue

        const optimal = standardAngles.optimal
        const diff = Math.abs(userAngle - optimal)
        
        comparisons[key] = {
          user: userAngle,
          standard: optimal,
          diff: userAngle - optimal,
          score: Math.max(0, 100 - diff * 2)
        }

        totalDiff += diff
        count++
      }
    }

    // 计算总分
    const score = count > 0 ? Math.round(100 - (totalDiff / count) * 2) : 0
    
    return {
      comparisons,
      score: Math.min(Math.max(score, 0), 100),
      level: this.getLevelFromScore(score)
    }
  }

  /**
   * 根据分数获取等级
   */
  getLevelFromScore(score) {
    if (score >= 90) return '优秀'
    if (score >= 75) return '良好'
    if (score >= 60) return '及格'
    return '需改进'
  }

  /**
   * 生成纠正建议
   */
  generateSuggestions(comparisons) {
    const suggestions = []

    for (const [key, data] of Object.entries(comparisons)) {
      if (Math.abs(data.diff) > 10) {
        const suggestion = this.getSuggestionForKey(key, data)
        if (suggestion) {
          suggestions.push({
            joint: this.getJointName(key),
            issue: data.diff > 0 ? '角度过大' : '角度过小',
            suggestion,
            severity: Math.abs(data.diff) > 20 ? 'high' : 'medium'
          })
        }
      }
    }

    return suggestions
  }

  getSuggestionForKey(key, data) {
    const suggestions = {
      leftElbow: data.diff < 0 ? '左肘弯曲不足，建议增加弯曲角度' : '左肘弯曲过度，建议减小角度',
      rightElbow: data.diff < 0 ? '右肘弯曲不足，建议增加弯曲角度' : '右肘弯曲过度，建议减小角度',
      leftKnee: data.diff < 0 ? '左膝弯曲不足，建议降低重心' : '左膝弯曲过度，建议抬高重心',
      rightKnee: data.diff < 0 ? '右膝弯曲不足，建议降低重心' : '右膝弯曲过度，建议抬高重心',
      torso: data.diff < 0 ? '躯干前倾不足，建议增加前倾' : '躯干前倾过度，建议挺直身体',
      leftWrist: data.diff < 0 ? '左手腕角度不足，建议调整手腕' : '左手腕角度过度，建议放松手腕',
      rightWrist: data.diff < 0 ? '右手腕角度不足，建议调整手腕' : '右手腕角度过度，建议放松手腕'
    }
    return suggestions[key] || '请教练现场指导'
  }

  getJointName(key) {
    const names = {
      leftElbow: '左肘',
      rightElbow: '右肘',
      leftKnee: '左膝',
      rightKnee: '右膝',
      torso: '躯干',
      leftWrist: '左手腕',
      rightWrist: '右手腕'
    }
    return names[key] || key
  }
}

// 导出单例
export const poseAnalysisService = new PoseAnalysisService()
export default poseAnalysisService
