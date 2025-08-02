/**
 * Favorites Types - TypeScript interfaces for wishlist system
 * 
 * Complete type definitions for:
 * - Explorer favorites and wishlist management
 * - Categorization and priority system
 * - Bulk operations and list organization
 * - Different favorite types (professionals, services, portfolio)
 */

import { PaginationInfo } from './index';

export interface ExplorerFavorite {
  id: number;
  explorer_id: number;
  favorite_type: FavoriteType;
  favorited_user_id?: number;
  favorited_service_id?: number;
  favorited_image_id?: number;
  category: FavoriteCategory;
  priority: number; // 1-5 scale
  private_notes?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data based on favorite_type
  professional_info?: FavoriteProfessionalInfo;
  service_info?: FavoriteServiceInfo;
  portfolio_image_info?: FavoritePortfolioImageInfo;
}

export type FavoriteType = 'professional' | 'service' | 'portfolio_image';

export type FavoriteCategory = 'general' | 'urgent' | 'future' | 'inspiration';

export interface FavoriteProfessionalInfo {
  id: number;
  first_name: string;
  last_name: string;
  professional_title?: string;
  featured_image_url?: string;
  location?: string;
  locality?: string;
  average_rating?: number;
  review_count: number;
  is_verified: boolean;
  availability_status: 'available' | 'busy' | 'unavailable';
}

export interface FavoriteServiceInfo {
  id: number;
  title: string;
  description?: string;
  price: number;
  service_type?: string;
  duration?: string;
  professional_name: string;
  professional_avatar?: string;
}

export interface FavoritePortfolioImageInfo {
  id: number;
  title: string;
  description?: string;
  thumbnail_path?: string;
  views_count: number;
  likes_count: number;
  professional_name: string;
  professional_avatar?: string;
  category_name?: string;
}

export interface AddToFavoritesData {
  favorite_type: FavoriteType;
  favorited_user_id?: number;
  favorited_service_id?: number;
  favorited_image_id?: number;
  category?: FavoriteCategory;
  priority?: number;
  private_notes?: string;
}

export interface AddToFavoritesResponse {
  success: boolean;
  message: string;
  favorite: ExplorerFavorite;
}

export interface FavoritesFilters {
  favorite_type?: FavoriteType | 'all';
  category?: FavoriteCategory | 'all';
  sort?: FavoritesSortOption;
  page?: number;
  limit?: number;
}

export type FavoritesSortOption = 'priority' | 'newest' | 'oldest' | 'alphabetical';

export interface FavoritesSummary {
  favorite_type: FavoriteType;
  category: FavoriteCategory;
  count: number;
}

export interface FavoritesResponse {
  success: boolean;
  favorites: ExplorerFavorite[];
  summary: FavoritesSummary[];
  pagination: PaginationInfo;
  filters_applied: {
    favorite_type: FavoriteType | 'all';
    category: FavoriteCategory | 'all';
    sort: FavoritesSortOption;
  };
  cached?: boolean;
}

export interface UpdateFavoriteData {
  category?: FavoriteCategory;
  priority?: number;
  private_notes?: string;
}

export interface UpdateFavoriteResponse {
  success: boolean;
  message: string;
  favorite: ExplorerFavorite;
}

export interface BulkFavoritesOperation {
  action: 'delete' | 'update_category' | 'update_priority';
  favorite_ids: number[];
  category?: FavoriteCategory;
  priority?: number;
}

export interface BulkFavoritesResponse {
  success: boolean;
  message: string;
  affected_count: number;
}

// Component Props Types
export interface FavoriteCardProps {
  favorite: ExplorerFavorite;
  onEdit?: (favorite: ExplorerFavorite) => void;
  onDelete?: (favoriteId: number) => void;
  onView?: (favorite: ExplorerFavorite) => void;
  onContact?: (favorite: ExplorerFavorite) => void;
  showControls?: boolean;
  className?: string;
}

export interface FavoritesListProps {
  favorites: ExplorerFavorite[];
  loading?: boolean;
  onEdit?: (favorite: ExplorerFavorite) => void;
  onDelete?: (favoriteId: number) => void;
  onView?: (favorite: ExplorerFavorite) => void;
  onBulkAction?: (action: BulkFavoritesOperation) => void;
  selectedFavorites?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
  showBulkActions?: boolean;
  className?: string;
}

export interface FavoritesFiltersProps {
  filters: FavoritesFilters;
  onFiltersChange: (filters: FavoritesFilters) => void;
  summary: FavoritesSummary[];
  loading?: boolean;
  className?: string;
}

export interface AddToFavoritesButtonProps {
  favoriteType: FavoriteType;
  targetId: number;
  isFavorited?: boolean;
  onToggle?: (isFavorited: boolean) => void;
  className?: string;
  children?: React.ReactNode;
}

export interface FavoritesCategoryBadgeProps {
  category: FavoriteCategory;
  count?: number;
  onClick?: () => void;
  className?: string;
}

export interface FavoritesPriorityIndicatorProps {
  priority: number;
  editable?: boolean;
  onChange?: (priority: number) => void;
  className?: string;
}

export interface FavoritesNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorite: ExplorerFavorite;
  onSave: (notes: string) => void;
  loading?: boolean;
}

export interface FavoritesBulkActionsProps {
  selectedFavorites: number[];
  onAction: (action: BulkFavoritesOperation) => void;
  onClearSelection: () => void;
  loading?: boolean;
  className?: string;
}

