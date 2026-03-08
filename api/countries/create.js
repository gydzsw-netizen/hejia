import { sql } from '@vercel/postgres';
import { requireAdmin, withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  await requireAdmin(req);

  const { countryId, name, flag, label, weightRate, volumeFactor, volumeRate, fixedCost, minPrice, usdRate, eurRate } = req.body;

  if (!countryId || !name || !flag || !label) {
    throw new Error('国家ID、名称、国旗和标签不能为空');
  }

  // 检查国家ID是否已存在
  const existing = await sql`
    SELECT country_id FROM countries WHERE country_id = ${countryId}
  `;

  if (existing.rows.length > 0) {
    throw new Error('国家ID已存在');
  }

  // 创建国家配置
  await sql`
    INSERT INTO countries (
      country_id, name, flag, label,
      weight_rate, volume_factor, volume_rate,
      fixed_cost, min_price, usd_rate, eur_rate
    )
    VALUES (
      ${countryId}, ${name}, ${flag}, ${label},
      ${weightRate || 10}, ${volumeFactor || 6000}, ${volumeRate || 8},
      ${fixedCost || 5}, ${minPrice || 0}, ${usdRate || 7.2}, ${eurRate || 7.8}
    )
  `;

  return res.status(201).json({
    success: true,
    message: '国家配置创建成功'
  });
}

export default withErrorHandling(handler);
