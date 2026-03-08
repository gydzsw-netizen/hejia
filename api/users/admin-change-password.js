import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { requireAdmin, withErrorHandling } from '../../lib/middleware.js';

const BCRYPT_ROUNDS = 12;

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  await requireAdmin(req);

  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    throw new Error('用户ID和新密码不能为空');
  }

  if (newPassword.length < 8) {
    throw new Error('新密码长度至少为8个字符');
  }

  // 检查用户是否存在
  const userCheck = await sql`
    SELECT id, username FROM users WHERE id = ${userId}
  `;

  if (userCheck.rows.length === 0) {
    throw new Error('用户不存在');
  }

  const user = userCheck.rows[0];

  // 保护GGYDZ和GYDZ用户，禁止修改密码
  if (user.username === 'GGYDZ' || user.username === 'GYDZ') {
    throw new Error('不能修改管理员密码');
  }

  // 加密新密码
  const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  // 更新密码，同时更新initial_password字段
  await sql`
    UPDATE users
    SET password_hash = ${newPasswordHash},
        initial_password = ${newPassword},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${userId}
  `;

  return res.status(200).json({
    success: true,
    message: '密码修改成功'
  });
}

export default withErrorHandling(handler);
