<template>
  <div class="ios-app upload-page">
    <!-- 导航栏 -->
    <nav class="nav-bar glass-card">
      <button class="nav-back" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#007AFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">动作分析</h1>
      <div class="nav-right"></div>
    </nav>

    <!-- 步骤指示器 -->
    <div class="steps-bar">
      <div class="step-item" :class="{ active: step >= 1 }">
        <div class="step-circle">1</div>
        <div class="step-text">选择动作</div>
      </div>
      <div class="step-line" :class="{ active: step > 1 }"></div>
      <div class="step-item" :class="{ active: step >= 2 }">
        <div class="step-circle">2</div>
        <div class="step-text">选择角度</div>
      </div>
      <div class="step-line" :class="{ active: step > 2 }"></div>
      <div class="step-item" :class="{ active: step >= 3 }">
        <div class="step-circle">3</div>
        <div class="step-text">上传分析</div>
      </div>
    </div>

    <main class="main-content">
      <!-- Step 1: 选择动作 -->
      <section v-if="step === 1" class="section">
        <div class="section-title">选择要分析的动作</div>
        <div class="action-grid">
          <div 
            v-for="action in actions" 
            :key="action.value"
            class="action-item glass-card"
            :class="{ selected: selectedAction === action.value }"
            @click="selectAction(action.value)"
          >
            <div class="action-emoji">{{ action.icon }}</div>
            <div class="action-name">{{ action.name }}</div>
            <div class="action-badge" :class="action.difficulty">{{ action.level }}</div>
            <div v-if="selectedAction === action.value" class="check-icon">✓</div>
          </div>
        </div>
      </section>

      <!-- Step 2: 选择角度 -->
      <section v-if="step === 2" class="section">
        <div class="section-title">选择拍摄角度</div>
        <div class="angle-list">
          <div 
            v-for="angle in angles" 
            :key="angle.value"
            class="angle-item glass-card"
            :class="{ selected: selectedAngle === angle.value }"
            @click="selectAngle(angle.value)"
          >
            <div class="angle-content">
              <div class="angle-name">{{ angle.name }}</div>
              <div class="angle-desc">{{ angle.desc }}</div>
              <div v-if="angle.recommended" class="recommended-badge">推荐</div>
            </div>
            <div v-if="selectedAngle === angle.value" class="check-icon">✓</div>
          </div>
        </div>
      </section>

      <!-- Step 3: 上传 -->
      <section v-if="step === 3" class="section">
        <div class="section-title">上传图片分析</div>
        
        <!-- 拍摄提示 -->
        <div class="tips-card glass-card">
          <div class="tips-title">📸 拍摄技巧</div>
          <div class="tips-grid">
            <div class="tip"><span>📏</span> 距离 2-3 米</div>
            <div class="tip"><span>☀️</span> 光线充足</div>
            <div class="tip"><span>👕</span> 对比色衣服</div>
            <div class="tip"><span>👤</span> 全身入镜</div>
          </div>
        </div>

        <!-- 加载进度 -->
        <div v-if="loadingProgress" class="loading-card glass-card">
          <div class="loading-header">
            <div class="loading-spinner"></div>
            <div class="loading-text">{{ loadingProgress.text }}</div>
          </div>
          <div class="loading-bar">
            <div class="loading-fill" :style="{ width: loadingProgress.percent + '%' }"></div>
          </div>
          <div class="loading-percent">{{ loadingProgress.percent }}%</div>
          <div v-if="loadingProgress.detail" class="loading-detail">{{ loadingProgress.detail }}</div>
        </div>

        <!-- 上传区域 -->
        <div class="upload-area" @click="triggerUpload" :class="{ 'has-preview': previewImage }">
          <template v-if="!previewImage">
            <div class="upload-icon">📷</div>
            <div class="upload-text">点击上传图片</div>
            <div class="upload-hint">支持 JPG、PNG 格式</div>
          </template>
          <template v-else>
            <div class="preview-container" ref="containerRef">
              <img :src="previewImage" class="preview-img" ref="previewRef" @load="onImageLoad" />
              <canvas ref="canvasRef" class="pose-canvas"></canvas>
            </div>
            <button class="change-btn" @click.stop="resetUpload">更换图片</button>
          </template>
        </div>

        <!-- 状态提示 -->
        <div v-if="detectStatus" class="status-toast" :class="statusClass">
          {{ detectStatus }}
        </div>
      </section>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button v-if="step > 1" class="btn btn-secondary" @click="step--">上一步</button>
        <button 
          class="btn btn-primary" 
          :disabled="!canNext"
          @click="nextStep"
        >
          {{ step === 3 ? (analyzing ? '分析中...' : '开始分析') : '下一步' }}
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const step = ref(1)

