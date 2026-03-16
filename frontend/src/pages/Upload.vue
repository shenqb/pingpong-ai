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

        <!-- 上传区域 -->
        <div class="upload-area" @click="triggerUpload" :class="{ 'has-preview': previewImage }">
          <template v-if="!previewImage">
            <div class="upload-icon">📷</div>
            <div class="upload-text">点击上传图片</div>
            <div class="upload-hint">支持 JPG、PNG 格式</div>
          </template>
          <template v-else>
            <img :src="previewImage" class="preview-img" ref="previewRef" @load="onImageLoad" />
            <canvas ref="canvasRef" class="pose-canvas"></canvas>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Pose } from '@mediapipe/pose'

const router = useRouter()
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
const analyzing = ref(false)
const detectStatus = ref('')
const detectedLandmarks = ref(null) // 保存检测到的关键点
const poseDetected = ref(false) // 是否检测到人体

let poseInstance = null
let poseInitialized = false
let modelReady = false // 模型是否已准备好

const canNext = computed(() => {
  if (step.value === 1) return !!selectedAction.value
  if (step.value === 2) return !!selectedAngle.value
  if (step.value === 3) return !!previewImage.value && !analyzing.value && poseDetected.value
  return false
})

const statusClass = computed(() => {
  if (detectStatus.value.includes('成功')) return 'success'
  if (detectStatus.value.includes('失败') || detectStatus.value.includes('未检测')) return 'error'
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
      detectStatus.value = '正在检测...'
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

const initPose = () => {
  if (poseInstance && modelReady) return Promise.resolve(poseInstance)
  
  detectStatus.value = '正在加载 AI 模型...'
  
  return new Promise((resolve, reject) => {
    try {
      // 如果实例已存在但模型未准备好，等待
      if (poseInstance && !modelReady) {
        const checkReady = setInterval(() => {
          if (modelReady) {
            clearInterval(checkReady)
            resolve(poseInstance)
          }
        }, 100)
        return
      }
      
      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      })
      
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })
      
      // 设置回调
      pose.onResults((results) => {
        console.log('MediaPipe 检测完成, 关键点:', results.poseLandmarks?.length || 0)
        
        // 第一次收到结果，说明模型已加载
        if (!modelReady) {
          modelReady = true
          console.log('MediaPipe 模型已就绪')
        }
        
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
      })
      
      poseInstance = pose
      poseInitialized = true
      
      // 创建一个空白的canvas来初始化模型
      detectStatus.value = '正在初始化模型...'
      const testCanvas = document.createElement('canvas')
      testCanvas.width = 100
      testCanvas.height = 100
      const ctx = testCanvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, 100, 100)
      
      // 发送测试图片来触发模型加载
      pose.send({ image: testCanvas })
      
      // 等待模型准备好
      const checkReady = setInterval(() => {
        if (modelReady) {
          clearInterval(checkReady)
          resolve(pose)
        }
      }, 100)
      
      // 超时保护
      setTimeout(() => {
        if (!modelReady) {
          clearInterval(checkReady)
          modelReady = true // 强制认为已准备好
          resolve(pose)
        }
      }, 5000)
      
    } catch (e) {
      console.error('初始化失败:', e)
      detectStatus.value = 'AI 模型加载失败: ' + e.message
      reject(e)
    }
  })
}

const onImageLoad = async () => {
  if (!previewRef.value) return
  
  detectStatus.value = '正在检测人体姿态...'
  poseDetected.value = false
  detectedLandmarks.value = null
  
  try {
    const pose = await initPose()
    console.log('开始检测...')
    pose.send({ image: previewRef.value })
  } catch (e) {
    console.error('检测失败:', e)
    detectStatus.value = '检测失败: ' + e.message
    poseDetected.value = false
    detectedLandmarks.value = null
  }
}

const drawSkeleton = (landmarks, canvas, img) => {
  const ctx = canvas.getContext('2d')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  ctx.fillStyle = '#007AFF'
  landmarks.forEach(lm => {
    if (lm.visibility > 0.5) {
      ctx.beginPath()
      ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI)
      ctx.fill()
    }
  })
  const conns = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]]
  ctx.strokeStyle = '#007AFF'
  ctx.lineWidth = 2
  conns.forEach(([s,e]) => {
    const a = landmarks[s], b = landmarks[e]
    if (a.visibility > 0.5 && b.visibility > 0.5) {
      ctx.beginPath()
      ctx.moveTo(a.x * canvas.width, a.y * canvas.height)
      ctx.lineTo(b.x * canvas.width, b.y * canvas.height)
      ctx.stroke()
    }
  })
}

const startAnalysis = async () => {
  // 验证是否检测到人体
  if (!poseDetected.value || !detectedLandmarks.value) {
    detectStatus.value = '请先上传包含人物的图片'
    return
  }

  analyzing.value = true
  detectStatus.value = '正在分析动作...'

  try {
    // 提取关键点
    const keypoints = extractKeypoints(detectedLandmarks.value)
    
    // 计算角度
    const angles = calculateAllAngles(keypoints)
    
    // 分析动作
    const analysis = analyzeAction(angles, selectedAction.value)
    
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
      }
    }

    sessionStorage.setItem('analysisResult', JSON.stringify(result))
    router.push('/result')
  } catch (e) {
    detectStatus.value = '分析失败: ' + e.message
  } finally {
    analyzing.value = false
  }
}

