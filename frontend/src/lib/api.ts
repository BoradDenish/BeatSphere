import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
};

export const usersAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    api.get('/api/users', { params }),
  getById: (id: number) => api.get(`/api/users/${id}`),
  update: (id: number, data: any) => api.put(`/api/users/${id}`, data),
  delete: (id: number) => api.delete(`/api/users/${id}`),
};

export const mediaAPI = {
  getAll: (params?: any) => api.get('/api/media', { params }),
  getById: (id: number) => api.get(`/api/media/${id}`),
  getCategories: () => api.get('/api/media/categories'),
  create: (data: FormData) => api.post('/api/media', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  import: (data: any) => api.post('/api/media/import', data),
  update: (id: number, data: any) => api.put(`/api/media/${id}`, data),
  delete: (id: number) => api.delete(`/api/media/${id}`),
  incrementPlay: (id: number) => api.post(`/api/media/${id}/increment-play`),
};

export const subscriptionsAPI = {
  create: (data: { plan: string }) => api.post('/api/subscriptions', data),
  get: () => api.get('/api/subscriptions'),
  cancel: () => api.delete('/api/subscriptions'),
};

export const uploadAPI = {
  uploadFile: (data: FormData) => api.post('/api/upload/file', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadThumbnail: (data: FormData) => api.post('/api/upload/thumbnail', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  youtubeInfo: (data: { url: string }) => api.post('/api/upload/youtube/info', data),
  youtubeDownload: (data: { url: string; mediaType?: string }) => api.post('/api/upload/youtube/download', data),
};
