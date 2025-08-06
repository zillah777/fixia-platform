// Database-aligned types for Fixia platform
// These types reflect the exact structure of PostgreSQL tables

// User Types - Based on users table
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone?: string;
  user_type: 'client' | 'provider' | 'admin';
  profile_image?: string;
  date_of_birth?: string;
  gender?: string;
  locality?: string;
  address?: string;
  verification_status: string;
  email_verified: boolean;
  email_verified_at?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Public User interface (without sensitive data)
export interface PublicUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  user_type: 'client' | 'provider' | 'admin';
  profile_image?: string;
  locality?: string;
  verification_status: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Auth Types
export interface AuthUser {
  user: PublicUser;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  user_type: 'client' | 'provider';
  profile_image?: string;
  date_of_birth?: string;
  gender?: string;
  locality?: string;
  address?: string;
}

// Email Verification Types
export interface EmailVerificationToken {
  id: number;
  user_id: number;
  email: string;
  token: string;
  type: string;
  expires_at: string;
  created_at: string;
}

// Category Types - Based on categories table
export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  group_name?: string;
  is_active: boolean;
  created_at: string;
}

// Service Types - Based on services table
export interface Service {
  id: number;
  user_id: number;
  category_id?: number;
  title: string;
  description: string;
  price?: number;
  currency: string;
  duration_hours?: number;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceData {
  category_id?: number;
  title: string;
  description: string;
  price?: number;
  currency?: string;
  duration_hours?: number;
  location?: string;
}

// Service Images - Based on service_images table
export interface ServiceImage {
  id: number;
  service_id: number;
  image_url: string;
  caption?: string;
  is_primary: boolean;
  created_at: string;
}

// Booking Types - Based on bookings table
export interface Booking {
  id: number;
  client_id: number;
  provider_id: number;
  service_id: number;
  booking_date: string;
  booking_time: string;
  status: string;
  total_amount?: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  provider_id: number;
  service_id: number;
  booking_date: string;
  booking_time: string;
  total_amount?: number;
  notes?: string;
}

// Review Types - Based on reviews table
export interface Review {
  id: number;
  booking_id: number;
  reviewer_id: number;
  reviewed_id: number;
  rating: number;
  comment?: string;
  is_public: boolean;
  created_at: string;
}

export interface CreateReviewData {
  booking_id: number;
  reviewed_id: number;
  rating: number;
  comment?: string;
  is_public?: boolean;
}

// Chat Types - Based on chat_messages table
export interface ChatMessage {
  id: number;
  chat_room_id: string;
  sender_id: number;
  message: string;
  message_type: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  connection_id: number;
  created_at: string;
}

export interface SendMessageData {
  chat_room_id: string;
  message: string;
  message_type?: string;
  attachment_url?: string;
}

// Notification Types - Based on notifications table
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

// Payment Types - Based on payments table
export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  currency: string;
  payment_method?: string;
  payment_status: string;
  transaction_id?: string;
  processed_at?: string;
  created_at: string;
}

// Subscription Types - Based on subscriptions table
export interface Subscription {
  id: number;
  user_id: number;
  plan_type: 'free' | 'basic' | 'premium';
  status: string;
  started_at: string;
  expires_at?: string;
  auto_renew: boolean;
  created_at: string;
}

export interface SubscriptionPayment {
  id: number;
  subscription_id: number;
  amount: number;
  currency: string;
  payment_date: string;
  payment_method?: string;
  transaction_id?: string;
}

// User Verification Types - Based on user_verifications table
export interface UserVerification {
  id: number;
  user_id: number;
  verification_type: string;
  document_url?: string;
  status: string;
  verified_at?: string;
  verified_by?: number;
  notes?: string;
  created_at: string;
}

// Badge Types - Based on badges and user_badges tables
export interface Badge {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  requirements?: any; // JSONB
  points_required: number;
  is_active: boolean;
  created_at: string;
}

export interface UserBadge {
  id: number;
  user_id: number;
  badge_id: number;
  earned_at: string;
}

// AS Work Types - Based on as_work_locations and as_work_categories tables
export interface ASWorkLocation {
  id: number;
  user_id: number;
  location_name: string;
  is_primary: boolean;
  created_at: string;
}

export interface ASWorkCategory {
  id: number;
  user_id: number;
  category_id: number;
  experience_years: number;
  is_primary: boolean;
  created_at: string;
}

export interface ASPortfolio {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  image_url?: string;
  completed_date?: string;
  client_feedback?: string;
  category_id?: number;
  created_at: string;
}

