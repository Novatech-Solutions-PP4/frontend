import client from './client.js';

export const insumos = {
  getAll: async () => {
    const { data } = await client.get('/insumos/');
    return Array.isArray(data) ? data : data.data || [];
  },
  getById: async (id) => {
    const { data } = await client.get(`/insumos/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await client.post('/insumos/', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await client.patch(`/insumos/${id}`, payload);
    return data;
  },
  delete: async (id) => {
    await client.delete(`/insumos/${id}`);
  },
};
