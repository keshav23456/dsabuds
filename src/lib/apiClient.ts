import axios from 'axios';
import { API_BASE_URL } from '@/config/constants';
import { useUserStore } from '@/store/useUserStore';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useUserStore.getState().setUser(null);

      if (typeof window !== 'undefined') {
        const isPublicPath =
          window.location.pathname === '/' ||
          window.location.pathname.startsWith('/about') ||
          window.location.pathname.startsWith('/contact') ||
          window.location.pathname.startsWith('/leaderboard') ||
          window.location.pathname.startsWith('/questions') ||
          window.location.pathname.startsWith('/profile');

        if (!isPublicPath) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