const actions = [
  { value: 'forehand', name: '正手攻球', icon: '🏓', level: '入门', difficulty: 'easy' },
  { value: 'backhand', name: '反手推挡', icon: '🏓', level: '入门', difficulty: 'easy' },
  { value: 'forehand_loop', name: '正手拉弧圈', icon: '🔥', level: '进阶', difficulty: 'medium' },
  { value: 'backhand_loop', name: '反手拉弧圈', icon: '🔥', level: '进阶', difficulty: 'medium' },
  { value: 'serve', name: '发球', icon: '🎯', level: '入门', difficulty: 'easy' },
  { value: 'flick', name: '挑打', icon: '⚡', level: '高级', difficulty: 'hard' }
]

const angles = [
  { value: 'side', name: '侧面视角', desc: '最适合分析身体姿态和动作轨迹', recommended: true },
  { value: 'front', name: '正面视角', desc: '适合分析左右对称性和重心', recommended: false },
  { value: 'diagonal', name: '斜侧面', desc: '综合视角，平衡各方面分析', recommended: false }
]

const selectedAction = ref('')
const selectedAngle = ref('')
const previewImage = ref(null)
const previewRef = ref(null)
const canvasRef = ref(null)
const containerRef = ref(null)
const analyzing = ref(false)
const detectStatus = ref('')
const detectedLandmarks = ref(null)
const poseDetected = ref(false)
const loadingProgress = ref(null) // 加载进度

let poseInstance = null
let modelReady = false
let timeoutId = null
const TIMEOUT_MS = 60000 // 60秒超时

const canNext = computed(() => {
  if (step.value === 1) return !!selectedAction.value
  if (step.value === 2) return !!selectedAngle.value
  if (step.value === 3) return !!previewImage.value && !analyzing.value && poseDetected.value
  return false
})

const statusClass = computed(() => {
  if (detectStatus.value.includes('成功')) return 'success'
  if (detectStatus.value.includes('失败') || detectStatus.value.includes('超时')) return 'error'
  if (detectStatus.value.includes('不足')) return 'warning'
  return ''
})

const selectAction = (v) => selectedAction.value = v
const selectAngle = (v) => selectedAngle.value = v

const resetUpload = () => {
  previewImage.value = null
  poseDetected.value = false
  detectedLandmarks.value = null
  detectStatus.value = ''
  loadingProgress.value = null
  if (timeoutId) clearTimeout(timeoutId)
}

const nextStep = async () => {
  if (!canNext.value) return
  if (step.value < 3) {
    step.value++
  } else {
    await startAnalysis()
  }
}

const triggerUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) return alert('文件不能超过 10MB')
    const reader = new FileReader()
    reader.onload = (ev) => {
      previewImage.value = ev.target.result
      detectStatus.value = ''
      loadingProgress.value = null
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

// 动态加载 MediaPipe
const loadMediaPipe = async () => {
  loadingProgress.value = { text: '加载 AI 引擎', percent: 0, detail: '初始化...' }
  
  return new Promise((resolve, reject) => {
    // 设置超时
    timeoutId = setTimeout(() => {
      loadingProgress.value = null
      detectStatus.value = '加载超时（60秒），请刷新页面重试'
      reject(new Error('加载超时'))
    }, TIMEOUT_MS)

    const checkProgress = () => {
      if (loadingProgress.value && loadingProgress.value.percent < 90) {
        loadingProgress.value.percent += 10
        loadingProgress.value.detail = `正在加载模型文件... ${loadingProgress.value.percent}%`
      }
    }
    const progressInterval = setInterval(checkProgress, 500)

    // 动态导入
    import('@mediapipe/pose').then(({ Pose }) => {
      clearInterval(progressInterval)
      if (timeoutId) clearTimeout(timeoutId)
      
      loadingProgress.value = { text: '初始化模型', percent: 95, detail: '配置参数...' }
      
      const pose = new Pose({
        locateFile: (file) => `/mediapipe/${file}`
      })
      
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })
      
      pose.onResults((results) => {
        modelReady = true
        handlePoseResults(results)
      })
      
      poseInstance = pose
      loadingProgress.value = { text: '准备就绪', percent: 100, detail: '模型加载完成' }
      
      setTimeout(() => {
        loadingProgress.value = null
        resolve(pose)
      }, 500)
    }).catch(err => {
      clearInterval(progressInterval)
      if (timeoutId) clearTimeout(timeoutId)
      loadingProgress.value = null
      detectStatus.value = 'AI 模型加载失败: ' + err.message
      reject(err)
    })
  })
}

const handlePoseResults = (results) => {
  console.log('检测完成, 关键点:', results.poseLandmarks?.length || 0)
  
  if (results.poseLandmarks && results.poseLandmarks.length > 0) {
    const visibleKeypoints = results.poseLandmarks.filter(lm => lm.visibility > 0.5)
    
    if (visibleKeypoints.length >= 10) {
      const confidence = (results.poseLandmarks[11]?.visibility || 0.9) * 100
      detectStatus.value = `检测成功！置信度 ${confidence.toFixed(1)}%`
      poseDetected.value = true
      detectedLandmarks.value = results.poseLandmarks
      if (canvasRef.value && previewRef.value) {
        drawSkeleton(results.poseLandmarks, canvasRef.value, previewRef.value)
      }
    } else {
      detectStatus.value = '检测到人体但关键点不足，请确保全身入镜'
      poseDetected.value = false
      detectedLandmarks.value = null
    }
  } else {
    detectStatus.value = '未检测到人体姿态，请上传包含人物的图片'
    poseDetected.value = false
    detectedLandmarks.value = null
  }
}

const onImageLoad = async () => {
  if (!previewRef.value) return
  
  detectStatus.value = '正在检测...'
  poseDetected.value = false
  detectedLandmarks.value = null
  
  try {
    if (!poseInstance) {
      await loadMediaPipe()
    }
    
    if (!poseInstance) {
      throw new Error('模型未初始化')
    }
    
    poseInstance.send({ image: previewRef.value })
  } catch (e) {
    console.error('检测失败:', e)
    detectStatus.value = '检测失败: ' + e.message
    poseDetected.value = false
    detectedLandmarks.value = null
  }
}

const drawSkeleton = (landmarks, canvas, img) => {
  const ctx = canvas.getContext('2d')
  // 使用图片的实际显示尺寸，而非原始尺寸
  const displayWidth = img.clientWidth || img.offsetWidth
  const displayHeight = img.clientHeight || img.offsetHeight
  
  canvas.width = displayWidth
  canvas.height = displayHeight
  canvas.style.width = displayWidth + 'px'
  canvas.style.height = displayHeight + 'px'
  
  // 根据显示尺寸计算点位大小
  const pointSize = Math.max(3, Math.min(8, displayWidth / 100))
  const lineWidth = Math.max(2, Math.min(4, displayWidth / 200))
  
  ctx.fillStyle = '#007AFF'
  landmarks.forEach(lm => {
    if (lm.visibility > 0.5) {
      ctx.beginPath()
      ctx.arc(lm.x * displayWidth, lm.y * displayHeight, pointSize, 0, 2 * Math.PI)
      ctx.fill()
    }
  })
  const conns = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]]
  ctx.strokeStyle = '#007AFF'
  ctx.lineWidth = lineWidth
  conns.forEach(([s,e]) => {
    const a = landmarks[s], b = landmarks[e]
    if (a.visibility > 0.5 && b.visibility > 0.5) {
      ctx.beginPath()
      ctx.moveTo(a.x * displayWidth, a.y * displayHeight)
      ctx.lineTo(b.x * displayWidth, b.y * displayHeight)
      ctx.stroke()
    }
  })
}

