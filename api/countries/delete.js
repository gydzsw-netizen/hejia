import { sql } from '@vercel/postgres';
import { requireAdmin, withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  await requireAdmin(req);

  const { countryId } = req.body;

  if (!countryId) {
    throw new Error('国家ID不能为空');
  }

  // 保护默认国家不被删除
  const defaultCountries = ['USA', 'Germany', 'France', 'Poland'];
  if (defaultCountries.includes(countryId)) {
    throw new Error('默认国家不能删除');
  }

  // 检查国家是否存在
  const existing = await sql`
    SELECT country_id FROM countries WHERE country_id = ${countryId}
  `;

  if (existing.rows.length === 0) {
    throw new Error('国家不存在');
  }

  // 删除国家配置
  await sql`
    DELETE FROM countries WHERE country_id = ${countryId}
  `;

  return res.status(200).json({
    success: true,
    message: '国家配置删除成功'
  });
}

export default withErrorHandling(handler);
