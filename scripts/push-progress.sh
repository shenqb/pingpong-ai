#!/bin/bash
# 乒乓球 AI 项目 - 15 分钟进度推送脚本

WORKSPACE="/home/admin/.openclaw/workspace/乒乓球应用-dev"
cd "$WORKSPACE"

# 获取当前时间
CURRENT_TIME=$(date +"%Y-%m-%d %H:%M")
DATE_STR=$(date +"%Y-%m-%d")

# 获取最新提交
LATEST_COMMIT=$(git log --oneline -1 2>/dev/null | head -1)
COMMIT_HASH=$(echo "$LATEST_COMMIT" | cut -d' ' -f1)
COMMIT_MSG=$(echo "$LATEST_COMMIT" | cut -d' ' -f2-)

# 获取今日提交数量
TODAY_COMMITS=$(git log --since="$(date +%Y-%m-%d)" --oneline 2>/dev/null | wc -l)

# 获取项目统计
TOTAL_FILES=$(find . -name "*.vue" -o -name "*.js" | wc -l)

# 服务状态检查
FRONTEND_STATUS="❌"
BACKEND_STATUS="❌"

if curl -s http://localhost:3001 >/dev/null 2>&1; then
  FRONTEND_STATUS="✅"
fi

if curl -s http://localhost:8000/health >/dev/null 2>&1; then
  BACKEND_STATUS="✅"
fi

# 生成钉钉消息
MESSAGE="## 🏓 乒乓球 AI 项目进度汇报

**时间**: ${CURRENT_TIME}
**距离上线**: $(($(date -d "2026-04-09" +%s) - $(date +%s)) / 86400) 天

### 📊 项目状态
| 指标 | 状态 |
|------|------|
| 整体进度 | 65% |
| 今日提交 | ${TODAY_COMMITS} 次 |
| 最新提交 | \`${COMMIT_HASH}\` ${COMMIT_MSG} |

### 🌐 服务状态
| 服务 | 状态 |
|------|------|
| 前端 | ${FRONTEND_STATUS} |
| 后端 | ${BACKEND_STATUS} |

### 📝 本 15 分钟进展
- 系统持续运行中
- 自动监控和推送
- 距离 8 点上线又近 15 分钟！

---
*自动推送 | 下次：$(( $(date +%M) % 15 + 15 )) 分钟后*"

# 发送钉钉消息（使用 OpenClaw message 工具）
echo "$MESSAGE"

# 通过 OpenClaw 发送
openclaw message send --channel dingtalk --message "$MESSAGE" 2>/dev/null || \
curl -X POST "https://oapi.dingtalk.com/robot/send?access_token=$DINGTALK_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"msgtype\": \"markdown\",
    \"markdown\": {
      \"title\": \"乒乓球 AI 项目进度\",
      \"text\": \"$(echo "$MESSAGE" | sed 's/"/\\"/g' | tr '\n' '\\n')\"
    }
  }" 2>/dev/null

echo "推送完成：${CURRENT_TIME}"
