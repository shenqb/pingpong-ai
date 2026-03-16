<template>
  <div class="ios-app standard-page">
    <!-- 导航栏 -->
    <nav class="nav-bar glass-card">
      <button class="nav-back" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#007AFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">标准动作库</h1>
      <div class="nav-right"></div>
    </nav>

    <!-- 分类标签 -->
    <div class="category-bar">
      <div 
        class="category-item" 
        :class="{ active: activeCategory === 'all' }"
        @click="activeCategory = 'all'"
      >
        全部
      </div>
      <div 
        class="category-item" 
        :class="{ active: activeCategory === 'forehand' }"
        @click="activeCategory = 'forehand'"
      >
        正手
      </div>
      <div 
        class="category-item" 
        :class="{ active: activeCategory === 'backhand' }"
        @click="activeCategory = 'backhand'"
      >
        反手
      </div>
      <div 
        class="category-item" 
        :class="{ active: activeCategory === 'serve' }"
        @click="activeCategory = 'serve'"
      >
        发球
      </div>
    </div>

    <!-- 动作列表 -->
    <main class="main-content">
      <div class="action-grid">
        <div 
          v-for="action in filteredActions" 
          :key="action.id"
          class="action-card glass-card"
          @click="showActionDetail(action)"
        >
          <!-- 动作图片 -->
          <div class="action-image" :style="{ background: action.color }">
            <img :src="action.image" :alt="action.name" @error="handleImageError" />
          </div>
          
          <!-- 动作信息 -->
          <div class="action-content">
            <div class="action-header">
              <div class="action-name">{{ action.name }}</div>
              <div class="action-badge" :class="action.difficulty">{{ action.level }}</div>
            </div>
            
            <div class="action-player">
              <span class="player-icon">🏆</span>
              <span>{{ action.player }}</span>
            </div>
            
            <div class="action-tips">
              <div class="tip" v-for="(tip, i) in action.tips.slice(0, 2)" :key="i">
                <span class="tip-dot">•</span>
                {{ tip }}
              </div>
            </div>
            
            <div class="action-angles">
              <div class="angle-tag" v-for="(value, key) in action.angles" :key="key">
                {{ getJointName(key) }}: {{ value.optimal }}°
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="action-footer">
            <button class="btn-compare" @click.stop="compareAction(action)">
              🆚 对比
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部 Tab Bar -->
    <nav class="tab-bar glass-card">
      <div class="tab-item" @click="$router.push('/')">
        <div class="tab-icon">🏠</div>
        <div class="tab-label">首页</div>
      </div>
      <div class="tab-item" @click="$router.push('/upload')">
        <div class="tab-icon">📊</div>
        <div class="tab-label">分析</div>
      </div>
      <div class="tab-item active" @click="$router.push('/standard')">
        <div class="tab-icon">🎯</div>
        <div class="tab-label">动作库</div>
      </div>
      <div class="tab-item" @click="$router.push('/profile')">
        <div class="tab-icon">👤</div>
        <div class="tab-label">我的</div>
      </div>
    </nav>

    <!-- 动作详情弹窗 -->
    <div v-if="selectedAction" class="modal-overlay" @click="selectedAction = null">
      <div class="modal-content glass-card" @click.stop>
        <button class="modal-close" @click="selectedAction = null">×</button>
        
        <div class="modal-image">
          <img :src="selectedAction.image" :alt="selectedAction.name" />
        </div>
        
        <div class="modal-body">
          <h2>{{ selectedAction.name }}</h2>
          <div class="modal-player">🏆 {{ selectedAction.player }}</div>
          
          <div class="modal-section">
            <h3>动作要领</h3>
            <div class="tip-list">
              <div class="tip-item" v-for="(tip, i) in selectedAction.tips" :key="i">
                {{ tip }}
              </div>
            </div>
          </div>
          
          <div class="modal-section">
            <h3>标准角度</h3>
            <div class="angle-grid">
              <div class="angle-item" v-for="(value, key) in selectedAction.angles" :key="key">
                <div class="angle-name">{{ getJointName(key) }}</div>
                <div class="angle-optimal">{{ value.optimal }}°</div>
                <div class="angle-range">{{ value.range[0] }}° - {{ value.range[1] }}°</div>
              </div>
            </div>
          </div>
          
          <button class="btn-primary" @click="compareAction(selectedAction)">
            开始对比我的动作
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeCategory = ref('all')
const selectedAction = ref(null)

