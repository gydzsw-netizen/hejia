import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 尝试加载环境变量（如果存在）
try {
  const envPath = join(__dirname, '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
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
  console.log('已加载 .env.local 文件\n');
} catch (error) {
  console.log('未找到 .env.local 文件，使用环境变量\n');
}

// 动态导入以确保环境变量已设置
const { sql } = await import('@vercel/postgres');

async function runMigration() {
  try {
    console.log('开始执行数据库迁移...\n');

    // 读取迁移SQL文件
    const migration1 = readFileSync(join(__dirname, 'sql/add-country-settings.sql'), 'utf-8');
    const migration2 = readFileSync(join(__dirname, 'sql/add-country-settings-part2.sql'), 'utf-8');

    const allMigrations = migration1 + '\n' + migration2;

    // 分割SQL语句
    const statements = allMigrations
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`找到 ${statements.length} 条ALTER TABLE语句\n`);

    let successCount = 0;
    let errorCount = 0;

    // 逐个执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      try {
        await sql.query(statement);
        successCount++;
        // 提取列名
        const columnMatch = statement.match(/ADD COLUMN IF NOT EXISTS (\w+)/);
        const columnName = columnMatch ? columnMatch[1] : '未知';
        console.log(`✓ [${i + 1}/${statements.length}] 添加列 ${columnName} 成功`);
      } catch (error) {
        errorCount++;
        console.error(`✗ [${i + 1}/${statements.length}] 执行失败: ${error.message}`);
      }
    }

    console.log(`\n迁移完成！成功: ${successCount}, 失败: ${errorCount}\n`);

    // 验证结果 - 检查表结构
    console.log('验证表结构...\n');
    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'user_settings'
      AND column_name LIKE '%_profit_rate'
      ORDER BY column_name
    `;

    console.log(`找到 ${result.rows.length} 个国家利润率字段:\n`);
    result.rows.forEach(col => {
      console.log(`  ${col.column_name.padEnd(20)} (${col.data_type})`);
    });

    console.log('\n数据库迁移成功完成！');
    process.exit(0);
  } catch (error) {
    console.error('\n迁移失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runMigration();
