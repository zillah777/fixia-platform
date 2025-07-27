import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

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
      : `${process.env.NEXT_PUBLIC_API_URL}${originalUrl}`;
    
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
          : `${process.env.NEXT_PUBLIC_API_URL}${user.profile_photo_url}`;
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
      <div>
        <div>
          <div>Cargando perfil...</div>
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

      <div>
        <div>
          <div>
            <div>
              <div>
                <Link href="/explorador/dashboard">
                  <button>← Volver</button>
                </Link>
                <div>
                  <h1>Editar Perfil</h1>
                  <p>Actualiza tu información personal</p>
                </div>
              </div>
            </div>

            {message && (
              <div>
                <span>✓ {message}</span>
              </div>
            )}
            
            {error && (
              <div>
                <span>⚠ {error}</span>
              </div>
            )}

            <div>
              <form onSubmit={handleSubmit}>
                <div>
                  <div>
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Foto de perfil" 
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
                      <div>
                        <span>Sin foto</span>
                      </div>
                    )}
                    {uploadingPhoto && (
                      <div>
                        <div>Subiendo...</div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3>Foto de Perfil</h3>
                    <p>Imagen JPG, PNG o WebP (máx. 5MB)</p>
                    <input
                      type="file"
                      id="profile-photo"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      disabled={uploadingPhoto}
                    />
                    <div>
                      <label htmlFor="profile-photo">
                        {uploadingPhoto ? 'Subiendo...' : (photoPreview ? 'Cambiar Foto' : 'Subir Foto')}
                      </label>
                      {photoPreview && !uploadingPhoto && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div>
                    <label>Nombre *</label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label>Apellido *</label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Tu apellido"
                    />
                  </div>

                  <div>
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+54 9 280 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Tu dirección en Chubut"
                  />
                </div>

                <div>
                  <label>Biografía</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    placeholder="Cuéntanos un poco sobre ti..."
                  />
                </div>

                <div>
                  <Link href="/explorador/dashboard">
                    <button type="button">
                      Cancelar
                    </button>
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
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