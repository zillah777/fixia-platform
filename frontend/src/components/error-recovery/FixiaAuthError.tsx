/**
 * FixiaAuthError - Authentication Error Handler with Auto Re-login
 * Handles session expiration, token refresh, and authentication failures
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  ShieldOff, 
  Key, 
  RefreshCw,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  LogIn,
  UserPlus,
  Home,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthenticationError } from '@/types/errors';
import { useAuth } from '@/contexts/AuthContext';

interface AuthErrorProps {
  error: AuthenticationError;
  onRetry?: () => void;
  onLoginSuccess?: (user: any) => void;
  onCancel?: () => void;
  enableQuickLogin?: boolean;
  showRegistrationOption?: boolean;
  preserveFormData?: boolean;
}

interface LoginForm {
  email: string;
  password: string;
}

interface SessionInfo {
  lastActivity: Date | null;
  sessionDuration: number;
  autoLogoutWarning: boolean;
  remainingTime: number;
}

export const FixiaAuthError: React.FC<AuthErrorProps> = ({
  error,
  onRetry,
  onLoginSuccess,
  onCancel,
  enableQuickLogin = true,
  showRegistrationOption = true,
  preserveFormData = true,
}) => {
  const { login, user } = useAuth();
  
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [autoRenewAttempts, setAutoRenewAttempts] = useState(0);
  const [isAutoRenewing, setIsAutoRenewing] = useState(false);
  
  const maxAutoRenewAttempts = 2;
  const autoRenewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract user email from stored data if available
  useEffect(() => {
    const storedEmail = localStorage.getItem('fixia_user_email') || user?.email || '';
    if (storedEmail && enableQuickLogin) {
      setLoginForm(prev => ({ ...prev, email: storedEmail }));
    }
    
    // Get session information
    const lastActivity = localStorage.getItem('fixia_last_activity');
    if (lastActivity) {
      const lastActivityDate = new Date(lastActivity);
      const sessionDuration = Date.now() - lastActivityDate.getTime();
      
      setSessionInfo({
        lastActivity: lastActivityDate,
        sessionDuration,
        autoLogoutWarning: sessionDuration > 24 * 60 * 60 * 1000, // 24 hours
        remainingTime: 0,
      });
    }
  }, [user, enableQuickLogin]);

  // Auto-renewal for session expired errors
  useEffect(() => {
    if (error.authType === 'session' && 
        error.canAutoRenew && 
        autoRenewAttempts < maxAutoRenewAttempts &&
        !isAutoRenewing) {
      
      const delay = Math.min(1000 * Math.pow(2, autoRenewAttempts), 5000);
      
      autoRenewTimeoutRef.current = setTimeout(() => {
        handleAutoRenew();
      }, delay);
    }
    
    return () => {
      if (autoRenewTimeoutRef.current) {
        clearTimeout(autoRenewTimeoutRef.current);
      }
    };
  }, [error, autoRenewAttempts, isAutoRenewing]);

  const handleAutoRenew = async () => {
    setIsAutoRenewing(true);
    setAutoRenewAttempts(prev => prev + 1);
    
    try {
      // Attempt to refresh token using stored refresh token
      const refreshToken = localStorage.getItem('fixia_refresh_token');
      if (refreshToken) {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
        
        if (response.ok) {
          const authData = await response.json();
          localStorage.setItem('fixia_token', authData.token);
          localStorage.setItem('fixia_user', JSON.stringify(authData.user));
          
          if (onLoginSuccess) {
            onLoginSuccess(authData.user);
          } else if (onRetry) {
            onRetry();
          }
          return;
        }
      }
      
      // If auto-renewal fails, show login form
      if (autoRenewAttempts >= maxAutoRenewAttempts) {
        setShowLoginForm(true);
      }
    } catch (error) {
      console.error('Auto-renewal failed:', error);
      if (autoRenewAttempts >= maxAutoRenewAttempts) {
        setShowLoginForm(true);
      }
    } finally {
      setIsAutoRenewing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      await login(loginForm);
      
      // Store email for future use
      localStorage.setItem('fixia_user_email', loginForm.email);
      
      if (onLoginSuccess) {
        onLoginSuccess(user);
      } else if (onRetry) {
        onRetry();
      }
    } catch (error: any) {
      setLoginError(error.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickLogin = () => {
    setShowLoginForm(true);
    // Focus password field if email is already filled
    setTimeout(() => {
      const passwordInput = document.getElementById('auth-password');
      if (passwordInput && loginForm.email) {
        passwordInput.focus();
      }
    }, 100);
  };

  const handleGoToRegistration = () => {
    const currentUrl = window.location.href;
    window.location.href = `/auth/registro?redirect=${encodeURIComponent(currentUrl)}`;
  };

  const handleForgotPassword = () => {
    const email = loginForm.email || user?.email || '';
    window.location.href = `/auth/solicitar-restablecimiento-password${email ? `?email=${email}` : ''}`;
  };

  const getAuthIcon = () => {
    switch (error.authType) {
      case 'session':
        return <Clock className="h-8 w-8 text-orange-400" />;
      case 'token':
        return <Key className="h-8 w-8 text-red-400" />;
      case 'verification':
        return <Mail className="h-8 w-8 text-blue-400" />;
      default:
        return <Shield className="h-8 w-8 text-red-400" />;
    }
  };

  const getErrorTitle = () => {
    switch (error.authType) {
      case 'session':
        return 'Sesión Expirada';
      case 'token':
        return 'Token Inválido';
      case 'verification':
        return 'Verificación Requerida';
      default:
        return 'Error de Autenticación';
    }
  };

  const getErrorDescription = () => {
    switch (error.authType) {
      case 'session':
        return 'Tu sesión ha expirado por seguridad. Inicia sesión de nuevo para continuar.';
      case 'token':
        return 'Tu token de autenticación es inválido. Necesitas iniciar sesión nuevamente.';
      case 'verification':
        return 'Tu cuenta necesita verificación. Revisa tu email o contacta soporte.';
      default:
        return error.userMessage;
    }
  };

  const getContextMessage = () => {
    const messages = [];
    
    if (error.userContext === 'as') {
      messages.push('Como profesional AS, mantener tu sesión activa te ayuda a recibir notificaciones de nuevas oportunidades.');
    } else if (error.userContext === 'explorador') {
      messages.push('Para continuar buscando servicios y contactar profesionales, necesitas estar autenticado.');
    }
    
    if (sessionInfo?.sessionDuration) {
      const hours = Math.floor(sessionInfo.sessionDuration / (1000 * 60 * 60));
      if (hours > 24) {
        messages.push(`Tu última sesión fue hace ${Math.floor(hours / 24)} días.`);
      } else if (hours > 1) {
        messages.push(`Tu última sesión fue hace ${hours} horas.`);
      }
    }
    
    return messages;
  };

  if (isAutoRenewing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-medium rounded-xl p-8 border border-orange-500/30 bg-orange-500/20 text-center max-w-md mx-auto"
      >
        <RefreshCw className="h-8 w-8 text-orange-400 mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Renovando Sesión
        </h3>
        <p className="text-white/80 text-sm">
          Intentando renovar tu sesión automáticamente...
        </p>
        <p className="text-white/60 text-xs mt-2">
          Intento {autoRenewAttempts} de {maxAutoRenewAttempts}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-medium rounded-xl p-8 border border-red-500/30 bg-red-500/20">
        {/* Error Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mb-4"
          >
            {getAuthIcon()}
          </motion.div>
          
          <h3 className="text-xl font-semibold text-white mb-2">
            {getErrorTitle()}
          </h3>
          
          <p className="text-white/80 text-sm leading-relaxed">
            {getErrorDescription()}
          </p>
        </div>

        {/* Context Messages */}
        {getContextMessage().length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="space-y-2">
              {getContextMessage().map((message, index) => (
                <p key={index} className="text-blue-400 text-xs flex items-start">
                  <CheckCircle className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                  {message}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Session Information */}
        {sessionInfo && (
          <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <h4 className="text-white font-medium mb-2 text-sm">Información de Sesión</h4>
            <div className="space-y-1 text-xs text-white/70">
              {sessionInfo.lastActivity && (
                <p>Última actividad: {sessionInfo.lastActivity.toLocaleString()}</p>
              )}
              <p>Duración de sesión: {Math.floor(sessionInfo.sessionDuration / (1000 * 60))} minutos</p>
              {sessionInfo.autoLogoutWarning && (
                <p className="text-orange-400">⚠️ Sesión inactiva por mucho tiempo</p>
              )}
            </div>
          </div>
        )}

        {/* Quick Login Option */}
        {enableQuickLogin && !showLoginForm && loginForm.email && (
          <div className="mb-4">
            <Button
              onClick={handleQuickLogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Iniciar Sesión como {loginForm.email}
            </Button>
          </div>
        )}

        {/* Login Form */}
        <AnimatePresence>
          {showLoginForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleLogin}
              className="space-y-4 mb-6"
            >
              {/* Email Input */}
              <div>
                <label htmlFor="auth-email" className="block text-white/80 text-sm font-medium mb-1">
                  Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="auth-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="tu@email.com"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/40"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="auth-password" className="block text-white/80 text-sm font-medium mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Tu contraseña"
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-white/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Login Error */}
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-500/20 border border-red-500/30"
                >
                  <p className="text-red-400 text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {loginError}
                  </p>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoggingIn || !loginForm.email || !loginForm.password}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!showLoginForm && (
            <Button
              onClick={() => setShowLoginForm(true)}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>
          )}

          {showRegistrationOption && (
            <Button
              onClick={handleGoToRegistration}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Cuenta Nueva
            </Button>
          )}

          <Button
            onClick={handleForgotPassword}
            variant="outline"
            size="sm"
            className="w-full border-white/20 text-white hover:bg-white/10 text-sm"
          >
            <Key className="h-4 w-4 mr-2" />
            ¿Olvidaste tu contraseña?
          </Button>

          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="w-full border-white/20 text-white hover:bg-white/10 text-sm"
            >
              <Home className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Button>
          )}
        </div>

        {/* Footer Information */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-white/40 text-xs mb-1">
            Error ID: {error.id.substr(-8)}
          </p>
          <p className="text-white/40 text-xs">
            Para tu seguridad, las sesiones expiran automáticamente
          </p>
        </div>
      </div>
    </motion.div>
  );
};