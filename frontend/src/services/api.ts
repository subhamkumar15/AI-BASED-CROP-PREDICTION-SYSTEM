import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agrisense_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired or unauthorized
      if (window.location.pathname !== '/login') {
        // Soft clear
        // localStorage.removeItem('agrisense_token');
      }
    }
    return Promise.reject(error);
  }
);

// --- AUTH API ---
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.access_token) {
      localStorage.setItem('agrisense_token', res.data.access_token);
      localStorage.setItem('agrisense_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  register: async (userData: { email: string; password: string; full_name: string; role?: string; region?: string; phone?: string }) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.access_token) {
      localStorage.setItem('agrisense_token', res.data.access_token);
      localStorage.setItem('agrisense_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateProfile: async (data: { full_name: string; phone?: string; region?: string }) => {
    const res = await api.put('/auth/profile', null, { params: data });
    return res.data;
  },
  upgradePlan: async (planId: string) => {
    const res = await api.post('/auth/upgrade-plan', { plan_id: planId });
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('agrisense_token');
    localStorage.removeItem('agrisense_user');
  }
};

// --- PREDICTION API ---
export const predictApi = {
  recommend: async (formData: any) => {
    const res = await api.post('/predict/recommend', formData);
    return res.data;
  },
  getPresets: async () => {
    const res = await api.get('/predict/presets');
    return res.data;
  },
  getCropsList: async () => {
    const res = await api.get('/predict/crops-list');
    return res.data;
  }
};

// --- WEATHER API ---
export const weatherApi = {
  getLiveWeather: async (lat: number, lon: number, locationName?: string) => {
    const res = await api.get('/weather/live', {
      params: { lat, lon, location: locationName }
    });
    return res.data;
  },
  searchLocation: async (query: string) => {
    const res = await api.get('/weather/search', {
      params: { query }
    });
    return res.data;
  },
  getRegions: async () => {
    const res = await api.get('/weather/regions');
    return res.data;
  }
};

// --- SOIL HEALTH API ---
export const soilApi = {
  analyzeSoil: async (data: { N: number; P: number; K: number; ph: number; soil_moisture?: number; soil_type?: string }) => {
    const res = await api.post('/soil/analyze', data);
    return res.data;
  }
};

// --- PEST DETECTION API ---
export const pestApi = {
  detectPest: async (imageFile: File) => {
    const form = new FormData();
    form.append('file', imageFile);
    const res = await api.post('/pest/detect', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  getDiseases: async () => {
    const res = await api.get('/pest/diseases');
    return res.data;
  }
};

// --- PREDICTION HISTORY API ---
export const historyApi = {
  getHistory: async () => {
    const res = await api.get('/history');
    return res.data;
  },
  getDetail: async (id: number) => {
    const res = await api.get(`/history/${id}`);
    return res.data;
  },
  deleteItem: async (id: number) => {
    const res = await api.delete(`/history/${id}`);
    return res.data;
  },
  downloadPDFUrl: (id: number) => `${API_BASE_URL}/history/${id}/pdf`
};

// --- ADMIN API ---
export const adminApi = {
  getStats: async () => {
    const res = await api.get('/admin/system-stats');
    return res.data;
  },
  getModelMetrics: async () => {
    const res = await api.get('/admin/model-metrics');
    return res.data;
  },
  trainModel: async () => {
    const res = await api.post('/admin/train-model');
    return res.data;
  },
  uploadDataset: async (csvFile: File) => {
    const form = new FormData();
    form.append('file', csvFile);
    const res = await api.post('/admin/upload-dataset', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  updateRole: async (userId: number, role: string) => {
    const res = await api.put(`/admin/users/${userId}/role`, null, { params: { role } });
    return res.data;
  },
  getAuditLogs: async () => {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  }
};

// --- CHAT API ---
export const chatApi = {
  sendMessage: async (message: string, farmContext?: any) => {
    const res = await api.post('/chat/message', {
      message,
      farm_context: farmContext
    });
    return res.data;
  }
};
