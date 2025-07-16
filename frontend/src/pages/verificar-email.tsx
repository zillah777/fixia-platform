import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';

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
      const response = await fetch('/api/email-verification/verify', {
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

      const response = await fetch('/api/email-verification/resend', {
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
        <title>Verificar Email - Fixia</title>
        <meta name="description" content="Verificación de email en Fixia" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-blue-500 to-purple-600 opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-600 opacity-5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="max-w-md w-full relative z-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <Logo size="xl" variant="gradient" className="justify-center" />
            </div>
            <p className="text-gray-600 font-medium">Verificación de Email</p>
          </div>

          {/* Tarjeta de verificación */}
          <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 p-8 text-center">
            
            {status === 'loading' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Verificando tu email...
                  </h2>
                  <p className="text-gray-600">
                    Por favor espera mientras procesamos tu verificación.
                  </p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    ¡Email Verificado!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {message}
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-center text-green-700">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="font-medium">Redirigiendo al dashboard...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-800 mb-2">
                    Error de Verificación
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {message}
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={handleResendEmail}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Reenviar Email de Verificación
                    </button>
                    <button
                      onClick={() => router.push('/auth/login')}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400"
                    >
                      Ir al Login
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 space-y-2">
            <p className="text-gray-500 text-sm">¿Problemas con la verificación?</p>
            <a 
              href="mailto:soporte@fixia.com.ar" 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              Contáctanos en soporte@fixia.com.ar
            </a>
          </div>
        </div>
      </div>
    </>
  );
}