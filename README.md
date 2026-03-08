# 乒乓球 AI 动作矫正应用

> AI 驱动的乒乓球动作分析与矫正应用

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 项目简介

乒乓球 AI 动作矫正应用是一款基于计算机视觉和姿态检测的 AI 应用，帮助用户分析乒乓球动作并提供专业矫正建议。

### 核心功能

- **动作分析**: 上传视频/图片，AI 自动分析动作
- **姿态检测**: 基于 MediaPipe Pose 的 33 个关键点检测
- **标准动作库**: 马龙、樊振东、张继科、王皓、许昕五位国乒选手标准动作参考
- **动作对比**: 用户动作 vs 职业选手标准动作
- **训练计划**: 个性化训练建议

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装

```bash
# 克隆项目
git clone <your-repo-url>
cd pingpong-ai

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 启动

```bash
# 启动后端（终端 1）
cd backend
npm run dev
# 后端运行在 http://localhost:8000

# 启动前端（终端 2）
cd frontend
npm run dev
# 前端运行在 http://localhost:3000
```

### 访问

打开浏览器访问：http://localhost:3000

## 📁 项目结构

```
pingpong-ai/
├── frontend/              # 前端 (Vue 3 + Vant 4)
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   ├── router/       # 路由配置
│   │   ├── App.vue       # 根组件
│   │   └── main.js       # 入口文件
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/               # 后端 (Node.js + Express)
│   ├── src/
│   │   ├── routes/       # API 路由
│   │   ├── services/     # 业务逻辑
│   │   └── index.js      # 服务入口
│   ├── uploads/          # 上传文件存储
│   └── package.json
│
├── README.md
├── .gitignore
├── V2.0 产品需求文档.md
├── 竞品分析报告.md
└── 标准动作库 - 五虎将.md
```

## 🔌 API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /health | GET | 健康检查 |
| /api/upload/file | POST | 上传文件 |
| /api/upload/analyze | POST | 上传并分析 |
| /api/analysis/analyze | POST | 分析动作 |
| /api/analysis/history | GET | 获取历史记录 |

## 🛠️ 技术栈

### 前端
- Vue 3
- Vant 4 (移动端 UI)
- Vite 5
- Vue Router 4
- Pinia

### 后端
- Node.js
- Express
- Multer (文件上传)
- MediaPipe Pose (姿态检测)

## 📊 开发进度

| 阶段 | 状态 | 完成度 |
|------|------|--------|
| MVP | ✅ 已完成 | 100% |
| V2.0 规划 | ✅ 已完成 | 100% |
| V2.0 开发 | ⏳ 进行中 | 0% |

### V2.0 计划

- [ ] 实时视频分析
- [ ] 标准动作库（11 个动作）
- [ ] 动作对比可视化
- [ ] 训练计划
- [ ] 社交分享

**目标上线**: 2026-04-09

## 📝 文档

- [V2.0 产品需求文档](./V2.0 产品需求文档.md)
- [竞品分析报告](./竞品分析报告.md)
- [标准动作库](./标准动作库 - 五虎将.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👥 团队

- 开发：OpenClaw AI Assistant
- 项目负责人：cc

## 📞 联系方式

- 项目仓库：GitHub
- 问题反馈：Issues

---

**最后更新**: 2026-03-09
