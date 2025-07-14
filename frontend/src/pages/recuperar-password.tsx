import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function RecuperarPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

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
      const response = await fetch('/api/email-verification/reset-password', {
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

  return (
    <>
      <Head>
        <title>Restablecer Contraseña - Fixia</title>
        <meta name=\"description\" content=\"Restablecer contraseña en Fixia\" />
      </Head>

      <div className=\"min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4\">
        <div className=\"max-w-md w-full\">
          {/* Logo */}
          <div className=\"text-center mb-8\">
            <div className=\"text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2\">
              🔧 Fixia
            </div>
            <p className=\"text-gray-600\">Restablecer Contraseña</p>
          </div>

          {/* Formulario */}
          <div className=\"backdrop-blur-xl bg-white/70 shadow-2xl rounded-2xl border border-white/20 p-8\">
            
            {status === 'success' ? (
              <div className=\"text-center space-y-4\">
                <div className=\"mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center\">
                  <svg className=\"h-8 w-8 text-green-500\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                    <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M5 13l4 4L19 7\" />
                  </svg>
                </div>
                <h2 className=\"text-xl font-semibold text-green-800\">
                  ¡Contraseña Restablecida!
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
                    Redirigiendo al login...
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className=\"space-y-6\">
                <div className=\"text-center mb-6\">
                  <h2 className=\"text-2xl font-bold text-gray-800 mb-2\">
                    Nueva Contraseña
                  </h2>
                  <p className=\"text-gray-600 text-sm\">
                    Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
                  </p>
                </div>

                {/* Error/Success Message */}
                {status === 'error' && (
                  <div className=\"bg-red-50 border border-red-200 rounded-lg p-4\">
                    <div className=\"flex items-center\">
                      <svg className=\"h-5 w-5 text-red-400 mr-2\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                        <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" />
                      </svg>
                      <p className=\"text-red-800 text-sm\">{message}</p>
                    </div>
                  </div>
                )}

                {/* Nueva Contraseña */}
                <div>
                  <label htmlFor=\"password\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                    Nueva Contraseña
                  </label>
                  <input
                    type=\"password\"
                    id=\"password\"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className=\"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all\"
                    placeholder=\"Mínimo 6 caracteres\"
                  />
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label htmlFor=\"confirmPassword\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                    Confirmar Contraseña
                  </label>
                  <input
                    type=\"password\"
                    id=\"confirmPassword\"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className=\"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all\"
                    placeholder=\"Confirma tu nueva contraseña\"
                  />
                </div>

                {/* Indicador de fortaleza */}
                {password.length > 0 && (
                  <div className=\"space-y-2\">
                    <div className=\"text-sm text-gray-600\">Fortaleza de la contraseña:</div>
                    <div className=\"flex space-x-1\">
                      <div className={`h-2 flex-1 rounded ${password.length >= 6 ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                      <div className={`h-2 flex-1 rounded ${password.length >= 8 && /[A-Z]/.test(password) ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                      <div className={`h-2 flex-1 rounded ${password.length >= 8 && /[0-9]/.test(password) && /[A-Z]/.test(password) ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                    </div>
                  </div>
                )}

                {/* Botón Submit */}
                <button
                  type=\"submit\"
                  disabled={status === 'loading' || !password || !confirmPassword}
                  className=\"w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center\"
                >
                  {status === 'loading' ? (
                    <>
                      <svg className=\"animate-spin -ml-1 mr-3 h-5 w-5\" fill=\"none\" viewBox=\"0 0 24 24\">
                        <circle className=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" strokeWidth=\"4\"></circle>
                        <path className=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>
                      </svg>
                      Restableciendo...
                    </>
                  ) : (
                    'Restablecer Contraseña'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className=\"text-center mt-8 space-y-2\">
            <p className=\"text-gray-500 text-sm\">
              ¿Recordaste tu contraseña?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className=\"text-blue-600 hover:text-blue-700 font-medium\"
              >
                Iniciar Sesión
              </button>
            </p>
            <p className=\"text-gray-400 text-xs\">
              ¿Problemas? Contáctanos en{' '}
              <a href=\"mailto:soporte@fixia.com.ar\" className=\"text-blue-600 hover:text-blue-700\">
                soporte@fixia.com.ar
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}