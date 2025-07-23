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
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { RegisterData } from '@/types';
import MarketplaceLayout from '@/components/layouts/MarketplaceLayout';
import Logo from '@/components/Logo';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const registerSchema = yup.object().shape({
  first_name: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('El nombre es requerido'),
  last_name: yup
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .required('El apellido es requerido'),
  email: yup
    .string()
    .email('Ingresa un email válido')
    .required('El email es requerido'),
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula y 1 número'
    )
    .required('La contraseña es requerida'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
  user_type: yup
    .string()
    .oneOf(['customer', 'provider'], 'Selecciona un tipo de cuenta')
    .required('El tipo de cuenta es requerido'),
  phone: yup
    .string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Ingresa un número de teléfono válido')
    .optional(),
  address: yup
    .string()
    .optional(),
  latitude: yup
    .number()
    .optional(),
  longitude: yup
    .number()
    .optional(),
  terms_accepted: yup
    .boolean()
    .oneOf([true], 'Debes aceptar los términos y condiciones')
    .required('Debes aceptar los términos y condiciones')
});

interface RegisterFormData extends RegisterData {
  confirm_password: string;
  terms_accepted: boolean;
}

const RegistroPage: NextPage = () => {
  const { user, register: registerUser, loading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      user_type: (router.query.type === 'provider' ? 'provider' : 'customer') as 'customer' | 'provider'
    }
  });

  const watchedUserType = watch('user_type');

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

  const handleNextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['first_name', 'last_name', 'email'] 
      : currentStep === 2
      ? ['password', 'confirm_password']
      : ['user_type', 'terms_accepted'];
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setRegisterError(null);

    try {
      const { confirm_password, terms_accepted, ...registerData } = data;
      await registerUser(registerData);
      // Navigation will be handled by useEffect above
    } catch (error: any) {
      setRegisterError(
        error.response?.data?.error || 
        'Error al crear la cuenta. Inténtalo nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MarketplaceLayout title="Cargando..." showHeader={false} showFooter={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-6"></div>
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">Verificando sesión...</p>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  if (user) {
    return (
      <MarketplaceLayout title="Redirigiendo..." showHeader={false} showFooter={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-6"></div>
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">Redirigiendo...</p>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  const totalSteps = 3;

  return (
    <MarketplaceLayout 
      title="Registro - Fixia"
      description="Crea tu cuenta en Fixia y forma parte del marketplace de servicios más confiable de Argentina"
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
          <div className="max-w-lg w-full space-y-8 animate-fade-in">
            {/* Back to Home */}
            <div className="text-center">
              <Link href="/" className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors">
                <Logo size="sm" variant="primary" />
                <span className="text-sm font-medium">Volver al inicio</span>
              </Link>
            </div>

            {/* Progress Bar */}
            <Card variant="glass" padding="lg" className="backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Paso {currentStep} de {totalSteps}</span>
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </Card>

            {/* Registration Form */}
            <Card variant="glass" padding="xl" className="backdrop-blur-md">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mb-4">
                  <Logo size="lg" variant="primary" showText={false} />
                </div>
                <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white mb-2">
                  Únete a Fixia
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Crea tu cuenta en el marketplace de servicios
                </p>
              </div>

              {/* Registration Error */}
              {registerError && (
                <div className="mb-6 p-4 bg-error-50 dark:bg-error-950/50 border border-error-200 dark:border-error-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-error-700 dark:text-error-300">
                      {registerError}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold text-primary mb-2">Información Personal</h2>
                      <p className="text-secondary">Cuéntanos sobre ti</p>
                    </div>

                    {/* First Name */}
                    <div className="space-y-2">
                      <label htmlFor="first_name" className="form-label">
                        Nombre
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors" />
                        <input
                          {...register('first_name')}
                          type="text"
                          id="first_name"
                          autoComplete="given-name"
                          className={`form-input pl-12 pr-4 py-4 glass hover-lift w-full ${
                            errors.first_name ? 'border-terra-300 focus:border-terra-500 focus:ring-terra-500' : ''
                          }`}
                          placeholder="Tu nombre"
                        />
                      </div>
                      {errors.first_name && (
                        <p className="form-error animate-slide-down">{errors.first_name.message}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <label htmlFor="last_name" className="form-label">
                        Apellido
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors" />
                        <input
                          {...register('last_name')}
                          type="text"
                          id="last_name"
                          autoComplete="family-name"
                          className={`form-input pl-12 pr-4 py-4 glass hover-lift w-full ${
                            errors.last_name ? 'border-terra-300 focus:border-terra-500 focus:ring-terra-500' : ''
                          }`}
                          placeholder="Tu apellido"
                        />
                      </div>
                      {errors.last_name && (
                        <p className="form-error animate-slide-down">{errors.last_name.message}</p>
                      )}
                    </div>

                    {/* Email */}
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
                            errors.email ? 'border-terra-300 focus:border-terra-500 focus:ring-terra-500' : ''
                          }`}
                          placeholder="tu@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="form-error animate-slide-down">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="btn btn-primary btn-lg w-full btn-magnetic hover-lift animate-glow"
                    >
                      Continuar
                      <ArrowRightIcon className="h-5 w-5 ml-2" />
                    </button>
                  </div>
                )}

                {/* Step 2: Security */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold text-primary mb-2">Seguridad</h2>
                      <p className="text-secondary">Crea una contraseña segura</p>
                    </div>

                    {/* Password */}
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
                          autoComplete="new-password"
                          className={`form-input pl-12 pr-12 py-4 glass hover-lift w-full ${
                            errors.password ? 'border-terra-300 focus:border-terra-500 focus:ring-terra-500' : ''
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-forest-600 transition-colors hover-bounce p-1"
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

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label htmlFor="confirm_password" className="form-label">
                        Confirmar Contraseña
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors" />
                        <input
                          {...register('confirm_password')}
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirm_password"
                          autoComplete="new-password"
                          className={`form-input pl-12 pr-12 py-4 glass hover-lift w-full ${
                            errors.confirm_password ? 'border-terra-300 focus:border-terra-500 focus:ring-terra-500' : ''
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-forest-600 transition-colors hover-bounce p-1"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirm_password && (
                        <p className="form-error animate-slide-down">{errors.confirm_password.message}</p>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="btn btn-ghost btn-lg flex-1 hover-lift hover-magnetic"
                      >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Anterior
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="btn btn-primary btn-lg flex-1 btn-magnetic hover-lift animate-glow"
                      >
                        Continuar
                        <ArrowRightIcon className="h-5 w-5 ml-2" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Account Type & Terms */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold text-primary mb-2">Tipo de Cuenta</h2>
                      <p className="text-secondary">¿Cómo usarás Fixia?</p>
                    </div>

                    {/* Account Type Selection */}
                    <div className="space-y-4">
                      <div 
                        className={`card cursor-pointer hover-lift hover-magnetic transition-all duration-300 ${
                          watchedUserType === 'customer' 
                            ? 'border-primary-500 bg-primary-50 shadow-lg' 
                            : 'border-neutral-200 hover:border-primary-300'
                        }`}
                        onClick={() => setValue('user_type', 'customer', { shouldValidate: true })}
                      >
                        <input
                          {...register('user_type')}
                          type="radio"
                          value="customer"
                          id="customer"
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-full ${
                            watchedUserType === 'customer' 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            <MagnifyingGlassIcon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-primary text-lg">Soy Explorador</h3>
                            <p className="text-secondary">Busco servicios y necesito contratar AS</p>
                          </div>
                          {watchedUserType === 'customer' && (
                            <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                          )}
                        </div>
                      </div>

                      <div 
                        className={`card cursor-pointer hover-lift hover-magnetic transition-all duration-300 ${
                          watchedUserType === 'provider' 
                            ? 'border-primary-500 bg-primary-50 shadow-lg' 
                            : 'border-neutral-200 hover:border-primary-300'
                        }`}
                        onClick={() => setValue('user_type', 'provider', { shouldValidate: true })}
                      >
                        <input
                          {...register('user_type')}
                          type="radio"
                          value="provider"
                          id="provider"
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-full ${
                            watchedUserType === 'provider' 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            <BriefcaseIcon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-primary text-lg">Soy AS (Anunciante)</h3>
                            <p className="text-secondary">Ofrezco servicios y quiero conectar con Exploradores</p>
                          </div>
                          {watchedUserType === 'provider' && (
                            <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {errors.user_type && (
                      <p className="form-error animate-slide-down">{errors.user_type.message}</p>
                    )}

                    {/* Optional Fields for Provider */}
                    {watchedUserType === 'provider' && (
                      <div className="space-y-4 animate-slide-down">
                        <div className="space-y-2">
                          <label htmlFor="phone" className="form-label">
                            Teléfono (Opcional)
                          </label>
                          <div className="relative">
                            <PhoneIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors" />
                            <input
                              {...register('phone')}
                              type="tel"
                              id="phone"
                              autoComplete="tel"
                              className="form-input pl-12 pr-4 py-4 glass hover-lift w-full"
                              placeholder="+54 11 1234-5678"
                            />
                          </div>
                          {errors.phone && (
                            <p className="form-error animate-slide-down">{errors.phone.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="address" className="form-label">
                            Dirección (Opcional)
                          </label>
                          <div className="relative">
                            <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors" />
                            <input
                              {...register('address')}
                              type="text"
                              id="address"
                              autoComplete="address-line1"
                              className="form-input pl-12 pr-4 py-4 glass hover-lift w-full"
                              placeholder="Tu dirección"
                            />
                          </div>
                          {errors.address && (
                            <p className="form-error animate-slide-down">{errors.address.message}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Terms and Conditions */}
                    <div className="form-check">
                      <input
                        {...register('terms_accepted')}
                        type="checkbox"
                        id="terms_accepted"
                        className="form-check-input"
                      />
                      <label htmlFor="terms_accepted" className="text-sm text-secondary cursor-pointer">
                        Acepto los{' '}
                        <Link href="/legal/terms">
                          <span className="text-primary-600 hover:text-primary-700 font-medium hover-lift hover-magnetic">
                            términos y condiciones
                          </span>
                        </Link>
                        {' '}y la{' '}
                        <Link href="/legal/privacy">
                          <span className="text-primary-600 hover:text-primary-700 font-medium hover-lift hover-magnetic">
                            política de privacidad
                          </span>
                        </Link>
                      </label>
                    </div>
                    {errors.terms_accepted && (
                      <p className="form-error animate-slide-down">{errors.terms_accepted.message}</p>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="btn btn-ghost btn-lg flex-1 hover-lift hover-magnetic"
                      >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Anterior
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary btn-lg flex-1 btn-magnetic hover-lift animate-glow"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Creando cuenta...
                          </>
                        ) : (
                          <>
                            Crear Cuenta
                            <CheckCircleIcon className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Divider */}
            <div className="mt-8 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300 dark:border-neutral-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                    ¿Ya tienes cuenta?
                  </span>
                </div>
              </div>
            </div>

            {/* Login Link */}
            <Link href="/auth/login">
              <Button
                variant="ghost"
                size="md"
                fullWidth
              >
                Iniciar Sesión
              </Button>
            </Link>
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

export default RegistroPage;