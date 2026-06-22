import api from './api'

export const reportService = {
  /** Intern submits a weekly report */
  submitReport: (data: { goal: string; content: string; highlights?: string; blockers?: string; nextWeekPlan?: string; attachments?: string[] }) =>
    api.post('/reports', data),

  /** Upload an attachment */
  uploadAttachment: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/attachments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** Intern's own report history */
  getMyReports: () => api.get('/reports/mine'),

  /** Manager's pending review queue */
  getReviewQueue: () => api.get('/reports/queue'),

  /** Get single report */
  getReportById: (id: string) => api.get(`/reports/${id}`),

  /** Manager reviews (approve/reject) a report */
  reviewReport: (id: string, data: { status: string; score: number; managerFeedback: string }) =>
    api.patch(`/reports/${id}/review`, data),

  /** AI summarize a report */
  summarizeReport: (id: string) => api.post(`/reports/${id}/summarize`),
}
