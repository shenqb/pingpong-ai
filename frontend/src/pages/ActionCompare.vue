<template>
  <div class="action-compare-page">
    <!-- 头部 -->
    <div class="header">
      <van-nav-bar title="动作对比" left-arrow @click-left="$router.back()" />
    </div>

    <!-- 标准动作信息 -->
    <div class="standard-info">
      <h2>{{ standardAction?.action_name || '标准动作' }}</h2>
      <div class="meta">
        <van-tag type="primary">{{ getLevelText(standardAction?.level) }}</van-tag>
        <span class="player">🏆 {{ standardAction?.player_name }}</span>
      </div>
    </div>

    <!-- 对比模式切换 -->
    <div class="mode-switch">
      <van-segmented :options="modeOptions" v-model="compareMode" />
    </div>

    <!-- 并排对比模式 -->
    <div v-if="compareMode === 'side'" class="side-by-side">
      <div class="video-panel">
        <div class="panel-label">我的动作</div>
        <div class="video-placeholder" @click="uploadUserVideo">
          <div v-if="userVideoUrl" class="video-container">
            <video :src="userVideoUrl" controls class="video-element" />
          </div>
          <div v-else class="upload-hint">
            <div class="upload-icon">📹</div>
            <p>点击上传我的动作视频</p>
          </div>
        </div>
        <div v-if="userScore" class="score-display">
          <span class="score-label">得分</span>
          <span class="score-value" :class="getScoreClass(userScore)">{{ userScore }}</span>
        </div>
      </div>

      <div class="vs-divider">VS</div>

      <div class="video-panel">
        <div class="panel-label">标准动作</div>
        <div class="video-container standard">
          <div class="video-placeholder standard-video">
            <div class="placeholder-content">
              <div class="upload-icon">🎬</div>
              <p>标准参考视频</p>
            </div>
          </div>
        </div>
        <div class="score-display">
          <span class="score-label">得分</span>
          <span class="score-value perfect">100</span>
        </div>
      </div>
    </div>

    <!-- 骨架叠加模式 -->
    <div v-if="compareMode === 'overlay'" class="overlay-mode">
      <div class="canvas-container">
        <canvas ref="compareCanvas" class="compare-canvas"></canvas>
      </div>
      <div class="overlay-legend">
        <div class="legend-item">
          <span class="legend-color user"></span>
          <span>我的动作 (蓝色)</span>
        </div>
        <div class="legend-item">
          <span class="legend-color standard"></span>
          <span>标准动作 (绿色)</span>
        </div>
        <div class="legend-item">
          <span class="legend-color diff"></span>
          <span>差异点 (红色)</span>
        </div>
      </div>
    </div>

    <!-- 关键角度对比 -->
    <div class="angle-compare">
      <h3>📐 关键角度对比</h3>
      <div class="angle-list">
        <div v-for="(angleData, angleKey) in angleComparisons" :key="angleKey" class="angle-item">
          <div class="angle-header">
            <span class="angle-name">{{ getAngleName(angleKey) }}</span>
            <span class="angle-diff" :class="getDiffClass(angleData.diff)">
              差值：{{ angleData.diff > 0 ? '+' : '' }}{{ angleData.diff }}°
            </span>
          </div>
          <div class="angle-bars">
            <div class="angle-bar-wrapper">
              <div class="angle-bar-label">我的</div>
              <div class="angle-bar-bg">
                <div 
                  class="angle-bar-fill user" 
                  :style="{ width: Math.min(angleData.user / 180 * 100, 100) + '%' }"
                ></div>
              </div>
              <div class="angle-bar-value">{{ angleData.user }}°</div>
            </div>
            <div class="angle-bar-wrapper">
              <div class="angle-bar-label">标准</div>
              <div class="angle-bar-bg">
                <div 
                  class="angle-bar-fill standard" 
                  :style="{ width: angleData.standard / 180 * 100 + '%' }"
                ></div>
              </div>
              <div class="angle-bar-value">{{ angleData.standard }}°</div>
            </div>
          </div>
          <div class="angle-suggestion" v-if="Math.abs(angleData.diff) > 10">
            💡 建议：{{ getSuggestion(angleKey, angleData) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 整体评分 -->
    <div class="overall-score">
      <van-circle
        v-model="currentScore"
        :rate="userScore"
        :total="100"
        :speed="100"
        :size="180"
        :stroke-width="14"
        layer-color="#ebedf0"
        color="#1989fa"
      >
        <template #text>
          <div class="score-text">
            <div class="score-num">{{ userScore || '--' }}</div>
            <div class="score-label">综合评分</div>
          </div>
        </template>
      </van-circle>
      <div class="score-eval" v-if="userScore">
        <van-tag :type="getScoreType(userScore)" size="large">{{ getScoreEval(userScore) }}</van-tag>
      </div>
    </div>

    <!-- 常见错误提示 -->
    <div class="common-errors" v-if="standardAction?.common_errors_json">
      <h3>⚠️ 常见错误</h3>
      <van-collapse v-model="activeErrors">
        <van-collapse-item 
          v-for="(error, index) in parseCommonErrors(standardAction.common_errors_json)" 
          :key="index"
          :title="error.title"
          :name="index"
        >
          <div class="error-content">
            <p><strong>影响:</strong> {{ error.impact }}</p>
            <p><strong>纠正:</strong> {{ error.suggestion }}</p>
          </div>
        </van-collapse-item>
      </van-collapse>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <van-button type="primary" block round @click="reanalyze">
        🔄 重新分析
      </van-button>
      <van-button plain block round @click="saveResult">
        💾 保存结果
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast } from 'vant'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const standardAction = ref(null)
const compareMode = ref('side')
const userVideoUrl = ref(null)
const userScore = ref(null)
const currentScore = ref(0)
const activeErrors = ref([])
const compareCanvas = ref(null)

const modeOptions = [
  { text: '并排对比', value: 'side' },
  { text: '骨架叠加', value: 'overlay' }
]

const angleComparisons = ref({
  elbow: { user: 61, standard: 95, diff: -34 },
  knee: { user: 35, standard: 120, diff: -85 },
  torso: { user: 8, standard: 10, diff: -2 },
  wrist: { user: 72, standard: 75, diff: -3 }
})

// 加载标准动作详情
const loadStandardAction = async () => {
  const standardId = route.query.standardId
  if (!standardId) {
    showToast('缺少动作 ID')
    router.back()
    return
  }

  showLoadingToast({ message: '加载中...', forbidClick: true })
  
  try {
    const res = await axios.get(`/api/standard/${standardId}`)
    if (res.data.success) {
      standardAction.value = res.data.data
      // 模拟加载用户动作数据
      simulateUserAnalysis()
    }
  } catch (error) {
    showToast('加载失败')
    console.error('加载失败:', error)
  } finally {
    showLoadingToast.clear()
  }
}

// 模拟用户动作分析（实际应该从后端获取）
const simulateUserAnalysis = () => {
  setTimeout(() => {
    // 生成随机分数 (60-95)
    userScore.value = Math.floor(Math.random() * 35) + 60
    currentScore.value = userScore.value
    
    // 生成随机角度差异
    angleComparisons.value = {
      elbow: { 
        user: Math.floor(Math.random() * 30) + 70, 
        standard: 95, 
        diff: 0 
      },
      knee: { 
        user: Math.floor(Math.random() * 40) + 90, 
        standard: 120, 
        diff: 0 
      },
      torso: { 
        user: Math.floor(Math.random() * 20) + 5, 
        standard: 10, 
        diff: 0 
      },
      wrist: { 
        user: Math.floor(Math.random() * 20) + 65, 
        standard: 75, 
        diff: 0 
      }
    }
    
    // 计算差值
    Object.keys(angleComparisons.value).forEach(key => {
      angleComparisons.value[key].diff = 
        angleComparisons.value[key].user - angleComparisons.value[key].standard
    })
    
    // 绘制骨架对比
    drawSkeletonComparison()
  }, 1000)
}

// 上传用户视频
const uploadUserVideo = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'video/*,image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      
      showLoadingToast({ message: '上传中...', forbidClick: true })
      
      try {
        const res = await axios.post('/api/upload', formData)
        if (res.data.success) {
          userVideoUrl.value = URL.createObjectURL(file)
          showToast('上传成功，开始分析...')
          simulateUserAnalysis()
        }
      } catch (error) {
        showToast('上传失败')
      } finally {
        showLoadingToast.clear()
      }
    }
  }
  input.click()
}

