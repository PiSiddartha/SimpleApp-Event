// Materials hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { CreateMaterialInput } from '@/types/material';

export function useMaterials(eventId: string) {
  return useQuery({
    queryKey: ['materials', eventId],
    queryFn: () => api.getMaterials(eventId),
    enabled: !!eventId,
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMaterialInput) => api.createMaterial(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['materials', variables.event_id] });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

export function useDownloadUrl(materialId: string) {
  return useQuery({
    queryKey: ['materials', materialId, 'download'],
    queryFn: () => api.getDownloadUrl(materialId),
    enabled: !!materialId,
  });
}
