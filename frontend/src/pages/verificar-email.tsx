import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

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
        <meta name=\"description\" content=\"Verificación de email en Fixia\" />
      </Head>

      <div className=\"min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4\">
        <div className=\"max-w-md w-full\">
          {/* Logo */}
          <div className=\"text-center mb-8\">
            <div className=\"text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2\">
              🔧 Fixia
            </div>
            <p className=\"text-gray-600\">Verificación de Email</p>
          </div>

          {/* Tarjeta de verificación */}
          <div className=\"backdrop-blur-xl bg-white/70 shadow-2xl rounded-2xl border border-white/20 p-8 text-center\">
            
            {status === 'loading' && (
              <div className=\"space-y-4\">
                <div className=\"animate-spin mx-auto h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full\"></div>
                <h2 className=\"text-xl font-semibold text-gray-800\">
                  Verificando tu email...
                </h2>
                <p className=\"text-gray-600\">
                  Por favor espera mientras procesamos tu verificación.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className=\"space-y-4\">
                <div className=\"mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center\">
                  <svg className=\"h-8 w-8 text-green-500\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                    <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M5 13l4 4L19 7\" />
                  </svg>
                </div>
                <h2 className=\"text-xl font-semibold text-green-800\">
                  ¡Email Verificado!
                </h2>
                <p className=\"text-gray-600\">
                  {message}
                </p>
                <div className=\"pt-4\">
                  <div className=\"inline-flex items-center text-sm text-blue-600\">
                    <svg className=\"animate-spin -ml-1 mr-3 h-4 w-4\" fill=\"none\" viewBox=\"0 0 24 24\">
                      <circle className=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" strokeWidth=\"4\"></circle>
                      <path className=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>
                    </svg>
                    Redirigiendo al dashboard...
                  </div>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className=\"space-y-4\">
                <div className=\"mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center\">
                  <svg className=\"h-8 w-8 text-red-500\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                    <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M6 18L18 6M6 6l12 12\" />
                  </svg>
                </div>
                <h2 className=\"text-xl font-semibold text-red-800\">
                  Error de Verificación
                </h2>
                <p className=\"text-gray-600\">
                  {message}
                </p>
                <div className=\"space-y-3 pt-4\">
                  <button
                    onClick={handleResendEmail}
                    className=\"w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors\"
                  >
                    Reenviar Email de Verificación
                  </button>
                  <button
                    onClick={() => router.push('/auth/login')}
                    className=\"w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors\"
                  >
                    Ir al Login
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className=\"text-center mt-8 text-gray-500 text-sm\">
            <p>¿Problemas con la verificación?</p>
            <a href=\"mailto:soporte@fixia.com.ar\" className=\"text-blue-600 hover:text-blue-700\">
              Contáctanos en soporte@fixia.com.ar
            </a>
          </div>
        </div>
      </div>
    </>
  );
}