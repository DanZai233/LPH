#!/bin/bash

# LPH 一键部署脚本
# 从 macOS ARM 架构构建并部署到 x86 Linux 服务器

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 LPH 部署脚本${NC}"
echo ""

# 配置
REMOTE_HOST="dz"
IMAGE_PREFIX="lph"
BACKEND_IMAGE="${IMAGE_PREFIX}-backend"
FRONTEND_IMAGE="${IMAGE_PREFIX}-frontend"
REMOTE_DIR="~/lph"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到 Docker，请先安装 Docker${NC}"
    exit 1
fi

# 检查 Docker Buildx 是否可用
if ! docker buildx version &> /dev/null; then
    echo -e "${RED}❌ 错误: Docker Buildx 不可用，请更新 Docker${NC}"
    exit 1
fi

# 创建 buildx builder（如果不存在）
BUILDER_NAME="lph-builder"
if ! docker buildx ls | grep -q "$BUILDER_NAME"; then
    echo -e "${YELLOW}📦 创建 Docker Buildx builder...${NC}"
    docker buildx create --name "$BUILDER_NAME" --use
    docker buildx inspect --bootstrap
else
    echo -e "${YELLOW}📦 使用现有的 Docker Buildx builder...${NC}"
    docker buildx use "$BUILDER_NAME"
fi

# 构建后端镜像（支持多平台）
echo -e "${GREEN}🔨 构建后端镜像 (linux/amd64)...${NC}"
cd backend
docker buildx build \
    --platform linux/amd64 \
    --tag "${BACKEND_IMAGE}:latest" \
    --load \
    --file Dockerfile \
    .

cd ..

# 构建前端镜像（支持多平台）
echo -e "${GREEN}🔨 构建前端镜像 (linux/amd64)...${NC}"
docker buildx build \
    --platform linux/amd64 \
    --tag "${FRONTEND_IMAGE}:latest" \
    --load \
    --file Dockerfile.frontend \
    .

# 保存镜像为 tar 文件
echo -e "${GREEN}💾 保存镜像为 tar 文件...${NC}"
docker save "${BACKEND_IMAGE}:latest" | gzip > /tmp/${BACKEND_IMAGE}.tar.gz
docker save "${FRONTEND_IMAGE}:latest" | gzip > /tmp/${FRONTEND_IMAGE}.tar.gz

# 检查 SSH 连接
echo -e "${YELLOW}🔌 检查远程服务器连接...${NC}"
if ! ssh -o ConnectTimeout=5 "$REMOTE_HOST" echo "连接成功" &> /dev/null; then
    echo -e "${RED}❌ 错误: 无法连接到远程服务器 $REMOTE_HOST${NC}"
    echo "请确保："
    echo "  1. SSH 配置正确（~/.ssh/config 中有 'dz' 配置）"
    echo "  2. 可以使用 'ssh dz' 连接"
    exit 1
fi

# 在远程服务器上创建目录
echo -e "${GREEN}📁 在远程服务器上创建目录...${NC}"
ssh "$REMOTE_HOST" "mkdir -p $REMOTE_DIR/backend/data"

# 传输镜像文件
echo -e "${GREEN}📤 传输镜像文件到远程服务器...${NC}"
scp /tmp/${BACKEND_IMAGE}.tar.gz "$REMOTE_HOST:/tmp/"
scp /tmp/${FRONTEND_IMAGE}.tar.gz "$REMOTE_HOST:/tmp/"

# 传输部署文件
echo -e "${GREEN}📤 传输部署文件到远程服务器...${NC}"
scp docker-compose.yml "$REMOTE_HOST:$REMOTE_DIR/"
scp docker-compose.prod.yml "$REMOTE_HOST:$REMOTE_DIR/"

# 在远程服务器上加载镜像和部署
echo -e "${GREEN}🚀 在远程服务器上加载镜像并部署...${NC}"
ssh "$REMOTE_HOST" << 'ENDSSH'
set -e
cd ~/lph

# 检查并处理 AppArmor（如果可用）
if command -v aa-status &> /dev/null; then
  echo "检测到 AppArmor，尝试禁用对 Docker 的 AppArmor 限制..."
  # 尝试卸载 Docker 的 AppArmor profile（如果存在）
  sudo aa-complain /etc/apparmor.d/docker 2>/dev/null || true
  sudo service apparmor reload 2>/dev/null || true
fi

# 加载镜像
echo "加载后端镜像..."
docker load -i /tmp/lph-backend.tar.gz
echo "加载前端镜像..."
docker load -i /tmp/lph-frontend.tar.gz

# 停止并删除旧容器（包括失败的容器）
echo "停止旧容器..."
docker stop lph-backend lph-frontend 2>/dev/null || true
docker rm -f lph-backend lph-frontend 2>/dev/null || true
# 清理可能存在的网络
docker network rm lph-network lph_lph-network 2>/dev/null || true

# 启动新容器（使用 docker run 以避免 docker-compose 的 AppArmor 问题）
echo "启动新容器..."

# 创建网络
docker network create lph-network 2>/dev/null || true

# 启动后端（使用 docker run，明确禁用 AppArmor）
echo "启动后端容器..."
# 使用 --privileged 但明确禁用 AppArmor 和 seccomp
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

# 启动前端
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
if command -v hostname -I &> /dev/null; then
    SERVER_IP=$(hostname -I | awk '{print $1}')
else
    SERVER_IP=$(ip route get 8.8.8.8 | awk '{print $7; exit}' 2>/dev/null || echo "YOUR_SERVER_IP")
fi
echo "  前端: http://${SERVER_IP}:3777"
echo "  后端: http://${SERVER_IP}:3888"
echo ""
echo "查看日志:"
echo "  后端: docker logs -f lph-backend"
echo "  前端: docker logs -f lph-frontend"
ENDSSH

# 清理本地临时文件
rm -f /tmp/${BACKEND_IMAGE}.tar.gz /tmp/${FRONTEND_IMAGE}.tar.gz

echo ""
echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "服务地址："
echo "  前端: http://<服务器IP>:3777"
echo "  后端: http://<服务器IP>:3888"
echo ""
echo "查看远程日志:"
echo "  ssh $REMOTE_HOST 'docker logs -f lph-backend'"
echo "  ssh $REMOTE_HOST 'docker logs -f lph-frontend'"
echo ""
echo "如果遇到 AppArmor 错误，可以在远程服务器上运行修复脚本:"
echo "  scp fix-apparmor.sh $REMOTE_HOST:~/lph/"
echo "  ssh $REMOTE_HOST 'cd ~/lph && bash fix-apparmor.sh'"

