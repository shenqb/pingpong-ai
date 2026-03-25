/**
 * PingPong AI - API 路由
 * 适配 V3.0 UI 的 API 接口
 */

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库路径
const DB_PATH = path.join(__dirname, '../../database/pingpong.db');

// 获取数据库连接
function getDB() {
    return new sqlite3.Database(DB_PATH);
}

// 格式化日期
function formatDate(date) {
    return date.toISOString().replace('T', ' ').substring(0, 19);
}

// 健康检查
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 获取用户统计
router.get('/api/stats', (req, res) => {
    const db = getDB();
    const userId = req.query.userId || 1; // 默认演示用户
    
    db.serialize(() => {
        // 今日分析次数
        db.get(`
            SELECT COUNT(*) as count 
            FROM analysis_records 
            WHERE user_id = ? 
            AND DATE(created_at) = DATE('now')
        `, [userId], (err, todayRow) => {
            // 平均分
            db.get(`
                SELECT AVG(overall_score) as avg 
                FROM analysis_records 
                WHERE user_id = ?
            `, [userId], (err, avgRow) => {
                // 进步率（最近 7 次 vs 之前 7 次）
                db.all(`
                    SELECT overall_score 
                    FROM analysis_records 
                    WHERE user_id = ? 
                    ORDER BY created_at DESC 
                    LIMIT 14
                `, [userId], (err, rows) => {
                    let improvement = 0;
                    if (rows && rows.length >= 2) {
                        const recent = rows.slice(0, 7);
                        const previous = rows.slice(7, 14);
                        const recentAvg = recent.reduce((sum, r) => sum + r.overall_score, 0) / recent.length;
                        const previousAvg = previous.length > 0 ? previous.reduce((sum, r) => sum + r.overall_score, 0) / previous.length : recentAvg;
                        improvement = previousAvg > 0 ? Math.round(((recentAvg - previousAvg) / previousAvg) * 100) : 0;
                    }
                    
                    db.close();
                    res.json({
                        todayAnalysis: todayRow ? todayRow.count : 0,
                        avgScore: avgRow && avgRow.avg ? Math.round(avgRow.avg) : 0,
                        improvement: improvement
                    });
                });
            });
        });
    });
});

// 获取最近分析记录
router.get('/api/analysis/recent', (req, res) => {
    const db = getDB();
    const userId = req.query.userId || 1;
    const limit = req.query.limit || 10;
    
    db.all(`
        SELECT 
            ar.id,
            ar.overall_score as score,
            at.name as actionName,
            ar.created_at as timestamp,
            ar.duration
        FROM analysis_records ar
        LEFT JOIN action_types at ON ar.action_type_id = at.id
        WHERE ar.user_id = ?
        ORDER BY ar.created_at DESC
        LIMIT ?
    `, [userId, limit], (err, rows) => {
        db.close();
        
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        // 格式化返回数据
        const formatted = rows.map((row, index) => ({
            id: row.id,
            score: row.score,
            actionName: row.actionName || '未知动作',
            time: formatTime(row.timestamp),
            trend: index === 0 ? 'up' : (row.score > (rows[index - 1]?.score || row.score) ? 'up' : 'same'),
            change: index === 0 ? 5 : 0
        }));
        
        res.json(formatted);
    });
});

// 获取分析详情
router.get('/api/analysis/:id', (req, res) => {
    const db = getDB();
    const analysisId = req.params.id;
    
    db.get(`
        SELECT 
            ar.*,
            at.name as actionName,
            at.category,
            at.difficulty
        FROM analysis_records ar
        LEFT JOIN action_types at ON ar.action_type_id = at.id
        WHERE ar.id = ?
    `, [analysisId], (err, row) => {
        db.close();
        
        if (err || !row) {
            return res.status(404).json({ error: '记录不存在' });
        }
        
        res.json({
            id: row.id,
            score: row.overall_score,
            actionName: row.actionName,
            metrics: row.metrics ? JSON.parse(row.metrics) : {},
            problems: row.problems ? JSON.parse(row.problems) : [],
            suggestions: row.suggestions ? JSON.parse(row.suggestions) : [],
            duration: row.duration,
            createdAt: row.created_at
        });
    });
});

// 获取标准动作列表
router.get('/api/actions', (req, res) => {
    const db = getDB();
    const category = req.query.category;
    const difficulty = req.query.difficulty;
    
    let query = 'SELECT * FROM action_types WHERE 1=1';
    const params = [];
    
    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    
    if (difficulty) {
        query += ' AND difficulty = ?';
        params.push(difficulty);
    }
    
    query += ' ORDER BY category, difficulty';
    
    db.all(query, params, (err, rows) => {
        db.close();
        
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        res.json(rows);
    });
});

// 获取单个动作详情
router.get('/api/actions/:id', (req, res) => {
    const db = getDB();
    const actionId = req.params.id;
    
    db.get('SELECT * FROM action_types WHERE id = ?', [actionId], (err, row) => {
        db.close();
        
        if (err || !row) {
            return res.status(404).json({ error: '动作不存在' });
        }
        
        res.json({
            ...row,
            skeleton_data: row.skeleton_data ? JSON.parse(row.skeleton_data) : null
        });
    });
});

// 创建分析记录
router.post('/api/analysis', (req, res) => {
    const db = getDB();
    const { userId, actionTypeId, videoUrl, score, metrics, problems, suggestions, duration } = req.body;
    
    const query = `
        INSERT INTO analysis_records 
        (user_id, action_type_id, video_url, overall_score, metrics, problems, suggestions, duration)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
        userId || 1,
        actionTypeId,
        videoUrl,
        score,
        JSON.stringify(metrics || {}),
        JSON.stringify(problems || []),
        JSON.stringify(suggestions || []),
        duration || 0
    ], function(err) {
        db.close();
        
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        res.json({
            id: this.lastID,
            message: '分析记录创建成功'
        });
    });
});

// 辅助函数：格式化时间
function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

module.exports = router;
