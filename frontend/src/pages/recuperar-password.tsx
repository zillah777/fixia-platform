import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

import MarketplaceLayout from '@/components/layouts/MarketplaceLayout';
// import Logo from '@/components/Logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RecuperarPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setStatus('error');
      setMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Las contraseñas no coinciden');
      return;
    }

    setStatus('loading');

    try {
      const API_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/email-verification/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token as string, 
          newPassword: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Contraseña restablecida exitosamente');
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión. Por favor, intenta de nuevo.');
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const strengthColors = ['bg-error-500', 'bg-warning-500', 'bg-accent-500', 'bg-success-500', 'bg-success-600'];
  const strengthLabels = ['Muy Débil', 'Débil', 'Regular', 'Fuerte', 'Muy Fuerte'];

  return (
    <MarketplaceLayout 
      title="Restablecer Contraseña - Fixia"
      description="Crea una nueva contraseña segura para tu cuenta de Fixia"
      showHeader={false}
      showFooter={false}
      maxWidth="full"
    >
      {/* Auth Background */}
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/20 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 animate-fade-in">
            {/* Back to Home */}
            <div className="text-center">
              <Link href="/" className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors">
                <span className="text-primary-600 font-bold">Fixia</span>
                <span className="text-sm font-medium">Volver al inicio</span>
              </Link>
            </div>

            {/* Password Reset Card */}
            <Card className="glass border-white/10 backdrop-blur-md p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">F</span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white mb-2">
                  Restablecer Contraseña
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Crea una nueva contraseña segura para tu cuenta
                </p>
              </div>

            {status === 'success' ? (
              <div className="text-center space-y-8">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-success-500 to-success-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white">✓</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-success-800 dark:text-success-300 mb-3">
                    ¡Contraseña Restablecida!
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-6">
                    {message}
                  </p>
                  <div className="p-4 bg-success-50 dark:bg-success-950/50 border border-success-200 dark:border-success-800 rounded-lg">
                    <div className="flex items-center justify-center text-success-700 dark:text-success-300">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-success-600 dark:border-success-400 mr-3"></div>
                      <span className="font-semibold">Redirigiendo al login...</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl text-white">🔒</span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                    Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
                  </p>
                </div>

                {/* Error Message */}
                {status === 'error' && (
                  <div className="mb-6 p-4 bg-error-50 dark:bg-error-950/50 border border-error-200 dark:border-error-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5">⚠</span>
                      <p className="text-sm text-error-700 dark:text-error-300">
                        {message}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />

                  <Input
                    type="password"
                    placeholder="Confirma tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                {/* Indicador de fortaleza */}
                {password.length > 0 && (
                  <div className="p-4 bg-info-50 dark:bg-info-950/50 border border-info-200 dark:border-info-800 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Fortaleza de la contraseña:
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          getPasswordStrength(password) >= 3 
                            ? 'bg-success-100 dark:bg-success-900/50 text-success-800 dark:text-success-300' 
                            : 'bg-warning-100 dark:bg-warning-900/50 text-warning-800 dark:text-warning-300'
                        }`}>
                          {strengthLabels[getPasswordStrength(password) - 1] || 'Muy Débil'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                              i < getPasswordStrength(password) 
                                ? strengthColors[getPasswordStrength(password) - 1] 
                                : 'bg-neutral-200 dark:bg-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={!password || !confirmPassword}
                >
                  {status === 'loading' ? 'Restableciendo...' : 'Restablecer Contraseña'}
                </Button>
              </form>
            )}
            </Card>

            {/* Footer */}
            <div className="text-center mt-8 space-y-3">
              <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                ¿Recordaste tu contraseña?{' '}
                <Link href="/auth/login" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors">
                  Iniciar Sesión
                </Link>
              </p>
              <p className="text-neutral-400 dark:text-neutral-500 text-xs">
                ¿Problemas? Contáctanos en{' '}
                <a 
                  href="mailto:contacto@fixia.com.ar" 
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors"
                >
                  contacto@fixia.com.ar
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
}