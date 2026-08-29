# XeChat Mock 部署指南

本指南将帮助你将 XeChat Mock 项目部署到 Nginx 服务器，使其可通过外网访问。

## 📋 前置要求

### 1. 服务器环境
- Ubuntu/Debian 或其他 Linux 发行版
- 具有 sudo 权限的用户账户
- 开放的端口 80 (HTTP) 和 443 (HTTPS，可选)

### 2. 安装必要软件

```bash
# 更新系统包
sudo apt-get update

# 安装 Node.js (建议使用 Node 16+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Nginx
sudo apt-get install -y nginx

# 验证安装
node --version
npm --version
nginx -v
```

## 🚀 快速部署（推荐）

### 方法一：使用自动化脚本

```bash
# 1. 进入项目目录
cd /home/wangbowen/OSWorld-RL/WebGen-Agent/workspaces_root/wechat_mock

# 2. 运行部署脚本
./deploy.sh
```

脚本会自动完成：
- ✅ 安装项目依赖
- ✅ 构建生产版本
- ✅ 部署到 Nginx 目录
- ✅ 配置 Nginx
- ✅ 重启 Nginx 服务

## 🛠️ 手动部署步骤

如果自动化脚本遇到问题，可以按照以下步骤手动部署：

### 步骤 1: 构建项目

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

构建完成后，会在 `dist` 目录下生成生产文件。

### 步骤 2: 部署文件到 Nginx

```bash
# 创建部署目录
sudo mkdir -p /var/www/wechat_mock

# 复制构建文件
sudo cp -r dist/* /var/www/wechat_mock/

# 设置正确的权限
sudo chown -R www-data:www-data /var/www/wechat_mock
sudo chmod -R 755 /var/www/wechat_mock
```

### 步骤 3: 配置 Nginx

```bash
# 复制 Nginx 配置文件
sudo cp nginx.conf /etc/nginx/sites-available/wechat_mock

# 创建软链接启用站点
sudo ln -s /etc/nginx/sites-available/wechat_mock /etc/nginx/sites-enabled/

# 如果需要，修改配置文件中的域名
sudo nano /etc/nginx/sites-available/wechat_mock
# 将 server_name your-domain.com; 改为你的域名或服务器 IP

# 测试 Nginx 配置
sudo nginx -t

# 重启 Nginx
sudo systemctl reload nginx
```

### 步骤 4: 配置防火墙（如果启用）

```bash
# 允许 HTTP 和 HTTPS 流量
sudo ufw allow 'Nginx Full'

# 或者单独允许
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 查看状态
sudo ufw status
```

## 🌐 访问应用

部署完成后，你可以通过以下方式访问：

- **本地访问**: `http://localhost`
- **服务器 IP**: `http://your-server-ip`
- **域名访问**: `http://your-domain.com`（需要配置域名解析）

## 🔒 配置 HTTPS（推荐）

### 使用 Let's Encrypt 免费 SSL 证书

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取并安装证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

Certbot 会自动修改 Nginx 配置，添加 SSL 支持并设置自动续期。

### 手动配置 SSL（如果有自己的证书）

1. 将证书文件放置到服务器：
   ```bash
   sudo mkdir -p /etc/nginx/ssl
   sudo cp your-domain.crt /etc/nginx/ssl/
   sudo cp your-domain.key /etc/nginx/ssl/
   ```

2. 取消注释 `nginx.conf` 中的 HTTPS 配置部分

3. 重启 Nginx：
   ```bash
   sudo systemctl reload nginx
   ```

## 🔧 常见问题排查

### 1. 端口被占用

```bash
# 查看 80 端口占用情况
sudo lsof -i :80

# 停止占用端口的进程
sudo systemctl stop apache2  # 如果是 Apache
```

### 2. Nginx 配置测试失败

```bash
# 查看详细错误信息
sudo nginx -t

# 检查配置文件语法
sudo nginx -T
```

### 3. 页面 404 错误

```bash
# 检查文件是否存在
ls -la /var/www/wechat_mock

# 检查文件权限
sudo chown -R www-data:www-data /var/www/wechat_mock
```

### 4. 查看日志

```bash
# 访问日志
sudo tail -f /var/log/nginx/wechat_mock_access.log

# 错误日志
sudo tail -f /var/log/nginx/wechat_mock_error.log

# Nginx 主错误日志
sudo tail -f /var/log/nginx/error.log
```

### 5. SPA 路由刷新 404

确保 Nginx 配置中包含以下内容：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 🔄 更新部署

当代码更新后，重新部署：

```bash
# 拉取最新代码（如果使用 Git）
git pull

# 重新运行部署脚本
./deploy.sh

# 或手动构建和复制
npm run build
sudo cp -r dist/* /var/www/wechat_mock/
sudo systemctl reload nginx
```

## 📊 性能优化建议

1. **启用 Gzip 压缩**（已在配置中启用）
2. **配置缓存策略**（已在配置中设置）
3. **使用 CDN** 加速静态资源
4. **配置 HTTP/2**（需要 HTTPS）
5. **优化构建大小**：
   ```bash
   # 分析构建大小
   npm run build -- --mode production
   ```

## 🌍 配置域名解析

如果使用域名访问，需要在 DNS 服务商处添加 A 记录：

```
类型    主机记录    记录值
A       @          your-server-ip
A       www        your-server-ip
```

## 📝 多项目部署

如果要部署多个前端项目（如 slack_mock, youtube_mock 等）：

### 方法 1: 使用不同域名/子域名

```nginx
# xechat.yourdomain.com
server {
    listen 80;
    server_name xechat.yourdomain.com;
    root /var/www/wechat_mock;
    ...
}

# slack.yourdomain.com
server {
    listen 80;
    server_name slack.yourdomain.com;
    root /var/www/slack_mock;
    ...
}
```

### 方法 2: 使用不同路径

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location /wechat {
        alias /var/www/wechat_mock;
        try_files $uri $uri/ /wechat/index.html;
    }
    
    location /slack {
        alias /var/www/slack_mock;
        try_files $uri $uri/ /slack/index.html;
    }
}
```

### 方法 3: 使用不同端口

```nginx
# XeChat Mock - 端口 8001
server {
    listen 8001;
    root /var/www/wechat_mock;
    ...
}

# Slack Mock - 端口 8002
server {
    listen 8002;
    root /var/www/slack_mock;
    ...
}
```

记得开放相应端口：
```bash
sudo ufw allow 8001/tcp
sudo ufw allow 8002/tcp
```

## 🔐 安全建议

1. **定期更新系统和软件包**
   ```bash
   sudo apt-get update && sudo apt-get upgrade
   ```

2. **配置防火墙**
   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   ```

3. **隐藏 Nginx 版本信息**
   在 `/etc/nginx/nginx.conf` 中添加：
   ```nginx
   http {
       server_tokens off;
   }
   ```

4. **限制请求速率**（防止 DDoS）
   ```nginx
   limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;
   ```

5. **配置 HTTPS**（强烈推荐）

## 📞 技术支持

如遇问题，请检查：
- Nginx 错误日志
- 浏览器控制台错误
- 网络连接状态
- 防火墙配置

---

**祝部署顺利！** 🎉


