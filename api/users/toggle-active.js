import { sql } from '@vercel/postgres';
import { requireAdmin, withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  await requireAdmin(req);

  const { userId, isActive } = req.body;

  if (!userId || typeof isActive !== 'boolean') {
    throw new Error('用户ID和状态不能为空');
  }

  // 检查用户是否存在
  const userCheck = await sql`
    SELECT id, username FROM users WHERE id = ${userId}
  `;

  if (userCheck.rows.length === 0) {
    throw new Error('用户不存在');
  }

  const user = userCheck.rows[0];

  // 保护GGYDZ和GYDZ用户，禁止停用
  if (user.username === 'GGYDZ' || user.username === 'GYDZ') {
    throw new Error('不能停用管理员账户');
  }

  // 更新用户状态
  await sql`
    UPDATE users
    SET is_active = ${isActive},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${userId}
  `;

  return res.status(200).json({
    success: true,
    message: isActive ? '用户已启用' : '用户已停用'
  });
}

export default withErrorHandling(handler);
