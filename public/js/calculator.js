import { apiRequest, getCurrentUser, logout } from './auth.js';

let currentSettings = null;
let currentCountry = 'US'; // 默认美国

// 国家名称映射
const countryNames = {
  'US': '🇺🇸 美国',
  'DE': '🇩🇪 德国',
  'GB': '🇬🇧 英国',
  'FR': '🇫🇷 法国',
  'EU': '🇪🇺 泛欧'
};

/**
 * 加载用户设置
 */
export async function loadSettings() {
  try {
    const data = await apiRequest('/api/settings');
    currentSettings = data.settings;
    applySettings(currentSettings);
    return currentSettings;
  } catch (error) {
    console.error('加载设置失败:', error);
    throw error;
  }
}

/**
 * 保存用户设置
 */
export async function saveSettings(settings) {
  try {
    const data = await apiRequest('/api/settings', {
      method: 'POST',
      body: JSON.stringify({ settings })
    });
    currentSettings = data.settings;
    return data;
  } catch (error) {
    console.error('保存设置失败:', error);
    throw error;
  }
}

/**
 * 应用设置到表单
 */
function applySettings(settings) {
  const fields = [
    'profitRate', 'weightRate', 'volumeFactor', 'volumeRate',
    'fixedCost', 'minPrice', 'usdRate', 'eurRate', 'activityRate', 'adRate', 'refundRate'
  ];

  fields.forEach(field => {
    const snakeField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
    const countryField = `${currentCountry.toLowerCase()}_${snakeField}`;

    const element = document.getElementById(field);
    const adminElement = document.getElementById(field + 'Admin');

    // 优先使用国家特定设置，否则使用通用设置
    const value = settings[countryField] !== undefined ? settings[countryField] : settings[snakeField];

    if (element && value !== undefined) {
      element.value = value;
    }
    if (adminElement && value !== undefined) {
      adminElement.value = value;
    }
  });
}

/**
 * 从表单获取设置
 */
function getSettingsFromForm() {
  const prefix = currentCountry.toLowerCase();
  return {
    [`${prefix}_profit_rate`]: parseFloat(document.getElementById('profitRate').value),
    [`${prefix}_weight_rate`]: parseFloat(document.getElementById('weightRate').value),
    [`${prefix}_volume_factor`]: parseInt(document.getElementById('volumeFactor').value),
    [`${prefix}_volume_rate`]: parseFloat(document.getElementById('volumeRate').value),
    [`${prefix}_fixed_cost`]: parseFloat(document.getElementById('fixedCost').value),
    [`${prefix}_min_price`]: parseFloat(document.getElementById('minPrice').value),
    [`${prefix}_usd_rate`]: parseFloat(document.getElementById('usdRate').value),
    [`${prefix}_eur_rate`]: parseFloat(document.getElementById('eurRate').value),
    [`${prefix}_activity_rate`]: parseFloat(document.getElementById('activityRateAdmin').value),
    [`${prefix}_ad_rate`]: parseFloat(document.getElementById('adRateAdmin').value),
    [`${prefix}_refund_rate`]: parseFloat(document.getElementById('refundRate').value)
  };
}

/**
 * 切换国家
 */
export function switchCountry(country) {
  currentCountry = country;

  // 更新国家名称显示
  const countryNameElement = document.getElementById('countryName');
  const resultCountryNameElement = document.getElementById('resultCountryName');
  if (countryNameElement) {
    countryNameElement.textContent = countryNames[country];
  }
  if (resultCountryNameElement) {
    resultCountryNameElement.textContent = countryNames[country];
  }

  // 重新应用设置
  if (currentSettings) {
    applySettings(currentSettings);

    // 同步更新产品信息中的只读字段
    const prefix = country.toLowerCase();
    const activityRateField = `${prefix}_activity_rate`;
    const adRateField = `${prefix}_ad_rate`;

    const activityRate = currentSettings[activityRateField] !== undefined
      ? currentSettings[activityRateField]
      : (currentSettings.activity_rate || 0);
    const adRate = currentSettings[adRateField] !== undefined
      ? currentSettings[adRateField]
      : (currentSettings.ad_rate || 0);

    const activityRateElement = document.getElementById('activityRate');
    const adRateElement = document.getElementById('adRate');

    if (activityRateElement) {
      activityRateElement.value = activityRate;
    }
    if (adRateElement) {
      adRateElement.value = adRate;
    }
  }
}

