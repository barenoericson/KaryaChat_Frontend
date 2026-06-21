import { apiClient } from './api.client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatPayload {
  message: string;
  history: { role: 'user' | 'assistant'; content: string }[];
}

export interface ChatResponse {
  reply: string;
  guestRemaining?: number;
}

export const aiService = {
  teacherChat: async (payload: ChatPayload): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>('/ai/teacher', payload);
    return data;
  },

  studentChat: async (payload: ChatPayload): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>('/ai/student', payload);
    return data;
  },

  guestChat: async (payload: ChatPayload): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>('/ai/guest', payload);
    return data;
  },
};
