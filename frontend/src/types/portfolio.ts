/**
 * Portfolio Types - TypeScript interfaces for portfolio system
 * 
 * Complete type definitions for:
 * - Portfolio images and metadata
 * - Upload and management operations
 * - Analytics and performance metrics
 * - Privacy and visibility controls
 */

export interface PortfolioImage {
  id: number;
  user_id: number;
  category_id?: number;
  title: string;
  description: string;
  alt_text?: string;
  original_filename: string;
  file_path: string;
  optimized_path?: string;
  thumbnail_path?: string;
  file_size: number;
  mime_type: string;
  image_width?: number;
  image_height?: number;
  tags: string[];
  project_duration?: string;
  project_value?: number;
  project_location?: string;
  views_count: number;
  likes_count: number;
  is_featured: boolean;
  is_profile_featured: boolean;
  is_marketplace_visible: boolean;
  is_profile_visible: boolean;
  moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderation_notes?: string;
  created_at: string;
  updated_at: string;
  last_viewed_at?: string;
  
  // Joined data from API responses
  category_name?: string;
  category_icon?: string;
  professional_name?: string;
  professional_avatar?: string;
  is_liked_by_user?: boolean;
}

export interface PortfolioStats {
  total_images: number;
  total_views: number;
  total_likes: number;
  featured_count: number;
  recent_uploads: number;
  viewed_images?: number;
  liked_images?: number;
  avg_views_per_image?: number;
}

export interface PortfolioUploadData {
  images: File[];
  title: string;
  description: string;
  alt_text?: string;
  category_id?: number;
  tags?: string[];
  project_duration?: string;
  project_value?: number;
  project_location?: string;
  is_featured?: boolean;
  is_marketplace_visible?: boolean;
  is_profile_visible?: boolean;
}

export interface PortfolioUploadResponse {
  success: boolean;
  message: string;
  images: PortfolioImage[];
  uploaded_count: number;
  failed_count: number;
}

export interface PortfolioUpdateData {
  title?: string;
  description?: string;
  alt_text?: string;
  tags?: string[];
  category_id?: number;
  project_duration?: string;
  project_value?: number;
  project_location?: string;
  is_featured?: boolean;
  is_marketplace_visible?: boolean;
  is_profile_visible?: boolean;
}

export interface PortfolioFilters {
  category_id?: number | 'all';
  page?: number;
  limit?: number;
  include_private?: boolean;
  sort?: 'featured_first' | 'most_viewed' | 'most_liked' | 'newest' | 'oldest';
}

