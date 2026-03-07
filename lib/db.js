import { sql } from '@vercel/postgres';

/**
 * 检查token是否在黑名单中
 */
export async function isTokenBlacklisted(token) {
  const crypto = await import('crypto');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const result = await sql`
    SELECT id FROM token_blacklist
    WHERE token_hash = ${tokenHash}
    AND expires_at > NOW()
    LIMIT 1
  `;

  return result.rows.length > 0;
}

/**
 * 将token添加到黑名单
 */
export async function addTokenToBlacklist(token, expiresAt) {
  const crypto = await import('crypto');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  await sql`
    INSERT INTO token_blacklist (token_hash, expires_at)
    VALUES (${tokenHash}, ${expiresAt})
  `;
}

/**
 * 清理过期的token黑名单记录
 */
export async function cleanupExpiredTokens() {
  await sql`DELETE FROM token_blacklist WHERE expires_at < NOW()`;
}
