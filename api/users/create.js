import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { requireAdmin, withErrorHandling } from '../../lib/middleware.js';

const BCRYPT_ROUNDS = 12;

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  await requireAdmin(req);

  const { username, password, role = 'user' } = req.body;

  if (!username || !password) {
    throw new Error('用户名和密码不能为空');
  }

  if (password.length < 8) {
    throw new Error('密码长度至少为8个字符');
  }

  if (!['user', 'admin'].includes(role)) {
    throw new Error('无效的角色');
  }

  // 检查用户名是否已存在
  const existing = await sql`
    SELECT id FROM users WHERE username = ${username}
  `;

  if (existing.rows.length > 0) {
    throw new Error('用户名已存在');
  }

  // 加密密码
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // 创建用户
  const result = await sql`
    INSERT INTO users (username, password_hash, role, initial_password)
    VALUES (${username}, ${passwordHash}, ${role}, ${password})
    RETURNING id, username, role, created_at, is_active, initial_password
  `;

  return res.status(201).json({
    user: result.rows[0]
  });
}

export default withErrorHandling(handler);
