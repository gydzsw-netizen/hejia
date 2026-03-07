import { verifyToken } from './auth.js';
import { isTokenBlacklisted } from './db.js';

/**
 * 认证中间件 - 验证JWT token
 */
export async function requireAuth(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('未提供认证token');
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    throw new Error('无效的token');
  }

  // 检查token是否在黑名单中
  if (await isTokenBlacklisted(token)) {
    throw new Error('Token已失效');
  }

  return { user: payload, token };
}

/**
 * 管理员权限中间件
 */
export async function requireAdmin(req) {
  const { user } = await requireAuth(req);

  if (user.role !== 'admin') {
    throw new Error('需要管理员权限');
  }

  return user;
}

/**
 * 错误处理包装器
 */
export function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('API错误:', error);

      const statusCode = error.message.includes('未提供') ? 401 :
                        error.message.includes('无效') ? 401 :
                        error.message.includes('已失效') ? 401 :
                        error.message.includes('权限') ? 403 :
                        error.message.includes('不能为空') ? 400 :
                        error.message.includes('已存在') ? 409 :
                        500;

      return res.status(statusCode).json({
        message: error.message || '服务器错误'
      });
    }
  };
}
