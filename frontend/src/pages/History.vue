<template>
  <div class="history-page">
    <van-nav-bar title="分析历史" left-arrow @click-left="$router.back()" />

    <div class="history-content">
      <!-- 统计卡片 -->
      <van-card v-if="stats.total > 0" class="stats-card">
        <template #default>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-num">{{ stats.total }}</div>
              <div class="stat-label">总次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">{{ stats.avgScore }}</div>
              <div class="stat-label">平均分</div>
            </div>
            <div class="stat-item">
              <div class="stat-num best">{{ stats.bestScore }}</div>
              <div class="stat-label">最佳</div>
            </div>
          </div>
        </template>
      </van-card>

      <!-- 历史记录列表 -->
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell
          v-for="item in historyList"
          :key="item.id"
          clickable
          @click="viewDetail(item)"
        >
          <template #title>
            <div class="history-item">
              <div class="item-header">
                <span class="action-type">{{ getActionName(item.actionType) }}</span>
                <van-tag :type="getScoreType(item.score)">{{ item.score }}分</van-tag>
              </div>
              <div class="item-desc">
                <span>{{ item.level }}</span>
                <span class="item-angle">{{ getAngleName(item.angle) }}</span>
              </div>
              <div class="item-time">{{ formatTime(item.timestamp) }}</div>
            </div>
          </template>
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell>
      </van-list>

      <!-- 空状态 -->
      <van-empty v-if="!loading && historyList.length === 0" description="暂无分析记录" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

const historyList = ref([])
const loading = ref(false)
const finished = ref(true)
const stats = ref({ total: 0, avgScore: 0, bestScore: 0 })

// 加载历史记录
const onLoad = async () => {
  try {
    const response = await fetch('/api/history/list')
    const result = await response.json()
    
    if (result.success) {
      historyList.value = result.data.records
      stats.value = {
        total: result.data.total,
        avgScore: result.data.avgScore || 0,
        bestScore: result.data.bestScore || 0
      }
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
    showToast('加载失败')
  } finally {
    loading.value = false
    finished.value = true
  }
}

// 查看详情
const viewDetail = (item) => {
  // 保存选中记录到 sessionStorage
  sessionStorage.setItem('currentHistory', JSON.stringify(item))
  router.push('/result')
}

// 获取动作名称
const getActionName = (type) => {
  const map = {
    forehand: '正手攻球',
    backhand: '反手推挡',
    serve: '发球'
  }
  return map[type] || type
}

// 获取角度名称
const getAngleName = (angle) => {
  const map = {
    side: '侧面',
    front: '正面'
  }
  return map[angle] || angle
}

// 获取分数类型
const getScoreType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  return 'danger'
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.history-page {
  padding-bottom: 20px;
  max-width: 480px;
  margin: 0 auto;
}

.history-content {
  padding: 16px;
}

.stats-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  text-align: center;
  padding: 12px 0;
}

.stat-num {
  font-size: 20px;
  font-weight: bold;
  color: #1989fa;
}

.stat-num.best {
  color: #07c160;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.history-item {
  padding: 8px 0;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.action-type {
  font-size: 15px;
  font-weight: 600;
}

.item-desc {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.item-angle {
  color: #999;
}

.item-time {
  font-size: 12px;
  color: #999;
}
</style>
