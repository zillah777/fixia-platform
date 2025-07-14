import api from './api';
import { AuthUser, LoginCredentials, RegisterData, User, ApiResponse } from '@/types';

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await api.post<ApiResponse<AuthUser>>('/api/auth/login', credentials);
    const { user, token } = response.data.data;
    
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data.data;
  },

  // Register
  async register(data: RegisterData): Promise<AuthUser> {
    const response = await api.post<ApiResponse<AuthUser>>('/api/auth/register', data);
    const { user, token } = response.data.data;
    
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data.data;
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/api/auth/me');
    return response.data.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      // Even if API call fails, we still want to clear local storage
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    return null;
  },

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },

  // Update stored user
  updateStoredUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },
};