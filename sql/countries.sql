-- 国家配置表
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    country_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    flag VARCHAR(10) NOT NULL,
    label VARCHAR(100) NOT NULL,
    weight_rate DECIMAL(10, 2) NOT NULL DEFAULT 10,
    volume_factor INTEGER NOT NULL DEFAULT 6000,
    volume_rate DECIMAL(10, 2) NOT NULL DEFAULT 8,
    fixed_cost DECIMAL(10, 2) NOT NULL DEFAULT 5,
    min_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    usd_rate DECIMAL(10, 4) NOT NULL DEFAULT 7.2,
    eur_rate DECIMAL(10, 4) NOT NULL DEFAULT 7.8,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_countries_country_id ON countries(country_id);

-- 插入默认的4个国家系统
INSERT INTO countries (country_id, name, flag, label, weight_rate, volume_factor, volume_rate, fixed_cost, min_price, usd_rate, eur_rate)
VALUES
    ('USA', 'TEMU美国核价系统', '🇺🇸', '美国', 10, 6000, 8, 5, 0, 7.2, 7.8),
    ('Germany', 'TEMU德国核价系统', '🇩🇪', '德国', 12, 5000, 9, 6, 0, 7.2, 7.8),
    ('France', 'TEMU法国核价系统', '🇫🇷', '法国', 11, 5500, 8.5, 5.5, 0, 7.2, 7.8),
    ('Poland', 'TEMU波兰核价系统', '🇵🇱', '波兰', 9, 6000, 7, 4, 0, 7.2, 7.8)
ON CONFLICT (country_id) DO NOTHING;
