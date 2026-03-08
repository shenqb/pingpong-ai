# 📤 GitHub 推送指南

## 方式 1: 使用 Personal Access Token（推荐）

### 1. 创建 Token
1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限：`repo` (Full control of private repositories)
4. 生成 token，复制保存（只显示一次）

### 2. 推送代码
```bash
cd /home/admin/.openclaw/workspace/乒乓球应用-dev

# 设置 token（替换 YOUR_TOKEN）
git remote set-url origin https://YOUR_TOKEN@github.com/shenqb/pingpong-ai.git

# 推送
git push -u origin main
```

---

## 方式 2: 使用 SSH（如果已配置）

```bash
cd /home/admin/.openclaw/workspace/乒乓球应用-dev

# 改为 SSH 地址
git remote set-url origin git@github.com:shenqb/pingpong-ai.git

# 推送
git push -u origin main
```

---

## 方式 3: 手动创建仓库后推送

### 1. 在 GitHub 创建仓库
1. 访问：https://github.com/new
2. 仓库名：`pingpong-ai`
3. 描述：乒乓球 AI 动作矫正应用
4. 公开/私有：自选
5. **不要** 勾选 "Initialize with README"
6. 点击 "Create repository"

### 2. 推送代码
```bash
cd /home/admin/.openclaw/workspace/乒乓球应用-dev

# 关联远程仓库（替换为你的仓库地址）
git remote set-url origin https://github.com/shenqb/pingpong-ai.git

# 推送
git push -u origin main
```

---

## 验证推送

推送成功后，访问：https://github.com/shenqb/pingpong-ai

应该看到：
- ✅ 23 个文件
- ✅ 提交记录：Initial commit
- ✅ 代码结构完整

---

## 后续迭代推送

每次迭代完成后，执行：

```bash
cd /home/admin/.openclaw/workspace/乒乓球应用-dev

# 查看变更
git status

# 添加变更
git add .

# 提交
git commit -m "迭代 X: 功能描述"

# 推送
git push origin main
```

---

**当前状态**:
- ✅ 本地 git 仓库已初始化
- ✅ 23 个文件已提交
- ⏳ 等待推送到 GitHub

**文件清单**:
- 前端：10 个文件
- 后端：6 个文件
- 文档：6 个文件
- 配置：1 个文件 (.gitignore)
