-- 更新所有用户的国家运算规则默认值
-- 执行日期: 2026-03-12

-- 美国参数更新
-- 活动占比20%，广告占比10%，退款率5%，重量运费系数55元/KG，体积系数6000，体积运费系数8元/kg，固定成本6元，美金汇率7.0，欧元汇率7.8
UPDATE user_settings SET
  us_activity_rate = 20.00,
  us_ad_rate = 10.00,
  us_refund_rate = 5.00,
  us_weight_rate = 55.00,
  us_volume_factor = 6000,
  us_volume_rate = 8.00,
  us_fixed_cost = 6.00,
  us_usd_rate = 7.00,
  us_eur_rate = 7.80,
  us_profit_rate = COALESCE(us_profit_rate, 30.00),
  us_min_price = COALESCE(us_min_price, 0.00);

-- 德国参数更新
-- 活动占比20%，广告占比10%，退款率5%，重量运费系数80元/KG，体积系数6000，体积运费系数8元/kg，固定成本25元，美金汇率7.0，欧元汇率7.8
UPDATE user_settings SET
  de_activity_rate = 20.00,
  de_ad_rate = 10.00,
  de_refund_rate = 5.00,
  de_weight_rate = 80.00,
  de_volume_factor = 6000,
  de_volume_rate = 8.00,
  de_fixed_cost = 25.00,
  de_usd_rate = 7.00,
  de_eur_rate = 7.80,
  de_profit_rate = COALESCE(de_profit_rate, 30.00),
  de_min_price = COALESCE(de_min_price, 0.00);

-- 英国参数更新
-- 活动占比20%，广告占比10%，退款率5%，重量运费系数80元/KG，体积系数6000，体积运费系数8元/kg，固定成本25元，美金汇率7.0，欧元汇率7.8
UPDATE user_settings SET
  gb_activity_rate = 20.00,
  gb_ad_rate = 10.00,
  gb_refund_rate = 5.00,
  gb_weight_rate = 80.00,
  gb_volume_factor = 6000,
  gb_volume_rate = 8.00,
  gb_fixed_cost = 25.00,
  gb_usd_rate = 7.00,
  gb_eur_rate = 7.80,
  gb_profit_rate = COALESCE(gb_profit_rate, 30.00),
  gb_min_price = COALESCE(gb_min_price, 0.00);

-- 法国参数更新
-- 活动占比20%，广告占比10%，退款率5%，重量运费系数78元/KG，体积系数6000，体积运费系数8元/kg，固定成本31元，美金汇率7.0，欧元汇率7.8
UPDATE user_settings SET
  fr_activity_rate = 20.00,
  fr_ad_rate = 10.00,
  fr_refund_rate = 5.00,
  fr_weight_rate = 78.00,
  fr_volume_factor = 6000,
  fr_volume_rate = 8.00,
  fr_fixed_cost = 31.00,
  fr_usd_rate = 7.00,
  fr_eur_rate = 7.80,
  fr_profit_rate = COALESCE(fr_profit_rate, 30.00),
  fr_min_price = COALESCE(fr_min_price, 0.00);

-- 泛欧参数更新
-- 活动占比20%，广告占比10%，退款率5%，重量运费系数90元/KG，体积系数6000，体积运费系数8元/kg，固定成本60元，美金汇率7.0，欧元汇率7.8
UPDATE user_settings SET
  eu_activity_rate = 20.00,
  eu_ad_rate = 10.00,
  eu_refund_rate = 5.00,
  eu_weight_rate = 90.00,
  eu_volume_factor = 6000,
  eu_volume_rate = 8.00,
  eu_fixed_cost = 60.00,
  eu_usd_rate = 7.00,
  eu_eur_rate = 7.80,
  eu_profit_rate = COALESCE(eu_profit_rate, 30.00),
  eu_min_price = COALESCE(eu_min_price, 0.00);
