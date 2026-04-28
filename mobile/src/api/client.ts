import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const manifest = (Constants.expoConfig || Constants.manifest) as any;
const baseURL = manifest?.extra?.apiBaseUrl || 'http://localhost:8000';

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  
  register: async (username: string, password: string, email?: string) => {
    const response = await api.post('/auth/register', {
      username,
      password,
      email,
    });
    return response.data;
  },
};

// Chat API
export const chatApi = {
  getHistory: async () => {
    const response = await api.get('/chat/');
    return response.data;
  },

  sendMessage: async (message: string) => {
    const response = await api.post('/chat/', { message });
    return response.data;
  },
};

// Appointments API
export const appointmentsApi = {
  getAll: async () => {
    const response = await api.get('/appointments/');
    return response.data;
  },

  create: async (data: {
    doctor_name: string;
    clinic_name: string;
    appointment_date: string;
    notes?: string;
  }) => {
    const response = await api.post('/appointments/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<{
    doctor_name: string;
    clinic_name: string;
    appointment_date: string;
    status: string;
    notes: string;
  }>) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
};

// Health Report API
export const healthReportApi = {
  getReport: async () => {
    const response = await api.get('/health-report/');
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/health-report/summary');
    return response.data;
  },

  addMetric: async (data: {
    metric_name: string;
    value: number;
    unit: string;
    recorded_at: string;
  }) => {
    const response = await api.post('/health-report/', data);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Users
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUser: async (id: number, data: Partial<{ is_active: boolean; is_admin: boolean }>) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Analytics
  getAnalytics: async (timeRange: string) => {
    const response = await api.get(`/admin/analytics?range=${timeRange}`);
    return response.data;
  },

  // Appointments
  getAppointments: async () => {
    const response = await api.get('/admin/appointments');
    return response.data;
  },

  updateAppointment: async (id: number, data: Partial<{ status: string }>) => {
    const response = await api.put(`/admin/appointments/${id}`, data);
    return response.data;
  },

  // Content
  getHealthContent: async () => {
    const response = await api.get('/admin/content');
    return response.data;
  },

  createContent: async (data: any) => {
    const response = await api.post('/admin/content', data);
    return response.data;
  },

  updateContent: async (id: number, data: any) => {
    const response = await api.put(`/admin/content/${id}`, data);
    return response.data;
  },

  deleteContent: async (id: number) => {
    const response = await api.delete(`/admin/content/${id}`);
    return response.data;
  },

  // System
  getSystemConfig: async () => {
    const response = await api.get('/admin/system/config');
    return response.data;
  },

  updateSystemConfig: async (data: any) => {
    const response = await api.put('/admin/system/config', data);
    return response.data;
  },

  clearCache: async () => {
    const response = await api.post('/admin/system/clear-cache');
    return response.data;
  },

  restartServer: async () => {
    const response = await api.post('/admin/system/restart');
    return response.data;
  },

  // Logs
  getLogs: async () => {
    const response = await api.get('/admin/logs');
    return response.data;
  },
};
