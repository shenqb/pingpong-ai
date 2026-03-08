<template>
  <div class="realtime-page">
    <van-nav-bar title="实时分析" left-arrow @click-left="$router.back()" />

    <div class="video-content">
      <!-- 视频预览 -->
      <div class="video-wrapper">
        <video ref="videoRef" autoplay playsinline class="video-element"></video>
        <canvas ref="canvasRef" class="canvas-element"></canvas>
      </div>

      <!-- 实时信息 -->
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">实时分数</span>
          <span class="info-value" :class="scoreClass">{{ score }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">帧率</span>
          <span class="info-value">{{ fps }}fps</span>
        </div>
        <div class="info-row">
          <span class="info-label">动作类型</span>
          <span class="info-value">{{ actionName }}</span>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="controls">
        <van-button
          v-if="!isRecording"
          type="primary"
          size="large"
          round
          block
          @click="startRecording"
        >
          📹 开始录制
        </van-button>
        <van-button
          v-else
          type="danger"
          size="large"
          round
          block
          @click="stopRecording"
        >
          ⏹ 停止录制
        </van-button>
      </div>

      <!-- 动作选择 -->
      <van-cell-group class="action-select">
        <van-cell title="动作类型">
          <template #right-icon>
            <van-dropdown-menu v-model="actionType">
              <van-dropdown-item v-model="actionType" :options="actionOptions" />
            </van-dropdown-menu>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast } from 'vant'
import { Pose } from '@mediapipe/pose'

const router = useRouter()
const videoRef = ref(null)
const canvasRef = ref(null)

// 状态
const isRecording = ref(false)
const score = ref('--')
const fps = ref(0)
const actionType = ref('forehand')
let mediaRecorder = null
let chunks = []
let pose = null
let animationId = null

// 动作选项
const actionOptions = [
  { text: '正手攻球', value: 'forehand' },
  { text: '反手推挡', value: 'backhand' },
  { text: '发球', value: 'serve' }
]

const actionName = computed(() => {
  const map = {
    forehand: '正手攻球',
    backhand: '反手推挡',
    serve: '发球'
  }
  return map[actionType.value] || actionType.value
})

const scoreClass = computed(() => {
  if (score.value === '--') return ''
  if (score.value >= 90) return 'excellent'
  if (score.value >= 80) return 'good'
  if (score.value >= 70) return 'normal'
  return 'poor'
})

