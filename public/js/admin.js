import { apiRequest, getCurrentUser, logout } from './auth.js';

let users = [];

/**
 * 加载用户列表
 */
export async function loadUsers() {
  try {
    const data = await apiRequest('/api/users/list');
    users = data.users;
    renderUserTable();
    return users;
  } catch (error) {
    console.error('加载用户列表失败:', error);
    showError('加载用户列表失败: ' + error.message);
    throw error;
  }
}

/**
 * 渲染用户表格
 */
function renderUserTable() {
  const tbody = document.getElementById('userTableBody');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">暂无用户</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.id}</td>
      <td>${escapeHtml(user.username)}</td>
      <td><span class="role-badge ${user.role}">${user.role === 'admin' ? '管理员' : '普通用户'}</span></td>
      <td>${formatDate(user.created_at)}</td>
      <td>${user.last_login ? formatDate(user.last_login) : '从未登录'}</td>
      <td class="actions">
        <button class="btn btn-small" onclick="window.adminModule.showResetPasswordModal(${user.id}, '${escapeHtml(user.username)}')">重置密码</button>
      </td>
    </tr>
  `).join('');
}

/**
 * 显示创建用户模态框
 */
export function showCreateUserModal() {
  const modal = document.getElementById('createUserModal');
  modal.classList.add('active');
  document.getElementById('createUserForm').reset();
  document.getElementById('createUserError').textContent = '';
}

/**
 * 隐藏创建用户模态框
 */
export function hideCreateUserModal() {
  const modal = document.getElementById('createUserModal');
  modal.classList.remove('active');
}

/**
 * 创建用户
 */
export async function createUser(event) {
  event.preventDefault();

  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value;
  const role = document.getElementById('newRole').value;

  if (!username || !password) {
    showError('用户名和密码不能为空', 'createUserError');
    return;
  }

  if (password.length < 8) {
    showError('密码长度至少为8个字符', 'createUserError');
    return;
  }

  try {
    const createBtn = document.getElementById('createUserBtn');
    createBtn.disabled = true;
    createBtn.textContent = '创建中...';

    await apiRequest('/api/users/create', {
      method: 'POST',
      body: JSON.stringify({ username, password, role })
    });

    showSuccess('用户创建成功');
    hideCreateUserModal();
    await loadUsers();
  } catch (error) {
    showError('创建用户失败: ' + error.message, 'createUserError');
  } finally {
    const createBtn = document.getElementById('createUserBtn');
    createBtn.disabled = false;
    createBtn.textContent = '创建用户';
  }
}

/**
 * 显示重置密码模态框
 */
export function showResetPasswordModal(userId, username) {
  const modal = document.getElementById('resetPasswordModal');
  modal.classList.add('active');
  document.getElementById('resetPasswordForm').reset();
  document.getElementById('resetPasswordError').textContent = '';
  document.getElementById('resetUserId').value = userId;
  document.getElementById('resetUsername').textContent = username;
}

/**
 * 隐藏重置密码模态框
 */
export function hideResetPasswordModal() {
  const modal = document.getElementById('resetPasswordModal');
  modal.classList.remove('active');
}

/**
 * 重置密码
 */
export async function resetPassword(event) {
  event.preventDefault();

  const userId = parseInt(document.getElementById('resetUserId').value);
  const newPassword = document.getElementById('resetNewPassword').value;

  if (!newPassword) {
    showError('新密码不能为空', 'resetPasswordError');
    return;
  }

  if (newPassword.length < 8) {
    showError('密码长度至少为8个字符', 'resetPasswordError');
    return;
  }

  try {
    const resetBtn = document.getElementById('resetPasswordBtn');
    resetBtn.disabled = true;
    resetBtn.textContent = '重置中...';

    await apiRequest('/api/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ userId, newPassword })
    });

    showSuccess('密码重置成功');
    hideResetPasswordModal();
  } catch (error) {
    showError('重置密码失败: ' + error.message, 'resetPasswordError');
  } finally {
    const resetBtn = document.getElementById('resetPasswordBtn');
    resetBtn.disabled = false;
    resetBtn.textContent = '重置密码';
  }
}

/**
 * 显示错误消息
 */
function showError(message, elementId = 'errorMessage') {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    setTimeout(() => {
      element.textContent = '';
    }, 5000);
  }
}

/**
 * 显示成功消息
 */
function showSuccess(message) {
  const element = document.getElementById('successMessage');
  if (element) {
    element.textContent = message;
    setTimeout(() => {
      element.textContent = '';
    }, 3000);
  }
}

/**
 * 转义HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 初始化管理员页面
 */
export async function initAdmin() {
  const user = getCurrentUser();
  if (!user) {
    return;
  }

  // 检查是否是管理员
  if (user.role !== 'admin') {
    alert('您没有权限访问此页面');
    window.location.href = '/calculator.html';
    return;
  }

  // 显示用户信息
  document.getElementById('username').textContent = user.username;

  // 加载用户列表
  try {
    await loadUsers();
  } catch (error) {
    console.error('初始化失败:', error);
  }

  // 绑定登出按钮
  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('确定要登出吗？')) {
      logout();
    }
  });
}