/**
 * 计算价格
 */
export function calculatePrice() {
  // 获取输入值
  const weight = parseFloat(document.getElementById('weight').value) || 0;
  const cost = parseFloat(document.getElementById('cost').value) || 0;
  const length = parseFloat(document.getElementById('length').value) || 0;
  const width = parseFloat(document.getElementById('width').value) || 0;
  const height = parseFloat(document.getElementById('height').value) || 0;

  // 获取用户输入的利润率（优先使用产品信息中的利润率）
  const userProfitRateElement = document.getElementById('userProfitRate');
  const profitRate = userProfitRateElement
    ? parseFloat(userProfitRateElement.value) / 100
    : parseFloat(document.getElementById('profitRate').value) / 100;

  const activityRate = parseFloat(document.getElementById('activityRate').value) / 100;
  const adRate = parseFloat(document.getElementById('adRate').value) / 100;

  // 获取管理员设置的运算规则
  const refundRateElement = document.getElementById('refundRate');
  const refundRate = refundRateElement ? parseFloat(refundRateElement.value) / 100 : 0;

  const weightRate = parseFloat(document.getElementById('weightRate').value);
  const volumeFactor = parseFloat(document.getElementById('volumeFactor').value);
  const volumeRate = parseFloat(document.getElementById('volumeRate').value);
  const fixedCost = parseFloat(document.getElementById('fixedCost').value);
  const minPrice = parseFloat(document.getElementById('minPrice').value);
  const usdRate = parseFloat(document.getElementById('usdRate').value);
  const eurRate = parseFloat(document.getElementById('eurRate').value);

  // 验证输入
  if (weight <= 0 || cost <= 0) {
    alert('请输入有效的重量和成本！');
    return;
  }

  // 计算体积重量
  const volumeWeight = (length * width * height) / volumeFactor;

  // 计算运费
  const weightShipping = weight * weightRate;
  const volumeShipping = volumeWeight * volumeRate;
  const totalShipping = weightShipping + volumeShipping + fixedCost;

  // 计算销售价格（新公式）
  // 售价 = (产品成本 + 运费) / (1 - 利润率 - 活动占比 - 广告占比 - 退款率)
  const denominator = 1 - profitRate - activityRate - adRate - refundRate;

  if (denominator <= 0) {
    alert('利润率、活动占比、广告占比和退款率的总和不能大于或等于100%！');
    return;
  }

  let salePriceCNY = (cost + totalShipping) / denominator;

  // 应用最低价格限制
  if (salePriceCNY < minPrice) {
    salePriceCNY = minPrice;
  }

  // 计算利润值（人民币）
  const profitValueCNY = salePriceCNY - cost - totalShipping;

  // 计算其他货币价格
  const salePriceUSD = salePriceCNY / usdRate;
  const salePriceEUR = salePriceCNY / eurRate;

  // 计算其他货币的利润值
  const profitValueUSD = profitValueCNY / usdRate;
  const profitValueEUR = profitValueCNY / eurRate;

  // 显示销售价格
  document.getElementById('resultPriceCNY').textContent = `¥ ${salePriceCNY.toFixed(2)}`;
  document.getElementById('resultPriceUSD').textContent = `$ ${salePriceUSD.toFixed(2)}`;
  document.getElementById('resultPriceEUR').textContent = `€ ${salePriceEUR.toFixed(2)}`;

  // 显示利润值（三种货币）
  document.getElementById('resultProfitCNY').textContent = `¥ ${profitValueCNY.toFixed(2)}`;
  document.getElementById('resultProfitUSD').textContent = `$ ${profitValueUSD.toFixed(2)}`;
  document.getElementById('resultProfitEUR').textContent = `€ ${profitValueEUR.toFixed(2)}`;

  // 显示详细分解
  const breakdown = `
    <div style="text-align: left; font-size: 0.9em;">
      <p><strong>成本明细：</strong></p>
      <p>• 产品成本: ¥${cost.toFixed(2)}</p>
      <p>• 重量运费: ${weight.toFixed(2)} kg × ¥${weightRate.toFixed(2)} = ¥${weightShipping.toFixed(2)}</p>
      <p>• 体积重量: ${volumeWeight.toFixed(2)} kg</p>
      <p>• 体积运费: ${volumeWeight.toFixed(2)} kg × ¥${volumeRate.toFixed(2)} = ¥${volumeShipping.toFixed(2)}</p>
      <p>• 固定成本: ¥${fixedCost.toFixed(2)}</p>
      <p style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3);"><strong>总运费: ¥${totalShipping.toFixed(2)}</strong></p>
      <p><strong>成本合计: ¥${(cost + totalShipping).toFixed(2)}</strong></p>
      <p style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3);"><strong>费率设置：</strong></p>
      <p>• 利润率: ${(profitRate * 100).toFixed(1)}%</p>
      <p>• 活动占比: ${(activityRate * 100).toFixed(1)}%</p>
      <p>• 广告占比: ${(adRate * 100).toFixed(1)}%</p>
      <p>• 退款率: ${(refundRate * 100).toFixed(1)}%</p>
      <p><strong>总费率: ${((profitRate + activityRate + adRate + refundRate) * 100).toFixed(1)}%</strong></p>
      <p style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3);"><strong>利润值：</strong></p>
      <p>• 人民币: ¥${profitValueCNY.toFixed(2)}</p>
      <p>• 美元: $${profitValueUSD.toFixed(2)}</p>
      <p>• 欧元: €${profitValueEUR.toFixed(2)}</p>
      <p style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3);"><strong>汇率设置：</strong></p>
      <p>• 美元汇率: 1 USD = ¥${usdRate.toFixed(2)}</p>
      <p>• 欧元汇率: 1 EUR = ¥${eurRate.toFixed(2)}</p>
    </div>
  `;
  document.getElementById('breakdown').innerHTML = breakdown;
}

