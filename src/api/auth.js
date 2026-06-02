import client from './client.js';

export const auth = {
  login: async (dni, password, role) => {
    const { data } = await client.post('/auth/login', { dni, password, role });
    if (data?.token) localStorage.setItem('auth_token', data.token);
    return data;
  },
  logout: async () => {
    try { await client.post('/auth/logout'); } catch (e) { /* ignore */ }
    localStorage.removeItem('auth_token');
  },
  me: async () => {
    const { data } = await client.get('/auth/me');
    return data;
  },
  refresh: async () => {
    const { data } = await client.post('/auth/refresh');
    if (data?.token) localStorage.setItem('auth_token', data.token);
    return data;
  },
};
