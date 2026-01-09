<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Linux Package Hub (LPH)

一个统一的 Linux 包管理集合程序，支持多个包管理器（APT、YUM、Pacman、Snap、Flatpak、Brew），提供别名管理和 AI 驱动的命令发现功能。

## 功能特性

- 🎯 **统一包管理界面** - 在一个界面中管理所有 Linux 包管理器
- 📦 **多包管理器支持** - 支持 APT、YUM、Pacman、Snap、Flatpak、Brew
- 🔍 **智能搜索** - 通过 AI 搜索和发现 Linux 命令
- 📝 **别名管理** - 创建和管理常用的命令别名
- 📊 **系统监控** - 实时查看系统信息和包统计
- 🤖 **多 AI 供应商支持** - 支持多个 AI 服务提供商，可在前端直接配置
  - Google Gemini
  - OpenAI (GPT-3.5, GPT-4)
  - OpenRouter (统一接口访问多种模型)
  - 火山引擎 (豆包)
  - Anthropic (Claude)

## 技术栈

### 前端
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Lucide React Icons

### 后端
- Node.js + Express
- TypeScript
- SQLite (Better-SQLite3)
- Google Generative AI (Gemini)

## 项目结构

```
LPH/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── utils/          # 工具函数
│   │   ├── types.ts        # 类型定义
│   │   └── index.ts        # 入口文件
│   ├── Dockerfile          # 后端 Docker 配置
│   ├── package.json        # 后端依赖
│   └── tsconfig.json       # TypeScript 配置
├── components/             # React 组件
├── services/               # 前端服务（API 客户端、AI 服务）
├── docker-compose.yml      # Docker Compose 配置
├── Dockerfile.frontend     # 前端 Docker 配置
└── package.json            # 前端依赖
```

## 快速开始

### 前置要求

- Node.js 18+ 
- npm 或 yarn
- Docker 和 Docker Compose（可选，用于容器化部署）
- Google Gemini API Key（用于 AI 功能，可选）

### 本地开发

#### 1. 克隆项目

```bash
git clone <repository-url>
cd LPH
```

#### 2. 安装前端依赖

```bash
npm install
```

#### 3. 安装后端依赖

```bash
cd backend
npm install
cd ..
```

#### 4. 配置环境变量

创建 `.env` 文件（前端）：

```env
VITE_API_URL=http://localhost:3001/api
GEMINI_API_KEY=your_gemini_api_key_here
```

创建 `backend/.env` 文件（后端）：

```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

#### 5. 启动后端服务

```bash
cd backend
npm run dev
```

后端服务将在 `http://localhost:3001` 启动

#### 6. 启动前端开发服务器

```bash
npm run dev
```

前端应用将在 `http://localhost:5173` 启动

### Docker 部署

#### 方式 1: 使用 Docker Compose（推荐）

1. 创建 `.env` 文件：

```env
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:5173
```

2. 启动所有服务：

```bash
docker-compose up -d
```

这将启动：
- 后端服务：`http://localhost:3001`
- 前端服务：`http://localhost:5173`

3. 查看日志：

```bash
docker-compose logs -f
```

4. 停止服务：

```bash
docker-compose down
```

#### 方式 2: 单独构建和运行

**构建后端镜像：**

```bash
cd backend
docker build -t lph-backend .
docker run -d -p 3001:3001 \
  -e GEMINI_API_KEY=your_api_key \
  -e CORS_ORIGIN=http://localhost:5173 \
  -v $(pwd)/data:/app/data \
  --privileged \
  --name lph-backend \
  lph-backend
```

**构建前端镜像：**

```bash
docker build -f Dockerfile.frontend -t lph-frontend .
docker run -d -p 5173:80 \
  -e VITE_API_URL=http://localhost:3001/api \
  --name lph-frontend \
  lph-frontend
```

## API 文档

### 系统信息

- `GET /api/system/info` - 获取系统信息
- `GET /api/system/stats` - 获取系统统计信息
- `GET /api/system/package-managers` - 获取包管理器状态

### 包管理

- `GET /api/packages` - 获取所有包（支持查询参数：`search`, `manager`）
- `GET /api/packages/:id` - 获取特定包信息
- `GET /api/packages/search/:query` - 搜索包

### 别名管理

- `GET /api/aliases` - 获取所有别名
- `GET /api/aliases/:id` - 获取特定别名
- `POST /api/aliases` - 创建新别名
- `PUT /api/aliases/:id` - 更新别名
- `DELETE /api/aliases/:id` - 删除别名

### AI 服务

- `POST /api/ai/explain-package` - 解释包的功能
- `POST /api/ai/search-commands` - 搜索命令
- `POST /api/ai/suggest-alias` - 建议别名名称

### 配置管理

- `GET /api/config/ai` - 获取所有 AI 配置
- `GET /api/config/ai/:id` - 获取特定 AI 配置
- `POST /api/config/ai` - 创建新的 AI 配置
- `PUT /api/config/ai/:id` - 更新 AI 配置
- `DELETE /api/config/ai/:id` - 删除 AI 配置
- `POST /api/config/ai/:id/activate` - 激活 AI 配置
- `GET /api/config/ai-providers` - 获取可用的 AI 供应商列表

## 开发

### 后端开发

```bash
cd backend
npm run dev      # 开发模式（带热重载）
npm run build    # 构建生产版本
npm start        # 运行生产版本
```

### 前端开发

```bash
npm run dev      # 开发模式
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
```

## 配置 AI 供应商

### 在前端配置页面设置

1. 打开应用，进入 **Settings** 页面
2. 点击 **Add Provider** 按钮
3. 选择 AI 供应商（Gemini、OpenAI、OpenRouter、火山引擎、Anthropic）
4. 填写配置信息：
   - **Name**: 配置名称（如 "My OpenAI"）
   - **API Key**: 您的 API 密钥
   - **Base URL**: 可选，使用默认值或自定义
   - **Model**: 可选，使用默认模型或指定模型
5. 点击 **Create** 保存配置
6. 点击 **Activate** 激活配置以启用 AI 功能

### 支持的供应商和默认配置

| 供应商 | 默认 Base URL | 默认模型 | 说明 |
|--------|--------------|---------|------|
| Gemini | (自动) | gemini-1.5-flash | Google Gemini API |
| OpenAI | https://api.openai.com/v1 | gpt-3.5-turbo | OpenAI GPT 模型 |
| OpenRouter | https://openrouter.ai/api/v1 | openai/gpt-3.5-turbo | 统一接口访问多种模型 |
| 火山引擎 | https://ark.cn-beijing.volces.com/api/v3 | ep-xxx | 字节跳动火山引擎（需配置 endpoint ID） |
| Anthropic | https://api.anthropic.com/v1 | claude-3-haiku-20240307 | Claude 模型 |

## 注意事项

1. **系统权限**：后端需要执行系统命令来获取包信息，在 Docker 中需要 `--privileged` 标志
2. **包管理器**：确保系统中安装了相应的包管理器工具（apt、yum、pacman 等）
3. **AI 功能**：需要在 Settings 页面配置至少一个 AI 供应商并激活，AI 相关功能才会可用
4. **数据库**：配置和别名数据存储在 SQLite 数据库中，默认位置为 `backend/data/lph.db`
5. **API 密钥安全**：API 密钥存储在本地数据库中，仅显示最后 4 位字符，请妥善保管

## 安全考虑

- 在生产环境中，应该限制 CORS 源
- 考虑添加身份验证和授权
- 验证所有用户输入
- 不要在 Docker 容器中运行需要 root 权限的命令（除非必要）

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
