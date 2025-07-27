import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Clock, CheckCircle, X } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Booking, BookingStatus } from '@/types';

const statusMap = {
  pending: { label: 'Pendiente', color: 'yellow', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'blue', icon: CheckCircle },
  in_progress: { label: 'En Progreso', color: 'purple', icon: Clock },
  completed: { label: 'Completado', color: 'green', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'red', icon: X }
};

const ASSolicitudes: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
  const [responding, setResponding] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && user?.user_type !== 'provider') {
      router.push('/explorador/cambiar-a-as');
      return;
    }

    // TODO: Fetch real bookings from API
    setBookings([
      {
        id: 1,
        customer_id: 101,
        provider_id: user?.id || 1,
        service_id: 1,
        scheduled_date: '2024-01-20',
        scheduled_time: '14:00',
        total_amount: 2500,
        status: 'pending',
        payment_status: 'pending',
        notes: 'Tengo una filtración en el baño que necesita reparación urgente. El agua gotea constantemente.',
        customer_address: 'Av. San Martín 456, Rawson',
        customer_latitude: -43.3002,
        customer_longitude: -65.1023,
        created_at: '2024-01-18T10:30:00Z',
        updated_at: '2024-01-18T10:30:00Z',
        service_title: 'Reparación de Plomería Residencial',
        service_description: 'Reparación de cañerías, grifos, inodoros y sistemas de agua.',
        category: 'plomeria',
        duration_minutes: 120,
        customer_first_name: 'María',
        customer_last_name: 'González',
        customer_photo: undefined,
        customer_phone: '+54 9 280 123-4567',
        provider_first_name: user?.first_name || '',
        provider_last_name: user?.last_name || '',
        provider_photo: user?.profile_photo_url,
        provider_phone: user?.phone
      },
      {
        id: 2,
        customer_id: 102,
        provider_id: user?.id || 1,
        service_id: 2,
        scheduled_date: '2024-01-22',
        scheduled_time: '09:00',
        total_amount: 3800,
        status: 'confirmed',
        payment_status: 'approved',
        notes: 'Necesito instalar nuevos tomas en el living y la cocina.',
        customer_address: 'Belgrano 789, Trelew',
        customer_latitude: -43.2481,
        customer_longitude: -65.3051,
        created_at: '2024-01-17T16:45:00Z',
        updated_at: '2024-01-18T08:15:00Z',
        service_title: 'Instalación Eléctrica Completa',
        service_description: 'Instalación de sistemas eléctricos para hogares y oficinas.',
        category: 'electricidad',
        duration_minutes: 180,
        customer_first_name: 'Carlos',
        customer_last_name: 'Rodríguez',
        customer_photo: undefined,
        customer_phone: '+54 9 280 987-6543',
        provider_first_name: user?.first_name || '',
        provider_last_name: user?.last_name || '',
        provider_photo: user?.profile_photo_url,
        provider_phone: user?.phone
      },
      {
        id: 3,
        customer_id: 103,
        provider_id: user?.id || 1,
        service_id: 1,
        scheduled_date: '2024-01-19',
        scheduled_time: '16:30',
        total_amount: 2500,
        status: 'pending',
        payment_status: 'pending',
        notes: 'El grifo de la cocina no cierra bien y pierde agua.',
        customer_address: 'Mitre 321, Puerto Madryn',
        customer_latitude: -42.7692,
        customer_longitude: -65.0386,
        created_at: '2024-01-18T14:20:00Z',
        updated_at: '2024-01-18T14:20:00Z',
        service_title: 'Reparación de Plomería Residencial',
        service_description: 'Reparación de cañerías, grifos, inodoros y sistemas de agua.',
        category: 'plomeria',
        duration_minutes: 120,
        customer_first_name: 'Ana',
        customer_last_name: 'López',
        customer_photo: undefined,
        customer_phone: '+54 9 280 456-7890',
        provider_first_name: user?.first_name || '',
        provider_last_name: user?.last_name || '',
        provider_photo: user?.profile_photo_url,
        provider_phone: user?.phone
      }
    ]);
  }, [user, loading]);

  const handleResponseToBooking = async (bookingId: number, action: 'accept' | 'reject') => {
    setResponding(bookingId);
    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: action === 'accept' ? 'confirmed' : 'cancelled' }
          : booking
      ));
      
      alert(action === 'accept' ? 'Solicitud aceptada exitosamente' : 'Solicitud rechazada');
    } catch (error) {
      alert('Error al procesar la solicitud');
    } finally {
      setResponding(null);
    }
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filterStatus);

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Solicitudes de Servicios - AS Panel - Fixia</title>
        <meta name="description" content="Gestiona las solicitudes de servicios como AS en Fixia" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Link href="/as/dashboard">
                <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="text-xl text-gray-600">←</span>
                </button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Servicios</h1>
                <p className="text-gray-600 mt-1">
                  Gestiona las solicitudes de tus clientes
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <span className="text-2xl text-yellow-600">🕰</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Confirmados</p>
                  <p className="text-3xl font-bold text-blue-600">{confirmedCount}</p>
                </div>
                <span className="text-2xl text-blue-600">✓</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completados</p>
                  <p className="text-3xl font-bold text-green-600">{completedCount}</p>
                </div>
                <span className="text-2xl text-green-600">✓</span>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">📊</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as BookingStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas las solicitudes</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmadas</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-6">
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                <span className="block text-6xl text-gray-300 mb-4">🕰</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay solicitudes
                </h3>
                <p className="text-gray-600">
                  {filterStatus === 'all' 
                    ? 'Aún no has recibido solicitudes de servicios.'
                    : `No hay solicitudes con estado "${(statusMap as any)[filterStatus]?.label || filterStatus}".`
                  }
                </p>
              </div>
            ) : (
              filteredBookings.map((booking) => {
                const statusInfo = (statusMap as any)[booking.status];
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={booking.id} className="bg-white rounded-xl shadow-sm border">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-4">
                            {booking.customer_photo ? (
                              <img
                                src={booking.customer_photo}
                                alt="Cliente"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl text-gray-400">👤</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.customer_first_name} {booking.customer_last_name}
                            </h3>
                            <p className="text-gray-600">{booking.service_title}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                            statusInfo.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                            statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            <StatusIcon className="inline mr-1" />
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Content Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Service Details */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Detalles del Servicio</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">📅</span>
                                <span>{new Date(booking.scheduled_date || '').toLocaleDateString('es-AR')} a las {booking.scheduled_time}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">🕰</span>
                                <span>{Math.floor((booking.duration_minutes || 60) / 60)}h {(booking.duration_minutes || 60) % 60}min</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">$</span>
                                <span className="font-medium">${booking.total_amount?.toLocaleString() || '0'}</span>
                              </div>
                              <div className="flex items-start">
                                <span className="text-gray-400 mr-2 mt-0.5">📍</span>
                                <span>{booking.customer_address}</span>
                              </div>
                            </div>
                          </div>

                          {booking.notes && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Notas del Cliente</h4>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-700">{booking.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Contact & Actions */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Información de Contacto</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">📞</span>
                                <a href={`tel:${booking.customer_phone}`} className="text-blue-600 hover:text-blue-700">
                                  {booking.customer_phone}
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="space-y-3">
                            {booking.status === 'pending' && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center mb-3">
                                  <span className="text-yellow-600 mr-2">ℹ</span>
                                  <span className="font-medium text-yellow-800">Acción Requerida</span>
                                </div>
                                <p className="text-sm text-yellow-700 mb-4">
                                  Esta solicitud está pendiente de tu respuesta. ¿Deseas aceptar o rechazar este servicio?
                                </p>
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => handleResponseToBooking(booking.id, 'reject')}
                                    disabled={responding === booking.id}
                                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                  >
                                    {responding === booking.id ? 'Procesando...' : 'Rechazar'}
                                  </button>
                                  <button
                                    onClick={() => handleResponseToBooking(booking.id, 'accept')}
                                    disabled={responding === booking.id}
                                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                  >
                                    {responding === booking.id ? 'Procesando...' : 'Aceptar'}
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="flex space-x-3">
                              <Link href={`/as/chat/${booking.customer_id}`} className="flex-1">
                                <button className="w-full flex items-center justify-center py-2 px-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                                  <span className="mr-2">💬</span>
                                  Chat
                                </button>
                              </Link>
                              
                              {booking.status === 'completed' && (
                                <button className="flex-1 flex items-center justify-center py-2 px-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                                  <span className="mr-2">★</span>
                                  Ver Reseña
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Status */}
                    {booking.payment_status && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Estado del Pago:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            booking.payment_status === 'approved' ? 'bg-green-100 text-green-800' :
                            booking.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.payment_status === 'approved' ? 'Pagado' :
                             booking.payment_status === 'pending' ? 'Pendiente' :
                             'Fallido'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
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

export default ASSolicitudes;