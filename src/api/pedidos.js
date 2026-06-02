import client from './client.js';

export const pedidos = {
  getAll: async (filters = {}) => {
    const { data } = await client.get('/pedidos/', { params: filters });
    return Array.isArray(data) ? data : data.data || [];
  },
  getById: async (id) => {
    const { data } = await client.get(`/pedidos/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await client.post('/pedidos/', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await client.patch(`/pedidos/${id}`, payload);
    return data;
  },
  updateStatus: async (id, status) => {
    const { data } = await client.patch(`/pedidos/${id}/estado`, { status });
    return data;
  },
  updatePayment: async (id, paid) => {
    const { data } = await client.patch(`/pedidos/${id}/pago`, { pagado: paid });
    return data;
  },
  getHistory: async (id) => {
    const { data } = await client.get(`/pedidos/${id}/historial`);
    return Array.isArray(data) ? data : [];
  },
};
