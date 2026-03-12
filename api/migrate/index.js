import { sql } from '@vercel/postgres';
import { requireAuth, withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  // 只允许管理员执行迁移
  const { user } = await requireAuth(req);

  if (user.role !== 'admin') {
    return res.status(403).json({ message: '只有管理员可以执行数据库迁移' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    console.log('开始执行数据库迁移...');

    const migrations = [
      // 美国字段
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS us_profit_rate DECIMAL(5,2) DEFAULT 30.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS us_weight_rate DECIMAL(10,2) DEFAULT 10.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS us_volume_factor INTEGER DEFAULT 6000`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS us_volume_rate DECIMAL(10,2) DEFAULT 8.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS us_fixed_cost DECIMAL(10,2) DEFAULT 5.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS us_min_price DECIMAL(10,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS us_usd_rate DECIMAL(10,2) DEFAULT 7.20`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS us_eur_rate DECIMAL(10,2) DEFAULT 7.80`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS us_activity_rate DECIMAL(5,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS us_ad_rate DECIMAL(5,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS us_refund_rate DECIMAL(5,2) DEFAULT 0.00`,
      // 德国字段
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS de_profit_rate DECIMAL(5,2) DEFAULT 30.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS de_weight_rate DECIMAL(10,2) DEFAULT 10.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS de_volume_factor INTEGER DEFAULT 6000`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS de_volume_rate DECIMAL(10,2) DEFAULT 8.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS de_fixed_cost DECIMAL(10,2) DEFAULT 5.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS de_min_price DECIMAL(10,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS de_usd_rate DECIMAL(10,2) DEFAULT 7.20`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS de_eur_rate DECIMAL(10,2) DEFAULT 7.80`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS de_activity_rate DECIMAL(5,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS de_ad_rate DECIMAL(5,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS de_refund_rate DECIMAL(5,2) DEFAULT 0.00`,
      // 英国字段
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS gb_profit_rate DECIMAL(5,2) DEFAULT 30.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS gb_weight_rate DECIMAL(10,2) DEFAULT 10.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS gb_volume_factor INTEGER DEFAULT 6000`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS gb_volume_rate DECIMAL(10,2) DEFAULT 8.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS gb_fixed_cost DECIMAL(10,2) DEFAULT 5.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS gb_min_price DECIMAL(10,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS gb_usd_rate DECIMAL(10,2) DEFAULT 7.20`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS gb_eur_rate DECIMAL(10,2) DEFAULT 7.80`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS gb_activity_rate DECIMAL(5,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS gb_ad_rate DECIMAL(5,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS gb_refund_rate DECIMAL(5,2) DEFAULT 0.00`,
      // 法国字段
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS fr_profit_rate DECIMAL(5,2) DEFAULT 30.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS fr_weight_rate DECIMAL(10,2) DEFAULT 10.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS fr_volume_factor INTEGER DEFAULT 6000`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS fr_volume_rate DECIMAL(10,2) DEFAULT 8.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS fr_fixed_cost DECIMAL(10,2) DEFAULT 5.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS fr_min_price DECIMAL(10,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS fr_usd_rate DECIMAL(10,2) DEFAULT 7.20`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS fr_eur_rate DECIMAL(10,2) DEFAULT 7.80`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS fr_activity_rate DECIMAL(5,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS fr_ad_rate DECIMAL(5,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS fr_refund_rate DECIMAL(5,2) DEFAULT 0.00`,
      // 泛欧字段
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS eu_profit_rate DECIMAL(5,2) DEFAULT 30.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS eu_weight_rate DECIMAL(10,2) DEFAULT 10.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS eu_volume_factor INTEGER DEFAULT 6000`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS eu_volume_rate DECIMAL(10,2) DEFAULT 8.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS eu_fixed_cost DECIMAL(10,2) DEFAULT 5.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS eu_min_price DECIMAL(10,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS eu_usd_rate DECIMAL(10,2) DEFAULT 7.20`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS eu_eur_rate DECIMAL(10,2) DEFAULT 7.80`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS eu_activity_rate DECIMAL(5,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS eu_ad_rate DECIMAL(5,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS eu_refund_rate DECIMAL(5,2) DEFAULT 0.00`,
      // 通用字段
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS activity_rate DECIMAL(5,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS ad_rate DECIMAL(5,2) DEFAULT 0.00`,
      `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS refund_rate DECIMAL(5,2) DEFAULT 0.00`
    ];

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < migrations.length; i++) {
      try {
        await sql.query(migrations[i]);
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({ statement: i + 1, error: error.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: '数据库迁移完成',
      total: migrations.length,
      successCount,
      errorCount,
      errors
    });

  } catch (error) {
    console.error('迁移失败:', error);
    return res.status(500).json({
      success: false,
      message: '迁移失败',
      error: error.message
    });
  }
}

export default withErrorHandling(handler);

