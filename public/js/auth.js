const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';
const API_BASE = '/api';

/**
 * 登录
 */
export async function login(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '登录失败');
  }

  const data = await response.json();
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

/**
 * 检查认证状态
 */
export async function checkAuth() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    redirectToLogin();
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Token验证失败');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('认证检查失败:', error);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    redirectToLogin();
    return null;
  }
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * 获取认证token
 */
export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * 登出
 */
export async function logout() {
  const token = getAuthToken();
  if (token) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('登出失败:', error);
    }
  }
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  redirectToLogin();
}

/**
 * 重定向到登录页
 */
export function redirectToLogin() {
  if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
    window.location.href = '/index.html';
  }
}

/**
 * API请求辅助函数（自动添加认证头）
 */
export async function apiRequest(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // Token过期或无效，重定向到登录页
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    redirectToLogin();
    throw new Error('认证已过期，请重新登录');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '请求失败');
  }

  return response.json();
}
