# API 函数优化说明

## 问题
Vercel Hobby 计划限制最多 12 个 Serverless Functions，但项目有 15 个函数。

## 解决方案
将相关的 API 函数合并为统一的入口，通过 query 参数区分操作。

## 合并后的 API 结构

### 1. 用户管理 API
**文件**: `api/users/index.js`

**原来的 8 个函数** → **合并为 1 个**
- `/api/users?action=list` - 获取用户列表
- `/api/users?action=create` - 创建用户
- `/api/users?action=delete` - 删除用户
- `/api/users?action=toggle-active` - 切换激活状态
- `/api/users?action=update-username` - 更新用户名
- `/api/users?action=change-password` - 修改密码（用户自己）
- `/api/users?action=admin-change-password` - 管理员修改密码
- `/api/users?action=reset-password` - 重置密码

### 2. 历史记录 API
**文件**: `api/history/index.js`

**原来的 3 个函数** → **合并为 1 个**
- `/api/history?action=list` - 获取历史记录
- `/api/history?action=save` - 保存历史记录
- `/api/history?action=delete` - 删除历史记录

### 3. 保持独立的 API
- `api/auth/login.js` - 登录
- `api/auth/logout.js` - 登出
- `api/auth/verify.js` - 验证
- `api/settings/index.js` - 设置

## 函数数量对比

**优化前**: 15 个函数
- 认证相关: 3 个
- 用户管理: 8 个
- 历史记录: 3 个
- 设置: 1 个

**优化后**: 6 个函数 ✅
- 认证相关: 3 个
- 用户管理: 1 个（合并）
- 历史记录: 1 个（合并）
- 设置: 1 个

**节省**: 9 个函数，远低于 12 个限制

## 需要删除的旧文件

```bash
# 用户管理相关（8 个）
api/users/admin-change-password.js
api/users/change-password.js
api/users/create.js
api/users/delete.js
api/users/list.js
api/users/reset-password.js
api/users/toggle-active.js
api/users/update-username.js

# 历史记录相关（3 个）
api/history/delete.js
api/history/list.js
api/history/save.js
```

## 前端代码需要更新的文件

### 1. `public/js/admin.js`
需要更新所有用户管理相关的 API 调用，添加 `?action=xxx` 参数。

### 2. `public/js/history.js`（如果存在）
需要更新所有历史记录相关的 API 调用，添加 `?action=xxx` 参数。

## 部署步骤

1. 删除旧的 API 文件
2. 更新前端代码
3. 提交并推送到 GitHub
4. Vercel 自动部署

## 优点

- ✅ 符合 Vercel Hobby 计划限制
- ✅ 代码更加模块化和易维护
- ✅ 减少冷启动时间
- ✅ 统一的错误处理
- ✅ 更好的代码复用
