import apiClient from '@/lib/apiClient';

export const leetcodeService = {
  getQuestion: (titleSlug: string) => apiClient.get(`/leetcode/questions/${titleSlug}`),
};
