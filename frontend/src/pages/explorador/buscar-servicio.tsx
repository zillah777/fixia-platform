import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  ArrowLeft,
  ArrowRight,
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Zap,
  LogOut,
  Search,
  Building,
  ShieldCheck,
  Users,
  Sparkles
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { explorerService } from '@/services/explorer';
import { categoriesService } from '@/services/categories';
import { apiLocalitiesService } from '@/services/api';
import { ExplorerServiceRequestForm } from '@/types/explorer';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
      const localitiesRes = await apiLocalitiesService.getChubutLocalities();
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
    
    // Validate form
    const validationErrors = explorerService.validateServiceRequest(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors([]);

    try {
      const response = await explorerService.createServiceRequest(formData);
      
      if (response.success) {
        setSuccess(true);
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/explorador/dashboard');
        }, 3000);
      } else {
        setErrors([response.message || 'Error al crear la solicitud']);
      }
    } catch (error: any) {
      console.error('Error creating service request:', error);
      setErrors([error.response?.data?.error || 'Error al crear la solicitud']);
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
        icon: Clock,
        badge: 'Flexible'
      },
      medium: { 
        label: 'Normal - En unos días', 
        color: 'text-primary-600',
        bgColor: 'bg-primary-100',
        borderColor: 'border-primary-300',
        description: 'Plazo estándar de servicio',
        icon: Calendar,
        badge: 'Normal'
      },
      high: { 
        label: 'Urgente - Lo necesito pronto', 
        color: 'text-warning-600',
        bgColor: 'bg-warning-100',
        borderColor: 'border-warning-300',
        description: 'Prioridad alta',
        icon: Zap,
        badge: 'Urgente'
      },
      emergency: { 
        label: 'Emergencia - ¡Inmediato!', 
        color: 'text-error-600',
        bgColor: 'bg-error-100',
        borderColor: 'border-error-300',
        description: 'Atención inmediata requerida',
        icon: AlertTriangle,
        badge: 'Emergencia'
      }
    };
    return info[urgency as keyof typeof info] || info.medium;
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 bg-background">
          <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="liquid-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-white font-medium">Cargando sistema profesional...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 bg-background">
          <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-3xl opacity-15 animate-float" style={{ animationDelay: '4s' }}></div>
        </div>
        <Card className="glass border-white/10 shadow-2xl max-w-md w-full mx-4 text-center relative z-10">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              ¡Solicitud Profesional Enviada!
            </h2>
            <p className="text-white/70 mb-6 font-medium">
              Los AS certificados de tu zona han sido notificados y responderán en breve
            </p>
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span className="font-medium">Redirigiendo al panel profesional...</span>
            </div>
          </CardContent>
        </Card>
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

      <div className="min-h-screen relative overflow-hidden">
        {/* Background - Mismo estilo que homepage */}
        <div className="absolute inset-0 bg-background">
          <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full blur-3xl opacity-15 animate-float" style={{ animationDelay: '4s' }}></div>
          <div className="absolute top-3/4 left-1/3 w-32 h-32 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-3xl opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/2 left-1/4 w-40 h-40 bg-gradient-to-r from-pink-400 to-red-400 rounded-full blur-3xl opacity-15 animate-float" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/6 right-1/3 w-56 h-56 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-3xl opacity-10 animate-float" style={{ animationDelay: '5s' }}></div>
        </div>

        {/* Header */}
        <header className="relative z-50 glass-medium border-b border-white/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="glass border-white/20 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Solicitar Servicio Profesional</h1>
                  <p className="text-white/70">Conecta con AS certificados en Chubut para tu proyecto</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="glass border-white/20 text-white hover:bg-white/10"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </header>

        {/* Professional Stats Bar */}
        <div className="relative z-40 glass-light border-b border-white/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-center space-x-8">
              <Badge className="glass-medium border-white/20 text-green-400 px-4 py-2">
                <ShieldCheck className="h-4 w-4 mr-2" />
                126+ Servicios Disponibles
              </Badge>
              <Badge className="glass-medium border-white/20 text-blue-400 px-4 py-2">
                <Users className="h-4 w-4 mr-2" />
                AS Certificados
              </Badge>
              <Badge className="glass-medium border-white/20 text-yellow-400 px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                Respuesta en 5 min
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Professional System Status */}
          {process.env['NODE_ENV'] === 'development' && (
            <Card className="mb-6 glass border-white/10 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-blue-400" />
                  <h4 className="font-semibold text-white">Sistema Profesional</h4>
                </div>
                <p className="text-sm text-white/60 mt-2">
                  Estado: {blockingStatus ? 'Conectado' : 'Iniciando'} | 
                  Categorías: {categories.length} | 
                  Localidades: {localities.length}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Professional Blocking Alert */}
          {blockingStatus?.is_blocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card className="glass border-red-500/20 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-300 mb-2">
                        Cuenta Temporalmente Suspendida
                      </h3>
                      <p className="text-red-200 mb-4">
                        {blockingStatus.message}
                      </p>
                      <Link href="/explorador/calificaciones">
                        <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
                          Completar Calificaciones Pendientes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!blockingStatus?.is_blocked && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Professional Error Messages */}
              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="glass border-red-500/20 shadow-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-red-300 mb-2">Errores de Validación</h3>
                          <ul className="space-y-1">
                            {errors.map((error, index) => (
                              <li key={index} className="text-sm text-red-200">• {error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Service Selection Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <Search className="mr-3 h-6 w-6 text-blue-400" />
                      Detalles del Servicio Profesional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Professional Service Category */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-white/80 mb-3">
                          Categoría del Servicio Profesional *
                        </label>
                        <select
                          value={formData.category_id}
                          onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value ? parseInt(e.target.value) : '' }))}
                          className="glass border-white/20 bg-white/5 text-white w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          required
                        >
                          <option value="" className="bg-gray-800 text-white">Seleccionar categoría profesional...</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id} className="bg-gray-800 text-white py-2">
                              {category.icon} {category.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-white/60 mt-2">
                          {categories.length} servicios profesionales disponibles
                        </p>
                      </div>

                      {/* Professional Location */}
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">
                          <MapPin className="h-4 w-4 inline mr-2 text-blue-400" />
                          Localidad en Chubut *
                        </label>
                        <select
                          value={formData.locality}
                          onChange={(e) => setFormData(prev => ({ ...prev, locality: e.target.value }))}
                          className="glass border-white/20 bg-white/5 text-white w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          required
                        >
                          <option value="" className="bg-gray-800 text-white">Seleccionar localidad...</option>
                          {localities.map((locality) => (
                            <option key={locality} value={locality} className="bg-gray-800 text-white py-2">
                              {locality}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Professional Priority Level */}
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">
                          <Zap className="h-4 w-4 inline mr-2 text-yellow-400" />
                          Nivel de Prioridad
                        </label>
                        <select
                          value={formData.urgency}
                          onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as any }))}
                          className="glass border-white/20 bg-white/5 text-white w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          {['low', 'medium', 'high', 'emergency'].map((urgency) => {
                            const info = getUrgencyInfo(urgency);
                            return (
                              <option key={urgency} value={urgency} className="bg-gray-800 text-white py-2">
                                {info.badge} - {info.label}
                              </option>
                            );
                          })}
                        </select>
                        <div className="mt-3 glass-medium border-white/20 px-3 py-2 rounded-lg text-xs text-white/70">
                          {getUrgencyInfo(formData.urgency).description}
                        </div>
                      </div>
                    </div>

                    {/* Professional Title Preview */}
                    {formData.title && (
                      <div className="glass-medium border-blue-500/20 p-6 rounded-lg">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-blue-300 mb-2">Título Generado Automáticamente</h3>
                            <p className="text-white font-bold text-lg glass border-white/20 px-4 py-2 rounded-lg">{formData.title}</p>
                            <p className="text-xs text-blue-200 mt-2">Este título será visible para todos los AS de la zona</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Project Description Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <span className="mr-3 text-lg">📝</span>
                      Descripción del Proyecto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-3">
                        Descripción Técnica Detallada *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describa detalladamente el trabajo requerido: materiales, dimensiones, especificaciones técnicas, herramientas necesarias, condiciones del lugar de trabajo..."
                        rows={6}
                        className="glass border-white/20 bg-white/5 text-white placeholder:text-white/50 resize-none w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        required
                      />
                      <p className="text-xs text-white/60 mt-2">
                        Una descripción detallada ayuda a los AS a evaluar mejor el trabajo y dar presupuestos precisos
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-3">
                        <MapPin className="h-4 w-4 inline mr-2 text-blue-400" />
                        Dirección Específica (Opcional)
                      </label>
                      <Input
                        type="text"
                        value={formData.specific_address || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, specific_address: e.target.value }))}
                        placeholder="Ej: Barrio Centro, Av. San Martín 123, cerca del Banco Nación"
                        className="glass border-white/20 bg-white/5 text-white placeholder:text-white/50"
                      />
                      <p className="text-xs text-white/60 mt-2">
                        Facilita la evaluación de distancia y logística para los profesionales
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Professional Budget Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <DollarSign className="mr-3 h-6 w-6 text-green-400" />
                      Presupuesto Referencial (Opcional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">

                    <div className="glass-medium border-yellow-500/20 p-4 rounded-lg">
                      <p className="text-sm text-yellow-300">
                        💡 <strong>Recomendación:</strong> Proporcionar un rango de presupuesto ayuda a los AS a evaluar si el proyecto se ajusta a sus servicios.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">
                          Presupuesto Mínimo (ARS)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 font-bold">$</span>
                          <Input
                            type="number"
                            value={formData.budget_min || ''}
                            onChange={(e) => {
                              const value = e.target.value ? parseFloat(e.target.value) : undefined;
                              setFormData(prev => {
                                const newData = { ...prev };
                                if (value !== undefined) {
                                  newData.budget_min = value;
                                } else {
                                  delete newData.budget_min;
                                }
                                return newData;
                              });
                            }}
                            placeholder="15,000"
                            className="glass border-white/20 bg-white/5 text-white placeholder:text-white/50 pl-8"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">
                          Presupuesto Máximo (ARS)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 font-bold">$</span>
                          <Input
                            type="number"
                            value={formData.budget_max || ''}
                            onChange={(e) => {
                              const value = e.target.value ? parseFloat(e.target.value) : undefined;
                              setFormData(prev => {
                                const newData = { ...prev };
                                if (value !== undefined) {
                                  newData.budget_max = value;
                                } else {
                                  delete newData.budget_max;
                                }
                                return newData;
                              });
                            }}
                            placeholder="50,000"
                            className="glass border-white/20 bg-white/5 text-white placeholder:text-white/50 pl-8"
                          />
                        </div>
                      </div>
                    </div>

                    {(formData.budget_min || formData.budget_max) && (
                      <div className="glass-medium border-blue-500/20 p-4 rounded-lg">
                        <p className="text-sm text-blue-300">
                          🎯 Rango presupuestario: <strong className="text-white">
                            ${formData.budget_min ? formData.budget_min.toLocaleString() : '---'} - 
                            ${formData.budget_max ? formData.budget_max.toLocaleString() : '---'}
                          </strong>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Professional Timing Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <Calendar className="mr-3 h-6 w-6 text-purple-400" />
                      Disponibilidad Horaria
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">

                    <div className="glass-medium border-white/20 p-6 rounded-lg">
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          id="flexible_timing"
                          checked={formData.flexible_timing}
                          onChange={(e) => setFormData(prev => ({ ...prev, flexible_timing: e.target.checked }))}
                          className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-white/30 rounded bg-white/10"
                        />
                        <div className="flex-1">
                          <label htmlFor="flexible_timing" className="block text-sm font-medium text-white mb-1">
                            Disponibilidad Flexible
                          </label>
                          <p className="text-xs text-white/60">
                            Me adapto a los horarios disponibles del profesional
                          </p>
                        </div>
                      </div>
                    </div>

                    {!formData.flexible_timing && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-3">
                            Fecha Preferida
                          </label>
                          <Input
                            type="date"
                            value={formData.preferred_date || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, preferred_date: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                            className="glass border-white/20 bg-white/5 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-3">
                            Hora Preferida
                          </label>
                          <Input
                            type="time"
                            value={formData.preferred_time || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, preferred_time: e.target.value }))}
                            className="glass border-white/20 bg-white/5 text-white"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Professional Submission Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Card className="glass border-green-500/20 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              Enviar Solicitud Profesional
                            </h3>
                            <p className="text-white/70 text-sm">
                              Los AS certificados de tu zona serán notificados instantáneamente
                            </p>
                          </div>
                        </div>

                        <div className="glass-medium border-white/20 p-4 rounded-lg">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Zap className="h-4 w-4 text-yellow-400" />
                              <span className="text-xs font-semibold text-white">Respuesta en 5 min</span>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                              <ShieldCheck className="h-4 w-4 text-green-400" />
                              <span className="text-xs font-semibold text-white">AS Verificados</span>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                              <Sparkles className="h-4 w-4 text-blue-400" />
                              <span className="text-xs font-semibold text-white">Garantía de Calidad</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 lg:ml-8">
                        <Link href="/explorador/dashboard">
                          <Button 
                            variant="outline"
                            className="glass border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                          >
                            Cancelar
                          </Button>
                        </Link>
                        
                        <Button
                          type="submit"
                          disabled={submitting || blockingStatus?.is_blocked}
                          className="liquid-gradient hover:opacity-90 transition-all duration-300 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Enviando Solicitud...
                            </>
                          ) : (
                            <>
                              Enviar Solicitud Profesional
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </form>
          )}

          {/* Professional Trust Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center justify-center space-x-2 glass border-white/20 rounded-xl px-6 py-3 shadow-lg">
              <Logo size="sm" showText={false} />
              <span className="text-sm font-semibold text-white">
                Sistema Profesional Certificado
              </span>
              <ShieldCheck className="h-4 w-4 text-green-400" />
            </div>
          </motion.div>
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