// Explorer System Types - Based on explorer_service_requests table
export interface ExplorerServiceRequest {
  id: number;
  explorer_id: number;
  category_id?: number;
  title: string;
  description: string;
  locality: string;
  specific_address?: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  budget_min?: number;
  budget_max?: number;
  preferred_date?: string;
  preferred_time?: string;
  flexible_timing: boolean;
  status: string;
  expires_at?: string;
  views_count: number;
  interested_as_count: number;
  selected_as_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateExplorerServiceRequestData {
  category_id?: number;
  title: string;
  description: string;
  locality: string;
  specific_address?: string;
  urgency?: 'low' | 'medium' | 'high' | 'emergency';
  budget_min?: number;
  budget_max?: number;
  preferred_date?: string;
  preferred_time?: string;
  flexible_timing?: boolean;
  expires_at?: string;
}

// AS Service Interest Types - Based on as_service_interests table
export interface ASServiceInterest {
  id: number;
  request_id: number;
  as_id: number;
  message?: string;
  proposed_price?: number;
  currency: string;
  estimated_completion_time?: string;
  availability_date?: string;
  availability_time?: string;
  status: string;
  viewed_by_explorer: boolean;
  created_at: string;
}

export interface CreateASServiceInterestData {
  request_id: number;
  message?: string;
  proposed_price?: number;
  estimated_completion_time?: string;
  availability_date?: string;
  availability_time?: string;
}

// Explorer-AS Connection Types - Based on explorer_as_connections table
export interface ExplorerASConnection {
  id: number;
  explorer_id: number;
  as_id: number;
  request_id?: number;
  connection_type: string;
  chat_room_id: string;
  status: string;
  service_started_at?: string;
  service_completed_at?: string;
  final_agreed_price?: number;
  currency: string;
  explorer_confirmed_completion: boolean;
  as_confirmed_completion: boolean;
  explorer_confirmed_at?: string;
  as_confirmed_at?: string;
  requires_mutual_confirmation: boolean;
  created_at: string;
  updated_at: string;
}

// Explorer AS Review Types - Based on explorer_as_reviews table
export interface ExplorerASReview {
  id: number;
  connection_id: number;
  explorer_id: number;
  as_id: number;
  rating: number;
  comment: string;
  service_quality_rating?: number;
  punctuality_rating?: number;
  communication_rating?: number;
  value_for_money_rating?: number;
  would_hire_again: boolean;
  recommend_to_others: boolean;
  created_at: string;
}

export interface CreateExplorerASReviewData {
  connection_id: number;
  as_id: number;
  rating: number;
  comment: string;
  service_quality_rating?: number;
  punctuality_rating?: number;
  communication_rating?: number;
  value_for_money_rating?: number;
  would_hire_again?: boolean;
  recommend_to_others?: boolean;
}

// Review Obligation Types
export interface ExplorerReviewObligation {
  id: number;
  explorer_id: number;
  connection_id: number;
  as_id: number;
  service_completed_at: string;
  review_due_date: string;
  is_reviewed: boolean;
  is_blocking_new_services: boolean;
  created_at: string;
}

export interface ASReviewObligation {
  id: number;
  as_id: number;
  connection_id: number;
  explorer_id: number;
  service_completed_at: string;
  review_due_date: string;
  is_reviewed: boolean;
  is_blocking_new_services: boolean;
  created_at: string;
}

// Service Completion Confirmation Types
export interface ServiceCompletionConfirmation {
  id: number;
  connection_id: number;
  user_id: number;
  user_type: 'explorer' | 'as';
  confirmation_message?: string;
  work_quality_satisfaction: string;
  payment_received?: boolean;
  service_delivered?: boolean;
  confirmed_at: string;
}

// Promotional Campaign Types
export interface PromotionalCampaign {
  id: number;
  name: string;
  description?: string;
  campaign_type: string;
  target_user_type?: 'client' | 'provider' | 'both';
  max_participants?: number;
  current_participants: number;
  benefits?: any; // JSONB
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserPromotionalSubscription {
  id: number;
  user_id: number;
  campaign_id: number;
  subscription_type: string;
  started_at: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

// Smart Search Types
export interface SmartSearchRequest {
  id: number;
  explorer_id: number;
  search_query: string;
  category_id?: number;
  locality?: string;
  urgency: string;
  budget_max?: number;
  created_at: string;
}

export interface SmartSearchNotification {
  id: number;
  search_request_id: number;
  as_id: number;
  notification_type: string;
  sent_at: string;
  responded_at?: string;
}

// Chubut Localities
export interface ChubutLocality {
  id: number;
  name: string;
  region?: string;
  is_active: boolean;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: PaginationInfo;
  };
}

// Form validation types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormValidation {
  [key: string]: ValidationRule;
}

// Accessibility types
export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-busy'?: boolean;
  'aria-controls'?: string;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;
  'aria-disabled'?: boolean;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-required'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  'aria-pressed'?: boolean | 'mixed';
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-modal'?: boolean;
  'aria-multiselectable'?: boolean;
  'aria-readonly'?: boolean;
  role?: string;
}

export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
}

export interface KeyboardNavigationConfig {
  trapFocus?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  enableEscape?: boolean;
}

export interface ScreenReaderAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  delay?: number;
}

// Update legacy types to match database
export type ServiceCategory = string; // Now dynamic from categories table
export type BookingStatus = string; // Now flexible status from database
export type PaymentStatus = string; // Now flexible status from database
export type NotificationType = string; // Now flexible type from database