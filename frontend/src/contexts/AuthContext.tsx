import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { authService } from '@/services/auth';
import { User, LoginCredentials, RegisterData } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
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
            
            // Session validation disabled to prevent auto-logout issues
            // setTimeout(async () => {
            //   const isValidSession = await authService.validateSession();
            //   if (!isValidSession) {
            //     // Sesión inválida, hacer logout limpio
            //     handleLogout();
            //   }
            // }, 1000);
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
      setUser(authData.user);
      toast.success(`¡Bienvenido, ${authData.user.first_name}!`);
      
      // Longer delay to ensure state is updated and prevent redirect loops
      setTimeout(() => {
        // Redirect based on user type
        if (authData.user.user_type === 'provider') {
          router.push('/as/dashboard');
        } else {
          router.push('/explorador/dashboard');
        }
      }, 300);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al iniciar sesión';
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
        // Normal registration flow
        setUser(authData.user);
        toast.success(`¡Cuenta creada exitosamente! Bienvenido, ${authData.user.first_name}!`);
        
        // Redirect based on user type
        if (authData.user.user_type === 'provider') {
          router.push('/as/dashboard');
        } else {
          router.push('/explorador/dashboard');
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al crear cuenta';
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

  const updateProfile = async (profileData: any) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      toast.success('Perfil actualizado exitosamente');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al actualizar el perfil';
      toast.error(message);
      throw error;
    }
  };

  const uploadProfilePhoto = async (file: File): Promise<string> => {
    try {
      const result = await authService.uploadProfilePhoto(file);
      
      // Update user with new photo URL
      if (user) {
        const updatedUser = { ...user, profile_photo_url: result.profile_photo_url };
        setUser(updatedUser);
        authService.updateStoredUser(updatedUser);
      }
      
      toast.success('Foto de perfil actualizada exitosamente');
      return result.profile_photo_url;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al subir la foto';
      toast.error(message);
      throw error;
    }
  };

  const removeProfilePhoto = async (): Promise<void> => {
    try {
      await authService.removeProfilePhoto();
      
      // Update user by removing photo URL
      if (user) {
        const updatedUser = { ...user, profile_photo_url: undefined };
        setUser(updatedUser);
        authService.updateStoredUser(updatedUser);
      }
      
      toast.success('Foto de perfil eliminada exitosamente');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al eliminar la foto';
      toast.error(message);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Contraseña cambiada exitosamente');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al cambiar la contraseña';
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