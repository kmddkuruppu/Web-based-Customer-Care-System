import api from './api';

export const userService = {
  list: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  setStatus: (id, enabled) => api.patch(`/users/${id}/status`, { enabled }),
};
