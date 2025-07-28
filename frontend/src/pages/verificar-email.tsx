import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw, Mail } from 'lucide-react';

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

      <div className="min-h-screen relative overflow-hidden" style={{
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)'
      }}>
        {/* Floating Orbs Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-30" style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
            animation: 'float 20s ease-in-out infinite'
          }} />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full opacity-40" style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)',
            animation: 'float 25s ease-in-out infinite reverse'
          }} />
          <div className="absolute -bottom-32 left-1/3 w-64 h-64 rounded-full opacity-20" style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(236, 72, 153, 0.1) 40%, transparent 70%)',
            animation: 'float 30s ease-in-out infinite'
          }} />
        </div>
        
        <div className="relative flex items-center justify-center min-h-screen py-12 px-4">
          <div className="w-full max-w-md mx-auto">
            {/* Logo con Liquid Glass */}
            <div className="text-center mb-8">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto rounded-2xl relative" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-500/20" />
                  <div className="relative flex items-center justify-center h-full">
                    <svg width="32" height="32" viewBox="0 0 32 32" className="text-white">
                      <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      <circle cx="16" cy="16" r="14" fill="url(#logoGradient)" opacity="0.9"/>
                      <text x="16" y="22" textAnchor="middle" className="fill-white font-bold text-lg">F</text>
                    </svg>
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-3" style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}>
                Verificación de Email
              </h1>
              <p className="text-white/80 font-medium text-lg">
                Sistema Profesional Certificado
              </p>
            </div>

            <div className="relative rounded-3xl p-8 text-center" style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3), 0 16px 32px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
            
            {status === 'loading' && (
              <div className="space-y-8">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-3xl relative" style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    boxShadow: '0 16px 32px rgba(59, 130, 246, 0.2)'
                  }}>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/30 to-purple-500/30" />
                    <div className="relative flex items-center justify-center h-full">
                      <RefreshCw className="w-8 h-8 text-blue-300 animate-spin" />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4" style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}>
                    Verificando tu email...
                  </h2>
                  <p className="text-white/80 font-medium text-lg leading-relaxed">
                    Por favor espera mientras procesamos tu verificación de cuenta profesional.
                  </p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-8">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-3xl relative" style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    boxShadow: '0 16px 32px rgba(34, 197, 94, 0.2)'
                  }}>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-400/30 to-emerald-500/30" />
                    <div className="relative flex items-center justify-center h-full">
                      <CheckCircle className="w-10 h-10 text-green-300" />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-green-300 mb-4" style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}>
                    ¡Email Verificado!
                  </h2>
                  <p className="text-white/80 font-medium text-lg mb-8 leading-relaxed">
                    {message}
                  </p>
                  <div className="rounded-2xl p-6 relative" style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    <div className="flex items-center justify-center text-green-300">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-300 mr-3"></div>
                      <span className="font-semibold text-lg">Redirigiendo al panel profesional...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-8">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-3xl relative" style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    boxShadow: '0 16px 32px rgba(239, 68, 68, 0.2)'
                  }}>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-400/30 to-red-600/30" />
                    <div className="relative flex items-center justify-center h-full">
                      <XCircle className="w-10 h-10 text-red-300" />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-red-300 mb-4" style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}>
                    Error de Verificación
                  </h2>
                  <p className="text-white/80 font-medium text-lg mb-8 leading-relaxed">
                    {message}
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={handleResendEmail}
                      className="w-full h-14 rounded-2xl relative overflow-hidden font-semibold text-lg transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      <span className="relative z-10 text-white flex items-center justify-center gap-3">
                        <Mail className="w-5 h-5" />
                        Reenviar Email de Verificación
                      </span>
                    </button>
                    <button
                      onClick={() => router.push('/auth/login')}
                      className="w-full h-14 rounded-2xl relative overflow-hidden font-semibold text-lg transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <span className="relative z-10 text-white">Ir al Login</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Footer con Liquid Glass */}
            <div className="text-center mt-10 space-y-4">
              <p className="text-white/70 text-lg font-medium">¿Problemas con la verificación?</p>
              <a 
                href="mailto:contacto@fixia.com.ar" 
                className="inline-block px-6 py-3 rounded-xl font-semibold text-white/90 hover:text-white transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                }}
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