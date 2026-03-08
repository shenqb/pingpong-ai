<template>
  <div class="upload-page">
    <van-nav-bar title="上传动作" left-arrow @click-left="$router.back()" />

    <div class="upload-content">
      <!-- Step 1: 选择动作类型 -->
      <div class="step">
        <h3>Step 1: 选择动作类型</h3>
        <div class="action-types">
          <van-card
            v-for="action in actions"
            :key="action.value"
            :title="action.title"
            :desc="action.desc"
            :class="['action-card', { selected: selectedAction === action.value }]"
            @click="selectedAction = action.value"
          >
            <template #thumb>
              <div class="action-icon">{{ action.icon }}</div>
            </template>
          </van-card>
        </div>
      </div>

      <!-- Step 2: 选择拍摄角度 -->
      <div class="step">
        <h3>Step 2: 选择拍摄角度</h3>
        <van-radio-group v-model="selectedAngle">
          <van-cell-group>
            <van-cell
              v-for="angle in angles"
              :key="angle.value"
              clickable
              @click="selectedAngle = angle.value"
            >
              <template #title>
                <div class="angle-item">
                  <span>{{ angle.label }}</span>
                  <van-tag v-if="angle.recommended" type="primary" size="mini">推荐</van-tag>
                </div>
              </template>
              <template #label>
                {{ angle.desc }}
              </template>
              <template #right-icon>
                <van-radio :name="angle.value" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>

      <!-- Step 3: 拍摄提示 -->
      <div class="step">
        <h3>Step 3: 拍摄提示</h3>
        <van-card title="📱 手机放置位置" class="tip-card">
          <template #default>
            <ul class="tip-list">
              <li>距离球台 2-3 米</li>
              <li>高度与球台平行</li>
              <li>确保全身在画面中</li>
            </ul>
          </template>
        </van-card>
        <van-card title="💡 拍摄技巧" class="tip-card">
          <template #default>
            <ul class="tip-list">
              <li>光线充足</li>
              <li>穿对比色衣服</li>
              <li>连续击球 5-10 次</li>
            </ul>
          </template>
        </van-card>
      </div>

      <!-- 上传按钮 -->
      <div class="upload-action">
        <van-button type="primary" size="large" round block @click="handleUpload">
          📹 开始拍摄/上传
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast } from 'vant'

const router = useRouter()

const actions = [
  { value: 'forehand', label: '正手攻球', icon: '🏓', title: '正手攻球', desc: '最基础的正手技术' },
  { value: 'backhand', label: '反手推挡', icon: '🏓', title: '反手推挡', desc: '防守反击技术' },
  { value: 'serve', label: '发球', icon: '🎯', title: '发球', desc: '比赛开始技术' }
]

const angles = [
  { value: 'side', label: '侧面', desc: '最佳分析角度', recommended: true },
  { value: 'front', label: '正面', desc: '辅助分析角度', recommended: false }
]

const selectedAction = ref('forehand')
const selectedAngle = ref('side')
const selectedFile = ref(null)

const handleUpload = async () => {
  if (!selectedAction.value) {
    showToast('请选择动作类型')
    return
  }
  
  // 创建文件输入
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*,video/*'
  
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    selectedFile.value = file
    
    // 显示加载提示
    const loading = showLoadingToast({
      message: '上传并分析中...',
      forbidClick: true,
      duration: 0
    })
    
    try {
      // 上传并分析
      const formData = new FormData()
      formData.append('file', file)
      formData.append('actionType', selectedAction.value)
      formData.append('angle', selectedAngle.value)
      
      const response = await fetch('/api/upload/analyze', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        // 保存分析结果到 sessionStorage
        sessionStorage.setItem('analysisResult', JSON.stringify(result.data))
        showToast('分析完成！')
        router.push('/result')
      } else {
        showToast('分析失败：' + result.error)
      }
    } catch (error) {
      console.error('上传失败:', error)
      showToast('上传失败，请重试')
    } finally {
      loading.clear()
    }
  }
  
  input.click()
}
</script>

<style scoped>
.upload-page {
  padding-bottom: 60px;
  max-width: 480px;
  margin: 0 auto;
}

.upload-content {
  padding: 16px;
}

.step {
  margin-bottom: 24px;
}

.step h3 {
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.action-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.action-card {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
}

.action-card.selected {
  border-color: #1989fa;
  background-color: #f0f9ff;
}

.action-icon {
  font-size: 28px;
  text-align: center;
  padding: 8px;
}

.angle-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tip-card {
  margin-bottom: 8px;
  border-radius: 8px;
}

.tip-list {
  margin: 0;
  padding-left: 16px;
}

.tip-list li {
  margin: 4px 0;
  color: #666;
  font-size: 13px;
  line-height: 1.5;
}

.upload-action {
  margin-top: 24px;
  position: sticky;
  bottom: 16px;
}

/* 移动端优化 */
@media (max-width: 375px) {
  .action-icon {
    font-size: 24px;
  }
  .step h3 {
    font-size: 14px;
  }
}
</style>
