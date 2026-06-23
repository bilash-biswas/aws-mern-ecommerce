import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Use environment variable for base URL or fallback to local IP
const BASE_URL = 'http://192.168.10.235:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Add timeout to prevent hanging requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token:', error);
    }
    console.log('Request config:', config);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor - enhanced logging
api.interceptors.response.use(
  response => {
    console.log(`✅ API Response Success: ${response.status} ${response.config.url}`);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return response;
  },
  async error => {
    console.log('❌ API Response Error:');
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    
    if (error.response) {
      // The server responded with an error status
      console.log('Response status:', error.response.status);
      console.log('Response headers:', error.response.headers);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      
      // Extract the actual error message from backend
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          'Login failed';
      
      return Promise.reject(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      console.log('No response received. Request:', error.request);
      return Promise.reject('No response from server. Check if backend is running.');
    } else {
      // Something happened in setting up the request
      console.log('Request setup error:', error.message);
      return Promise.reject('Request setup failed: ' + error.message);
    }
  }
);

export default api;