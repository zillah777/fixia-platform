import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Upload, FileCheck, Camera, Shield } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MarketplaceLayout from '@/components/layouts/MarketplaceLayout';

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
      <MarketplaceLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </MarketplaceLayout>
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

      <MarketplaceLayout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="glass-medium rounded-2xl p-6 mb-6">
              <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Verificación de Identidad
              </h1>
              <p className="text-muted-foreground">
                Verifica tu identidad para ofrecer servicios como AS profesional
              </p>
            </div>
          </motion.div>

          {/* Progress */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="glass rounded-lg p-4">
              <div className="flex items-center justify-center space-x-4 md:space-x-8">
                <div className={`flex items-center transition-all duration-300 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${step >= 1 ? 'liquid-gradient text-white shadow-lg' : 'glass-light'}`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Instrucciones</span>
                </div>
                <div className={`flex items-center transition-all duration-300 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${step >= 2 ? 'liquid-gradient text-white shadow-lg' : 'glass-light'}`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium hidden sm:inline">Documentos</span>
                </div>
                <div className={`flex items-center transition-all duration-300 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${step >= 3 ? 'liquid-gradient text-white shadow-lg' : 'glass-light'}`}>
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium hidden sm:inline">Selfie</span>
                </div>
                <div className={`flex items-center transition-all duration-300 ${step >= 4 ? 'text-green-400' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${step >= 4 ? 'bg-green-500 text-white shadow-lg' : 'glass-light'}`}>
                    ✓
                  </div>
                  <span className="ml-2 text-sm font-medium hidden sm:inline">Completado</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-medium border-white/20">
            {step === 1 && (
              <div className="text-center">
                <span className="block text-4xl text-blue-600 mb-4">🆔</span>
                <h2 className="text-xl font-semibold mb-4">¿Qué necesitas?</h2>
                <div className="space-y-4 text-left max-w-md mx-auto">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-700">DNI argentino vigente (ambos lados)</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-700">Selfie con el DNI en mano</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-700">Buena iluminación y calidad</span>
                  </div>
                </div>
                <Button
                  onClick={() => setStep(2)}
                  variant="primary"
                  size="lg"
                  className="mt-6"
                >
                  Comenzar Verificación
                </Button>
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
                        <span className="block text-4xl text-gray-400 mb-2">📄</span>
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
                        <span className="block text-4xl text-gray-400 mb-2">📄</span>
                        <p className="text-sm text-gray-600">
                          {documents.dniBack ? documents.dniBack.name : 'Subir imagen del dorso'}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    onClick={() => setStep(1)}
                    variant="secondary"
                    size="lg"
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!documents.dniFront || !documents.dniBack}
                    variant="primary"
                    size="lg"
                  >
                    Siguiente
                  </Button>
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
                        <span className="block text-6xl text-gray-400 mb-4">📷</span>
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
                      <span className="text-red-600 mr-2">⚠</span>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <Button
                    onClick={() => setStep(2)}
                    variant="secondary"
                    size="lg"
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!documents.selfie || isSubmitting}
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                    loadingText="Enviando..."
                  >
                    Enviar Verificación
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-8">
                <span className="block text-6xl text-green-500 mb-4">✓</span>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  ¡Verificación Enviada!
                </h2>
                <p className="text-gray-600 mb-6">
                  Revisaremos tu documentación en un plazo de 24-48 horas.
                  Te notificaremos por email cuando el proceso esté completo.
                </p>
                <Button
                  onClick={() => router.push('/as/dashboard')}
                  variant="primary"
                  size="lg"
                >
                  Volver al Dashboard
                </Button>
              </div>
            )}
            </Card>
          </motion.div>
        </div>
      </MarketplaceLayout>
    </>
  );
};

export default VerificacionDNI;