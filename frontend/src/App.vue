<template>
  <van-config-provider>
    <router-view />
    <ThemeSwitcher />
  </van-config-provider>
</template>

<script setup>
import ThemeSwitcher from './components/ThemeSwitcher.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--bg-primary, #F2F5F9);
  color: var(--text-primary, #1A1A1A);
  transition: background 0.3s ease, color 0.3s ease;
}

/* iOS 风格全局变量 */
:root {
  --ios-blue: #007AFF;
  --ios-green: #34C759;
  --ios-orange: #FF9500;
  --ios-red: #FF3B30;
  --ios-gray: #8E8E93;
  --ios-bg: #F2F5F9;
}
</style>