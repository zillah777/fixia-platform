import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
        
        // Redirigir al login después de verificar email exitosamente
        setTimeout(() => {
          router.push('/auth/login?verified=true');
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

      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
        </div>
        
        <div className="relative flex items-center justify-center min-h-screen py-12 px-4">
          <div className="w-full max-w-md mx-auto">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-white/20 to-white/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-2xl">F</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Verificación de Email
              </h1>
              <p className="text-white/70 font-medium">
                Sistema Profesional Certificado
              </p>
            </div>

            <Card className="glass border-white/10 text-center">
              <CardContent className="p-8">
            
            {status === 'loading' && (
              <div className="space-y-8">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-trust-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white">⟳</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Verificando tu email...
                  </h2>
                  <p className="text-white/70 font-medium">
                    Por favor espera mientras procesamos tu verificación de cuenta profesional.
                  </p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-8">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-success-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white">✓</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-400 mb-3">
                    ¡Email Verificado!
                  </h2>
                  <p className="text-white/70 font-medium mb-6">
                    {message}
                  </p>
                  <div className="glass-light rounded-xl p-6">
                    <div className="flex items-center justify-center text-green-400">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400 mr-3"></div>
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
                    <span className="text-2xl text-white">×</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-400 mb-3">
                    Error de Verificación
                  </h2>
                  <p className="text-white/70 font-medium mb-8">
                    {message}
                  </p>
                  <div className="space-y-4">
                    <Button
                      onClick={handleResendEmail}
                      className="w-full h-11 mb-3"
                    >
                      Reenviar Email de Verificación
                    </Button>
                    <Button
                      onClick={() => router.push('/auth/login')}
                      className="w-full h-11 glass border-white/20 hover:glass-medium"
                    >
                      Ir al Login
                    </Button>
                  </div>
                </div>
              </div>
            )}
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center mt-8 space-y-3">
              <p className="text-white/60 text-sm font-medium">¿Problemas con la verificación?</p>
              <a 
                href="mailto:contacto@fixia.com.ar" 
                className="text-white hover:text-white/80 font-semibold text-sm transition-colors"
              >
                Contáctanos en contacto@fixia.com.ar
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}