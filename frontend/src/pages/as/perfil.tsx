import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowLeftIcon,
  UserIcon,
  CameraIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ClockIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  about_me: string;
  profession: string;
  years_experience: number;
  specialization: string;
  license_number: string;
  has_mobility: boolean;
  profile_photo_url?: string;
  verification_status: 'pending' | 'in_review' | 'verified' | 'rejected';
  profile_completion_percentage: number;
}

const ASPerfil: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    about_me: '',
    profession: '',
    years_experience: 0,
    specialization: '',
    license_number: '',
    has_mobility: false,
    verification_status: 'pending',
    profile_completion_percentage: 75
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'professional' | 'verification'>('info');

  useEffect(() => {
    if (!loading && user?.user_type !== 'provider') {
      router.push('/explorador/cambiar-a-as');
      return;
    }

    if (user) {
      setProfileData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        profile_photo_url: user.profile_photo_url
      }));
    }
  }, [user, loading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save profile
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsEditing(false);
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      alert('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const getCompletionItems = () => {
    const items = [
      { label: 'Información básica', completed: !!(profileData.first_name && profileData.last_name && profileData.phone) },
      { label: 'Foto de perfil', completed: !!profileData.profile_photo_url },
      { label: 'Dirección', completed: !!profileData.address },
      { label: 'Descripción profesional', completed: !!profileData.about_me },
      { label: 'Información profesional', completed: !!(profileData.profession && profileData.years_experience) },
      { label: 'Especialización', completed: !!profileData.specialization },
      { label: 'Verificación de identidad', completed: profileData.verification_status === 'verified' }
    ];
    return items;
  };

  const completionItems = getCompletionItems();
  const completedCount = completionItems.filter(item => item.completed).length;
  const completionPercentage = Math.round((completedCount / completionItems.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mi Perfil AS - Fixia</title>
        <meta name="description" content="Gestiona tu perfil profesional como AS en Fixia" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Link href="/as/dashboard">
                <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Mi Perfil Profesional</h1>
                <p className="text-gray-600 mt-1">
                  Gestiona tu información y configuración como AS
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Editar Perfil
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Completion */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Completitud del Perfil</h3>
              <span className="text-2xl font-bold text-blue-600">{completionPercentage}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {completionItems.map((item, index) => (
                <div key={index} className="flex items-center text-sm">
                  {item.completed ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  )}
                  <span className={item.completed ? 'text-gray-900' : 'text-gray-600'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Información Personal
                </button>
                <button
                  onClick={() => setActiveTab('professional')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'professional'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Info Profesional
                </button>
                <button
                  onClick={() => setActiveTab('verification')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'verification'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Verificación
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Información Personal</h3>
              
              {/* Profile Photo */}
              <div className="flex items-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {profileData.profile_photo_url ? (
                      <img
                        src={profileData.profile_photo_url}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                      <CameraIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="ml-6">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {profileData.first_name} {profileData.last_name}
                  </h4>
                  <p className="text-gray-600">{profileData.profession || 'Profesional AS'}</p>
                  {profileData.verification_status === 'verified' && (
                    <div className="flex items-center mt-1">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">Verificado</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">El email no se puede modificar</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="+54 9 280 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Av. San Martin 123, Centro"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Rawson, Chubut"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acerca de mí (Descripción profesional)
                </label>
                <textarea
                  value={profileData.about_me}
                  onChange={(e) => setProfileData(prev => ({ ...prev, about_me: e.target.value }))}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Describe tu experiencia, especialidades y enfoque profesional..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Esta descripción aparecerá en tu perfil público para que los clientes te conozcan mejor.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'professional' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Información Profesional</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profesión
                  </label>
                  <div className="relative">
                    <BriefcaseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.profession}
                      onChange={(e) => setProfileData(prev => ({ ...prev, profession: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Ej: Plomero, Electricista, Técnico"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Años de Experiencia
                  </label>
                  <div className="relative">
                    <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={profileData.years_experience}
                      onChange={(e) => setProfileData(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
                      disabled={!isEditing}
                      min="0"
                      max="50"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialización
                  </label>
                  <div className="relative">
                    <StarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.specialization}
                      onChange={(e) => setProfileData(prev => ({ ...prev, specialization: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Ej: Instalaciones domiciliarias, Reparaciones urgentes"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Matrícula/Licencia (Opcional)
                  </label>
                  <div className="relative">
                    <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.license_number}
                      onChange={(e) => setProfileData(prev => ({ ...prev, license_number: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Número de matrícula profesional"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="has_mobility"
                    checked={profileData.has_mobility}
                    onChange={(e) => setProfileData(prev => ({ ...prev, has_mobility: e.target.checked }))}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="has_mobility" className="ml-3 flex items-center text-sm text-gray-700">
                    <TruckIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Tengo movilidad propia (vehículo/moto)
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-1 ml-7">
                  Esto te permitirá ofrecer servicios a domicilio en un radio más amplio.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Estado de Verificación</h3>
              
              <div className="mb-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      profileData.verification_status === 'verified' ? 'bg-green-100' :
                      profileData.verification_status === 'in_review' ? 'bg-yellow-100' :
                      profileData.verification_status === 'rejected' ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      {profileData.verification_status === 'verified' ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      ) : (
                        <DocumentTextIcon className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Verificación de Identidad</h4>
                      <p className="text-sm text-gray-600">
                        {profileData.verification_status === 'verified' && 'Tu identidad ha sido verificada'}
                        {profileData.verification_status === 'in_review' && 'Verificación en proceso'}
                        {profileData.verification_status === 'pending' && 'Verificación pendiente'}
                        {profileData.verification_status === 'rejected' && 'Verificación rechazada'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      profileData.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                      profileData.verification_status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                      profileData.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {profileData.verification_status === 'verified' && 'Verificado'}
                      {profileData.verification_status === 'in_review' && 'En Revisión'}
                      {profileData.verification_status === 'pending' && 'Pendiente'}
                      {profileData.verification_status === 'rejected' && 'Rechazado'}
                    </span>
                  </div>
                </div>
              </div>

              {profileData.verification_status !== 'verified' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">¿Por qué verificar tu identidad?</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600" />
                      Mayor confianza de los clientes
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600" />
                      Mejor posicionamiento en búsquedas
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600" />
                      Acceso a funciones premium
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600" />
                      Insignia de "Verificado" en tu perfil
                    </li>
                  </ul>
                  
                  <div className="mt-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Iniciar Verificación
                    </button>
                  </div>
                </div>
              )}

              {profileData.verification_status === 'verified' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-green-900">¡Felicitaciones!</h4>
                      <p className="text-green-800">Tu identidad ha sido verificada exitosamente.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ASPerfil;