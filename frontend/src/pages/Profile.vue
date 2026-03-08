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
      <van-card title="📊 本月统计" class="stats-card">
        <template #default>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-num">8</div>
              <div class="stat-label">分析次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">82</div>
              <div class="stat-label">平均分</div>
            </div>
            <div class="stat-item">
              <div class="stat-num up">+7 ⬆️</div>
              <div class="stat-label">进步</div>
            </div>
          </div>
        </template>
      </van-card>

      <!-- 成就徽章 -->
      <van-card title="🏆 成就徽章" class="badge-card">
        <template #default>
          <div class="badges">
            <van-tag type="primary" size="medium">首次分析</van-tag>
            <van-tag type="success" size="medium">连续 7 天</van-tag>
            <van-tag type="warning" size="medium">进步之星</van-tag>
            <van-tag type="info" size="medium" plain>动作大师 🔒</van-tag>
          </div>
        </template>
      </van-card>

      <!-- 会员服务 -->
      <van-card title="💎 会员服务" class="vip-card">
        <template #default>
          <div class="vip-content">
            <div class="vip-status">
              <span>当前：免费版</span>
              <van-tag type="danger">剩余：1 次分析</van-tag>
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

      <!-- 功能菜单 -->
      <van-grid :column-num="2" :border="false">
        <van-grid-item icon="setting-o" text="设置" />
        <van-grid-item icon="question-o" text="帮助" />
      </van-grid>
    </div>
  </div>
</template>

<script setup>
// 个人中心页面
</script>

<style scoped>
.profile-page {
  padding-bottom: 20px;
}

.profile-content {
  padding: 20px;
}

.user-card {
  margin-bottom: 15px;
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

.stats-card, .badge-card, .vip-card {
  margin-bottom: 15px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  text-align: center;
}

.stat-num {
  font-size: 24px;
  font-weight: bold;
  color: #1989fa;
}

.stat-num.up {
  color: #07c160;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.vip-content {
  text-align: center;
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
