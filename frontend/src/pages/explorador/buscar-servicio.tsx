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
  BoltIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  UsersIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { explorerService } from '@/services/explorer';
import { categoriesService } from '@/services/categories';
import { localitiesService } from '@/services/api';
import { ExplorerServiceRequestForm } from '@/types/explorer';
import { CorporateHeader, CorporateCard, CorporateButton, CorporateInput } from '@/components/ui';
import Logo from '@/components/Logo';

// Localidades de Chubut - ahora se cargan desde la API

const BuscarServicioPage: NextPage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [localities, setLocalities] = useState<string[]>([]);
  const [formData, setFormData] = useState<ExplorerServiceRequestForm>({
    category_id: '',
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
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user?.user_type !== 'customer') {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      loadInitialData();
    }
  }, [user, loading]);

  const loadInitialData = async () => {
    try {
      console.log('Loading initial data...');
      
      // Load categories
      const categoriesRes = await categoriesService.getAllCategories();
      console.log('Categories loaded:', categoriesRes);
      setCategories(categoriesRes);
      
      // Load localities
      const localitiesRes = await localitiesService.getChubutLocalities();
      console.log('Localities loaded:', localitiesRes);
      setLocalities(localitiesRes.map((loc: any) => loc.name));
      
      // Load blocking status
      try {
        const blockingRes = await explorerService.getBlockingStatus();
        console.log('Blocking status loaded:', blockingRes);
        if (blockingRes.success) {
          setBlockingStatus(blockingRes.data);
        } else {
          setBlockingStatus({ is_blocked: false, message: '' });
        }
      } catch (blockingError) {
        console.warn('Blocking status failed, setting default:', blockingError);
        setBlockingStatus({ is_blocked: false, message: '' });
      }
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      setCategoriesError('Error cargando datos. Por favor recarga la página.');
      setBlockingStatus({ is_blocked: false, message: '' });
    } finally {
      setLoadingInitialData(false);
    }
  };

  const generateTitle = () => {
    const selectedCategory = categories.find(cat => cat.id === parseInt(formData.category_id as string));
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
        label: 'Flexible - Tengo tiempo', 
        color: 'text-secondary-600',
        bgColor: 'bg-secondary-100',
        borderColor: 'border-secondary-300',
        description: 'Sin prisa, cuando puedas',
        icon: ClockIcon,
        badge: 'Flexible'
      },
      medium: { 
        label: 'Normal - En unos días', 
        color: 'text-primary-600',
        bgColor: 'bg-primary-100',
        borderColor: 'border-primary-300',
        description: 'Plazo estándar de servicio',
        icon: CalendarDaysIcon,
        badge: 'Normal'
      },
      high: { 
        label: 'Urgente - Lo necesito pronto', 
        color: 'text-warning-600',
        bgColor: 'bg-warning-100',
        borderColor: 'border-warning-300',
        description: 'Prioridad alta',
        icon: BoltIcon,
        badge: 'Urgente'
      },
      emergency: { 
        label: 'Emergencia - ¡Inmediato!', 
        color: 'text-error-600',
        bgColor: 'bg-error-100',
        borderColor: 'border-error-300',
        description: 'Atención inmediata requerida',
        icon: ExclamationTriangleIcon,
        badge: 'Emergencia'
      }
    };
    return info[urgency as keyof typeof info] || info.medium;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-primary-600 mx-auto mb-6"></div>
          <p className="text-secondary-600 font-medium">Cargando sistema profesional...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <CorporateCard variant="elevated" className="max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-success-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-3">
            ¡Solicitud Profesional Enviada!
          </h2>
          <p className="text-secondary-600 mb-6 font-medium">
            Los AS certificados de tu zona han sido notificados y responderán en breve
          </p>
          <div className="flex items-center justify-center space-x-2 text-primary-600">
            <SparklesIcon className="h-5 w-5 animate-pulse" />
            <span className="font-medium">Redirigiendo al panel profesional...</span>
          </div>
        </CorporateCard>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Solicitar Servicio Profesional | Fixia</title>
        <meta name="description" content="Conecta con profesionales certificados para tu proyecto en Chubut. Solicitudes seguras y respuestas garantizadas." />
        <meta name="keywords" content="servicios profesionales, Chubut, AS certificados, solicitud servicio" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        {/* Corporate Professional Header */}
        <CorporateHeader
          title="Solicitar Servicio Profesional"
          subtitle="Conecta con AS certificados en Chubut para tu proyecto"
          backUrl="/explorador/dashboard"
          variant="featured"
          rightActions={
            <CorporateButton
              variant="outline"
              size="sm"
              onClick={logout}
              leftIcon={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
            >
              Cerrar Sesión
            </CorporateButton>
          }
        />

        {/* Professional Stats Bar */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-secondary-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-success-600" />
                <span className="text-sm font-semibold text-secondary-700">126+ Servicios Disponibles</span>
              </div>
              <div className="flex items-center space-x-2">
                <UsersIcon className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-semibold text-secondary-700">AS Certificados</span>
              </div>
              <div className="flex items-center space-x-2">
                <BoltIcon className="h-5 w-5 text-warning-600" />
                <span className="text-sm font-semibold text-secondary-700">Respuesta en 5 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Professional System Status */}
          {process.env.NODE_ENV === 'development' && (
            <CorporateCard variant="minimal" className="mb-6">
              <div className="flex items-center space-x-3">
                <BuildingOfficeIcon className="h-5 w-5 text-tech-600" />
                <h4 className="font-semibold text-secondary-800">Sistema Profesional</h4>
              </div>
              <p className="text-sm text-secondary-600 mt-2">
                Estado: {blockingStatus ? 'Conectado' : 'Iniciando'} | 
                Categorías: {categories.length} | 
                Localidades: {localities.length}
              </p>
            </CorporateCard>
          )}

          {/* Professional Blocking Alert */}
          {blockingStatus?.is_blocked && (
            <CorporateCard variant="elevated" className="mb-8 border-l-4 border-l-error-500">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-error-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-error-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-secondary-900 mb-2">
                    Cuenta Temporalmente Suspendida
                  </h3>
                  <p className="text-secondary-700 mb-4 font-medium">
                    {blockingStatus.message}
                  </p>
                  <Link href="/explorador/calificaciones">
                    <CorporateButton variant="danger">
                      Completar Calificaciones Pendientes
                    </CorporateButton>
                  </Link>
                </div>
              </div>
            </CorporateCard>
          )}

          {!blockingStatus?.is_blocked && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Professional Error Messages */}
              {errors.length > 0 && (
                <CorporateCard variant="elevated" className="border-l-4 border-l-error-500">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-error-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-error-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-secondary-900 mb-2">Errores de Validación</h3>
                      <ul className="space-y-1">
                        {errors.map((error, index) => (
                          <li key={index} className="text-sm text-error-700 font-medium">• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CorporateCard>
              )}

              {/* Service Selection Section */}
              <CorporateCard variant="elevated" className="space-y-8">
                <div className="flex items-center space-x-3 pb-6 border-b border-secondary-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-trust-500 rounded-xl flex items-center justify-center">
                    <MagnifyingGlassIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-secondary-900">
                    Detalles del Servicio Profesional
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {/* Professional Service Category */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-bold text-secondary-900 mb-3">
                      Categoría del Servicio Profesional *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value ? parseInt(e.target.value) : '' }))}
                      className="w-full border-2 border-secondary-300 rounded-xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-400"
                      required
                    >
                      <option value="">Seleccionar categoría profesional...</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id} className="py-2">
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-secondary-600 mt-2 font-medium">
                      {categories.length} servicios profesionales disponibles
                    </p>
                  </div>

                  {/* Professional Location */}
                  <div>
                    <label className="block text-sm font-bold text-secondary-900 mb-3">
                      <MapPinIcon className="h-4 w-4 inline mr-2 text-primary-600" />
                      Localidad en Chubut *
                    </label>
                    <select
                      value={formData.locality}
                      onChange={(e) => setFormData(prev => ({ ...prev, locality: e.target.value }))}
                      className="w-full border-2 border-secondary-300 rounded-xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-400"
                      required
                    >
                      <option value="">Seleccionar localidad...</option>
                      {localities.map((locality) => (
                        <option key={locality} value={locality} className="py-2">
                          {locality}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Professional Priority Level */}
                  <div>
                    <label className="block text-sm font-bold text-secondary-900 mb-3">
                      <BoltIcon className="h-4 w-4 inline mr-2 text-warning-600" />
                      Nivel de Prioridad
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as any }))}
                      className="w-full border-2 border-secondary-300 rounded-xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-400"
                    >
                      {['low', 'medium', 'high', 'emergency'].map((urgency) => {
                        const info = getUrgencyInfo(urgency);
                        const IconComponent = info.icon;
                        return (
                          <option key={urgency} value={urgency} className="py-2">
                            {info.badge} - {info.label}
                          </option>
                        );
                      })}
                    </select>
                    <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-semibold ${getUrgencyInfo(formData.urgency).bgColor} ${getUrgencyInfo(formData.urgency).color} ${getUrgencyInfo(formData.urgency).borderColor} border`}>
                      {getUrgencyInfo(formData.urgency).description}
                    </div>
                  </div>
                </div>

                {/* Professional Title Preview */}
                {formData.title && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-trust-50 border-2 border-primary-200 rounded-xl">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <SparklesIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-primary-800 mb-2">Título Generado Automáticamente</h3>
                        <p className="text-primary-700 font-bold text-lg bg-white px-4 py-2 rounded-lg border border-primary-200">{formData.title}</p>
                        <p className="text-xs text-primary-600 mt-2 font-medium">Este título será visible para todos los AS de la zona</p>
                      </div>
                    </div>
                  </div>
                )}
              </CorporateCard>

              {/* Project Description Section */}
              <CorporateCard variant="elevated" className="space-y-8">
                <div className="flex items-center space-x-3 pb-6 border-b border-secondary-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg font-bold">📝</span>
                  </div>
                  <h2 className="text-xl font-bold text-secondary-900">
                    Descripción del Proyecto
                  </h2>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-bold text-secondary-900 mb-3">
                      Descripción Técnica Detallada *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describa detalladamente el trabajo requerido: materiales, dimensiones, especificaciones técnicas, herramientas necesarias, condiciones del lugar de trabajo..."
                      rows={6}
                      className="w-full border-2 border-secondary-300 rounded-xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-400 resize-none"
                      required
                    />
                    <p className="text-xs text-secondary-600 mt-2 font-medium">
                      Una descripción detallada ayuda a los AS a evaluar mejor el trabajo y dar presupuestos precisos
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-secondary-900 mb-3">
                      <MapPinIcon className="h-4 w-4 inline mr-2 text-primary-600" />
                      Dirección Específica (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.specific_address || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, specific_address: e.target.value }))}
                      placeholder="Ej: Barrio Centro, Av. San Martín 123, cerca del Banco Nación"
                      className="w-full border-2 border-secondary-300 rounded-xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-400"
                    />
                    <p className="text-xs text-secondary-600 mt-2 font-medium">
                      Facilita la evaluación de distancia y logística para los profesionales
                    </p>
                  </div>
                </div>
              </CorporateCard>

              {/* Professional Budget Section */}
              <CorporateCard variant="elevated" className="space-y-8">
                <div className="flex items-center space-x-3 pb-6 border-b border-secondary-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-success-500 to-success-600 rounded-xl flex items-center justify-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-secondary-900">
                    Presupuesto Referencial (Opcional)
                  </h2>
                </div>

                <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-warning-800 font-medium">
                    💡 <strong>Recomendación:</strong> Proporcionar un rango de presupuesto ayuda a los AS a evaluar si el proyecto se ajusta a sus servicios.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    <label className="block text-sm font-bold text-secondary-900 mb-3">
                      Presupuesto Mínimo (ARS)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-500 font-bold">$</span>
                      <input
                        type="number"
                        value={formData.budget_min || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget_min: e.target.value ? parseFloat(e.target.value) : undefined }))}
                        placeholder="15,000"
                        className="w-full border-2 border-secondary-300 rounded-xl pl-8 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-secondary-900 mb-3">
                      Presupuesto Máximo (ARS)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-500 font-bold">$</span>
                      <input
                        type="number"
                        value={formData.budget_max || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget_max: e.target.value ? parseFloat(e.target.value) : undefined }))}
                        placeholder="50,000"
                        className="w-full border-2 border-secondary-300 rounded-xl pl-8 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-400"
                      />
                    </div>
                  </div>
                </div>

                {(formData.budget_min || formData.budget_max) && (
                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                    <p className="text-sm text-primary-700 font-medium">
                      🎯 Rango presupuestario: <strong>
                        ${formData.budget_min ? formData.budget_min.toLocaleString() : '---'} - 
                        ${formData.budget_max ? formData.budget_max.toLocaleString() : '---'}
                      </strong>
                    </p>
                  </div>
                )}
              </CorporateCard>

              {/* Professional Timing Section */}
              <CorporateCard variant="elevated" className="space-y-8">
                <div className="flex items-center space-x-3 pb-6 border-b border-secondary-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-trust-500 to-trust-600 rounded-xl flex items-center justify-center">
                    <CalendarDaysIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-secondary-900">
                    Disponibilidad Horaria
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        id="flexible_timing"
                        checked={formData.flexible_timing}
                        onChange={(e) => setFormData(prev => ({ ...prev, flexible_timing: e.target.checked }))}
                        className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                      />
                      <div className="flex-1">
                        <label htmlFor="flexible_timing" className="block text-sm font-bold text-secondary-900 mb-1">
                          Disponibilidad Flexible
                        </label>
                        <p className="text-xs text-secondary-600 font-medium">
                          Me adapto a los horarios disponibles del profesional
                        </p>
                      </div>
                    </div>
                  </div>

                  {!formData.flexible_timing && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                      <div>
                        <label className="block text-sm font-bold text-secondary-900 mb-3">
                          Fecha Preferida
                        </label>
                        <input
                          type="date"
                          value={formData.preferred_date || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, preferred_date: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full border-2 border-secondary-300 rounded-xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-secondary-900 mb-3">
                          Hora Preferida
                        </label>
                        <input
                          type="time"
                          value={formData.preferred_time || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, preferred_time: e.target.value }))}
                          className="w-full border-2 border-secondary-300 rounded-xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CorporateCard>

              {/* Professional Submission Section */}
              <CorporateCard variant="elevated" className="bg-gradient-to-br from-primary-50 via-white to-trust-50 border-2 border-primary-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-trust-600 rounded-xl flex items-center justify-center">
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-secondary-900">
                          Enviar Solicitud Profesional
                        </h3>
                        <p className="text-secondary-600 text-sm font-medium">
                          Los AS certificados de tu zona serán notificados instantáneamente
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-primary-200">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <BoltIcon className="h-4 w-4 text-warning-600" />
                          <span className="text-xs font-bold text-secondary-700">Respuesta en 5 min</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <ShieldCheckIcon className="h-4 w-4 text-success-600" />
                          <span className="text-xs font-bold text-secondary-700">AS Verificados</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <SparklesIcon className="h-4 w-4 text-primary-600" />
                          <span className="text-xs font-bold text-secondary-700">Garantía de Calidad</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 lg:ml-8">
                    <Link href="/explorador/dashboard">
                      <CorporateButton 
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        Cancelar
                      </CorporateButton>
                    </Link>
                    
                    <CorporateButton
                      type="submit"
                      disabled={submitting || blockingStatus?.is_blocked}
                      size="lg"
                      loading={submitting}
                      className="w-full sm:w-auto px-8"
                      rightIcon={!submitting ? <ArrowRightOnRectangleIcon className="h-4 w-4" /> : undefined}
                    >
                      {submitting ? 'Enviando Solicitud...' : 'Enviar Solicitud Profesional'}
                    </CorporateButton>
                  </div>
                </div>
              </CorporateCard>
            </form>
          )}

          {/* Professional Trust Footer */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center justify-center space-x-2 bg-white rounded-xl px-6 py-3 shadow-md border border-secondary-200">
              <Logo size="sm" showText={false} />
              <span className="text-sm font-bold text-secondary-700">
                Sistema Profesional Certificado
              </span>
              <ShieldCheckIcon className="h-4 w-4 text-success-600" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Deshabilitar SSG para evitar errores de AuthProvider
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default BuscarServicioPage;