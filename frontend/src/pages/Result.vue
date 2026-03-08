<template>
  <div class="result-page">
    <van-nav-bar title="分析结果" left-arrow @click-left="$router.back()" right-icon="share-o" @click-right="shareResult" />

    <div class="result-content">
      <!-- 评分卡片 -->
      <van-card class="score-card">
        <template #title>
          <div class="score-header">
            <span>{{ actionType }}动作分析</span>
          </div>
        </template>
        <template #num>
          <div class="score-display">
            <div class="score-num">{{ score }}</div>
            <div class="score-level">{{ level }}</div>
            <van-rate :model-value="Math.floor(score / 20)" size="20px" />
          </div>
        </template>
        <template #default>
          <div class="comparison-placeholder">
            [对比图：你的动作 vs 标准]
          </div>
        </template>
      </van-card>

      <!-- 做得好的地方 -->
      <van-card title="✅ 做得好的地方" class="good-card">
        <template #default>
          <ul class="list">
            <li v-for="(strength, index) in strengths" :key="index">✅ {{ strength }}</li>
          </ul>
        </template>
      </van-card>

      <!-- 需要改进 -->
      <van-card title="⚠️ 需要改进 (按优先级)" class="improve-card" v-if="issues.length > 0">
        <template #default>
          <div v-for="(issue, index) in issues" :key="index">
            <div class="issue-item" :class="issue.severity">
              <div class="issue-header">
                <span class="issue-rank">{{ index + 1 }}️⃣</span>
                <span class="issue-title">{{ issue.title }}</span>
                <van-tag :type="getSeverityTag(issue.severity)" size="small">{{ getSeverityText(issue.severity) }}</van-tag>
              </div>
              <div class="issue-desc">影响：{{ issue.impact }}</div>
              <van-button type="link" size="small">🎬 {{ issue.suggestion }}</van-button>
            </div>
            <van-divider v-if="index < issues.length - 1" />
          </div>
        </template>
      </van-card>
      <van-card title="⚠️ 需要改进" class="improve-card" v-else>
        <template #default>
          <p style="text-align: center; color: #07c160;">动作非常标准，继续保持！🎉</p>
        </template>
      </van-card>

      <!-- 与上次对比 -->
      <van-card title="📈 与上次对比" class="progress-card">
        <template #default>
          <div class="progress-item">
            <span>总分</span>
            <span class="progress-up">+5 分 ⬆️</span>
          </div>
          <div class="progress-item">
            <span>腕部动作</span>
            <span class="progress-up">+12 分 ⬆️</span>
          </div>
        </template>
      </van-card>

      <!-- 个性化训练计划 -->
      <van-card title="🎯 个性化训练计划" class="plan-card">
        <template #default>
          <div class="plan-content">
            <p>3 个针对性练习，预计 2 周见效</p>
            <van-button type="primary" size="small" block>
              🔒 开通会员解锁
            </van-button>
          </div>
        </template>
      </van-card>

      <!-- 操作按钮 -->
      <div class="actions">
        <van-button plain round @click="reAnalyze">重新分析</van-button>
        <van-button plain round @click="shareResult">分享结果</van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'

const analysisData = ref(null)

onMounted(() => {
  // 从 sessionStorage 读取分析结果
  const stored = sessionStorage.getItem('analysisResult')
  if (stored) {
    try {
      analysisData.value = JSON.parse(stored)
    } catch (e) {
      console.error('解析分析结果失败:', e)
    }
  }
})

const score = computed(() => analysisData.value?.analysis?.score || 85)
const level = computed(() => analysisData.value?.analysis?.level || '良好')
const strengths = computed(() => analysisData.value?.analysis?.strengths || ['重心转移正确', '击球时机准确'])
const issues = computed(() => analysisData.value?.analysis?.issues || [])
const actionType = computed(() => {
  const typeMap = {
    forehand: '正手攻球',
    backhand: '反手推挡',
    serve: '发球'
  }
  return typeMap[analysisData.value?.analysis?.actionType] || '正手攻球'
})

const shareResult = () => {
  showToast('分享功能开发中...')
}

const reAnalyze = () => {
  sessionStorage.removeItem('analysisResult')
  showToast('准备重新上传...')
}

const getSeverityTag = (severity) => {
  const map = { severe: 'danger', medium: 'warning', light: 'success' }
  return map[severity] || 'primary'
}

const getSeverityText = (severity) => {
  const map = { severe: '严重', medium: '中等', light: '轻微' }
  return map[severity] || severity
}
</script>

<style scoped>
.result-page {
  padding-bottom: 60px;
  max-width: 480px;
  margin: 0 auto;
}

.result-content {
  padding: 16px;
}

.score-card {
  margin-bottom: 12px;
  border-radius: 12px;
}

.score-header {
  font-size: 15px;
  font-weight: 600;
}

.score-display {
  text-align: center;
  padding: 16px 0;
}

.score-num {
  font-size: 42px;
  font-weight: bold;
  color: #1989fa;
}

.score-level {
  font-size: 15px;
  color: #666;
  margin: 8px 0;
}

.comparison-placeholder {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border-radius: 8px;
  font-size: 13px;
}

.good-card, .improve-card, .progress-card, .plan-card {
  margin-bottom: 12px;
  border-radius: 12px;
}

.list {
  margin: 0;
  padding-left: 16px;
}

.list li {
  margin: 4px 0;
  font-size: 13px;
}

.issue-item {
  padding: 12px 0;
}

.issue-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.issue-rank {
  font-size: 16px;
}

.issue-title {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
}

.issue-desc {
  color: #666;
  font-size: 12px;
  margin: 4px 0 8px;
}

.progress-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.progress-up {
  color: #07c160;
  font-weight: 600;
}

.plan-content {
  text-align: center;
  padding: 8px 0;
}

.plan-content p {
  margin: 8px 0;
  color: #666;
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.actions .van-button {
  flex: 1;
  height: 40px;
}

/* 移动端优化 */
@media (max-width: 375px) {
  .score-num {
    font-size: 36px;
  }
  .issue-title {
    font-size: 13px;
  }
}
</style>
