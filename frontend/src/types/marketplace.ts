/**
 * Marketplace Types - TypeScript interfaces for marketplace system
 * 
 * Complete type definitions for:
 * - Professional marketplace browsing and discovery
 * - Search and filtering functionality
 * - Featured professionals system
 * - Trending content and recommendations
 */

import { PaginationInfo } from './index';

export interface MarketplaceProfessional {
  id: number;
  first_name: string;
  last_name: string;
  professional_title?: string;
  bio?: string;
  featured_image_url?: string;
  location?: string;
  locality?: string;
  average_rating?: number;
  review_count: number;
  is_verified: boolean;
  availability_status: 'available' | 'busy' | 'unavailable';
  created_at: string;
  
  // Portfolio metrics
  portfolio_images_count: number;
  portfolio_views_total: number;
  portfolio_likes_total: number;
  ranking_score?: number;
  response_time_avg?: number;
  conversion_rate?: number;
  
  // Service information
  active_services_count: number;
  min_price?: number;
  max_price?: number;
  
  // Featured status
  is_featured: boolean;
  feature_type?: string;
  
  // Categories
  categories: Array<{
    id: number;
    name: string;
    icon?: string;
  }>;
  
  // Portfolio preview
  portfolio_preview?: Array<{
    id: number;
    thumbnail_path?: string;
    title: string;
    views_count?: number;
    likes_count?: number;
  }>;
  
  // Premium status
  is_premium: boolean;
  premium_plan?: string;
  
  // Location data
  distance_km?: number;
  
  // Favorite status (for authenticated users)
  is_favorited?: boolean;
}

export interface MarketplaceFilters {
  category_id?: number | 'all';
  location?: string | 'all';
  locality?: string | 'all';
  latitude?: number;
  longitude?: number;
  radius?: number;
  min_rating?: number;
  max_price?: number;
  min_price?: number;
  has_portfolio?: boolean;
  is_verified?: boolean;
  is_premium?: boolean;
  availability?: 'available' | 'busy' | 'all';
  search?: string;
  sort?: MarketplaceSortOption;
  page?: number;
  limit?: number;
}

export type MarketplaceSortOption = 
  | 'ranking' 
  | 'rating' 
  | 'price_low' 
  | 'price_high' 
  | 'newest' 
  | 'distance';

export interface MarketplaceFiltersApplied {
  category_id?: number | null;
  location?: string | null;
  locality?: string | null;
  has_location_filter: boolean;
  radius?: number | null;
  min_rating?: number;
  price_range?: {
    min_price?: number;
    max_price?: number;
  } | null;
  has_portfolio?: boolean;
  is_verified?: boolean;
  is_premium?: boolean;
  availability?: string;
  search?: string | null;
  sort: MarketplaceSortOption;
}

export interface MarketplaceBrowseResponse {
  success: boolean;
  professionals: MarketplaceProfessional[];
  pagination: PaginationInfo;
  filters_applied: MarketplaceFiltersApplied;
  cached?: boolean;
}

export interface FeaturedProfessional extends MarketplaceProfessional {
  feature_type: FeaturedType;
  feature_priority: number;
  impressions_count: number;
  clicks_count: number;
  conversions_count: number;
  cost?: number;
}

export type FeaturedType = 'homepage' | 'category' | 'location' | 'premium' | 'trending';

export interface FeaturedProfessionalsResponse {
  success: boolean;
  featured_professionals: FeaturedProfessional[];
  feature_type: string;
  total_count: number;
  cached?: boolean;
}

export interface TrendingPortfolioItem {
  id: number;
  title: string;
  description?: string;
  thumbnail_path?: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  professional_id: number;
  first_name: string;
  last_name: string;
  professional_title?: string;
  featured_image_url?: string;
  average_rating?: number;
  review_count: number;
  category_name?: string;
  category_icon?: string;
  trending_score: number;
  today_views: number;
  today_likes: number;
}

export interface TrendingPortfolioResponse {
  success: boolean;
  trending_portfolio: TrendingPortfolioItem[];
  time_period: string;
  total_count: number;
  cached?: boolean;
}

export interface ProfessionalDetail extends MarketplaceProfessional {
  last_active_at?: string;
  
  // Privacy settings
  show_portfolio_in_marketplace?: boolean;
  show_portfolio_before_after?: boolean;
  show_portfolio_project_values?: boolean;
  portfolio_visibility?: string;
  
  // Services
  services: Array<{
    id: number;
    title: string;
    description?: string;
    price: number;
    service_type?: string;
    duration?: string;
  }>;
  
  // Recent reviews
  recent_reviews: Array<{
    id: number;
    rating: number;
    comment?: string;
    created_at: string;
    client_name: string;
    client_avatar?: string;
    service_title?: string;
  }>;
}

export interface ProfessionalDetailResponse {
  success: boolean;
  professional: ProfessionalDetail;
  cached?: boolean;
}

// Search and Discovery Types
export interface MarketplaceSearchSuggestion {
  type: 'professional' | 'service' | 'category' | 'location';
  id: number;
  text: string;
  subtitle?: string;
  avatar?: string;
  icon?: string;
}

export interface MarketplaceSearchResult {
  professionals: MarketplaceProfessional[];
  total_results: number;
  suggestions: MarketplaceSearchSuggestion[];
  search_term: string;
  filters_applied: MarketplaceFiltersApplied;
}

// Location and Geographic Types
export interface LocationBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MarketplaceLocation {
  latitude: number;
  longitude: number;
  address?: string;
  locality?: string;
  region?: string;
  country?: string;
}

