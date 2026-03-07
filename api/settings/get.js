import { sql } from '@vercel/postgres';
import { requireAuth, withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  const { user } = await requireAuth(req);

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

export default withErrorHandling(handler);
