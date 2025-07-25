import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { CorporateNavigation } from '@/components/ui';

const EditarPerfil: NextPage = () => {
  const { user, loading, updateProfile, uploadProfilePhoto, removeProfilePhoto } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.user_type !== 'customer')) {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
    
    // Set photo preview if user has profile photo
    if (user?.profile_photo_url) {
      // If URL is already complete, use it directly, otherwise prepend API URL
      const photoUrl = user.profile_photo_url.startsWith('http') 
        ? user.profile_photo_url 
        : `${process.env.NEXT_PUBLIC_API_URL}${user.profile_photo_url}`;
      setPhotoPreview(photoUrl);
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await updateProfile(formData);
      setMessage('Perfil actualizado exitosamente');
      setTimeout(() => {
        router.push('/explorador/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous errors
    setError('');
    setMessage('');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten imágenes (JPEG, JPG, PNG, WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB');
      return;
    }

    setUploadingPhoto(true);

    try {
      // Create temporary preview while uploading
      const tempPreview = URL.createObjectURL(file);
      setPhotoPreview(tempPreview);

      // Upload photo
      const photoUrl = await uploadProfilePhoto(file);
      
      // Update preview with server URL
      URL.revokeObjectURL(tempPreview); // Clean up temp URL
      setPhotoPreview(`${process.env.NEXT_PUBLIC_API_URL}${photoUrl}`);
      
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setError(err.message || 'Error al subir la foto. Intenta de nuevo.');
      
      // Restore original photo on error
      if (user?.profile_photo_url) {
        // If URL is already complete, use it directly, otherwise prepend API URL
        const photoUrl = user.profile_photo_url.startsWith('http') 
          ? user.profile_photo_url 
          : `${process.env.NEXT_PUBLIC_API_URL}${user.profile_photo_url}`;
        setPhotoPreview(photoUrl);
      } else {
        setPhotoPreview(null);
      }
    } finally {
      setUploadingPhoto(false);
      // Clear file input for re-selection of same file
      e.target.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!photoPreview) return;
    
    if (confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) {
      setUploadingPhoto(true);
      setError('');
      setMessage('');
      
      try {
        await removeProfilePhoto();
        setPhotoPreview(null);
      } catch (err: any) {
        setError(err.message || 'Error al eliminar la foto');
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-gray-900 mx-auto mb-6"></div>
          <p className="text-gray-600 font-semibold">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Editar Perfil | Fixia</title>
        <meta name="description" content="Edita tu información personal y configuración de cuenta" />
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
                  <h1 className="text-2xl font-semibold text-gray-900">Editar Perfil</h1>
                  <p className="text-gray-600 mt-1">Actualiza tu información personal</p>
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

            {/* Profile Form */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-20 sm:h-20 bg-gradient-to-br from-navy-500 to-blue-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
                      {photoPreview ? (
                        <img 
                          src={photoPreview} 
                          alt="Foto de perfil" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            setPhotoPreview(null);
                          }}
                        />
                      ) : (
                        <UserIcon className="w-12 h-12 sm:w-10 sm:h-10 text-white" />
                      )}
                    </div>
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-900">Foto de Perfil</h3>
                    <p className="text-gray-600 text-sm mt-1">Imagen JPG, PNG o WebP (máx. 5MB)</p>
                    <input
                      type="file"
                      id="profile-photo"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                      <label
                        htmlFor="profile-photo"
                        className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer inline-flex items-center transition-all shadow-sm ${
                          uploadingPhoto 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-navy-50 text-navy-600 hover:bg-navy-100 hover:shadow-md'
                        }`}
                      >
                        <CameraIcon className="w-4 h-4 mr-2" />
                        {uploadingPhoto ? 'Subiendo...' : (photoPreview ? 'Cambiar Foto' : 'Subir Foto')}
                      </label>
                      {photoPreview && !uploadingPhoto && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-md inline-flex items-center"
                        >
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Nombre *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-all"
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Apellido *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-all"
                        placeholder="Tu apellido"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-all"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Teléfono
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-all"
                        placeholder="+54 9 280 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Dirección
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-all"
                      placeholder="Tu dirección en Chubut"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Biografía
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-all resize-none"
                    placeholder="Cuéntanos un poco sobre ti..."
                  />
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
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
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

export default EditarPerfil;