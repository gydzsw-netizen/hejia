import bcrypt from 'bcrypt';
import { readFileSync } from 'fs';

// 手动加载环境变量
const envContent = readFileSync('.env.local', 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    value = value.replace(/\\n/g, '').replace(/\n/g, '').replace(/\r/g, '');
    process.env[match[1].trim()] = value;
  }
});

// 动态导入
const { sql } = await import('@vercel/postgres');

async function updateGYDZPassword() {
  try {
    console.log('更新GYDZ用户密码...\n');

    // 设置密码
    const password = 'Hgyxiaoyu1314.';
    const passwordHash = await bcrypt.hash(password, 12);

    // 更新密码
    const result = await sql`
      UPDATE users
      SET password_hash = ${passwordHash},
          initial_password = ${password},
          updated_at = CURRENT_TIMESTAMP
      WHERE username = 'GYDZ'
      RETURNING id, username, role, is_active
    `;

    if (result.rows.length === 0) {
      console.log('⚠️  GYDZ用户不存在');
    } else {
      console.log('✓ GYDZ用户密码更新成功！\n');
      console.log('用户信息:');
      console.log(`  用户名: ${result.rows[0].username}`);
      console.log(`  角色: ${result.rows[0].role}`);
      console.log(`  密码: ${password}`);
      console.log(`  状态: ${result.rows[0].is_active ? '已激活' : '已停用'}`);
    }

    console.log('\n完成！');
    process.exit(0);
  } catch (error) {
    console.error('\n更新失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

updateGYDZPassword();