/**
 * 切换管理员设置显示
 */
export function toggleAdmin() {
  const adminSection = document.getElementById('adminSection');
  adminSection.classList.toggle('active');
}

/**
 * 初始化计算器页面
 */
export async function initCalculator() {
  const user = getCurrentUser();
  if (!user) {
    return;
  }

  // 显示用户信息
  document.getElementById('username').textContent = user.username;

  // 初始化国家选择器
  const countrySelect = document.getElementById('country');
  if (countrySelect) {
    countrySelect.addEventListener('change', (e) => {
      switchCountry(e.target.value);
    });
    // 设置初始国家
    switchCountry(countrySelect.value);
  }

  // 根据用户角色显示或隐藏运算规则卡片
  const rulesCard = document.getElementById('rulesCard');
  const mainContent = document.getElementById('mainContent');

  if (user.role === 'admin') {
    // 管理员：显示管理员链接和运算规则卡片
    document.getElementById('adminLink').style.display = 'inline-block';
    if (rulesCard) {
      rulesCard.classList.remove('hidden');
    }
  } else {
    // 普通用户：隐藏运算规则卡片，调整布局
    if (rulesCard) {
      rulesCard.classList.add('hidden');
    }
    if (mainContent) {
      mainContent.classList.add('no-admin');
    }
  }

  // 加载用户设置
  try {
    await loadSettings();
  } catch (error) {
    console.error('加载设置失败:', error);
    alert('加载设置失败，将使用默认值');
  }

  // 监听设置变化，自动保存（仅管理员）
  if (user.role === 'admin') {
    const settingFields = ['profitRate', 'weightRate', 'volumeFactor', 'volumeRate', 'fixedCost', 'minPrice', 'usdRate', 'eurRate', 'activityRateAdmin', 'adRateAdmin', 'refundRate'];
    settingFields.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', async () => {
          try {
            const settings = getSettingsFromForm();
            await saveSettings(settings);
            // 同步更新产品信息中的只读字段
            const prefix = currentCountry.toLowerCase();
            const activityRateKey = `${prefix}_activity_rate`;
            const adRateKey = `${prefix}_ad_rate`;
            document.getElementById('activityRate').value = settings[activityRateKey];
            document.getElementById('adRate').value = settings[adRateKey];
          } catch (error) {
            console.error('保存设置失败:', error);
          }
        });
      }
    });
  }

  // 绑定登出按钮
  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('确定要登出吗？')) {
      logout();
    }
  });
}
