import { sql } from '@vercel/postgres';
import { requireAdmin, withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  await requireAdmin(req);

  const { userId, newUsername } = req.body;

  if (!userId || !newUsername) {
    throw new Error('用户ID和新用户名不能为空');
  }

  if (newUsername.length < 3 || newUsername.length > 50) {
    throw new Error('用户名长度必须在3-50个字符之间');
  }

  // 检查用户是否存在
  const userCheck = await sql`
    SELECT id, username FROM users WHERE id = ${userId}
  `;

  if (userCheck.rows.length === 0) {
    throw new Error('用户不存在');
  }

  const user = userCheck.rows[0];

  // 保护系统管理员用户名不被修改
  if (user.username === 'GGYDZ' || user.username === 'GYDZ') {
    throw new Error('不能修改系统管理员的用户名');
  }

  // 检查新用户名是否已被使用
  const existingUser = await sql`
    SELECT id FROM users WHERE username = ${newUsername} AND id != ${userId}
  `;

  if (existingUser.rows.length > 0) {
    throw new Error('该用户名已被使用');
  }

  // 更新用户名
  await sql`
    UPDATE users
    SET username = ${newUsername},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${userId}
  `;

  return res.status(200).json({
    success: true,
    message: '用户名修改成功'
  });
}

export default withErrorHandling(handler);