export interface PortfolioResponse {
  success: boolean;
  images: PortfolioImage[];
  stats: PortfolioStats;
  pagination: PaginationInfo;
  cached?: boolean;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

// Analytics Types
export interface PortfolioViewTracking {
  view_source?: 'portfolio' | 'marketplace' | 'search' | 'direct' | 'trending';
  session_id?: string;
  referrer_url?: string;
  user_agent?: string;
}

export interface PortfolioViewResponse {
  success: boolean;
  message: string;
  view_id?: number;
  is_duplicate?: boolean;
}

export interface PortfolioLikeData {
  reaction_type?: 'like' | 'love' | 'wow' | 'helpful';
}

export interface PortfolioLikeResponse {
  success: boolean;
  message: string;
  action: 'liked' | 'unliked' | 'updated';
  reaction_type?: string;
  likes_count: number;
}

export interface PortfolioImageAnalytics {
  id: number;
  title: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  last_viewed_at?: string;
  view_sources?: Record<string, number>;
  reaction_breakdown?: Record<string, number>;
  daily_view_trends?: Array<{
    date: string;
    views: number;
  }>;
}

export interface PortfolioAnalyticsOverview {
  total_images: number;
  total_views: number;
  total_likes: number;
  engagement_rate: number;
  avg_views_per_image: number;
  featured_count: number;
  recent_uploads: number;
  performance_score: number;
}

export interface PortfolioAnalyticsTrends {
  views_growth: number;
  daily_views: Array<{
    date: string;
    views: number;
    unique_viewers: number;
    images_viewed: number;
  }>;
  daily_likes: Array<{
    date: string;
    likes: number;
    unique_likers: number;
    reaction_breakdown: Record<string, number>;
  }>;
  source_breakdown: Array<{
    view_source: string;
    views: number;
    unique_viewers: number;
  }>;
}

export interface PortfolioTopPerforming {
  id: number;
  title: string;
  thumbnail_path?: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  engagement_score: number;
  category_name?: string;
}

export interface ProfessionalAnalytics {
  overview: PortfolioAnalyticsOverview;
  trends: PortfolioAnalyticsTrends;
  top_performing: PortfolioTopPerforming[];
  marketplace_metrics?: MarketplaceMetrics;
  time_period: string;
  detailed?: {
    image_performance: PortfolioTopPerforming[];
    viewer_demographics: any[];
    conversion_funnel: Record<string, any>;
  };
}

export interface MarketplaceMetrics {
  user_id: number;
  portfolio_images_count: number;
  portfolio_views_total: number;
  portfolio_likes_total: number;
  ranking_score?: number;
  response_time_avg?: number;
  conversion_rate?: number;
  last_portfolio_update?: string;
  last_portfolio_view?: string;
  last_portfolio_like?: string;
}

// Privacy and Settings Types
export interface PortfolioPrivacySettings {
  show_portfolio_in_marketplace: boolean;
  show_portfolio_before_after: boolean;
  show_portfolio_project_values: boolean;
  show_portfolio_client_names: boolean;
  allow_portfolio_downloads: boolean;
  portfolio_visibility: 'public' | 'clients_only' | 'private';
  require_contact_before_portfolio: boolean;
}

// Error Types
export interface PortfolioError {
  success: false;
  error: string;
  field?: string;
  code?: string;
}

// API Response Types
export type PortfolioApiResponse<T> = T | PortfolioError;

// Hook Types for React
export interface UsePortfolioOptions {
  userId: number;
  filters?: PortfolioFilters;
  enabled?: boolean;
  refetchInterval?: number;
}

export interface UsePortfolioReturn {
  data?: PortfolioResponse;
  isLoading: boolean;
  error?: string;
  refetch: () => void;
}

export interface UsePortfolioUploadReturn {
  upload: (data: PortfolioUploadData) => Promise<PortfolioUploadResponse>;
  isUploading: boolean;
  progress?: number;
  error?: string;
}

export interface UsePortfolioAnalyticsReturn {
  data?: ProfessionalAnalytics;
  isLoading: boolean;
  error?: string;
  refetch: () => void;
}

// Form Types
export interface PortfolioFormData {
  title: string;
  description: string;
  alt_text: string;
  category_id: number | '';
  tags: string[];
  project_duration: string;
  project_value: string;
  project_location: string;
  is_featured: boolean;
  is_marketplace_visible: boolean;
  is_profile_visible: boolean;
}

export interface PortfolioFormErrors {
  title?: string;
  description?: string;
  alt_text?: string;
  category_id?: string;
  tags?: string;
  project_value?: string;
  files?: string;
  general?: string;
}

// Component Props Types
export interface PortfolioGridProps {
  images: PortfolioImage[];
  loading?: boolean;
  onImageClick?: (image: PortfolioImage) => void;
  onLike?: (imageId: number, reactionType?: string) => void;
  onEdit?: (image: PortfolioImage) => void;
  onDelete?: (imageId: number) => void;
  showControls?: boolean;
  className?: string;
}

export interface PortfolioImageCardProps {
  image: PortfolioImage;
  onClick?: () => void;
  onLike?: (reactionType?: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showControls?: boolean;
  className?: string;
}

export interface PortfolioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: PortfolioUploadData) => Promise<void>;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
}

export interface PortfolioStatsCardProps {
  stats: PortfolioStats;
  loading?: boolean;
  className?: string;
}

export interface PortfolioAnalyticsDashboardProps {
  professionalId: number;
  timePeriod?: string;
  className?: string;
}

// Utility Types
export type PortfolioSortOption = 'featured_first' | 'most_viewed' | 'most_liked' | 'newest' | 'oldest';
export type PortfolioReactionType = 'like' | 'love' | 'wow' | 'helpful';
export type PortfolioViewSource = 'portfolio' | 'marketplace' | 'search' | 'direct' | 'trending';
export type PortfolioModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type PortfolioVisibility = 'public' | 'clients_only' | 'private';

// Constants
export const PORTFOLIO_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_UPLOAD: 10,
  ACCEPTED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_ALT_TEXT_LENGTH: 200,
  MAX_TAGS: 20,
  MAX_TAG_LENGTH: 50,
  PAGINATION_LIMIT: 20,
  CACHE_TTL: 300000, // 5 minutes
} as const;