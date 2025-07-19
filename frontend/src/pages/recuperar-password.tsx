import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  CheckCircleIcon, 
  XMarkIcon, 
  ArrowPathIcon, 
  ShieldCheckIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';
import { CorporateLayout, CorporateCard, CorporateButton, CorporateInput } from '@/components/ui';

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
    <>
      <Head>
        <title>Restablecer Contraseña | FIXIA</title>
        <meta name="description" content="Restablecer contraseña en FIXIA - Plataforma profesional de servicios certificados" />
        <meta name="keywords" content="restablecer contraseña, FIXIA, servicios profesionales, recuperar acceso" />
      </Head>

      <CorporateLayout variant="centered" maxWidth="md">
        <div className="w-full max-w-md mx-auto">
          {/* Corporate Logo */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <Logo size="xl" variant="gradient" className="justify-center" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
              Restablecer Contraseña
            </h1>
            <p className="text-secondary-600 font-medium">
              Sistema Profesional Certificado
            </p>
          </div>

          {/* Corporate Reset Card */}
          <CorporateCard variant="glass" className="backdrop-blur-2xl bg-white/90 border border-white/50 shadow-2xl">
            
            {status === 'success' ? (
              <div className="text-center space-y-8">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-success-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircleIcon className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-success-800 mb-3">
                    ¡Contraseña Restablecida!
                  </h2>
                  <p className="text-secondary-600 font-medium mb-6">
                    {message}
                  </p>
                  <div className="bg-gradient-to-r from-success-50 to-accent-50 border-2 border-success-200 rounded-xl p-6">
                    <div className="flex items-center justify-center text-success-700">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-success-600 mr-3"></div>
                      <span className="font-semibold">Redirigiendo al login...</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-trust-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <LockClosedIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                    Nueva Contraseña
                  </h2>
                  <p className="text-secondary-600 font-medium">
                    Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta profesional.
                  </p>
                </div>

                {/* Error Message */}
                {status === 'error' && (
                  <CorporateCard variant="elevated" className="border-l-4 border-l-error-500 bg-error-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-error-100 rounded-xl flex items-center justify-center">
                        <ExclamationCircleIcon className="h-5 w-5 text-error-600" />
                      </div>
                      <p className="text-error-800 font-medium">{message}</p>
                    </div>
                  </CorporateCard>
                )}

                {/* Nueva Contraseña */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-secondary-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-secondary-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-11 pr-12 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-secondary-700 mb-2">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShieldCheckIcon className="h-5 w-5 text-secondary-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-11 pr-12 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                      placeholder="Confirma tu nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Indicador de fortaleza */}
                {password.length > 0 && (
                  <CorporateCard variant="elevated" className="bg-gradient-to-r from-secondary-50 to-primary-50">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-secondary-700">
                          Fortaleza de la contraseña:
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          getPasswordStrength(password) >= 3 ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
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
                                : 'bg-secondary-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CorporateCard>
                )}

                {/* Botón Submit */}
                <CorporateButton
                  type="submit"
                  disabled={status === 'loading' || !password || !confirmPassword}
                  loading={status === 'loading'}
                  size="lg"
                  className="w-full"
                  rightIcon={status !== 'loading' ? <CheckCircleIcon className="h-5 w-5" /> : undefined}
                >
                  {status === 'loading' ? 'Restableciendo...' : 'Restablecer Contraseña'}
                </CorporateButton>
              </form>
            )}
          </CorporateCard>

          {/* Corporate Footer */}
          <div className="text-center mt-8 space-y-3">
            <p className="text-secondary-500 text-sm font-medium">
              ¿Recordaste tu contraseña?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Iniciar Sesión
              </button>
            </p>
            <p className="text-secondary-400 text-xs">
              ¿Problemas? Contáctanos en{' '}
              <a 
                href="mailto:contacto@fixia.com.ar" 
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                contacto@fixia.com.ar
              </a>
            </p>
          </div>
        </div>
      </CorporateLayout>
    </>
  );
}