<template>
  <div class="theme-switcher" v-if="showSwitcher">
    <button 
      class="theme-btn theme-btn-ios" 
      :class="{ active: currentTheme === 'ios' }"
      @click="setTheme('ios')"
      title="iOS 风格"
    >
      🍎
    </button>
    <button 
      class="theme-btn theme-btn-pro" 
      :class="{ active: currentTheme === 'pro-sports' }"
      @click="setTheme('pro-sports')"
      title="专业运动"
    >
      🔥
    </button>
    <button 
      class="theme-btn theme-btn-manga" 
      :class="{ active: currentTheme === 'manga' }"
      @click="setTheme('manga')"
      title="热血漫画"
    >
      ⚡
    </button>
    <button 
      class="theme-btn" 
      style="font-size: 16px; background: var(--bg-card);"
      @click="showSwitcher = false"
      title="收起"
    >
      ✕
    </button>
  </div>
  <button 
    v-else
    class="theme-toggle-fixed"
    @click="showSwitcher = true"
    title="切换主题"
  >
    🎨
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentTheme = ref('ios')
const showSwitcher = ref(false)

const setTheme = (theme) => {
  currentTheme.value = theme
  
  if (theme === 'ios') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
  
  // 保存到 localStorage
  localStorage.setItem('pingpong-theme', theme)
}

onMounted(() => {
  // 从 localStorage 恢复主题
  const savedTheme = localStorage.getItem('pingpong-theme')
  if (savedTheme) {
    setTheme(savedTheme)
  }
})
</script>

<style scoped>
.theme-switcher {
  position: fixed;
  top: 80px;
  right: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theme-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.theme-btn:hover {
  transform: scale(1.1);
}

.theme-btn.active {
  border-color: var(--accent-color);
  box-shadow: 0 0 15px var(--accent-color);
}

.theme-btn-ios { 
  background: linear-gradient(135deg, #F2F5F9, #FFFFFF); 
}

.theme-btn-pro { 
  background: linear-gradient(135deg, #1A1A2E, #0D0D1A); 
  color: #FF6B35; 
}

.theme-btn-manga { 
  background: linear-gradient(135deg, #FFD700, #FF3D3D); 
  color: #1A1A1A; 
}

.theme-toggle-fixed {
  position: fixed;
  top: 80px;
  right: 16px;
  z-index: 1000;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--accent-color);
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  cursor: pointer;
  font-size: 20px;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.theme-toggle-fixed:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px var(--accent-color);
}
</style>