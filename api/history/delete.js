import { sql } from '@vercel/postgres';
import { requireAuth, withErrorHandling } from '../../lib/middleware.js';

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { user } = await requireAuth(req);
  const id = Number.parseInt(req.query?.id, 10);

  if (!Number.isInteger(id) || id <= 0) {
    throw createHttpError(400, 'Invalid history id');
  }

  const result = await sql`
    DELETE FROM calculation_history
    WHERE id = ${id} AND user_id = ${user.userId}
    RETURNING id
  `;

  if (result.rows.length === 0) {
    throw createHttpError(404, 'History record not found');
  }

  return res.status(200).json({
    success: true,
    id
  });
}

export default withErrorHandling(handler);
