import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const BCRYPT_ROUNDS = 12;
const USER_COUNT = 20;

// 生成随机密码
function generatePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let password = '';
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

async function generateUsers() {
  const users = [];

  // 创建 GGYDZ 管理员账户
  const ggydz_password = 'Hgyxiaoyu1314.';
  const ggydz_passwordHash = await bcrypt.hash(ggydz_password, BCRYPT_ROUNDS);
  users.push({
    username: 'GGYDZ',
    password: ggydz_password,
    passwordHash: ggydz_passwordHash,
    role: 'admin',
    isAdmin: true
  });
  console.log('生成管理员: GGYDZ');

  // 创建 SSTAFF 普通用户账户
  const sstaff_password = 'Staff2024';
  const sstaff_passwordHash = await bcrypt.hash(sstaff_password, BCRYPT_ROUNDS);
  users.push({
    username: 'SSTAFF',
    password: sstaff_password,
    passwordHash: sstaff_passwordHash,
    role: 'user',
    isAdmin: false
  });
  console.log('生成普通用户: SSTAFF');

  // 创建 GGYDS01-GGYDS20 用户
  for (let i = 1; i <= USER_COUNT; i++) {
    const username = `GGYDS${String(i).padStart(2, '0')}`;
    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    users.push({
      username,
      password,
      passwordHash,
      role: 'user',
      isAdmin: false
    });

    console.log(`生成用户 ${i}/${USER_COUNT}: ${username}`);
  }

  return users;
}

// 生成SQL插入语句
function generateSQL(users) {
  let sql = '-- 批量创建管理员和普通用户\n';
  sql += '-- 管理员: GGYDZ\n';
  sql += '-- 参考用户: SSTAFF\n';
  sql += '-- 普通用户: GGYDS01 到 GGYDS20\n';
  sql += '-- 所有用户角色为"user"（普通用户），享有与SSTAFF账号相同的权限\n\n';

  users.forEach(user => {
    const roleLabel = user.isAdmin ? '管理员' : '普通用户';
    sql += `-- ${roleLabel}: ${user.username}, 密码: ${user.password}\n`;
    sql += `INSERT INTO users (username, password_hash, role, initial_password)\n`;
    sql += `VALUES ('${user.username}', '${user.passwordHash}', '${user.role}', '${user.password}')\n`;
    sql += `ON CONFLICT (username) DO UPDATE SET\n`;
    sql += `  password_hash = EXCLUDED.password_hash,\n`;
    sql += `  initial_password = EXCLUDED.initial_password,\n`;
    sql += `  updated_at = CURRENT_TIMESTAMP;\n\n`;
  });

  return sql;
}

// 生成用户列表文档
function generateUserList(users) {
  let doc = '# GGYDZ管理员的用户列表\n\n';
  doc += '创建时间: ' + new Date().toLocaleString('zh-CN') + '\n\n';

  doc += '## 管理员账户\n\n';
  doc += '| 用户名 | 密码 | 角色 |\n';
  doc += '|--------|------|------|\n';
  const admin = users.find(u => u.isAdmin);
  if (admin) {
    doc += `| ${admin.username} | ${admin.password} | 管理员 |\n`;
  }

  doc += '\n## 参考用户账户\n\n';
  doc += '| 用户名 | 密码 | 角色 | 说明 |\n';
  doc += '|--------|------|------|------|\n';
  const sstaff = users.find(u => u.username === 'SSTAFF');
  if (sstaff) {
    doc += `| ${sstaff.username} | ${sstaff.password} | 普通用户 | 所有普通用户享有与此账号相同的权限 |\n`;
  }

  doc += '\n## 普通用户账户\n\n';
  doc += '| 序号 | 用户名 | 密码 | 角色 |\n';
  doc += '|------|--------|------|------|\n';

  const regularUsers = users.filter(u => !u.isAdmin && u.username !== 'SSTAFF');
  regularUsers.forEach((user, index) => {
    doc += `| ${index + 1} | ${user.username} | ${user.password} | 普通用户 |\n`;
  });

  doc += '\n## 注意事项\n\n';
  doc += '1. 请妥善保管此文档，密码仅显示一次\n';
  doc += '2. 建议用户首次登录后立即修改密码\n';
  doc += '3. 所有普通用户角色为"user"，享有与SSTAFF账号相同的权限\n';
  doc += '4. 管理员GGYDZ有权限：\n';
  doc += '   - 查看所有用户信息（包括初始密码）\n';
  doc += '   - 停用/启用普通用户账号\n';
  doc += '   - 修改普通用户的密码\n';
  doc += '   - 删除普通用户账号\n';

  return doc;
}

// 主函数
async function main() {
  console.log('开始生成管理员和用户...\n');

  const users = await generateUsers();

  console.log('\n生成SQL脚本...');
  const sql = generateSQL(users);

  console.log('生成用户列表文档...');
  const userList = generateUserList(users);

  // 输出到文件
  const fs = await import('fs');
  fs.writeFileSync('sql/create-ggyds-users.sql', sql);
  fs.writeFileSync('GGYDS用户列表.md', userList);

  console.log('\n✓ 完成！');
  console.log('- SQL脚本: sql/create-ggyds-users.sql');
  console.log('- 用户列表: GGYDS用户列表.md');
  console.log('\n请执行SQL脚本将用户导入数据库。');
}

main().catch(console.error);
