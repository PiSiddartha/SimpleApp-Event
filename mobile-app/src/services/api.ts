// API service
import axios, { AxiosInstance, AxiosError } from 'axios';
import { authService } from './auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://ggszk3v52a.execute-api.ap-south-1.amazonaws.com';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Attach auth token to requests
    this.client.interceptors.request.use(async (config) => {
      const token = await authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle auth errors: clear storage and notify so navigator shows login
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const status = error.response?.status;
        if (status === 401) {
          await authService.clearStorage();
        }
        if (status === 403) {
          const data = error.response?.data as { error?: string; message?: string } | undefined;
          const message = `${data?.error ?? ''} ${data?.message ?? ''}`.toLowerCase();
          if (message.includes('required role') || message.includes('forbidden')) {
            await authService.clearStorage();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Events
  async getEvents() {
    const response = await this.client.get('/events');
    const raw = response.data;
    return Array.isArray(raw) ? raw : raw?.data ?? raw?.events ?? [];
  }

  async getEvent(id: string) {
    const response = await this.client.get(`/events/${id}`);
    return response.data;
  }

  // Attendance — backend route is POST /events/{event_id}/join
  async joinEvent(eventId: string) {
    const response = await this.client.post(`/events/${eventId}/join`);
    return response.data;
  }

  // Polls
  async getPolls(eventId: string) {
    const response = await this.client.get('/polls', { params: { event_id: eventId } });
    const raw = response.data;
    return Array.isArray(raw) ? raw : raw?.polls ?? raw?.data ?? [];
  }

  async getPoll(id: string) {
    const response = await this.client.get(`/polls/${id}`);
    return response.data;
  }

  async castVote(pollId: string, optionId: string) {
    const response = await this.client.post(`/polls/${pollId}/vote`, { option_id: optionId });
    return response.data;
  }

  async getPollResults(id: string) {
    const response = await this.client.get(`/polls/${id}/results`);
    const raw = response.data;
    return {
      ...raw,
      results: Array.isArray(raw?.results) ? raw.results : [],
    };
  }

  // Materials
  async getMaterials(eventId: string) {
    const response = await this.client.get('/materials', { params: { event_id: eventId } });
    const raw = response.data;
    return Array.isArray(raw) ? raw : raw?.materials ?? raw?.data ?? [];
  }

  async getDownloadUrl(materialId: string) {
    const response = await this.client.post(`/materials/${materialId}/download`);
    return response.data;
  }

  // Analytics
  async getEventAnalytics(eventId: string) {
    const response = await this.client.get(`/events/${eventId}/analytics`);
    return response.data;
  }
}

export const api = new ApiService();
export default api;
