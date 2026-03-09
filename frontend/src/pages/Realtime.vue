<template>
  <div class="realtime-page">
    <van-nav-bar title="实时分析" left-arrow @click-left="$router.back()" />

    <!-- 模式选择 -->
    <van-tabs v-model:active="currentMode" class="mode-tabs">
      <van-tab title="📹 摄像头" name="camera"></van-tab>
      <van-tab title="📁 相册上传" name="upload"></van-tab>
    </van-tabs>

    <div class="video-content">
      <!-- 摄像头模式 -->
      <div v-if="currentMode === 'camera'" class="camera-mode">
        <div class="video-wrapper">
          <video ref="videoRef" autoplay playsinline class="video-element"></video>
          <canvas ref="canvasRef" class="canvas-element"></canvas>
        </div>
      </div>

      <!-- 相册上传模式 -->
      <div v-if="currentMode === 'upload'" class="upload-mode">
        <div class="upload-placeholder" @click="selectFromAlbum">
          <div v-if="selectedFile" class="file-selected">
            <van-image :src="filePreviewUrl" class="preview-image" />
            <div class="file-info">
              <div class="file-name">{{ selectedFile.name }}</div>
              <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
            </div>
          </div>
          <div v-else class="upload-hint">
            <div class="upload-icon">📁</div>
            <p>点击选择视频或图片</p>
            <span class="upload-desc">支持：mp4/mov/jpg/png</span>
          </div>
        </div>
      </div>

      <!-- 分析过程 -->
      <div v-if="isAnalyzing" class="analysis-process">
        <h3>🔍 AI 分析中...</h3>
        <div class="process-log">
          <div
            v-for="(log, index) in analysisLogs"
            :key="index"
            class="log-item"
            :class="log.type"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-text">{{ log.text }}</span>
          </div>
        </div>
        <van-loading v-if="isLoading" size="24px">分析中...</van-loading>
      </div>

      <!-- 分析结果 -->
      <div v-if="analysisResult" class="analysis-result">
        <van-cell-group>
          <van-cell title="综合得分" center>
            <template #right-icon>
              <span class="result-score" :class="getScoreClass(analysisResult.score)">
                {{ analysisResult.score }}分
              </span>
            </template>
          </van-cell>
          <van-cell title="等级评价">
            <template #right-icon>
              <van-tag :type="getScoreType(analysisResult.level)">{{ analysisResult.level }}</van-tag>
            </template>
          </van-cell>
        </van-cell-group>

        <!-- 角度对比 -->
        <div class="angle-compare">
          <h4>📐 关键角度</h4>
          <div v-for="(angle, key) in analysisResult.angles" :key="key" class="angle-item">
            <span class="angle-name">{{ getAngleName(key) }}</span>
            <span class="angle-value">{{ angle }}°</span>
          </div>
        </div>

        <!-- 纠正建议 -->
        <div class="suggestions" v-if="analysisResult.suggestions?.length">
          <h4>💡 纠正建议</h4>
          <van-collapse v-model="activeSuggestions">
            <van-collapse-item
              v-for="(suggestion, index) in analysisResult.suggestions"
              :key="index"
              :title="suggestion.joint + ' - ' + suggestion.issue"
              :name="index"
            >
              <div class="suggestion-content">
                <p>{{ suggestion.suggestion }}</p>
                <van-tag :type="suggestion.severity === 'high' ? 'danger' : 'warning'" size="mini">
                  {{ suggestion.severity === 'high' ? '严重' : '中等' }}
                </van-tag>
              </div>
            </van-collapse-item>
          </van-collapse>
        </div>

        <div class="result-actions">
          <van-button type="primary" block round @click="reanalyze">🔄 重新分析</van-button>
          <van-button plain block round @click="saveResult">💾 保存结果</van-button>
        </div>
      </div>

      <!-- 摄像头模式控制按钮 -->
      <div v-if="currentMode === 'camera'" class="controls">
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

      <!-- 相册模式分析按钮 -->
      <div v-if="currentMode === 'upload' && selectedFile && !isAnalyzing" class="upload-actions">
        <van-button
          type="primary"
          size="large"
          round
          block
          :loading="isAnalyzing"
          @click="analyzeFile"
        >
          🤖 开始 AI 分析
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast } from 'vant'
import axios from 'axios'

