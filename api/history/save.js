import { sql } from '@vercel/postgres';
import { requireAuth, withErrorHandling } from '../../lib/middleware.js';

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { user } = await requireAuth(req);
  const body = req.body || {};

  const weight = toNumberOrNull(body.weight);
  const cost = toNumberOrNull(body.cost);
  const calculatedPriceCny = toNumberOrNull(body.calculatedPriceCny);
  const calculatedPriceUsd = toNumberOrNull(body.calculatedPriceUsd);
  const calculatedPriceEur = toNumberOrNull(body.calculatedPriceEur);

  if (
    weight === null ||
    cost === null ||
    calculatedPriceCny === null ||
    calculatedPriceUsd === null ||
    calculatedPriceEur === null
  ) {
    throw createHttpError(400, 'Required numeric fields are missing or invalid');
  }

  if (weight <= 0 || cost < 0 || calculatedPriceCny < 0 || calculatedPriceUsd < 0 || calculatedPriceEur < 0) {
    throw createHttpError(400, 'Numeric fields contain invalid values');
  }

  const result = await sql`
    INSERT INTO calculation_history (
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
      settings_snapshot
    )
    VALUES (
      ${user.userId},
      ${body.productName || null},
      ${weight},
      ${cost},
      ${toNumberOrNull(body.length)},
      ${toNumberOrNull(body.width)},
      ${toNumberOrNull(body.height)},
      ${calculatedPriceCny},
      ${calculatedPriceUsd},
      ${calculatedPriceEur},
      ${toNumberOrNull(body.weightShipping)},
      ${toNumberOrNull(body.volumeShipping)},
      ${toNumberOrNull(body.totalCost)},
      ${body.settingsSnapshot || null}
    )
    RETURNING id, created_at
  `;

  return res.status(201).json({
    success: true,
    id: result.rows[0].id,
    created_at: result.rows[0].created_at
  });
}

export default withErrorHandling(handler);
