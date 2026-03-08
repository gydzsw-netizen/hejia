-- 价格计算历史记录表
-- 创建时间: 2026-03-08

-- 历史记录表
CREATE TABLE IF NOT EXISTS calculation_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_name VARCHAR(255),
  weight DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  length DECIMAL(10,2),
  width DECIMAL(10,2),
  height DECIMAL(10,2),
  calculated_price_cny DECIMAL(10,2) NOT NULL,
  calculated_price_usd DECIMAL(10,2) NOT NULL,
  calculated_price_eur DECIMAL(10,2) NOT NULL,
  weight_shipping DECIMAL(10,2),
  volume_shipping DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  settings_snapshot JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_history_user_id ON calculation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON calculation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_product_name ON calculation_history(product_name);
