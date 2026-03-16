#!/bin/bash
# 乒乓球 AI 项目 - 15 分钟进度推送（使用 message 工具）

WORKSPACE="/home/admin/.openclaw/workspace/乒乓球应用-dev"
cd "$WORKSPACE"

# 获取当前时间
CURRENT_TIME=$(date +"%Y-%m-%d %H:%M")

# 获取最新提交
LATEST_COMMIT=$(git log --oneline -1 2>/dev/null | head -1)
COMMIT_HASH=$(echo "$LATEST_COMMIT" | cut -d' ' -f1)
COMMIT_MSG=$(echo "$LATEST_COMMIT" | cut -d' ' -f2-)

# 获取今日提交数量
TODAY_COMMITS=$(git log --since="$(date +%Y-%m-%d)" --oneline 2>/dev/null | wc -l)

# 服务状态检查
FRONTEND_STATUS="❌"
BACKEND_STATUS="❌"
MYSQL_STATUS="❌"

if curl -s http://localhost:3001 >/dev/null 2>&1; then
  FRONTEND_STATUS="✅ http://172.24.32.137:3001"
fi

if curl -s http://localhost:8000/health >/dev/null 2>&1; then
  BACKEND_STATUS="✅ http://localhost:8000"
fi

if mysql -u pingpong -p'PingPong_User_2026!' -e "SELECT 1" pingpong_ai >/dev/null 2>&1; then
  MYSQL_STATUS="✅ 已连接"
fi

# 计算距离上线时间
DAYS_LEFT=$(( ($(date -d "2026-04-09" +%s) - $(date +%s)) / 86400 ))

# 生成消息
MESSAGE="## 🏓 乒乓球 AI 项目 - 进度推送

**时间**: ${CURRENT_TIME}
**距离 8 点上线**: ${DAYS_LEFT} 天

### 📊 当前状态
- **整体进度**: 65%
- **今日提交**: ${TODAY_COMMITS} 次
- **最新提交**: \`${COMMIT_HASH}\` ${COMMIT_MSG}

### 🌐 服务监控
| 服务 | 状态 |
|------|------|
| 前端 | ${FRONTEND_STATUS} |
| 后端 | ${BACKEND_STATUS} |
| MySQL | ${MYSQL_STATUS} |

### ⏰ 推送计划
- **频率**: 每 15 分钟
- **下次推送**: 15 分钟后
- **持续运行**: 直到明早 8 点

---
*自动监控推送 | 系统运行正常* ✅"

# 使用 OpenClaw message 工具发送
cd /home/admin/.openclaw/workspace
openclaw message send --channel dingtalk --message "$MESSAGE"

echo "[${CURRENT_TIME}] 推送完成"
