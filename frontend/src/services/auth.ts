import api from './api';
import { AuthUser, LoginCredentials, RegisterData, User, ApiResponse } from '@/types';
import { 
  RawBackendUser, 
  isValidUser, 
  sanitizeTextInput,
  SecureProfileUpdateData,
  SECURITY_CONFIG 
} from '@/types/security';

// User type transformation for frontend with strict validation
const transformUserForFrontend = (user: RawBackendUser): User => {
  if (!user || !isValidUser(user)) {
    throw new Error('Invalid user data received from backend');
  }
  
  // Create transformed user with sanitized data
  const transformed: User = {
    id: user.id,
    first_name: sanitizeTextInput(user.first_name),
    last_name: sanitizeTextInput(user.last_name),
    email: user.email.toLowerCase().trim(),
    ...(user.phone && { phone: user.phone }),
    user_type: user.user_type === 'client' ? 'customer' : user.user_type as 'provider' | 'admin',
    ...(user.profile_image && { profile_image: user.profile_image }),
    ...(user.profile_image && { profile_photo_url: user.profile_image }), // Backwards compatibility
    ...(user.date_of_birth && { date_of_birth: user.date_of_birth }),
    ...(user.gender && { gender: user.gender }),
    ...(user.locality && { locality: sanitizeTextInput(user.locality) }),
    ...(user.address && { address: sanitizeTextInput(user.address) }),
    ...(user.bio && { bio: sanitizeTextInput(user.bio) }),
    verification_status: user.verification_status,
    email_verified: user.email_verified,
    ...(user.email_verified_at && { email_verified_at: user.email_verified_at }),
    is_active: user.is_active,
    ...(user.last_login && { last_login: user.last_login }),
    created_at: user.created_at,
    updated_at: user.updated_at,
    ...(user.subscription_plan && { subscription_plan: user.subscription_plan }),
  };
  
  return transformed;
};

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
    const response = await api.post<ApiResponse<{ user: RawBackendUser; token: string }>>('/api/auth/login', credentials);
    const { user, token } = response.data.data;
    
    // Transform user for frontend consistency
    const transformedUser = transformUserForFrontend(user);
    
    // Store in localStorage securely
    safeLocalStorage.setItem('token', token);
    safeLocalStorage.setItem('user', JSON.stringify(transformedUser));
    safeLocalStorage.setItem('loginTime', new Date().toISOString());
    
    // Store token in cookie for middleware access with Railway-compatible settings
    if (typeof document !== 'undefined') {
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = [
        `auth-token=${token}`,
        'path=/',
        `max-age=${7 * 24 * 60 * 60}`, // 7 days
        isProduction ? 'secure' : '', // Only secure in production
        'samesite=lax', // Changed from strict to lax for Railway compatibility
        isProduction ? 'domain=.vercel.app' : '' // Railway/Vercel domain compatibility
      ].filter(Boolean).join('; ');
      
      document.cookie = cookieOptions;
    }
    
    return { user: transformedUser, token };
  },

  // Register with secure type validation
  async register(data: RegisterData): Promise<{
    user?: User;
    token?: string;
    requiresVerification?: boolean;
    emailVerificationRequired?: boolean;
    message?: string;
  }> {
    interface RegisterResponse {
      user?: RawBackendUser;
      token?: string;
      requiresVerification?: boolean;
      emailVerificationRequired?: boolean;
      message?: string;
    }
    
    const response = await api.post<ApiResponse<RegisterResponse>>('/api/auth/register', data);
    const responseData = response.data.data;
    
    // Check if email verification is required
    if (responseData.requiresVerification || responseData.emailVerificationRequired) {
      // Don't store token or user for unverified accounts
      return {
        requiresVerification: responseData.requiresVerification ?? false,
        emailVerificationRequired: responseData.emailVerificationRequired ?? false,
        ...(responseData.message && { message: responseData.message })
      };
    }
    
    // Normal registration flow (if verification not required)
    if (responseData.user && responseData.token) {
      // Validate and transform user for frontend consistency
      const transformedUser = transformUserForFrontend(responseData.user);
      
      // Validate token format (basic check)
      if (typeof responseData.token !== 'string' || responseData.token.length < 20) {
        throw new Error('Invalid token format received');
      }
      
      safeLocalStorage.setItem('token', responseData.token);
      safeLocalStorage.setItem('user', JSON.stringify(transformedUser));
      safeLocalStorage.setItem('loginTime', new Date().toISOString());
      
      // Also store token in cookie for middleware access
      if (typeof document !== 'undefined') {
        document.cookie = `auth-token=${responseData.token}; path=/; max-age=${SECURITY_CONFIG.TOKEN.MAX_AGE_DAYS * 24 * 60 * 60}; secure; samesite=strict`;
      }
      
      return {
        user: transformedUser,
        token: responseData.token,
        ...(responseData.message && { message: responseData.message })
      };
    }
    
    // Transform any remaining user data
    return {
      ...(responseData.user && { user: transformUserForFrontend(responseData.user) }),
      ...(responseData.token && { token: responseData.token }),
      ...(responseData.requiresVerification !== undefined && { requiresVerification: responseData.requiresVerification }),
      ...(responseData.emailVerificationRequired !== undefined && { emailVerificationRequired: responseData.emailVerificationRequired }),
      ...(responseData.message && { message: responseData.message })
    };
  },

  // Get current user with validation and retry mechanism
  async getCurrentUser(retryCount = 0): Promise<User> {
    try {
      const response = await api.get<ApiResponse<RawBackendUser>>('/api/auth/me');
      return transformUserForFrontend(response.data.data);
    } catch (error: unknown) {
      // Retry logic for network/server errors
      if (retryCount < 2 && error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response: { status: number } };
        
        // Retry on 500, 502, 503, 504 (server errors)
        if ([500, 502, 503, 504].includes(httpError.response?.status)) {
          console.warn(`🔄 Retrying getCurrentUser due to ${httpError.response.status} error (attempt ${retryCount + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000)); // Exponential backoff
          return this.getCurrentUser(retryCount + 1);
        }
      }
      
      // Re-throw error if not retryable or max retries reached
      throw error;
    }
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
          return transformUserForFrontend(user);
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
    } catch (error: unknown) {
      console.error('Session validation failed:', error);
      
      // Type-safe error handling
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response: { status: number; data?: { error?: string } } };
        
        // Handle 500 errors differently - these are server issues, not auth issues
        if (httpError.response?.status === 500) {
          console.warn('🔐 Server error during session validation (500) - treating as network issue');
          // Return true to avoid logout on server errors - keep user session
          return true;
        }
        
        // Only logout for auth-related errors, not network/server errors
        if (httpError.response?.status === 401) {
          const errorMessage = httpError.response?.data?.error || '';
          const authErrorPatterns = [
            'Token expirado',
            'Token inválido', 
            'Token revocado',
            'Usuario no encontrado',
            'Cuenta desactivada'
          ];
          
          if (authErrorPatterns.some(pattern => errorMessage.includes(pattern))) {
            this.logout();
          }
        }
      }
      
      return false;
    }
  },

  // Update profile with secure validation
  async updateProfile(profileData: SecureProfileUpdateData): Promise<User> {
    // Validate profile data before sending
    const sanitizedData: SecureProfileUpdateData = {};
    
    if (profileData.first_name !== undefined) {
      sanitizedData.first_name = sanitizeTextInput(profileData.first_name);
      if (sanitizedData.first_name.length < 2 || sanitizedData.first_name.length > 100) {
        throw new Error('First name must be between 2 and 100 characters');
      }
    }
    
    if (profileData.last_name !== undefined) {
      sanitizedData.last_name = sanitizeTextInput(profileData.last_name);
      if (sanitizedData.last_name.length < 2 || sanitizedData.last_name.length > 100) {
        throw new Error('Last name must be between 2 and 100 characters');
      }
    }
    
    if (profileData.phone !== undefined) {
      sanitizedData.phone = profileData.phone.replace(/\D/g, ''); // Only digits
      if (sanitizedData.phone.length > 20) {
        throw new Error('Phone number too long');
      }
    }
    
    if (profileData.locality !== undefined) {
      sanitizedData.locality = sanitizeTextInput(profileData.locality);
    }
    
    if (profileData.address !== undefined) {
      sanitizedData.address = sanitizeTextInput(profileData.address);
    }
    
    if (profileData.bio !== undefined) {
      sanitizedData.bio = sanitizeTextInput(profileData.bio);
      if (sanitizedData.bio.length > 1000) {
        throw new Error('Bio must be less than 1000 characters');
      }
    }
    
    if (profileData.gender !== undefined) {
      sanitizedData.gender = profileData.gender;
    }
    
    if (profileData.date_of_birth !== undefined) {
      // Basic date format validation
      if (!/^\d{4}-\d{2}-\d{2}$/.test(profileData.date_of_birth)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD');
      }
      sanitizedData.date_of_birth = profileData.date_of_birth;
    }
    
    const response = await api.put<ApiResponse<RawBackendUser>>('/api/users/profile', sanitizedData);
    const transformedUser = transformUserForFrontend(response.data.data);
    
    // Preserve profile photo if not included in response
    const currentUser = this.getStoredUser();
    if (currentUser?.profile_photo_url && !transformedUser.profile_photo_url) {
      transformedUser.profile_photo_url = currentUser.profile_photo_url;
    }
    
    this.updateStoredUser(transformedUser);
    return transformedUser;
  },

  // Upload profile photo with enhanced error handling
  async uploadProfilePhoto(file: File): Promise<{ profile_photo_url: string }> {
    console.log('📸 Starting photo upload process...');
    
    // Validate file before upload
    if (!file) {
      throw new Error('No file provided for upload');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size too large. Maximum size is 5MB');
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed');
    }
    
    const formData = new FormData();
    formData.append('photo', file);
    
    console.log('📸 File validation passed:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    });
    
    // Get token manually as backup in case interceptor fails
    const token = safeLocalStorage.getItem('token');
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 Manual auth header added for photo upload:', token.substring(0, 20) + '...');
      
      // Validate token format
      if (token.split('.').length !== 3) {
        console.error('❌ Invalid JWT token format detected');
        throw new Error('Invalid authentication token. Please log in again.');
      }
    } else {
      console.error('❌ No token found in localStorage for photo upload');
      throw new Error('No authentication token found. Please log in again.');
    }
    
    try {
      console.log('📸 Sending photo upload request...');
      
      // Don't set Content-Type manually - let axios handle it automatically
      const response = await api.post('/api/users/profile/photo', formData, {
        headers,
        timeout: 60000, // 60 seconds for file upload
      });
      
      console.log('✅ Photo upload successful:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Photo upload failed:', error);
      
      // Enhanced error handling for photo uploads
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.error || 'Authentication failed';
        console.error('🚨 Authentication error during photo upload:', errorMessage);
        
        if (errorMessage.includes('Token de acceso requerido')) {
          throw new Error('Authentication token is missing. Please refresh the page and try again.');
        } else if (errorMessage.includes('Token expirado')) {
          throw new Error('Your session has expired. Please log in again.');
        } else {
          throw new Error('Authentication failed. Please try logging in again.');
        }
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || 'Bad request';
        throw new Error(errorMessage);
      } else if (error.response?.status === 413) {
        throw new Error('File too large. Please choose a smaller image.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timed out. Please try again with a smaller file.');
      } else if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your connection and try again.');
      } else {
        throw new Error('Upload failed. Please try again later.');
      }
    }
  },

  // Remove profile photo
  async removeProfilePhoto(): Promise<void> {
    await api.delete('/api/users/profile/photo');
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
  }
};