// Hook Types
export interface UseFavoritesOptions {
  filters?: FavoritesFilters;
  enabled?: boolean;
  refetchInterval?: number;
}

export interface UseFavoritesReturn {
  data?: FavoritesResponse;
  isLoading: boolean;
  error?: string;
  refetch: () => void;
  updateFilters: (filters: Partial<FavoritesFilters>) => void;
}

export interface UseAddToFavoritesReturn {
  addToFavorites: (data: AddToFavoritesData) => Promise<AddToFavoritesResponse>;
  removeFromFavorites: (favoriteId: number) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export interface UseUpdateFavoriteReturn {
  updateFavorite: (favoriteId: number, data: UpdateFavoriteData) => Promise<UpdateFavoriteResponse>;
  isLoading: boolean;
  error?: string;
}

export interface UseBulkFavoritesReturn {
  bulkUpdate: (operation: BulkFavoritesOperation) => Promise<BulkFavoritesResponse>;
  isLoading: boolean;
  error?: string;
}

export interface UseFavoriteStatusOptions {
  favoriteType: FavoriteType;
  targetId: number;
  enabled?: boolean;
}

export interface UseFavoriteStatusReturn {
  isFavorited: boolean;
  favoriteId?: number;
  isLoading: boolean;
  toggle: () => Promise<void>;
  error?: string;
}

// Form Types
export interface AddToFavoritesFormData {
  category: FavoriteCategory;
  priority: number;
  private_notes: string;
}

export interface AddToFavoritesFormErrors {
  category?: string;
  priority?: string;
  private_notes?: string;
  general?: string;
}

export interface EditFavoriteFormData {
  category: FavoriteCategory;
  priority: number;
  private_notes: string;
}

export interface EditFavoriteFormErrors {
  category?: string;
  priority?: string;
  private_notes?: string;
  general?: string;
}

export interface BulkFavoritesFormData {
  action: 'delete' | 'update_category' | 'update_priority';
  category?: FavoriteCategory;
  priority?: number;
}

// Utility Types
export interface FavoriteTypeInfo {
  type: FavoriteType;
  label: string;
  icon: string;
  description: string;
}

export interface FavoriteCategoryInfo {
  category: FavoriteCategory;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export interface FavoritePriorityInfo {
  priority: number;
  label: string;
  color: string;
  description: string;
}

// Error Types
export interface FavoritesError {
  success: false;
  error: string;
  code?: string;
  field?: string;
}

// API Response Types
export type FavoritesApiResponse<T> = T | FavoritesError;

// Constants
export const FAVORITES_CONSTANTS = {
  MAX_NOTES_LENGTH: 1000,
  MIN_PRIORITY: 1,
  MAX_PRIORITY: 5,
  DEFAULT_PRIORITY: 3,
  DEFAULT_CATEGORY: 'general' as FavoriteCategory,
  PAGINATION_LIMIT: 20,
  CACHE_TTL: 300000, // 5 minutes
} as const;

export const FAVORITE_TYPES: FavoriteTypeInfo[] = [
  {
    type: 'professional',
    label: 'Profesionales',
    icon: 'User',
    description: 'Profesionales que te interesan'
  },
  {
    type: 'service',
    label: 'Servicios',
    icon: 'Briefcase',
    description: 'Servicios específicos'
  },
  {
    type: 'portfolio_image',
    label: 'Portafolio',
    icon: 'Image',
    description: 'Trabajos e inspiración'
  }
] as const;

export const FAVORITE_CATEGORIES: FavoriteCategoryInfo[] = [
  {
    category: 'urgent',
    label: 'Urgente',
    icon: 'AlertTriangle',
    color: 'red',
    description: 'Necesito contactar pronto'
  },
  {
    category: 'future',
    label: 'Futuro',
    icon: 'Calendar',
    color: 'blue',
    description: 'Para más adelante'
  },
  {
    category: 'inspiration',
    label: 'Inspiración',
    icon: 'Lightbulb',
    color: 'yellow',
    description: 'Ideas y referencias'
  },
  {
    category: 'general',
    label: 'General',
    icon: 'Heart',
    color: 'gray',
    description: 'Favoritos generales'
  }
] as const;

export const FAVORITE_PRIORITIES: FavoritePriorityInfo[] = [
  {
    priority: 5,
    label: 'Muy Alta',
    color: 'red',
    description: 'Máxima prioridad'
  },
  {
    priority: 4,
    label: 'Alta',
    color: 'orange',
    description: 'Prioridad alta'
  },
  {
    priority: 3,
    label: 'Media',
    color: 'yellow',
    description: 'Prioridad media'
  },
  {
    priority: 2,
    label: 'Baja',
    color: 'blue',
    description: 'Prioridad baja'
  },
  {
    priority: 1,
    label: 'Muy Baja',
    color: 'gray',
    description: 'Mínima prioridad'
  }
] as const;

export const FAVORITES_SORT_OPTIONS: Array<{
  value: FavoritesSortOption;
  label: string;
}> = [
  { value: 'priority', label: 'Por Prioridad' },
  { value: 'newest', label: 'Más Recientes' },
  { value: 'oldest', label: 'Más Antiguos' },
  { value: 'alphabetical', label: 'Alfabético' },
] as const;