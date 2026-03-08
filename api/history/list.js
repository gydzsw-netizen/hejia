import { sql } from '@vercel/postgres';
import { requireAuth, withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  const { user } = await requireAuth(req);
  const { limit = 50, offset = 0, search = '' } = req.query;

  let query;
  if (search) {
    query = sql`
      SELECT * FROM calculation_history
      WHERE user_id = ${user.userId}
      AND (product_name ILIKE ${`%${search}%`})
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit)}
      OFFSET ${parseInt(offset)}
    `;
  } else {
    query = sql`
      SELECT * FROM calculation_history
      WHERE user_id = ${user.userId}
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit)}
      OFFSET ${parseInt(offset)}
    `;
  }

  const result = await query;

  const countResult = await sql`
    SELECT COUNT(*) as total
    FROM calculation_history
    WHERE user_id = ${user.userId}
  `;

  return res.status(200).json({
    success: true,
    history: result.rows,
    total: parseInt(countResult.rows[0].total),
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
}

export default withErrorHandling(handler);