// 标准动作数据
const standardActions = [
  {
    id: 'forehand',
    name: '正手攻球',
    category: 'forehand',
    difficulty: 'easy',
    level: '入门',
    player: '马龙',
    color: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
    image: '/standard-poses/forehand.svg',
    tips: ['重心略前倾', '击球点在身体右侧前方', '大臂带动小臂发力', '手腕固定，控制拍形'],
    angles: {
      leftElbow: { optimal: 90, range: [70, 110] },
      rightElbow: { optimal: 85, range: [65, 105] },
      leftKnee: { optimal: 130, range: [110, 150] },
      rightKnee: { optimal: 140, range: [120, 160] },
      torso: { optimal: 10, range: [0, 20] }
    }
  },
  {
    id: 'backhand',
    name: '反手推挡',
    category: 'backhand',
    difficulty: 'easy',
    level: '入门',
    player: '许昕',
    color: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
    image: '/standard-poses/backhand.svg',
    tips: ['身体正对来球', '肘关节贴近身体', '前臂发力为主', '拍形稍前倾'],
    angles: {
      leftElbow: { optimal: 80, range: [60, 100] },
      rightElbow: { optimal: 85, range: [65, 105] },
      leftKnee: { optimal: 140, range: [120, 160] },
      rightKnee: { optimal: 145, range: [125, 165] },
      torso: { optimal: 5, range: [0, 15] }
    }
  },
  {
    id: 'forehand_loop',
    name: '正手拉弧圈',
    category: 'forehand',
    difficulty: 'medium',
    level: '进阶',
    player: '张继科',
    color: 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)',
    image: '/standard-poses/forehand_loop.svg',
    tips: ['重心降低，蓄力充分', '蹬腿转腰发力', '摩擦球的中上部', '手臂充分伸展'],
    angles: {
      leftElbow: { optimal: 100, range: [80, 120] },
      rightElbow: { optimal: 95, range: [75, 115] },
      leftKnee: { optimal: 120, range: [100, 140] },
      rightKnee: { optimal: 130, range: [110, 150] },
      torso: { optimal: 15, range: [5, 25] }
    }
  },
  {
    id: 'backhand_loop',
    name: '反手拉弧圈',
    category: 'backhand',
    difficulty: 'medium',
    level: '进阶',
    player: '樊振东',
    color: 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)',
    image: '/standard-poses/backhand_loop.svg',
    tips: ['身体略向左转', '前臂快速收缩', '摩擦球的中上部', '重心随球前移'],
    angles: {
      leftElbow: { optimal: 85, range: [65, 105] },
      rightElbow: { optimal: 90, range: [70, 110] },
      leftKnee: { optimal: 130, range: [110, 150] },
      rightKnee: { optimal: 135, range: [115, 155] },
      torso: { optimal: 10, range: [0, 20] }
    }
  },
  {
    id: 'serve',
    name: '发球',
    category: 'serve',
    difficulty: 'medium',
    level: '进阶',
    player: '马龙',
    color: 'linear-gradient(135deg, #FF3B30 0%, #FF453A 100%)',
    image: '/standard-poses/serve.svg',
    tips: ['抛球高度一致', '击球点在身体右侧', '手腕抖动发力', '控制拍形变化'],
    angles: {
      leftElbow: { optimal: 70, range: [50, 90] },
      rightElbow: { optimal: 90, range: [70, 110] },
      leftKnee: { optimal: 130, range: [110, 150] },
      rightKnee: { optimal: 140, range: [120, 160] },
      torso: { optimal: 8, range: [0, 18] }
    }
  },
  {
    id: 'flick',
    name: '挑打',
    category: 'forehand',
    difficulty: 'hard',
    level: '高级',
    player: '许昕',
    color: 'linear-gradient(135deg, #AF52DE 0%, #BF5AF2 100%)',
    image: '/standard-poses/flick.svg',
    tips: ['步法快速到位', '手臂伸入台内', '手腕快速抖动', '击球上升期'],
    angles: {
      leftElbow: { optimal: 75, range: [55, 95] },
      rightElbow: { optimal: 80, range: [60, 100] },
      leftKnee: { optimal: 135, range: [115, 155] },
      rightKnee: { optimal: 140, range: [120, 160] },
      torso: { optimal: 5, range: [0, 15] }
    }
  }
]