// Component Props Types
export interface MarketplaceProfessionalCardProps {
  professional: MarketplaceProfessional;
  onClick?: () => void;
  onFavorite?: () => void;
  onContact?: () => void;
  showDistance?: boolean;
  showPortfolioPreview?: boolean;
  className?: string;
}

export interface MarketplaceFiltersProps {
  filters: MarketplaceFilters;
  onFiltersChange: (filters: MarketplaceFilters) => void;
  onClearFilters: () => void;
  loading?: boolean;
  className?: string;
}

export interface MarketplaceSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  suggestions?: MarketplaceSearchSuggestion[];
  loading?: boolean;
  placeholder?: string;
  className?: string;
}

export interface MarketplaceSortProps {
  value: MarketplaceSortOption;
  onChange: (sort: MarketplaceSortOption) => void;
  options?: Array<{
    value: MarketplaceSortOption;
    label: string;
  }>;
  className?: string;
}

export interface MarketplacePaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  className?: string;
}

export interface FeaturedProfessionalsCarouselProps {
  professionals: FeaturedProfessional[];
  onProfessionalClick: (professional: FeaturedProfessional) => void;
  onFeaturedClick?: (placementId: number, clickSource: string) => void;
  loading?: boolean;
  className?: string;
}

export interface TrendingPortfolioGridProps {
  items: TrendingPortfolioItem[];
  onItemClick: (item: TrendingPortfolioItem) => void;
  loading?: boolean;
  className?: string;
}

// Hook Types
export interface UseMarketplaceBrowseOptions {
  filters?: MarketplaceFilters;
  enabled?: boolean;
  refetchInterval?: number;
}

export interface UseMarketplaceBrowseReturn {
  data?: MarketplaceBrowseResponse;
  isLoading: boolean;
  error?: string;
  refetch: () => void;
  updateFilters: (filters: Partial<MarketplaceFilters>) => void;
}

export interface UseFeaturedProfessionalsOptions {
  featureType?: FeaturedType | 'all';
  categoryId?: number;
  location?: string;
  limit?: number;
  enabled?: boolean;
}

export interface UseFeaturedProfessionalsReturn {
  data?: FeaturedProfessionalsResponse;
  isLoading: boolean;
  error?: string;
  refetch: () => void;
  trackClick: (placementId: number, clickSource: string) => Promise<void>;
}

export interface UseTrendingPortfolioOptions {
  categoryId?: number;
  location?: string;
  timePeriod?: string;
  limit?: number;
  enabled?: boolean;
}

export interface UseTrendingPortfolioReturn {
  data?: TrendingPortfolioResponse;
  isLoading: boolean;
  error?: string;
  refetch: () => void;
}

export interface UseProfessionalDetailOptions {
  professionalId: number;
  enabled?: boolean;
}

export interface UseProfessionalDetailReturn {
  data?: ProfessionalDetailResponse;
  isLoading: boolean;
  error?: string;
  refetch: () => void;
}

export interface UseMarketplaceSearchOptions {
  query: string;
  filters?: MarketplaceFilters;
  debounceMs?: number;
  enabled?: boolean;
}

export interface UseMarketplaceSearchReturn {
  data?: MarketplaceSearchResult;
  suggestions?: MarketplaceSearchSuggestion[];
  isLoading: boolean;
  error?: string;
  search: (query: string) => void;
}

// Analytics and Tracking Types
export interface MarketplaceViewTracking {
  professional_id: number;
  view_source: 'search' | 'browse' | 'featured' | 'trending' | 'direct';
  search_query?: string;
  filters_applied?: Partial<MarketplaceFilters>;
  position_in_results?: number;
}

export interface FeaturedClickTracking {
  placement_id: number;
  click_source: 'homepage' | 'search' | 'category' | 'direct';
  session_id?: string;
  referrer_url?: string;
}

// Error Types
export interface MarketplaceError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
}

// API Response Types
export type MarketplaceApiResponse<T> = T | MarketplaceError;

// Form Types
export interface MarketplaceSearchFormData {
  query: string;
  category_id: number | '';
  location: string;
  min_price: string;
  max_price: string;
  min_rating: number;
  has_portfolio: boolean;
  is_verified: boolean;
  is_premium: boolean;
  availability: 'all' | 'available' | 'busy';
  sort: MarketplaceSortOption;
  use_location: boolean;
  radius: number;
}

// Constants
export const MARKETPLACE_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
  DEFAULT_RADIUS: 10,
  MAX_RADIUS: 100,
  MIN_SEARCH_LENGTH: 2,
  DEBOUNCE_MS: 300,
  CACHE_TTL: 120000, // 2 minutes
  FEATURED_LIMIT: 10,
  TRENDING_LIMIT: 20,
} as const;

export const MARKETPLACE_SORT_OPTIONS: Array<{
  value: MarketplaceSortOption;
  label: string;
}> = [
  { value: 'ranking', label: 'Mejor Puntuados' },
  { value: 'rating', label: 'Mejor Calificados' },
  { value: 'price_low', label: 'Precio Menor' },
  { value: 'price_high', label: 'Precio Mayor' },
  { value: 'newest', label: 'Más Recientes' },
  { value: 'distance', label: 'Más Cercanos' },
] as const;

export const AVAILABILITY_OPTIONS: Array<{
  value: 'all' | 'available' | 'busy';
  label: string;
}> = [
  { value: 'all', label: 'Todos' },
  { value: 'available', label: 'Disponibles' },
  { value: 'busy', label: 'Ocupados' },
] as const;