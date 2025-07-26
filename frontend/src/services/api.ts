import axios from 'axios';

// Use environment variable for API URL, fallback to production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-f7cm.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // User is not authenticated or blocked
      const errorData = error.response.data;
      if (errorData.redirect === '/login') {
        // Show notification before redirect
        if (errorData.error === 'Account is blocked') {
          alert('Your account has been blocked. You will be redirected to the login page.');
        } else if (errorData.error === 'User not found') {
          alert('Your account no longer exists. You will be redirected to the login page.');
        } else {
          alert('Authentication required. You will be redirected to the login page.');
        }
        
        // Clear any stored auth state and redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        
        return Promise.reject({
          ...error,
          isAuthError: true,
          message: errorData.error || 'Authentication required'
        });
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'blocked';
  last_login: string | null;
  registration_time: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    status: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: 'Network error occurred' };
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: 'Network error occurred' };
    }
  },

  logout: async (): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: 'Network error occurred' };
    }
  },

  checkAuth: async (): Promise<AuthResponse> => {
    try {
      const response = await api.get('/auth/check');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: 'Network error occurred' };
    }
  },
};

// Users API
export const usersAPI = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: 'Network error occurred' };
    }
  },

  blockUsers: async (userIds: number[]): Promise<ApiResponse> => {
    try {
      const response = await api.post('/users/block', { userIds });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: 'Network error occurred' };
    }
  },

  unblockUsers: async (userIds: number[]): Promise<ApiResponse> => {
    try {
      const response = await api.post('/users/unblock', { userIds });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: 'Network error occurred' };
    }
  },

  deleteUsers: async (userIds: number[]): Promise<ApiResponse> => {
    try {
      const response = await api.post('/users/delete', { userIds });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: 'Network error occurred' };
    }
  },
};

export default api;