import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicios } from '../api/servicios.js';

export function useServicios() {
  return useQuery({ queryKey: ['servicios'], queryFn: () => servicios.getAll(), staleTime: 5 * 60 * 1000 });
}

export function useServicioById(id) {
  return useQuery({ queryKey: ['servicio', id], queryFn: () => servicios.getById(id), enabled: !!id });
}

export function useCreateServicio() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload) => servicios.create(payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['servicios'] }) });
}

export function useUpdateServicio() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }) => servicios.update(id, payload), onSuccess: (_, { id }) => { queryClient.invalidateQueries({ queryKey: ['servicios'] }); queryClient.invalidateQueries({ queryKey: ['servicio', id] }); } });
}

export function useDeleteServicio() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id) => servicios.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['servicios'] }) });
}
