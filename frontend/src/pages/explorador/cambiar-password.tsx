import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Key,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Lock
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

const CambiarPassword: NextPage = () => {
  const { user, loading, changePassword } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.user_type !== 'customer')) {
      router.push('/auth/login');
      return;
    }
  }, [user, loading, router]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Debe contener al menos un carácter especial');
    }
    
    return errors;
  };

  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, newPassword: value }));
    const errors = validatePassword(value);
    setValidationErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    // Validations
    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      setValidationErrors(passwordErrors);
      setSaving(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setSaving(false);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      setSaving(false);
      return;
    }

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setMessage('Contraseña cambiada exitosamente');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        router.push('/explorador/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    const errors = validatePassword(password);
    const strength = 5 - errors.length;
    
    if (strength === 0) return { label: 'Muy débil', color: 'bg-red-500', width: '20%' };
    if (strength === 1) return { label: 'Débil', color: 'bg-red-400', width: '40%' };
    if (strength === 2) return { label: 'Regular', color: 'bg-yellow-500', width: '60%' };
    if (strength === 3) return { label: 'Buena', color: 'bg-blue-500', width: '80%' };
    if (strength >= 4) return { label: 'Excelente', color: 'bg-green-500', width: '100%' };
    
    return { label: '', color: '', width: '0%' };
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)'
      }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-30" style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
            animation: 'float 20s ease-in-out infinite'
          }} />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full opacity-40" style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)',
            animation: 'float 25s ease-in-out infinite reverse'
          }} />
        </div>
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center p-8 rounded-3xl" style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white/90 font-medium text-lg">Cargando...</div>
          </div>
        </div>
      </div>
    );
  }

  const strength = getPasswordStrength(formData.newPassword);

  return (
    <>
      <Head>
        <title>Cambiar Contraseña | FIXIA</title>
        <meta name="description" content="Cambia tu contraseña de forma segura - Sistema Liquid Glass" />
        <meta name="keywords" content="cambiar contraseña, seguridad, FIXIA, explorador, password" />
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

        <div className="relative z-10 min-h-screen py-8 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header con Liquid Glass */}
            <div className="mb-8 p-6 rounded-3xl" style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3), 0 16px 32px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <div className="flex items-center justify-between">
                <Link href="/explorador/dashboard">
                  <button className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105" style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}>
                    <ArrowLeft className="w-5 h-5" />
                    Volver
                  </button>
                </Link>
                <div className="text-right flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    <Lock className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2" style={{
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}>
                      Cambiar Contraseña
                    </h1>
                    <p className="text-white/70 font-medium">
                      Actualiza tu contraseña de forma segura
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages con Liquid Glass */}
            {message && (
              <div className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{
                background: 'rgba(34, 197, 94, 0.1)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                boxShadow: '0 8px 16px rgba(34, 197, 94, 0.1)'
              }}>
                <CheckCircle className="w-6 h-6 text-green-300" />
                <span className="text-green-300 font-medium">{message}</span>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{
                background: 'rgba(239, 68, 68, 0.1)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                boxShadow: '0 8px 16px rgba(239, 68, 68, 0.1)'
              }}>
                <AlertTriangle className="w-6 h-6 text-red-300" />
                <span className="text-red-300 font-medium">{error}</span>
              </div>
            )}

            {/* Security Tips con Liquid Glass */}
            <div className="mb-6 p-6 rounded-3xl" style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 16px 32px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <ShieldCheck className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-4" style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}>
                    Consejos de Seguridad
                  </h3>
                  <ul className="text-white/80 space-y-3 text-sm leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-300 font-bold">•</span>
                      Usa una contraseña única que no uses en otros sitios
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-300 font-bold">•</span>
                      Combina letras mayúsculas, minúsculas, números y símbolos
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-300 font-bold">•</span>
                      Evita información personal como nombres o fechas
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-300 font-bold">•</span>
                      Considera usar un gestor de contraseñas
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Password Form con Liquid Glass */}
            <div className="rounded-3xl p-8" style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3), 0 16px 32px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="block text-white font-semibold text-lg mb-2" style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    Contraseña Actual *
                  </label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      required
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full pl-12 pr-12 py-4 rounded-xl font-medium text-white placeholder-white/60 transition-all duration-300 focus:scale-105 focus:outline-none"
                      placeholder="Tu contraseña actual"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="block text-white font-semibold text-lg mb-2" style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      required
                      value={formData.newPassword}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 rounded-xl font-medium text-white placeholder-white/60 transition-all duration-300 focus:scale-105 focus:outline-none"
                      placeholder="Tu nueva contraseña"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Strength con Liquid Glass */}
                  {formData.newPassword && (
                    <div className="mt-4 p-4 rounded-2xl" style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-white/80 font-medium">Fortaleza de contraseña:</span>
                        <span className={`font-semibold ${
                          strength.color === 'bg-red-500' ? 'text-red-400' :
                          strength.color === 'bg-red-400' ? 'text-red-300' :
                          strength.color === 'bg-yellow-500' ? 'text-yellow-300' :
                          strength.color === 'bg-blue-500' ? 'text-blue-300' :
                          'text-green-300'
                        }`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="w-full rounded-full h-3" style={{
                        background: 'rgba(255, 255, 255, 0.1)'
                      }}>
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${strength.color}`}
                          style={{ 
                            width: strength.width,
                            boxShadow: strength.width !== '0%' ? `0 0 8px ${
                              strength.color === 'bg-red-500' ? 'rgba(239, 68, 68, 0.5)' :
                              strength.color === 'bg-red-400' ? 'rgba(248, 113, 113, 0.5)' :
                              strength.color === 'bg-yellow-500' ? 'rgba(234, 179, 8, 0.5)' :
                              strength.color === 'bg-blue-500' ? 'rgba(59, 130, 246, 0.5)' :
                              'rgba(34, 197, 94, 0.5)'
                            }` : 'none'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Validation Errors con Liquid Glass */}
                  {validationErrors.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl" style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      boxShadow: '0 8px 16px rgba(239, 68, 68, 0.1)'
                    }}>
                      <p className="text-red-300 font-semibold text-sm mb-3">La contraseña debe cumplir:</p>
                      <ul className="text-red-200 text-sm space-y-2">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-300 font-bold">•</span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-white font-semibold text-lg mb-2" style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    Confirmar Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full pl-12 pr-12 py-4 rounded-xl font-medium text-white placeholder-white/60 transition-all duration-300 focus:scale-105 focus:outline-none"
                      placeholder="Confirma tu nueva contraseña"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <div className="mt-3 p-3 rounded-xl" style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}>
                      <p className="text-red-300 text-sm font-medium">Las contraseñas no coinciden</p>
                    </div>
                  )}
                </div>

                {/* Actions con Liquid Glass */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8" style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <Link href="/explorador/dashboard" className="flex-1">
                    <button
                      type="button"
                      className="w-full px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        color: 'white'
                      }}
                    >
                      Cancelar
                    </button>
                  </Link>
                  <button
                    type="submit"
                    disabled={saving || validationErrors.length > 0 || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                    className="flex-1 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: saving || validationErrors.length > 0 || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword
                        ? 'rgba(156, 163, 175, 0.3)' 
                        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: saving || validationErrors.length > 0 || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword
                        ? '0 8px 32px rgba(0, 0, 0, 0.2)' 
                        : '0 8px 32px rgba(59, 130, 246, 0.3)',
                      color: 'white'
                    }}
                  >
                    {saving ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Cambiando...
                      </div>
                    ) : (
                      'Cambiar Contraseña'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CambiarPassword;