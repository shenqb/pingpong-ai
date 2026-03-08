<template>
  <div class="home-page">
    <!-- 头部 -->
    <div class="header">
      <div class="logo">🏓</div>
      <h1>乒乓 AI 教练</h1>
      <p class="slogan">你的随身专业乒乓球教练</p>
    </div>

    <!-- 社会证明 -->
    <van-card class="stats-card">
      <template #num>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-num">1,234</div>
            <div class="stat-label">已帮助球友</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">87%</div>
            <div class="stat-label">动作识别准确率</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">¥50,000+</div>
            <div class="stat-label">节省教练费</div>
          </div>
        </div>
      </template>
    </van-card>

    <!-- 核心功能 -->
    <div class="main-action">
      <van-button type="primary" size="large" round block @click="goToRealtime">
        📹 实时分析动作
      </van-button>
      <p class="action-desc">支持：正手/反手/发球</p>
    </div>

    <!-- 次要功能 -->
    <div class="secondary-actions">
      <van-button plain round @click="goToHistory">📊 分析历史</van-button>
      <van-button plain round @click="goToTutorials">📚 动作教程</van-button>
    </div>

    <!-- 热门内容 -->
    <van-card title="🔥 热门：正手攻球常见错误" class="hot-content">
      <template #default>
        <div class="hot-item">
          <span>腕部下压不足</span>
          <van-button type="link" size="small">查看纠正方法 →</van-button>
        </div>
      </template>
    </van-card>

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab">
      <van-tabbar-item icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item icon="search">分析</van-tabbar-item>
      <van-tabbar-item icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref(0)

const goToRealtime = () => {
  router.push('/realtime')
}

const goToHistory = () => {
  router.push('/history')
}

const goToTutorials = () => {
  // TODO: 实现教程页面
  console.log('跳转到教程页面')
}
</script>

<style scoped>
.home-page {
  padding: 16px;
  padding-bottom: 60px;
  max-width: 480px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 16px;
  padding: 20px 0;
}

.logo {
  font-size: 56px;
  margin-bottom: 8px;
}

.header h1 {
  margin: 8px 0;
  font-size: 22px;
  font-weight: 600;
}

.slogan {
  color: #666;
  font-size: 13px;
  margin: 0;
}

.stats-card {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  text-align: center;
  padding: 12px 0;
}

.stat-num {
  font-size: 16px;
  font-weight: bold;
  color: #1989fa;
}

.stat-label {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  line-height: 1.3;
}

.main-action {
  margin: 24px 0;
}

.action-desc {
  text-align: center;
  color: #666;
  font-size: 12px;
  margin-top: 8px;
}

.secondary-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.secondary-actions .van-button {
  flex: 1;
  height: 40px;
  font-size: 14px;
}

.hot-content {
  margin-bottom: 16px;
  border-radius: 12px;
}

.hot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

/* 移动端优化 */
@media (max-width: 375px) {
  .stat-num {
    font-size: 14px;
  }
  .stat-label {
    font-size: 10px;
  }
  .header h1 {
    font-size: 20px;
  }
}
</style>
