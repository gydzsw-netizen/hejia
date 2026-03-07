import { requireAuth, withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  const { user } = await requireAuth(req);

  return res.status(200).json({
    valid: true,
    user: {
      id: user.userId,
      username: user.username,
      role: user.role
    }
  });
}

export default withErrorHandling(handler);
