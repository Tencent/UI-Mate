# XeChat Mock 快速部署指南

## 🚀 一键部署

你的服务器 IP: **172.27.130.158**

### 立即部署

```bash
cd /home/wangbowen/OSWorld-RL/WebGen-Agent/workspaces_root/wechat_mock
./deploy.sh
```

部署完成后，访问：**http://172.27.130.158**

---

## 📋 分步说明

### 1. 确保 Nginx 已安装

```bash
# 检查 Nginx 是否安装
nginx -v

# 如果未安装
sudo apt-get update
sudo apt-get install -y nginx
```

### 2. 运行部署脚本

```bash
cd /home/wangbowen/OSWorld-RL/WebGen-Agent/workspaces_root/wechat_mock
./deploy.sh
```

脚本会自动：
- ✅ 安装 npm 依赖
- ✅ 构建生产版本
- ✅ 部署到 `/var/www/wechat_mock`
- ✅ 配置 Nginx（已设置为监听 172.27.130.158）
- ✅ 重启 Nginx 服务

### 3. 开放防火墙端口（如果启用了防火墙）

```bash
# 检查防火墙状态
sudo ufw status

# 如果防火墙已启用，开放端口
sudo ufw allow 80/tcp
```

### 4. 访问应用

打开浏览器访问：
- **http://172.27.130.158**
- **http://localhost** (本地)

---

## 🔍 验证部署

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 检查文件是否部署
ls -la /var/www/wechat_mock/

# 检查端口是否监听
sudo netstat -tulpn | grep :80

# 实时查看访问日志
sudo tail -f /var/log/nginx/wechat_mock_access.log
```

---

## ❓ 常见问题

### 无法访问？

1. **检查 Nginx 是否运行**
   ```bash
   sudo systemctl status nginx
   sudo systemctl start nginx
   ```

2. **检查防火墙**
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   ```

3. **检查端口占用**
   ```bash
   sudo lsof -i :80
   ```

4. **查看错误日志**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### 页面显示 403 Forbidden？

```bash
# 修复权限
sudo chown -R www-data:www-data /var/www/wechat_mock
sudo chmod -R 755 /var/www/wechat_mock
```

### 端口 80 被占用？

```bash
# 查看占用进程
sudo lsof -i :80

# 如果是 Apache，停止它
sudo systemctl stop apache2
sudo systemctl disable apache2
```

---

## 🔄 更新应用

当代码更新后：

```bash
cd /home/wangbowen/OSWorld-RL/WebGen-Agent/workspaces_root/wechat_mock
./deploy.sh
```

---

## 📱 手机访问

1. 确保手机和服务器在同一网络
2. 在手机浏览器输入：**http://172.27.130.158**

或者生成二维码：
```bash
# 安装二维码工具
sudo apt-get install qrencode

# 生成二维码
qrencode -t UTF8 "http://172.27.130.158"
```

---

## 🛑 停止/卸载

```bash
# 停止 Nginx
sudo systemctl stop nginx

# 删除配置
sudo rm /etc/nginx/sites-enabled/wechat_mock
sudo rm /etc/nginx/sites-available/wechat_mock

# 删除文件
sudo rm -rf /var/www/wechat_mock

# 重启 Nginx
sudo systemctl start nginx
```

---

## 📞 需要帮助？

查看详细文档：`DEPLOYMENT.md`

或检查日志：
```bash
sudo tail -f /var/log/nginx/wechat_mock_access.log
sudo tail -f /var/log/nginx/wechat_mock_error.log
```


