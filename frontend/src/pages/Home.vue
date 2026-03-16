<template>
  <div class="ios-app">
    <!-- 状态栏占位 -->
    <div class="status-bar"></div>

    <!-- 主内容 -->
    <main class="main-content">
      <!-- Hero 区域 -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-title">🏓 PingPong AI</div>
          <div class="hero-subtitle">你的专属乒乓球教练</div>
        </div>

        <!-- 今日统计卡片 -->
        <div class="stats-card glass-card">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ todayAnalysis }}</div>
              <div class="stat-label">今日分析</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">{{ avgScore }}</div>
              <div class="stat-label">平均分</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">+{{ improvement }}%</div>
              <div class="stat-label">进步</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 快捷入口 -->
      <section class="section">
        <div class="section-header">
          <h2>开始训练</h2>
        </div>
        <div class="action-grid">
          <div class="action-card glass-card" @click="$router.push('/upload')">
            <div class="action-icon blue">
              <span>📊</span>
            </div>
            <div class="action-info">
              <div class="action-title">动作分析</div>
              <div class="action-desc">上传视频获取 AI 评分</div>
            </div>
            <div class="action-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

          <div class="action-card glass-card" @click="$router.push('/standard')">
            <div class="action-icon green">
              <span>🎯</span>
            </div>
            <div class="action-info">
              <div class="action-title">标准动作</div>
              <div class="action-desc">学习职业选手动作</div>
            </div>
            <div class="action-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

          <div class="action-card glass-card" @click="$router.push('/history')">
            <div class="action-icon orange">
              <span>📈</span>
            </div>
            <div class="action-info">
              <div class="action-title">历史记录</div>
              <div class="action-desc">查看训练进度</div>
            </div>
            <div class="action-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- 最近分析 -->
      <section class="section" v-if="recentAnalysis.length">
        <div class="section-header">
          <h2>最近分析</h2>
          <span class="see-all" @click="$router.push('/history')">查看全部</span>
        </div>
        <div class="recent-list">
          <div 
            class="recent-item glass-card" 
            v-for="item in recentAnalysis" 
            :key="item.id"
            @click="viewAnalysis(item)"
          >
            <div class="recent-score" :class="getScoreClass(item.score)">
              {{ item.score }}
            </div>
            <div class="recent-info">
              <div class="recent-action">{{ item.actionName }}</div>
              <div class="recent-time">{{ item.time }}</div>
            </div>
            <div class="recent-trend" :class="item.trend">
              <span v-if="item.trend === 'up'">↑</span>
              <span v-else-if="item.trend === 'down'">↓</span>
              <span v-else>→</span>
              <span>{{ Math.abs(item.change) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 推荐训练 -->
      <section class="section">
        <div class="section-header">
          <h2>推荐训练</h2>
        </div>
        <div class="recommend-scroll">
          <div class="recommend-card" v-for="rec in recommendations" :key="rec.id">
            <div class="rec-icon">{{ rec.icon }}</div>
            <div class="rec-title">{{ rec.title }}</div>
            <div class="rec-level" :class="rec.difficulty">{{ rec.level }}</div>
            <div class="rec-duration">{{ rec.duration }}分钟</div>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部 Tab Bar -->
    <nav class="tab-bar glass-card">
      <div class="tab-item active" @click="$router.push('/')">
        <div class="tab-icon">🏠</div>
        <div class="tab-label">首页</div>
      </div>
      <div class="tab-item" @click="$router.push('/upload')">
        <div class="tab-icon">📊</div>
        <div class="tab-label">分析</div>
      </div>
      <div class="tab-item center" @click="$router.push('/upload')">
        <div class="tab-center-btn">
          <span>+</span>
        </div>
      </div>
      <div class="tab-item" @click="$router.push('/standard')">
        <div class="tab-icon">🎯</div>
        <div class="tab-label">学习</div>
      </div>
      <div class="tab-item" @click="$router.push('/profile')">
        <div class="tab-icon">👤</div>
        <div class="tab-label">我的</div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const todayAnalysis = ref(3)
const avgScore = ref(82)
const improvement = ref(15)

const recentAnalysis = ref([
  { id: 1, score: 85, actionName: '正手攻球', time: '10分钟前', trend: 'up', change: 5 },
  { id: 2, score: 78, actionName: '反手推挡', time: '1小时前', trend: 'down', change: 3 },
  { id: 3, score: 92, actionName: '正手拉弧圈', time: '昨天', trend: 'up', change: 8 }
])

const recommendations = ref([
  { id: 1, icon: '🏓', title: '正手攻球基础', level: '入门', difficulty: 'easy', duration: 15 },
  { id: 2, icon: '🎯', title: '反手强化', level: '进阶', difficulty: 'medium', duration: 20 },
  { id: 3, icon: '🔥', title: '弧圈球技术', level: '高级', difficulty: 'hard', duration: 25 }
])

const getScoreClass = (score) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'average'
  return 'improve'
}

const viewAnalysis = (item) => {
  router.push('/result')
}
</script>

<style scoped>
/* iOS 风格基础 */
.ios-app {
  min-height: 100vh;
  background: linear-gradient(180deg, #F2F5F9 0%, #FFFFFF 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
  padding-bottom: 100px;
}

/* 状态栏 */
.status-bar {
  height: env(safe-area-inset-top, 44px);
  background: transparent;
}

/* 毛玻璃卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

/* 主内容 */
.main-content {
  padding: 0 16px;
}

/* Hero 区域 */
.hero-section {
  padding: 20px 0 24px;
}

.hero-content {
  margin-bottom: 20px;
}

.hero-title {
  font-size: 32px;
  font-weight: 700;
  color: #1A1A1A;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 16px;
  color: #8E8E93;
  margin-top: 4px;
}

/* 统计卡片 */
.stats-card {
  border-radius: 20px;
  padding: 24px 16px;
}

.stats-grid {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1A1A1A;
}

.stat-label {
  font-size: 13px;
  color: #8E8E93;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #E5E5EA;
}

/* Section */
.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1A1A1A;
}

.see-all {
  font-size: 14px;
  color: #007AFF;
  cursor: pointer;
}

/* 动作入口 */
.action-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.9);
}

