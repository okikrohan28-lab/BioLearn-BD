import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token when available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('biolearn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorResponse = {
      success: false,
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected network error occurred.',
      errors: error.response?.data?.errors || null,
    };
    return Promise.reject(errorResponse);
  }
);

export default api;
