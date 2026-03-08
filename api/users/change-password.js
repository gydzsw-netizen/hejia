import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { requireAuth, withErrorHandling } from '../../lib/middleware.js';

const BCRYPT_ROUNDS = 12;

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  const user = await requireAuth(req);

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new Error('当前密码和新密码不能为空');
  }

  if (newPassword.length < 8) {
    throw new Error('新密码长度至少为8个字符');
  }

  // 获取用户当前密码哈希
  const userResult = await sql`
    SELECT password_hash FROM users WHERE id = ${user.id}
  `;

  if (userResult.rows.length === 0) {
    throw new Error('用户不存在');
  }

  // 验证当前密码
  const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
  if (!isValid) {
    throw new Error('当前密码不正确');
  }

  // 加密新密码
  const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  // 更新密码
  await sql`
    UPDATE users
    SET password_hash = ${newPasswordHash}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${user.id}
  `;

  return res.status(200).json({
    success: true,
    message: '密码修改成功'
  });
}

export default withErrorHandling(handler);
