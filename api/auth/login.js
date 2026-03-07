import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { generateToken } from '../../lib/auth.js';
import { withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    throw new Error('用户名和密码不能为空');
  }

  // 查询用户
  const result = await sql`
    SELECT id, username, password_hash, role, is_active
    FROM users
    WHERE username = ${username}
  `;

  if (result.rows.length === 0) {
    throw new Error('用户名或密码错误');
  }

  const user = result.rows[0];

  if (!user.is_active) {
    throw new Error('账户已被禁用');
  }

  // 验证密码
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error('用户名或密码错误');
  }

  // 更新最后登录时间
  await sql`
    UPDATE users
    SET last_login = CURRENT_TIMESTAMP
    WHERE id = ${user.id}
  `;

  // 生成token
  const token = generateToken(user);

  return res.status(200).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
}

export default withErrorHandling(handler);
