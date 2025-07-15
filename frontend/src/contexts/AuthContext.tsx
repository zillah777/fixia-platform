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

  // Initialize auth state
  useEffect(() => {
    if (!isClient) return; // Solo ejecutar en el cliente
    
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            
            // Optionally verify token with server
            try {
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
              authService.updateStoredUser(currentUser);
            } catch (error) {
              // Token might be invalid, clear local storage
              authService.logout();
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [isClient]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const authData = await authService.login(credentials);
      setUser(authData.user);
      toast.success(`¡Bienvenido, ${authData.user.first_name}!`);
      router.push('/dashboard');
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
      setUser(authData.user);
      toast.success(`¡Cuenta creada exitosamente! Bienvenido, ${authData.user.first_name}!`);
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al crear cuenta';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Sesión cerrada exitosamente');
    router.push('/');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    authService.updateStoredUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
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
        isAuthenticated: false,
      };
    }
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};