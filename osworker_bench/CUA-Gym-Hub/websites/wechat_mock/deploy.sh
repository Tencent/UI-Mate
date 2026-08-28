#!/bin/bash

# WeChat Mock 部署脚本
# 用途：构建项目并部署到 nginx 服务器

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="wechat_mock"
BUILD_DIR="dist"
NGINX_ROOT="/var/www/wechat_mock"
NGINX_CONF_SOURCE="./nginx.conf"
NGINX_CONF_DEST="/etc/nginx/sites-available/wechat_mock"
NGINX_CONF_ENABLED="/etc/nginx/sites-enabled/wechat_mock"

echo -e "${GREEN}=== WeChat Mock 部署脚本 ===${NC}\n"

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误：请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 1. 安装依赖
echo -e "${YELLOW}步骤 1: 安装依赖...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "依赖已存在，跳过安装"
fi

# 2. 构建项目
echo -e "\n${YELLOW}步骤 2: 构建项目...${NC}"
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}构建失败：$BUILD_DIR 目录不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 构建成功${NC}"

# 3. 创建 nginx 目录
echo -e "\n${YELLOW}步骤 3: 准备部署目录...${NC}"
sudo mkdir -p $NGINX_ROOT

# 4. 复制构建文件
echo -e "\n${YELLOW}步骤 4: 复制构建文件到 $NGINX_ROOT...${NC}"
sudo rm -rf $NGINX_ROOT/*
sudo cp -r $BUILD_DIR/* $NGINX_ROOT/

# 设置正确的权限
sudo chown -R www-data:www-data $NGINX_ROOT
sudo chmod -R 755 $NGINX_ROOT

echo -e "${GREEN}✓ 文件复制完成${NC}"

# 5. 配置 nginx
echo -e "\n${YELLOW}步骤 5: 配置 Nginx...${NC}"

# 检查 nginx 是否安装
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}错误：Nginx 未安装${NC}"
    echo "请运行: sudo apt-get install nginx"
    exit 1
fi

# 复制 nginx 配置
if [ -f "$NGINX_CONF_SOURCE" ]; then
    sudo cp $NGINX_CONF_SOURCE $NGINX_CONF_DEST
    
    # 创建软链接（如果不存在）
    if [ ! -L "$NGINX_CONF_ENABLED" ]; then
        sudo ln -s $NGINX_CONF_DEST $NGINX_CONF_ENABLED
    fi
    
    echo -e "${GREEN}✓ Nginx 配置已更新${NC}"
else
    echo -e "${YELLOW}警告：nginx.conf 不存在，请手动配置 Nginx${NC}"
fi

# 6. 测试 nginx 配置
echo -e "\n${YELLOW}步骤 6: 测试 Nginx 配置...${NC}"
sudo nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx 配置测试通过${NC}"
    
    # 7. 启动/重启 nginx
    echo -e "\n${YELLOW}步骤 7: 启动/重启 Nginx...${NC}"
    
    # 检查 Nginx 是否正在运行
    if sudo systemctl is-active --quiet nginx; then
        # 如果正在运行，重新加载配置
        sudo systemctl reload nginx
        echo -e "${GREEN}✓ Nginx 配置已重新加载${NC}"
    else
        # 如果未运行，启动服务
        sudo systemctl start nginx
        sudo systemctl enable nginx
        echo -e "${GREEN}✓ Nginx 已启动${NC}"
    fi
else
    echo -e "${RED}错误：Nginx 配置测试失败${NC}"
    exit 1
fi

# 8. 显示部署信息
SERVER_IP=$(hostname -I | awk '{print $1}')
echo -e "\n${GREEN}=== 部署完成！ ===${NC}"
echo -e "${GREEN}项目已部署到：${NC}$NGINX_ROOT"
echo -e "${GREEN}Nginx 配置文件：${NC}$NGINX_CONF_DEST"
echo ""
echo -e "${YELLOW}📱 访问地址：${NC}"
echo -e "  ${GREEN}✓${NC} 本地访问: ${GREEN}http://localhost${NC}"
echo -e "  ${GREEN}✓${NC} 服务器访问: ${GREEN}http://${SERVER_IP}${NC}"
if command -v qrencode &> /dev/null; then
    echo -e "\n${YELLOW}📱 手机扫码访问：${NC}"
    qrencode -t ANSI "http://${SERVER_IP}"
fi
echo ""
echo -e "${YELLOW}💡 提示：${NC}"
echo "  1. 确保防火墙已开放端口 80: sudo ufw allow 80/tcp"
echo "  2. 建议配置 SSL 证书以启用 HTTPS"
echo "  3. 查看访问日志: sudo tail -f /var/log/nginx/wechat_mock_access.log"
echo "  4. 查看错误日志: sudo tail -f /var/log/nginx/wechat_mock_error.log"

