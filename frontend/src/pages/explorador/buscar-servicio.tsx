import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  FireIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/hooks/useAuth';
import { explorerService } from '@/services/explorer';
import { categoriesService } from '@/services/categories';
import { ExplorerServiceRequestForm } from '@/types/explorer';

// Localidades de Chubut
const CHUBUT_LOCALITIES = [
  'Rawson', 'Trelew', 'Puerto Madryn', 'Comodoro Rivadavia', 'Esquel',
  'Gaiman', 'Dolavon', 'Rada Tilly', 'Trevelin', 'Puerto Pirámides',
  'Sarmiento', 'Río Mayo', 'Alto Río Senguer', 'Gobernador Costa',
  'Las Plumas', 'Gastre', 'Paso de Indios', 'Tecka', 'Gualjaina',
  'El Maitén', 'El Hoyo', 'Epuyén', 'Cholila', 'Lago Puelo',
  'José de San Martín', 'Facundo', 'Playa Unión', 'Playa Magagna'
];

const BuscarServicioPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<ExplorerServiceRequestForm>({
    category_id: 0,
    title: '',
    description: '',
    locality: '',
    specific_address: '',
    urgency: 'medium',
    budget_min: undefined,
    budget_max: undefined,
    preferred_date: '',
    preferred_time: '',
    flexible_timing: true
  });
  
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [blockingStatus, setBlockingStatus] = useState<any>(null);

  useEffect(() => {
    if (!loading && user?.user_type !== 'client') {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      loadInitialData();
    }
  }, [user, loading]);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, blockingRes] = await Promise.all([
        categoriesService.getCategories(),
        explorerService.getBlockingStatus()
      ]);

      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }
      
      if (blockingRes.success) {
        setBlockingStatus(blockingRes.data);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const generateTitle = () => {
    const selectedCategory = categories.find(cat => cat.id === formData.category_id);
    if (selectedCategory && formData.locality) {
      const title = `BUSCO ${selectedCategory.name.toUpperCase()} PARA TRABAJO EN ${formData.locality.toUpperCase()}`;
      setFormData(prev => ({ ...prev, title }));
    }
  };

  useEffect(() => {
    generateTitle();
  }, [formData.category_id, formData.locality, categories]);

  const validateForm = (): boolean => {
    const validationErrors = explorerService.validateServiceRequest(formData);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      const response = await explorerService.createServiceRequest(formData);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/explorador/dashboard');
        }, 2000);
      } else {
        setErrors([response.message || 'Error al crear la solicitud']);
      }
    } catch (error: any) {
      setErrors([error.response?.data?.message || 'Error al crear la solicitud']);
    } finally {
      setSubmitting(false);
    }
  };

  const getUrgencyInfo = (urgency: string) => {
    const info = {
      low: { 
        label: 'Baja - Tengo tiempo', 
        color: 'text-gray-600',
        description: 'Expira en 7 días',
        icon: '⏰'
      },
      medium: { 
        label: 'Media - En unos días', 
        color: 'text-blue-600',
        description: 'Expira en 5 días',
        icon: '📅'
      },
      high: { 
        label: 'Alta - Lo necesito pronto', 
        color: 'text-orange-600',
        description: 'Expira en 3 días',
        icon: '⚡'
      },
      emergency: { 
        label: 'Emergencia - ¡Ya!', 
        color: 'text-red-600',
        description: 'Expira en 24 horas',
        icon: '🚨'
      }
    };
    return info[urgency as keyof typeof info] || info.medium;
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Solicitud Creada!
          </h2>
          <p className="text-gray-600 mb-4">
            Los AS de tu zona serán notificados inmediatamente
          </p>
          <div className="animate-pulse text-blue-600">
            Redirigiendo al panel...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Buscar Servicio - Fixia Explorador</title>
        <meta name="description" content="Encuentra profesionales para tu proyecto en Chubut" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-4000"></div>
        </div>

        {/* Modern Glassmorphism Header */}
        <div className="relative z-10 backdrop-blur-xl bg-white/80 shadow-2xl border-b border-white/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-8">
              <Link href="/explorador/dashboard">
                <button className="group mr-6 p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl transition-all duration-300 border border-transparent hover:border-blue-200">
                  <ArrowLeftIcon className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                </button>
              </Link>
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-white text-2xl">🔍</span>
                  </div>
                  <div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-clip-text text-transparent">
                      Buscar Servicio Profesional
                    </h1>
                    <p className="text-gray-600 mt-2 font-semibold text-lg">
                      🚀 Describe lo que necesitás y conectate con los mejores AS de Chubut
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border border-green-200">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        200+ AS Disponibles
                      </span>
                      <span className="text-sm text-gray-500">⚡ Respuesta promedio en 5 minutos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Blocking Alert */}
          {blockingStatus?.is_blocked && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    No podés crear nuevas solicitudes
                  </h3>
                  <p className="text-red-700 mb-3">
                    {blockingStatus.message}
                  </p>
                  <Link href="/explorador/calificaciones">
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                      Completar Calificaciones
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {!blockingStatus?.is_blocked && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <div className="text-sm text-red-700">
                      <ul className="list-disc list-inside space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  ¿Qué servicio necesitás?
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría del Servicio *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_id: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar categoría...</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Locality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPinIcon className="h-4 w-4 inline mr-1" />
                      Localidad en Chubut *
                    </label>
                    <select
                      value={formData.locality}
                      onChange={(e) => setFormData(prev => ({ ...prev, locality: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar localidad...</option>
                      {CHUBUT_LOCALITIES.map((locality) => (
                        <option key={locality} value={locality}>
                          {locality}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FireIcon className="h-4 w-4 inline mr-1" />
                      Urgencia
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as any }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {['low', 'medium', 'high', 'emergency'].map((urgency) => {
                        const info = getUrgencyInfo(urgency);
                        return (
                          <option key={urgency} value={urgency}>
                            {info.icon} {info.label}
                          </option>
                        );
                      })}
                    </select>
                    <p className={`text-xs mt-1 ${getUrgencyInfo(formData.urgency).color}`}>
                      {getUrgencyInfo(formData.urgency).description}
                    </p>
                  </div>
                </div>

                {/* Generated Title Preview */}
                {formData.title && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Vista previa del título:</h3>
                    <p className="text-blue-700 font-semibold">{formData.title}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Describí tu proyecto
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción detallada *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Ejemplo: Necesito un albañil para construcción de pared de ladrillo de 3x2 metros en el patio de mi casa. Tengo los materiales pero necesito mano de obra especializada..."
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección específica (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.specific_address || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, specific_address: e.target.value }))}
                      placeholder="Ejemplo: Barrio Centro, cerca del Municipio"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  <CurrencyDollarIcon className="h-6 w-6 inline mr-2" />
                  Presupuesto (opcional)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Presupuesto mínimo (ARS)
                    </label>
                    <input
                      type="number"
                      value={formData.budget_min || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget_min: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      placeholder="10000"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Presupuesto máximo (ARS)
                    </label>
                    <input
                      type="number"
                      value={formData.budget_max || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget_max: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      placeholder="50000"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Timing */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  <CalendarDaysIcon className="h-6 w-6 inline mr-2" />
                  ¿Cuándo lo necesitás?
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="flexible_timing"
                      checked={formData.flexible_timing}
                      onChange={(e) => setFormData(prev => ({ ...prev, flexible_timing: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="flexible_timing" className="ml-2 block text-sm text-gray-900">
                      Tengo horarios flexibles
                    </label>
                  </div>

                  {!formData.flexible_timing && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha preferida
                        </label>
                        <input
                          type="date"
                          value={formData.preferred_date || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, preferred_date: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hora preferida
                        </label>
                        <input
                          type="time"
                          value={formData.preferred_time || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, preferred_time: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Crear Solicitud de Servicio
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Los AS de tu zona serán notificados inmediatamente
                    </p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Link href="/explorador/dashboard">
                      <button 
                        type="button"
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </Link>
                    
                    <button
                      type="submit"
                      disabled={submitting || blockingStatus?.is_blocked}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                          Creando...
                        </>
                      ) : (
                        'Crear Solicitud'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default BuscarServicioPage;