const startAnalysis = async () => {
  if (!poseDetected.value || !detectedLandmarks.value) {
    detectStatus.value = '请先上传包含人物的图片'
    return
  }

  analyzing.value = true
  detectStatus.value = '正在分析动作...'

  try {
    const keypoints = extractKeypoints(detectedLandmarks.value)
    const angles = calculateAllAngles(keypoints)
    const analysis = analyzeAction(angles, selectedAction.value, keypoints)  // 传入 keypoints
    
    const result = {
      action: selectedAction.value,
      angle: selectedAngle.value,
      score: analysis.score,
      level: analysis.level,
      confidence: analysis.confidence,
      angles: angles,
      keypoints: keypoints,
      analysis: {
        strengths: analysis.strengths,
        issues: analysis.issues
      },
      poseCheck: analysis.poseCheck  // 新增：动作检测结果
    }

    sessionStorage.setItem('analysisResult', JSON.stringify(result))
    router.push('/result')
  } catch (e) {
    detectStatus.value = '分析失败: ' + e.message
  } finally {
    analyzing.value = false
  }
}

const extractKeypoints = (landmarks) => {
  const names = ['nose','left_eye_inner','left_eye','left_eye_outer','right_eye_inner','right_eye','right_eye_outer','left_ear','right_ear','mouth_left','mouth_right','left_shoulder','right_shoulder','left_elbow','right_elbow','left_wrist','right_wrist','left_pinky','right_pinky','left_index','right_index','left_thumb','right_thumb','left_hip','right_hip','left_knee','right_knee','left_ankle','right_ankle','left_heel','right_heel','left_foot_index','right_foot_index']
  const keypoints = {}
  landmarks.forEach((lm, i) => {
    if (lm.visibility > 0.5) keypoints[names[i]] = { x: lm.x, y: lm.y, z: lm.z || 0, visibility: lm.visibility }
  })
  return keypoints
}

const calculateAngle = (a, b, c) => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let angle = Math.abs(radians * 180 / Math.PI)
  if (angle > 180) angle = 360 - angle
  return Math.round(angle)
}

const calculateAllAngles = (kp) => {
  const angles = {}
  if (kp.left_shoulder && kp.left_elbow && kp.left_wrist) angles.leftElbow = calculateAngle(kp.left_shoulder, kp.left_elbow, kp.left_wrist)
  if (kp.right_shoulder && kp.right_elbow && kp.right_wrist) angles.rightElbow = calculateAngle(kp.right_shoulder, kp.right_elbow, kp.right_wrist)
  if (kp.left_hip && kp.left_knee && kp.left_ankle) angles.leftKnee = calculateAngle(kp.left_hip, kp.left_knee, kp.left_ankle)
  if (kp.right_hip && kp.right_knee && kp.right_ankle) angles.rightKnee = calculateAngle(kp.right_hip, kp.right_knee, kp.right_ankle)
  if (kp.left_hip && kp.right_hip && kp.left_shoulder) angles.torso = calculateAngle(kp.left_hip, kp.right_hip, kp.left_shoulder)
  return angles
}

