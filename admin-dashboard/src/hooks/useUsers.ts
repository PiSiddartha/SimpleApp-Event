import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { CreateAdminUserInput } from '@/types/user';

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.getAdminUsers(),
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminUserInput) => api.createAdminUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useUsers(group = 'Students') {
  return useQuery({
    queryKey: ['users', group],
    queryFn: () => api.getUsers(group),
  });
}

