import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Debug log to verify environment variable is loaded
console.log('🔗 API_URL configured as:', API_URL);

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only auto-logout for specific 401 errors, not all of them
      const errorMessage = (error.response?.data as { error?: string })?.error || '';
      
      // Auto-logout only for these specific errors
      if (errorMessage.includes('Token expirado') || 
          errorMessage.includes('Token inválido') || 
          errorMessage.includes('Token revocado') ||
          errorMessage.includes('Usuario no encontrado') ||
          errorMessage.includes('Cuenta desactivada')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');
        window.location.href = '/auth/login';
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else {
        // For other 401 errors, just reject without auto-logout
        console.warn('401 error without auto-logout:', errorMessage);
      }
    } else if (error.response?.status === 403) {
      toast.error('No tienes permisos para realizar esta acción.');
    } else if (error.response?.status === 404) {
      // Only show 404 toasts for critical endpoints, not all API calls
      console.warn('404 error:', error.config?.url);
    } else if (error.response?.status && error.response.status >= 500) {
      toast.error('Error del servidor. Intenta de nuevo más tarde.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('La solicitud tardó demasiado. Verifica tu conexión.');
    } else if (!navigator.onLine) {
      toast.error('Sin conexión a internet. Verifica tu conexión.');
    }

    return Promise.reject(error);
  }
);

// Localities service for Chubut province
export const apiLocalitiesService = {
  async getChubutLocalities(): Promise<any[]> {
    try {
      const response = await api.get('/api/localities/chubut');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Chubut localities:', error);
      // Fallback to default localities if API fails
      return [
        { name: 'Rawson' }, { name: 'Trelew' }, { name: 'Puerto Madryn' },
        { name: 'Comodoro Rivadavia' }, { name: 'Esquel' }, { name: 'Gaiman' },
        { name: 'Dolavon' }, { name: 'Rada Tilly' }, { name: 'Trevelin' }
      ];
    }
  },

  async getChubutLocalitiesByRegion() {
    const response = await api.get('/api/localities/chubut/by-region');
    return response.data.data;
  },

  async searchChubutLocalities(query: string) {
    const response = await api.get('/api/localities/chubut/search', {
      params: { q: query }
    });
    return response.data.data;
  },

  async validateChubutLocality(name: string) {
    const response = await api.get(`/api/localities/chubut/validate/${encodeURIComponent(name)}`);
    return response.data.data;
  }
};

export default api;