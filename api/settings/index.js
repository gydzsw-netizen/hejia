import { sql } from '@vercel/postgres';
import { requireAuth, withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  const { user } = await requireAuth(req);

  if (req.method === 'GET') {
    // 获取用户设置
    const result = await sql`
      SELECT
        profit_rate,
        weight_rate,
        volume_factor,
        volume_rate,
        fixed_cost,
        min_price,
        usd_rate,
        eur_rate
      FROM user_settings
      WHERE user_id = ${user.userId}
    `;

    if (result.rows.length === 0) {
      // 如果没有设置，返回默认值
      return res.status(200).json({
        settings: {
          profit_rate: 30.00,
          weight_rate: 10.00,
          volume_factor: 6000,
          volume_rate: 8.00,
          fixed_cost: 5.00,
          min_price: 0.00,
          usd_rate: 7.20,
          eur_rate: 7.80
        }
      });
    }

    return res.status(200).json({
      settings: result.rows[0]
    });
  }

  if (req.method === 'POST') {
    // 保存用户设置
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      throw new Error('无效的设置数据');
    }

    // 构建更新字段
    const updates = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'profit_rate',
      'weight_rate',
      'volume_factor',
      'volume_rate',
      'fixed_cost',
      'min_price',
      'usd_rate',
      'eur_rate',
      'activity_rate',
      'ad_rate',
      'refund_rate'
    ];

    for (const field of allowedFields) {
      if (settings[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(settings[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      throw new Error('没有要更新的设置');
    }

    // 添加user_id到values
    values.push(user.userId);

    // 更新设置
    const query = `
      UPDATE user_settings
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await sql.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('更新设置失败');
    }

    return res.status(200).json({
      success: true,
      settings: result.rows[0]
    });
  }

  return res.status(405).json({ message: '方法不允许' });
}

export default withErrorHandling(handler);
