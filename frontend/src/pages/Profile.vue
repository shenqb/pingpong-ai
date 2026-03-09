<template>
  <div class="profile-page">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-info">
        <van-image
          round
          width="64"
          height="64"
          :src="user.avatar || 'https://img.yzcdn.cn/vant/user-active.png'"
          class="avatar"
        />
        <div class="user-details">
          <div class="user-name">{{ user.nickname || '球友' }}</div>
          <div class="user-phone">{{ user.phone || '未登录' }}</div>
        </div>
      </div>
      <div class="user-stats">
        <div class="stat-item">
          <div class="stat-num">{{ stats.totalAnalysis }}</div>
          <div class="stat-label">分析次数</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-num">{{ stats.bestScore }}</div>
          <div class="stat-label">最佳得分</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-num">{{ stats.continuousDays }}</div>
          <div class="stat-label">连续天数</div>
        </div>
      </div>
    </div>

    <!-- VIP 卡片 -->
    <div class="vip-card" @click="goToVip">
      <div class="vip-info">
        <div class="vip-title">
          <van-icon name="vip" size="20" />
          <span>开通 VIP 会员</span>
        </div>
        <div class="vip-desc">解锁全部标准动作和高级分析</div>
      </div>
      <van-button size="small" type="warning" round>立即开通</van-button>
    </div>

    <!-- 功能菜单 -->
    <van-cell-group class="menu-group">
      <van-cell title="我的训练计划" icon="todo-list-o" is-link />
      <van-cell title="我的收藏" icon="star-o" is-link />
      <van-cell title="数据分析" icon="chart-trending-o" is-link badge="Beta" />
      <van-cell title="设备管理" icon="desktop-o" is-link />
    </van-cell-group>

    <van-cell-group class="menu-group">
      <van-cell title="设置" icon="setting-o" is-link @click="showSettings" />
      <van-cell title="帮助与反馈" icon="question-o" is-link />
      <van-cell title="关于我们" icon="info-o" is-link />
    </van-cell-group>

    <!-- 退出登录 -->
    <div class="logout-section" v-if="isLoggedIn">
      <van-button plain block type="danger" @click="logout">
        退出登录
      </van-button>
    </div>

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="search" to="/analysis">分析</van-tabbar-item>
      <van-tabbar-item icon="friends-o" to="/actions">动作库</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>

    <!-- 设置弹窗 -->
    <van-action-sheet
      v-model:show="showSettingsPanel"
      title="设置"
      :actions="settingsActions"
      @select="onSettingsSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'

const router = useRouter()
const activeTab = ref(3)
const showSettingsPanel = ref(false)
const user = ref({})
const stats = ref({
  totalAnalysis: 0,
  bestScore: 0,
  continuousDays: 0
})

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token')
})

const settingsActions = [
  { name: '修改密码' },
  { name: '账号与安全' },
  { name: '清除缓存' },
  { name: '检查更新' }
]

// 加载用户信息
const loadUserInfo = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    user.value = JSON.parse(userStr)
  }
  
  // 加载统计数据（从 API 或本地）
  stats.value = {
    totalAnalysis: 12,
    bestScore: 95,
    continuousDays: 3
  }
}

// 退出登录
const logout = () => {
  showDialog({
    title: '确认退出',
    message: '确定要退出登录吗？',
    showCancelButton: true,
    confirmButtonText: '确定退出',
    cancelButtonText: '取消'
  }).then(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    user.value = {}
    showToast('已退出登录')
    router.push('/login')
  }).catch(() => {
    // 取消退出
  })
}

// 显示设置
const showSettings = () => {
  showSettingsPanel.value = true
}

// 设置选项处理
const onSettingsSelect = (action) => {
  showToast(`${action.name}开发中`)
}

// 跳转 VIP
const goToVip = () => {
  showToast('VIP 页面开发中')
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 60px;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 16px 16px;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.user-phone {
  font-size: 13px;
  opacity: 0.8;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  padding: 16px;
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.stat-divider {
  width: 1px;
  background: rgba(255,255,255,0.3);
}

.vip-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 12px;
  cursor: pointer;
}

.vip-info {
  flex: 1;
}

.vip-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.vip-desc {
  font-size: 12px;
  color: rgba(255,255,255,0.9);
}

.menu-group {
  margin: 16px;
  border-radius: 12px;
  overflow: hidden;
}

.logout-section {
  margin: 24px 16px;
}

.logout-section .van-button {
  height: 44px;
  font-size: 15px;
}
</style>
