import { verifyToken } from './auth.js';
import { isTokenBlacklisted } from './db.js';

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Authentication middleware - verify JWT token
 */
export async function requireAuth(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createHttpError(401, 'Authentication token is required');
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    throw createHttpError(401, 'Invalid or expired token');
  }

  if (await isTokenBlacklisted(token)) {
    throw createHttpError(401, 'Token has been revoked');
  }

  return { user: payload, token };
}

/**
 * Admin authorization middleware
 */
export async function requireAdmin(req) {
  const { user } = await requireAuth(req);

  if (user.role !== 'admin') {
    throw createHttpError(403, 'Admin permission is required');
  }

  return user;
}

/**
 * API error handling wrapper
 */
export function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('API error:', error);

      const message = error?.message || '';
      const isBadRequest =
        message.includes('cannot be empty') ||
        message.includes('required') ||
        message.includes('invalid') ||
        message.includes('无效') ||
        message.includes('不能为空');
      const isConflict =
        message.includes('already exists') ||
        message.includes('已存在') ||
        message.includes('已被使用');

      const statusCode = Number.isInteger(error?.statusCode)
        ? error.statusCode
        : isBadRequest
          ? 400
          : isConflict
            ? 409
            : 500;

      return res.status(statusCode).json({
        message: message || 'Internal server error'
      });
    }
  };
}
