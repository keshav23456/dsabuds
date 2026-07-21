import apiClient from '@/lib/apiClient';

export const collegeService = {
  getBranchesForEmail: (email?: string | null) =>
    apiClient.get('/colleges/branches', { params: email ? { email } : undefined }),
  getBranchCodeMap: () => apiClient.get('/colleges/branch-code-map'),
};
