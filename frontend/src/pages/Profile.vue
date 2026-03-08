<template>
  <div class="profile-page">
    <van-nav-bar title="我的" />

    <div class="profile-content">
      <!-- 用户信息 -->
      <van-card class="user-card">
        <template #thumb>
          <div class="avatar">👤</div>
        </template>
        <template #title>
          <span class="username">乒乓球爱好者</span>
        </template>
        <template #desc>
          <div class="user-info">
            <span>球龄：2 年</span>
            <van-tag type="primary" size="mini">进阶爱好者 🏓</van-tag>
          </div>
        </template>
      </van-card>

      <!-- 本月统计 -->
      <van-card title="📊 训练统计" class="stats-card">
        <template #default>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-num">{{ stats.total }}</div>
              <div class="stat-label">分析次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">{{ stats.avgScore }}</div>
              <div class="stat-label">平均分</div>
            </div>
            <div class="stat-item">
              <div class="stat-num up">{{ stats.bestScore }}</div>
              <div class="stat-label">最佳</div>
            </div>
          </div>
        </template>
      </van-card>

      <!-- 功能菜单 -->
      <van-cell-group class="menu-group">
        <van-cell
          title="分析历史"
          label="查看历史分析记录"
          icon="records"
          is-link
          @click="goToHistory"
        />
        <van-cell
          title="动作教程"
          label="学习标准动作"
          icon="video-o"
          is-link
        />
        <van-cell
          title="设置"
          label="应用设置"
          icon="setting-o"
          is-link
        />
        <van-cell
          title="帮助与反馈"
          label="使用帮助"
          icon="question-o"
          is-link
        />
      </van-cell>

      <!-- 会员服务 -->
      <van-card title="💎 会员服务" class="vip-card">
        <template #default>
          <div class="vip-content">
            <div class="vip-status">
              <span>当前：免费版</span>
              <van-tag type="danger">剩余：{{ freeCount }} 次分析</van-tag>
            </div>
            <div class="vip-benefits">
              <h4>开通会员享受：</h4>
              <ul>
                <li>✅ 无限次分析</li>
                <li>✅ 个性化训练计划</li>
                <li>✅ 实时视频分析</li>
                <li>✅ 历史数据对比</li>
              </ul>
            </div>
            <van-button type="primary" size="large" round block>
              🎉 首月仅需 ¥9.9
            </van-button>
          </div>
        </template>
      </van-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const stats = ref({ total: 0, avgScore: 0, bestScore: 0 })
const freeCount = ref(3)

const goToHistory = () => {
  router.push('/history')
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await fetch('/api/history/stats')
    const result = await response.json()
    
    if (result.success) {
      stats.value = {
        total: result.data.total,
        avgScore: result.data.avgScore,
        bestScore: result.data.bestScore
      }
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.profile-page {
  padding-bottom: 20px;
  max-width: 480px;
  margin: 0 auto;
}

.profile-content {
  padding: 16px;
}

.user-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.avatar {
  font-size: 48px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
}

.username {
  font-size: 18px;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.stats-card, .vip-card {
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

.stat-num.up {
  color: #07c160;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.menu-group {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
}

.vip-content {
  text-align: center;
  padding: 8px 0;
}

.vip-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.vip-benefits {
  text-align: left;
  margin: 15px 0;
}

.vip-benefits h4 {
  margin: 10px 0;
  font-size: 14px;
}

.vip-benefits ul {
  margin: 0;
  padding-left: 20px;
}

.vip-benefits li {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}
</style>
