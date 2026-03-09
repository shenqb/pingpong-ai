<template>
  <div class="standard-actions-page">
    <!-- 头部 -->
    <div class="header">
      <h1>📚 标准动作库</h1>
      <p class="desc">11 个职业选手标准动作参考</p>
    </div>

    <!-- 分类筛选 -->
    <van-tabs v-model:active="activeCategory" @change="onCategoryChange">
      <van-tab title="全部" name="all"></van-tab>
      <van-tab title="正手" name="forehand"></van-tab>
      <van-tab title="反手" name="backhand"></van-tab>
      <van-tab title="发球" name="serve"></van-tab>
    </van-tabs>

    <!-- 难度筛选 -->
    <div class="filter-bar">
      <van-tag plain :type="difficulty === 'all' ? 'primary' : 'default'" @click="difficulty = 'all'">全部</van-tag>
      <van-tag plain :type="difficulty === 'basic' ? 'primary' : 'default'" @click="difficulty = 'basic'">基础</van-tag>
      <van-tag plain :type="difficulty === 'intermediate' ? 'primary' : 'default'" @click="difficulty = 'intermediate'">中级</van-tag>
      <van-tag plain :type="difficulty === 'advanced' ? 'primary' : 'default'" @click="difficulty = 'advanced'">高级</van-tag>
    </div>

    <!-- 动作列表 -->
    <div class="action-list">
      <div 
        v-for="action in filteredActions" 
        :key="action.id"
        class="action-card"
        @click="viewActionDetail(action)"
      >
        <div class="action-header">
          <div class="action-icon">{{ getCategoryIcon(action.category) }}</div>
          <div class="action-info">
            <h3>{{ action.action_name }}</h3>
            <div class="action-meta">
              <van-tag size="mini" :type="getLevelType(action.level)">{{ getLevelText(action.level) }}</van-tag>
              <span class="player-name">🏆 {{ action.player_name }}</span>
            </div>
          </div>
        </div>
        <p class="action-desc">{{ action.description }}</p>
        <div class="action-keypoints">
          <span class="kp-label">关键角度:</span>
          <div class="kp-list">
            <span v-for="(value, key) in parseKeypoints(action.keypoints_json)" :key="key" class="kp-item">
              {{ getKeypointName(key) }}: {{ value.optimal }}°
            </span>
          </div>
        </div>
        <div class="action-footer">
          <van-button size="small" type="primary" plain @click.stop="compareAction(action)">
            🆚 对比我的动作
          </van-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty v-if="filteredActions.length === 0" description="暂无动作数据" />

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="search" to="/realtime">分析</van-tabbar-item>
      <van-tabbar-item icon="friends-o" to="/actions" badge="11">动作库</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import axios from 'axios'

const router = useRouter()
const activeTab = ref(2)
const activeCategory = ref('all')
const difficulty = ref('all')
const actions = ref([])
const loading = ref(false)

// 加载标准动作列表
const loadActions = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/standard/list')
    if (res.data.success) {
      actions.value = res.data.data.actions
    }
  } catch (error) {
    showToast('加载失败，请重试')
    console.error('加载标准动作失败:', error)
  } finally {
    loading.value = false
  }
}

// 筛选后的动作列表
const filteredActions = computed(() => {
  return actions.value.filter(action => {
    const categoryMatch = activeCategory.value === 'all' || action.category === activeCategory.value
    const difficultyMatch = difficulty.value === 'all' || action.level === difficulty.value
    return categoryMatch && difficultyMatch
  })
})

// 分类变更
const onCategoryChange = () => {
  // 可以添加埋点统计
}

// 查看动作详情
const viewActionDetail = (action) => {
  router.push(`/actions/${action.id}`)
}

// 对比动作
const compareAction = (action) => {
  router.push({ 
    path: '/compare', 
    query: { standardId: action.id, standardName: action.action_name }
  })
}

// 辅助函数
const getCategoryIcon = (category) => {
  const icons = { forehand: '🏓', backhand: '🔄', serve: '🎯' }
  return icons[category] || '📋'
}

const getLevelType = (level) => {
  const types = { basic: 'success', intermediate: 'warning', advanced: 'danger' }
  return types[level] || 'default'
}

const getLevelText = (level) => {
  const texts = { basic: '基础', intermediate: '中级', advanced: '高级' }
  return texts[level] || level
}

const getKeypointName = (key) => {
  const names = { elbow: '肘部', knee: '膝部', torso: '躯干', wrist: '手腕' }
  return names[key] || key
}

const parseKeypoints = (jsonStr) => {
  try {
    return JSON.parse(jsonStr || '{}')
  } catch {
    return {}
  }
}

onMounted(() => {
  loadActions()
})
</script>

<style scoped>
.standard-actions-page {
  padding-bottom: 60px;
  max-width: 480px;
  margin: 0 auto;
}

.header {
  padding: 16px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header h1 {
  margin: 0 0 4px 0;
  font-size: 20px;
}

.header .desc {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
}

.filter-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  flex-wrap: wrap;
}

.filter-bar .van-tag {
  padding: 4px 12px;
  cursor: pointer;
}

.action-list {
  padding: 0 16px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.2s;
}

.action-card:active {
  transform: scale(0.98);
}

.action-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.action-icon {
  font-size: 32px;
  margin-right: 12px;
}

.action-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.action-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-name {
  font-size: 12px;
  color: #666;
}

.action-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.action-keypoints {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.kp-label {
  font-size: 12px;
  color: #666;
  display: block;
  margin-bottom: 8px;
}

.kp-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.kp-item {
  font-size: 11px;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  color: #333;
}

.action-footer {
  text-align: right;
}

.action-footer .van-button {
  width: 100%;
}

/* 移动端优化 */
@media (max-width: 375px) {
  .action-info h3 {
    font-size: 15px;
  }
  .kp-item {
    font-size: 10px;
  }
}
</style>
