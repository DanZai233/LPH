#!/bin/bash

# AppArmor 修复脚本
# 在远程服务器上运行此脚本来修复 AppArmor 问题

echo "🔧 修复 AppArmor 配置..."

# 检查 AppArmor 状态
if command -v aa-status &> /dev/null; then
    echo "检测到 AppArmor..."
    
    # 方法 1: 将 Docker AppArmor profile 设置为 complain 模式
    if [ -f /etc/apparmor.d/docker ]; then
        echo "将 Docker AppArmor profile 设置为 complain 模式..."
        sudo aa-complain /etc/apparmor.d/docker 2>/dev/null || true
    fi
    
    # 方法 2: 卸载 Docker AppArmor profile
    if [ -f /etc/apparmor.d/docker ]; then
        echo "尝试卸载 Docker AppArmor profile..."
        sudo aa-disable /etc/apparmor.d/docker 2>/dev/null || true
    fi
    
    # 重新加载 AppArmor
    echo "重新加载 AppArmor..."
    sudo service apparmor reload 2>/dev/null || true
fi

# 检查 Docker 是否正常运行
echo "检查 Docker 状态..."
docker info > /dev/null 2>&1 || {
    echo "⚠️  警告: Docker 可能未正常运行"
    exit 1
}

echo "✅ 修复完成！现在可以尝试重新部署容器。"

