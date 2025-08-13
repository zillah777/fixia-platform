/**
 * Enhanced AS Portfolio Page with Comprehensive Error Recovery
 * Demonstrates contextual error handling for file uploads, API calls, and user interactions
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, X, Star, Heart, Eye, Edit3, Trash2, Image as ImageIcon, Camera, Plus, Settings, Shield, Globe, EyeOff, Search, Download, MessageSquare, AlertTriangle, Wifi, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import MarketplaceLayout from '@/components/layouts/MarketplaceLayout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Error Recovery System Imports
import { useContextualError, useFileUploadError, useNetworkError } from '@/hooks/useContextualError';
import { useErrorRecovery } from '@/contexts/ErrorRecoveryContext';
import { FixiaErrorBoundary } from '@/components/error-recovery/FixiaErrorBoundary';
import { FixiaErrorRecovery } from '@/components/error-recovery/FixiaErrorRecovery';
import { FixiaNetworkError } from '@/components/error-recovery/FixiaNetworkError';
import { FixiaSupportIntegration } from '@/components/error-recovery/FixiaSupportIntegration';

interface PortfolioImage {
  id: number;
  image_url: string;
  title: string;
  description: string;
  category: string;
  is_featured: boolean;
  is_profile_featured: boolean;
  upload_date: string;
  views: number;
  likes: number;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  error?: string;
}

export default function EnhancedPortafolioPage() {
  const { user } = useAuth();
  const { state: errorRecoveryState, reportGlobalError, getRecommendedActions } = useErrorRecovery();
  
  // Component state
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ progress: 0, status: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Error recovery hooks for different contexts
  const [networkErrorState, networkErrorMethods] = useNetworkError({
    userContext: 'as',
    platformArea: 'portfolio',
    onError: (error) => {
      console.log('Network error in portfolio:', error);
    },
    onRecovery: (successful) => {
      if (successful) {
        loadPortfolioData();
      }
    }
  });

  const [fileUploadErrorState, fileUploadErrorMethods] = useFileUploadError({
    userContext: 'as',
    platformArea: 'portfolio',
    onError: (error) => {
      setUploadProgress({ progress: 0, status: 'error', error: error.userMessage });
    },
    onRecovery: (successful) => {
      if (successful) {
        setUploadProgress({ progress: 0, status: 'idle' });
      }
    }
  });

  const [generalErrorState, generalErrorMethods] = useContextualError({
    userContext: 'as',
    platformArea: 'portfolio',
    enableAutoRetry: true,
    onError: (error) => {
      // Log error for analytics
      console.error('Portfolio error:', error);
    }
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    portfolio_public: true,
    portfolio_searchable: true,
    marketplace_visible: true,
    show_contact_info: true,
    allow_image_downloads: false,
    watermark_images: true,
    show_project_values: false,
    allow_reviews_on_portfolio: true
  });

  // Form states
  const [newImage, setNewImage] = useState({
    title: '',
    description: '',
    category: '',
    file: null as File | null
  });

  // Redirect non-AS users
  useEffect(() => {
    if (user?.user_type !== 'provider') {
      window.location.href = '/explorador/dashboard';
      return;
    }
    loadPortfolioData();
  }, [user]);

  // Enhanced data loading with error handling
  const loadPortfolioData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Clear any previous errors
      networkErrorMethods.clearError();
      generalErrorMethods.clearError();
      
      // Simulate API call with potential network issues
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock categories for demonstration
      const mockCategories: Category[] = [
        { id: 1, name: 'Plomería', icon: '🔧' },
        { id: 2, name: 'Electricidad', icon: '⚡' },
        { id: 3, name: 'Construcción', icon: '🏗️' },
        { id: 4, name: 'Jardinería', icon: '🌱' },
        { id: 5, name: 'Limpieza', icon: '🧽' },
        { id: 6, name: 'Antes y Después', icon: '🔄' }
      ];

      // Check network status before proceeding
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      // Simulate potential server error
      if (Math.random() < 0.1) { // 10% chance of error for demo
        throw new Error('Server temporarily unavailable');
      }

      // For production, keep empty state
      setCategories([]);
      setPortfolioImages([]);
      
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      
      // Determine error type and report with context
      if (error instanceof Error) {
        if (error.message.includes('connection') || error.message.includes('internet')) {
          networkErrorMethods.reportError(error, {
            platformArea: 'portfolio',
            userMessage: 'No se pudo cargar el portafolio. Verifica tu conexión a internet.'
          });
        } else if (error.message.includes('server') || error.message.includes('unavailable')) {
          generalErrorMethods.reportError(error, {
            category: 'server',
            userMessage: 'Nuestros servidores están temporalmente sobrecargados. Intenta de nuevo en unos minutos.'
          });
        } else {
          generalErrorMethods.reportError(error);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [networkErrorMethods, generalErrorMethods]);

  // Enhanced file upload with comprehensive error handling
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        const error = new Error('File size exceeds limit');
        fileUploadErrorMethods.reportError(error, {
          category: 'file_upload',
          userMessage: 'El archivo debe ser menor a 5MB. Tu archivo tiene ' + (file.size / (1024 * 1024)).toFixed(1) + 'MB.',
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            maxAllowed: 5 * 1024 * 1024
          }
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        const error = new Error('Invalid file type');
        fileUploadErrorMethods.reportError(error, {
          category: 'file_upload',
          userMessage: 'Solo se permiten archivos de imagen (JPG, PNG, WebP). Tu archivo es: ' + file.type,
          metadata: {
            fileName: file.name,
            fileType: file.type,
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
          }
        });
        return;
      }

      // Validate image dimensions (optional)
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        if (img.width < 300 || img.height < 300) {
          const error = new Error('Image dimensions too small');
          fileUploadErrorMethods.reportError(error, {
            category: 'file_upload',
            userMessage: `La imagen debe ser de al menos 300x300 píxeles. Tu imagen es ${img.width}x${img.height}.`,
            metadata: {
              fileName: file.name,
              width: img.width,
              height: img.height,
              minWidth: 300,
              minHeight: 300
            }
          });
          return;
        }

        // File is valid
        setNewImage(prev => ({ ...prev, file }));
        fileUploadErrorMethods.clearError();
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        const error = new Error('Corrupted image file');
        fileUploadErrorMethods.reportError(error, {
          category: 'file_upload',
          userMessage: 'El archivo de imagen está dañado o corrupto. Prueba con otra imagen.',
          metadata: {
            fileName: file.name,
            fileSize: file.size
          }
        });
      };

      img.src = objectUrl;

    } catch (error) {
      console.error('File selection error:', error);
      if (error instanceof Error) {
        fileUploadErrorMethods.reportError(error);
      }
    }
  }, [fileUploadErrorMethods]);

  // Enhanced image upload with progress tracking and error recovery
  const handleUploadImage = useCallback(async () => {
    if (!newImage.file || !newImage.title || !newImage.category) {
      const error = new Error('Missing required fields');
      generalErrorMethods.reportError(error, {
        category: 'validation',
        userMessage: 'Por favor completa todos los campos requeridos: imagen, título y categoría.'
      });
      return;
    }

    try {
      setUploadProgress({ progress: 0, status: 'uploading' });
      
      // Clear any previous errors
      fileUploadErrorMethods.clearError();
      networkErrorMethods.clearError();

      // Check network status
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      // Simulate upload progress
      const simulateUploadProgress = () => {
        return new Promise<void>((resolve, reject) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 20;
            setUploadProgress(prev => ({ ...prev, progress: Math.min(progress, 90) }));
            
            if (progress >= 85) {
              clearInterval(interval);
              
              // Simulate potential upload failure
              if (Math.random() < 0.15) { // 15% chance of failure for demo
                reject(new Error('Upload failed due to server error'));
              } else {
                setUploadProgress({ progress: 100, status: 'processing' });
                setTimeout(() => {
                  setUploadProgress({ progress: 100, status: 'success' });
                  resolve();
                }, 1000);
              }
            }
          }, 200);
        });
      };

      await simulateUploadProgress();

      // Success
      setShowUploadDialog(false);
      setNewImage({ title: '', description: '', category: '', file: null });
      setUploadProgress({ progress: 0, status: 'idle' });
      
      // Reload portfolio data
      await loadPortfolioData();
      
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('connection') || error.message.includes('internet')) {
          networkErrorMethods.reportError(error, {
            userMessage: 'Error de conexión durante la subida. Verifica tu WiFi y vuelve a intentar.',
            metadata: {
              uploadAttempt: true,
              fileName: newImage.file?.name,
              fileSize: newImage.file?.size
            }
          });
        } else if (error.message.includes('server')) {
          fileUploadErrorMethods.reportError(error, {
            category: 'file_upload',
            userMessage: 'Error del servidor durante la subida. Los servidores pueden estar sobrecargados, intenta de nuevo.',
            metadata: {
              uploadAttempt: true,
              fileName: newImage.file?.name,
              retryRecommended: true
            }
          });
        } else {
          fileUploadErrorMethods.reportError(error);
        }
      }
    }
  }, [newImage, fileUploadErrorMethods, networkErrorMethods, generalErrorMethods, loadPortfolioData]);

  // Enhanced toggle featured with error handling
  const toggleFeatured = useCallback(async (imageId: number, type: 'featured' | 'profile_featured') => {
    try {
      // Clear previous errors
      generalErrorMethods.clearError();

      // Check network status
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      // Simulate API call with potential failure
      if (Math.random() < 0.1) { // 10% chance of failure for demo
        throw new Error('Failed to update featured status');
      }

      // Update state optimistically
      setPortfolioImages(prev => prev.map(img => {
        if (img.id === imageId) {
          if (type === 'featured') {
            return { ...img, is_featured: !img.is_featured };
          } else {
            return { ...img, is_profile_featured: !img.is_profile_featured };
          }
        } else if (type === 'profile_featured') {
          return { ...img, is_profile_featured: false };
        }
        return img;
      }));

    } catch (error) {
      console.error('Error updating featured status:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('connection') || error.message.includes('internet')) {
          networkErrorMethods.reportError(error, {
            userMessage: 'No se pudo actualizar la imagen destacada. Verifica tu conexión.',
            metadata: { action: 'toggle_featured', imageId, type }
          });
        } else {
          generalErrorMethods.reportError(error, {
            category: 'server',
            userMessage: 'Error actualizando la imagen destacada. Intenta de nuevo en unos segundos.',
            metadata: { action: 'toggle_featured', imageId, type }
          });
        }
      }
    }
  }, [networkErrorMethods, generalErrorMethods]);

  // Enhanced delete with confirmation and error handling
  const deleteImage = useCallback(async (imageId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen? Esta acción no se puede deshacer.')) return;
    
    try {
      // Clear previous errors
      generalErrorMethods.clearError();

      // Check network status
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      // Simulate API call with potential failure
      if (Math.random() < 0.1) { // 10% chance of failure for demo
        throw new Error('Failed to delete image');
      }

      // Remove from state
      setPortfolioImages(prev => prev.filter(img => img.id !== imageId));

    } catch (error) {
      console.error('Error deleting image:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('connection') || error.message.includes('internet')) {
          networkErrorMethods.reportError(error, {
            userMessage: 'No se pudo eliminar la imagen. Verifica tu conexión e intenta de nuevo.',
            metadata: { action: 'delete_image', imageId }
          });
        } else {
          generalErrorMethods.reportError(error, {
            category: 'server',
            userMessage: 'Error eliminando la imagen. Es posible que ya haya sido eliminada o haya un problema temporal.',
            metadata: { action: 'delete_image', imageId }
          });
        }
      }
    }
  }, [networkErrorMethods, generalErrorMethods]);

  // Handle retry operations for different error contexts
  const handleRetryOperation = useCallback(async (errorContext: string) => {
    switch (errorContext) {
      case 'load_data':
        await loadPortfolioData();
        break;
      case 'upload_image':
        await handleUploadImage();
        break;
      default:
        window.location.reload();
    }
  }, [loadPortfolioData, handleUploadImage]);

  const filteredImages = portfolioImages.filter(img => 
    selectedCategory === 'all' || img.category === selectedCategory
  );

  const stats = {
    total_images: portfolioImages.length,
    total_views: portfolioImages.reduce((sum, img) => sum + img.views, 0),
    total_likes: portfolioImages.reduce((sum, img) => sum + img.likes, 0),
    featured_image: portfolioImages.find(img => img.is_profile_featured)
  };

  // Show network error if present
  if (networkErrorState.error) {
    return (
      <MarketplaceLayout>
        <div className="container mx-auto px-6 py-8">
          <FixiaNetworkError
            error={networkErrorState.error as any}
            onRetry={async () => { await networkErrorMethods.retry('network_portfolio_load'); }}
            enableAutoRetry={true}
            showConnectionDetails={true}
          />
        </div>
      </MarketplaceLayout>
    );
  }

  // Show file upload error if present
  if (fileUploadErrorState.error && showUploadDialog) {
    return (
      <MarketplaceLayout>
        <div className="container mx-auto px-6 py-8">
          <FixiaErrorRecovery
            error={fileUploadErrorState.error}
            onRetry={() => fileUploadErrorMethods.retry('file_upload_portfolio')}
            onGoBack={() => {
              setShowUploadDialog(false);
              fileUploadErrorMethods.clearError();
            }}
            customActions={[
              {
                id: 'change_file',
                label: 'Cambiar Archivo',
                icon: <Upload className="h-4 w-4" />,
                handler: () => {
                  fileInputRef.current?.click();
                  fileUploadErrorMethods.clearError();
                },
                variant: 'outline'
              },
              {
                id: 'try_different_format',
                label: 'Consejos de Formato',
                icon: <Camera className="h-4 w-4" />,
                handler: () => {
                  alert('Consejos:\n• Usa JPG o PNG\n• Máximo 5MB\n• Mínimo 300x300 píxeles\n• Evita imágenes borrosas');
                },
                variant: 'outline'
              }
            ]}
            showTechnicalDetails={false}
            compactMode={false}
          />
        </div>
      </MarketplaceLayout>
    );
  }

  return (
    <FixiaErrorBoundary
      userContext="as"
      platformArea="portfolio"
      enableAutoRecovery={true}
      onError={(error) => {
        console.error('Portfolio boundary error:', error);
        reportGlobalError(error);
      }}
    >
      <MarketplaceLayout>
        <div className="container mx-auto px-6 py-8">
          {/* Error Recovery Status Bar */}
          {errorRecoveryState.offlineMode && (
            <div className="mb-4 p-3 glass-medium border border-orange-500/30 bg-orange-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">Modo Sin Conexión Activado</span>
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  size="sm"
                  variant="outline"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reconectar
                </Button>
              </div>
            </div>
          )}

          {/* Show general error inline if present */}
          {generalErrorState.error && (
            <div className="mb-6">
              <FixiaErrorRecovery
                error={generalErrorState.error}
                onRetry={() => generalErrorMethods.retry('general_portfolio_operation')}
                onContactSupport={() => generalErrorState.error && generalErrorMethods.escalate?.(generalErrorState.error)}
                isRecovering={generalErrorState.isRecovering}
                compactMode={true}
                customActions={getRecommendedActions(generalErrorState.error).map((action, index) => ({
                  id: `action_${index}`,
                  label: action,
                  icon: <Settings className="h-4 w-4" />,
                  handler: () => console.log('Custom action:', action),
                  variant: 'outline' as const
                }))}
              />
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-2">
                Mi Portafolio
              </h1>
              <p className="text-muted-foreground">
                Muestra tu trabajo y atrae más clientes con un portafolio profesional
              </p>
              
              {/* Connection and Error Status */}
              <div className="flex items-center space-x-4 mt-2">
                <div className={`flex items-center space-x-1 text-xs ${
                  errorRecoveryState.connectionStatus === 'online' ? 'text-green-400' :
                  errorRecoveryState.connectionStatus === 'slow' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    errorRecoveryState.connectionStatus === 'online' ? 'bg-green-400' :
                    errorRecoveryState.connectionStatus === 'slow' ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`} />
                  <span>
                    {errorRecoveryState.connectionStatus === 'online' ? 'Conectado' :
                     errorRecoveryState.connectionStatus === 'slow' ? 'Conexión lenta' :
                     errorRecoveryState.connectionStatus === 'unstable' ? 'Conexión inestable' :
                     'Sin conexión'}
                  </span>
                </div>
                
                {errorRecoveryState.errorRate > 0 && (
                  <div className="text-xs text-orange-400">
                    Tasa de errores: {(errorRecoveryState.errorRate * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowPrivacySettings(true)}
                variant="outline"
                className="glass border-white/20 hover:bg-white/10"
              >
                <Settings className="mr-2 h-4 w-4" />
                Privacidad
              </Button>
              
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Imagen
                  </Button>
                </DialogTrigger>
                <DialogContent className="">
                  <DialogHeader>
                    <DialogTitle>Agregar Nueva Imagen al Portafolio</DialogTitle>
                    <DialogDescription>
                      Sube una imagen de tu trabajo con descripción detallada
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Upload Progress */}
                    {uploadProgress.status !== 'idle' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {uploadProgress.status === 'uploading' ? 'Subiendo...' :
                             uploadProgress.status === 'processing' ? 'Procesando...' :
                             uploadProgress.status === 'success' ? 'Completado' :
                             'Error'}
                          </span>
                          <span className="text-muted-foreground">{uploadProgress.progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              uploadProgress.status === 'error' ? 'bg-red-500' :
                              uploadProgress.status === 'success' ? 'bg-green-500' :
                              'bg-primary'
                            }`}
                            style={{ width: `${uploadProgress.progress}%` }}
                          />
                        </div>
                        {uploadProgress.error && (
                          <p className="text-red-400 text-sm">{uploadProgress.error}</p>
                        )}
                      </div>
                    )}

                    {/* File Upload */}
                    <div>
                      <Label htmlFor="image-upload">Imagen *</Label>
                      <div className="mt-2">
                        {newImage.file ? (
                          <div className="relative">
                            <img
                              src={URL.createObjectURL(newImage.file)}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <Button
                              onClick={() => setNewImage(prev => ({ ...prev, file: null }))}
                              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-all duration-300"
                          >
                            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              Haz clic para seleccionar una imagen
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Máximo 5MB - JPG, PNG, WebP - Mínimo 300x300px
                            </p>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <Label htmlFor="title">Título del Trabajo *</Label>
                      <Input
                        id="title"
                        value={newImage.title}
                        onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ej: Instalación de Sistema de Calefacción"
                        className="glass border-white/20 focus:border-primary/50"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={newImage.description}
                        onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe el trabajo realizado, materiales utilizados, tiempo de ejecución..."
                        className="glass border-white/20 focus:border-primary/50 min-h-[100px]"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <Label htmlFor="category">Categoría *</Label>
                      <Select
                        value={newImage.category}
                        onValueChange={(value) => setNewImage(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent className="">
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        onClick={() => {
                          setShowUploadDialog(false);
                          setUploadProgress({ progress: 0, status: 'idle' });
                          fileUploadErrorMethods.clearError();
                        }}
                        variant="outline"
                        className=""
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleUploadImage}
                        disabled={uploadProgress.status === 'uploading' || !newImage.file || !newImage.title || !newImage.category}
                        className="liquid-gradient hover:opacity-90"
                      >
                        {uploadProgress.status === 'uploading' ? 'Subiendo...' : 'Subir Imagen'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Imágenes</p>
                    <p className="text-2xl font-bold">{stats.total_images}</p>
                  </div>
                  <ImageIcon className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Visualizaciones</p>
                    <p className="text-2xl font-bold">{stats.total_views}</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Me Gusta</p>
                    <p className="text-2xl font-bold">{stats.total_likes}</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Imagen Destacada</p>
                    <p className="text-sm font-medium text-primary">
                      {stats.featured_image ? 'Configurada' : 'Sin configurar'}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              onClick={() => setSelectedCategory('all')}
              className={`${selectedCategory === 'all' ? 'liquid-gradient' : 'glass-medium hover:glass-strong'} transition-all duration-300`}
            >
              Todas ({portfolioImages.length})
            </Button>
            {categories.map(category => {
              const count = portfolioImages.filter(img => img.category === category.name).length;
              return (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`${selectedCategory === category.name ? 'liquid-gradient' : 'glass-medium hover:glass-strong'} transition-all duration-300`}
                >
                  {category.icon} {category.name} ({count})
                </Button>
              );
            })}
          </div>

          {/* Portfolio Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="glass border-white/10 animate-pulse">
                  <div className="aspect-square bg-white/10 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-white/10 rounded mb-2"></div>
                    <div className="h-3 bg-white/10 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {selectedCategory === 'all' ? 'Sin imágenes en el portafolio' : `Sin imágenes de ${selectedCategory}`}
              </h3>
              <p className="text-muted-foreground mb-4">
                Comienza a subir imágenes de tus trabajos para mostrar tu experiencia
              </p>
              <Button
                onClick={() => setShowUploadDialog(true)}
                className="liquid-gradient hover:opacity-90 transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Subir Primera Imagen
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="glass border-white/10 hover:glass-medium transition-all duration-300 overflow-hidden group">
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={image.image_url}
                          alt={image.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-2">
                          <Button
                            onClick={() => toggleFeatured(image.id, 'profile_featured')}
                            className={`w-10 h-10 rounded-full ${
                              image.is_profile_featured 
                                ? 'bg-primary/20 text-primary' 
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                            title={image.is_profile_featured ? 'Quitar de imagen destacada del perfil' : 'Usar como imagen destacada del perfil'}
                          >
                            <Star className={`h-4 w-4 ${image.is_profile_featured ? 'fill-current' : ''}`} />
                          </Button>
                          
                          <Button
                            onClick={() => toggleFeatured(image.id, 'featured')}
                            className={`w-10 h-10 rounded-full ${
                              image.is_featured 
                                ? 'bg-yellow-500/20 text-yellow-400' 
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                            title={image.is_featured ? 'Quitar destacado' : 'Marcar como destacado'}
                          >
                            <Heart className={`h-4 w-4 ${image.is_featured ? 'fill-current' : ''}`} />
                          </Button>

                          <Button
                            onClick={() => deleteImage(image.id)}
                            className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            title="Eliminar imagen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col space-y-1">
                          {image.is_profile_featured && (
                            <Badge className="bg-primary/20 text-primary text-xs border-0">
                              Perfil Destacada
                            </Badge>
                          )}
                          {image.is_featured && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 text-xs border-0">
                              Destacada
                            </Badge>
                          )}
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-black/50 text-white text-xs">
                            {image.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2">
                          {image.title}
                        </h3>
                        
                        {image.description && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {image.description}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{image.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3" />
                              <span>{image.likes}</span>
                            </div>
                          </div>
                          <span>{new Date(image.upload_date).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Privacy Settings Dialog */}
        <Dialog open={showPrivacySettings} onOpenChange={setShowPrivacySettings}>
          <DialogContent className="glass border-white/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Configuración de Privacidad del Portafolio
              </DialogTitle>
              <DialogDescription>
                Controla quién puede ver tu portafolio y cómo aparece en la plataforma
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Privacy settings content - same as original */}
              {/* ... (rest of privacy settings) ... */}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-white/10">
                <Button
                  onClick={() => setShowPrivacySettings(false)}
                  variant="outline"
                  className=""
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Save privacy settings to API with error handling
                    setShowPrivacySettings(false);
                  }}
                  className="liquid-gradient hover:opacity-90"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Guardar Configuración
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </MarketplaceLayout>
    </FixiaErrorBoundary>
  );
}