// 筛选后的动作
const filteredActions = computed(() => {
  if (activeCategory.value === 'all') return standardActions
  return standardActions.filter(a => a.category === activeCategory.value)
})

const getJointName = (key) => {
  const names = { 
    leftElbow: '左肘', 
    rightElbow: '右肘', 
    leftKnee: '左膝', 
    rightKnee: '右膝', 
    torso: '躯干' 
  }
  return names[key] || key
}

const handleImageError = (e) => {
  // 图片加载失败时使用占位
  e.target.style.display = 'none'
}

const showActionDetail = (action) => {
  selectedAction.value = action
}

const compareAction = (action) => {
  selectedAction.value = null
  router.push({ 
    path: '/upload', 
    query: { action: action.id }
  })
}
</script>

<style scoped>
.ios-app {
  min-height: 100vh;
  background: linear-gradient(180deg, #F2F5F9 0%, #FFFFFF 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  padding-bottom: 80px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(env(safe-area-inset-top, 44px) + 12px);
  background: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.nav-back {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #1A1A1A;
}

.nav-right {
  width: 40px;
}

/* 分类标签 */
.category-bar {
  display: flex;
  padding: 12px 16px;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.category-bar::-webkit-scrollbar {
  display: none;
}

.category-item {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.8);
  color: #8E8E93;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item.active {
  background: #007AFF;
  color: white;
}

/* 主内容 */
.main-content {
  padding: 0 16px;
}

.action-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-card {
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:active {
  transform: scale(0.98);
}

.action-image {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.action-content {
  padding: 16px;
}

.action-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.action-name {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
}

.action-badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
}

.action-badge.easy { background: rgba(52, 199, 89, 0.15); color: #34C759; }
.action-badge.medium { background: rgba(255, 149, 0, 0.15); color: #FF9500; }
.action-badge.hard { background: rgba(255, 59, 48, 0.15); color: #FF3B30; }

.action-player {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #8E8E93;
  margin-bottom: 12px;
}

.player-icon {
  font-size: 16px;
}

.action-tips {
  margin-bottom: 12px;
}

.tip {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.tip-dot {
  color: #007AFF;
  margin-right: 4px;
}

.action-angles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.angle-tag {
  font-size: 11px;
  background: rgba(0, 122, 255, 0.08);
  color: #007AFF;
  padding: 4px 8px;
  border-radius: 6px;
}

.action-footer {
  padding: 0 16px 16px;
}

.btn-compare {
  width: 100%;
  padding: 12px;
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

/* 底部 Tab Bar */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  padding-bottom: calc(env(safe-area-inset-bottom, 8px) + 8px);
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  opacity: 0.5;
}

.tab-item.active {
  opacity: 1;
}

.tab-icon {
  font-size: 24px;
}

.tab-label {
  font-size: 10px;
  color: #8E8E93;
}

.tab-item.active .tab-label {
  color: #007AFF;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-height: 90vh;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  z-index: 1;
}

.modal-image {
  height: 200px;
  background: #f0f4f8;
}

.modal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-body {
  padding: 20px;
  max-height: 50vh;
  overflow-y: auto;
}

.modal-body h2 {
  margin: 0 0 8px 0;
  font-size: 22px;
}

.modal-player {
  font-size: 14px;
  color: #8E8E93;
  margin-bottom: 20px;
}

.modal-section {
  margin-bottom: 20px;
}

.modal-section h3 {
  font-size: 16px;
  margin: 0 0 12px 0;
  color: #1A1A1A;
}

.tip-list {
  background: #f7f8fa;
  border-radius: 12px;
  padding: 12px;
}

.tip-item {
  font-size: 14px;
  color: #666;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.tip-item:last-child {
  border-bottom: none;
}

.angle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.angle-item {
  background: #f7f8fa;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.angle-name {
  font-size: 13px;
  color: #8E8E93;
  margin-bottom: 4px;
}

.angle-optimal {
  font-size: 24px;
  font-weight: 600;
  color: #007AFF;
}

.angle-range {
  font-size: 11px;
  color: #8E8E93;
}

.btn-primary {
  width: 100%;
  padding: 16px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
}
</style>