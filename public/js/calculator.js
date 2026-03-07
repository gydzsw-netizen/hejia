import { apiRequest, getCurrentUser, logout } from './auth.js';

let currentSettings = null;

/**
 * 加载用户设置
 */
export async function loadSettings() {
  try {
    const data = await apiRequest('/api/settings/get');
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
    const data = await apiRequest('/api/settings/save', {
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
    'fixedCost', 'minPrice', 'usdRate', 'eurRate'
  ];

  fields.forEach(field => {
    const element = document.getElementById(field);
    if (element && settings[field.replace(/([A-Z])/g, '_$1').toLowerCase()] !== undefined) {
      element.value = settings[field.replace(/([A-Z])/g, '_$1').toLowerCase()];
    }
  });
}

/**
 * 从表单获取设置
 */
function getSettingsFromForm() {
  return {
    profit_rate: parseFloat(document.getElementById('profitRate').value),
    weight_rate: parseFloat(document.getElementById('weightRate').value),
    volume_factor: parseInt(document.getElementById('volumeFactor').value),
    volume_rate: parseFloat(document.getElementById('volumeRate').value),
    fixed_cost: parseFloat(document.getElementById('fixedCost').value),
    min_price: parseFloat(document.getElementById('minPrice').value),
    usd_rate: parseFloat(document.getElementById('usdRate').value),
    eur_rate: parseFloat(document.getElementById('eurRate').value)
  };
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

  // 获取运算规则
  const profitRate = parseFloat(document.getElementById('profitRate').value) / 100;
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

  // 计算总成本
  const totalCost = cost + weightShipping + volumeShipping + fixedCost;

  // 计算销售价格（人民币）
  let salePriceCNY = totalCost * (1 + profitRate);

  // 应用最低价格限制
  if (salePriceCNY < minPrice) {
    salePriceCNY = minPrice;
  }

  // 计算其他货币价格
  const salePriceUSD = salePriceCNY / usdRate;
  const salePriceEUR = salePriceCNY / eurRate;

  // 显示结果
  document.getElementById('resultPriceCNY').textContent = `¥ ${salePriceCNY.toFixed(2)}`;
  document.getElementById('resultPriceUSD').textContent = `$ ${salePriceUSD.toFixed(2)}`;
  document.getElementById('resultPriceEUR').textContent = `€ ${salePriceEUR.toFixed(2)}`;

  // 显示详细分解
  const breakdown = `
    <div style="text-align: left; font-size: 0.9em;">
      <p><strong>成本明细：</strong></p>
      <p>• 产品成本: ¥${cost.toFixed(2)}</p>
      <p>• 重量运费: ${weight.toFixed(2)} kg × ¥${weightRate.toFixed(2)} = ¥${weightShipping.toFixed(2)}</p>
      <p>• 体积重量: ${volumeWeight.toFixed(2)} kg</p>
      <p>• 体积运费: ${volumeWeight.toFixed(2)} kg × ¥${volumeRate.toFixed(2)} = ¥${volumeShipping.toFixed(2)}</p>
      <p>• 固定成本: ¥${fixedCost.toFixed(2)}</p>
      <p style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3);"><strong>总成本: ¥${totalCost.toFixed(2)}</strong></p>
      <p><strong>利润率: ${(profitRate * 100).toFixed(0)}%</strong></p>
      <p><strong>利润金额: ¥${(salePriceCNY - totalCost).toFixed(2)}</strong></p>
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

  // 如果是管理员，显示管理员链接
  if (user.role === 'admin') {
    document.getElementById('adminLink').style.display = 'inline-block';
  }

  // 加载用户设置
  try {
    await loadSettings();
  } catch (error) {
    console.error('加载设置失败:', error);
    alert('加载设置失败，将使用默认值');
  }

  // 监听设置变化，自动保存
  const settingFields = ['profitRate', 'weightRate', 'volumeFactor', 'volumeRate', 'fixedCost', 'minPrice', 'usdRate', 'eurRate'];
  settingFields.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', async () => {
        try {
          const settings = getSettingsFromForm();
          await saveSettings(settings);
        } catch (error) {
          console.error('保存设置失败:', error);
        }
      });
    }
  });

  // 绑定登出按钮
  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('确定要登出吗？')) {
      logout();
    }
  });
}
