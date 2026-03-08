-- 销售价格核算系统数据库Schema
-- 创建时间: 2026-03-07

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- 用户设置表（每个用户独立的计算器配置）
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  profit_rate DECIMAL(5,2) DEFAULT 30.00,
  weight_rate DECIMAL(10,2) DEFAULT 10.00,
  volume_factor INTEGER DEFAULT 6000,
  volume_rate DECIMAL(10,2) DEFAULT 8.00,
  fixed_cost DECIMAL(10,2) DEFAULT 5.00,
  min_price DECIMAL(10,2) DEFAULT 0.00,
  usd_rate DECIMAL(10,2) DEFAULT 7.20,
  eur_rate DECIMAL(10,2) DEFAULT 7.80,
  activity_rate DECIMAL(5,2) DEFAULT 0.00,
  ad_rate DECIMAL(5,2) DEFAULT 0.00,
  refund_rate DECIMAL(5,2) DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Token黑名单表（用于登出功能）
CREATE TABLE IF NOT EXISTS token_blacklist (
  id SERIAL PRIMARY KEY,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_hash ON token_blacklist(token_hash);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires ON token_blacklist(expires_at);

-- 创建初始管理员账户的辅助脚本
-- 注意：密码需要使用bcrypt加密后插入
-- 示例：密码 "admin123" 的bcrypt hash (cost factor 12)
-- 在生产环境中，请使用强密码并通过安全方式创建管理员账户

-- 清理过期的token黑名单记录的函数
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM token_blacklist WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 更新用户updated_at时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为users表添加触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为user_settings表添加触发器
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建用户时自动创建默认设置的触发器函数
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为users表添加触发器（创建用户时自动创建默认设置）
DROP TRIGGER IF EXISTS create_user_settings_on_user_create ON users;
CREATE TRIGGER create_user_settings_on_user_create
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();
