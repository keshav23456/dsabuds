import apiClient from '@/lib/apiClient';

export const activityService = {
  getAnalytics: (params?: Record<string, unknown>) =>
    apiClient.get('/daily-activity/analytics', { params }),
};