// 提取关键点
const extractKeypoints = (landmarks) => {
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
  
  const keypoints = {}
  landmarks.forEach((lm, i) => {
    if (lm.visibility > 0.5) {
      keypoints[keypointNames[i]] = { x: lm.x, y: lm.y, z: lm.z || 0, visibility: lm.visibility }
    }
  })
  return keypoints
}

// 计算角度
const calculateAngle = (a, b, c) => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let angle = Math.abs(radians * 180 / Math.PI)
  if (angle > 180) angle = 360 - angle
  return Math.round(angle)
}

// 计算所有角度
const calculateAllAngles = (kp) => {
  const angles = {}
  
  if (kp.left_shoulder && kp.left_elbow && kp.left_wrist) {
    angles.leftElbow = calculateAngle(kp.left_shoulder, kp.left_elbow, kp.left_wrist)
  }
  if (kp.right_shoulder && kp.right_elbow && kp.right_wrist) {
    angles.rightElbow = calculateAngle(kp.right_shoulder, kp.right_elbow, kp.right_wrist)
  }
  if (kp.left_hip && kp.left_knee && kp.left_ankle) {
    angles.leftKnee = calculateAngle(kp.left_hip, kp.left_knee, kp.left_ankle)
  }
  if (kp.right_hip && kp.right_knee && kp.right_ankle) {
    angles.rightKnee = calculateAngle(kp.right_hip, kp.right_knee, kp.right_ankle)
  }
  if (kp.left_hip && kp.right_hip && kp.left_shoulder) {
    angles.torso = calculateAngle(kp.left_hip, kp.right_hip, kp.left_shoulder)
  }
  
  return angles
}

// 标准动作数据
const standardActions = {
  forehand: {
    name: '正手攻球',
    angles: {
      leftElbow: { optimal: 90, range: [70, 110] },
      rightElbow: { optimal: 85, range: [65, 105] },
      leftKnee: { optimal: 130, range: [110, 150] },
      rightKnee: { optimal: 140, range: [120, 160] },
      torso: { optimal: 10, range: [0, 20] }
    }
  },
  backhand: {
    name: '反手推挡',
    angles: {
      leftElbow: { optimal: 80, range: [60, 100] },
      rightElbow: { optimal: 85, range: [65, 105] },
      leftKnee: { optimal: 140, range: [120, 160] },
      rightKnee: { optimal: 145, range: [125, 165] },
      torso: { optimal: 5, range: [0, 15] }
    }
  },
  forehand_loop: {
    name: '正手拉弧圈',
    angles: {
      leftElbow: { optimal: 100, range: [80, 120] },
      rightElbow: { optimal: 95, range: [75, 115] },
      leftKnee: { optimal: 120, range: [100, 140] },
      rightKnee: { optimal: 130, range: [110, 150] },
      torso: { optimal: 15, range: [5, 25] }
    }
  },
  serve: {
    name: '发球',
    angles: {
      leftElbow: { optimal: 70, range: [50, 90] },
      rightElbow: { optimal: 90, range: [70, 110] },
      leftKnee: { optimal: 130, range: [110, 150] },
      rightKnee: { optimal: 140, range: [120, 160] },
      torso: { optimal: 8, range: [0, 18] }
    }
  },
  backhand_loop: {
    name: '反手拉弧圈',
    angles: {
      leftElbow: { optimal: 85, range: [65, 105] },
      rightElbow: { optimal: 90, range: [70, 110] },
      leftKnee: { optimal: 130, range: [110, 150] },
      rightKnee: { optimal: 135, range: [115, 155] },
      torso: { optimal: 10, range: [0, 20] }
    }
  },
  flick: {
    name: '挑打',
    angles: {
      leftElbow: { optimal: 75, range: [55, 95] },
      rightElbow: { optimal: 80, range: [60, 100] },
      leftKnee: { optimal: 135, range: [115, 155] },
      rightKnee: { optimal: 140, range: [120, 160] },
      torso: { optimal: 5, range: [0, 15] }
    }
  }
}

// 分析动作
const analyzeAction = (angles, actionType) => {
  const standard = standardActions[actionType] || standardActions.forehand
  const issues = []
  const strengths = []
  let totalScore = 100
  let confidence = 0.9

  for (const [key, value] of Object.entries(angles)) {
    const std = standard.angles[key]
    if (!std) continue

    confidence = Math.min(confidence, 0.95)
    
    if (value >= std.range[0] && value <= std.range[1]) {
      strengths.push({
        joint: getJointName(key),
        message: `角度 ${value}° 处于标准范围`
      })
    } else {
      const diff = value < std.range[0] ? std.range[0] - value : value - std.range[1]
      const severity = diff > 15 ? 'high' : 'medium'
      
      issues.push({
        joint: getJointName(key),
        userAngle: value,
        optimal: std.optimal,
        diff: value - std.optimal,
        severity,
        suggestion: getSuggestion(key, value, std.optimal)
      })
      
      totalScore -= diff * 1.5
    }
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(totalScore))),
    level: getLevelFromScore(totalScore),
    confidence,
    strengths,
    issues
  }
}

