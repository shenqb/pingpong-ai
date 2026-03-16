<template>
  <div class="ios-app result-page">
    <!-- 导航栏 -->
    <nav class="nav-bar glass-card">
      <button class="nav-back" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#007AFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">分析结果</h1>
      <button class="share-btn" @click="shareResult">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 12V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V12" stroke="#007AFF" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 2L12 16M12 2L7 7M12 2L17 7" stroke="#007AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </nav>

    <main class="main-content" v-if="result">
      <!-- 分数卡片 -->
      <div class="score-card glass-card" :class="scoreClass">
        <div class="score-header">
          <div class="score-action-name">{{ getActionName(result.action) }}</div>
          <div class="score-time">{{ (result.confidence * 100).toFixed(0) }}% 置信度</div>
        </div>
        <div class="score-body">
          <div class="score-ring">
            <svg viewBox="0 0 100 100">
              <circle class="ring-bg" cx="50" cy="50" r="42" />
              <circle class="ring-progress" cx="50" cy="50" r="42" :style="{ strokeDashoffset: scoreOffset }" />
            </svg>
            <div class="score-inner">
              <div class="score-number">{{ result.score }}</div>
              <div class="score-label">{{ result.level }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 检测到的角度数 -->
      <div v-if="angleCount === 0" class="error-card glass-card">
        <div class="error-icon">⚠️</div>
        <div class="error-text">未检测到足够的身体关键点</div>
        <div class="error-hint">请确保全身入镜，光线充足</div>
      </div>

      <!-- 角度分析 -->
      <section class="section" v-if="angleCount > 0">
        <div class="section-title">关节角度分析</div>
        <div class="angles-card glass-card">
          <div class="angle-row" v-for="(value, key) in result.angles" :key="key">
            <div class="angle-info">
              <div class="angle-name">{{ getJointName(key) }}</div>
              <div class="angle-bar-container">
                <div class="angle-optimal-range" :style="getOptimalRangeStyle(key)"></div>
                <div class="angle-bar">
                  <div class="angle-fill" :style="{ width: (value / 180) * 100 + '%' }"></div>
                  <div class="angle-marker" :style="{ left: (value / 180) * 100 + '%' }"></div>
                </div>
              </div>
            </div>
            <div class="angle-value" :class="getAngleClass(key, value)">{{ value }}°</div>
          </div>
        </div>
      </section>

      <!-- 优点 -->
      <section class="section" v-if="result.analysis?.strengths?.length">
        <div class="section-title">✅ 动作优点</div>
        <div class="strengths-card glass-card">
          <div class="strength-item" v-for="(item, i) in result.analysis.strengths" :key="i">
            <div class="strength-icon">✓</div>
            <div class="strength-text">
              <span class="strength-name">{{ item.joint }}</span>
              <span class="strength-desc">{{ item.message }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 改进建议 -->
      <section class="section" v-if="result.analysis?.issues?.length">
        <div class="section-title">💡 改进建议</div>
        <div class="issues-card glass-card">
          <div class="issue-item" v-for="(issue, i) in result.analysis.issues" :key="i" :class="issue.severity">
            <div class="issue-header">
              <div class="issue-name">{{ issue.joint }}</div>
              <div class="issue-diff">{{ issue.diff > 0 ? '+' : '' }}{{ issue.diff }}°</div>
            </div>
            <div class="issue-detail">
              <span class="user-value">你的: {{ issue.userAngle }}°</span>
              <span class="optimal-value">标准: {{ issue.optimal }}°</span>
            </div>
            <div class="issue-suggestion">{{ issue.suggestion }}</div>
          </div>
        </div>
      </section>

      <!-- 参考动作 -->
      <section class="section">
        <div class="section-title">📖 标准动作参考</div>
        <div class="reference-card glass-card">
          <img 
            :src="getReferenceImage(result.action)" 
            class="reference-image"
            @error="handleImageError"
            alt="标准动作参考"
          />
          <div class="reference-tips">
            <div class="tip-item" v-for="(tip, i) in getReferenceTips(result.action)" :key="i">
              {{ tip }}
            </div>
          </div>
        </div>
      </section>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="btn btn-secondary" @click="$router.push('/upload')">重新分析</button>
        <button class="btn btn-primary" @click="$router.push('/')">返回首页</button>
      </div>
    </main>

    <!-- 无数据 -->
    <div class="no-data" v-else>
      <div class="no-icon">📊</div>
      <div class="no-text">暂无分析结果</div>
      <button class="btn btn-primary" @click="$router.push('/upload')">开始分析</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const result = ref(null)
const imageError = ref(false)

const standardActions = {
  forehand: { 
    name: '正手攻球', 
    angles: { 
      leftElbow: { optimal: 90, range: [70, 110] },
      rightElbow: { optimal: 85, range: [65, 105] },
      leftKnee: { optimal: 130, range: [110, 150] },
      rightKnee: { optimal: 140, range: [120, 160] },
      torso: { optimal: 10, range: [0, 20] }
    },
    tips: ['重心略前倾', '击球点在身体右侧前方', '大臂带动小臂发力', '手腕固定，控制拍形']
  },
  backhand: { 
    name: '反手推挡', 
    angles: {
      leftElbow: { optimal: 80, range: [60, 100] },
      rightElbow: { optimal: 85, range: [65, 105] },
      leftKnee: { optimal: 140, range: [120, 160] },
      rightKnee: { optimal: 145, range: [125, 165] },
      torso: { optimal: 5, range: [0, 15] }
    },
    tips: ['身体正对来球', '肘关节贴近身体', '前臂发力为主', '拍形稍前倾']
  },
  forehand_loop: { 
    name: '正手拉弧圈', 
    angles: {
      leftElbow: { optimal: 100, range: [80, 120] },
      rightElbow: { optimal: 95, range: [75, 115] },
      leftKnee: { optimal: 120, range: [100, 140] },
      rightKnee: { optimal: 130, range: [110, 150] },
      torso: { optimal: 15, range: [5, 25] }
    },
    tips: ['重心降低，蓄力充分', '蹬腿转腰发力', '摩擦球的中上部', '手臂充分伸展']
  },
  backhand_loop: { 
    name: '反手拉弧圈', 
    angles: {
      leftElbow: { optimal: 85, range: [65, 105] },
      rightElbow: { optimal: 90, range: [70, 110] },
      leftKnee: { optimal: 130, range: [110, 150] },
      rightKnee: { optimal: 135, range: [115, 155] },
      torso: { optimal: 10, range: [0, 20] }
    },
    tips: ['身体略向左转', '前臂快速收缩', '摩擦球的中上部', '重心随球前移']
  },
  serve: { 
    name: '发球', 
    angles: {
      leftElbow: { optimal: 70, range: [50, 90] },
      rightElbow: { optimal: 90, range: [70, 110] },
      leftKnee: { optimal: 130, range: [110, 150] },
      rightKnee: { optimal: 140, range: [120, 160] },
      torso: { optimal: 8, range: [0, 18] }
    },
    tips: ['抛球高度一致', '击球点在身体右侧', '手腕抖动发力', '控制拍形变化']
  },
  flick: { 
    name: '挑打', 
    angles: {
      leftElbow: { optimal: 75, range: [55, 95] },
      rightElbow: { optimal: 80, range: [60, 100] },
      leftKnee: { optimal: 135, range: [115, 155] },
      rightKnee: { optimal: 140, range: [120, 160] },
      torso: { optimal: 5, range: [0, 15] }
    },
    tips: ['步法快速到位', '手臂伸入台内', '手腕快速抖动', '击球上升期']
  }
}

const angleCount = computed(() => Object.keys(result.value?.angles || {}).length)

const scoreClass = computed(() => {
  const s = result.value?.score || 0
  if (s >= 90) return 'excellent'
  if (s >= 80) return 'good'
  if (s >= 70) return 'average'
  return 'improve'
})

const scoreOffset = computed(() => {
  const circumference = 2 * Math.PI * 42
  const score = result.value?.score || 0
  return circumference * (1 - score / 100)
})

const getActionName = (action) => standardActions[action]?.name || '动作分析'

const getJointName = (key) => {
  const names = { 
    leftElbow: '左肘', 
    rightElbow: '右肘', 
    leftKnee: '左膝', 
    rightKnee: '右膝', 
    torso: '躯干' 
  }
  return names[key] || key
}

const getOptimalRangeStyle = (key) => {
  const std = standardActions[result.value.action]?.angles?.[key]
  if (!std) return {}
  const left = (std.range[0] / 180) * 100
  const width = ((std.range[1] - std.range[0]) / 180) * 100
  return {
    left: left + '%',
    width: width + '%'
  }
}

const getAngleClass = (key, value) => {
  const std = standardActions[result.value.action]?.angles?.[key]
  if (!std) return ''
  return value >= std.range[0] && value <= std.range[1] ? 'good' : 'warn'
}

const getReferenceImage = (action) => {
  return `/standard-poses/${action}.jpg`
}

const handleImageError = () => {
  imageError.value = true
}

const getReferenceTips = (action) => {
  return standardActions[action]?.tips || ['参考专业选手动作', '注意身体协调', '多加练习']
}

const shareResult = () => {
  // TODO: 实现分享功能
}

onMounted(() => {
  const saved = sessionStorage.getItem('analysisResult')
  if (saved) {
    result.value = JSON.parse(saved)
    console.log('Loaded result:', result.value)
  }
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

.nav-back, .share-btn {
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

.main-content {
  padding: 16px;
}

.score-card {
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.score-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.score-card.excellent::before { background: linear-gradient(90deg, #34C759, #30D158); }
.score-card.good::before { background: linear-gradient(90deg, #007AFF, #5856D6); }
.score-card.average::before { background: linear-gradient(90deg, #FF9500, #FF6B00); }
.score-card.improve::before { background: linear-gradient(90deg, #FF3B30, #FF453A); }

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.score-action-name {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A1A;
}

.score-time {
  font-size: 13px;
  color: #8E8E93;
}

.score-body {
  display: flex;
  justify-content: center;
}

.score-ring {
  position: relative;
  width: 140px;
  height: 140px;
}

.score-ring svg {
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: #E5E5EA;
  stroke-width: 8;
}

.ring-progress {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 263.89;
  transition: stroke-dashoffset 1s ease;
}

.score-card.excellent .ring-progress { stroke: #34C759; }
.score-card.good .ring-progress { stroke: #007AFF; }
.score-card.average .ring-progress { stroke: #FF9500; }
.score-card.improve .ring-progress { stroke: #FF3B30; }

.score-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-number {
  font-size: 42px;
  font-weight: 700;
  color: #1A1A1A;
  line-height: 1;
}

.score-label {
  font-size: 16px;
  font-weight: 500;
  color: #8E8E93;
  margin-top: 4px;
}

.score-card.excellent .score-label { color: #34C759; }
.score-card.good .score-label { color: #007AFF; }
.score-card.average .score-label { color: #FF9500; }
.score-card.improve .score-label { color: #FF3B30; }

.error-card {
  padding: 20px;
  border-radius: 14px;
  text-align: center;
  margin-bottom: 16px;
  background: rgba(255, 59, 48, 0.08);
}

.error-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.error-text {
  font-size: 16px;
  font-weight: 600;
  color: #FF3B30;
  margin-bottom: 4px;
}

.error-hint {
  font-size: 13px;
  color: #8E8E93;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 12px;
}

.angles-card {
  border-radius: 14px;
  padding: 4px 16px;
}

.angle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.angle-row:last-child {
  border-bottom: none;
}

.angle-info {
  flex: 1;
  margin-right: 16px;
}

.angle-name {
  font-size: 15px;
  font-weight: 500;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.angle-bar-container {
  position: relative;
  height: 24px;
}

.angle-optimal-range {
  position: absolute;
  top: 8px;
  height: 8px;
  background: rgba(52, 199, 89, 0.2);
  border-radius: 4px;
}

.angle-bar {
  position: absolute;
  top: 8px;
  left: 0;
  right: 0;
  height: 8px;
  background: #E5E5EA;
  border-radius: 4px;
  overflow: visible;
}

.angle-fill {
  height: 100%;
  background: linear-gradient(90deg, #007AFF, #5856D6);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.angle-marker {
  position: absolute;
  top: -4px;
  width: 16px;
  height: 16px;
  background: #007AFF;
  border-radius: 50%;
  transform: translateX(-50%);
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.4);
}

.angle-value {
  font-size: 18px;
  font-weight: 600;
  color: #8E8E93;
}

.angle-value.good {
  color: #34C759;
}

.angle-value.warn {
  color: #FF9500;
}

.strengths-card, .issues-card {
  border-radius: 14px;
  padding: 8px 16px;
}

.strength-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.strength-item:last-child {
  border-bottom: none;
}

.strength-icon {
  width: 28px;
  height: 28px;
  background: rgba(52, 199, 89, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #34C759;
  font-weight: 600;
}

.strength-name {
  font-weight: 600;
  color: #1A1A1A;
  margin-right: 8px;
}

.strength-desc {
  color: #8E8E93;
  font-size: 14px;
}

.issue-item {
  padding: 14px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.issue-item:last-child {
  border-bottom: none;
}

.issue-item.high {
  background: rgba(255, 59, 48, 0.05);
  margin: 0 -16px;
  padding: 14px 16px;
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.issue-name {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A1A;
}

.issue-diff {
  font-size: 13px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 149, 0, 0.15);
  color: #FF9500;
}

.issue-item.high .issue-diff {
  background: rgba(255, 59, 48, 0.15);
  color: #FF3B30;
}

.issue-detail {
  font-size: 13px;
  color: #8E8E93;
  margin-bottom: 6px;
}

.user-value {
  margin-right: 16px;
}

.optimal-value {
  color: #34C759;
}

.issue-suggestion {
  font-size: 14px;
  color: #007AFF;
  line-height: 1.5;
}

.reference-card {
  border-radius: 14px;
  overflow: hidden;
}

.reference-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: #F2F5F9;
}

.reference-tips {
  padding: 16px;
}

.tip-item {
  font-size: 14px;
  color: #1A1A1A;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-left: 16px;
  position: relative;
}

.tip-item:last-child {
  border-bottom: none;
}

.tip-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #007AFF;
  font-weight: bold;
}

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
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #007AFF;
  color: white;
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-secondary {
  background: rgba(0, 0, 0, 0.05);
  color: #007AFF;
}

.btn-secondary:active {
  transform: scale(0.98);
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 16px;
}

.no-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.no-text {
  font-size: 16px;
  color: #8E8E93;
  margin-bottom: 24px;
}
</style>