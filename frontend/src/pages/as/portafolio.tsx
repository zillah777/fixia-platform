import { useState, useEffect, useRef } from 'react';
import { Upload, X, Star, Heart, Eye, Edit3, Trash2, Image as ImageIcon, Camera, Plus, Settings, Shield, Globe, EyeOff, Search, Download, MessageSquare } from 'lucide-react';
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

interface PortfolioImage {
  id: number;
  image_url: string;
  title: string;
  description: string;
  category: string;
  is_featured: boolean;
  is_profile_featured: boolean; // Para usar en marketplace
  upload_date: string;
  views: number;
  likes: number;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

export default function PortafolioPage() {
  const { user } = useAuth();
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('El archivo debe ser menor a 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten archivos de imagen');
        return;
      }

      setNewImage(prev => ({ ...prev, file }));
    }
  };

  const handleUploadImage = async () => {
    if (!newImage.file || !newImage.title || !newImage.category) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setUploading(true);
      
      // TODO: Upload to server
      // const formData = new FormData();
      // formData.append('image', newImage.file);
      // formData.append('title', newImage.title);
      // formData.append('description', newImage.description);
      // formData.append('category', newImage.category);
      
      // const response = await fetch('/api/portfolio/upload', {
      //   method: 'POST',
      //   body: formData
      // });

      // TODO: Implement real upload to API
      console.log('Portfolio upload would be processed here');
      // For production launch, disable mock data
      setShowUploadDialog(false);
      setNewImage({ title: '', description: '', category: '', file: null });
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

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
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-2">
              Mi Portafolio
            </h1>
            <p className="text-muted-foreground">
              Muestra tu trabajo y atrae más clientes con un portafolio profesional
            </p>
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
            <DialogContent className="glass border-white/20">
              <DialogHeader>
                <DialogTitle>Agregar Nueva Imagen al Portafolio</DialogTitle>
                <DialogDescription>
                  Sube una imagen de tu trabajo con descripción detallada
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
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
                          Máximo 5MB - JPG, PNG, WebP
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
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent className="glass border-white/20">
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
                    onClick={() => setShowUploadDialog(false)}
                    variant="outline"
                    className="glass border-white/20"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUploadImage}
                    disabled={uploading || !newImage.file || !newImage.title || !newImage.category}
                    className="liquid-gradient hover:opacity-90"
                  >
                    {uploading ? 'Subiendo...' : 'Subir Imagen'}
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
            {/* Public Visibility */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Visibilidad Pública</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 glass-light rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="font-medium">Portafolio público</p>
                      <p className="text-sm text-muted-foreground">Tu portafolio es visible para todos los usuarios</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.portfolio_public}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, portfolio_public: e.target.checked }))}
                    className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                  />
                </div>

                <div className="flex items-center justify-between p-3 glass-light rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="font-medium">Visible en marketplace</p>
                      <p className="text-sm text-muted-foreground">Aparece en búsquedas del marketplace</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.marketplace_visible}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, marketplace_visible: e.target.checked }))}
                    className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                  />
                </div>

                <div className="flex items-center justify-between p-3 glass-light rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Search className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="font-medium">Indexable por buscadores</p>
                      <p className="text-sm text-muted-foreground">Google y otros buscadores pueden encontrar tu portafolio</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.portfolio_searchable}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, portfolio_searchable: e.target.checked }))}
                    className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Content Protection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Protección de Contenido</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 glass-light rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-orange-400" />
                    <div>
                      <p className="font-medium">Marca de agua en imágenes</p>
                      <p className="text-sm text-muted-foreground">Protege tus imágenes con marca de agua automática</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.watermark_images}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, watermark_images: e.target.checked }))}
                    className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                  />
                </div>

                <div className="flex items-center justify-between p-3 glass-light rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Download className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="font-medium">Permitir descarga de imágenes</p>
                      <p className="text-sm text-muted-foreground">Los usuarios pueden descargar versiones de alta resolución</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.allow_image_downloads}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, allow_image_downloads: e.target.checked }))}
                    className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Information Display */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Mostrada</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 glass-light rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="font-medium">Mostrar información de contacto</p>
                      <p className="text-sm text-muted-foreground">Email y teléfono visibles en el portafolio</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.show_contact_info}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, show_contact_info: e.target.checked }))}
                    className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                  />
                </div>

                <div className="flex items-center justify-between p-3 glass-light rounded-lg">
                  <div className="flex items-center space-x-3">
                    <EyeOff className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="font-medium">Mostrar valores de proyectos</p>
                      <p className="text-sm text-muted-foreground">Los precios de trabajos son visibles públicamente</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.show_project_values}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, show_project_values: e.target.checked }))}
                    className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                  />
                </div>

                <div className="flex items-center justify-between p-3 glass-light rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="font-medium">Permitir reseñas en portafolio</p>
                      <p className="text-sm text-muted-foreground">Los clientes pueden dejar reseñas en trabajos específicos</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.allow_reviews_on_portfolio}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, allow_reviews_on_portfolio: e.target.checked }))}
                    className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-white/10">
              <Button
                onClick={() => setShowPrivacySettings(false)}
                variant="outline"
                className="glass border-white/20"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  // TODO: Save privacy settings to API
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
  );
}