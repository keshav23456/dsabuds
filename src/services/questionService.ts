import apiClient from '@/lib/apiClient';

export const questionService = {
  list: (params?: Record<string, unknown>) => apiClient.get('/questions', { params }),
  getById: (id: string) => apiClient.get(`/questions/${id}`),
  // "Last minute revision" — random set of questions (default 100)
  getRevision: (limit = 100) => apiClient.get('/questions/revision', { params: { limit } }),
  // Per-user solve status (backed by the user-questions endpoint)
  setStatus: (questionId: string, status: string) =>
    apiClient.put(`/user-questions/${questionId}`, { status }),
};
