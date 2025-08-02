/**
 * Analytics Types - TypeScript interfaces for analytics and tracking
 * 
 * Complete type definitions for:
 * - Portfolio and professional analytics
 * - Performance metrics and insights
 * - View and engagement tracking
 * - Business intelligence data
 */

export interface AnalyticsOverview {
  total_images: number;
  total_views: number;
  total_likes: number;
  engagement_rate: number;
  avg_views_per_image: number;
  featured_count: number;
  recent_uploads: number;
  performance_score: number;
}

export interface AnalyticsTrend {
  date: string;
  views: number;
  unique_viewers: number;
  images_viewed?: number;
}

export interface AnalyticsLikeTrend {
  date: string;
  likes: number;
  unique_likers: number;
  reaction_breakdown: Record<string, number>;
}

export interface AnalyticsSourceBreakdown {
  view_source: string;
  views: number;
  unique_viewers: number;
}

export interface AnalyticsTopPerforming {
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
  overview: AnalyticsOverview;
  trends: {
    views_growth: number;
    daily_views: AnalyticsTrend[];
    daily_likes: AnalyticsLikeTrend[];
    source_breakdown: AnalyticsSourceBreakdown[];
  };
  top_performing: AnalyticsTopPerforming[];
  marketplace_metrics?: MarketplaceMetrics;
  time_period: string;
  detailed?: {
    image_performance: AnalyticsTopPerforming[];
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

export interface AnalyticsTimeframe {
  label: string;
  value: string;
  days: number;
}

// View Tracking Types
export interface ViewTrackingData {
  view_source?: 'portfolio' | 'marketplace' | 'search' | 'direct' | 'trending';
  session_id?: string;
  referrer_url?: string;
  user_agent?: string;
}

export interface ViewTrackingResponse {
  success: boolean;
  message: string;
  view_id?: number;
  is_duplicate?: boolean;
}

// Like/Reaction Types
export interface LikeTrackingData {
  reaction_type?: 'like' | 'love' | 'wow' | 'helpful';
}

export interface LikeTrackingResponse {
  success: boolean;
  message: string;
  action: 'liked' | 'unliked' | 'updated';
  reaction_type?: string;
  likes_count: number;
}

// Featured Analytics Types
export interface FeaturedPlacementAnalytics {
  placement_info: {
    id: number;
    user_id: number;
    feature_type: string;
    feature_priority: number;
    cost: number;
    first_name: string;
    last_name: string;
    professional_title?: string;
  };
  performance_summary: {
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    total_cost: number;
    ctr: string;
    conversion_rate: string;
    cost_per_click: string;
    roi_percentage: string;
  };
  time_period_analytics: {
    daily_clicks: Array<{
      date: string;
      clicks: number;
      unique_clickers: number;
      source_breakdown: Record<string, number>;
    }>;
    period_performance: {
      total_clicks: number;
      unique_clickers: number;
      clicks_last_7_days: number;
      clicks_today: number;
      hourly_distribution: Record<string, number>;
    };
    conversions: {
      conversions: number;
      avg_booking_value?: number;
      total_revenue?: number;
    };
  };
  time_period: string;
}

// Component Props Types
export interface AnalyticsDashboardProps {
  professionalId: number;
  timePeriod?: string;
  includeDetailed?: boolean;
  className?: string;
}

export interface AnalyticsOverviewCardProps {
  overview: AnalyticsOverview;
  loading?: boolean;
  className?: string;
}

export interface AnalyticsChartProps {
  data: AnalyticsTrend[] | AnalyticsLikeTrend[];
  type: 'views' | 'likes';
  height?: number;
  className?: string;
}

export interface AnalyticsSourceChartProps {
  data: AnalyticsSourceBreakdown[];
  className?: string;
}

export interface AnalyticsTopPerformingProps {
  items: AnalyticsTopPerforming[];
  onItemClick?: (item: AnalyticsTopPerforming) => void;
  loading?: boolean;
  className?: string;
}

export interface AnalyticsTimeframeSelectorProps {
  value: string;
  onChange: (timeframe: string) => void;
  options?: AnalyticsTimeframe[];
  className?: string;
}

export interface AnalyticsMetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'percentage' | 'currency';
  icon?: string;
  loading?: boolean;
  className?: string;
}

export interface AnalyticsProgressBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
  showPercentage?: boolean;
  className?: string;
}

