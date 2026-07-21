import apiClient from '@/lib/apiClient';

export const sheetService = {
  // List all published sheets (with the user's solvedCount when authed)
  getSheets: () => apiClient.get('/sheets'),
  // Full sheet with nested sections + problems, merged with user progress
  getSheetBySlug: (slug: string) => apiClient.get(`/sheets/${slug}`),
  // Upsert progress on a single sheet problem: { status?, starred?, note? }
  updateProgress: (problemId: string, payload: Record<string, unknown>) =>
    apiClient.put(`/sheets/problems/${problemId}/progress`, payload),
};
