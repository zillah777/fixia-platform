import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { CorporateNavigation } from '@/components/ui';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-gray-900 mx-auto mb-6"></div>
          <p className="text-gray-600 font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  const strength = getPasswordStrength(formData.newPassword);

  return (
    <>
      <Head>
        <title>Cambiar Contraseña | Fixia</title>
        <meta name="description" content="Cambia tu contraseña de forma segura" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <CorporateNavigation 
          userType="customer" 
          user={user} 
          onLogout={() => {}}
        />

        <div className="sidebar-desktop:ml-72 xs:sidebar-desktop:ml-80">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/explorador/dashboard">
                  <button className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all">
                    <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </Link>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Cambiar Contraseña</h1>
                  <p className="text-gray-600 mt-1">Actualiza tu contraseña de forma segura</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">{message}</span>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            )}

            {/* Security Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Consejos de Seguridad</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Usa una contraseña única que no uses en otros sitios</li>
                    <li>• Combina letras mayúsculas, minúsculas, números y símbolos</li>
                    <li>• Evita información personal como nombres o fechas</li>
                    <li>• Considera usar un gestor de contraseñas</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Password Form */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Contraseña Actual *
                  </label>
                  <div className="relative">
                    <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      required
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-all"
                      placeholder="Tu contraseña actual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      required
                      value={formData.newPassword}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-all"
                      placeholder="Tu nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {formData.newPassword && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Fortaleza de contraseña:</span>
                        <span className={`font-semibold ${strength.color.replace('bg-', 'text-')}`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-red-800 font-semibold text-sm mb-2">La contraseña debe cumplir:</p>
                      <ul className="text-red-700 text-sm space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Confirmar Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-all"
                      placeholder="Confirma tu nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="mt-2 text-red-600 text-sm">Las contraseñas no coinciden</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <Link href="/explorador/dashboard" className="flex-1">
                    <button
                      type="button"
                      className="w-full px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    >
                      Cancelar
                    </button>
                  </Link>
                  <button
                    type="submit"
                    disabled={saving || validationErrors.length > 0 || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                    className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
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