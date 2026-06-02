import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insumos } from '../api/insumos.js';

export function useInsumos() {
  return useQuery({ queryKey: ['insumos'], queryFn: () => insumos.getAll(), staleTime: 5 * 60 * 1000 });
}

export function useInsumoById(id) {
  return useQuery({ queryKey: ['insumo', id], queryFn: () => insumos.getById(id), enabled: !!id });
}

export function useCreateInsumo() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload) => insumos.create(payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insumos'] }) });
}

export function useUpdateInsumo() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }) => insumos.update(id, payload), onSuccess: (_, { id }) => { queryClient.invalidateQueries({ queryKey: ['insumos'] }); queryClient.invalidateQueries({ queryKey: ['insumo', id] }); } });
}

export function useDeleteInsumo() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id) => insumos.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insumos'] }) });
}
