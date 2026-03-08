import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { withErrorHandling } from '../../lib/middleware.js';

const BCRYPT_ROUNDS = 12;

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  // 检查数据库中是否已有用户
  const existingUsers = await sql`
    SELECT COUNT(*) as count FROM users
  `;

  if (existingUsers.rows[0].count > 0) {
    throw new Error('数据库已初始化，不能重复初始化');
  }

  // 创建初始管理员用户 GYDZ
  const passwordHash = await bcrypt.hash('Hgyxiaoyu1314.', BCRYPT_ROUNDS);

  await sql`
    INSERT INTO users (username, password_hash, role, is_active)
    VALUES ('GYDZ', ${passwordHash}, 'admin', true)
  `;

  return res.status(200).json({
    success: true,
    message: '系统初始化成功，已创建管理员账户 GYDZ'
  });
}

export default withErrorHandling(handler);
