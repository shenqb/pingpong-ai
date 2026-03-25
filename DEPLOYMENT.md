# 🚀 PingPong AI - 部署文档

> 完整部署指南 | V3.0

---

## 📦 项目结构

```
pingpong-ai/
├── frontend/              # 前端 (Vue 3 + Vite)
│   ├── src/
│   │   ├── assets/styles/
│   │   │   └── variables.css    # V3.0 设计变量
│   │   ├── pages/               # 页面组件
│   │   └── main.js
│   └── package.json
│
├── backend/               # 后端 (Node.js + Express)
│   ├── src/
│   │   ├── api.js         # API 路由
│   │   └── index.js       # 服务入口
│   └── package.json
│
├── database/              # 数据库
│   ├── pingpong.db        # SQLite 数据库
│   ├── init-db.py         # 初始化脚本
│   └── MYSQL-配置指南.md   # MySQL 配置
│
├── prototype/             # V3.0 原型
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
└── README.md
```

---

## 🏗️ 本地开发

### 1. 环境要求

- Node.js >= 18
- Python 3.8+
- SQLite（内置）或 MySQL

### 2. 安装依赖

```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../frontend
npm install
```

### 3. 初始化数据库

```bash
cd database
python3 init-db.py
```

### 4. 启动服务

```bash
# 终端 1: 启动后端
cd backend
npm run dev
# 运行在 http://localhost:8000

# 终端 2: 启动前端
cd frontend
npm run dev
# 运行在 http://localhost:3000
```

### 5. 访问应用

打开浏览器访问：http://localhost:3000

---

## 🌐 生产部署

### 方式一：Vercel（推荐）

#### 前端部署

1. 安装 Vercel CLI
```bash
npm install -g vercel
```

2. 部署
```bash
cd frontend
vercel --prod
```

3. 配置环境变量
```
VITE_API_URL=https://your-backend-url.com
```

#### 后端部署

1. 部署到 Railway/Render/Heroku
```bash
# Railway
railway login
railway init
railway up

# Render
render deploy
```

2. 配置环境变量
```
NODE_ENV=production
DB_TYPE=mysql
DB_HOST=your-db-host
DB_USER=pingpong
DB_PASSWORD=your-password
DB_NAME=pingpong_ai
```

### 方式二：自建服务器

#### 1. 准备服务器

- Ubuntu 20.04+
- 2GB+ RAM
- 域名（可选）

#### 2. 安装依赖

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2
sudo npm install -g pm2

# Nginx
sudo apt-get install -y nginx

# MySQL（可选）
sudo apt-get install -y mysql-server
```

#### 3. 部署代码

```bash
# 克隆代码
git clone https://github.com/shenqb/pingpong-ai.git
cd pingpong-ai

# 安装依赖
cd backend && npm install
cd ../frontend && npm install

# 构建前端
npm run build
```

#### 4. 配置数据库

```bash
# 使用 SQLite（简单）
cd database
python3 init-db.py

# 或使用 MySQL（生产）
mysql -u root -p < database/schema.sql
```

#### 5. 启动服务

```bash
# 启动后端
cd backend
pm2 start npm --name "pingpong-backend" -- run prod

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

#### 6. 配置 Nginx

```nginx
# /etc/nginx/sites-available/pingpong-ai

server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/pingpong-ai/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/pingpong-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. 配置 SSL（可选）

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

---

## 📊 数据库迁移

### SQLite → MySQL

1. 安装 MySQL 驱动
```bash
cd backend
npm install mysql2
```

2. 更新数据库配置
```javascript
// backend/src/db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
```

3. 迁移数据
```bash
cd database
python3 migrate-sqlite-to-mysql.py
```

---

## 🔧 环境变量

### 后端环境变量

```bash
# .env
NODE_ENV=production
PORT=8000
DB_TYPE=sqlite  # 或 mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pingpong_ai
DB_USER=pingpong
DB_PASSWORD=your-password
JWT_SECRET=your-jwt-secret
```

### 前端环境变量

```bash
# .env
VITE_API_URL=http://localhost:8000
VITE_APP_TITLE=PingPong AI
```

---

## 🧪 测试

### API 测试

```bash
# 健康检查
curl http://localhost:8000/health

# 获取统计
curl http://localhost:8000/api/stats

# 获取动作列表
curl http://localhost:8000/api/actions
```

### 前端测试

```bash
cd frontend
npm run build
npm run preview
```

---

## 📈 监控与日志

### PM2 日志

```bash
# 查看日志
pm2 logs pingpong-backend

# 实时监控
pm2 monit
```

### Nginx 日志

```bash
# 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log
```

---

## 🐛 常见问题

### 端口被占用

```bash
# 查看占用端口的进程
lsof -i :8000

# 杀死进程
kill -9 <PID>
```

### 数据库连接失败

```bash
# 检查 MySQL 服务
sudo systemctl status mysql

# 测试连接
mysql -u pingpong -p -e "SELECT 1"
```

### 前端构建失败

```bash
# 清理缓存
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📝 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] 依赖已安装
- [ ] 数据库已初始化
- [ ] 环境变量已配置
- [ ] 后端服务已启动
- [ ] 前端已构建
- [ ] Nginx 已配置
- [ ] SSL 证书已安装
- [ ] 监控已配置
- [ ] 备份策略已设置

---

**部署文档版本**: V1.0  
**最后更新**: 2026-03-25  
**维护者**: OpenClaw AI Assistant
