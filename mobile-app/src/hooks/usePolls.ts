// Polls hooks
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { PollResults } from '@/types/poll';

export function usePolls(eventId: string) {
  return useQuery({
    queryKey: ['polls', eventId],
    queryFn: () => api.getPolls(eventId),
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
  });
}

export function useCastVote() {
  return useMutation({
    mutationFn: ({ pollId, optionId }: { pollId: string; optionId: string }) => 
      api.castVote(pollId, optionId),
  });
}
