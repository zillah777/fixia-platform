import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials } from '@/types';
import MarketplaceLayout from '@/components/layouts/MarketplaceLayout';
import Logo from '@/components/Logo';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Ingresa un email válido')
    .required('El email es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida')
});

const LoginPage: NextPage = () => {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema)
  });

  useEffect(() => {
    // Check for verification message in URL
    if (router.query.message === 'verification_required') {
      setVerificationMessage('¡Cuenta creada exitosamente! Revisa tu email y haz clic en el enlace de verificación para activar tu cuenta.');
    }
  }, [router.query.message]);

  useEffect(() => {
    if (!loading && user) {
      // Only redirect if we're actually on the login page (prevent redirect loops)
      if (router.pathname === '/auth/login') {
        // Add delay to prevent rapid redirects
        setTimeout(() => {
          // Redirect based on user type
          if (user.user_type === 'provider') {
            router.push('/as/dashboard');
          } else {
            router.push('/explorador/dashboard');
          }
        }, 100);
      }
    }
  }, [user, loading, router]);

  const onSubmit = async (data: LoginCredentials) => {
    setIsSubmitting(true);
    setLoginError(null);

    try {
      await login(data);
      // Navigation will be handled by useEffect above
    } catch (error: any) {
      setLoginError(
        error.response?.data?.error || 
        'Error al iniciar sesión. Verifica tu email y contraseña.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="hero section-padding-lg">
        <div className="container">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-6"></div>
            <p className="text-secondary font-medium">Verificando sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="hero section-padding-lg">
        <div className="container">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-6"></div>
            <p className="text-secondary font-medium">Redirigiendo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MarketplaceLayout 
      title="Iniciar Sesión - Fixia"
      description="Inicia sesión en tu cuenta de Fixia para acceder a todos nuestros servicios"
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

            {/* Login Card */}
            <Card variant="glass" padding="xl" className="backdrop-blur-md">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mb-4">
                  <Logo size="lg" variant="primary" showText={false} />
                </div>
                <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white mb-2">
                  Bienvenido de vuelta
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Accede a tu cuenta del marketplace de servicios
                </p>
              </div>

              {/* Verification Message */}
              {verificationMessage && (
                <div className="mb-6 p-4 bg-info-50 dark:bg-info-950/50 border border-info-200 dark:border-info-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-info-600 dark:text-info-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-info-700 dark:text-info-300">
                      {verificationMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Login Error */}
              {loginError && (
                <div className="mb-6 p-4 bg-error-50 dark:bg-error-950/50 border border-error-200 dark:border-error-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-error-700 dark:text-error-300">
                      {loginError}
                    </p>
                  </div>
                </div>
              )}

              {/* Demo Buttons */}
              <div className="mb-8 space-y-3">
                <div className="text-center">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Prueba rápida</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<UserGroupIcon className="h-4 w-4" />}
                    onClick={() => {
                      // Auto-fill demo customer credentials
                      const demoEmail = 'demo.customer@fixia.com';
                      const demoPassword = 'demo123';
                      // Handle demo login logic here
                    }}
                    fullWidth
                  >
                    Demo Cliente
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<BriefcaseIcon className="h-4 w-4" />}
                    onClick={() => {
                      // Auto-fill demo provider credentials
                      const demoEmail = 'demo.provider@fixia.com';
                      const demoPassword = 'demo123';
                      // Handle demo login logic here
                    }}
                    fullWidth
                  >
                    Demo AS
                  </Button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="tu@email.com"
                    error={errors.email?.message}
                    leftIcon={<EnvelopeIcon className="h-5 w-5" />}
                    fullWidth
                    {...register('email')}
                  />

                  <Input
                    label="Contraseña"
                    type="password"
                    placeholder="Tu contraseña"
                    error={errors.password?.message}
                    leftIcon={<LockClosedIcon className="h-5 w-5" />}
                    showPasswordToggle
                    fullWidth
                    {...register('password')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 dark:border-neutral-600 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300">
                      Recordarme
                    </label>
                  </div>

                  <Link 
                    href="/auth/solicitar-restablecimiento-password" 
                    className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  rightIcon={<ArrowRightIcon className="h-5 w-5" />}
                >
                  {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>

              {/* Divider */}
              <div className="mt-8 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-300 dark:border-neutral-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                      ¿No tienes cuenta?
                    </span>
                  </div>
                </div>
              </div>

              {/* Register Links */}
              <div className="space-y-3">
                <Link href="/auth/registro?type=customer">
                  <Button
                    variant="ghost"
                    size="md"
                    fullWidth
                    leftIcon={<UserGroupIcon className="h-5 w-5" />}
                  >
                    Registrarme como Cliente
                  </Button>
                </Link>
                <Link href="/auth/registro?type=provider">
                  <Button
                    variant="ghost"
                    size="md"
                    fullWidth
                    leftIcon={<BriefcaseIcon className="h-5 w-5" />}
                  >
                    Registrarme como Profesional
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
};

// Deshabilitar SSG para evitar errores de AuthProvider
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default LoginPage;