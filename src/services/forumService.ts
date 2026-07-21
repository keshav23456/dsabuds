import apiClient from '@/lib/apiClient';

export const forumService = {
  getPosts: (filters: Record<string, unknown> = {}) => apiClient.get('/forum/posts', { params: filters }),
  getPost: (id: string) => apiClient.get(`/forum/posts/${id}`),
  createPost: (data: Record<string, unknown>) => apiClient.post('/forum/posts', data),
  updatePost: (id: string, data: Record<string, unknown>) => apiClient.patch(`/forum/posts/${id}`, data),
  votePost: (id: string, value: number) => apiClient.post(`/forum/posts/${id}/vote`, { value }),
  addComment: (id: string, data: Record<string, unknown>) => apiClient.post(`/forum/posts/${id}/comments`, data),
  deletePost: (id: string) => apiClient.delete(`/forum/posts/${id}`),
  deleteComment: (id: string) => apiClient.delete(`/forum/comments/${id}`),
};
