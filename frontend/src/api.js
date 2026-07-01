/**
 * VJS Billing — Centralized API Service
 * All communication with the Express backend goes through here.
 */

const BASE_URL = 'http://localhost:5000/api';

// ── Token helpers ────────────────────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem('vjs_token');
}

export function setToken(token) {
  localStorage.setItem('vjs_token', token);
}

export function clearToken() {
  localStorage.removeItem('vjs_token');
  localStorage.removeItem('vjs_current_user');
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('vjs_current_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  localStorage.setItem('vjs_current_user', JSON.stringify(user));
}

// ── Core fetch helper ────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle token expiry
  if (response.status === 401) {
    clearToken();
    window.location.reload();
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (name, pin) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ name, pin }),
    }),
};

// ── Products ─────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll:  (storeId)         => request(`/products${storeId ? `?storeId=${storeId}` : ''}`),
  getById: (id)              => request(`/products/${id}`),
  create:  (data)            => request('/products',     { method: 'POST', body: JSON.stringify(data) }),
  update:  (id, data)        => request(`/products/${id}`, { method: 'PUT',  body: JSON.stringify(data) }),
  delete:  (id)              => request(`/products/${id}`, { method: 'DELETE' }),
};

// ── Bills ─────────────────────────────────────────────────────────────────────
export const billsApi = {
  getAll:  (storeId)  => request(`/bills${storeId ? `?storeId=${storeId}` : ''}`),
  getById: (id)       => request(`/bills/${id}`),
  create:  (data)     => request('/bills', { method: 'POST', body: JSON.stringify(data) }),
  delete:  (id)       => request(`/bills/${id}`, { method: 'DELETE' }),
};

// ── Loans ─────────────────────────────────────────────────────────────────────
export const loansApi = {
  getAll:  (storeId)  => request(`/loans${storeId ? `?storeId=${storeId}` : ''}`),
  getById: (id)       => request(`/loans/${id}`),
  create:  (data)     => request('/loans', { method: 'POST', body: JSON.stringify(data) }),
  update:  (id, data) => request(`/loans/${id}`, { method: 'PUT',  body: JSON.stringify(data) }),
  delete:  (id)       => request(`/loans/${id}`, { method: 'DELETE' }),
};

// ── Staff ─────────────────────────────────────────────────────────────────────
export const staffApi = {
  getAll:  ()         => request('/staff'),
  create:  (data)     => request('/staff', { method: 'POST', body: JSON.stringify(data) }),
  update:  (id, data) => request(`/staff/${id}`, { method: 'PUT',  body: JSON.stringify(data) }),
  delete:  (id)       => request(`/staff/${id}`, { method: 'DELETE' }),
};

// ── Settings ──────────────────────────────────────────────────────────────────
export const settingsApi = {
  get:    (storeId)       => request(`/settings/${storeId}`),
  update: (storeId, data) => request(`/settings/${storeId}`, { method: 'PUT', body: JSON.stringify(data) }),
};
