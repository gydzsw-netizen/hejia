-- 创建初始管理员账户
-- 注意：此脚本应该在数据库创建后立即运行一次

-- 默认管理员账户
-- 用户名: admin
-- 密码: Admin@123456
-- 密码的bcrypt hash (cost factor 12)

INSERT INTO users (username, password_hash, role)
VALUES (
  'admin',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWIvJ5FO',
  'admin'
)
ON CONFLICT (username) DO NOTHING;

-- 说明：
-- 1. 上面的密码hash对应的明文密码是: Admin@123456
-- 2. 首次登录后，请立即修改管理员密码
-- 3. 如果需要使用其他密码，请使用bcrypt生成新的hash

-- 生成bcrypt hash的Node.js代码示例：
-- const bcrypt = require('bcrypt');
-- const password = 'your-password-here';
-- const hash = await bcrypt.hash(password, 12);
-- console.log(hash);
