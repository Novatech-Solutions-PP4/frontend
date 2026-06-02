import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movimientos } from '../api/movimientos.js';

export function useMovimientos(filters = {}) {
  return useQuery({ queryKey: ['movimientos', filters], queryFn: () => movimientos.getAll(filters) });
}

export function useCreateMovimiento() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload) => movimientos.create(payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['movimientos'] }); queryClient.invalidateQueries({ queryKey: ['stock-alertas'] }); } });
}

export function useStockAlertas() {
  return useQuery({ queryKey: ['stock-alertas'], queryFn: () => movimientos.getAlertas(), staleTime: 10 * 60 * 1000 });
}
