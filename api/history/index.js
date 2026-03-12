import { sql } from '@vercel/postgres';
import { requireAuth, withErrorHandling } from '../../lib/middleware.js';

/**
 * 统一的历史记录 API
 * 合并所有历史记录相关操作到一个函数中
 */
async function handler(req, res) {
  const { action } = req.query;

  switch (action) {
    case 'list':
      return await listHistory(req, res);
    case 'save':
      return await saveHistory(req, res);
    case 'delete':
      return await deleteHistory(req, res);
    default:
      return res.status(400).json({ message: '无效的操作' });
  }
}

// 获取历史记录列表
async function listHistory(req, res) {
  const { user } = await requireAuth(req);

  const result = await sql`
    SELECT id, country, weight, cost, length, width, height,
           sale_price_cny, sale_price_usd, sale_price_eur,
           created_at
    FROM calculation_history
    WHERE user_id = ${user.userId}
    ORDER BY created_at DESC
    LIMIT 100
  `;

  return res.status(200).json({ history: result.rows });
}

// 保存历史记录
async function saveHistory(req, res) {
  const { user } = await requireAuth(req);

  const {
    country,
    weight,
    cost,
    length,
    width,
    height,
    salePriceCNY,
    salePriceUSD,
    salePriceEUR
  } = req.body || {};

  if (!country || !weight || !cost) {
    throw new Error('缺少必要参数');
  }

  const result = await sql`
    INSERT INTO calculation_history (
      user_id, country, weight, cost, length, width, height,
      sale_price_cny, sale_price_usd, sale_price_eur
    )
    VALUES (
      ${user.userId}, ${country}, ${weight}, ${cost},
      ${length || 0}, ${width || 0}, ${height || 0},
      ${salePriceCNY}, ${salePriceUSD}, ${salePriceEUR}
    )
    RETURNING id, created_at
  `;

  return res.status(201).json({
    success: true,
    record: result.rows[0]
  });
}

// 删除历史记录
async function deleteHistory(req, res) {
  const { user } = await requireAuth(req);

  const { recordId } = req.body || {};

  if (!recordId) {
    throw new Error('记录ID不能为空');
  }

  const result = await sql`
    DELETE FROM calculation_history
    WHERE id = ${recordId} AND user_id = ${user.userId}
    RETURNING id
  `;

  if (result.rows.length === 0) {
    throw new Error('记录不存在或无权删除');
  }

  return res.status(200).json({
    success: true,
    message: '记录已删除'
  });
}

export default withErrorHandling(handler);
