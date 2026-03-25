#!/usr/bin/env python3
"""
PingPong AI - 数据库初始化脚本
支持 SQLite（开发）和 MySQL（生产）
"""

import sqlite3
import os
from datetime import datetime

# 数据库文件路径
DB_PATH = os.path.join(os.path.dirname(__file__), 'pingpong.db')

def create_tables():
    """创建数据库表结构"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 用户表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100),
            password_hash VARCHAR(255),
            avatar_url VARCHAR(255),
            membership_level VARCHAR(20) DEFAULT 'free',
            membership_expire DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 动作类型表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS action_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(50) NOT NULL,
            category VARCHAR(20) NOT NULL,
            difficulty VARCHAR(10) DEFAULT 'beginner',
            description TEXT,
            standard_video_url VARCHAR(255),
            skeleton_data JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 分析记录表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analysis_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action_type_id INTEGER,
            video_url VARCHAR(255),
            overall_score INTEGER,
            metrics JSON,
            problems JSON,
            suggestions JSON,
            duration INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (action_type_id) REFERENCES action_types(id)
        )
    ''')
    
    # 训练计划表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS training_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            exercises JSON,
            start_date DATE,
            end_date DATE,
            status VARCHAR(20) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # 用户进度表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action_type_id INTEGER,
            best_score INTEGER,
            total_attempts INTEGER DEFAULT 0,
            last_practice_date DATETIME,
            improvement_rate DECIMAL(5,2),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (action_type_id) REFERENCES action_types(id)
        )
    ''')
    
    # 收藏表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action_type_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (action_type_id) REFERENCES action_types(id),
            UNIQUE(user_id, action_type_id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ 数据库表结构创建完成")

def insert_sample_data():
    """插入示例数据"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 插入标准动作数据
    actions = [
        ('正手攻球 - 初级', '正手', 'beginner', '基础正手攻球动作', None, None),
        ('正手攻球 - 中级', '正手', 'intermediate', '进阶正手攻球技巧', None, None),
        ('正手攻球 - 高级', '正手', 'advanced', '专业级正手攻球', None, None),
        ('反手推挡 - 初级', '反手', 'beginner', '基础反手推挡动作', None, None),
        ('反手推挡 - 中级', '反手', 'intermediate', '进阶反手推挡技巧', None, None),
        ('反手推挡 - 高级', '反手', 'advanced', '专业级反手推挡', None, None),
        ('正手发球', '发球', 'intermediate', '正手发球技术', None, None),
        ('反手发球', '发球', 'intermediate', '反手发球技术', None, None),
        ('侧旋发球', '发球', 'advanced', '侧旋发球技巧', None, None),
        ('下旋发球', '发球', 'advanced', '下旋发球技巧', None, None),
        ('逆旋转发球', '发球', 'advanced', '逆旋转发球技巧', None, None),
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO action_types (name, category, difficulty, description, standard_video_url, skeleton_data)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', actions)
    
    # 插入测试用户
    cursor.execute('''
        INSERT OR IGNORE INTO users (username, email, password_hash, membership_level)
        VALUES ('demo', 'demo@pingpong.ai', 'demo123', 'premium')
    ''')
    
    conn.commit()
    conn.close()
    print("✅ 示例数据插入完成")

def verify_db():
    """验证数据库"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 检查表
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print(f"\n📊 数据库表：{len(tables)} 个")
    for table in tables:
        print(f"  - {table[0]}")
    
    # 检查数据
    cursor.execute("SELECT COUNT(*) FROM action_types")
    action_count = cursor.fetchone()[0]
    print(f"\n📊 标准动作数量：{action_count}")
    
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]
    print(f"📊 用户数量：{user_count}")
    
    conn.close()
    print("\n✅ 数据库验证完成")

if __name__ == '__main__':
    print("🏓 PingPong AI - 数据库初始化")
    print("=" * 40)
    
    create_tables()
    insert_sample_data()
    verify_db()
    
    print(f"\n💾 数据库文件：{DB_PATH}")
