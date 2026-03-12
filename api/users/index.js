import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { requireAuth, requireAdmin, withErrorHandling } from '../../lib/middleware.js';

/**
 * 统一的用户管理 API
 * 合并所有用户相关操作到一个函数中
 */
async function handler(req, res) {
  const { action } = req.query;

  switch (action) {
    case 'list':
      return await listUsers(req, res);
    case 'create':
      return await createUser(req, res);
    case 'delete':
      return await deleteUser(req, res);
    case 'toggle-active':
      return await toggleActive(req, res);
    case 'update-username':
      return await updateUsername(req, res);
    case 'change-password':
      return await changePassword(req, res);
    case 'admin-change-password':
      return await adminChangePassword(req, res);
    case 'reset-password':
      return await resetPassword(req, res);
    default:
      return res.status(400).json({ message: '无效的操作' });
  }
}

// 获取用户列表
async function listUsers(req, res) {
  await requireAdmin(req);

  const result = await sql`
    SELECT id, username, role, created_at, last_login, is_active
    FROM users
    ORDER BY created_at DESC
  `;

  return res.status(200).json({ users: result.rows });
}

// 创建用户
async function createUser(req, res) {
  await requireAdmin(req);

  const { username, password, role = 'user' } = req.body || {};

  if (!username || !password) {
    throw new Error('用户名和密码不能为空');
  }

  if (username.length < 3 || username.length > 50) {
    throw new Error('用户名长度必须在 3-50 个字符之间');
  }

  if (password.length < 6) {
    throw new Error('密码长度至少为 6 个字符');
  }

  if (!['user', 'admin'].includes(role)) {
    throw new Error('无效的角色');
  }

  const existingUser = await sql`
    SELECT id FROM users WHERE username = ${username}
  `;

  if (existingUser.rows.length > 0) {
    throw new Error('用户名已存在');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await sql`
    INSERT INTO users (username, password_hash, role)
    VALUES (${username}, ${passwordHash}, ${role})
    RETURNING id, username, role, created_at, is_active
  `;

  return res.status(201).json({
    success: true,
    user: result.rows[0]
  });
}

// 删除用户
async function deleteUser(req, res) {
  await requireAdmin(req);

  const { userId } = req.body || {};

  if (!userId) {
    throw new Error('用户ID不能为空');
  }

  const userResult = await sql`
    SELECT username FROM users WHERE id = ${userId}
  `;

  if (userResult.rows.length === 0) {
    throw new Error('用户不存在');
  }

  if (userResult.rows[0].username === 'admin') {
    throw new Error('不能删除管理员账户');
  }

  await sql`DELETE FROM users WHERE id = ${userId}`;

  return res.status(200).json({
    success: true,
    message: '用户已删除'
  });
}

// 切换用户激活状态
async function toggleActive(req, res) {
  await requireAdmin(req);

  const { userId } = req.body || {};

  if (!userId) {
    throw new Error('用户ID不能为空');
  }

  const result = await sql`
    UPDATE users
    SET is_active = NOT is_active
    WHERE id = ${userId}
    RETURNING id, username, is_active
  `;

  if (result.rows.length === 0) {
    throw new Error('用户不存在');
  }

  return res.status(200).json({
    success: true,
    user: result.rows[0]
  });
}

// 更新用户名
async function updateUsername(req, res) {
  await requireAdmin(req);

  const { userId, newUsername } = req.body || {};

  if (!userId || !newUsername) {
    throw new Error('用户ID和新用户名不能为空');
  }

  if (newUsername.length < 3 || newUsername.length > 50) {
    throw new Error('用户名长度必须在 3-50 个字符之间');
  }

  const existingUser = await sql`
    SELECT id FROM users WHERE username = ${newUsername} AND id != ${userId}
  `;

  if (existingUser.rows.length > 0) {
    throw new Error('用户名已存在');
  }

  const result = await sql`
    UPDATE users
    SET username = ${newUsername}
    WHERE id = ${userId}
    RETURNING id, username, role
  `;

  if (result.rows.length === 0) {
    throw new Error('用户不存在');
  }

  return res.status(200).json({
    success: true,
    user: result.rows[0]
  });
}

// 修改密码（用户自己）
async function changePassword(req, res) {
  const { user } = await requireAuth(req);

  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    throw new Error('当前密码和新密码不能为空');
  }

  if (newPassword.length < 6) {
    throw new Error('新密码长度至少为 6 个字符');
  }

  const userResult = await sql`
    SELECT password_hash FROM users WHERE id = ${user.userId}
  `;

  if (userResult.rows.length === 0) {
    throw new Error('用户不存在');
  }

  const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);

  if (!isValid) {
    throw new Error('当前密码不正确');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  await sql`
    UPDATE users
    SET password_hash = ${newPasswordHash}
    WHERE id = ${user.userId}
  `;

  return res.status(200).json({
    success: true,
    message: '密码已更新'
  });
}

// 管理员修改用户密码
async function adminChangePassword(req, res) {
  await requireAdmin(req);

  const { userId, newPassword } = req.body || {};

  if (!userId || !newPassword) {
    throw new Error('用户ID和新密码不能为空');
  }

  if (newPassword.length < 6) {
    throw new Error('新密码长度至少为 6 个字符');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  const result = await sql`
    UPDATE users
    SET password_hash = ${newPasswordHash}
    WHERE id = ${userId}
    RETURNING id, username
  `;

  if (result.rows.length === 0) {
    throw new Error('用户不存在');
  }

  return res.status(200).json({
    success: true,
    message: '密码已重置'
  });
}

// 重置密码
async function resetPassword(req, res) {
  await requireAdmin(req);

  const { userId } = req.body || {};

  if (!userId) {
    throw new Error('用户ID不能为空');
  }

  const defaultPassword = '123456';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  const result = await sql`
    UPDATE users
    SET password_hash = ${passwordHash}
    WHERE id = ${userId}
    RETURNING id, username
  `;

  if (result.rows.length === 0) {
    throw new Error('用户不存在');
  }

  return res.status(200).json({
    success: true,
    message: `密码已重置为: ${defaultPassword}`,
    defaultPassword
  });
}

export default withErrorHandling(handler);
