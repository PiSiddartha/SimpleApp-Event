// Materials hooks
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useMaterials(eventId: string) {
  return useQuery({
    queryKey: ['materials', eventId],
    queryFn: () => api.getMaterials(eventId),
    enabled: !!eventId,
  });
}

export function useDownloadUrl(materialId: string) {
  return useQuery({
    queryKey: ['materials', materialId, 'download'],
    queryFn: () => api.getDownloadUrl(materialId),
    enabled: !!materialId,
  });
}
