# 部署指南

## 一键部署到远程服务器

### 从 macOS ARM 部署到 x86 Linux 服务器

如果你在 macOS ARM 架构机器上开发，需要部署到 x86 Linux 服务器，可以使用一键部署脚本：

```bash
# 运行部署脚本
./deploy.sh
```

**部署脚本功能：**
- ✅ 自动使用 Docker Buildx 构建 linux/amd64 平台镜像（跨平台构建）
- ✅ 自动传输镜像到远程服务器（通过 SSH）
- ✅ 自动在远程服务器上加载镜像并启动服务
- ✅ 自动清理临时文件

**前置要求：**
1. 本地已安装 Docker 和 Docker Buildx
2. 配置了 SSH 连接到远程服务器（`ssh dz` 可以连接）
3. 远程服务器已安装 Docker 和 Docker Compose

**部署流程：**
1. 脚本会在本地构建适合 linux/amd64 平台的镜像
2. 将镜像打包并传输到远程服务器
3. 在远程服务器上加载镜像
4. 使用 docker-compose 启动服务

**服务端口：**
- 前端：3777
- 后端：3888

**查看远程日志：**
```bash
ssh dz 'cd ~/lph && docker-compose logs -f'
```

**停止远程服务：**
```bash
ssh dz 'cd ~/lph && docker-compose down'
```

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
CORS_ORIGIN=http://localhost:3777
```

3. **启动所有服务**
```bash
docker-compose up -d
```

这将启动：
- 后端服务：http://localhost:3888
- 前端服务：http://localhost:3777

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
PORT=3888
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:3777
NODE_ENV=production
DATABASE_PATH=/app/data
EOF

# 使用 docker-compose
docker-compose up -d

# 或使用 docker 命令
docker build -t lph-backend .
docker run -d -p 3888:3888 \
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
PORT=3888
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:3777
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
echo "VITE_API_URL=http://localhost:3888/api" > .env
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
   - 定期备份 JSON 数据文件（`backend/data/aliases.json` 和 `backend/data/ai_configs.json`）
   - 数据文件存储在 Docker volume 中，确保 volume 持久化

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

