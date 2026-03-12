import { sql } from '@vercel/postgres';
import { requireAuth, withErrorHandling } from '../../lib/middleware.js';

const DEFAULT_SETTINGS = {
  profit_rate: 30.0,
  weight_rate: 10.0,
  volume_factor: 6000,
  volume_rate: 8.0,
  fixed_cost: 5.0,
  min_price: 0.0,
  usd_rate: 7.2,
  eur_rate: 7.8
};

const ALLOWED_FIELDS = [
  'profit_rate',
  'weight_rate',
  'volume_factor',
  'volume_rate',
  'fixed_cost',
  'min_price',
  'usd_rate',
  'eur_rate',
  'activity_rate',
  'ad_rate',
  'refund_rate',
  // 美国
  'us_profit_rate', 'us_weight_rate', 'us_volume_factor', 'us_volume_rate',
  'us_fixed_cost', 'us_min_price', 'us_usd_rate', 'us_eur_rate',
  'us_activity_rate', 'us_ad_rate', 'us_refund_rate',
  // 德国
  'de_profit_rate', 'de_weight_rate', 'de_volume_factor', 'de_volume_rate',
  'de_fixed_cost', 'de_min_price', 'de_usd_rate', 'de_eur_rate',
  'de_activity_rate', 'de_ad_rate', 'de_refund_rate',
  // 英国
  'gb_profit_rate', 'gb_weight_rate', 'gb_volume_factor', 'gb_volume_rate',
  'gb_fixed_cost', 'gb_min_price', 'gb_usd_rate', 'gb_eur_rate',
  'gb_activity_rate', 'gb_ad_rate', 'gb_refund_rate',
  // 法国
  'fr_profit_rate', 'fr_weight_rate', 'fr_volume_factor', 'fr_volume_rate',
  'fr_fixed_cost', 'fr_min_price', 'fr_usd_rate', 'fr_eur_rate',
  'fr_activity_rate', 'fr_ad_rate', 'fr_refund_rate',
  // 泛欧
  'eu_profit_rate', 'eu_weight_rate', 'eu_volume_factor', 'eu_volume_rate',
  'eu_fixed_cost', 'eu_min_price', 'eu_usd_rate', 'eu_eur_rate',
  'eu_activity_rate', 'eu_ad_rate', 'eu_refund_rate'
];

async function handler(req, res) {
  const { user } = await requireAuth(req);

  if (req.method === 'GET') {
    const result = await sql`
      SELECT *
      FROM user_settings
      WHERE user_id = ${user.userId}
    `;

    if (result.rows.length === 0) {
      return res.status(200).json({ settings: DEFAULT_SETTINGS });
    }

    return res.status(200).json({ settings: result.rows[0] });
  }

  if (req.method === 'POST') {
    const { settings } = req.body || {};

    if (!settings || typeof settings !== 'object') {
      throw new Error('��Ч����������');
    }

    const fields = [];
    const values = [];

    for (const field of ALLOWED_FIELDS) {
      if (settings[field] !== undefined) {
        fields.push(field);
        values.push(settings[field]);
      }
    }

    if (fields.length === 0) {
      throw new Error('û��Ҫ���µ�����');
    }

    values.push(user.userId);

    const insertColumns = [...fields, 'user_id'];
    const insertPlaceholders = insertColumns.map((_, index) => `$${index + 1}`);
    const updateAssignments = fields.map(field => `${field} = EXCLUDED.${field}`);

    const query = `
      INSERT INTO user_settings (${insertColumns.join(', ')})
      VALUES (${insertPlaceholders.join(', ')})
      ON CONFLICT (user_id) DO UPDATE
      SET ${updateAssignments.join(', ')}, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await sql.query(query, values);

    return res.status(200).json({
      success: true,
      settings: result.rows[0]
    });
  }

  return res.status(405).json({ message: '����������' });
}

export default withErrorHandling(handler);
