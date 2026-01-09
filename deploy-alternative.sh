#!/bin/bash

# LPH 备用部署脚本 - 使用 docker run 命令而不是 docker-compose
# 用于解决 AppArmor 兼容性问题

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 LPH 备用部署脚本（使用 docker run）${NC}"
echo ""

# 配置
REMOTE_HOST="dz"
IMAGE_PREFIX="lph"
BACKEND_IMAGE="${IMAGE_PREFIX}-backend"
FRONTEND_IMAGE="${IMAGE_PREFIX}-frontend"
REMOTE_DIR="~/lph"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到 Docker${NC}"
    exit 1
fi

# 构建镜像（使用 buildx）
echo -e "${GREEN}🔨 构建镜像...${NC}"
cd backend
docker buildx build --platform linux/amd64 --tag "${BACKEND_IMAGE}:latest" --load --file Dockerfile .
cd ..

docker buildx build --platform linux/amd64 --tag "${FRONTEND_IMAGE}:latest" --load --file Dockerfile.frontend .

# 保存镜像
echo -e "${GREEN}💾 保存镜像...${NC}"
docker save "${BACKEND_IMAGE}:latest" | gzip > /tmp/${BACKEND_IMAGE}.tar.gz
docker save "${FRONTEND_IMAGE}:latest" | gzip > /tmp/${FRONTEND_IMAGE}.tar.gz

# 传输到远程服务器
echo -e "${GREEN}📤 传输到远程服务器...${NC}"
scp /tmp/${BACKEND_IMAGE}.tar.gz "$REMOTE_HOST:/tmp/"
scp /tmp/${FRONTEND_IMAGE}.tar.gz "$REMOTE_HOST:/tmp/"

# 在远程服务器上部署
echo -e "${GREEN}🚀 在远程服务器上部署...${NC}"
ssh "$REMOTE_HOST" << 'ENDSSH'
set -e
cd ~/lph

# 加载镜像
echo "加载镜像..."
docker load -i /tmp/lph-backend.tar.gz
docker load -i /tmp/lph-frontend.tar.gz

# 停止并删除旧容器
echo "停止旧容器..."
docker stop lph-backend lph-frontend 2>/dev/null || true
docker rm lph-backend lph-frontend 2>/dev/null || true

# 创建网络
docker network create lph-network 2>/dev/null || true

# 启动后端容器（使用更明确的安全选项）
echo "启动后端容器..."
docker run -d \
  --name lph-backend \
  --network lph-network \
  -p 3888:3888 \
  -e PORT=3888 \
  -e CORS_ORIGIN=http://localhost:3777 \
  -e NODE_ENV=production \
  -e DATABASE_PATH=/app/data \
  -v $(pwd)/backend/data:/app/data \
  -v /etc/os-release:/etc/os-release:ro \
  --privileged \
  --security-opt apparmor=unconfined \
  --security-opt seccomp=unconfined \
  --restart unless-stopped \
  lph-backend:latest

# 启动前端容器
echo "启动前端容器..."
docker run -d \
  --name lph-frontend \
  --network lph-network \
  -p 3777:80 \
  -e VITE_API_URL=http://localhost:3888/api \
  --restart unless-stopped \
  lph-frontend:latest

# 清理临时文件
rm -f /tmp/lph-backend.tar.gz /tmp/lph-frontend.tar.gz

echo "✅ 部署完成！"
echo ""
echo "服务地址："
SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "YOUR_SERVER_IP")
echo "  前端: http://${SERVER_IP}:3777"
echo "  后端: http://${SERVER_IP}:3888"
ENDSSH

# 清理本地临时文件
rm -f /tmp/${BACKEND_IMAGE}.tar.gz /tmp/${FRONTEND_IMAGE}.tar.gz

echo -e "${GREEN}✅ 部署完成！${NC}"

