import axios from 'axios';
import { store } from '../store';
import { refreshAuthToken, logout } from '../store/slices/authSlice';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const state = store.getState();
      const refreshToken = state.auth.refreshToken;
      
      if (refreshToken) {
        try {
          // Attempt to refresh the token
          await store.dispatch(refreshAuthToken());
          
          // Retry the original request with the new token
          const newState = store.getState();
          const newToken = newState.auth.token;
          
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          store.dispatch(logout());
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }
      } else {
        // No refresh token, logout user
        store.dispatch(logout());
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }
    
    return Promise.reject(error);
  }
); 