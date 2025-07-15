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
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { RegisterData } from '@/types';

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
    trigger
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      user_type: 'customer'
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
      : ['password', 'confirm_password', 'user_type'];
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Registro - Fixia</title>
        <meta name="description" content="Crea tu cuenta en Fixia y accede a todos nuestros servicios" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href="/">
              <h2 className="text-3xl font-bold text-blue-600 mb-2 cursor-pointer">Fixia</h2>
            </Link>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Crear Cuenta
            </h3>
            <p className="text-gray-600">
              Únete a Fixia y conecta con {watchedUserType === 'provider' ? 'clientes' : 'profesionales'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Info Personal</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Seguridad</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Detalles</span>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-xl shadow-sm border p-8">
            {registerError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-700">{registerError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register('first_name')}
                          type="text"
                          id="first_name"
                          autoComplete="given-name"
                          className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.first_name ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Juan"
                        />
                      </div>
                      {errors.first_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register('last_name')}
                          type="text"
                          id="last_name"
                          autoComplete="family-name"
                          className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.last_name ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Pérez"
                        />
                      </div>
                      {errors.last_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...register('email')}
                        type="email"
                        id="email"
                        autoComplete="email"
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="tu@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium"
                  >
                    Continuar
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </button>
                </>
              )}

              {/* Step 2: Security */}
              {currentStep === 2 && (
                <>
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="new-password"
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...register('confirm_password')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirm_password"
                        autoComplete="new-password"
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirm_password && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
                    )}
                  </div>

                  {/* User Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tipo de Cuenta
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <label className="relative">
                        <input
                          {...register('user_type')}
                          type="radio"
                          value="customer"
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          watchedUserType === 'customer' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-center">
                            <UserGroupIcon className="h-6 w-6 text-blue-600 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">Explorador (Cliente)</p>
                              <p className="text-sm text-gray-600">Busca y contrata servicios profesionales</p>
                            </div>
                            {watchedUserType === 'customer' && (
                              <CheckCircleIcon className="h-5 w-5 text-blue-600 ml-auto" />
                            )}
                          </div>
                        </div>
                      </label>

                      <label className="relative">
                        <input
                          {...register('user_type')}
                          type="radio"
                          value="provider"
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          watchedUserType === 'provider' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-center">
                            <BriefcaseIcon className="h-6 w-6 text-blue-600 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">AS (Profesional)</p>
                              <p className="text-sm text-gray-600">Ofrece tus servicios y genera ingresos</p>
                            </div>
                            {watchedUserType === 'provider' && (
                              <CheckCircleIcon className="h-5 w-5 text-blue-600 ml-auto" />
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                    {errors.user_type && (
                      <p className="mt-1 text-sm text-red-600">{errors.user_type.message}</p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors font-medium"
                    >
                      Continuar
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: Details */}
              {currentStep === 3 && (
                <>
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono (Opcional)
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...register('phone')}
                        type="tel"
                        id="phone"
                        autoComplete="tel"
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="+54 9 280 123-4567"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección (Opcional)
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...register('address')}
                        type="text"
                        id="address"
                        autoComplete="address-line1"
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.address ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Av. San Martín 123, Rawson"
                      />
                    </div>
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div>
                    <label className="flex items-start">
                      <input
                        {...register('terms_accepted')}
                        type="checkbox"
                        className={`mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                          errors.terms_accepted ? 'border-red-300' : ''
                        }`}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Acepto los{' '}
                        <Link href="/legal/terms">
                          <span className="text-blue-600 hover:text-blue-700 cursor-pointer">
                            términos y condiciones
                          </span>
                        </Link>{' '}
                        y la{' '}
                        <Link href="/legal/privacy">
                          <span className="text-blue-600 hover:text-blue-700 cursor-pointer">
                            política de privacidad
                          </span>
                        </Link>
                      </span>
                    </label>
                    {errors.terms_accepted && (
                      <p className="mt-1 text-sm text-red-600">{errors.terms_accepted.message}</p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Anterior
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
                </>
              )}
            </form>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/auth/login">
                <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                  Inicia sesión aquí
                </span>
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/">
              <span className="text-gray-500 hover:text-gray-700 text-sm cursor-pointer">
                ← Volver al inicio
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegistroPage;