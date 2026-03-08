import { sql } from '@vercel/postgres';
import { requireAuth, withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: '方法不允许' });
  }

  const { user } = await requireAuth(req);
  const { id } = req.query;

  if (!id) {
    throw new Error('缺少历史记录ID');
  }

  const result = await sql`
    DELETE FROM calculation_history
    WHERE id = ${id} AND user_id = ${user.userId}
    RETURNING id
  `;

  if (result.rows.length === 0) {
    throw new Error('历史记录不存在或无权删除');
  }

  return res.status(200).json({
    success: true,
    message: '历史记录已删除'
  });
}

export default withErrorHandling(handler);
