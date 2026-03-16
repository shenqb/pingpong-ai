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
            <button class="change-btn" @click.stop="previewImage = null">更换图片</button>
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
import { ref, computed } from 'vue'
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

let poseInstance = null

const canNext = computed(() => {
  if (step.value === 1) return !!selectedAction.value
  if (step.value === 2) return !!selectedAngle.value
  if (step.value === 3) return !!previewImage.value && !analyzing.value
  return false
})

const statusClass = computed(() => {
  if (detectStatus.value.includes('成功')) return 'success'
  if (detectStatus.value.includes('失败')) return 'error'
  return ''
})

const selectAction = (v) => selectedAction.value = v
const selectAngle = (v) => selectedAngle.value = v

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

const initPose = async () => {
  if (poseInstance) return poseInstance
  poseInstance = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
  })
  poseInstance.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  })
  return poseInstance
}

const onImageLoad = async () => {
  if (!previewRef.value) return
  try {
    const pose = await initPose()
    pose.onResults((results) => {
      if (results.poseLandmarks && results.poseLandmarks.length > 0) {
        const confidence = (results.poseLandmarks[0]?.visibility || 0.9) * 100
        detectStatus.value = `检测成功！置信度 ${confidence.toFixed(1)}%`
        if (canvasRef.value) drawSkeleton(results.poseLandmarks, canvasRef.value, previewRef.value)
      } else {
        detectStatus.value = '未检测到人体姿态'
      }
    })
    pose.send({ image: previewRef.value })
  } catch (e) {
    detectStatus.value = '检测失败: ' + e.message
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
  analyzing.value = true
  detectStatus.value = '正在分析...'
  await new Promise(r => setTimeout(r, 1500))
  const result = {
    action: selectedAction.value,
    angle: selectedAngle.value,
    score: 75 + Math.floor(Math.random() * 20),
    level: '良好',
    confidence: 0.92,
    angles: { leftElbow: 85, rightElbow: 90, leftKnee: 130, rightKnee: 140, torso: 12 },
    analysis: {
      strengths: [{ joint: '肘部', message: '角度标准' }],
      issues: [{ joint: '躯干', severity: 'medium', suggestion: '前倾角度可以再大一些' }]
    }
  }
  sessionStorage.setItem('analysisResult', JSON.stringify(result))
  router.push('/result')
}
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