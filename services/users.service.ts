import { apiClient } from './api.client';
import { API_BASE_URL } from '../constants/api';
import { AuthUser } from '../types/auth.types';

export function avatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
}

export const usersService = {
  async getProfile(userId: string): Promise<AuthUser> {
    const res = await apiClient.get<AuthUser>(`/users/profile/${userId}`);
    return res.data;
  },

  async updateProfile(data: { username?: string; bio?: string }): Promise<AuthUser> {
    const res = await apiClient.patch<AuthUser>('/users/profile', data);
    return res.data;
  },

  async uploadAvatar(imageUri: string): Promise<{ avatar: string; user: AuthUser }> {
    const filename = imageUri.split('/').pop() ?? 'avatar.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
    const type = mimeMap[ext] ?? 'image/jpeg';

    const form = new FormData();
    form.append('avatar', { uri: imageUri, name: filename, type } as any);

    const res = await apiClient.post<{ avatar: string; user: AuthUser }>('/users/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
