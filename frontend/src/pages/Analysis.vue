<template>
  <div class="analysis-page">
    <van-nav-bar title="动作分析" />

    <!-- 功能入口 -->
    <div class="function-grid">
      <div class="function-item" @click="goToUpload">
        <div class="function-icon">📁</div>
        <div class="function-name">上传视频</div>
        <div class="function-desc">从相册选择</div>
      </div>
      <div class="function-item" @click="goToRealtime">
        <div class="function-icon">📹</div>
        <div class="function-name">实时录制</div>
        <div class="function-desc">摄像头录制</div>
      </div>
      <div class="function-item" @click="goToActions">
        <div class="function-icon">📚</div>
        <div class="function-name">标准动作库</div>
        <div class="function-desc">11 个职业动作</div>
      </div>
      <div class="function-item" @click="goToHistory">
        <div class="function-icon">📊</div>
        <div class="function-name">分析历史</div>
        <div class="function-desc">查看历史记录</div>
      </div>
    </div>

    <!-- 快速开始 -->
    <div class="quick-start">
      <h2>🚀 快速开始</h2>
      <van-steps direction="horizontal" :active="0">
        <van-step>上传视频</van-step>
        <van-step>AI 分析</van-step>
        <van-step>查看报告</van-step>
      </van-steps>
    </div>

    <!-- 最近分析 -->
    <div class="recent-analysis">
      <h2>📈 最近分析</h2>
      <div class="recent-list" v-if="recentRecords.length > 0">
        <div
          v-for="record in recentRecords"
          :key="record.id"
          class="recent-item"
          @click="viewRecord(record)"
        >
          <div class="recent-info">
            <div class="recent-name">{{ record.action_name }}</div>
            <div class="recent-meta">
              <span class="recent-score" :class="getScoreClass(record.score)">
                {{ record.score }}分
              </span>
              <span class="recent-date">{{ formatDate(record.created_at) }}</span>
            </div>
          </div>
          <van-icon name="arrow" />
        </div>
      </div>
      <van-empty v-else description="暂无分析记录" />
    </div>

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="search" to="/analysis" badge="new">分析</van-tabbar-item>
      <van-tabbar-item icon="friends-o" to="/actions">动作库</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const activeTab = ref(1)
const recentRecords = ref([])

// 加载最近记录
const loadRecentRecords = async () => {
  try {
    const res = await axios.get('/api/history/list?limit=5')
    if (res.data.success) {
      recentRecords.value = res.data.data.records
    }
  } catch (error) {
    console.error('加载失败:', error)
  }
}

// 跳转函数
const goToUpload = () => {
  router.push('/upload')
}

const goToRealtime = () => {
  router.push('/realtime')
}

const goToActions = () => {
  router.push('/actions')
}

const goToHistory = () => {
  router.push('/history')
}

const viewRecord = (record) => {
  router.push(`/result?id=${record.id}`)
}

// 辅助函数
const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 75) return 'score-good'
  if (score >= 60) return 'score-fair'
  return 'score-poor'
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

onMounted(() => {
  loadRecentRecords()
})
</script>

<style scoped>
.analysis-page {
  padding-bottom: 60px;
  max-width: 480px;
  margin: 0 auto;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px;
  background: white;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.function-icon {
  font-size: 32px;
}

.function-name {
  font-size: 13px;
  font-weight: 500;
}

.function-desc {
  font-size: 11px;
  color: #999;
}

.quick-start {
  margin: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.quick-start h2 {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.recent-analysis {
  margin: 16px;
}

.recent-analysis h2 {
  margin: 0 0 12px 0;
  font-size: 16px;
}

.recent-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f7f8fa;
  cursor: pointer;
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-info {
  flex: 1;
}

.recent-name {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 8px;
}

.recent-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recent-score {
  font-size: 14px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.recent-score.score-excellent { background: #e8f5e9; color: #07c160; }
.recent-score.score-good { background: #e3f2fd; color: #1989fa; }
.recent-score.score-fair { background: #fff7e6; color: #ff976a; }
.recent-score.score-poor { background: #ffebeb; color: #ee0a24; }

.recent-date {
  font-size: 12px;
  color: #999;
}
</style>