// 绘制骨架对比
const drawSkeletonComparison = () => {
  const canvas = compareCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const width = canvas.width = 320
  const height = canvas.height = 400
  
  ctx.clearRect(0, 0, width, height)
  
  // 绘制标准动作骨架 (绿色)
  drawSkeleton(ctx, { x: width * 0.3, y: height * 0.5 }, 'rgba(76, 175, 80, 0.6)')
  
  // 绘制用户动作骨架 (蓝色)
  drawSkeleton(ctx, { x: width * 0.7, y: height * 0.5 }, 'rgba(33, 150, 243, 0.6)')
}

// 绘制单个骨架
const drawSkeleton = (ctx, offset, color) => {
  const keypoints = [
    { x: 0, y: -50 },   // 头
    { x: -20, y: -30 }, // 左肩
    { x: 20, y: -30 },  // 右肩
    { x: -30, y: 0 },   // 左手
    { x: 30, y: 0 },    // 右手
    { x: 0, y: 50 },    // 臀部
    { x: -15, y: 100 }, // 左膝
    { x: 15, y: 100 },  // 右膝
    { x: -15, y: 150 }, // 左脚
    { x: 15, y: 150 }   // 右脚
  ]
  
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  
  // 绘制连接线
  const connections = [
    [0, 1], [0, 2], // 头到肩膀
    [1, 3], [2, 4], // 肩膀到手
    [0, 5], // 头到臀部
    [5, 6], [5, 7], // 臀部到膝
    [6, 8], [7, 9]  // 膝到脚
  ]
  
  connections.forEach(([i, j]) => {
    ctx.beginPath()
    ctx.moveTo(offset.x + keypoints[i].x, offset.y + keypoints[i].y)
    ctx.lineTo(offset.x + keypoints[j].x, offset.y + keypoints[j].y)
    ctx.stroke()
  })
  
  // 绘制关节点
  ctx.fillStyle = color
  keypoints.forEach(p => {
    ctx.beginPath()
    ctx.arc(offset.x + p.x, offset.y + p.y, 5, 0, Math.PI * 2)
    ctx.fill()
  })
}

