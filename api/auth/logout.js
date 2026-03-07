import { requireAuth, withErrorHandling } from '../../lib/middleware.js';
import { addTokenToBlacklist, cleanupExpiredTokens } from '../../lib/db.js';
import { getTokenExpiry } from '../../lib/auth.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  const { token } = await requireAuth(req);

  // 获取token过期时间
  const expiresAt = getTokenExpiry(token);
  if (!expiresAt) {
    throw new Error('无法获取token过期时间');
  }

  // 将token添加到黑名单
  await addTokenToBlacklist(token, expiresAt);

  // 清理过期的token（异步执行，不等待）
  cleanupExpiredTokens().catch(err =>
    console.error('清理过期token失败:', err)
  );

  return res.status(200).json({ success: true });
}

export default withErrorHandling(handler);
