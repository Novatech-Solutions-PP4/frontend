import client from './client.js';

export const pagos = {
  getAll: async (filters = {}) => {
    const { data } = await client.get('/pagos/', { params: filters });
    return Array.isArray(data) ? data : data.data || [];
  },
  getById: async (id) => {
    const { data } = await client.get(`/pagos/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await client.post('/pagos/', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await client.patch(`/pagos/${id}`, payload);
    return data;
  },
};
