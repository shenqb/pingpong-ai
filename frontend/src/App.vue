<template>
  <van-config-provider>
    <router-view />
  </van-config-provider>
</template>

<script setup>
// 全局配置
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #F2F5F9;
}

/* iOS 风格全局样式 */
:root {
  --ios-blue: #007AFF;
  --ios-green: #34C759;
  --ios-orange: #FF9500;
  --ios-red: #FF3B30;
  --ios-gray: #8E8E93;
  --ios-bg: #F2F5F9;
}
</style>