const standardActions = {
  forehand: { name: '正手攻球', angles: { leftElbow: { optimal: 90, range: [70, 110], weight: 1.0 }, rightElbow: { optimal: 85, range: [65, 105], weight: 1.0 }, leftKnee: { optimal: 130, range: [110, 150], weight: 0.8 }, rightKnee: { optimal: 140, range: [120, 160], weight: 0.8 }, torso: { optimal: 10, range: [0, 20], weight: 0.6 } } },
  backhand: { name: '反手推挡', angles: { leftElbow: { optimal: 80, range: [60, 100], weight: 1.0 }, rightElbow: { optimal: 85, range: [65, 105], weight: 1.0 }, leftKnee: { optimal: 140, range: [120, 160], weight: 0.8 }, rightKnee: { optimal: 145, range: [125, 165], weight: 0.8 }, torso: { optimal: 5, range: [0, 15], weight: 0.6 } } },
  forehand_loop: { name: '正手拉弧圈', angles: { leftElbow: { optimal: 100, range: [80, 120], weight: 1.0 }, rightElbow: { optimal: 95, range: [75, 115], weight: 1.0 }, leftKnee: { optimal: 120, range: [100, 140], weight: 0.8 }, rightKnee: { optimal: 130, range: [110, 150], weight: 0.8 }, torso: { optimal: 15, range: [5, 25], weight: 0.6 } } },
  serve: { name: '发球', angles: { leftElbow: { optimal: 70, range: [50, 90], weight: 1.0 }, rightElbow: { optimal: 90, range: [70, 110], weight: 1.0 }, leftKnee: { optimal: 130, range: [110, 150], weight: 0.8 }, rightKnee: { optimal: 140, range: [120, 160], weight: 0.8 }, torso: { optimal: 8, range: [0, 18], weight: 0.6 } } },
  backhand_loop: { name: '反手拉弧圈', angles: { leftElbow: { optimal: 85, range: [65, 105], weight: 1.0 }, rightElbow: { optimal: 90, range: [70, 110], weight: 1.0 }, leftKnee: { optimal: 130, range: [110, 150], weight: 0.8 }, rightKnee: { optimal: 135, range: [115, 155], weight: 0.8 }, torso: { optimal: 10, range: [0, 20], weight: 0.6 } } },
  flick: { name: '挑打', angles: { leftElbow: { optimal: 75, range: [55, 95], weight: 1.0 }, rightElbow: { optimal: 80, range: [60, 100], weight: 1.0 }, leftKnee: { optimal: 135, range: [115, 155], weight: 0.8 }, rightKnee: { optimal: 140, range: [120, 160], weight: 0.8 }, torso: { optimal: 5, range: [0, 15], weight: 0.6 } } }
}

// 检测是否为乒乓球动作姿态
const detectTableTennisPose = (keypoints) => {
  const checks = {
    hasEnoughKeypoints: false,
    isStanding: false,
    hasActiveArmPosition: false,
    hasProperStance: false
  }
  
  const reasons = []
  
  // 1. 检测关键点数量
  const visibleKeypoints = Object.values(keypoints).filter(kp => kp && kp.visibility > 0.5)
  checks.hasEnoughKeypoints = visibleKeypoints.length >= 10
  if (!checks.hasEnoughKeypoints) {
    reasons.push('检测到的身体关键点不足，请确保全身入镜')
  }
  
  // 2. 检测是否站立姿态
  const leftHip = keypoints.left_hip
  const rightHip = keypoints.right_hip
  const leftKnee = keypoints.left_knee
  const rightKnee = keypoints.right_knee
  const leftAnkle = keypoints.left_ankle
  const rightAnkle = keypoints.right_ankle
  
  if (leftHip && rightHip && leftKnee && rightKnee) {
    // 臀部应该高于膝盖，膝盖高于脚踝（站立姿态）
    const hipY = (leftHip.y + rightHip.y) / 2
    const kneeY = (leftKnee.y + rightKnee.y) / 2
    checks.isStanding = hipY < kneeY && kneeY < 0.9 // 膝盖不能太低（蹲着）
    if (!checks.isStanding) {
      reasons.push('请保持站立姿态进行动作')
    }
  } else {
    reasons.push('无法检测腿部姿态')
  }
  
  // 3. 检测手臂是否在运动位置（关键特征）
  const leftShoulder = keypoints.left_shoulder
  const rightShoulder = keypoints.right_shoulder
  const leftElbow = keypoints.left_elbow
  const rightElbow = keypoints.right_elbow
  const leftWrist = keypoints.left_wrist
  const rightWrist = keypoints.right_wrist
  
  if (leftShoulder && rightShoulder && leftElbow && rightElbow) {
    // 手臂不能完全下垂（肘部应该在肩膀和臀部之间的高度）
    const shoulderY = Math.min(leftShoulder.y, rightShoulder.y)
    const hipY = leftHip ? (leftHip.y + (rightHip?.y || leftHip.y)) / 2 : 0.6
    
    const leftArmRaised = leftElbow.y < hipY && leftElbow.y > shoulderY - 0.2
    const rightArmRaised = rightElbow.y < hipY && rightElbow.y > shoulderY - 0.2
    
    // 至少一只手臂抬起（运动姿态）
    checks.hasActiveArmPosition = leftArmRaised || rightArmRaised
    if (!checks.hasActiveArmPosition) {
      reasons.push('手臂姿态不符合乒乓球动作，请确保手臂处于挥拍位置')
    }
  } else {
    reasons.push('无法检测手臂姿态')
    checks.hasActiveArmPosition = false
  }
  
  // 4. 检测身体朝向（侧面视角时，肩膀连线应该有一定倾斜）
  if (leftShoulder && rightShoulder) {
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x)
    const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y)
    
    // 肩膀应该有一定宽度（正对镜头）或有一定倾斜（侧身）
    checks.hasProperStance = shoulderWidth > 0.05 || shoulderTilt > 0.02
    if (!checks.hasProperStance) {
      reasons.push('身体姿态不清晰，请确保侧身或正对镜头')
    }
  }
  
  // 综合判断
  const passed = checks.hasEnoughKeypoints && checks.isStanding
  const confidence = Object.values(checks).filter(Boolean).length / 4
  
  return {
    passed,
    confidence,
    checks,
    reasons: reasons.length > 0 ? reasons : ['姿态符合乒乓球动作特征']
  }
}

