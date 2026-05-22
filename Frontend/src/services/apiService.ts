import axios, { AxiosInstance } from 'axios';

// Get the Laravel API URL from environment variables
const LARAVEL_API_URL = import.meta.env.VITE_LARAVEL_API_URL || 'http://localhost:8000';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${LARAVEL_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if available
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── ROOM ENDPOINTS ────────────────────────────────────────
export const roomAPI = {
  getAll: () => axiosInstance.get('/rooms'),
  getById: (id: number) => axiosInstance.get(`/rooms/${id}`),
};

// ─── BOOKING ENDPOINTS ────────────────────────────────────────
export const bookingAPI = {
  getAll: () => axiosInstance.get('/bookings'),
  getById: (id: number) => axiosInstance.get(`/bookings/${id}`),
  create: (data: any) => axiosInstance.post('/bookings', data),
  update: (id: number, data: any) => axiosInstance.put(`/bookings/${id}`, data),
  delete: (id: number) => axiosInstance.delete(`/bookings/${id}`),
  checkAvailability: (roomId: number) => axiosInstance.get(`/bookings/check/${roomId}`),
};

// ─── AUTH ENDPOINTS ────────────────────────────────────────
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    axiosInstance.post('/auth/login', credentials),
  register: (userData: { name: string; email: string; password: string; password_confirmation: string }) =>
    axiosInstance.post('/auth/register', userData),
  logout: () => axiosInstance.post('/auth/logout'),
  getCurrentUser: () => axiosInstance.get('/auth/user'),
  forgotPassword: (email: string) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => axiosInstance.post('/auth/reset-password', data),
};

export default axiosInstance;
