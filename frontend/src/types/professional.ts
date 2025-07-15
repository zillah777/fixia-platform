// Professional-specific types extending the base User interface
import { User } from './index';

// Badge-related types
export interface Badge {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  category: 'verification' | 'experience' | 'performance' | 'milestone' | 'special';
  criteria: {
    type: string;
    value?: any;
    [key: string]: any;
  };
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserBadge extends Badge {
  earned_at: string;
  is_visible: boolean;
  progress_data?: any;
}

export interface BadgeProgress extends Badge {
  current_progress: number;
  target_progress: number;
  progress_data?: any;
  last_updated: string;
  is_earned: boolean;
  progress_percentage: number;
}

export interface ProfessionalInfo {
  profession?: string;
  license_number?: string;
  specialization?: string;
  years_experience?: number;
}

export interface ExtendedUser extends User {
  birth_date?: string;
  city?: string;
  dni?: string;
  dni_procedure_number?: string;
  about_me?: string;
  has_mobility?: boolean;
  verification_status: 'pending' | 'in_review' | 'verified' | 'rejected';
  verification_score: number;
  subscription_type: 'free' | 'basic' | 'premium';
  subscription_expires_at?: string;
  total_rating_points: number;
  total_ratings_count: number;
  profile_completion_percentage: number;
  created_services_count: number;
  completed_bookings_count: number;
  professional_info?: ProfessionalInfo;
}

// Verification Types
export interface UserVerification {
  id: number;
  user_id: number;
  dni_front_image?: string;
  dni_back_image?: string;
  selfie_with_dni_image?: string;
  verification_notes?: string;
  verified_by?: number;
  verified_at?: string;
  rejection_reason?: string;
  verification_attempts: number;
  created_at: string;
  updated_at: string;
}

export interface VerificationDocuments {
  dni_front: File;
  dni_back: File;
  selfie_with_dni: File;
}

// Portfolio Types
export interface PortfolioItem {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  image_url?: string;
  work_date?: string;
  category?: string;
  sort_order: number;
  created_at: string;
}

export interface CreatePortfolioData {
  title: string;
  description?: string;
  work_date?: string;
  category?: string;
  image?: File;
}

// References Types
export interface UserReference {
  id: number;
  user_id: number;
  reference_name: string;
  reference_phone: string;
  reference_email?: string;
  relationship?: string;
  notes?: string;
  is_verified: boolean;
  verified_at?: string;
  created_at: string;
}

export interface CreateReferenceData {
  reference_name: string;
  reference_phone: string;
  reference_email?: string;
  relationship?: string;
  notes?: string;
}

// Availability Types
export interface UserAvailability {
  id: number;
  user_id: number;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  start_time: string;
  end_time: string;
  is_available: boolean;
  break_start_time?: string;
  break_end_time?: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  break_start_time?: string;
  break_end_time?: string;
}

// Work Location Types
export interface WorkLocation {
  id: number;
  user_id: number;
  city: string;
  province: string;
  latitude?: number;
  longitude?: number;
  travel_radius_km: number;
  additional_cost_per_km: number;
  created_at: string;
}

export interface CreateWorkLocationData {
  city: string;
  province: string;
  latitude?: number;
  longitude?: number;
  travel_radius_km?: number;
  additional_cost_per_km?: number;
}

// Subscription Types
export interface Subscription {
  id: number;
  name: string;
  type: 'free' | 'basic' | 'premium';
  price_monthly: number;
  max_services?: number;
  featured_listings: boolean;
  priority_support: boolean;
  advanced_analytics: boolean;
  custom_portfolio: boolean;
  unlimited_photos: boolean;
  verified_badge: boolean;
  description?: string;
  features?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription extends Subscription {
  subscription_expires_at?: string;
  is_active: boolean;
  days_remaining?: number;
}

export interface SubscriptionPayment {
  id: number;
  user_id: number;
  subscription_id: number;
  amount: number;
  payment_method: string;
  external_payment_id?: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  billing_period_start: string;
  billing_period_end: string;
  created_at: string;
  updated_at: string;
  subscription_name?: string;
  subscription_type?: string;
}

export interface SubscriptionBenefits {
  subscription_type: string;
  is_active: boolean;
  expires_at?: string;
  features: Record<string, any>;
  limits: {
    max_services?: number;
    current_services: number;
    can_create_service: boolean;
  };
  benefits: {
    featured_listings: boolean;
    priority_support: boolean;
    advanced_analytics: boolean;
    custom_portfolio: boolean;
    unlimited_photos: boolean;
    verified_badge: boolean;
  };
}

// Report Types
export type ReportType = 'no_show' | 'poor_service' | 'inappropriate_behavior' | 'fake_profile' | 'pricing_issue' | 'other';

export interface UserReport {
  id: number;
  reporter_id: number;
  reported_user_id: number;
  booking_id?: number;
  report_type: ReportType;
  description: string;
  evidence_urls?: string[];
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  admin_notes?: string;
  resolved_by?: number;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  reported_first_name?: string;
  reported_last_name?: string;
  reported_photo?: string;
  reporter_first_name?: string;
  reporter_last_name?: string;
}

export interface CreateReportData {
  reported_user_id: number;
  booking_id?: number;
  report_type: ReportType;
  description: string;
  evidence_urls?: string[];
}

export interface ReportStats {
  reports_made: {
    total_reports: number;
    resolved_reports: number;
    pending_reports: number;
  };
  reports_against: {
    total_reports: number;
    resolved_reports: number;
    pending_reports: number;
  };
  verification_score: number;
  reputation_level: string;
}

// Ranking Types
export interface RankingTier {
  name: string;
  color: string;
  icon: string;
}

export interface RankingFactors {
  current_score: number;
  reviews: {
    average_rating: number;
    total_reviews: number;
    impact: string;
  };
  subscription: {
    type: string;
    is_active: boolean;
    impact: string;
  };
  verification: {
    status: string;
    is_verified: boolean;
    impact: string;
  };
  bookings: {
    completed: number;
    total: number;
    completion_rate: string;
    impact: string;
  };
  profile: {
    completion_percentage: number;
    impact: string;
  };
  experience: {
    years: number;
    impact: string;
  };
  recommendations: string[];
}

export interface UserRanking {
  current_score: number;
  overall_position: number;
  total_professionals: number;
  percentile: number;
  category_rankings: Array<{
    category: string;
    category_position: number;
  }>;
  factors: RankingFactors;
  tier: RankingTier;
  next_tier_requirements?: {
    next_tier: string;
    points_needed: number;
    suggestions: string[];
  };
}

export interface TopProfessional {
  id: number;
  first_name: string;
  last_name: string;
  profile_photo_url?: string;
  verification_score: number;
  verification_status: string;
  subscription_type: string;
  city?: string;
  is_verified: boolean;
  average_rating: number;
  total_reviews: number;
  completed_bookings: number;
  profession?: string;
  specialization?: string;
  ranking_position: number;
  is_premium: boolean;
  is_featured: boolean;
  ranking_score: number;
  is_top_rated: boolean;
  is_rising_star: boolean;
  trust_score: number;
}

export interface TrendingProfessional extends TopProfessional {
  recent_reviews: number;
  trending_position: number;
  momentum_score: number;
  is_new: boolean;
  growth_indicator: string;
}

// Profile Completion Types
export interface ProfileCompletion {
  percentage: number;
  completed_steps: string[];
  pending_steps: string[];
  total_steps: number;
}

// Notification Preferences Types
export interface NotificationPreferences {
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  booking_requests: boolean;
  new_reviews: boolean;
  payment_updates: boolean;
  marketing_emails: boolean;
}

// Form Data Types
export interface CompleteProfileData {
  birth_date?: string;
  city?: string;
  dni?: string;
  dni_procedure_number?: string;
  about_me?: string;
  has_mobility?: boolean;
  profession?: string;
  license_number?: string;
  specialization?: string;
  years_experience?: number;
}

// Import base types
import { ApiResponse, PaginatedResponse } from './index';

// API Response Types for Professional Features
export interface ProfessionalApiResponse<T = any> extends ApiResponse<T> {}

export interface PaginatedProfessionalResponse<T> extends PaginatedResponse<T> {}