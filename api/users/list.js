import { sql } from '@vercel/postgres';
import { requireAdmin, withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  await requireAdmin(req);

  // 获取所有用户（包含初始密码，不包含密码hash）
  const result = await sql`
    SELECT
      id,
      username,
      role,
      created_at,
      last_login,
      is_active,
      initial_password
    FROM users
    ORDER BY created_at DESC
  `;

  return res.status(200).json({
    users: result.rows
  });
}

export default withErrorHandling(handler);
