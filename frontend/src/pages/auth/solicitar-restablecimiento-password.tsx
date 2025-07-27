import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

import MarketplaceLayout from '@/components/layouts/MarketplaceLayout';
import Logo from '@/components/Logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SolicitarRestablecimientoPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Por favor ingresa tu dirección de email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Por favor ingresa un email válido');
      return;
    }

    setStatus('loading');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/email-verification/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Te hemos enviado un enlace de restablecimiento a tu email');
      } else {
        setStatus('error');
        setMessage(data.error || 'Error al enviar el enlace de restablecimiento');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión. Por favor, intenta de nuevo.');
    }
  };

  return (
    <MarketplaceLayout 
      title="Recuperar Contraseña - Fixia"
      description="Solicita el restablecimiento de tu contraseña en Fixia"
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
                <Logo size="sm" variant="primary" />
                <span className="text-sm font-medium">Volver al inicio</span>
              </Link>
            </div>

            {/* Password Reset Card */}
            <Card variant="glass" padding="xl" className="backdrop-blur-md">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mb-4">
                  <Logo size="lg" variant="primary" showText={false} />
                </div>
                <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white mb-2">
                  Recuperar Contraseña
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Te ayudamos a recuperar el acceso a tu cuenta
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
                    ¡Email Enviado!
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-6">
                    {message}
                  </p>
                  <div className="p-4 bg-success-50 dark:bg-success-950/50 border border-success-200 dark:border-success-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5">✉</span>
                      <div className="text-left">
                        <p className="font-semibold text-success-700 dark:text-success-300 mb-1">Revisa tu bandeja de entrada</p>
                        <p className="text-sm text-success-600 dark:text-success-400">
                          Si no encuentras el email, revisa tu carpeta de spam o promociones
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/auth/login')}
                    variant="primary"
                    size="lg"
                    fullWidth
                    leftIcon={<span>←</span>}
                  >
                    Volver al Login
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl text-white">✉</span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                    Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
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
                    label="Dirección de Email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<span>✉</span>}
                    fullWidth
                    required
                  />
                </div>

                {/* Security Notice */}
                <div className="p-4 bg-info-50 dark:bg-info-950/50 border border-info-200 dark:border-info-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-info-600 dark:text-info-400 flex-shrink-0 mt-0.5">ℹ</span>
                    <div>
                      <h3 className="font-semibold text-info-900 dark:text-info-300 mb-1">
                        Nota de Seguridad
                      </h3>
                      <p className="text-sm text-info-700 dark:text-info-400">
                        El enlace de restablecimiento será válido por 1 hora y solo podrá ser usado una vez. 
                        Si no tienes acceso a tu email, contáctanos.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={status === 'loading'}
                  disabled={!email.trim()}
                  rightIcon={<span>✈</span>}
                >
                  {status === 'loading' ? 'Enviando...' : 'Enviar Enlace de Restablecimiento'}
                </Button>

                {/* Divider */}
                <div className="mt-8 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-300 dark:border-neutral-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                        ¿Ya recordaste tu contraseña?
                      </span>
                    </div>
                  </div>
                </div>

                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    size="md"
                    fullWidth
                    leftIcon={<span>←</span>}
                  >
                    Volver al Login
                  </Button>
                </Link>
              </form>
            )}
            </Card>

            {/* Footer */}
            <div className="text-center mt-8 space-y-3">
              <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">¿Problemas con tu cuenta?</p>
              <a 
                href="mailto:contacto@fixia.com.ar" 
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold text-sm transition-colors"
              >
                Contáctanos en contacto@fixia.com.ar
              </a>
            </div>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
}