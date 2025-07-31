import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Briefcase,
  Eye,
  Pencil,
  Trash,
  MapPin,
  Clock,
  DollarSign,
  Image,
  Tag,
  CheckCircle,
  XCircle,
  Search,
  Star
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Service, ServiceCategory, CreateServiceData } from '@/types';


const categories = [
  { value: 'plomeria' as ServiceCategory, label: 'Plomería', icon: '🔧' },
  { value: 'electricidad' as ServiceCategory, label: 'Electricidad', icon: '⚡' },
  { value: 'limpieza' as ServiceCategory, label: 'Limpieza', icon: '🧹' },
  { value: 'reparaciones' as ServiceCategory, label: 'Reparaciones', icon: '🔨' },
  { value: 'belleza' as ServiceCategory, label: 'Belleza', icon: '💄' },
  { value: 'otros' as ServiceCategory, label: 'Otros', icon: '🛠️' }
];

const ASServicios: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { action } = router.query;
  
  const [services, setServices] = useState<Service[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ServiceCategory | 'all'>('all');
  const [saving, setSaving] = useState(false);
  
  const [newService, setNewService] = useState<CreateServiceData>({
    title: '',
    description: '',
    category: 'otros',
    price: 0,
    duration_minutes: 60,
    address: '',
    latitude: undefined,
    longitude: undefined
  });

  useEffect(() => {
    if (!loading && user?.user_type !== 'provider') {
      router.push('/explorador/cambiar-a-as');
      return;
    }

    if (action === 'create') {
      setShowCreateModal(true);
    }

    // TODO: Fetch real services from API
    setServices([
      {
        id: 1,
        provider_id: user?.id || 1,
        title: 'Reparación de Plomería Residencial',
        description: 'Reparación de cañerías, grifos, inodoros y sistemas de agua. Incluye diagnóstico y mano de obra.',
        category: 'plomeria',
        price: 2500,
        duration_minutes: 120,
        address: 'Rawson, Chubut',
        is_active: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        profile_photo_url: user?.profile_photo_url,
        is_verified: true,
        average_rating: 4.8,
        total_reviews: 12,
        views_count: 45,
        images: []
      },
      {
        id: 2,
        provider_id: user?.id || 1,
        title: 'Instalación Eléctrica Completa',
        description: 'Instalación de sistemas eléctricos para hogares y oficinas. Incluye cableado, tomas y tableros.',
        category: 'electricidad',
        price: 3800,
        duration_minutes: 180,
        address: 'Trelew, Chubut',
        is_active: true,
        created_at: '2024-01-10T14:00:00Z',
        updated_at: '2024-01-10T14:00:00Z',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        profile_photo_url: user?.profile_photo_url,
        is_verified: true,
        average_rating: 4.9,
        total_reviews: 8,
        views_count: 32,
        images: []
      },
      {
        id: 3,
        provider_id: user?.id || 1,
        title: 'Limpieza Profunda de Hogar',
        description: 'Servicio completo de limpieza para casas y departamentos. Incluye todos los ambientes.',
        category: 'limpieza',
        price: 1800,
        duration_minutes: 240,
        address: 'Puerto Madryn, Chubut',
        is_active: false,
        created_at: '2024-01-05T09:00:00Z',
        updated_at: '2024-01-05T09:00:00Z',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        profile_photo_url: user?.profile_photo_url,
        is_verified: true,
        average_rating: 4.6,
        total_reviews: 15,
        views_count: 67,
        images: []
      }
    ]);
  }, [user, loading, action]);

  const handleCreateService = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to create service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const createdService: Service = {
        id: Date.now(),
        provider_id: user?.id || 1,
        ...newService,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        profile_photo_url: user?.profile_photo_url,
        is_verified: true,
        average_rating: 0,
        total_reviews: 0,
        views_count: 2,
        images: []
      };
      
      setServices(prev => [createdService, ...prev]);
      setShowCreateModal(false);
      setNewService({
        title: '',
        description: '',
        category: 'otros',
        price: 0,
        duration_minutes: 60,
        address: '',
        latitude: undefined,
        longitude: undefined
      });
      
      alert('Servicio creado exitosamente');
    } catch (error) {
      alert('Error al crear el servicio');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (serviceId: number) => {
    try {
      // TODO: Implement API call
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, is_active: !service.is_active }
          : service
      ));
    } catch (error) {
      alert('Error al actualizar el servicio');
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) return;
    
    try {
      // TODO: Implement API call
      setServices(prev => prev.filter(service => service.id !== serviceId));
      alert('Servicio eliminado exitosamente');
    } catch (error) {
      alert('Error al eliminar el servicio');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryInfo = (category: ServiceCategory) => {
    return categories.find(cat => cat.value === category);
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
        }}
      >
        {/* Floating orbs for loading state */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full"
            style={{ backdropFilter: 'blur(40px)' }}
            animate={{
              y: [0, -20, 0],
              x: [0, 15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-3/4 right-1/3 w-24 h-24 bg-purple-400/20 rounded-full"
            style={{ backdropFilter: 'blur(40px)' }}
            animate={{
              y: [0, 20, 0],
              x: [0, -10, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        <motion.div 
          className="text-center"
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.1)'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-6"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.3))',
              borderRadius: '50%'
            }}
          />
          <p className="text-white/90 text-lg font-medium">Cargando servicios...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mis Servicios - AS Panel - Fixia</title>
        <meta name="description" content="Gestiona tus servicios como profesional AS en Fixia" />
      </Head>

      <div 
        className="min-h-screen relative"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
        }}
      >
        {/* Floating orbs background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-40 h-40 bg-blue-400/10 rounded-full"
            style={{ backdropFilter: 'blur(60px)' }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 right-20 w-32 h-32 bg-purple-400/10 rounded-full"
            style={{ backdropFilter: 'blur(60px)' }}
            animate={{
              y: [0, 25, 0],
              x: [0, -15, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div
            className="absolute bottom-32 left-1/4 w-28 h-28 bg-pink-400/10 rounded-full"
            style={{ backdropFilter: 'blur(60px)' }}
            animate={{
              y: [0, -20, 0],
              x: [0, 25, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>
        {/* Header */}
        <motion.div 
          className="relative z-10"
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0 0 24px 24px'
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <Link href="/as/dashboard">
                  <motion.button 
                    className="mr-4 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </motion.button>
                </Link>
                <div>
                  <motion.h1 
                    className="text-3xl font-bold text-white mb-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    Mis Servicios
                  </motion.h1>
                  <motion.p 
                    className="text-white/80 text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    Gestiona los servicios que ofreces como AS
                  </motion.p>
                </div>
              </div>
              
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-6 py-3 text-white font-medium rounded-xl transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)'
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Servicio
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Filters */}
          <motion.div 
            className="p-6 mb-8"
            style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.1)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar servicios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="md:w-64">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as ServiceCategory | 'all')}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Services Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div 
              className="p-6"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.1)'
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Total Servicios</p>
                  <p className="text-3xl font-bold text-white">{services.length}</p>
                </div>
                <div className="p-2 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.3)' }}>
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="p-6"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.1)'
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Servicios Activos</p>
                  <p className="text-3xl font-bold text-white">
                    {services.filter(s => s.is_active).length}
                  </p>
                </div>
                <div className="p-2 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.3)' }}>
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="p-6"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.1)'
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Servicios Pausados</p>
                  <p className="text-3xl font-bold text-white">
                    {services.filter(s => !s.is_active).length}
                  </p>
                </div>
                <div className="p-2 rounded-xl" style={{ background: 'rgba(249, 115, 22, 0.3)' }}>
                  <XCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Services List */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Lista de Servicios ({filteredServices.length})
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredServices.length === 0 ? (
                <div className="p-12 text-center">
                  <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay servicios
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || filterCategory !== 'all' 
                      ? 'No se encontraron servicios con los filtros aplicados.'
                      : 'Aún no has creado ningún servicio. ¡Crea tu primer servicio para empezar!'
                    }
                  </p>
                  {(!searchQuery && filterCategory === 'all') && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Crear Primer Servicio
                    </button>
                  )}
                </div>
              ) : (
                filteredServices.map((service) => {
                  const categoryInfo = getCategoryInfo(service.category || '');
                  
                  return (
                    <div key={service.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 mr-3">
                              {service.title}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              service.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {service.is_active ? 'Activo' : 'Pausado'}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium ml-2">
                              {categoryInfo?.icon} {categoryInfo?.label}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {service.description}
                          </p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span className="font-medium">${service.price?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{Math.floor((service.duration_minutes || 60) / 60)}h {(service.duration_minutes || 60) % 60}min</span>
                            </div>
                            {service.address && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{service.address}</span>
                              </div>
                            )}
                            {(service.total_reviews || 0) > 0 && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                                <span>{service.average_rating} ({service.total_reviews} reseñas)</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => {/* TODO: View service */}}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver servicio"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          
                          <button
                            onClick={() => setEditingService(service)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Editar servicio"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleActive(service.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              service.is_active
                                ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={service.is_active ? 'Pausar servicio' : 'Activar servicio'}
                          >
                            {service.is_active ? (
                              <XCircle className="h-5 w-5" />
                            ) : (
                              <CheckCircle className="h-5 w-5" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar servicio"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Create Service Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div 
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
                }}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Crear Nuevo Servicio</h3>
                    <motion.button
                      onClick={() => setShowCreateModal(false)}
                      className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                      disabled={saving}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
                  </div>
                </div>
              
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Título del Servicio *
                    </label>
                    <input
                      type="text"
                      value={newService.title}
                      onChange={(e) => setNewService(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-3 text-gray-900 placeholder-gray-400 rounded-xl transition-all duration-200"
                      style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                      placeholder="Ej: Reparación de Plomería Residencial"
                    />
                  </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe detalladamente qué incluye tu servicio..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Categoría *
                    </label>
                    <select
                      value={newService.category}
                      onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value as ServiceCategory }))}
                      className="w-full px-3 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.icon} {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Precio ($) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={newService.price}
                        onChange={(e) => setNewService(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                        min="0"
                        className="w-full pl-10 pr-3 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="2500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Duración (minutos) *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={newService.duration_minutes}
                        onChange={(e) => setNewService(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 60 }))}
                        min="15"
                        step="15"
                        className="w-full pl-10 pr-3 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="120"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Ubicación (Opcional)
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={newService.address || ''}
                        onChange={(e) => setNewService(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full pl-10 pr-3 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Rawson, Chubut"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateService}
                    disabled={saving || !newService.title || !newService.description}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Creando...' : 'Crear Servicio'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
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

export default ASServicios;