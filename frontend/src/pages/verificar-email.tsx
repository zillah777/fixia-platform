import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CheckCircleIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';
import { CorporateLayout, CorporateCard, CorporateButton } from '@/components/ui';

export default function VerificarEmail() {
  const router = useRouter();
  const { token, type } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token && typeof token === 'string') {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/email-verification/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || '¡Email verificado exitosamente!');
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
          const userType = type === 'provider' ? 'as' : 'explorador';
          router.push(`/${userType}/dashboard`);
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Error al verificar el email');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
      setMessage('Error de conexión. Por favor, intenta de nuevo.');
    }
  };

  const handleResendEmail = async () => {
    try {
      const email = prompt('Ingresa tu email para reenviar la verificación:');
      if (!email) return;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/email-verification/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Email de verificación reenviado exitosamente');
      } else {
        alert(data.error || 'Error al reenviar email');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  return (
    <>
      <Head>
        <title>Verificar Email | FIXIA</title>
        <meta name="description" content="Verificación de email en FIXIA - Plataforma profesional de servicios certificados" />
        <meta name="keywords" content="verificar email, FIXIA, servicios profesionales, verificación cuenta" />
      </Head>

      <CorporateLayout variant="centered" maxWidth="md">
        <div className="w-full max-w-md mx-auto">
          {/* Corporate Logo */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <Logo size="xl" variant="gradient" className="justify-center" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
              Verificación de Email
            </h1>
            <p className="text-secondary-600 font-medium">
              Sistema Profesional Certificado
            </p>
          </div>

          {/* Corporate Verification Card */}
          <CorporateCard variant="glass" className="text-center backdrop-blur-2xl bg-white/90 border border-white/50 shadow-2xl">
            
            {status === 'loading' && (
              <div className="space-y-8">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-trust-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <ArrowPathIcon className="h-10 w-10 text-white animate-spin" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-secondary-900 mb-3">
                    Verificando tu email...
                  </h2>
                  <p className="text-secondary-600 font-medium">
                    Por favor espera mientras procesamos tu verificación de cuenta profesional.
                  </p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-8">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-success-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircleIcon className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-success-800 mb-3">
                    ¡Email Verificado!
                  </h2>
                  <p className="text-secondary-600 font-medium mb-6">
                    {message}
                  </p>
                  <div className="bg-gradient-to-r from-success-50 to-accent-50 border-2 border-success-200 rounded-xl p-6">
                    <div className="flex items-center justify-center text-success-700">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-success-600 mr-3"></div>
                      <span className="font-semibold">Redirigiendo al panel profesional...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-8">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-error-500 to-error-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <XMarkIcon className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-error-800 mb-3">
                    Error de Verificación
                  </h2>
                  <p className="text-secondary-600 font-medium mb-8">
                    {message}
                  </p>
                  <div className="space-y-4">
                    <CorporateButton
                      onClick={handleResendEmail}
                      size="lg"
                      className="w-full"
                    >
                      Reenviar Email de Verificación
                    </CorporateButton>
                    <CorporateButton
                      onClick={() => router.push('/auth/login')}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      Ir al Login
                    </CorporateButton>
                  </div>
                </div>
              </div>
            )}
          </CorporateCard>

          {/* Corporate Footer */}
          <div className="text-center mt-8 space-y-3">
            <p className="text-secondary-500 text-sm font-medium">¿Problemas con la verificación?</p>
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