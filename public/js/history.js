import { apiRequest } from './auth.js';

let currentHistory = [];

function escapeHtml(text) {
  if (text === null || text === undefined) {
    return '';
  }
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function formatNumber(value, fractionDigits = 2) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return (0).toFixed(fractionDigits);
  }
  return num.toFixed(fractionDigits);
}

/**
 * Save one calculation history record
 */
export async function saveHistory(calculationData) {
  try {
    return await apiRequest('/api/history/save', {
      method: 'POST',
      body: JSON.stringify(calculationData)
    });
  } catch (error) {
    console.error('Failed to save history:', error);
    throw error;
  }
}

/**
 * Load history list
 */
export async function loadHistory(options = {}) {
  try {
    const { limit = 50, offset = 0, search = '' } = options;
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      search: String(search || '')
    });

    const data = await apiRequest(`/api/history/list?${params}`);
    currentHistory = Array.isArray(data.history) ? data.history : [];
    return data;
  } catch (error) {
    console.error('Failed to load history:', error);
    throw error;
  }
}

/**
 * Delete history by id
 */
export async function deleteHistory(id) {
  try {
    return await apiRequest(`/api/history/delete?id=${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Failed to delete history:', error);
    throw error;
  }
}

/**
 * Render history list table
 */
export function renderHistoryList(history, containerId = 'historyListBody') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!Array.isArray(history) || history.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">暂无历史记录</td></tr>';
    return;
  }

  container.innerHTML = history.map(item => {
    const date = new Date(item.created_at).toLocaleString('zh-CN');
    const productName = escapeHtml(item.product_name || '未命名产品');

    return `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 12px;">${date}</td>
        <td style="padding: 12px;">${productName}</td>
        <td style="padding: 12px;">${formatNumber(item.weight)} kg</td>
        <td style="padding: 12px;">￥${formatNumber(item.cost)}</td>
        <td style="padding: 12px;">
          <div>￥${formatNumber(item.calculated_price_cny)}</div>
          <div style="font-size: 12px; color: #666;">
            $${formatNumber(item.calculated_price_usd)} /
            �${formatNumber(item.calculated_price_eur)}
          </div>
        </td>
        <td style="padding: 12px; text-align: center;">
          <button onclick="viewHistoryDetail(${item.id})" style="padding: 5px 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px;">查看</button>
          <button onclick="deleteHistoryItem(${item.id})" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">删除</button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Show history detail dialog
 */
export function viewHistoryDetail(id) {
  const item = currentHistory.find(h => h.id === id);
  if (!item) return;

  const dialog = document.getElementById('historyDetailDialog');
  if (!dialog) return;

  document.getElementById('detailProductName').textContent = item.product_name || '未命名产品';
  document.getElementById('detailDate').textContent = new Date(item.created_at).toLocaleString('zh-CN');
  document.getElementById('detailWeight').textContent = `${formatNumber(item.weight)} kg`;
  document.getElementById('detailCost').textContent = `￥${formatNumber(item.cost)}`;

  if (item.length && item.width && item.height) {
    document.getElementById('detailSize').textContent = `${formatNumber(item.length)} × ${formatNumber(item.width)} × ${formatNumber(item.height)} cm`;
  } else {
    document.getElementById('detailSize').textContent = '未提供';
  }

  document.getElementById('detailPriceCNY').textContent = `￥${formatNumber(item.calculated_price_cny)}`;
  document.getElementById('detailPriceUSD').textContent = `$${formatNumber(item.calculated_price_usd)}`;
  document.getElementById('detailPriceEUR').textContent = `�${formatNumber(item.calculated_price_eur)}`;

  if (item.weight_shipping !== null && item.weight_shipping !== undefined) {
    document.getElementById('detailWeightShipping').textContent = `￥${formatNumber(item.weight_shipping)}`;
  }
  if (item.volume_shipping !== null && item.volume_shipping !== undefined) {
    document.getElementById('detailVolumeShipping').textContent = `￥${formatNumber(item.volume_shipping)}`;
  }
  if (item.total_cost !== null && item.total_cost !== undefined) {
    document.getElementById('detailTotalCost').textContent = `￥${formatNumber(item.total_cost)}`;
  }

  dialog.style.display = 'flex';
}

/**
 * Close history detail dialog
 */
export function closeHistoryDetailDialog() {
  const dialog = document.getElementById('historyDetailDialog');
  if (dialog) {
    dialog.style.display = 'none';
  }
}

/**
 * Delete history item from UI action
 */
export async function deleteHistoryItem(id) {
  if (!confirm('确定要删除这条历史记录吗？')) {
    return;
  }

  try {
    await deleteHistory(id);
    const data = await loadHistory();
    renderHistoryList(data.history);
    alert('删除成功');
  } catch (error) {
    alert(`删除失败：${error.message}`);
  }
}

if (typeof window !== 'undefined') {
  window.viewHistoryDetail = viewHistoryDetail;
  window.closeHistoryDetailDialog = closeHistoryDetailDialog;
  window.deleteHistoryItem = deleteHistoryItem;
}
