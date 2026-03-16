// Courses hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Course, CreateCourseInput } from '@/types/course';

export function useCourses(params?: { status?: string; full?: string }) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => api.getCourses(params),
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => api.getCourse(id),
    enabled: !!id,
  });
}

export function useCourseRegistrations(courseId: string, params?: { status?: string }) {
  return useQuery({
    queryKey: ['courses', courseId, 'registrations', params],
    queryFn: () => api.getCourseRegistrations(courseId, params),
    enabled: !!courseId,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCourseInput) => api.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> & Record<string, unknown> }) =>
      api.updateCourse(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', id] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
