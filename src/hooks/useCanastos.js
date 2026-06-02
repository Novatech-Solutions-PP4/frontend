import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { canastos } from '../api/canastos.js';

export function useCanastos() {
  return useQuery({ queryKey: ['canastos'], queryFn: () => canastos.getAll(), staleTime: 2 * 60 * 1000 });
}

export function useCanastoById(id) {
  return useQuery({ queryKey: ['canasto', id], queryFn: () => canastos.getById(id), enabled: !!id });
}

export function useOccupyCanasto() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, pedidoId }) => canastos.occupy(id, pedidoId), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['canastos'] }) });
}

export function useReleaseCanasto() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id) => canastos.release(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['canastos'] }) });
}
