import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'professional' | 'client';
  verified: boolean;
  rating: number;
  totalServices: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'professional' | 'client';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('fixia_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('fixia_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    const mockUser: User = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      name: "Juan Desarrollador",
      email: email,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
      role: 'professional',
      verified: true,
      rating: 4.9,
      totalServices: 127
    };
    
    setUser(mockUser);
    localStorage.setItem('fixia_user', JSON.stringify(mockUser));
    setLoading(false);
    
    return true;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mock successful registration
    const newUser: User = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      verified: false,
      rating: 0,
      totalServices: 0
    };
    
    setUser(newUser);
    localStorage.setItem('fixia_user', JSON.stringify(newUser));
    setLoading(false);
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fixia_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('fixia_user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}