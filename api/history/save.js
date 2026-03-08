import { sql } from '@vercel/postgres';
import { requireAuth, withErrorHandling } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  const { user } = await requireAuth(req);
  const {
    productName,
    weight,
    cost,
    length,
    width,
    height,
    calculatedPriceCny,
    calculatedPriceUsd,
    calculatedPriceEur,
    weightShipping,
    volumeShipping,
    totalCost,
    settingsSnapshot
  } = req.body;

  if (!weight || !cost || !calculatedPriceCny || !calculatedPriceUsd || !calculatedPriceEur) {
    throw new Error('缺少必需的字段');
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
    ) VALUES (
      ${user.userId},
      ${productName || null},
      ${weight},
      ${cost},
      ${length || null},
      ${width || null},
      ${height || null},
      ${calculatedPriceCny},
      ${calculatedPriceUsd},
      ${calculatedPriceEur},
      ${weightShipping || null},
      ${volumeShipping || null},
      ${totalCost || null},
      ${settingsSnapshot ? JSON.stringify(settingsSnapshot) : null}
    )
    RETURNING *
  `;

  return res.status(200).json({
    success: true,
    history: result.rows[0]
  });
}

export default withErrorHandling(handler);
