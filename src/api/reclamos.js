import client from './client.js';

export const reclamos = {
  getAll: async (filters = {}) => {
    const { data } = await client.get('/reclamos/', { params: filters });
    return Array.isArray(data) ? data : data.data || [];
  },
  getById: async (id) => {
    const { data } = await client.get(`/reclamos/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await client.post('/reclamos/', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await client.patch(`/reclamos/${id}`, payload);
    return data;
  },
  getMessages: async (reclamoId) => {
    const { data } = await client.get(`/reclamos/${reclamoId}/mensajes`);
    return Array.isArray(data) ? data : [];
  },
  addMessage: async (reclamoId, mensaje) => {
    const { data } = await client.post(`/reclamos/${reclamoId}/mensajes`, { mensaje });
    return data;
  },
};
