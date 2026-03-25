# 📊 MySQL 数据库配置指南

> 生产环境使用 MySQL，开发环境使用 SQLite

---

## 一、安装 MySQL

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install mysql-server mysql-client
sudo mysql_secure_installation
```

### CentOS/RHEL

```bash
sudo yum install mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

### macOS (Homebrew)

```bash
brew install mysql
brew services start mysql
```

---

## 二、创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE pingpong_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户
CREATE USER 'pingpong'@'localhost' IDENTIFIED BY 'your_password_here';

# 授权
GRANT ALL PRIVILEGES ON pingpong_ai.* TO 'pingpong'@'localhost';
FLUSH PRIVILEGES;

# 退出
EXIT;
```

---

## 三、导入表结构

```bash
# 使用提供的 SQL 文件
mysql -u pingpong -p pingpong_ai < schema.sql

# 或者使用 Python 脚本
python3 init-db-mysql.py
```

---

## 四、配置文件

### 方式一：环境变量

```bash
# .env 文件
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pingpong_ai
DB_USER=pingpong
DB_PASSWORD=your_password_here
```

### 方式二：配置文件

```yaml
# config/database.yaml
production:
  adapter: mysql2
  host: localhost
  port: 3306
  database: pingpong_ai
  username: pingpong
  password: your_password_here
  encoding: utf8mb4
  pool: 5
```

---

## 五、从 SQLite 迁移到 MySQL

```bash
# 使用 Python 脚本迁移
python3 migrate-sqlite-to-mysql.py
```

或手动导出导入：

```bash
# 导出 SQLite 数据
sqlite3 pingpong.db .dump > data.sql

# 修改 SQL 语法（SQLite → MySQL）

# 导入 MySQL
mysql -u pingpong -p pingpong_ai < data.sql
```

---

## 六、测试连接

```python
# test-connection.py
import mysql.connector

conn = mysql.connector.connect(
    host='localhost',
    user='pingpong',
    password='your_password',
    database='pingpong_ai'
)

print("✅ MySQL 连接成功！")
conn.close()
```

---

## 七、生产环境建议

### 安全配置

```sql
-- 修改 root 密码
ALTER USER 'root'@'localhost' IDENTIFIED BY 'strong_password';

-- 禁用远程 root 登录
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- 删除匿名用户
DELETE FROM mysql.user WHERE User='';

-- 删除测试数据库
DROP DATABASE IF EXISTS test;
```

### 性能优化

```sql
-- 调整 innodb_buffer_pool_size
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB

-- 调整 max_connections
SET GLOBAL max_connections = 200;
```

### 备份策略

```bash
# 每日备份
mysqldump -u pingpong -p pingpong_ai > backup-$(date +%Y%m%d).sql

# 定期清理旧备份
find /backup -name "backup-*.sql" -mtime +7 -delete
```

---

## 八、常见问题

### 连接失败

```bash
# 检查 MySQL 服务状态
sudo systemctl status mysql

# 检查端口
netstat -tlnp | grep 3306

# 检查防火墙
sudo ufw allow 3306/tcp
```

### 字符集问题

```sql
-- 检查字符集
SHOW VARIABLES LIKE 'character_set%';

-- 修改字符集
ALTER DATABASE pingpong_ai CHARACTER SET utf8mb4;
```

---

**文档版本**: V1.0  
**最后更新**: 2026-03-25
