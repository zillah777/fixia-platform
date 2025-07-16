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
import Logo from '@/components/Logo';
import MultiStepForm from '@/components/MultiStepForm';

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

  const totalSteps = 3;

  return (
    <>
      <Head>
        <title>Registro - Fixia</title>
        <meta name="description" content="Crea tu cuenta en Fixia y forma parte de las páginas amarillas del futuro" />
      </Head>

      {/* Background with Gradient */}
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-primary opacity-10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-secondary opacity-10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg w-full space-y-8">
            {/* Header */}
            <div className="text-center animate-fade-in">
              <Link href="/">
                <div className="hover-lift cursor-pointer inline-block mb-6">
                  <Logo size="xl" variant="gradient" />
                </div>
              </Link>
              <h1 className="text-3xl font-bold text-primary mb-4">
                Únete a Fixia
              </h1>
              <p className="text-secondary text-lg">
                Forma parte de las páginas amarillas del futuro
              </p>
            </div>

            {/* Progress Bar */}
            <div className="card glass p-6 animate-scale-in" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-secondary">Paso {currentStep} de {totalSteps}</span>
                <span className="text-sm font-medium text-primary">{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Registration Form */}
            <div className="card glass hover-lift animate-scale-in" style={{animationDelay: '0.2s'}}>
              {registerError && (
                <div className="mb-6 bg-gradient-to-r from-error-50 to-error-100 border border-error-200 rounded-xl p-4 animate-shake">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-error-600 mr-3 animate-bounce" />
                    <p className="text-sm text-error-700 font-medium">{registerError}</p>
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
                            errors.first_name ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''
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
                            errors.last_name ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''
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
                            errors.email ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''
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
                            errors.confirm_password ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-primary-600 transition-colors hover-bounce p-1"
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

            {/* Login Link */}
            <div className="text-center animate-fade-in" style={{animationDelay: '0.4s'}}>
              <p className="text-secondary">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/auth/login">
                  <span className="text-primary-600 hover:text-primary-700 font-semibold cursor-pointer hover-lift hover-magnetic">
                    Inicia sesión
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

export default RegistroPage;