// 辅助函数
const getLevelText = (level) => {
  const texts = { basic: '基础', intermediate: '中级', advanced: '高级' }
  return texts[level] || level
}

const getAngleName = (key) => {
  const names = { elbow: '肘部角度', knee: '膝部角度', torso: '躯干角度', wrist: '手腕角度' }
  return names[key] || key
}

const getDiffClass = (diff) => {
  if (Math.abs(diff) <= 5) return 'diff-good'
  if (Math.abs(diff) <= 15) return 'diff-warning'
  return 'diff-bad'
}

const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 75) return 'score-good'
  if (score >= 60) return 'score-fair'
  return 'score-poor'
}

const getScoreType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 75) return 'primary'
  if (score >= 60) return 'warning'
  return 'danger'
}

const getScoreEval = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 75) return '良好'
  if (score >= 60) return '及格'
  return '需改进'
}

const getSuggestion = (angleKey, data) => {
  const suggestions = {
    elbow: data.diff < 0 ? '肘部弯曲不足，建议增加弯曲角度' : '肘部弯曲过度，建议减小角度',
    knee: data.diff < 0 ? '膝部弯曲不足，建议降低重心' : '膝部弯曲过度，建议抬高重心',
    torso: data.diff < 0 ? '躯干前倾不足，建议增加前倾' : '躯干前倾过度，建议挺直身体',
    wrist: data.diff < 0 ? '手腕角度不足，建议调整手腕' : '手腕角度过度，建议放松手腕'
  }
  return suggestions[angleKey] || '请教练现场指导'
}

