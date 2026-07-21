import apiClient from '@/lib/apiClient';

export const authService = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  register: (userData: Record<string, unknown>) => apiClient.post('/auth/signup', userData),
  logout: () => apiClient.post('/auth/logout'),
  verifyToken: () => apiClient.get('/auth/verify'),
};
