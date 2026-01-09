# 部署指南

## Docker 部署（推荐）

### 快速开始

1. **克隆项目并进入目录**
```bash
git clone <repository-url>
cd LPH
```

2. **创建环境变量文件**

在项目根目录创建 `.env` 文件：
```env
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:5173
```

3. **启动所有服务**
```bash
docker-compose up -d
```

这将启动：
- 后端服务：http://localhost:3001
- 前端服务：http://localhost:5173

4. **查看日志**
```bash
docker-compose logs -f
```

5. **停止服务**
```bash
docker-compose down
```

### 仅部署后端

如果您只想部署后端服务：

```bash
cd backend

# 创建 .env 文件
cat > .env << EOF
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:5173
NODE_ENV=production
DATABASE_PATH=/app/data/lph.db
EOF

# 使用 docker-compose
docker-compose up -d

# 或使用 docker 命令
docker build -t lph-backend .
docker run -d -p 3001:3001 \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  --privileged \
  --name lph-backend \
  lph-backend
```

## 本地部署

### 后端

```bash
cd backend

# 安装依赖
npm install

# 创建环境变量文件
cat > .env << EOF
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
EOF

# 开发模式
npm run dev

# 或生产模式
npm run build
npm start
```

### 前端

```bash
# 在项目根目录

# 安装依赖
npm install

# 创建 .env 文件
echo "VITE_API_URL=http://localhost:3001/api" > .env
echo "GEMINI_API_KEY=your_gemini_api_key_here" >> .env

# 开发模式
npm run dev

# 生产构建
npm run build
npm run preview
```

## 生产环境注意事项

1. **安全性**
   - 设置正确的 CORS 源
   - 使用环境变量管理敏感信息
   - 考虑添加身份验证
   - 使用 HTTPS

2. **性能**
   - 使用反向代理（如 Nginx）提供静态文件
   - 启用 Gzip 压缩
   - 配置适当的缓存策略

3. **监控**
   - 配置日志收集
   - 设置健康检查端点（`/health`）
   - 监控资源使用情况

4. **数据库**
   - 定期备份 SQLite 数据库
   - 考虑迁移到 PostgreSQL/MySQL（如需要）

## 故障排除

### 后端无法获取系统信息

- 确保容器以 `--privileged` 模式运行
- 检查是否安装了必要的系统工具
- 查看容器日志：`docker logs lph-backend`

### 前端无法连接到后端

- 检查 CORS 配置
- 确认 `VITE_API_URL` 环境变量正确设置
- 检查防火墙设置

### AI 功能不可用

- 确认 `GEMINI_API_KEY` 已正确设置
- 检查 API 密钥是否有效
- 查看后端日志中的错误信息