const router = useRouter()
const videoRef = ref(null)
const canvasRef = ref(null)

// 模式
const currentMode = ref('camera')
const selectedFile = ref(null)
const filePreviewUrl = ref(null)

// 分析状态
const isAnalyzing = ref(false)
const isLoading = ref(false)
const analysisLogs = ref([])
const analysisResult = ref(null)
const activeSuggestions = ref([])

// 摄像头相关
const isRecording = ref(false)
const score = ref('--')
const fps = ref(0)
const actionType = ref('forehand')
let mediaRecorder = null
let chunks = []
let pose = null
let animationId = null
let stream = null

// 动作选项
const actionOptions = [
  { text: '正手攻球', value: 'forehand' },
  { text: '反手推挡', value: 'backhand' },
  { text: '发球', value: 'serve' }
]

const actionName = computed(() => {
  const map = { forehand: '正手攻球', backhand: '反手推挡', serve: '发球' }
  return map[actionType.value] || actionType.value
})

// 选择文件
const selectFromAlbum = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'video/*,image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      selectedFile.value = file
      filePreviewUrl.value = URL.createObjectURL(file)
      analysisResult.value = null
      analysisLogs.value = []
      showToast('文件已选择，点击开始分析')
    }
  }
  input.click()
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 添加分析日志
const addLog = (text, type = 'info') => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`
  analysisLogs.value.push({ time, text, type })
}

// 分析文件（SSE 流式）
const analyzeFile = async () => {
  if (!selectedFile.value) {
    showToast('请先选择文件')
    return
  }

  isAnalyzing.value = true
  isLoading.value = true
  analysisLogs.value = []
  analysisResult.value = null

  addLog('开始上传文件...', 'info')

  try {
    // 上传文件
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('actionType', actionType.value)

    addLog('文件上传中...', 'info')

    const uploadRes = await axios.post('/api/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (!uploadRes.data.success) {
      throw new Error('上传失败')
    }

    addLog('✅ 文件上传成功', 'success')
    addLog(`文件名：${uploadRes.data.data.filename}`, 'info')
    addLog(`文件大小：${formatFileSize(uploadRes.data.data.size)}`, 'info')

    // 使用 SSE 进行实时分析
    addLog('🤖 启动 MediaPipe Pose 模型...', 'info')
    
    await analyzeWithSSE({
      filePath: uploadRes.data.data.path,
      actionType: actionType.value
    })

  } catch (error) {
    console.error('分析失败:', error)
    addLog(`❌ 分析失败：${error.message}`, 'error')
    showToast('分析失败')
  } finally {
    isLoading.value = false
  }
}

// SSE 流式分析
const analyzeWithSSE = async (params) => {
  return new Promise((resolve, reject) => {
    const url = `/api/analysis/analyze-stream?filePath=${encodeURIComponent(params.filePath)}&actionType=${params.actionType}`
    console.log('[SSE] 连接:', url)
    
    const eventSource = new EventSource(url)
    let logCount = 0

    eventSource.onmessage = (event) => {
      logCount++
      console.log(`[SSE] 收到消息 #${logCount}:`, event.data)
      
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'log') {
          addLog(data.message, data.level || 'info')
          console.log('[SSE Log]', data.level, data.message)
        } else if (data.type === 'progress') {
          addLog(`分析进度：${data.progress}%`, 'info')
        } else if (data.type === 'result') {
          console.log('[SSE Result]', JSON.stringify(data.data, null, 2))
          analysisResult.value = data.data
          addLog('✅ 分析完成！', 'success')
          eventSource.close()
          isAnalyzing.value = false
          resolve()
        } else if (data.type === 'error') {
          console.error('[SSE Error]', data.message)
          addLog(`❌ ${data.message}`, 'error')
          eventSource.close()
          isAnalyzing.value = false
          reject(new Error(data.message))
        }
      } catch (error) {
        console.error('解析 SSE 数据失败:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('[SSE] 连接错误:', error)
      addLog('❌ 连接服务器失败', 'error')
      eventSource.close()
      isAnalyzing.value = false
      reject(error)
    }
    
    // 超时处理
    setTimeout(() => {
      if (isAnalyzing.value) {
        console.error('[SSE] 超时')
        addLog('❌ 分析超时', 'error')
        eventSource.close()
        isAnalyzing.value = false
        reject(new Error('分析超时'))
      }
    }, 30000) // 30 秒超时
  })
}

