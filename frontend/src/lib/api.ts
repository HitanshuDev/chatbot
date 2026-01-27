import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.message,
          code: error.code || 'UNKNOWN',
          statusCode: error.response?.status || 0,
        };
        return Promise.reject(apiError);
      }
    );
  }

  // Auth endpoints
  async signup(email: string, password: string, name: string) {
    const response = await this.client.post('/auth/signup', { email, password, name });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async googleLogin(token: string) {
    const response = await this.client.post('/auth/google', { token });
    return response.data;
  }

  async logout() {
    return this.client.post('/auth/logout');
  }

  async refreshToken() {
    const response = await this.client.post('/auth/refresh');
    return response.data;
  }

  // Bot endpoints
  async createBot(data: any) {
    const response = await this.client.post('/bots', data);
    return response.data;
  }

  async getBots() {
    const response = await this.client.get('/bots');
    console.log(response);
    return response.data;
  }

  async getBot(botId: string) {
    const response = await this.client.get(`/bots/${botId}`);
    return response.data;
  }

  async updateBot(botId: string, data: any) {
    const response = await this.client.patch(`/bots/${botId}`, data);
    return response.data;
  }

  async deleteBot(botId: string) {
    return this.client.delete(`/bots/${botId}`);
  }

  async getBotConfig(botId: string) {
    const response = await this.client.get(`/bots/${botId}/config`);
    return response.data;
  }

  // Conversation endpoints
  async createConversation(botId: string) {
    const response = await this.client.post(`/bots/${botId}/conversations`);
    return response.data;
  }

  async getConversations(botId: string) {
    const response = await this.client.get(`/bots/${botId}/conversations`);
    return response.data;
  }

  async getConversation(conversationId: string) {
    const response = await this.client.get(`/conversations/${conversationId}`);
    return response.data;
  }

  // Message endpoints
  async sendMessage(conversationId: string, content: string) {
    const response = await this.client.post(`/conversations/${conversationId}/messages`, {
      content,
    });
    return response.data;
  }

  async getMessages(conversationId: string) {
    const response = await this.client.get(`/conversations/${conversationId}/messages`);
    return response.data;
  }

  async deleteMessage(messageId: string) {
    return this.client.delete(`/messages/${messageId}`);
  }

  // Upload endpoints
  async uploadDocument(botId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(`/bots/${botId}/uploads`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getUploads(botId: string) {
    const response = await this.client.get(`/bots/${botId}/uploads`);
    return response.data;
  }

  async deleteUpload(botId: string, uploadId: string) {
    return this.client.delete(`/bots/${botId}/uploads/${uploadId}`);
  }

  async getUploadStatus(uploadId: string) {
    const response = await this.client.get(`/uploads/${uploadId}/status`);
    return response.data;
  }

  async searchEmbeddings(botId: string, query: string) {
    const response = await this.client.post(`/bots/${botId}/search`, { query });
    return response.data;
  }

  // Analytics endpoints
  async getUsage(botId: string) {
    const response = await this.client.get(`/bots/${botId}/usage`);
    return response.data;
  }

  async getMetrics(botId: string) {
    const response = await this.client.get(`/bots/${botId}/metrics`);
    return response.data;
  }

  // Widget endpoints
  async getWidgetScript(botId: string) {
    const response = await this.client.get(`/bots/${botId}/script.js`);
    return response.data;
  }

  async getWidgetConfig(botId: string) {
    const response = await this.client.get(`/bots/${botId}/config`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
