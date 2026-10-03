import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('behaviorlock_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('behaviorlock_token');
      localStorage.removeItem('behaviorlock_user');
    }
    return Promise.reject(error);
  }
);

// Health check
export const checkHealth = async () => {
  const res = await api.get('/api/v1/health');
  return res.data;
};

// Phase 2 Authentication APIs
export const registerUser = async (data) => {
  const res = await api.post('/api/auth/register', data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post('/api/auth/login', data);
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get('/api/auth/me');
  return res.data;
};

// Phase 3 Dashboard APIs
export const getDashboardSummary = async () => {
  const res = await api.get('/api/dashboard/summary');
  return res.data;
};

export const getRiskHistory = async () => {
  const res = await api.get('/api/dashboard/risk-history');
  return res.data;
};

export const getRecentActivities = async () => {
  const res = await api.get('/api/activities/recent');
  return res.data;
};

export const getDevices = async () => {
  const res = await api.get('/api/devices');
  return res.data;
};

export const getAlerts = async () => {
  const res = await api.get('/api/alerts');
  return res.data;
};

export default api;
