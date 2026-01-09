# LPH Backend

Linux Package Hub 的后端服务

## 功能

- 系统信息查询（OS、内核、包管理器状态）
- 包管理（列出、搜索来自多个包管理器的包）
- 别名管理（CRUD 操作）
- AI 集成（Gemini API）

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 GEMINI_API_KEY

# 开发模式运行
npm run dev

# 构建
npm run build

# 生产模式运行
npm start
```

### Docker 部署

```bash
# 构建镜像
docker build -t lph-backend .

# 运行容器
docker run -d -p 3888:3888 \
  -e GEMINI_API_KEY=your_api_key \
  -e CORS_ORIGIN=http://localhost:3777 \
  -v $(pwd)/data:/app/data \
  --privileged \
  --name lph-backend \
  lph-backend
```

## API 端点

详见主 README.md 中的 API 文档部分。

## 环境变量

- `PORT` - 服务端口（默认：3888）
- `GEMINI_API_KEY` - Google Gemini API 密钥（可选，用于 AI 功能）
- `CORS_ORIGIN` - CORS 允许的来源（默认：http://localhost:3777）
- `NODE_ENV` - 环境（development/production）
- `DATABASE_PATH` - SQLite 数据库路径（默认：./lph.db）

