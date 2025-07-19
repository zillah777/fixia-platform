import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';
import { CorporateLayout, CorporateCard, CorporateButton, CorporateInput } from '@/components/ui';

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
    <>
      <Head>
        <title>Solicitar Restablecimiento de Contraseña | FIXIA</title>
        <meta name="description" content="Solicitar restablecimiento de contraseña en FIXIA - Plataforma profesional de servicios certificados" />
        <meta name="keywords" content="solicitar restablecimiento, contraseña, FIXIA, servicios profesionales, recuperar acceso" />
      </Head>

      <CorporateLayout variant="centered" maxWidth="md">
        <div className="w-full max-w-md mx-auto">
          {/* Corporate Logo */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <Logo size="xl" variant="gradient" className="justify-center" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
              Recuperar Contraseña
            </h1>
            <p className="text-secondary-600 font-medium">
              Sistema Profesional Certificado
            </p>
          </div>

          {/* Corporate Password Reset Request Card */}
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
                    ¡Email Enviado!
                  </h2>
                  <p className="text-secondary-600 font-medium mb-6">
                    {message}
                  </p>
                  <div className="bg-gradient-to-r from-success-50 to-accent-50 border-2 border-success-200 rounded-xl p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-center text-success-700">
                        <EnvelopeIcon className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Revisa tu bandeja de entrada</span>
                      </div>
                      <p className="text-sm text-success-600">
                        Si no encuentras el email, revisa tu carpeta de spam o promociones
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <CorporateButton
                    onClick={() => router.push('/auth/login')}
                    variant="outline"
                    size="lg"
                    className="w-full"
                    leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
                  >
                    Volver al Login
                  </CorporateButton>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-trust-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <EnvelopeIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                    Recuperar Contraseña
                  </h2>
                  <p className="text-secondary-600 font-medium">
                    Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
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

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-secondary-700 mb-2">
                    Dirección de Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-secondary-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                {/* Security Notice */}
                <CorporateCard variant="elevated" className="bg-gradient-to-r from-primary-50 to-trust-50">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ExclamationCircleIcon className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-900 mb-1">
                        Nota de Seguridad
                      </h3>
                      <p className="text-sm text-primary-700">
                        El enlace de restablecimiento será válido por 1 hora y solo podrá ser usado una vez. 
                        Si no tienes acceso a tu email, contáctanos.
                      </p>
                    </div>
                  </div>
                </CorporateCard>

                {/* Submit Button */}
                <CorporateButton
                  type="submit"
                  disabled={status === 'loading' || !email.trim()}
                  loading={status === 'loading'}
                  size="lg"
                  className="w-full"
                  rightIcon={status !== 'loading' ? <PaperAirplaneIcon className="h-5 w-5" /> : undefined}
                >
                  {status === 'loading' ? 'Enviando...' : 'Enviar Enlace de Restablecimiento'}
                </CorporateButton>

                {/* Back to Login */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push('/auth/login')}
                    className="text-secondary-600 hover:text-primary-600 font-medium text-sm transition-colors inline-flex items-center"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Volver al Login
                  </button>
                </div>
              </form>
            )}
          </CorporateCard>

          {/* Corporate Footer */}
          <div className="text-center mt-8 space-y-3">
            <p className="text-secondary-500 text-sm font-medium">¿Problemas con tu cuenta?</p>
            <a 
              href="mailto:contacto@fixia.com.ar" 
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
            >
              Contáctanos en contacto@fixia.com.ar
            </a>
          </div>
        </div>
      </CorporateLayout>
    </>
  );
}