/**
 * VJS Billing — Centralized API Service
 * All communication with the Express backend goes through here.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// ── Friendly error messages by HTTP status ────────────────────────────────────
function friendlyError(status, serverMessage) {
  // Always prefer the server's own message when it's meaningful
  if (serverMessage && serverMessage.length < 200 && !serverMessage.startsWith('<!')) {
    return serverMessage;
  }
  switch (status) {
    case 400: return 'Invalid request. Please check your input and try again.';
    case 401: return 'Session expired. Please log in again.';
    case 403: return 'Access denied. You do not have permission for this action.';
    case 404: return 'Record not found. It may have been deleted.';
    case 409: return 'This record already exists. Please check for duplicates.';
    case 422: return 'Invalid data submitted. Please check all required fields.';
    case 429: return 'Too many requests. Please wait a moment and try again.';
    case 500: return 'Server error. Please try again later.';
    case 502:
    case 503:
    case 504: return 'Server is temporarily unavailable. Please try again shortly.';
    default:  return `Request failed (${status}). Please try again.`;
  }
}

// ── Core fetch helper ────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (netErr) {
    console.error('Network error:', netErr);
    throw new Error('Unable to connect to server. Please check your internet connection and ensure the server is running.');
  }

  // Handle token expiry
  if (response.status === 401 && path !== '/auth/login') {
    clearToken();
    window.location.reload();
    return;
  }

  let data = {};
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (parseErr) {
      console.error('JSON parsing failed:', parseErr);
    }
  } else {
    try {
      const text = await response.text();
      data = { message: text || `Error ${response.status}: ${response.statusText}` };
    } catch (textErr) {
      data = { message: `Error ${response.status}: ${response.statusText}` };
    }
  }

  if (!response.ok) {
    const msg = friendlyError(response.status, data.message);
    throw new Error(msg);
  }

  return data;
}


// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username, pin) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, pin }),
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
  revealPin: (id, adminPin) => request(`/staff/${id}/reveal-pin`, { method: 'POST', body: JSON.stringify({ adminPin }) }),
};

// ── Settings ──────────────────────────────────────────────────────────────────
export const settingsApi = {
  get:    (storeId)       => request(`/settings/${storeId}`),
  update: (storeId, data) => request(`/settings/${storeId}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Schemes ──────────────────────────────────────────────────────────────────
export const schemesApi = {
  getAll: (storeId)       => request(`/schemes${storeId ? `?storeId=${storeId}` : ''}`),
  create: (data)          => request('/schemes', { method: 'POST', body: JSON.stringify(data) }),
  pay:    (id, data)       => request(`/schemes/${id}/pay`, { method: 'PUT', body: JSON.stringify(data) }),
  redeem: (id, data)       => request(`/schemes/${id}/redeem`, { method: 'PUT', body: JSON.stringify(data) }),
  cancel: (id, data)       => request(`/schemes/${id}/cancel`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Activity Logs ────────────────────────────────────────────────────────────
export const activityLogsApi = {
  getAll: (storeId) => request(`/activity-logs${storeId ? `?storeId=${storeId}` : ''}`),
};