const getJointName = (key) => {
  const names = { leftElbow: '左肘', rightElbow: '右肘', leftKnee: '左膝', rightKnee: '右膝', torso: '躯干' }
  return names[key] || key
}

const getLevelFromScore = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '待提高'
}

const getSuggestion = (key, value, optimal) => {
  const diff = value - optimal
  const suggestions = {
    leftElbow: diff < 0 ? '左肘弯曲不足，建议增加弯曲角度' : '左肘弯曲过度，建议减小角度',
    rightElbow: diff < 0 ? '右肘弯曲不足，建议增加弯曲角度' : '右肘弯曲过度，建议减小角度',
    leftKnee: diff < 0 ? '左膝弯曲不足，建议降低重心' : '左膝弯曲过度，建议抬高重心',
    rightKnee: diff < 0 ? '右膝弯曲不足，建议降低重心' : '右膝弯曲过度，建议抬高重心',
    torso: diff < 0 ? '躯干前倾不足，建议增加前倾' : '躯干前倾过度，建议挺直身体'
  }
  return suggestions[key] || '请教练现场指导'
}

// 页面加载时预初始化 MediaPipe（后台加载，不阻塞UI）
onMounted(() => {
  // 延迟加载，不阻塞页面渲染
  setTimeout(() => {
    initPose().then(() => {
      console.log('MediaPipe 预加载完成')
    }).catch(e => {
      console.error('MediaPipe 预加载失败:', e)
    })
  }, 1000)
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

/* 导航栏 */
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

.nav-back {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #1A1A1A;
}

.nav-right {
  width: 40px;
}

/* 步骤条 */
.steps-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  gap: 8px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: 0.4;
}

.step-item.active {
  opacity: 1;
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #E5E5EA;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #8E8E93;
}

.step-item.active .step-circle {
  background: #007AFF;
  color: white;
}

.step-text {
  font-size: 12px;
  color: #8E8E93;
}

.step-line {
  width: 32px;
  height: 2px;
  background: #E5E5EA;
  margin-bottom: 18px;
}

.step-line.active {
  background: #007AFF;
}

/* 主内容 */
.main-content {
  padding: 0 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16px;
}

/* 动作选择 */
.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-item {
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.action-item:active {
  transform: scale(0.98);
}

.action-item.selected {
  background: rgba(0, 122, 255, 0.08);
  border-color: #007AFF;
}

.action-emoji {
  font-size: 36px;
  margin-bottom: 8px;
}

.action-name {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 6px;
}

.action-badge {
  display: inline-block;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 10px;
}

.action-badge.easy { background: rgba(52, 199, 89, 0.12); color: #34C759; }
.action-badge.medium { background: rgba(255, 149, 0, 0.12); color: #FF9500; }
.action-badge.hard { background: rgba(255, 59, 48, 0.12); color: #FF3B30; }

.check-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 22px;
  height: 22px;
  background: #007AFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

/* 角度选择 */
.angle-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.angle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.angle-item:active {
  transform: scale(0.99);
}

.angle-item.selected {
  background: rgba(0, 122, 255, 0.08);
  border-color: #007AFF;
}

.angle-name {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.angle-desc {
  font-size: 13px;
  color: #8E8E93;
}

.recommended-badge {
  display: inline-block;
  font-size: 11px;
  background: #007AFF;
  color: white;
  padding: 2px 8px;
  border-radius: 6px;
  margin-top: 6px;
}

/* 拍摄提示 */
.tips-card {
  padding: 16px;
  border-radius: 14px;
  margin-bottom: 16px;
}

.tips-title {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 12px;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8E8E93;
}

/* 上传区域 */
.upload-area {
  background: white;
  border: 2px dashed #E5E5EA;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:active {
  border-color: #007AFF;
}

.upload-area.has-preview {
  border-style: solid;
  border-color: #007AFF;
  padding: 16px;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 13px;
  color: #8E8E93;
}

.preview-img {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 12px;
}

.pose-canvas {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  pointer-events: none;
}

.change-btn {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

/* 状态提示 */
.status-toast {
  margin-top: 12px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  font-size: 14px;
  color: #8E8E93;
}

.status-toast.success {
  background: rgba(52, 199, 89, 0.1);
  color: #34C759;
}

.status-toast.error {
  background: rgba(255, 59, 48, 0.1);
  color: #FF3B30;
}

.status-toast.warning {
  background: rgba(255, 149, 0, 0.1);
  color: #FF9500;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.btn {
  flex: 1;
  padding: 16px;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #007AFF;
  color: white;
}

.btn-primary:disabled {
  opacity: 0.5;
}

.btn-primary:not(:disabled):active {
  transform: scale(0.98);
}

.btn-secondary {
  background: rgba(0, 0, 0, 0.05);
  color: #007AFF;
}

.btn-secondary:active {
  transform: scale(0.98);
}
</style>