const parseCommonErrors = (jsonStr) => {
  try {
    return JSON.parse(jsonStr || '[]')
  } catch {
    return []
  }
}

const reanalyze = () => {
  userVideoUrl.value = null
  userScore.value = null
  simulateUserAnalysis()
}

const saveResult = async () => {
  try {
    await axios.post('/api/history/save', {
      actionType: standardAction.value?.category,
      actionName: standardAction.value?.action_name,
      score: userScore.value,
      level: getScoreEval(userScore.value),
      keypoints: angleComparisons.value
    })
    showToast('保存成功')
  } catch (error) {
    showToast('保存失败')
  }
}

onMounted(() => {
  loadStandardAction()
})
</script>

<style scoped>
.action-compare-page {
  padding-bottom: 24px;
  max-width: 480px;
  margin: 0 auto;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
}

.standard-info {
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.standard-info h2 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.standard-info .meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.standard-info .player {
  font-size: 13px;
  opacity: 0.9;
}

.mode-switch {
  padding: 12px 16px;
  background: white;
}

.side-by-side {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.video-panel {
  flex: 1;
}

.panel-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  text-align: center;
}

.video-placeholder {
  background: #f7f8fa;
  border-radius: 8px;
  aspect-ratio: 9/16;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.upload-hint {
  text-align: center;
  color: #999;
}

.upload-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.upload-hint p {
  font-size: 12px;
  margin: 0;
}

.video-container {
  width: 100%;
  height: 100%;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vs-divider {
  font-size: 14px;
  font-weight: bold;
  color: #999;
  padding: 8px;
}

.score-display {
  text-align: center;
  margin-top: 8px;
}

.score-label {
  font-size: 12px;
  color: #666;
  display: block;
}

.score-value {
  font-size: 24px;
  font-weight: bold;
  color: #1989fa;
}

.score-value.perfect {
  color: #07c160;
}

.score-value.score-excellent { color: #07c160; }
.score-value.score-good { color: #1989fa; }
.score-value.score-fair { color: #ff976a; }
.score-value.score-poor { color: #ee0a24; }

.overlay-mode {
  padding: 16px;
}

.canvas-container {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.compare-canvas {
  width: 100%;
  display: block;
}

.overlay-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.user { background: #2196f3; }
.legend-color.standard { background: #4caf50; }
.legend-color.diff { background: #f44336; }

.angle-compare {
  padding: 16px;
}

.angle-compare h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
}

.angle-item {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.angle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.angle-name {
  font-size: 14px;
  font-weight: 500;
}

.angle-diff {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.angle-diff.diff-good { background: #e8f5e9; color: #07c160; }
.angle-diff.diff-warning { background: #fff7e6; color: #ff976a; }
.angle-diff.diff-bad { background: #ffebeb; color: #ee0a24; }

.angle-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.angle-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.angle-bar-label {
  width: 32px;
  font-size: 12px;
  color: #666;
}

.angle-bar-bg {
  flex: 1;
  height: 8px;
  background: #ebedf0;
  border-radius: 4px;
  overflow: hidden;
}

.angle-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.angle-bar-fill.user { background: #2196f3; }
.angle-bar-fill.standard { background: #07c160; }

.angle-bar-value {
  width: 40px;
  text-align: right;
  font-size: 12px;
  font-weight: 500;
}

.angle-suggestion {
  margin-top: 8px;
  padding: 8px;
  background: #f7f8fa;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.overall-score {
  text-align: center;
  padding: 24px 16px;
}

.score-text {
  text-align: center;
}

.score-num {
  font-size: 36px;
  font-weight: bold;
  color: #1989fa;
}

.score-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.score-eval {
  margin-top: 16px;
}

.common-errors {
  padding: 16px;
}

.common-errors h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
}

.error-content {
  font-size: 13px;
  line-height: 1.6;
  color: #666;
}

.error-content p {
  margin: 4px 0;
}

.action-buttons {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-buttons .van-button {
  height: 44px;
  font-size: 15px;
}
</style>
