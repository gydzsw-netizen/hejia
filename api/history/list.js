import { sql } from '@vercel/postgres';
import { requireAuth, withErrorHandling } from '../../lib/middleware.js';

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parsePagination(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { user } = await requireAuth(req);

  const rawLimit = parsePagination(req.query?.limit, 50);
  const rawOffset = parsePagination(req.query?.offset, 0);
  const limit = Math.min(Math.max(rawLimit, 1), 200);
  const offset = Math.max(rawOffset, 0);
  const search = (req.query?.search || '').toString().trim();

  if (limit <= 0 || offset < 0) {
    throw createHttpError(400, 'Invalid pagination parameters');
  }

  const listResult = search
    ? await sql`
        SELECT
          id,
          user_id,
          product_name,
          weight,
          cost,
          length,
          width,
          height,
          calculated_price_cny,
          calculated_price_usd,
          calculated_price_eur,
          weight_shipping,
          volume_shipping,
          total_cost,
          settings_snapshot,
          created_at
        FROM calculation_history
        WHERE user_id = ${user.userId}
          AND (product_name ILIKE ${`%${search}%`} OR CAST(id AS TEXT) ILIKE ${`%${search}%`})
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    : await sql`
        SELECT
          id,
          user_id,
          product_name,
          weight,
          cost,
          length,
          width,
          height,
          calculated_price_cny,
          calculated_price_usd,
          calculated_price_eur,
          weight_shipping,
          volume_shipping,
          total_cost,
          settings_snapshot,
          created_at
        FROM calculation_history
        WHERE user_id = ${user.userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

  const countResult = search
    ? await sql`
        SELECT COUNT(*)::int AS total
        FROM calculation_history
        WHERE user_id = ${user.userId}
          AND (product_name ILIKE ${`%${search}%`} OR CAST(id AS TEXT) ILIKE ${`%${search}%`})
      `
    : await sql`
        SELECT COUNT(*)::int AS total
        FROM calculation_history
        WHERE user_id = ${user.userId}
      `;

  return res.status(200).json({
    history: listResult.rows,
    total: countResult.rows[0]?.total || 0,
    limit,
    offset
  });
}

export default withErrorHandling(handler);
