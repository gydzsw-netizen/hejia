import { readFileSync } from 'fs';

// 手动加载环境变量（必须在导入@vercel/postgres之前）
const envContent = readFileSync('.env.local', 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let value = match[2].trim();
    // 去除引号
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    // 去除所有换行符和回车符
    value = value.replace(/\\n/g, '').replace(/\n/g, '').replace(/\r/g, '');
    process.env[match[1].trim()] = value;
  }
});

// 动态导入以确保环境变量已设置
const { sql } = await import('@vercel/postgres');

async function executeSql() {
  try {
    console.log('开始执行SQL脚本...\n');

    // 读取SQL文件
    const sqlContent = readFileSync('sql/create-ggyds-users.sql', 'utf-8');

    // 分割SQL语句 - 按分号+换行分割，过滤注释和空行
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s.includes('INSERT'));

    console.log(`找到 ${statements.length} 条INSERT语句\n`);

    let successCount = 0;
    let errorCount = 0;

    // 逐个执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'; // 添加回分号
      try {
        await sql.query(statement);
        successCount++;
        const username = statement.match(/VALUES \('([^']+)'/)?.[1] || '未知';
        console.log(`✓ [${i + 1}/${statements.length}] ${username} 执行成功`);
      } catch (error) {
        errorCount++;
        console.error(`✗ [${i + 1}/${statements.length}] 执行失败: ${error.message}`);
      }
    }

    console.log(`\n执行完成！成功: ${successCount}, 失败: ${errorCount}\n`);

    // 验证结果
    console.log('验证用户状态...\n');
    const result = await sql`
      SELECT username, role, is_active, initial_password
      FROM users
      WHERE username IN ('GGYDZ', 'SSTAFF') OR username LIKE 'GGYDS%'
      ORDER BY username
    `;

    console.log(`找到 ${result.rows.length} 个用户:\n`);
    result.rows.forEach(user => {
      const status = user.is_active ? '✓ 已激活' : '✗ 已停用';
      const password = user.initial_password ? `密码: ${user.initial_password}` : '无初始密码';
      console.log(`  ${user.username.padEnd(10)} (${user.role.padEnd(5)}): ${status} - ${password}`);
    });

    console.log('\n所有用户现在可以登录了！');
    process.exit(0);
  } catch (error) {
    console.error('\n执行失败:', error.message);
    process.exit(1);
  }
}

executeSql();
