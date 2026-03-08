-- 添加初始密码字段到用户表
-- 用于在管理员界面显示用户的初始密码

ALTER TABLE users ADD COLUMN IF NOT EXISTS initial_password TEXT;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_users_initial_password ON users(initial_password) WHERE initial_password IS NOT NULL;

-- 说明：
-- 1. initial_password 字段用于保存用户的初始明文密码
-- 2. 仅在用户首次创建时设置，用于管理员查看和分发
-- 3. 用户首次登录后可以清除此字段以提高安全性
-- 4. 此字段为可选，现有用户不受影响
