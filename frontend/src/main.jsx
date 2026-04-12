import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'
import './styles/mobile.css'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://gitawisdom.onrender.com/api';

// Interceptor to ensure app api key is set natively if missing in env
axios.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_APP_API_KEY || 'Gita@2026';
  config.headers['x-api-key'] = apiKey;
  return config;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
