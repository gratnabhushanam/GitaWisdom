export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  API_KEY: String(import.meta.env.VITE_APP_API_KEY || import.meta.env.VITE_PERMANENT_API_KEY || '').trim(),
};

export const API_ORIGIN = ENV.API_BASE_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8888` : 'http://localhost:8888');
