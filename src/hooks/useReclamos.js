import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reclamos } from '../api/reclamos.js';

export function useReclamos(filters = {}) {
  return useQuery({ queryKey: ['reclamos', filters], queryFn: () => reclamos.getAll(filters) });
}

export function useReclamoById(id) {
  return useQuery({ queryKey: ['reclamo', id], queryFn: () => reclamos.getById(id), enabled: !!id });
}

export function useCreateReclamo() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload) => reclamos.create(payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reclamos'] }) });
}

export function useReclamoMessages(reclamoId) {
  return useQuery({ queryKey: ['reclamo-messages', reclamoId], queryFn: () => reclamos.getMessages(reclamoId), enabled: !!reclamoId });
}

export function useAddReclamoMessage() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ reclamoId, mensaje }) => reclamos.addMessage(reclamoId, mensaje), onSuccess: (_, { reclamoId }) => queryClient.invalidateQueries({ queryKey: ['reclamo-messages', reclamoId] }) });
}
