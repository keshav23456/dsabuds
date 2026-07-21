import apiClient from '@/lib/apiClient';

export const platformService = {
  getConnections: () => apiClient.get('/platform-connections'),
  getAll: () => apiClient.get('/platform-connections'),
  updateConnection: (platform: string, data: Record<string, unknown>) =>
    apiClient.put(`/platform-connections/${platform.toUpperCase()}`, data),
  deleteConnection: (platform: string) => apiClient.delete(`/platform-connections/${platform.toUpperCase()}`),
  syncConnection: (platform: string) => apiClient.post(`/platform-connections/${platform.toUpperCase()}/sync`),
};
