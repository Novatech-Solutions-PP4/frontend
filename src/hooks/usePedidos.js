import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pedidos } from '../api/pedidos.js';

export function usePedidos(filters = {}) {
  return useQuery({ queryKey: ['pedidos', filters], queryFn: () => pedidos.getAll(filters), staleTime: 2 * 60 * 1000 });
}

export function usePedidoById(id) {
  return useQuery({ queryKey: ['pedido', id], queryFn: () => pedidos.getById(id), enabled: !!id });
}

export function useCreatePedido() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload) => pedidos.create(payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pedidos'] }) });
}

export function useUpdatePedido() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }) => pedidos.update(id, payload), onSuccess: (_, { id }) => { queryClient.invalidateQueries({ queryKey: ['pedidos'] }); queryClient.invalidateQueries({ queryKey: ['pedido', id] }); } });
}

export function useUpdatePedidoStatus() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }) => pedidos.updateStatus(id, status), onSuccess: (_, { id }) => { queryClient.invalidateQueries({ queryKey: ['pedidos'] }); queryClient.invalidateQueries({ queryKey: ['pedido', id] }); } });
}

export function useUpdatePedidoPayment() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, paid }) => pedidos.updatePayment(id, paid), onSuccess: (_, { id }) => { queryClient.invalidateQueries({ queryKey: ['pedidos'] }); queryClient.invalidateQueries({ queryKey: ['pedido', id] }); } });
}

export function usePedidoHistory(id) {
  return useQuery({ queryKey: ['pedido-history', id], queryFn: () => pedidos.getHistory(id), enabled: !!id });
}
