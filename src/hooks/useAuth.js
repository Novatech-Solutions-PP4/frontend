import { useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '../api/auth.js';

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ dni, password, role }) => auth.login(dni, password, role), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }) });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: () => auth.logout(), onSuccess: () => queryClient.clear() });
}
