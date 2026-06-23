import axios from 'axios';

const API = axios.create({
  baseURL: typeof window === 'undefined'
    ? (process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api` : 'http://localhost:5000/api')
    : '/api',
});

// Add token to requests if available
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;