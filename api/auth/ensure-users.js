import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { withErrorHandling } from '../../lib/middleware.js';

const BCRYPT_ROUNDS = 12;

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  const results = [];

  // 检查并创建 GYDZ 用户
  const gydz = await sql`
    SELECT id FROM users WHERE username = 'GYDZ'
  `;

  if (gydz.rows.length === 0) {
    const gydz_passwordHash = await bcrypt.hash('Hgyxiaoyu1314.', BCRYPT_ROUNDS);
    await sql`
      INSERT INTO users (username, password_hash, role, is_active)
      VALUES ('GYDZ', ${gydz_passwordHash}, 'admin', true)
    `;
    results.push('GYDZ 用户已创建');
  } else {
    results.push('GYDZ 用户已存在');
  }

  // 检查并创建 STAFF 用户
  const staff = await sql`
    SELECT id FROM users WHERE username = 'STAFF'
  `;

  if (staff.rows.length === 0) {
    const staff_passwordHash = await bcrypt.hash('Staff2024', BCRYPT_ROUNDS);
    await sql`
      INSERT INTO users (username, password_hash, role, is_active)
      VALUES ('STAFF', ${staff_passwordHash}, 'employee', true)
    `;
    results.push('STAFF 用户已创建');
  } else {
    results.push('STAFF 用户已存在');
  }

  return res.status(200).json({
    success: true,
    message: '默认用户检查完成',
    results
  });
}

export default withErrorHandling(handler);