// 初始化 MediaPipe Pose
const initPose = async () => {
  pose = new Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469240/${file}`
    }
  })

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  })

  pose.onResults(onPoseResults)
}

// 处理姿态结果
const onPoseResults = (results) => {
  if (!canvasRef.value || !videoRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  
  canvas.width = videoRef.value.videoWidth
  canvas.height = videoRef.value.videoHeight

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()

  if (results.poseLandmarks) {
    // 绘制骨架
    drawSkeleton(ctx, results.poseLandmarks)
    
    // 计算分数
    const calculatedScore = calculateScore(results.poseLandmarks)
    score.value = calculatedScore
    
    // 计算帧率
    fps.value = Math.round(1000 / (performance.now() - lastFrameTime))
    lastFrameTime = performance.now()
  }

  ctx.restore()
}

// 绘制骨架
const drawSkeleton = (ctx, landmarks) => {
  const connections = [
    [11, 12], // 肩膀
    [11, 13], [13, 15], // 左臂
    [12, 14], [14, 16], // 右臂
    [23, 24], // 臀部
    [23, 25], [25, 27], // 左腿
    [24, 26], [26, 28]  // 右腿
  ]

  ctx.strokeStyle = '#00FF00'
  ctx.lineWidth = 3

  connections.forEach(([i, j]) => {
    ctx.beginPath()
    ctx.moveTo(landmarks[i].x * ctx.canvas.width, landmarks[i].y * ctx.canvas.height)
    ctx.lineTo(landmarks[j].x * ctx.canvas.width, landmarks[j].y * ctx.canvas.height)
    ctx.stroke()
  })

  // 绘制关键点
  ctx.fillStyle = '#FF0000'
  landmarks.forEach((landmark) => {
    ctx.beginPath()
    ctx.arc(
      landmark.x * ctx.canvas.width,
      landmark.y * ctx.canvas.height,
      5,
      0,
      2 * Math.PI
    )
    ctx.fill()
  })
}

// 计算分数
const calculateScore = (landmarks) => {
  // 简化计算，实际应该更复杂
  const elbowAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15])
  const kneeAngle = calculateAngle(landmarks[23], landmarks[25], landmarks[27])
  
  // 理想角度：肘部 90-100 度，膝部 110-130 度
  let score = 100
  
  if (elbowAngle < 80 || elbowAngle > 120) score -= 20
  if (kneeAngle < 100 || kneeAngle > 140) score -= 20
  
  return Math.max(0, Math.min(100, score))
}

// 计算角度
const calculateAngle = (a, b, c) => {
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }
  
  const dot = ab.x * cb.x + ab.y * cb.y
  const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y)
  const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y)
  
  const cosAngle = dot / (magAB * magCB)
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI
  
  return Math.round(angle)
}

// 开始录制
const startRecording = async () => {
  try {
    if (!videoRef.value) return

    // 获取摄像头
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      },
      audio: false
    })

    videoRef.value.srcObject = stream
    
    // 等待视频加载
    await new Promise((resolve) => {
      videoRef.value.onloadedmetadata = () => {
        videoRef.value.play()
        resolve()
      }
    })

    // 初始化 Pose
    await initPose()

    // 开始分析
    startAnalysis()

    // 开始录制
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    })

    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data)
    }

    mediaRecorder.start()
    isRecording.value = true
    showToast('开始录制...')
  } catch (error) {
    console.error('录制失败:', error)
    showToast('无法访问摄像头')
  }
}

// 开始分析
const startAnalysis = async () => {
  const analyze = async () => {
    if (videoRef.value && pose && !videoRef.value.paused) {
      await pose.send({ image: videoRef.value })
    }
    animationId = requestAnimationFrame(analyze)
  }
  analyze()
}

// 停止录制
const stopRecording = async () => {
  return new Promise((resolve) => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        chunks = []
        
        // 保存录制文件
        await saveRecording(blob)
        
        // 停止摄像头
        if (videoRef.value && videoRef.value.srcObject) {
          videoRef.value.srcObject.getTracks().forEach(track => track.stop())
        }
        
        // 停止分析
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
        
        isRecording.value = false
        resolve()
      }
      
      mediaRecorder.stop()
      showToast('录制完成')
    }
  })
}

// 保存录制
const saveRecording = async (blob) => {
  try {
    const formData = new FormData()
    formData.append('file', blob, `recording-${Date.now()}.webm`)
    formData.append('actionType', actionType.value)
    formData.append('angle', 'side')
    
    const response = await fetch('/api/upload/analyze', {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    
    if (result.success) {
      sessionStorage.setItem('analysisResult', JSON.stringify(result.data))
      router.push('/result')
    }
  } catch (error) {
    console.error('保存失败:', error)
  }
}

let lastFrameTime = performance.now()

onMounted(() => {
  // 初始化
})

onUnmounted(() => {
  // 清理
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (videoRef.value && videoRef.value.srcObject) {
    videoRef.value.srcObject.getTracks().forEach(track => track.stop())
  }
})
</script>

<style scoped>
.realtime-page {
  padding-bottom: 20px;
  max-width: 480px;
  margin: 0 auto;
}

.video-content {
  padding: 16px;
}

.video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.video-element,
.canvas-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.canvas-element {
  z-index: 1;
}

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 18px;
  font-weight: 600;
}

.info-value.excellent {
  color: #07c160;
}

.info-value.good {
  color: #1989fa;
}

.info-value.normal {
  color: #ff976a;
}

.info-value.poor {
  color: #ee0a24;
}

.controls {
  margin-bottom: 16px;
}

.action-select {
  border-radius: 12px;
  overflow: hidden;
}
</style>
