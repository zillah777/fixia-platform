import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, X, Star, Heart, Eye, Edit3, Trash2, Image as ImageIcon, Camera, Plus, Settings, Shield, Globe, EyeOff, Search, Download, MessageSquare, AlertCircle, CheckCircle, UploadCloud, Maximize2, Minimize2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import MarketplaceLayout from '@/components/layouts/MarketplaceLayout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  file_size?: number;
  dimensions?: { width: number; height: number };
  tags?: string[];
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

interface DragState {
  isDragging: boolean;
  dragCounter: number;
}

export default function PortafolioPage() {
  const { user } = useAuth();
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ progress: 0, status: 'idle' });
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, dragCounter: 0 });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

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
    tags: '',
    file: null as File | null
  });

  // File validation and processing
  const validateFile = useCallback((file: File): string | null => {
    if (file.size > 5 * 1024 * 1024) {
      return `El archivo debe ser menor a 5MB. Tu archivo tiene ${(file.size / (1024 * 1024)).toFixed(1)}MB.`;
    }
    
    if (!file.type.startsWith('image/')) {
      return `Solo se permiten archivos de imagen (JPG, PNG, WebP). Tu archivo es: ${file.type}`;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return 'Formato no soportado. Usa JPG, PNG o WebP.';
    }

    return null;
  }, []);

  const processImageFile = useCallback(async (file: File) => {
    return new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        if (img.width < 300 || img.height < 300) {
          reject(new Error(`La imagen debe ser de al menos 300x300 píxeles. Tu imagen es ${img.width}x${img.height}.`));
          return;
        }

        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('El archivo de imagen está dañado o corrupto.'));
      };

      img.src = objectUrl;
    });
  }, []);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setUploadProgress({ progress: 0, status: 'error', error: validationError });
      return;
    }

    try {
      setUploadProgress({ progress: 50, status: 'processing' });
      const dimensions = await processImageFile(file);
      
      setNewImage(prev => ({ ...prev, file }));
      setUploadProgress({ progress: 0, status: 'idle' });
    } catch (error) {
      setUploadProgress({ progress: 0, status: 'error', error: (error as Error).message });
    }
  }, [validateFile, processImageFile]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(prev => ({
      isDragging: true,
      dragCounter: prev.dragCounter + 1
    }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(prev => {
      const newCounter = prev.dragCounter - 1;
      return {
        isDragging: newCounter > 0,
        dragCounter: newCounter
      };
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState({ isDragging: false, dragCounter: 0 });
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  useEffect(() => {
    if (user?.user_type !== 'provider') {
      window.location.href = '/explorador/dashboard';
      return;
    }
    loadPortfolioData();
  }, [user]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Mock categories
      const mockCategories: Category[] = [
        { id: 1, name: 'Plomería', icon: '🔧' },
        { id: 2, name: 'Electricidad', icon: '⚡' },
        { id: 3, name: 'Construcción', icon: '🏗️' },
        { id: 4, name: 'Jardinería', icon: '🌱' },
        { id: 5, name: 'Limpieza', icon: '🧽' },
        { id: 6, name: 'Antes y Después', icon: '🔄' }
      ];

      // Mock portfolio images - replace with API call
      const mockImages: PortfolioImage[] = [
        {
          id: 1,
          image_url: '/images/portfolio/plumbing-1.jpg',
          title: 'Instalación de Sistema de Calefacción',
          description: 'Instalación completa de sistema de calefacción central en vivienda familiar de 120m². Trabajo realizado en 3 días con garantía extendida.',
          category: 'Plomería',
          is_featured: true,
          is_profile_featured: true,
          upload_date: '2024-01-15',
          views: 156,
          likes: 23
        },
        {
          id: 2,
          image_url: '/images/portfolio/plumbing-2.jpg',
          title: 'Reparación de Cañerías Principal',
          description: 'Reparación y reemplazo de cañería principal dañada. Trabajo de emergencia completado en tiempo récord.',
          category: 'Plomería',
          is_featured: false,
          is_profile_featured: false,
          upload_date: '2024-01-10',
          views: 89,
          likes: 12
        }
      ];

      // For production launch - show empty states
      setCategories([]);
      setPortfolioImages([]);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
  };

  const handleUploadImage = useCallback(async () => {
    if (!newImage.file || !newImage.title || !newImage.category) {
      setUploadProgress({ progress: 0, status: 'error', error: 'Por favor completa todos los campos requeridos: imagen, título y categoría.' });
      return;
    }

    try {
      setUploadProgress({ progress: 0, status: 'uploading' });
      
      // Simulate upload progress
      const simulateProgress = () => {
        return new Promise<void>((resolve, reject) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            setUploadProgress(prev => ({ ...prev, progress: Math.min(progress, 90) }));
            
            if (progress >= 90) {
              clearInterval(interval);
              setUploadProgress({ progress: 100, status: 'processing' });
              
              setTimeout(() => {
                setUploadProgress({ progress: 100, status: 'success' });
                resolve();
              }, 1000);
            }
          }, 200);
        });
      };

      await simulateProgress();

      // Success - reset form and close dialog
      setTimeout(() => {
        setShowUploadDialog(false);
        setNewImage({ title: '', description: '', category: '', tags: '', file: null });
        setUploadProgress({ progress: 0, status: 'idle' });
        loadPortfolioData();
      }, 1500);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadProgress({ progress: 0, status: 'error', error: 'Error al subir la imagen. Intenta de nuevo.' });
    }
  }, [newImage]);

  const toggleFeatured = async (imageId: number, type: 'featured' | 'profile_featured') => {
    try {
      // TODO: API call to update featured status
      setPortfolioImages(prev => prev.map(img => {
        if (img.id === imageId) {
          if (type === 'featured') {
            return { ...img, is_featured: !img.is_featured };
          } else {
            // Only one image can be profile featured at a time
            return { ...img, is_profile_featured: !img.is_profile_featured };
          }
        } else if (type === 'profile_featured') {
          // Remove profile featured from other images
          return { ...img, is_profile_featured: false };
        }
        return img;
      }));
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };

  const deleteImage = async (imageId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;
    
    try {
      // TODO: API call to delete image
      setPortfolioImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const filteredImages = portfolioImages.filter(img => 
    selectedCategory === 'all' || img.category === selectedCategory
  );

  const stats = {
    total_images: portfolioImages.length,
    total_views: portfolioImages.reduce((sum, img) => sum + img.views, 0),
    total_likes: portfolioImages.reduce((sum, img) => sum + img.likes, 0),
    featured_image: portfolioImages.find(img => img.is_profile_featured)
  };

  return (
    <MarketplaceLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Responsive Header */}
        <div className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-full liquid-gradient flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  Mi Portafolio
                </h1>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span>Activo y visible</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
              Muestra tu trabajo y atrae más clientes con un portafolio profesional. Cada imagen cuenta tu historia de éxito.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:flex-shrink-0">
            <Button
              onClick={() => setShowPrivacySettings(true)}
              variant="outline"
              className="glass border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 h-10 sm:h-12"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Configuración de Privacidad</span>
              <span className="sm:hidden">Privacidad</span>
            </Button>
            
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg hover:scale-105 transform">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Agregar Imagen</span>
                  <span className="sm:hidden">Agregar</span>
                </Button>
              </DialogTrigger>
            <DialogContent className="glass border-white/20 w-[95vw] max-w-2xl max-h-[85vh] md:max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center text-lg sm:text-xl text-white">
                  <UploadCloud className="mr-2 h-5 w-5" />
                  Agregar Nueva Imagen al Portafolio
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-gray-300">
                  Sube una imagen de tu trabajo con descripción detallada. Arrastra y suelta archivos o haz clic para seleccionar.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 sm:space-y-6">
                {/* Upload Progress */}
                {uploadProgress.status !== 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 p-4 glass-light rounded-lg border border-white/10"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        {uploadProgress.status === 'uploading' && <Upload className="h-4 w-4 animate-pulse text-blue-400" />}
                        {uploadProgress.status === 'processing' && <Settings className="h-4 w-4 animate-spin text-yellow-400" />}
                        {uploadProgress.status === 'success' && <CheckCircle className="h-4 w-4 text-green-400" />}
                        {uploadProgress.status === 'error' && <AlertCircle className="h-4 w-4 text-red-400" />}
                        <span className={`font-medium ${
                          uploadProgress.status === 'error' ? 'text-red-400' :
                          uploadProgress.status === 'success' ? 'text-green-400' :
                          'text-muted-foreground'
                        }`}>
                          {uploadProgress.status === 'uploading' ? 'Subiendo imagen...' :
                           uploadProgress.status === 'processing' ? 'Procesando imagen...' :
                           uploadProgress.status === 'success' ? 'Imagen subida exitosamente' :
                           'Error en la subida'}
                        </span>
                      </div>
                      <span className="text-muted-foreground font-mono text-xs">{uploadProgress.progress.toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={uploadProgress.progress} 
                      className={`h-2 ${uploadProgress.status === 'error' ? 'bg-red-500/20' : 'bg-white/10'}`}
                    />
                    {uploadProgress.error && (
                      <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                        <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-red-400 text-sm leading-relaxed">{uploadProgress.error}</p>
                      </div>
                    )}
                  </motion.div>
                )}
                {/* Enhanced File Upload with Drag & Drop */}
                <div className="space-y-3">
                  <Label htmlFor="image-upload" className="text-sm font-medium text-white">Imagen *</Label>
                  <div
                    ref={dropZoneRef}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`relative transition-all duration-300 ${
                      dragState.isDragging ? 'scale-105' : 'scale-100'
                    }`}
                  >
                    {newImage.file ? (
                      <div className="relative group">
                        <div className="relative overflow-hidden rounded-lg">
                          <img
                            src={newImage.file ? URL.createObjectURL(newImage.file) : ''}
                            alt="Preview"
                            className={`w-full object-cover rounded-lg transition-all duration-300 cursor-pointer hover:opacity-90 ${
                              isFullscreen ? 'h-96' : 'h-48 sm:h-64'
                            }`}
                            onClick={() => newImage.file && setPreviewImage(URL.createObjectURL(newImage.file))}
                          />
                          
                          {/* Image overlay controls */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-3">
                            <Button
                              onClick={() => newImage.file && setPreviewImage(URL.createObjectURL(newImage.file))}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 text-white hover:bg-white/30"
                              title="Vista previa"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              onClick={() => setIsFullscreen(!isFullscreen)}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 text-white hover:bg-white/30"
                              title={isFullscreen ? "Minimizar" : "Maximizar"}
                            >
                              {isFullscreen ? <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" /> : <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Remove button */}
                        <Button
                          onClick={() => {
                            setNewImage(prev => ({ ...prev, file: null }));
                            setUploadProgress({ progress: 0, status: 'idle' });
                          }}
                          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500/90 text-white hover:bg-red-500 shadow-lg z-10"
                          title="Eliminar imagen"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        
                        {/* File info */}
                        <div className="mt-2 text-xs text-muted-foreground flex justify-between items-center">
                          <span>{newImage.file.name}</span>
                          <span>{(newImage.file.size / (1024 * 1024)).toFixed(1)} MB</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center cursor-pointer transition-all duration-300 min-h-[120px] sm:min-h-[150px] flex flex-col justify-center ${
                          dragState.isDragging
                            ? 'border-primary bg-primary/10 scale-105'
                            : 'border-white/20 hover:border-primary/50 hover:bg-white/5'
                        }`}
                      >
                        <motion.div
                          animate={dragState.isDragging ? { y: [0, -5, 0] } : {}}
                          transition={{ repeat: dragState.isDragging ? Infinity : 0, duration: 1 }}
                        >
                          <UploadCloud className={`h-8 sm:h-10 lg:h-12 w-8 sm:w-10 lg:w-12 mx-auto mb-3 sm:mb-4 transition-colors duration-300 ${
                            dragState.isDragging ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        </motion.div>
                        
                        <div className="space-y-1 sm:space-y-2">
                          <p className={`text-sm sm:text-base font-medium transition-colors duration-300 ${
                            dragState.isDragging ? 'text-primary' : 'text-gray-300'
                          }`}>
                            {dragState.isDragging ? '¡Suelta la imagen aquí!' : 'Arrastra una imagen o haz clic para seleccionar'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Máximo 5MB • JPG, PNG, WebP • Mínimo 300x300px
                          </p>
                          <p className="text-xs text-gray-500 hidden sm:block">
                            Recomendado: imágenes de alta calidad para mejor presentación
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleInputChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-white">Título del Trabajo *</Label>
                    <Input
                      id="title"
                      value={newImage.title}
                      onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ej: Instalación de Sistema de Calefacción"
                      className="fixia-input mt-2 h-10 sm:h-12"
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {newImage.title.length}/100 caracteres
                    </p>
                  </div>

                  {/* Category and Tags Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                      <Label htmlFor="category" className="text-sm font-medium text-white">Categoría *</Label>
                      <Select
                        value={newImage.category}
                        onValueChange={(value) => setNewImage(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="fixia-select mt-2 h-10 sm:h-12">
                          <SelectValue placeholder="Selecciona categoría" className="text-gray-500" />
                        </SelectTrigger>
                        <SelectContent className="">
                          {categories.length > 0 ? categories.map(category => (
                            <SelectItem key={category.id} value={category.name}>
                              <span className="flex items-center space-x-2">
                                <span>{category.icon}</span>
                                <span>{category.name}</span>
                              </span>
                            </SelectItem>
                          )) : (
                            <SelectItem value="general">General</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tags */}
                    <div>
                      <Label htmlFor="tags" className="text-sm font-medium text-white">Etiquetas</Label>
                      <Input
                        id="tags"
                        value={newImage.tags}
                        onChange={(e) => setNewImage(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="plomería, urgente, garantía"
                        className="fixia-input mt-2 h-10 sm:h-12"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Separa las etiquetas con comas
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-white">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newImage.description}
                      onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe el trabajo realizado, materiales utilizados, tiempo de ejecución, desafíos superados..."
                      className="fixia-textarea min-h-[80px] sm:min-h-[100px] mt-2 resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1 flex justify-between">
                      <span>Ayuda a los clientes a entender tu trabajo</span>
                      <span>{newImage.description.length}/500</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-white/10 mt-4">
                  <Button
                    onClick={() => {
                      setShowUploadDialog(false);
                      setNewImage({ title: '', description: '', category: '', tags: '', file: null });
                      setUploadProgress({ progress: 0, status: 'idle' });
                    }}
                    variant="outline"
                    className="glass border-white/20 w-full sm:w-auto h-10 sm:h-12"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUploadImage}
                    disabled={uploadProgress.status === 'uploading' || uploadProgress.status === 'processing' || !newImage.file || !newImage.title || !newImage.category}
                    className="liquid-gradient hover:opacity-90 w-full sm:w-auto h-10 sm:h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-2">
                      {uploadProgress.status === 'uploading' && <Upload className="h-4 w-4 animate-pulse" />}
                      {uploadProgress.status === 'processing' && <Settings className="h-4 w-4 animate-spin" />}
                      {uploadProgress.status === 'idle' && <Plus className="h-4 w-4" />}
                      <span>
                        {uploadProgress.status === 'uploading' ? 'Subiendo...' :
                         uploadProgress.status === 'processing' ? 'Procesando...' :
                         'Subir Imagen'}
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
            </DialogContent>
            
            {/* Image Preview Modal */}
            {previewImage && (
              <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="glass border-white/20 w-[95vw] max-w-3xl max-h-[85vh] md:max-h-[90vh] p-2">
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full max-h-[80vh] object-contain rounded-lg"
                    />
                    <Button
                      onClick={() => setPreviewImage(null)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </Dialog>
        </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
          >
            <Card className="glass border-white/10 hover:glass-medium transition-all duration-300 cursor-pointer">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Imágenes</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.total_images}</p>
                  </div>
                  <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 self-end sm:self-center" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="glass border-white/10 hover:glass-medium transition-all duration-300 cursor-pointer">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Vistas</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.total_views}</p>
                  </div>
                  <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 self-end sm:self-center" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="glass border-white/10 hover:glass-medium transition-all duration-300 cursor-pointer">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Me Gusta</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.total_likes}</p>
                  </div>
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 self-end sm:self-center" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="glass border-white/10 hover:glass-medium transition-all duration-300 cursor-pointer">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Destacada</p>
                    <p className="text-xs sm:text-sm font-medium text-primary">
                      {stats.featured_image ? 'Configurada' : 'Sin configurar'}
                    </p>
                  </div>
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 self-end sm:self-center" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            onClick={() => setSelectedCategory('all')}
            className={`${selectedCategory === 'all' ? 'liquid-gradient text-white' : 'glass-medium hover:glass-strong'} transition-all duration-300 whitespace-nowrap h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4`}
          >
            <span className="flex items-center space-x-1">
              <span>Todas</span>
              <Badge className="ml-1 bg-white/20 text-white text-xs px-1.5 py-0.5 h-4">
                {portfolioImages.length}
              </Badge>
            </span>
          </Button>
          {categories.map(category => {
            const count = portfolioImages.filter(img => img.category === category.name).length;
            return (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`${selectedCategory === category.name ? 'liquid-gradient text-white' : 'glass-medium hover:glass-strong'} transition-all duration-300 whitespace-nowrap h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4`}
              >
                <span className="flex items-center space-x-1 sm:space-x-2">
                  <span className="text-sm sm:text-base">{category.icon}</span>
                  <span className="hidden sm:inline">{category.name}</span>
                  <span className="sm:hidden">{category.name.substring(0, 4)}</span>
                  <Badge className={`ml-1 text-xs px-1.5 py-0.5 h-4 ${selectedCategory === category.name ? 'bg-white/20 text-white' : 'bg-primary/20 text-primary'}`}>
                    {count}
                  </Badge>
                </span>
              </Button>
            );
          })}
        </div>

        {/* Enhanced Portfolio Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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

      {/* Enhanced Privacy Settings Dialog */}
      <Dialog open={showPrivacySettings} onOpenChange={setShowPrivacySettings}>
        <DialogContent className="glass border-white/20 w-[95vw] max-w-2xl max-h-[85vh] md:max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b border-white/10">
            <DialogTitle className="flex items-center text-lg sm:text-xl text-white">
              <Shield className="mr-3 h-5 w-5 text-primary" />
              Configuración de Privacidad del Portafolio
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-300 mt-2">
              Controla quién puede ver tu portafolio y cómo aparece en la plataforma. Estos ajustes afectan cómo los clientes te encuentran.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <Tabs defaultValue="visibility" className="w-full">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 glass-medium mb-6 h-auto">
                <TabsTrigger value="visibility" className="flex items-center justify-center space-x-2 p-3 sm:p-2">
                  <Globe className="h-4 w-4" />
                  <span>Visibilidad</span>
                </TabsTrigger>
                <TabsTrigger value="protection" className="flex items-center justify-center space-x-2 p-3 sm:p-2">
                  <Shield className="h-4 w-4" />
                  <span>Protección</span>
                </TabsTrigger>
                <TabsTrigger value="display" className="flex items-center justify-center space-x-2 p-3 sm:p-2">
                  <Settings className="h-4 w-4" />
                  <span>Información</span>
                </TabsTrigger>
              </TabsList>

              {/* Visibility Tab */}
              <TabsContent value="visibility" className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                      <Globe className="mr-2 h-5 w-5 text-primary" />
                      Visibilidad Pública
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Controla quién puede encontrar y ver tu portafolio en línea.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Portfolio Public */}
                    <div className="p-4 glass-light rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Globe className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium mb-1 text-white">Portafolio público</p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              Tu portafolio es visible para todos los usuarios registrados y visitantes. Esto aumenta tus oportunidades de negocio.
                            </p>
                            {!privacySettings.portfolio_public && (
                              <div className="mt-2 p-2 bg-orange-500/20 border border-orange-500/30 rounded-md">
                                <p className="text-xs text-orange-400">
                                  ⚠️ Portafolio privado reduce significativamente tu visibilidad
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={privacySettings.portfolio_public}
                          onCheckedChange={(checked: boolean) => setPrivacySettings(prev => ({ ...prev, portfolio_public: checked }))}
                          className="ml-4 flex-shrink-0"
                        />
                      </div>
                    </div>

                    {/* Marketplace Visible */}
                    <div className="p-4 glass-light rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Eye className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium mb-1 text-white">Visible en marketplace</p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              Aparece en los resultados de búsqueda del marketplace. Los clientes pueden encontrarte fácilmente.
                            </p>
                            {privacySettings.marketplace_visible && (
                              <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-md">
                                <p className="text-xs text-green-400">
                                  ✓ Recomendado para máxima visibilidad comercial
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={privacySettings.marketplace_visible}
                          onCheckedChange={(checked: boolean) => setPrivacySettings(prev => ({ ...prev, marketplace_visible: checked }))}
                          className="ml-4 flex-shrink-0"
                          disabled={!privacySettings.portfolio_public}
                        />
                      </div>
                    </div>

                    {/* Searchable */}
                    <div className="p-4 glass-light rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Search className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium mb-1 text-white">Indexable por buscadores</p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              Google y otros buscadores pueden encontrar tu portafolio, aumentando tu alcance orgánico.
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={privacySettings.portfolio_searchable}
                          onCheckedChange={(checked: boolean) => setPrivacySettings(prev => ({ ...prev, portfolio_searchable: checked }))}
                          className="ml-4 flex-shrink-0"
                          disabled={!privacySettings.portfolio_public}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Protection Tab */}
              <TabsContent value="protection" className="space-y-6">

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                      <Shield className="mr-2 h-5 w-5 text-primary" />
                      Protección de Contenido
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Protege tu trabajo intelectual y controla cómo se utilizan tus imágenes.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Watermark */}
                    <div className="p-4 glass-light rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Shield className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium mb-1 text-white">Marca de agua en imágenes</p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              Aplica automáticamente tu marca de agua con el logo de Fixia y tu nombre para proteger tu trabajo.
                            </p>
                            {privacySettings.watermark_images && (
                              <div className="mt-2 p-2 bg-blue-500/20 border border-blue-500/30 rounded-md">
                                <p className="text-xs text-blue-400">
                                  🔒 Protección activa - Tus imágenes estarán marcadas
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={privacySettings.watermark_images}
                          onCheckedChange={(checked: boolean) => setPrivacySettings(prev => ({ ...prev, watermark_images: checked }))}
                          className="ml-4 flex-shrink-0"
                        />
                      </div>
                    </div>

                    {/* Download Permission */}
                    <div className="p-4 glass-light rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Download className="h-5 w-5 text-red-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium mb-1 text-white">Permitir descarga de imágenes</p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              Los usuarios pueden descargar versiones de alta resolución de tus imágenes para referencia.
                            </p>
                            {!privacySettings.allow_image_downloads && (
                              <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-md">
                                <p className="text-xs text-green-400">
                                  ✓ Recomendado - Mantiene control sobre tus imágenes
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={privacySettings.allow_image_downloads}
                          onCheckedChange={(checked: boolean) => setPrivacySettings(prev => ({ ...prev, allow_image_downloads: checked }))}
                          className="ml-4 flex-shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Display Tab */}
              <TabsContent value="display" className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                      <Settings className="mr-2 h-5 w-5 text-primary" />
                      Información Mostrada
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Decide qué información personal y comercial mostrar en tu portafolio.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Contact Info */}
                    <div className="p-4 glass-light rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <MessageSquare className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium mb-1 text-white">Mostrar información de contacto</p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              Email y teléfono visibles en tu portafolio para que los clientes te contacten directamente.
                            </p>
                            {privacySettings.show_contact_info && (
                              <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-md">
                                <p className="text-xs text-green-400">
                                  ✓ Facilita el contacto directo con clientes
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={privacySettings.show_contact_info}
                          onCheckedChange={(checked: boolean) => setPrivacySettings(prev => ({ ...prev, show_contact_info: checked }))}
                          className="ml-4 flex-shrink-0"
                        />
                      </div>
                    </div>

                    {/* Project Values */}
                    <div className="p-4 glass-light rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <EyeOff className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium mb-1 text-white">Mostrar valores de proyectos</p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              Los precios de tus trabajos completados serán visibles públicamente como referencia.
                            </p>
                            {!privacySettings.show_project_values && (
                              <div className="mt-2 p-2 bg-blue-500/20 border border-blue-500/30 rounded-md">
                                <p className="text-xs text-blue-400">
                                  💼 Precios privados - Negocia directamente con clientes
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={privacySettings.show_project_values}
                          onCheckedChange={(checked: boolean) => setPrivacySettings(prev => ({ ...prev, show_project_values: checked }))}
                          className="ml-4 flex-shrink-0"
                        />
                      </div>
                    </div>

                    {/* Reviews */}
                    <div className="p-4 glass-light rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Star className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium mb-1 text-white">Permitir reseñas en portafolio</p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              Los clientes pueden dejar reseñas y calificaciones en trabajos específicos de tu portafolio.
                            </p>
                            {privacySettings.allow_reviews_on_portfolio && (
                              <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-md">
                                <p className="text-xs text-green-400">
                                  ⭐ Las reseñas aumentan tu credibilidad y confianza
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={privacySettings.allow_reviews_on_portfolio}
                          onCheckedChange={(checked: boolean) => setPrivacySettings(prev => ({ ...prev, allow_reviews_on_portfolio: checked }))}
                          className="ml-4 flex-shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-white/10 mt-4">
            <div className="text-xs text-gray-300 text-center sm:text-left">
              📊 Los ajustes de privacidad afectan cómo te encuentran los clientes
            </div>
            <div className="flex space-x-3 w-full sm:w-auto">
              <Button
                onClick={() => setShowPrivacySettings(false)}
                variant="outline"
                className="glass border-white/20 flex-1 sm:flex-none h-10 sm:h-12"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  // TODO: Save privacy settings to API with loading state
                  setShowPrivacySettings(false);
                }}
                className="liquid-gradient hover:opacity-90 flex-1 sm:flex-none h-10 sm:h-12"
              >
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Guardar Configuración</span>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MarketplaceLayout>
  );
}