// 非线性扣分函数：偏差越大，扣分增长越快
const getAnglePenalty = (diff) => {
  if (diff <= 10) return 0       // 小偏差不扣分
  if (diff <= 20) return 2       // 10-20° 扣 2 分
  if (diff <= 30) return 5       // 20-30° 扣 5 分
  if (diff <= 40) return 10      // 30-40° 扣 10 分
  return 15                       // >40° 封顶扣 15 分
}

const analyzeAction = (angles, actionType, keypoints) => {
  const standard = standardActions[actionType] || standardActions.forehand
  const issues = []
  const strengths = []
  
  // ========== 三级检测机制 ==========
  
  // Level 1: 关键点检测
  const visibleKeypoints = Object.values(keypoints || {}).filter(kp => kp && kp.visibility > 0.5)
  if (visibleKeypoints.length < 8) {
    return { 
      score: 30, 
      level: '待提高', 
      confidence: 0.3, 
      strengths: [], 
      issues: [{ joint: '关键点检测', userAngle: 0, optimal: 0, diff: 0, severity: 'high', suggestion: '检测到的身体部位不足，请确保全身入镜、光线充足' }],
      poseCheck: { passed: false, reasons: ['检测到的身体关键点不足'] }
    }
  }
  
  // Level 2: 动作特异性检测
  const poseCheck = detectTableTennisPose(keypoints)
  if (!poseCheck.passed) {
    return { 
      score: 35, 
      level: '待提高', 
      confidence: poseCheck.confidence, 
      strengths: [], 
      issues: [{ joint: '动作识别', userAngle: 0, optimal: 0, diff: 0, severity: 'high', suggestion: poseCheck.reasons.join('；') }],
      poseCheck
    }
  }
  
  // ========== Level 3: 动作质量评分 ==========
  
  let accuracyScore = 100  // 准确度得分
  let fluencyScore = 100   // 流畅度得分
  let matchScore = 100     // 匹配度得分
  let confidence = 0.85 + poseCheck.confidence * 0.1
  
  const angleKeys = Object.keys(angles)
  const totalAngles = angleKeys.length
  
  // 计算各关节得分
  for (const [key, value] of Object.entries(angles)) {
    const std = standard.angles[key]
    if (!std) continue
    
    const weight = std.weight || 1.0
    
    if (value >= std.range[0] && value <= std.range[1]) {
      // 在标准范围内，完美！
      strengths.push({ joint: getJointName(key), message: `角度 ${value}° 处于标准范围 ${std.range[0]}°-${std.range[1]}°` })
    } else {
      // 超出范围，计算偏差
      const diff = value < std.range[0] ? std.range[0] - value : value - std.range[1]
      const penalty = getAnglePenalty(diff) * weight
      
      accuracyScore -= penalty
      
      const severity = diff > 30 ? 'high' : diff > 15 ? 'medium' : 'light'
      issues.push({ 
        joint: getJointName(key), 
        userAngle: value, 
        optimal: std.optimal, 
        diff: Math.round(value - std.optimal), 
        severity, 
        suggestion: getSuggestion(key, value, std.optimal) 
      })
    }
  }
  
  // 流畅度评分：基于关键点可见性
  const detectedRatio = totalAngles / 5
  fluencyScore = 70 + detectedRatio * 30
  
  // 匹配度评分：基于置信度
  matchScore = Math.round(confidence * 100)
  
  // 综合评分：新公式（通过检测后才评分）
  const baseScore = 40  // 通过检测的基础分
  const accuracyBonus = Math.max(0, (accuracyScore - 60) * 0.35)  // 准确度贡献 35%
  const fluencyBonus = Math.max(0, (fluencyScore - 60) * 0.25)   // 流畅度贡献 25%
  const matchBonus = Math.max(0, (matchScore - 60) * 0.25)       // 匹配度贡献 25%
  const poseBonus = poseCheck.confidence * 10  // 动作特征加分 0-10 分
  
  const finalScore = Math.round(baseScore + accuracyBonus + fluencyBonus + matchBonus + poseBonus)
  
  // 确保分数在合理范围
  const score = Math.max(40, Math.min(100, finalScore))
  
  // 添加动作检测通过的提示
  if (strengths.length === 0) {
    strengths.push({ joint: '动作识别', message: '检测到乒乓球动作姿态' })
  }
  
  return { 
    score, 
    level: getLevelFromScore(score), 
    confidence, 
    strengths,
    issues,
    poseCheck: { ...poseCheck, passed: true }
  }
}

