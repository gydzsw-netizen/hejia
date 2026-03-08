import { sql } from '@vercel/postgres';
import { requireAdmin, withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  await requireAdmin(req);

  const { userId } = req.body;

  if (!userId) {
    throw new Error('用户ID不能为空');
  }

  // 检查用户是否存在
  const userCheck = await sql`
    SELECT id, username FROM users WHERE id = ${userId}
  `;

  if (userCheck.rows.length === 0) {
    throw new Error('用户不存在');
  }

  const user = userCheck.rows[0];

  // 保护GYDZ用户，禁止删除
  if (user.username === 'GYDZ') {
    throw new Error('GYDZ是系统管理员，不能被删除');
  }

  // 删除用户
  await sql`
    DELETE FROM users WHERE id = ${userId}
  `;

  return res.status(200).json({
    success: true,
    message: '用户删除成功'
  });
}

export default withErrorHandling(handler);
