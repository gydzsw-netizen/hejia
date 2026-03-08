import { apiRequest } from './auth.js';

let currentHistory = [];

/**
 * 保存计算历史记录
 */
export async function saveHistory(calculationData) {
  try {
    const data = await apiRequest('/api/history/save', {
      method: 'POST',
      body: JSON.stringify(calculationData)
    });
    return data;
  } catch (error) {
    console.error('保存历史记录失败:', error);
    throw error;
  }
}

/**
 * 加载历史记录列表
 */
export async function loadHistory(options = {}) {
  try {
    const { limit = 50, offset = 0, search = '' } = options;
    const params = new URLSearchParams({ limit, offset, search });
    const data = await apiRequest(`/api/history/list?${params}`);
    currentHistory = data.history;
    return data;
  } catch (error) {
    console.error('加载历史记录失败:', error);
    throw error;
  }
}

/**
 * 删除历史记录
 */
export async function deleteHistory(id) {
  try {
    const data = await apiRequest(`/api/history/delete?id=${id}`, {
      method: 'DELETE'
    });
    return data;
  } catch (error) {
    console.error('删除历史记录失败:', error);
    throw error;
  }
}

/**
 * 渲染历史记录列表
 */
export function renderHistoryList(history, containerId = 'historyListBody') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!history || history.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">暂无历史记录</td></tr>';
    return;
  }

  container.innerHTML = history.map(item => {
    const date = new Date(item.created_at).toLocaleString('zh-CN');
    const productName = item.product_name || '未命名产品';

    return `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 12px;">${date}</td>
        <td style="padding: 12px;">${productName}</td>
        <td style="padding: 12px;">${item.weight} kg</td>
        <td style="padding: 12px;">¥${parseFloat(item.cost).toFixed(2)}</td>
        <td style="padding: 12px;">
          <div>¥${parseFloat(item.calculated_price_cny).toFixed(2)}</div>
          <div style="font-size: 12px; color: #666;">
            $${parseFloat(item.calculated_price_usd).toFixed(2)} /
            €${parseFloat(item.calculated_price_eur).toFixed(2)}
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
 * 查看历史记录详情
 */
export function viewHistoryDetail(id) {
  const item = currentHistory.find(h => h.id === id);
  if (!item) return;

  const dialog = document.getElementById('historyDetailDialog');
  if (!dialog) return;

  // 填充详情数据
  document.getElementById('detailProductName').textContent = item.product_name || '未命名产品';
  document.getElementById('detailDate').textContent = new Date(item.created_at).toLocaleString('zh-CN');
  document.getElementById('detailWeight').textContent = `${item.weight} kg`;
  document.getElementById('detailCost').textContent = `¥${parseFloat(item.cost).toFixed(2)}`;

  if (item.length && item.width && item.height) {
    document.getElementById('detailSize').textContent = `${item.length} × ${item.width} × ${item.height} cm`;
  } else {
    document.getElementById('detailSize').textContent = '未提供';
  }

  document.getElementById('detailPriceCNY').textContent = `¥${parseFloat(item.calculated_price_cny).toFixed(2)}`;
  document.getElementById('detailPriceUSD').textContent = `$${parseFloat(item.calculated_price_usd).toFixed(2)}`;
  document.getElementById('detailPriceEUR').textContent = `€${parseFloat(item.calculated_price_eur).toFixed(2)}`;

  if (item.weight_shipping) {
    document.getElementById('detailWeightShipping').textContent = `¥${parseFloat(item.weight_shipping).toFixed(2)}`;
  }
  if (item.volume_shipping) {
    document.getElementById('detailVolumeShipping').textContent = `¥${parseFloat(item.volume_shipping).toFixed(2)}`;
  }
  if (item.total_cost) {
    document.getElementById('detailTotalCost').textContent = `¥${parseFloat(item.total_cost).toFixed(2)}`;
  }

  dialog.style.display = 'flex';
}

/**
 * 关闭历史记录详情对话框
 */
export function closeHistoryDetailDialog() {
  const dialog = document.getElementById('historyDetailDialog');
  if (dialog) {
    dialog.style.display = 'none';
  }
}

/**
 * 删除历史记录项
 */
export async function deleteHistoryItem(id) {
  if (!confirm('确定要删除这条历史记录吗？')) {
    return;
  }

  try {
    await deleteHistory(id);
    // 重新加载历史记录
    const data = await loadHistory();
    renderHistoryList(data.history);
    alert('删除成功');
  } catch (error) {
    alert('删除失败：' + error.message);
  }
}

// 导出到全局作用域供 HTML 使用
if (typeof window !== 'undefined') {
  window.viewHistoryDetail = viewHistoryDetail;
  window.closeHistoryDetailDialog = closeHistoryDetailDialog;
  window.deleteHistoryItem = deleteHistoryItem;
}
