import { sql } from '@vercel/postgres';
import { withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  // 获取所有国家配置
  const result = await sql`
    SELECT
      country_id,
      name,
      flag,
      label,
      weight_rate,
      volume_factor,
      volume_rate,
      fixed_cost,
      min_price,
      usd_rate,
      eur_rate
    FROM countries
    ORDER BY created_at ASC
  `;

  // 转换为前端需要的格式
  const countries = {};
  result.rows.forEach(row => {
    countries[row.country_id] = {
      name: row.name,
      flag: row.flag,
      label: row.label,
      weightRate: parseFloat(row.weight_rate),
      volumeFactor: parseInt(row.volume_factor),
      volumeRate: parseFloat(row.volume_rate),
      fixedCost: parseFloat(row.fixed_cost),
      minPrice: parseFloat(row.min_price),
      usdRate: parseFloat(row.usd_rate),
      eurRate: parseFloat(row.eur_rate)
    };
  });

  return res.status(200).json({ countries });
}

export default withErrorHandling(handler);
