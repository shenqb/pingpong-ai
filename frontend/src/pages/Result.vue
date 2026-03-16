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
          <div class="score-time">{{ result.confidence * 100 | 0 }}% 置信度</div>
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

      <!-- 快速统计 -->
      <div class="quick-stats">
        <div class="quick-stat glass-card">
          <div class="qs-value">{{ Object.keys(result.angles || {}).length }}</div>
          <div class="qs-label">检测角度</div>
        </div>
        <div class="quick-stat glass-card">
          <div class="qs-value">+5</div>
          <div class="qs-label">比上次</div>
        </div>
        <div class="quick-stat glass-card">
          <div class="qs-value">{{ improvement }}%</div>
          <div class="qs-label">总进步</div>
        </div>
      </div>

      <!-- 角度分析 -->
      <section class="section" v-if="result.angles">
        <div class="section-title">角度分析</div>
        <div class="angles-card glass-card">
          <div class="angle-row" v-for="(value, key) in result.angles" :key="key">
            <div class="angle-info">
              <div class="angle-name">{{ getJointName(key) }}</div>
              <div class="angle-bar">
                <div class="angle-fill" :style="{ width: (value / 180) * 100 + '%' }"></div>
              </div>
            </div>
            <div class="angle-value">{{ value }}°</div>
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
              <div class="issue-diff">调整 {{ issue.severity === 'high' ? '重点' : '建议' }}</div>
            </div>
            <div class="issue-suggestion">{{ issue.suggestion }}</div>
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
const improvement = ref(15)

const standardActions = {
  forehand: { name: '正手攻球', angles: { leftElbow: { optimal: 90, range: [70, 110] } } },
  backhand: { name: '反手推挡', angles: {} },
  forehand_loop: { name: '正手拉弧圈', angles: {} },
  serve: { name: '发球', angles: {} }
}

const scoreClass = computed(() => {
  const s = result.value?.score || 0
  if (s >= 90) return 'excellent'
  if (s >= 80) return 'good'
  if (s >= 70) return 'average'
  return 'improve'
})

const scoreOffset = computed(() => {
  const circumference = 2 * Math.PI * 42
  return circumference * (1 - (result.value?.score || 0) / 100)
})

const getActionName = (action) => standardActions[action]?.name || '动作分析'

const getJointName = (key) => {
  const names = { leftElbow: '左肘', rightElbow: '右肘', leftKnee: '左膝', rightKnee: '右膝', torso: '躯干' }
  return names[key] || key
}

const shareResult = () => {}

onMounted(() => {
  const saved = sessionStorage.getItem('analysisResult')
  if (saved) result.value = JSON.parse(saved)
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

/* 主内容 */
.main-content {
  padding: 16px;
}

/* 分数卡片 */
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

/* 快速统计 */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.quick-stat {
  border-radius: 14px;
  padding: 16px;
  text-align: center;
}

.qs-value {
  font-size: 24px;
  font-weight: 700;
  color: #1A1A1A;
}

.qs-label {
  font-size: 12px;
  color: #8E8E93;
  margin-top: 4px;
}

/* Section */
.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 12px;
}

/* 角度卡片 */
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

.angle-bar {
  height: 6px;
  background: #E5E5EA;
  border-radius: 3px;
  overflow: hidden;
}

.angle-fill {
  height: 100%;
  background: linear-gradient(90deg, #007AFF, #5856D6);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.angle-value {
  font-size: 18px;
  font-weight: 600;
  color: #007AFF;
}

/* 优点卡片 */
.strengths-card {
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

/* 问题卡片 */
.issues-card {
  border-radius: 14px;
  padding: 8px 16px;
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
  font-size: 12px;
  color: #8E8E93;
}

.issue-item.high .issue-diff {
  color: #FF3B30;
}

.issue-suggestion {
  font-size: 14px;
  color: #8E8E93;
  line-height: 1.5;
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

/* 无数据 */
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