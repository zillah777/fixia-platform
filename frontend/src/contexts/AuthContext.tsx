import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { authService } from '@/services/auth';
import { User, LoginCredentials, RegisterData } from '@/types';
import { SecureProfileUpdateData } from '@/types/security';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  updateProfile: (profileData: SecureProfileUpdateData) => Promise<void>;
  uploadProfilePhoto: (file: File) => Promise<string>;
  removeProfilePhoto: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Detectar cuando estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize auth state with improved session persistence
  useEffect(() => {
    if (!isClient) return; // Solo ejecutar en el cliente
    
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            // Establecer usuario inmediatamente para evitar flashing
            setUser(storedUser);
            setLoading(false);
            
            // Enterprise-grade session validation with graceful error handling
            setTimeout(async () => {
              try {
                // Only validate session if user is not currently performing profile operations
                const isValidSession = await authService.validateSession();
                if (!isValidSession) {
                  // Check if we have a valid token before logging out
                  const token = authService.getStoredToken();
                  const storedUser = authService.getStoredUser();
                  
                  // Only logout if token is actually invalid, not just network issues
                  if (!token || !storedUser) {
                    console.warn('🔐 Session validation failed - no valid token/user found');
                    handleLogout();
                  } else {
                    console.warn('🔐 Session validation failed but token exists - treating as network issue');
                    // Schedule a retry validation in 30 seconds
                    setTimeout(async () => {
                      try {
                        const retryValidation = await authService.validateSession();
                        if (!retryValidation) {
                          console.warn('🔐 Retry validation also failed - checking token validity');
                          // Double-check token before forcing logout
                          if (!authService.getStoredToken()) {
                            handleLogout();
                          }
                        }
                      } catch (retryError) {
                        console.warn('🔐 Retry validation error (ignoring):', retryError);
                      }
                    }, 30000);
                  }
                }
              } catch (error) {
                console.warn('🔐 Session validation error (non-critical):', error);
                // Don't auto-logout on validation errors - could be network issues
              }
            }, 2000); // Increased delay to prevent race conditions with profile operations
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [isClient]);

  // Session validation on page focus - disabled to prevent auto-logout issues
  // useEffect(() => {
  //   if (!isClient) return;
  //   
  //   const handleFocus = async () => {
  //     if (user && authService.isAuthenticated()) {
  //       const isValidSession = await authService.validateSession();
  //       if (!isValidSession) {
  //         handleLogout();
  //       }
  //     }
  //   };

  //   window.addEventListener('focus', handleFocus);
  //   return () => window.removeEventListener('focus', handleFocus);
  // }, [user, isClient]);

  // Helper function for clean logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Sesión cerrada exitosamente');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if logout fails
      setUser(null);
      router.push('/');
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const authData = await authService.login(credentials);
      
      // Convert undefined to null for setUser compatibility
      const user = authData.user ?? null;
      setUser(user);
      
      if (user) {
        toast.success(`¡Bienvenido, ${user.first_name}!`);
        
        // Longer delay to ensure state is updated and prevent redirect loops
        setTimeout(() => {
          // Redirect based on user type
          if (user.user_type === 'provider') {
            router.push('/as/dashboard');
          } else {
            router.push('/explorador/dashboard');
          }
        }, 300);
      } else {
        toast.error('Error: No se pudo obtener información del usuario');
      }
    } catch (error: unknown) {
      const message = (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data &&
        typeof error.response.data.error === 'string') ? error.response.data.error : 'Error al iniciar sesión';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const authData = await authService.register(data);
      
      // Check if email verification is required
      if (authData.requiresVerification || authData.emailVerificationRequired) {
        // Don't set user or redirect, show verification message
        toast.success('¡Cuenta creada! Revisa tu email para verificar tu cuenta antes de iniciar sesión.');
        router.push('/auth/login?message=verification_required');
      } else {
        // Normal registration flow - Convert undefined to null for setUser compatibility
        const user = authData.user ?? null;
        setUser(user);
        
        if (user) {
          toast.success(`¡Cuenta creada exitosamente! Bienvenido, ${user.first_name}!`);
          
          // Redirect based on user type
          if (user.user_type === 'provider') {
            router.push('/as/dashboard');
          } else {
            router.push('/explorador/dashboard');
          }
        } else {
          toast.error('Error: No se pudo obtener información del usuario');
        }
      }
    } catch (error: unknown) {
      const message = (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data &&
        typeof error.response.data.error === 'string') ? error.response.data.error : 'Error al crear cuenta';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    handleLogout();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    authService.updateStoredUser(updatedUser);
  };

  const updateProfile = async (profileData: SecureProfileUpdateData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      
      // Preserve profile photo from current state if missing in response
      const finalUser = { ...updatedUser };
      if (user?.profile_photo_url && !finalUser.profile_photo_url) {
        finalUser.profile_photo_url = user.profile_photo_url;
      }
      
      setUser(finalUser);
      toast.success('Perfil actualizado exitosamente');
    } catch (error: unknown) {
      const message = (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data &&
        typeof error.response.data.error === 'string') ? error.response.data.error : 'Error al actualizar el perfil';
      toast.error(message);
      throw error;
    }
  };

  const uploadProfilePhoto = async (file: File): Promise<string> => {
    try {
      const result = await authService.uploadProfilePhoto(file);
      
      console.log('Upload photo result:', result);
      
      // Update user with new photo URL
      if (user) {
        const updatedUser = { ...user, profile_photo_url: result.profile_photo_url };
        console.log('Updating user context with new photo:', updatedUser);
        setUser(updatedUser);
        authService.updateStoredUser(updatedUser);
      }
      
      toast.success('Foto de perfil actualizada exitosamente');
      return result.profile_photo_url;
    } catch (error: unknown) {
      console.error('Upload photo error in context:', error);
      const message = (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data &&
        typeof error.response.data.error === 'string') ? error.response.data.error : 'Error al subir la foto';
      toast.error(message);
      throw error;
    }
  };

  const removeProfilePhoto = async (): Promise<void> => {
    try {
      await authService.removeProfilePhoto();
      
      // Update user by removing photo URL
      if (user) {
        const { profile_photo_url, ...userWithoutPhoto } = user;
        const updatedUser = userWithoutPhoto as User;
        setUser(updatedUser);
        authService.updateStoredUser(updatedUser);
      }
      
      toast.success('Foto de perfil eliminada exitosamente');
    } catch (error: unknown) {
      const message = (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data &&
        typeof error.response.data.error === 'string') ? error.response.data.error : 'Error al eliminar la foto';
      toast.error(message);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Contraseña cambiada exitosamente');
    } catch (error: unknown) {
      const message = (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data &&
        typeof error.response.data.error === 'string') ? error.response.data.error : 'Error al cambiar la contraseña';
      toast.error(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    uploadProfilePhoto,
    removeProfilePhoto,
    changePassword,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Durante SSR, devolver un estado por defecto en lugar de lanzar error
    if (typeof window === 'undefined') {
      return {
        user: null,
        loading: true,
        login: async () => {},
        register: async () => {},
        logout: () => {},
        updateUser: () => {},
        updateProfile: async () => {},
        uploadProfilePhoto: async () => '',
        removeProfilePhoto: async () => {},
        changePassword: async () => {},
        isAuthenticated: false,
      };
    }
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};