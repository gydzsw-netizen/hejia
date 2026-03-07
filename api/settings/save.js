import { sql } from '@vercel/postgres';
import { requireAuth, withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  const { user } = await requireAuth(req);
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
    'eur_rate'
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

export default withErrorHandling(handler);
