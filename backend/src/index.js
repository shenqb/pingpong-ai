import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import analysisRoutes from './routes/analysis.js'
import uploadRoutes from './routes/upload.js'
import historyRoutes from './routes/history.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8000

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件服务（上传的文件）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 限制
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|mp4|mov/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error('只支持图片 (jpg/png) 和视频 (mp4/mov) 文件'))
    }
  }
})

// 路由
app.use('/api/analysis', analysisRoutes)
app.use('/api/upload', upload.single('file'), uploadRoutes)
app.use('/api/history', historyRoutes)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    error: err.message || '服务器内部错误'
  })
})

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏓 乒乓球 AI 后端服务已启动：http://localhost:${PORT}`)
})

export default app
