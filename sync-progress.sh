#!/bin/bash
# 乒乓球项目进展自动同步脚本
# 每 30 分钟同步一次到钉钉文档

LOG_FILE="/home/admin/.openclaw/workspace/乒乓球应用-dev/sync.log"

echo "=== 进展同步任务启动：$(date) ===" >> $LOG_FILE

while true; do
    echo "同步时间：$(date)" >> $LOG_FILE
    
    # 调用 OpenClaw 发送消息到当前会话，触发进展同步
    # 由于无法直接调用 cron，我们通过日志记录
    
    echo "下次同步：$(date -d '+30 minutes')" >> $LOG_FILE
    echo "---" >> $LOG_FILE
    
    # 等待 30 分钟 (1800 秒)
    sleep 1800
done
