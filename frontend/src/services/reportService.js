import api from './api';

export const reportService = {
  dashboard: () => api.get('/reports/dashboard'),
};
