import api from './api';
import { AuthUser, LoginCredentials, RegisterData, User, ApiResponse } from '@/types';

// Safe localStorage wrapper for SSR compatibility
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await api.post<ApiResponse<AuthUser>>('/api/auth/login', credentials);
    const { user, token } = response.data.data;
    
    // Store in localStorage securely
    safeLocalStorage.setItem('token', token);
    safeLocalStorage.setItem('user', JSON.stringify(user));
    safeLocalStorage.setItem('loginTime', new Date().toISOString());
    
    // Also store token in cookie for middleware access
    if (typeof document !== 'undefined') {
      document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
    }
    
    return response.data.data;
  },

  // Register
  async register(data: RegisterData): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/api/auth/register', data);
    const responseData = response.data.data;
    
    // Check if email verification is required
    if (responseData.requiresVerification || responseData.emailVerificationRequired) {
      // Don't store token or user for unverified accounts
      return responseData;
    }
    
    // Normal registration flow (if verification not required)
    const { user, token } = responseData;
    if (token) {
      safeLocalStorage.setItem('token', token);
      safeLocalStorage.setItem('user', JSON.stringify(user));
      safeLocalStorage.setItem('loginTime', new Date().toISOString());
      
      // Also store token in cookie for middleware access
      if (typeof document !== 'undefined') {
        document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
      }
    }
    
    return responseData;
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/api/auth/me');
    return response.data.data;
  },

  // Logout with proper cleanup
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to revoke token on server
      await api.post('/api/auth/logout');
    } catch (error) {
      // Even if API call fails, we still want to clear local storage
      console.error('Logout API call failed:', error);
    } finally {
      // Clear all auth-related data
      safeLocalStorage.removeItem('token');
      safeLocalStorage.removeItem('user');
      safeLocalStorage.removeItem('loginTime');
      
      // Clear auth cookie
      if (typeof document !== 'undefined') {
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
      
      // Clear any cached API data
      if (api.defaults.headers.common.Authorization) {
        delete api.defaults.headers.common.Authorization;
      }
    }
  },

  // Check if user is authenticated with token validation
  isAuthenticated(): boolean {
    const token = safeLocalStorage.getItem('token');
    const user = safeLocalStorage.getItem('user');
    const loginTime = safeLocalStorage.getItem('loginTime');
    
    if (!token || !user || !loginTime) return false;
    
    // Check if token is not expired (7 days max)
    const loginDate = new Date(loginTime);
    const now = new Date();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    if (now.getTime() - loginDate.getTime() > maxAge) {
      // Token expired, clear storage
      this.logout();
      return false;
    }
    
    return true;
  },

  // Get stored user with validation
  getStoredUser(): User | null {
    const userStr = safeLocalStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Validate user object has required fields
        if (user && user.id && user.email) {
          return user;
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        safeLocalStorage.removeItem('user');
      }
    }
    return null;
  },

  // Get stored token
  getStoredToken(): string | null {
    return safeLocalStorage.getItem('token');
  },

  // Update stored user
  updateStoredUser(user: User): void {
    safeLocalStorage.setItem('user', JSON.stringify(user));
  },

  // Refresh token if needed
  async refreshToken(): Promise<boolean> {
    try {
      const response = await api.post<ApiResponse<{ token: string }>>('/api/auth/refresh');
      const { token } = response.data.data;
      safeLocalStorage.setItem('token', token);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return false;
    }
  },

  // Validate session
  async validateSession(): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) return false;
      
      const user = await this.getCurrentUser();
      if (user) {
        this.updateStoredUser(user);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Session validation failed:', error);
      
      // Only logout for auth-related errors, not network/server errors
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.error || '';
        if (errorMessage.includes('Token expirado') || 
            errorMessage.includes('Token inválido') || 
            errorMessage.includes('Token revocado') ||
            errorMessage.includes('Usuario no encontrado') ||
            errorMessage.includes('Cuenta desactivada')) {
          this.logout();
        }
      }
      
      return false;
    }
  },

  // Update profile
  async updateProfile(profileData: any): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/api/auth/profile', profileData);
    const updatedUser = response.data.data;
    this.updateStoredUser(updatedUser);
    return updatedUser;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
  }
};