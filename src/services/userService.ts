import apiClient from '@/lib/apiClient';

export const userService = {
  getProfile: () => apiClient.get('/auth/me'),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data: Record<string, unknown>) => apiClient.patch('/users/me', data),
  getLeaderboard: (filters?: Record<string, unknown>) => apiClient.get('/users/leaderboard', { params: filters }),
  getUserByUserName: (userName: string) => apiClient.get(`/users/${userName}`),
};
