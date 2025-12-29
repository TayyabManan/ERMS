import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_URL = '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interface ApiErrorResponse {
  message: string;
  error?: {
    code: string;
    details?: { field: string; message: string }[];
  };
}

// Token refresh state to prevent multiple concurrent refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  isRefreshing = false;
  refreshSubscribers = [];
  window.location.href = '/login';
};

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        isRefreshing = false;
        onTokenRefreshed(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed - clear tokens and redirect to login
        clearAuthAndRedirect();
        return Promise.reject(error);
      }
    }

    // Show error toast for other errors
    if (error.response?.status !== 401) {
      const data = error.response?.data;

      // Check for validation errors with details
      if (data?.error?.details && data.error.details.length > 0) {
        // Show each validation error
        data.error.details.forEach((detail) => {
          toast.error(`${detail.field}: ${detail.message}`);
        });
      } else {
        // Show generic error message
        toast.error(data?.message || 'An error occurred');
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// User API
export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: { firstName?: string; lastName?: string; profileImage?: string | null }) =>
    api.patch('/users/me', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/users/me/password', data),
  deleteAccount: () => api.delete('/users/me'),
};

// Resource API
export const resourceApi = {
  getAll: (params?: { category?: string; search?: string; available?: boolean; page?: number; limit?: number }) =>
    api.get('/resources', { params }),
  getById: (id: string) => api.get(`/resources/${id}`),
  getCategories: () => api.get('/resources/categories'),
  create: (data: { name: string; description?: string; category: string; capacity?: number; location?: string; isAvailable?: boolean }) =>
    api.post('/resources', data),
  update: (id: string, data: Partial<{ name: string; description: string | null; category: string; capacity: number | null; location: string | null; isAvailable: boolean }>) =>
    api.patch(`/resources/${id}`, data),
  delete: (id: string) => api.delete(`/resources/${id}`),
};

// Booking API
export const bookingApi = {
  getMyBookings: (params?: { status?: string; resourceId?: string; page?: number; limit?: number }) =>
    api.get('/bookings', { params }),
  getById: (id: string) => api.get(`/bookings/${id}`),
  create: (data: { resourceId: string; title: string; description?: string; startTime: string; endTime: string }) =>
    api.post('/bookings', data),
  update: (id: string, data: Partial<{ title: string; description: string | null; startTime: string; endTime: string }>) =>
    api.patch(`/bookings/${id}`, data),
  cancel: (id: string) => api.delete(`/bookings/${id}`),
};

// Admin API
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/users', { params }),
  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  blockUser: (id: string, isBlocked: boolean) =>
    api.patch(`/admin/users/${id}/block`, { isBlocked }),
  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }),
  getAllBookings: (params?: { status?: string; resourceId?: string; page?: number; limit?: number }) =>
    api.get('/admin/bookings', { params }),
  approveBooking: (id: string, adminNotes?: string) =>
    api.patch(`/admin/bookings/${id}/approve`, { adminNotes }),
  rejectBooking: (id: string, adminNotes?: string) =>
    api.patch(`/admin/bookings/${id}/reject`, { adminNotes }),
};