.action-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.action-icon.blue {
  background: linear-gradient(135deg, #007AFF, #5856D6);
}

.action-icon.green {
  background: linear-gradient(135deg, #34C759, #30D158);
}

.action-icon.orange {
  background: linear-gradient(135deg, #FF9500, #FF6B00);
}

.action-info {
  flex: 1;
}

.action-title {
  font-size: 17px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 2px;
}

.action-desc {
  font-size: 14px;
  color: #8E8E93;
}

.action-arrow {
  color: #C7C7CC;
}

/* 最近分析 */
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.recent-item:active {
  transform: scale(0.98);
}

.recent-score {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.recent-score.excellent { background: linear-gradient(135deg, #34C759, #30D158); }
.recent-score.good { background: linear-gradient(135deg, #007AFF, #5856D6); }
.recent-score.average { background: linear-gradient(135deg, #FF9500, #FF6B00); }
.recent-score.improve { background: linear-gradient(135deg, #FF3B30, #FF453A); }

.recent-info {
  flex: 1;
}

.recent-action {
  font-size: 16px;
  font-weight: 500;
  color: #1A1A1A;
}

.recent-time {
  font-size: 13px;
  color: #8E8E93;
  margin-top: 2px;
}

.recent-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
}

.recent-trend.up {
  color: #34C759;
  background: rgba(52, 199, 89, 0.12);
}

.recent-trend.down {
  color: #FF3B30;
  background: rgba(255, 59, 48, 0.12);
}

/* 推荐训练 */
.recommend-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}

.recommend-scroll::-webkit-scrollbar {
  display: none;
}

.recommend-card {
  min-width: 140px;
  background: white;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.rec-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.rec-title {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 6px;
}

.rec-level {
  display: inline-block;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 10px;
  margin-bottom: 8px;
}

.rec-level.easy {
  background: rgba(52, 199, 89, 0.12);
  color: #34C759;
}

.rec-level.medium {
  background: rgba(255, 149, 0, 0.12);
  color: #FF9500;
}

.rec-level.hard {
  background: rgba(255, 59, 48, 0.12);
  color: #FF3B30;
}

.rec-duration {
  font-size: 13px;
  color: #8E8E93;
}

/* 底部 Tab Bar */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding: 8px 16px 28px;
  background: rgba(255, 255, 255, 0.85);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.2s;
}

.tab-item.active {
  opacity: 1;
}

.tab-icon {
  font-size: 24px;
}

.tab-label {
  font-size: 10px;
  color: #1A1A1A;
}

.tab-item.center {
  margin-top: -20px;
}

.tab-center-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007AFF, #5856D6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.4);
}

.tab-center-btn:active {
  transform: scale(0.95);
}
</style>