import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

interface AuthData {
  name?: string;
  email: string;
  password: string;
  googleId?: string;
  image?: string;
}

interface TransactionData {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: Date;
  recurring: boolean;
  frequency?: string | null;
  description?: string;
  paymentMethod?: string;
}

export const authAPI = {
  register: (data: AuthData) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  google: (data: AuthData) => api.post('/auth/google', data),
  me: () => api.get('/auth/me'),
};

export const transactionsAPI = {
  getAll: (params?: Record<string, string>) => api.get('/transactions', { params }),
  create: (data: TransactionData) => api.post('/transactions', data),
  update: (id: string, data: Partial<TransactionData>) => api.put(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
  getRecurring: () => api.get('/transactions/recurring'),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getWeekly: (weekOffset?: number) => api.get('/analytics/weekly', { params: { weekOffset } }),
  getMonthly: (monthOffset?: number) => api.get('/analytics/monthly', { params: { monthOffset } }),
};

export default api;
