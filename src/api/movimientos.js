import client from './client.js';

export const movimientos = {
  getAll: async (filters = {}) => {
    const { data } = await client.get('/movimientos-insumos/', { params: filters });
    return Array.isArray(data) ? data : data.data || [];
  },
  create: async (payload) => {
    const { data } = await client.post('/movimientos-insumos/', payload);
    return data;
  },
  getAlertas: async () => {
    const { data } = await client.get('/stock-alertas/');
    return Array.isArray(data) ? data : [];
  },
};
