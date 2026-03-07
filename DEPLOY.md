# 销售价格核算系统 - 部署指南

## 项目概述

企业级销售价格计算器，支持用户认证、权限管理和个性化配置。

## 技术栈

- **前端**: 原生HTML/JS/CSS
- **后端**: Vercel Serverless Functions
- **数据库**: Vercel Postgres
- **认证**: JWT + bcrypt

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，设置以下变量：

```env
# JWT密钥 - 使用强随机字符串
JWT_SECRET=your-256-bit-secret-key-here

# Vercel Postgres连接信息（在Vercel创建数据库后自动提供）
POSTGRES_URL=your-postgres-url
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 部署到Vercel

### 步骤1: 准备Vercel账号

1. 访问 https://vercel.com 注册账号
2. 安装Vercel CLI（可选）：`npm i -g vercel`

### 步骤2: 创建Postgres数据库

1. 在Vercel控制台，进入你的项目
2. 点击 "Storage" → "Create Database"
3. 选择 "Postgres"
4. 创建数据库后，Vercel会自动设置环境变量

### 步骤3: 初始化数据库

1. 在Vercel控制台，进入 "Storage" → 你的数据库
2. 点击 "Query" 标签
3. 复制 `sql/schema.sql` 的内容并执行
4. 复制 `sql/create-admin.sql` 的内容并执行

### 步骤4: 配置环境变量

在Vercel项目设置中添加：

```
JWT_SECRET=<生成一个256位随机字符串>
```

生成JWT_SECRET的方法：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤5: 部署项目

**方法A: 通过GitHub（推荐）**

1. 将代码推送到GitHub仓库
2. 在Vercel控制台，点击 "Import Project"
3. 选择你的GitHub仓库
4. Vercel会自动检测配置并部署

**方法B: 通过Vercel CLI**

```bash
vercel deploy --prod
```

### 步骤6: 配置自定义域名

1. 在Vercel项目设置中，进入 "Domains"
2. 添加域名：`www.mygydzsw.com`
3. 按照提示配置DNS记录

在Cloudflare中更新DNS：
```
类型: CNAME
名称: www
目标: cname.vercel-dns.com
代理状态: DNS only（灰色云朵）
```

## 初始登录

部署完成后：

1. 访问你的域名：https://www.mygydzsw.com
2. 使用默认管理员账户登录：
   - 用户名：`admin`
   - 密码：`Admin@123456`
3. **重要**：首次登录后立即修改密码！

## 用户管理

### 创建新用户

1. 使用管理员账户登录
2. 点击"用户管理"
3. 点击"创建新用户"
4. 填写用户名、密码和角色
5. 将用户名和初始密码提供给员工

### 重置用户密码

1. 进入"用户管理"页面
2. 找到需要重置密码的用户
3. 点击"重置密码"
4. 设置新密码并告知用户

## 项目结构

```
price-calculator/
├── public/              # 前端文件
│   ├── index.html       # 登录页面
│   ├── calculator.html  # 计算器页面
│   ├── admin.html       # 管理员页面
│   ├── css/
│   │   └── styles.css   # 样式文件
│   └── js/
│       ├── auth.js      # 认证模块
│       ├── calculator.js # 计算器逻辑
│       └── admin.js     # 管理员功能
├── api/                 # 后端API
│   ├── auth/           # 认证相关API
│   ├── users/          # 用户管理API
│   └── settings/       # 设置管理API
├── lib/                # 共享库
│   ├── db.js           # 数据库连接
│   ├── auth.js         # JWT工具
│   └── middleware.js   # 认证中间件
└── sql/                # 数据库脚本
    ├── schema.sql      # 数据库schema
    └── create-admin.sql # 创建管理员账户
```

## 安全注意事项

1. **JWT密钥**：使用强随机字符串，永不泄露
2. **密码策略**：要求至少8个字符
3. **HTTPS**：Vercel自动提供，确保启用
4. **定期备份**：定期导出数据库数据
5. **监控日志**：定期检查Vercel日志

## 常见问题

### Q: 如何修改默认配置？

A: 管理员可以在"运算规则设置"中修改，每个用户的配置独立保存。

### Q: 忘记管理员密码怎么办？

A: 在Vercel数据库控制台执行以下SQL重置密码为 `Admin@123456`：

```sql
UPDATE users
SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWIvJ5FO'
WHERE username = 'admin';
```

### Q: 如何备份数据？

A: 在Vercel数据库控制台，使用 "Export" 功能导出数据。

### Q: 如何更新代码？

A: 推送代码到GitHub，Vercel会自动重新部署。

## 技术支持

如有问题，请查看：
- Vercel文档：https://vercel.com/docs
- Vercel Postgres文档：https://vercel.com/docs/storage/vercel-postgres

## 许可证

本项目供内部使用。
