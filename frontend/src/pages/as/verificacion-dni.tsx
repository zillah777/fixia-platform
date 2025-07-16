import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import {
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  UserIcon,
  ShieldCheckIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const VerificacionDNI: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [documents, setDocuments] = useState({
    dniFront: null as File | null,
    dniBack: null as File | null,
    selfie: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (type: 'dniFront' | 'dniBack' | 'selfie') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no debe superar los 5MB');
        return;
      }
      
      setDocuments(prev => ({
        ...prev,
        [type]: file
      }));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documents.dniFront || !documents.dniBack || !documents.selfie) {
      setError('Todos los documentos son requeridos');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('dniFront', documents.dniFront);
      formData.append('dniBack', documents.dniBack);
      formData.append('selfie', documents.selfie);

      const response = await fetch('/api/verification/dni', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        setStep(4); // Paso de confirmación
      } else {
        const data = await response.json();
        setError(data.error || 'Error al procesar la verificación');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.user_type !== 'provider') {
    router.push('/auth/login');
    return null;
  }

  return (
    <>
      <Head>
        <title>Verificación DNI - Fixia</title>
        <meta name="description" content="Verificación de identidad para profesionales AS" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <ShieldCheckIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verificación de Identidad
            </h1>
            <p className="text-gray-600">
              Verifica tu identidad para ofrecer servicios como AS profesional
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Instrucciones</span>
              </div>
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Documentos</span>
              </div>
              <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium">Selfie</span>
              </div>
              <div className={`flex items-center ${step >= 4 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium">Completado</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            {step === 1 && (
              <div className="text-center">
                <IdentificationIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-4">¿Qué necesitas?</h2>
                <div className="space-y-4 text-left max-w-md mx-auto">
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-gray-700">DNI argentino vigente (ambos lados)</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-gray-700">Selfie con el DNI en mano</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-gray-700">Buena iluminación y calidad</span>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Comenzar Verificación
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Subir Documentos</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* DNI Frente */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      DNI - Frente
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload('dniFront')}
                        className="hidden"
                        id="dniFront"
                      />
                      <label htmlFor="dniFront" className="cursor-pointer">
                        <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {documents.dniFront ? documents.dniFront.name : 'Subir imagen del frente'}
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* DNI Dorso */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      DNI - Dorso
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload('dniBack')}
                        className="hidden"
                        id="dniBack"
                      />
                      <label htmlFor="dniBack" className="cursor-pointer">
                        <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {documents.dniBack ? documents.dniBack.name : 'Subir imagen del dorso'}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!documents.dniFront || !documents.dniBack}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Selfie con DNI</h2>
                
                <div className="max-w-md mx-auto">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Selfie sosteniendo tu DNI
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload('selfie')}
                        className="hidden"
                        id="selfie"
                      />
                      <label htmlFor="selfie" className="cursor-pointer">
                        <CameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-2">
                          {documents.selfie ? documents.selfie.name : 'Tomar selfie con DNI'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Asegúrate de que tu rostro y el DNI sean claramente visibles
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!documents.selfie || isSubmitting}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Verificación'}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  ¡Verificación Enviada!
                </h2>
                <p className="text-gray-600 mb-6">
                  Revisaremos tu documentación en un plazo de 24-48 horas.
                  Te notificaremos por email cuando el proceso esté completo.
                </p>
                <button
                  onClick={() => router.push('/as/dashboard')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Volver al Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerificacionDNI;