import api from './api';

export const ticketService = {
  create: (formData) => api.post('/tickets', formData),
  get: (id) => api.get(`/tickets/${id}`),
  my: () => api.get('/tickets/my'),
  all: (params) => api.get('/tickets', { params }),
  assigned: () => api.get('/tickets', { params: { assignedToMe: true } }),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tickets/${id}/status`, { status }),
  assign: (id, agentId) => api.patch(`/tickets/${id}/assign`, { agentId }),
  setPriority: (id, priority) => api.patch(`/tickets/${id}/priority`, { priority }),
  escalate: (id, reason) => api.patch(`/tickets/${id}/escalate`, { reason }),
  resolve: (id, resolution) => api.patch(`/tickets/${id}/resolve`, { resolution }),
  close: (id) => api.patch(`/tickets/${id}/close`),
  archive: (id) => api.patch(`/tickets/${id}/archive`),
  addResponse: (id, message) => api.post(`/tickets/${id}/responses`, { message }),
  getResponses: (id) => api.get(`/tickets/${id}/responses`),
  addNote: (id, note) => api.post(`/tickets/${id}/notes`, { note }),
  feedback: (id, data) => api.post(`/tickets/${id}/feedback`, data),
};
