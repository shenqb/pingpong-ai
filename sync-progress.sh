#!/bin/bash
# 乒乓球项目进展自动同步脚本
# 每 30 分钟同步一次到钉钉文档

LOG_FILE="/home/admin/.openclaw/workspace/乒乓球应用-dev/sync.log"
WORKSPACE="/home/admin/.openclaw/workspace/乒乓球应用-dev"

echo "=== 进展同步任务启动：$(date) ===" >> $LOG_FILE

# 获取 git 状态
cd $WORKSPACE
GIT_STATUS=$(git status --short 2>&1)
GIT_LOG=$(git log --oneline -3 2>&1)
FILE_COUNT=$(find . -type f \( -name "*.js" -o -name "*.vue" -o -name "*.json" -o -name "*.md" \) -not -path "*/node_modules/*" | wc -l)

# 检查服务状态
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)

# 记录状态
echo "同步时间：$(date)" >> $LOG_FILE
echo "文件数：$FILE_COUNT" >> $LOG_FILE
echo "前端状态：$FRONTEND_STATUS" >> $LOG_FILE
echo "后端状态：$BACKEND_STATUS" >> $LOG_FILE
echo "---" >> $LOG_FILE

# 通过 OpenClaw 发送消息到当前会话，触发进展同步
# 由于无法直接调用，我们通过日志记录
echo "下次同步：$(date -d '+30 minutes')" >> $LOG_FILE
echo "" >> $LOG_FILE

# 等待 30 分钟 (1800 秒)
sleep 1800
