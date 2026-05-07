import axios from 'axios';
import { ENV } from '../config/env';

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(ENV.API_KEY ? { 'x-api-key': ENV.API_KEY } : {})
  }
});

// For authenticated requests
export const authApiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(ENV.API_KEY ? { 'x-api-key': ENV.API_KEY } : {})
  }
});

authApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
