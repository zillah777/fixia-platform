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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials } from '@/types';
import Logo from '@/components/Logo';

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema)
  });

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user type
      if (user.user_type === 'provider') {
        router.push('/as/dashboard');
      } else {
        router.push('/explorador/dashboard');
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
    <>
      <Head>
        <title>Iniciar Sesión - Fixia</title>
        <meta name="description" content="Inicia sesión en tu cuenta de Fixia para acceder a todos nuestros servicios" />
      </Head>

      {/* Background with Gradient */}
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-primary opacity-10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-secondary opacity-10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center animate-fade-in">
              <Link href="/">
                <div className="hover-lift cursor-pointer inline-block mb-6">
                  <Logo size="xl" variant="gradient" />
                </div>
              </Link>
              <h1 className="text-3xl font-bold text-primary mb-4">
                Bienvenido de vuelta
              </h1>
              <p className="text-secondary text-lg">
                Accede a tu cuenta en las páginas amarillas del futuro
              </p>
            </div>

            {/* Login Form */}
            <div className="card glass hover-lift animate-scale-in" style={{animationDelay: '0.2s'}}>
              {loginError && (
                <div className="mb-6 bg-gradient-to-r from-error-50 to-error-100 border border-error-200 rounded-xl p-4 animate-shake">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-error-600 mr-3 animate-bounce" />
                    <p className="text-sm text-error-700 font-medium">{loginError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors" />
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      autoComplete="email"
                      className={`form-input pl-12 pr-4 py-4 glass hover-lift w-full ${
                        errors.email ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''
                      }`}
                      placeholder="tu@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="form-error animate-slide-down">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="form-label">
                    Contraseña
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="current-password"
                      className={`form-input pl-12 pr-12 py-4 glass hover-lift w-full ${
                        errors.password ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-primary-600 transition-colors hover-bounce p-1"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="form-error animate-slide-down">{errors.password.message}</p>
                  )}
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link href="/recuperar-password">
                    <span className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer hover-lift hover-magnetic font-medium transition-colors">
                      ¿Olvidaste tu contraseña?
                    </span>
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-lg w-full btn-magnetic hover-lift animate-glow"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      Iniciar Sesión
                      <ArrowRightIcon className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>

                {/* Demo Accounts */}
                <div className="mt-8 pt-6 border-t border-neutral-200">
                  <p className="text-sm text-secondary text-center mb-4 font-medium">Acceso rápido para pruebas:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        reset({ email: 'explorador@demo.com', password: 'demo123' });
                      }}
                      className="btn btn-ghost btn-sm hover-lift hover-magnetic"
                    >
                      🔍 Explorador Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        reset({ email: 'as@demo.com', password: 'demo123' });
                      }}
                      className="btn btn-ghost btn-sm hover-lift hover-magnetic"
                    >
                      🛠️ AS Demo
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Register Link */}
            <div className="text-center animate-fade-in" style={{animationDelay: '0.4s'}}>
              <p className="text-secondary">
                ¿No tienes una cuenta?{' '}
                <Link href="/auth/registro">
                  <span className="text-primary-600 hover:text-primary-700 font-semibold cursor-pointer hover-lift hover-magnetic">
                    Regístrate aquí
                  </span>
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="text-center animate-fade-in" style={{animationDelay: '0.6s'}}>
              <Link href="/">
                <span className="text-tertiary hover:text-secondary text-sm cursor-pointer hover-lift hover-magnetic inline-flex items-center">
                  ← Volver al inicio
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Deshabilitar SSG para evitar errores de AuthProvider
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default LoginPage;