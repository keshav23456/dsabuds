import apiClient from '@/lib/apiClient';

export const companyService = {
  getCompanies: (filters?: Record<string, unknown>) => apiClient.get('/companies', { params: filters }),
  getCompanyBySlug: (slug: string) => apiClient.get(`/companies/${slug}`),
  getCompanyQuestions: (slug: string) => apiClient.get(`/companies/${slug}/questions`),
};
