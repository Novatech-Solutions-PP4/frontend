import client from './client.js';

export const servicios = {
  getAll: async () => {
    const { data } = await client.get('/servicios/');
    return Array.isArray(data) ? data : data.data || [];
  },
  getById: async (id) => {
    const { data } = await client.get(`/servicios/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await client.post('/servicios/', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await client.patch(`/servicios/${id}`, payload);
    return data;
  },
  delete: async (id) => {
    await client.delete(`/servicios/${id}`);
  },
};
