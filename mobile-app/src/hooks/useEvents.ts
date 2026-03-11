// Events hooks
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Event, EventAnalytics } from '@/types/event';

export function useEvents(visibility?: 'global' | 'private') {
  return useQuery({
    queryKey: ['events', visibility],
    queryFn: () => api.getEvents(visibility ? { visibility } : undefined),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => api.getEvent(id),
    enabled: !!id,
  });
}

export function useEventAnalytics(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId, 'analytics'],
    queryFn: () => api.getEventAnalytics(eventId),
    enabled: !!eventId,
  });
}

export function useJoinEvent() {
  return useMutation({
    mutationFn: (eventId: string) => api.joinEvent(eventId),
  });
}
