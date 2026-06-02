import client from './client.js';

export const canastos = {
  getAll: async () => {
    const { data } = await client.get('/canastos/');
    return Array.isArray(data) ? data : data.data || [];
  },
  getById: async (id) => {
    const { data } = await client.get(`/canastos/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await client.post('/canastos/', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await client.patch(`/canastos/${id}`, payload);
    return data;
  },
  occupy: async (id, pedidoId) => {
    const { data } = await client.patch(`/canastos/${id}/ocupar`, { pedidoId });
    return data;
  },
  release: async (id) => {
    const { data } = await client.patch(`/canastos/${id}/liberar`);
    return data;
  },
};
