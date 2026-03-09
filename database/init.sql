-- 🏓 乒乓球 AI 应用 - MySQL 数据库初始化脚本
-- 创建时间：2026-03-09
-- 数据库：pingpong_ai

USE pingpong_ai;

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  nickname VARCHAR(100) COMMENT '昵称',
  avatar_url VARCHAR(255) COMMENT '头像 URL',
  level VARCHAR(20) DEFAULT 'beginner' COMMENT '水平等级：beginner/intermediate/advanced',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 分析记录表
-- ============================================
CREATE TABLE IF NOT EXISTS analysis_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT COMMENT '用户 ID',
  session_id VARCHAR(64) COMMENT '会话 ID',
  action_type VARCHAR(20) NOT NULL COMMENT '动作类型：forehand/backhand/serve',
  action_name VARCHAR(50) COMMENT '动作名称',
  angle VARCHAR(10) COMMENT '拍摄角度：side/front',
  score INT CHECK(score >= 0 AND score <= 100) COMMENT '分析得分',
  level VARCHAR(20) COMMENT '等级评价：优秀/良好/需改进',
  duration_ms INT COMMENT '分析耗时 (毫秒)',
  keypoints_json TEXT COMMENT '关键点位数据 (JSON)',
  differences_json TEXT COMMENT '差异数据 (JSON)',
  file_path VARCHAR(255) COMMENT '文件路径',
  file_type VARCHAR(10) COMMENT '文件类型：jpg/png/mp4/mov',
  file_size BIGINT COMMENT '文件大小 (字节)',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_action (action_type),
  INDEX idx_created (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分析记录表';

-- ============================================
-- 标准动作表
-- ============================================
CREATE TABLE IF NOT EXISTS standard_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action_code VARCHAR(30) UNIQUE NOT NULL COMMENT '动作代码',
  action_name VARCHAR(50) NOT NULL COMMENT '动作名称',
  category VARCHAR(20) NOT NULL COMMENT '类别：forehand/backhand/serve',
  level VARCHAR(20) NOT NULL COMMENT '难度等级：basic/intermediate/advanced',
  player_name VARCHAR(50) COMMENT '参考选手',
  description TEXT COMMENT '动作描述',
  video_side_path VARCHAR(255) COMMENT '侧面视频路径',
  video_front_path VARCHAR(255) COMMENT '正面视频路径',
  keypoints_json TEXT NOT NULL COMMENT '关键点位数据 (JSON)',
  common_errors_json TEXT COMMENT '常见错误 (JSON)',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标准动作表';

-- ============================================
-- 训练计划表
-- ============================================
CREATE TABLE IF NOT EXISTS training_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT '用户 ID',
  plan_name VARCHAR(100) NOT NULL COMMENT '计划名称',
  target_actions_json TEXT COMMENT '目标动作列表 (JSON)',
  start_date DATE COMMENT '开始日期',
  end_date DATE COMMENT '结束日期',
  status VARCHAR(20) DEFAULT 'active' COMMENT '状态：active/completed/cancelled',
  progress INT DEFAULT 0 COMMENT '进度百分比',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='训练计划表';

-- ============================================
-- 训练记录表
-- ============================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT COMMENT '计划 ID',
  user_id INT NOT NULL COMMENT '用户 ID',
  action_id INT NOT NULL COMMENT '动作 ID',
  duration_seconds INT COMMENT '训练时长 (秒)',
  rep_count INT COMMENT '重复次数',
  avg_score INT COMMENT '平均得分',
  best_score INT COMMENT '最佳得分',
  notes TEXT COMMENT '备注',
  session_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '训练时间',
  INDEX idx_plan (plan_id),
  INDEX idx_user (user_id),
  INDEX idx_date (session_date),
  FOREIGN KEY (plan_id) REFERENCES training_plans(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (action_id) REFERENCES standard_actions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='训练记录表';

-- ============================================
-- 初始化标准动作数据 (11 个动作)
-- ============================================
INSERT INTO standard_actions (action_code, action_name, category, level, player_name, description, keypoints_json) VALUES
('FH-BASIC', '正手攻球 - 基础', 'forehand', 'basic', '马龙', '正手攻球基础动作，适合初学者', '{"elbow": {"min": 85, "max": 105, "optimal": 95}, "knee": {"min": 110, "max": 130, "optimal": 120}, "torso": {"min": 5, "max": 15, "optimal": 10}, "wrist": {"min": 70, "max": 80, "optimal": 75}}'),
('FH-INTER', '正手攻球 - 中级', 'forehand', 'intermediate', '马龙', '正手攻球中级动作，增加腰部发力', '{"elbow": {"min": 80, "max": 100, "optimal": 90}, "knee": {"min": 100, "max": 120, "optimal": 110}, "torso": {"min": 10, "max": 25, "optimal": 18}, "wrist": {"min": 65, "max": 85, "optimal": 75}}'),
('FH-ADV', '正手攻球 - 高级', 'forehand', 'advanced', '马龙', '正手攻球高级动作，完整动力链', '{"elbow": {"min": 75, "max": 95, "optimal": 85}, "knee": {"min": 90, "max": 110, "optimal": 100}, "torso": {"min": 15, "max": 35, "optimal": 25}, "wrist": {"min": 60, "max": 90, "optimal": 75}}'),
('BH-BASIC', '反手推挡 - 基础', 'backhand', 'basic', '张继科', '反手推挡基础动作', '{"elbow": {"min": 90, "max": 110, "optimal": 100}, "knee": {"min": 115, "max": 135, "optimal": 125}, "torso": {"min": 0, "max": 10, "optimal": 5}, "wrist": {"min": 75, "max": 85, "optimal": 80}}'),
('BH-INTER', '反手推挡 - 中级', 'backhand', 'intermediate', '张继科', '反手推挡中级动作', '{"elbow": {"min": 85, "max": 105, "optimal": 95}, "knee": {"min": 105, "max": 125, "optimal": 115}, "torso": {"min": 5, "max": 15, "optimal": 10}, "wrist": {"min": 70, "max": 90, "optimal": 80}}'),
('BH-ADV', '反手推挡 - 高级', 'backhand', 'advanced', '张继科', '反手推挡高级动作', '{"elbow": {"min": 80, "max": 100, "optimal": 90}, "knee": {"min": 95, "max": 115, "optimal": 105}, "torso": {"min": 10, "max": 20, "optimal": 15}, "wrist": {"min": 65, "max": 95, "optimal": 80}}'),
('SV-FH', '正手发球', 'serve', 'basic', '许昕', '正手基础发球', '{"elbow": {"min": 100, "max": 120, "optimal": 110}, "knee": {"min": 120, "max": 140, "optimal": 130}, "torso": {"min": 5, "max": 15, "optimal": 10}, "wrist": {"min": 80, "max": 100, "optimal": 90}}'),
('SV-BH', '反手发球', 'serve', 'basic', '许昕', '反手基础发球', '{"elbow": {"min": 95, "max": 115, "optimal": 105}, "knee": {"min": 115, "max": 135, "optimal": 125}, "torso": {"min": 0, "max": 10, "optimal": 5}, "wrist": {"min": 75, "max": 95, "optimal": 85}}'),
('SV-SIDE', '侧旋发球', 'serve', 'intermediate', '许昕', '侧旋发球技术', '{"elbow": {"min": 90, "max": 110, "optimal": 100}, "knee": {"min": 110, "max": 130, "optimal": 120}, "torso": {"min": 10, "max": 25, "optimal": 18}, "wrist": {"min": 70, "max": 100, "optimal": 85}}'),
('SV-DOWN', '下旋发球', 'serve', 'intermediate', '许昕', '下旋发球技术', '{"elbow": {"min": 85, "max": 105, "optimal": 95}, "knee": {"min": 105, "max": 125, "optimal": 115}, "torso": {"min": 5, "max": 20, "optimal": 12}, "wrist": {"min": 65, "max": 95, "optimal": 80}}'),
('SV-REVERSE', '逆旋转发球', 'serve', 'advanced', '许昕', '逆旋转发球高级技术', '{"elbow": {"min": 80, "max": 100, "optimal": 90}, "knee": {"min": 100, "max": 120, "optimal": 110}, "torso": {"min": 15, "max": 30, "optimal": 22}, "wrist": {"min": 60, "max": 100, "optimal": 80}}');

-- ============================================
-- 验证数据
-- ============================================
SELECT '数据库初始化完成!' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_records FROM analysis_records;
SELECT COUNT(*) AS total_actions FROM standard_actions;
SELECT action_code, action_name, category, level FROM standard_actions;
