// Polls hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { CreatePollInput, PollResults } from '@/types/poll';

export function usePolls(eventId?: string) {
  return useQuery({
    queryKey: ['polls', eventId],
    queryFn: () => api.getPolls(eventId!),
    enabled: !!eventId,
  });
}

export function usePoll(id: string) {
  return useQuery({
    queryKey: ['polls', id],
    queryFn: () => api.getPoll(id),
    enabled: !!id,
  });
}

export function usePollResults(pollId: string) {
  return useQuery({
    queryKey: ['polls', pollId, 'results'],
    queryFn: () => api.getPollResults(pollId),
    enabled: !!pollId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePollInput) => api.createPoll(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['polls', variables.event_id] });
    },
  });
}