const getJointName = (key) => ({ leftElbow: '左肘', rightElbow: '右肘', leftKnee: '左膝', rightKnee: '右膝', torso: '躯干' }[key] || key)
const getLevelFromScore = (score) => score >= 90 ? '优秀' : score >= 80 ? '良好' : score >= 70 ? '中等' : score >= 60 ? '及格' : '待提高'
const getSuggestion = (key, value, optimal) => {
  const diff = value - optimal
  const s = { leftElbow: diff < 0 ? '左肘弯曲不足' : '左肘弯曲过度', rightElbow: diff < 0 ? '右肘弯曲不足' : '右肘弯曲过度', leftKnee: diff < 0 ? '左膝弯曲不足' : '左膝弯曲过度', rightKnee: diff < 0 ? '右膝弯曲不足' : '右膝弯曲过度', torso: diff < 0 ? '躯干前倾不足' : '躯干前倾过度' }
  return s[key] || '请教练现场指导'
}

// 页面加载时检查 URL 参数
onMounted(() => {
  // 从 URL 参数获取默认动作
  const actionParam = route.query.action
  if (actionParam && actions.find(a => a.value === actionParam)) {
    selectedAction.value = actionParam
    step.value = 2 // 跳到第二步
  }
})

// 页面卸载时清理
onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<style scoped>
.ios-app {
  min-height: 100vh;
  background: linear-gradient(180deg, #F2F5F9 0%, #FFFFFF 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  padding-bottom: 40px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(env(safe-area-inset-top, 44px) + 12px);
  background: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.nav-back, .share-btn { background: none; border: none; padding: 8px; cursor: pointer; }
.nav-title { font-size: 17px; font-weight: 600; color: #1A1A1A; }

.steps-bar { display: flex; align-items: center; justify-content: center; padding: 24px 16px; gap: 8px; }
.step-item { display: flex; flex-direction: column; align-items: center; gap: 6px; opacity: 0.4; }
.step-item.active { opacity: 1; }
.step-circle { width: 28px; height: 28px; border-radius: 50%; background: #E5E5EA; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: #8E8E93; }
.step-item.active .step-circle { background: #007AFF; color: white; }
.step-text { font-size: 12px; color: #8E8E93; }
.step-line { width: 32px; height: 2px; background: #E5E5EA; margin-bottom: 18px; }
.step-line.active { background: #007AFF; }

.main-content { padding: 0 16px; }
.section-title { font-size: 20px; font-weight: 600; color: #1A1A1A; margin-bottom: 16px; }

.action-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.action-item { padding: 20px; border-radius: 16px; text-align: center; cursor: pointer; transition: all 0.2s; position: relative; }
.action-item:active { transform: scale(0.98); }
.action-item.selected { background: rgba(0, 122, 255, 0.08); border-color: #007AFF; }
.action-emoji { font-size: 36px; margin-bottom: 8px; }
.action-name { font-size: 15px; font-weight: 600; color: #1A1A1A; margin-bottom: 6px; }
.action-badge { display: inline-block; font-size: 12px; padding: 3px 10px; border-radius: 10px; }
.action-badge.easy { background: rgba(52, 199, 89, 0.12); color: #34C759; }
.action-badge.medium { background: rgba(255, 149, 0, 0.12); color: #FF9500; }
.action-badge.hard { background: rgba(255, 59, 48, 0.12); color: #FF3B30; }
.check-icon { position: absolute; top: 10px; right: 10px; width: 22px; height: 22px; background: #007AFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; }

.angle-list { display: flex; flex-direction: column; gap: 12px; }
.angle-item { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-radius: 14px; cursor: pointer; transition: all 0.2s; position: relative; }
.angle-item:active { transform: scale(0.99); }
.angle-item.selected { background: rgba(0, 122, 255, 0.08); border-color: #007AFF; }
.angle-name { font-size: 16px; font-weight: 600; color: #1A1A1A; margin-bottom: 4px; }
.angle-desc { font-size: 13px; color: #8E8E93; }
.recommended-badge { display: inline-block; font-size: 11px; background: #007AFF; color: white; padding: 2px 8px; border-radius: 6px; margin-top: 6px; }

.tips-card { padding: 16px; border-radius: 14px; margin-bottom: 16px; }
.tips-title { font-size: 15px; font-weight: 600; color: #1A1A1A; margin-bottom: 12px; }
.tips-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.tip { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #8E8E93; }

/* 加载进度卡片 */
.loading-card {
  padding: 20px;
  border-radius: 14px;
  margin-bottom: 16px;
  text-align: center;
}

.loading-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #E5E5EA;
  border-top-color: #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
}

.loading-bar {
  height: 8px;
  background: #E5E5EA;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.loading-fill {
  height: 100%;
  background: linear-gradient(90deg, #007AFF, #5856D6);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.loading-percent {
  font-size: 14px;
  font-weight: 600;
  color: #007AFF;
  margin-bottom: 8px;
}

.loading-detail {
  font-size: 13px;
  color: #8E8E93;
}

.upload-area {
  background: white;
  border: 2px dashed #E5E5EA;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:active { border-color: #007AFF; }
.upload-area.has-preview { border-style: solid; border-color: #007AFF; padding: 16px; }
.upload-icon { font-size: 48px; margin-bottom: 12px; }
.upload-text { font-size: 16px; font-weight: 600; color: #1A1A1A; margin-bottom: 4px; }
.upload-hint { font-size: 13px; color: #8E8E93; }
.preview-container {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
}

.preview-img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
}

.pose-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  border-radius: 12px;
}

.change-btn {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 12px;
}

.status-toast { margin-top: 12px; padding: 12px 16px; background: rgba(0, 0, 0, 0.05); border-radius: 10px; font-size: 14px; color: #8E8E93; }
.status-toast.success { background: rgba(52, 199, 89, 0.1); color: #34C759; }
.status-toast.error { background: rgba(255, 59, 48, 0.1); color: #FF3B30; }
.status-toast.warning { background: rgba(255, 149, 0, 0.1); color: #FF9500; }

.action-buttons { display: flex; gap: 12px; margin-top: 32px; }
.btn { flex: 1; padding: 16px; border-radius: 14px; font-size: 17px; font-weight: 600; cursor: pointer; border: none; }
.btn-primary { background: #007AFF; color: white; }
.btn-primary:disabled { opacity: 0.5; }
.btn-primary:not(:disabled):active { transform: scale(0.98); }
.btn-secondary { background: rgba(0, 0, 0, 0.05); color: #007AFF; }
.btn-secondary:active { transform: scale(0.98); }
</style>