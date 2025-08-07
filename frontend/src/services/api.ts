import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { SECURITY_CONFIG } from '@/types/security';

// Production security: Remove development hosts in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || (
  process.env.NODE_ENV === 'production' 
    ? 'https://api.fixia.com.ar' // Production URL only
    : 'http://localhost:5000' // Development fallback
);

// Debug log to verify environment variable is loaded (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('🔗 API_URL configured as:', API_URL);
}

// Create axios instance with security headers
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
    'Cache-Control': 'no-cache', // Prevent caching sensitive data
  },
});

// Request interceptor to add auth token with validation
api.interceptors.request.use(
  (config) => {
    // Safe localStorage access for SSR compatibility
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && typeof token === 'string' && token.length > 10) {
        // Validate token format before using it
        if (/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]*$/.test(token)) {
          config.headers.Authorization = `Bearer ${token}`;
          
          // Debug log for auth endpoints (only in development)
          if (process.env.NODE_ENV !== 'production' && 
              (config.url?.includes('/dashboard/') || config.url?.includes('/profile'))) {
            console.log('🔐 Auth token added to request:', config.url, token.substring(0, 20) + '...');
          }
        } else {
          // Invalid token format, remove it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('loginTime');
        }
      } else if (process.env.NODE_ENV !== 'production' &&
                 (config.url?.includes('/dashboard/') || config.url?.includes('/profile'))) {
        console.warn('⚠️ No valid auth token found for protected endpoint:', config.url);
      }
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
          errorMessage.includes('Token de acceso requerido') ||
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

// Locality interface for type safety
interface ChubutLocality {
  readonly name: string;
  readonly region?: string;
  readonly population?: number;
}

interface LocalityApiResponse {
  readonly success: boolean;
  readonly data: ChubutLocality[];
}

// Localities service for Chubut province with secure types
export const apiLocalitiesService = {
  async getChubutLocalities(): Promise<ChubutLocality[]> {
    try {
      const response = await api.get<LocalityApiResponse>('/api/localities/chubut');
      
      // Validate response structure
      if (!response.data.success || !Array.isArray(response.data.data)) {
        throw new Error('Invalid API response format');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Chubut localities:', error);
      // Fallback to default localities if API fails (type-safe)
      return [
        { name: 'Rawson' }, { name: 'Trelew' }, { name: 'Puerto Madryn' },
        { name: 'Comodoro Rivadavia' }, { name: 'Esquel' }, { name: 'Gaiman' },
        { name: 'Dolavon' }, { name: 'Rada Tilly' }, { name: 'Trevelin' }
      ] as const;
    }
  },

  async getChubutLocalitiesByRegion(): Promise<Record<string, ChubutLocality[]>> {
    const response = await api.get<LocalityApiResponse & { data: Record<string, ChubutLocality[]> }>('/api/localities/chubut/by-region');
    
    if (!response.data.success) {
      throw new Error('Failed to fetch localities by region');
    }
    
    return response.data.data;
  },

  async searchChubutLocalities(query: string): Promise<ChubutLocality[]> {
    // Sanitize search query to prevent injection
    const sanitizedQuery = query.replace(/[<>]/g, '').trim();
    
    if (sanitizedQuery.length < 2) {
      return [];
    }
    
    if (sanitizedQuery.length > 50) {
      throw new Error('Search query too long');
    }
    
    const response = await api.get<LocalityApiResponse>('/api/localities/chubut/search', {
      params: { q: sanitizedQuery }
    });
    
    if (!response.data.success || !Array.isArray(response.data.data)) {
      throw new Error('Invalid search response format');
    }
    
    return response.data.data;
  },

  async validateChubutLocality(name: string): Promise<{ valid: boolean; locality?: ChubutLocality }> {
    // Sanitize locality name
    const sanitizedName = name.replace(/[<>]/g, '').trim();
    
    if (sanitizedName.length === 0) {
      return { valid: false };
    }
    
    if (sanitizedName.length > 100) {
      throw new Error('Locality name too long');
    }
    
    const response = await api.get<{
      success: boolean;
      data: { valid: boolean; locality?: ChubutLocality };
    }>(`/api/localities/chubut/validate/${encodeURIComponent(sanitizedName)}`);
    
    if (!response.data.success) {
      throw new Error('Failed to validate locality');
    }
    
    return response.data.data;
  }
};

export default api;