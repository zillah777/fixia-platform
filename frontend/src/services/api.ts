import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { SECURITY_CONFIG } from '@/types/security';

// Production security: Remove development hosts in production
const API_URL = process.env['NEXT_PUBLIC_API_URL'] || (
  process.env['NODE_ENV'] === 'production' 
    ? 'https://fixia-platform-production.up.railway.app' // Railway backend URL
    : 'http://localhost:5000' // Development fallback
);

// Debug log to verify environment variable is loaded (only in development)
if (process.env['NODE_ENV'] !== 'production') {
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
    // Fix for file uploads: Remove Content-Type header for FormData to allow browser to set multipart/form-data with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('📸 Removed Content-Type header for FormData upload');
    }
    
    // Safe localStorage access for SSR compatibility
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && typeof token === 'string' && token.length > 10) {
        // Validate token format before using it (JWT tokens have 3 parts separated by dots)
        if (token.split('.').length === 3) {
          config.headers.Authorization = `Bearer ${token}`;
          
          // Debug log for auth endpoints (always log for profile/photo)
          if (config.url?.includes('/profile/photo') || 
              (process.env['NODE_ENV'] !== 'production' && 
               (config.url?.includes('/dashboard/') || config.url?.includes('/profile')))) {
            console.log('🔐 Auth token added to request:', config.url, token.substring(0, 20) + '...');
            console.log('🔐 Headers after token:', Object.keys(config.headers || {}));
            
            // Special logging for FormData photo uploads
            if (config.url?.includes('/profile/photo') && config.data instanceof FormData) {
              console.log('📸 FormData photo upload detected');
              console.log('📸 FormData entries:');
              for (const [key, value] of config.data.entries()) {
                console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
              }
              console.log('📸 Content-Type header:', config.headers['Content-Type'] || 'not set (good for FormData)');
              console.log('📸 Authorization header set:', !!config.headers.Authorization);
            }
          }
        } else {
          // Invalid token format, remove it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('loginTime');
        }
      } else if (config.url?.includes('/profile/photo') || 
                 (process.env['NODE_ENV'] !== 'production' &&
                  (config.url?.includes('/dashboard/') || config.url?.includes('/profile')))) {
        console.warn('⚠️ No valid auth token found for protected endpoint:', config.url);
        console.warn('⚠️ Token details:', { 
          hasToken: !!token, 
          tokenType: typeof token, 
          tokenLength: token?.length 
        });
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
      
      // Check if user has token but server rejects it (JWT secret regeneration scenario)
      const hasStoredToken = localStorage.getItem('token');
      const isSecurityUpgrade = errorMessage.includes('Token de acceso requerido') && hasStoredToken;
      
      // Auto-logout for authentication errors (including after JWT secret regeneration)
      if (errorMessage.includes('Token expirado') || 
          errorMessage.includes('Token inválido') || 
          errorMessage.includes('Token revocado') ||
          errorMessage.includes('Usuario no encontrado') ||
          errorMessage.includes('Cuenta desactivada') ||
          isSecurityUpgrade) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');
        window.location.href = '/auth/login';
        
        // Specific message for JWT secret regeneration scenario
        if (isSecurityUpgrade) {
          toast.error('🔐 Sesión invalidada por mejoras de seguridad. Por favor, inicia sesión nuevamente.');
        } else {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
      } else {
        // For other 401 errors, just reject without auto-logout
        console.warn('401 error without auto-logout:', errorMessage);
        
        // Special debugging for photo upload 401 errors
        if (error.config?.url?.includes('/profile/photo')) {
          console.error('🚨 Photo upload 401 error details:', {
            url: error.config.url,
            method: error.config.method,
            hasAuthHeader: !!error.config.headers?.Authorization,
            contentType: error.config.headers?.['Content-Type'],
            errorMessage: errorMessage,
            requestData: error.config.data instanceof FormData ? 'FormData' : 'Other',
          });
        }
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