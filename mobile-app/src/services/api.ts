// API service
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.payintelli.com/v1';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token will be cleared by auth service
        }
        return Promise.reject(error);
      }
    );
  }

  // Events
  async getEvents() {
    const response = await this.client.get('/events');
    return response.data;
  }

  async getEvent(id: string) {
    const response = await this.client.get(`/events/${id}`);
    return response.data;
  }

  // Attendance
  async joinEvent(eventId: string) {
    const response = await this.client.post(`/attendance/join`, { event_id: eventId });
    return response.data;
  }

  // Polls
  async getPolls(eventId: string) {
    const response = await this.client.get('/polls', { params: { event_id: eventId } });
    return response.data;
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
    return response.data;
  }

  // Materials
  async getMaterials(eventId: string) {
    const response = await this.client.get('/materials', { params: { event_id: eventId } });
    return response.data;
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
