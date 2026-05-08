import { getStoredToken } from './storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'content-type': 'application/json' };
  const auth = token ?? getStoredToken();
  if (auth) headers.authorization = `Bearer ${auth}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.details = data?.details;
    throw err;
  }
  return data;
}

export const api = {
  health: () => request('/api/health'),
  register: (input) => request('/api/auth/register', { method: 'POST', body: input }),
  login: (input) => request('/api/auth/login', { method: 'POST', body: input }),
  me: () => request('/api/me'),
  listTickets: (params) => {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      sp.set(k, String(v));
    });
    const qs = sp.toString();
    return request(`/api/tickets${qs ? `?${qs}` : ''}`);
  },
  createTicket: (input) => request('/api/tickets', { method: 'POST', body: input }),
  getTicket: (id) => request(`/api/tickets/${id}`),
  addComment: (id, input) => request(`/api/tickets/${id}/comments`, { method: 'POST', body: input }),
  updateTicket: (id, input) => request(`/api/tickets/${id}`, { method: 'PATCH', body: input }),
  listUsers: () => request('/api/users'),
  setUserRole: (id, role) => request(`/api/users/${id}/role`, { method: 'PATCH', body: { role } })
};

