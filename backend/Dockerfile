# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine

# 安装系统依赖（用于执行 Linux 命令）
# 注意：根据实际使用的包管理器选择性安装
RUN apk add --no-cache \
    bash \
    coreutils \
    procps \
    util-linux \
    shadow \
    || true

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./
COPY tsconfig.json ./

# 安装所有依赖（包括开发依赖，用于构建）
RUN npm ci

# 复制源代码
COPY src/ ./src/

# 编译 TypeScript
RUN npm run build

# 清理开发依赖并重新安装仅生产依赖
RUN rm -rf node_modules && npm ci --only=production

# 创建数据目录
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["node", "dist/index.js"]