// Hook Types
export interface UseAnalyticsOptions {
  professionalId: number;
  timePeriod?: string;
  includeDetailed?: boolean;
  enabled?: boolean;
  refetchInterval?: number;
}

export interface UseAnalyticsReturn {
  data?: ProfessionalAnalytics;
  isLoading: boolean;
  error?: string;
  refetch: () => void;
  updateTimePeriod: (period: string) => void;
}

export interface UseImageAnalyticsOptions {
  imageId: number;
  enabled?: boolean;
}

export interface UseImageAnalyticsReturn {
  data?: PortfolioImageAnalytics;
  isLoading: boolean;
  error?: string;
  refetch: () => void;
}

export interface UseViewTrackingReturn {
  trackView: (imageId: number, data?: ViewTrackingData) => Promise<ViewTrackingResponse>;
  isTracking: boolean;
  error?: string;
}

export interface UseLikeTrackingReturn {
  toggleLike: (imageId: number, data?: LikeTrackingData) => Promise<LikeTrackingResponse>;
  isLoading: boolean;
  error?: string;
}

export interface UseFeaturedAnalyticsOptions {
  placementId: number;
  timePeriod?: string;
  enabled?: boolean;
}

export interface UseFeaturedAnalyticsReturn {
  data?: FeaturedPlacementAnalytics;
  isLoading: boolean;
  error?: string;
  refetch: () => void;
}

// Utility Types
export interface AnalyticsExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  dateRange: {
    start: string;
    end: string;
  };
  metrics: string[];
  includeCharts?: boolean;
}

export interface AnalyticsFilter {
  timeframe: string;
  source?: string;
  category?: number;
  comparison?: {
    enabled: boolean;
    period: string;
  };
}

export interface AnalyticsInsight {
  type: 'trend' | 'anomaly' | 'achievement' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  action_text?: string;
  action_url?: string;
}

// Error Types
export interface AnalyticsError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
}

// API Response Types
export type AnalyticsApiResponse<T> = T | AnalyticsError;

export interface AnalyticsResponse {
  success: boolean;
  analytics: ProfessionalAnalytics;
  cached?: boolean;
}

export interface ImageAnalyticsResponse {
  success: boolean;
  image_analytics: PortfolioImageAnalytics;
  cached?: boolean;
}

export interface FeaturedAnalyticsResponse {
  success: boolean;
  analytics: FeaturedPlacementAnalytics;
  cached?: boolean;
}

// Constants
export const ANALYTICS_CONSTANTS = {
  DEFAULT_TIME_PERIOD: '30',
  MAX_TIME_PERIOD: '365',
  CHART_COLORS: [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
  ],
  CACHE_TTL: 600000, // 10 minutes
  REAL_TIME_UPDATE_INTERVAL: 30000, // 30 seconds
} as const;

export const ANALYTICS_TIMEFRAMES: AnalyticsTimeframe[] = [
  { label: 'Últimos 7 días', value: '7', days: 7 },
  { label: 'Últimos 30 días', value: '30', days: 30 },
  { label: 'Últimos 90 días', value: '90', days: 90 },
  { label: 'Último año', value: '365', days: 365 },
] as const;

export const VIEW_SOURCES = [
  { value: 'portfolio', label: 'Portafolio' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'search', label: 'Búsqueda' },
  { value: 'direct', label: 'Directo' },
  { value: 'trending', label: 'Tendencias' },
] as const;

export const REACTION_TYPES = [
  { value: 'like', label: 'Me gusta', emoji: '👍' },
  { value: 'love', label: 'Me encanta', emoji: '❤️' },
  { value: 'wow', label: 'Increíble', emoji: '🤩' },
  { value: 'helpful', label: 'Útil', emoji: '💡' },
] as const;