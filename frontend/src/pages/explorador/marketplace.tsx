import { useState, useEffect } from 'react';
import { Search, Filter, Heart, MapPin, Star, Clock, Eye, Grid3X3, List, ChevronDown, BookmarkPlus, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import MarketplaceLayout from '@/components/layouts/MarketplaceLayout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { FixiaServiceImage, FixiaAvatar } from '@/components/ui';

interface Professional {
  id: number;
  first_name: string;
  last_name: string;
  profile_image?: string;
  locality?: string;
  specialty: string;
  description: string;
  rating: number;
  review_count: number;
  starting_price: number;
  price_type: 'hour' | 'project';
  featured_image?: string;
  portfolio_images: PortfolioImage[];
  availability: 'available' | 'busy' | 'offline';
  response_time: string;
  verified: boolean;
  instant_booking: boolean;
  service_count: number;
  experience_years: number;
  // Enhanced marketplace features
  is_featured: boolean;
  is_premium: boolean;
  total_portfolio_views: number;
  total_portfolio_likes: number;
  privacy_settings: {
    profile_visible_in_marketplace: boolean;
    portfolio_public: boolean;
    contact_info_visible: boolean;
  };
  recent_activity?: string;
  completion_rate: number;
  badges: string[];
}

interface PortfolioImage {
  id: number;
  image_url: string;
  title: string;
  description?: string;
  category: string;
  work_type: 'before_after' | 'process' | 'final_result' | 'tools' | 'materials';
  is_featured: boolean;
  is_profile_featured: boolean;
  project_date?: string;
  project_value?: number;
  views_count: number;
  likes_count: number;
  tags?: string[];
}

interface Category {
  id: number;
  name: string;
  icon: string;
  service_count: number;
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Wishlist dialog states
  const [showWishlistDialog, setShowWishlistDialog] = useState(false);
  const [selectedProfessionalForWishlist, setSelectedProfessionalForWishlist] = useState<number | null>(null);
  const [wishlistForm, setWishlistForm] = useState({
    category: 'future',
    notes: '',
    priority: 3
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filters
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [instantBookingFilter, setInstantBookingFilter] = useState<boolean>(false);
  const [featuredFilter, setFeaturedFilter] = useState<boolean>(false);
  const [premiumFilter, setPremiumFilter] = useState<boolean>(false);
  const [portfolioFilter, setPortfolioFilter] = useState<string>('all'); // 'all', 'with_portfolio', 'featured_work'
  const [sortBy, setSortBy] = useState<string>('relevance'); // 'relevance', 'rating', 'price_low', 'price_high', 'newest', 'popular'

  useEffect(() => {
    loadMarketplaceData();
    loadUserFavorites();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      
      // Mock data removed for production launch
      /* const mockCategories: Category[] = [
        { id: 1, name: 'Plomería', icon: '🔧', service_count: 45 },
        { id: 2, name: 'Electricidad', icon: '⚡', service_count: 32 },
        { id: 3, name: 'Construcción', icon: '🏗️', service_count: 28 },
        { id: 4, name: 'Jardinería', icon: '🌱', service_count: 21 },
        { id: 5, name: 'Limpieza', icon: '🧽', service_count: 38 },
        { id: 6, name: 'Tecnología', icon: '💻', service_count: 15 }
      ];

      const mockProfessionals: Professional[] = [
        {
          id: 1,
          first_name: 'María',
          last_name: 'González',
          profile_image: '/images/professionals/maria.jpg',
          locality: 'Comodoro Rivadavia',
          specialty: 'Plomería Residencial',
          description: 'Especialista en reparaciones de plomería residencial con más de 8 años de experiencia. Trabajo garantizado y materiales de primera calidad.',
          rating: 4.9,
          review_count: 127,
          starting_price: 2500,
          price_type: 'hour',
          featured_image: '/images/services/plumbing-1.jpg',
          portfolio_images: [
            {
              id: 1,
              image_url: '/images/portfolio/plumbing-1.jpg',
              title: 'Instalación Sistema Calefacción Central',
              description: 'Instalación completa en vivienda familiar 120m²',
              category: 'Plomería',
              work_type: 'final_result',
              is_featured: true,
              is_profile_featured: true,
              project_date: '2024-01-15',
              project_value: 85000,
              views_count: 342,
              likes_count: 28,
              tags: ['calefacción', 'instalación', 'residencial']
            },
            {
              id: 2,
              image_url: '/images/portfolio/plumbing-2.jpg',
              title: 'Antes y Después: Baño Completo',
              description: 'Renovación completa de baño principal',
              category: 'Plomería',
              work_type: 'before_after',
              is_featured: false,
              is_profile_featured: false,
              project_date: '2024-01-10',
              project_value: 45000,
              views_count: 198,
              likes_count: 15,
              tags: ['renovación', 'baño', 'antes-después']
            }
          ],
          availability: 'available',
          response_time: '2 horas',
          verified: true,
          instant_booking: true,
          service_count: 8,
          experience_years: 8,
          is_featured: true,
          is_premium: true,
          total_portfolio_views: 540,
          total_portfolio_likes: 43,
          privacy_settings: {
            profile_visible_in_marketplace: true,
            portfolio_public: true,
            contact_info_visible: true
          },
          recent_activity: 'Respondió hace 30 minutos',
          completion_rate: 98,
          badges: ['Verificado', 'Pro', 'Respuesta Rápida']
        },
        {
          id: 2,
          first_name: 'Carlos',
          last_name: 'Rodríguez',
          profile_image: '/images/professionals/carlos.jpg',
          locality: 'Puerto Madryn',
          specialty: 'Electricidad Domiciliaria',
          description: 'Técnico electricista matriculado especializado en instalaciones domiciliarias y sistemas de seguridad. Disponible para emergencias.',
          rating: 4.8,
          review_count: 89,
          starting_price: 3000,
          price_type: 'hour',
          featured_image: '/images/services/electrical-1.jpg',
          portfolio_images: [
            {
              id: 3,
              image_url: '/images/portfolio/electrical-1.jpg',
              title: 'Instalación Panel Eléctrico Industrial',
              description: 'Panel eléctrico trifásico para taller mecánico',
              category: 'Electricidad',
              work_type: 'final_result',
              is_featured: true,
              is_profile_featured: true,
              project_date: '2024-01-08',
              project_value: 120000,
              views_count: 287,
              likes_count: 19,
              tags: ['industrial', 'trifásico', 'seguridad']
            },
            {
              id: 4,
              image_url: '/images/portfolio/electrical-2.jpg',
              title: 'Sistema Domótica Completo',
              description: 'Automatización completa de hogar inteligente',
              category: 'Electricidad',
              work_type: 'process',
              is_featured: false,
              is_profile_featured: false,
              project_date: '2024-01-05',
              project_value: 75000,
              views_count: 156,
              likes_count: 12,
              tags: ['domótica', 'smart-home', 'automatización']
            }
          ],
          availability: 'available',
          response_time: '1 hora',
          verified: true,
          instant_booking: false,
          service_count: 6,
          experience_years: 12,
          is_featured: false,
          is_premium: false,
          total_portfolio_views: 443,
          total_portfolio_likes: 31,
          privacy_settings: {
            profile_visible_in_marketplace: true,
            portfolio_public: true,
            contact_info_visible: true
          },
          recent_activity: 'Subió 2 nuevas fotos hace 1 día',
          completion_rate: 95,
          badges: ['Verificado', 'Especialista']
        }
      ]; */

      // For production launch - show empty states
      setCategories([]);
      setProfessionals([]);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserFavorites = async () => {
    try {
      // TODO: Load user favorites from API
      // const response = await fetch('/api/explorer/favorites');
      // const data = await response.json();
      // setFavorites(new Set(data.favorite_ids));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (professionalId: number, showDialog = false) => {
    try {
      if (favorites.has(professionalId)) {
        // Remove from favorites
        const newFavorites = new Set(favorites);
        newFavorites.delete(professionalId);
        setFavorites(newFavorites);
        // TODO: API call to remove favorite
        // await fetch(`/api/explorer/favorites/${professionalId}`, { method: 'DELETE' });
      } else if (showDialog) {
        // Show wishlist dialog for categorization
        setSelectedProfessionalForWishlist(professionalId);
        setWishlistForm({ category: 'future', notes: '', priority: 3 });
        setShowWishlistDialog(true);
      } else {
        // Quick add to favorites
        const newFavorites = new Set(favorites);
        newFavorites.add(professionalId);
        setFavorites(newFavorites);
        // TODO: API call to add favorite with default category
        // await fetch(`/api/explorer/favorites/${professionalId}`, { 
        //   method: 'POST',
        //   body: JSON.stringify({ category: 'future', priority: 3 })
        // });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const addToWishlist = async () => {
    try {
      if (!selectedProfessionalForWishlist) return;
      
      const newFavorites = new Set(favorites);
      newFavorites.add(selectedProfessionalForWishlist);
      setFavorites(newFavorites);
      
      // TODO: API call to add to wishlist with details
      // await fetch(`/api/explorer/favorites/${selectedProfessionalForWishlist}`, {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     favorite_type: 'professional',
      //     wishlist_category: wishlistForm.category,
      //     notes: wishlistForm.notes,
      //     priority: wishlistForm.priority
      //   })
      // });
      
      setShowWishlistDialog(false);
      setSelectedProfessionalForWishlist(null);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const filteredProfessionals = professionals.filter(prof => {
    const matchesSearch = searchQuery === '' || 
      `${prof.first_name} ${prof.last_name} ${prof.specialty} ${prof.description}`.toLowerCase()
        .includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || prof.specialty.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesPrice = prof.starting_price >= priceRange[0] && prof.starting_price <= priceRange[1];
    const matchesLocality = selectedLocality === 'all' || prof.locality === selectedLocality;
    const matchesAvailability = availabilityFilter === 'all' || prof.availability === availabilityFilter;
    
    // Advanced filters
    const matchesRating = ratingFilter === 0 || prof.rating >= ratingFilter;
    const matchesVerification = verificationFilter === 'all' || 
      (verificationFilter === 'verified' && prof.verified) ||
      (verificationFilter === 'unverified' && !prof.verified);
    const matchesInstantBooking = !instantBookingFilter || prof.instant_booking;
    const matchesFeatured = !featuredFilter || prof.is_featured;
    const matchesPremium = !premiumFilter || prof.is_premium;
    const matchesPortfolio = portfolioFilter === 'all' ||
      (portfolioFilter === 'with_portfolio' && prof.portfolio_images.length > 0) ||
      (portfolioFilter === 'featured_work' && prof.portfolio_images.some(img => img.is_featured));

    return matchesSearch && matchesCategory && matchesPrice && matchesLocality && 
           matchesAvailability && matchesRating && matchesVerification && 
           matchesInstantBooking && matchesFeatured && matchesPremium && matchesPortfolio;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price_low':
        return a.starting_price - b.starting_price;
      case 'price_high':
        return b.starting_price - a.starting_price;
      case 'newest':
        return new Date(b.recent_activity || '').getTime() - new Date(a.recent_activity || '').getTime();
      case 'popular':
        return b.total_portfolio_views - a.total_portfolio_views;
      case 'relevance':
      default:
        // Featured and premium first, then by rating
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        if (a.is_premium && !b.is_premium) return -1;
        if (!a.is_premium && b.is_premium) return 1;
        return b.rating - a.rating;
    }
  });

  const getAvailabilityBadge = (availability: string) => {
    const badges = {
      available: { text: 'Disponible', color: 'bg-green-500/20 text-green-400' },
      busy: { text: 'Ocupado', color: 'bg-yellow-500/20 text-yellow-400' },
      offline: { text: 'Desconectado', color: 'bg-gray-500/20 text-gray-400' }
    };
    return badges[availability as keyof typeof badges] || badges.available;
  };

  const ProfessionalCard = ({ professional }: { professional: Professional }) => {
    const isFavorite = favorites.has(professional.id);
    const availabilityBadge = getAvailabilityBadge(professional.availability);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="group"
      >
        <Card className="glass border-white/10 hover:glass-medium transition-all duration-300 overflow-hidden">
          {/* Featured Service Image */}
          <FixiaServiceImage
            src={professional.featured_image || '/images/placeholder-service.jpg'}
            alt={`Servicio de ${professional.specialty} - ${professional.first_name} ${professional.last_name}`}
            variant="card"
            isFeatured={professional.is_featured}
            isFavorite={isFavorite}
            rating={professional.rating}
            portfolioCount={professional.portfolio_images.length}
            isAvailable={professional.availability === 'available'}
            availabilityText={availabilityBadge.text}
            onFavoriteClick={() => toggleFavorite(professional.id)}
            onBookmarkClick={() => toggleFavorite(professional.id, true)}
            priority={false}
            quality={85}
            containerClassName="aspect-[4/3]"
          >
            {/* Premium Badge */}
            {professional.is_premium && (
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-gradient-to-r from-purple-400/20 to-pink-400/20 text-purple-300 text-xs border border-purple-400/30">
                  Premium
                </Badge>
              </div>
            )}
          </FixiaServiceImage>

          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg leading-tight">
                  {professional.first_name} {professional.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {professional.specialty}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {professional.badges.map((badge, index) => (
                  <Badge 
                    key={index}
                    className={`text-xs border-0 ${
                      badge === 'Verificado' ? 'bg-blue-500/20 text-blue-400' :
                      badge === 'Pro' ? 'bg-purple-500/20 text-purple-400' :
                      badge === 'Respuesta Rápida' ? 'bg-green-500/20 text-green-400' :
                      badge === 'Especialista' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Location & Rating */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {professional.locality}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs font-medium">
                  {professional.rating}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({professional.review_count})
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {professional.description}
            </p>

            {/* Stats */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{professional.experience_years} años exp.</span>
                <span>{professional.service_count} servicios</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{professional.response_time}</span>
                </div>
              </div>
              
              {/* Portfolio Analytics */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{professional.total_portfolio_views} vistas</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3 w-3" />
                    <span>{professional.total_portfolio_likes} likes</span>
                  </div>
                </div>
                <span className="text-green-400">{professional.completion_rate}% completado</span>
              </div>

              {/* Recent Activity */}
              {professional.recent_activity && (
                <div className="text-xs text-primary bg-primary/10 rounded px-2 py-1">
                  {professional.recent_activity}
                </div>
              )}
            </div>

            {/* Price & Actions */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-primary">
                  ${professional.starting_price.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  /{professional.price_type === 'hour' ? 'hora' : 'proyecto'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {professional.instant_booking && (
                  <Badge className="bg-green-500/20 text-green-400 text-xs border-0">
                    Reserva Instantánea
                  </Badge>
                )}
                
                {/* Ver Más Button */}
                <Link href={`/explorador/profesional/${professional.id}`}>
                  <Button className="glass-medium hover:glass-strong transition-all duration-300 text-xs px-3 py-1.5">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver más
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <MarketplaceLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-2">
            Marketplace de Servicios
          </h1>
          <p className="text-muted-foreground">
            Descubre profesionales verificados en Chubut. {filteredProfessionals.length} servicios disponibles.
          </p>
        </div>

        {/* Search and View Toggle */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar profesionales, servicios o ubicaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 glass border-white/20 focus:border-primary/50"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 glass-medium border-white/20">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="glass border-white/20">
                <SelectItem value="relevance">Relevancia</SelectItem>
                <SelectItem value="rating">Mejor calificado</SelectItem>
                <SelectItem value="price_low">Precio menor</SelectItem>
                <SelectItem value="price_high">Precio mayor</SelectItem>
                <SelectItem value="newest">Más reciente</SelectItem>
                <SelectItem value="popular">Más popular</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className={`glass-medium hover:glass-strong transition-all duration-300 ${
                showFilters ? 'ring-2 ring-primary/30' : ''
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`} />
            </Button>
            
            <div className="flex items-center bg-white/5 rounded-lg p-1">
              <Button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'}`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="glass border-white/10 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoría</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="glass border-white/20">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/20">
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.name.toLowerCase()}>
                            {category.icon} {category.name} ({category.service_count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Precio: ${priceRange[0]} - ${priceRange[1]}
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={10000}
                      min={0}
                      step={100}
                      className="mt-2"
                    />
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ubicación</label>
                    <Select value={selectedLocality} onValueChange={setSelectedLocality}>
                      <SelectTrigger className="glass border-white/20">
                        <SelectValue placeholder="Todas las ubicaciones" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/20">
                        <SelectItem value="all">Todas las ubicaciones</SelectItem>
                        <SelectItem value="Comodoro Rivadavia">Comodoro Rivadavia</SelectItem>
                        <SelectItem value="Puerto Madryn">Puerto Madryn</SelectItem>
                        <SelectItem value="Trelew">Trelew</SelectItem>
                        <SelectItem value="Rawson">Rawson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Availability Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Disponibilidad</label>
                    <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                      <SelectTrigger className="glass border-white/20">
                        <SelectValue placeholder="Cualquier disponibilidad" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/20">
                        <SelectItem value="all">Cualquier disponibilidad</SelectItem>
                        <SelectItem value="available">Disponible ahora</SelectItem>
                        <SelectItem value="busy">Ocupado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Calificación mínima: {ratingFilter > 0 ? `${ratingFilter}+ estrellas` : 'Cualquiera'}
                    </label>
                    <Slider
                      value={[ratingFilter]}
                      onValueChange={(value) => setRatingFilter(value[0])}
                      max={5}
                      min={0}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>

                  {/* Verification Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Verificación</label>
                    <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                      <SelectTrigger className="glass border-white/20">
                        <SelectValue placeholder="Cualquier estado" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/20">
                        <SelectItem value="all">Cualquier estado</SelectItem>
                        <SelectItem value="verified">Solo verificados</SelectItem>
                        <SelectItem value="unverified">No verificados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Portfolio Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Portafolio</label>
                    <Select value={portfolioFilter} onValueChange={setPortfolioFilter}>
                      <SelectTrigger className="glass border-white/20">
                        <SelectValue placeholder="Cualquier portafolio" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/20">
                        <SelectItem value="all">Cualquier portafolio</SelectItem>
                        <SelectItem value="with_portfolio">Con portafolio</SelectItem>
                        <SelectItem value="featured_work">Con trabajos destacados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Advanced Filter Toggles */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="instant-booking"
                      checked={instantBookingFilter}
                      onChange={(e) => setInstantBookingFilter(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                    />
                    <label htmlFor="instant-booking" className="text-sm text-muted-foreground">
                      Reserva instantánea
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={featuredFilter}
                      onChange={(e) => setFeaturedFilter(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                    />
                    <label htmlFor="featured" className="text-sm text-muted-foreground">
                      Solo destacados
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="premium"
                      checked={premiumFilter}
                      onChange={(e) => setPremiumFilter(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                    />
                    <label htmlFor="premium" className="text-sm text-muted-foreground">
                      Solo premium
                    </label>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setPriceRange([0, 10000]);
                        setSelectedLocality('all');
                        setAvailabilityFilter('all');
                        setRatingFilter(0);
                        setVerificationFilter('all');
                        setInstantBookingFilter(false);
                        setFeaturedFilter(false);
                        setPremiumFilter(false);
                        setPortfolioFilter('all');
                        setSortBy('relevance');
                      }}
                      variant="outline"
                      className="glass border-white/20 text-xs"
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="glass border-white/10 animate-pulse">
                <div className="aspect-[4/3] bg-white/10 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 bg-white/10 rounded mb-4"></div>
                  <div className="h-16 bg-white/10 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProfessionals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No se encontraron profesionales</h3>
            <p className="text-muted-foreground mb-4">
              Intenta ajustar los filtros o realizar una búsqueda diferente
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceRange([0, 10000]);
                setSelectedLocality('all');
                setAvailabilityFilter('all');
                setRatingFilter(0);
                setVerificationFilter('all');
                setInstantBookingFilter(false);
                setFeaturedFilter(false);
                setPremiumFilter(false);
                setPortfolioFilter('all');
                setSortBy('relevance');
              }}
              className="liquid-gradient hover:opacity-90 transition-all duration-300"
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            <AnimatePresence>
              {filteredProfessionals.map(professional => (
                <ProfessionalCard key={professional.id} professional={professional} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Wishlist Dialog */}
      <Dialog open={showWishlistDialog} onOpenChange={setShowWishlistDialog}>
        <DialogContent className="glass border-white/20">
          <DialogHeader>
            <DialogTitle>Agregar a Lista de Deseos</DialogTitle>
            <DialogDescription>
              Organiza este profesional en tu lista de deseos con categorías y notas personales
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Category Selection */}
            <div>
              <Label htmlFor="wishlist-category">Categoría</Label>
              <Select 
                value={wishlistForm.category} 
                onValueChange={(value) => setWishlistForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="glass border-white/20">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent className="glass border-white/20">
                  <SelectItem value="urgent">🔥 Urgente - Necesito ahora</SelectItem>
                  <SelectItem value="future">📅 Futuro - Para más adelante</SelectItem>
                  <SelectItem value="inspiration">💡 Inspiración - Ideas para proyectos</SelectItem>
                  <SelectItem value="comparison">⚖️ Comparación - Evaluando opciones</SelectItem>
                  <SelectItem value="backup">🛡️ Respaldo - Opción alternativa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Level */}
            <div>
              <Label htmlFor="priority">
                Prioridad: {wishlistForm.priority}/5 
                {wishlistForm.priority === 1 && ' (Muy baja)'}
                {wishlistForm.priority === 2 && ' (Baja)'}
                {wishlistForm.priority === 3 && ' (Media)'}
                {wishlistForm.priority === 4 && ' (Alta)'}
                {wishlistForm.priority === 5 && ' (Muy alta)'}
              </Label>
              <Slider
                value={[wishlistForm.priority]}
                onValueChange={(value) => setWishlistForm(prev => ({ ...prev, priority: value[0] }))}
                max={5}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Personal Notes */}
            <div>
              <Label htmlFor="notes">Notas Personales (Opcional)</Label>
              <Textarea
                id="notes"
                value={wishlistForm.notes}
                onChange={(e) => setWishlistForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ej: Me gusta su portafolio de baños, consultar sobre presupuesto para mi proyecto..."
                className="glass border-white/20 focus:border-primary/50 min-h-[80px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                onClick={() => setShowWishlistDialog(false)}
                variant="outline"
                className="glass border-white/20"
              >
                Cancelar
              </Button>
              <Button
                onClick={addToWishlist}
                className="liquid-gradient hover:opacity-90"
              >
                <BookmarkPlus className="mr-2 h-4 w-4" />
                Agregar a Lista
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MarketplaceLayout>
  );
}