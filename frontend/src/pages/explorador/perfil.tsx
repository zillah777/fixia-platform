import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, User, Camera, Upload, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

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
  }, [user, loading, router]);

  const getImageUrl = (originalUrl: string, useProxy = false) => {
    if (!originalUrl) return null;
    
    const fullUrl = originalUrl.startsWith('http') 
      ? originalUrl 
      : `${process.env['NEXT_PUBLIC_API_URL']}${originalUrl}`;
    
    if (useProxy) {
      return `/api/image-proxy?url=${encodeURIComponent(fullUrl)}`;
    }
    
    return fullUrl;
  };

  useEffect(() => {
    if (user?.profile_photo_url && !uploadingPhoto) {
      const photoUrl = getImageUrl(user.profile_photo_url);
      setPhotoPreview(photoUrl);
    } else if (!user?.profile_photo_url && !uploadingPhoto) {
      setPhotoPreview(null);
    }
  }, [user?.profile_photo_url, uploadingPhoto]);

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

    setError('');
    setMessage('');

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten imágenes (JPEG, JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB');
      return;
    }

    setUploadingPhoto(true);

    try {
      const tempPreview = URL.createObjectURL(file);
      setPhotoPreview(tempPreview);

      const photoUrl = await uploadProfilePhoto(file);
      URL.revokeObjectURL(tempPreview);
      
      const finalPhotoUrl = getImageUrl(photoUrl, false);
      setPhotoPreview(finalPhotoUrl);
      setMessage('Foto de perfil actualizada exitosamente');
      
    } catch (err: any) {
      setError(err.message || 'Error al subir la foto. Intenta de nuevo.');
      
      if (user?.profile_photo_url) {
        const originalPhotoUrl = user.profile_photo_url.startsWith('http') 
          ? user.profile_photo_url 
          : `${process.env['NEXT_PUBLIC_API_URL']}${user.profile_photo_url}`;
        setPhotoPreview(originalPhotoUrl);
      } else {
        setPhotoPreview(null);
      }
    } finally {
      setUploadingPhoto(false);
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
      <div className="min-h-screen relative overflow-hidden" style={{
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)'
      }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-30" style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
            animation: 'float 20s ease-in-out infinite'
          }} />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full opacity-40" style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)',
            animation: 'float 25s ease-in-out infinite reverse'
          }} />
        </div>
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center p-8 rounded-3xl" style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white/90 font-medium text-lg">Cargando perfil...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Editar Perfil | FIXIA</title>
        <meta name="description" content="Edita tu información personal y configuración de cuenta - Sistema Liquid Glass" />
        <meta name="keywords" content="perfil, explorador, FIXIA, editar información, configuración cuenta" />
      </Head>

      <div className="min-h-screen relative overflow-hidden" style={{
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)'
      }}>
        {/* Floating Orbs Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-30" style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
            animation: 'float 20s ease-in-out infinite'
          }} />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full opacity-40" style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)',
            animation: 'float 25s ease-in-out infinite reverse'
          }} />
          <div className="absolute -bottom-32 left-1/3 w-64 h-64 rounded-full opacity-20" style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(236, 72, 153, 0.1) 40%, transparent 70%)',
            animation: 'float 30s ease-in-out infinite'
          }} />
        </div>

        <div className="relative z-10 min-h-screen py-8 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header con Liquid Glass */}
            <div className="mb-8 p-6 rounded-3xl" style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3), 0 16px 32px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <div className="flex items-center justify-between">
                <Link href="/explorador/dashboard">
                  <button className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105" style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}>
                    <ArrowLeft className="w-5 h-5" />
                    Volver
                  </button>
                </Link>
                <div className="text-right">
                  <h1 className="text-3xl font-bold text-white mb-2" style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}>
                    Editar Perfil
                  </h1>
                  <p className="text-white/70 font-medium">
                    Actualiza tu información personal
                  </p>
                </div>
              </div>
            </div>

            {/* Messages con Liquid Glass */}
            {message && (
              <div className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{
                background: 'rgba(34, 197, 94, 0.1)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                boxShadow: '0 8px 16px rgba(34, 197, 94, 0.1)'
              }}>
                <CheckCircle className="w-6 h-6 text-green-300" />
                <span className="text-green-300 font-medium">{message}</span>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{
                background: 'rgba(239, 68, 68, 0.1)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                boxShadow: '0 8px 16px rgba(239, 68, 68, 0.1)'
              }}>
                <AlertCircle className="w-6 h-6 text-red-300" />
                <span className="text-red-300 font-medium">{error}</span>
              </div>
            )}

            {/* Main Content Container con Liquid Glass */}
            <div className="rounded-3xl p-8" style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3), 0 16px 32px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Photo Section con Liquid Glass */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  <div className="lg:col-span-1">
                    <div className="relative w-48 h-48 mx-auto">
                      {photoPreview ? (
                        <img 
                          src={photoPreview} 
                          alt="Foto de perfil" 
                          className="w-full h-full object-cover rounded-3xl shadow-2xl"
                          style={{
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3), 0 16px 32px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            
                            if (user?.profile_photo_url && !photoPreview?.includes('/api/image-proxy')) {
                              const proxyUrl = getImageUrl(user.profile_photo_url, true);
                              setPhotoPreview(proxyUrl);
                              return;
                            }
                            
                            if (user?.profile_photo_url && !photoPreview?.startsWith('http')) {
                              const directUrl = getImageUrl(user.profile_photo_url, false);
                              if (directUrl !== photoPreview) {
                                setPhotoPreview(directUrl);
                                return;
                              }
                            }
                            
                            setTimeout(() => {
                              setPhotoPreview(null);
                              setError('Error al cargar la imagen. Problemas de conectividad.');
                            }, 5000);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full rounded-3xl flex items-center justify-center" style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(12px)',
                          border: '2px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 16px 32px rgba(0, 0, 0, 0.2)'
                        }}>
                          <div className="text-center">
                            <User className="w-16 h-16 text-white/40 mx-auto mb-2" />
                            <span className="text-white/60 font-medium">Sin foto</span>
                          </div>
                        </div>
                      )}
                      {uploadingPhoto && (
                        <div className="absolute inset-0 rounded-3xl flex items-center justify-center" style={{
                          background: 'rgba(0, 0, 0, 0.7)',
                          backdropFilter: 'blur(8px)'
                        }}>
                          <div className="text-center">
                            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <div className="text-white font-medium">Subiendo...</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <h3 className="text-2xl font-bold text-white mb-3" style={{
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}>
                      Foto de Perfil
                    </h3>
                    <p className="text-white/70 font-medium mb-6">
                      Imagen JPG, PNG o WebP (máx. 5MB)
                    </p>
                    <input
                      type="file"
                      id="profile-photo"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-4">
                      <label 
                        htmlFor="profile-photo"
                        className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-300 hover:scale-105 disabled:opacity-50"
                        style={{
                          background: uploadingPhoto 
                            ? 'rgba(156, 163, 175, 0.2)' 
                            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                          color: 'white'
                        }}
                      >
                        {uploadingPhoto ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Subiendo...
                          </>
                        ) : (
                          <>
                            {photoPreview ? <Camera className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                            {photoPreview ? 'Cambiar Foto' : 'Subir Foto'}
                          </>
                        )}
                      </label>
                      
                      {photoPreview && !uploadingPhoto && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
                            color: 'rgb(252, 165, 165)'
                          }}
                        >
                          <Trash2 className="w-5 h-5" />
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Information Section con Liquid Glass */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-white font-semibold text-lg mb-2" style={{
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                    }}>
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Tu nombre"
                      className="w-full px-4 py-3 rounded-xl font-medium text-white placeholder-white/60 transition-all duration-300 focus:scale-105 focus:outline-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-white font-semibold text-lg mb-2" style={{
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                    }}>
                      Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Tu apellido"
                      className="w-full px-4 py-3 rounded-xl font-medium text-white placeholder-white/60 transition-all duration-300 focus:scale-105 focus:outline-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-white font-semibold text-lg mb-2" style={{
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                    }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 rounded-xl font-medium text-white placeholder-white/60 transition-all duration-300 focus:scale-105 focus:outline-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-white font-semibold text-lg mb-2" style={{
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                    }}>
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+54 9 280 123-4567"
                      className="w-full px-4 py-3 rounded-xl font-medium text-white placeholder-white/60 transition-all duration-300 focus:scale-105 focus:outline-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                      }}
                    />
                  </div>
                </div>

                {/* Address Section con Liquid Glass */}
                <div className="space-y-2">
                  <label className="block text-white font-semibold text-lg mb-2" style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Tu dirección en Chubut"
                    className="w-full px-4 py-3 rounded-xl font-medium text-white placeholder-white/60 transition-all duration-300 focus:scale-105 focus:outline-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                  />
                </div>

                {/* Biography Section con Liquid Glass */}
                <div className="space-y-2">
                  <label className="block text-white font-semibold text-lg mb-2" style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    Biografía
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    placeholder="Cuéntanos un poco sobre ti..."
                    className="w-full px-4 py-3 rounded-xl font-medium text-white placeholder-white/60 transition-all duration-300 focus:scale-105 focus:outline-none resize-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                  />
                </div>

                {/* Action Buttons con Liquid Glass */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Link href="/explorador/dashboard" className="flex-1">
                    <button 
                      type="button"
                      className="w-full px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        color: 'white'
                      }}
                    >
                      Cancelar
                    </button>
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: saving 
                        ? 'rgba(156, 163, 175, 0.3)' 
                        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: saving 
                        ? '0 8px 32px rgba(0, 0, 0, 0.2)' 
                        : '0 8px 32px rgba(59, 130, 246, 0.3)',
                      color: 'white'
                    }}
                  >
                    {saving ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Guardando...
                      </div>
                    ) : (
                      'Guardar Cambios'
                    )}
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