// 重新分析
const reanalyze = () => {
  analysisResult.value = null
  analysisLogs.value = []
  analyzeFile()
}

// 保存结果
const saveResult = async () => {
  if (!analysisResult.value) return

  try {
    await axios.post('/api/history/save', {
      actionType: actionType.value,
      actionName: actionName.value,
      score: analysisResult.value.score,
      level: analysisResult.value.level,
      keypoints: analysisResult.value.angles
    })
    showToast('保存成功')
    router.push('/history')
  } catch (error) {
    showToast('保存失败')
  }
}

// 辅助函数
const getScoreClass = (s) => {
  if (s >= 90) return 'score-excellent'
  if (s >= 75) return 'score-good'
  if (s >= 60) return 'score-fair'
  return 'score-poor'
}

const getScoreType = (level) => {
  if (level === '优秀') return 'success'
  if (level === '良好') return 'primary'
  if (level === '及格') return 'warning'
  return 'danger'
}

const getAngleName = (key) => {
  const names = {
    leftElbow: '左肘', rightElbow: '右肘',
    leftKnee: '左膝', rightKnee: '右膝',
    torso: '躯干',
    leftWrist: '左手腕', rightWrist: '右手腕'
  }
  return names[key] || key
}

// 摄像头相关函数（保留原有功能）
const initPose = async () => {
  // ... 原有代码
}

const startRecording = async () => {
  // ... 原有代码
}

const stopRecording = () => {
  // ... 原有代码
}

onMounted(() => {
  // 检查 URL 参数，如果是相册模式，自动切换
  const queryMode = router.currentRoute.value.query.mode
  const queryAction = router.currentRoute.value.query.actionType
  
  if (queryMode === 'upload') {
    currentMode.value = 'upload'
    if (queryAction) {
      actionType.value = queryAction
    }
  }
  
  if (currentMode.value === 'camera') {
    initPose()
  }
})

onUnmounted(() => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
})
</script>

<style scoped>
.realtime-page {
  padding-bottom: 24px;
  max-width: 480px;
  margin: 0 auto;
}

.mode-tabs {
  margin-bottom: 16px;
}

.video-content {
  padding: 0 16px;
}

.video-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}

.video-element {
  width: 100%;
  display: block;
}

.canvas-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.upload-mode {
  margin-bottom: 16px;
}

.upload-placeholder {
  background: #f7f8fa;
  border: 2px dashed #dcdee0;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
}

.upload-hint {
  color: #969799;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-hint p {
  font-size: 16px;
  margin: 8px 0;
}

.upload-desc {
  font-size: 12px;
  color: #c8c9cc;
}

.file-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

.file-info {
  text-align: center;
}

.file-name {
  font-size: 14px;
  color: #323233;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: #969799;
}

.analysis-process {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.analysis-process h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
}

.process-log {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 12px;
  font-family: monospace;
  font-size: 12px;
}

.log-item {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.log-time {
  color: #969799;
  flex-shrink: 0;
}

.log-text {
  flex: 1;
}

.log-item.info .log-text { color: #323233; }
.log-item.success .log-text { color: #07c160; }
.log-item.error .log-text { color: #ee0a24; }
.log-item.warning .log-text { color: #ff976a; }

.analysis-result {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.result-score {
  font-size: 24px;
  font-weight: bold;
}

.result-score.score-excellent { color: #07c160; }
.result-score.score-good { color: #1989fa; }
.result-score.score-fair { color: #ff976a; }
.result-score.score-poor { color: #ee0a24; }

.angle-compare {
  margin-top: 16px;
}

.angle-compare h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
}

.angle-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f7f8fa;
}

.angle-item:last-child {
  border-bottom: none;
}

.angle-name {
  color: #666;
  font-size: 13px;
}

.angle-value {
  font-weight: 500;
  font-size: 14px;
}

.suggestions {
  margin-top: 16px;
}

.suggestions h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
}

.suggestion-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.suggestion-content p {
  margin: 0;
  flex: 1;
  font-size: 13px;
  color: #666;
}

.result-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.controls {
  margin: 24px 0;
}

.upload-actions {
  margin-top: 24px;
}
</style>
