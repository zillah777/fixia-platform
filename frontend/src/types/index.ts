// User Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'customer' | 'provider';
  phone?: string;
  profile_photo_url?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  stats?: {
    total_services: number;
    total_reviews: number;
    average_rating: number;
    completed_bookings: number;
  };
}

// Extended User for Professional features
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
  professional_info?: {
    profession?: string;
    license_number?: string;
    specialization?: string;
    years_experience?: number;
  };
}

// Auth Types
export interface AuthUser {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: 'customer' | 'provider';
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

// Service Types
export type ServiceCategory = 'plomeria' | 'electricidad' | 'limpieza' | 'reparaciones' | 'belleza' | 'otros';

export interface Service {
  id: number;
  provider_id: number;
  title: string;
  description: string;
  category: ServiceCategory;
  price: number;
  duration_minutes: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  profile_photo_url?: string;
  is_verified: boolean;
  average_rating: number;
  total_reviews: number;
  views_count: number;
  images: string[];
}

export interface CreateServiceData {
  title: string;
  description: string;
  category: ServiceCategory;
  price: number;
  duration_minutes: number;
  address?: string;
  latitude?: number;
  longitude?: number;
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';

export interface Booking {
  id: number;
  customer_id: number;
  provider_id: number;
  service_id: number;
  scheduled_date: string;
  scheduled_time: string;
  total_amount: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  notes?: string;
  customer_address: string;
  customer_latitude: number;
  customer_longitude: number;
  created_at: string;
  updated_at: string;
  service_title: string;
  service_description?: string;
  category: ServiceCategory;
  duration_minutes: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_photo?: string;
  customer_phone?: string;
  provider_first_name: string;
  provider_last_name: string;
  provider_photo?: string;
  provider_phone?: string;
}

export interface CreateBookingData {
  service_id: number;
  scheduled_date: string;
  scheduled_time: string;
  notes?: string;
  customer_address: string;
  customer_latitude: number;
  customer_longitude: number;
}

// Review Types
export interface Review {
  id: number;
  customer_id: number;
  provider_id: number;
  service_id: number;
  booking_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_photo?: string;
  provider_first_name?: string;
  provider_last_name?: string;
  provider_photo?: string;
  service_title: string;
}

export interface CreateReviewData {
  booking_id: number;
  rating: number;
  comment?: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Chat Types
export interface Chat {
  id: number;
  customer_id: number;
  provider_id: number;
  booking_id?: number;
  created_at: string;
  updated_at: string;
  other_user_first_name: string;
  other_user_last_name: string;
  other_user_photo?: string;
  service_title?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  content: string;
  message_type: 'text' | 'image';
  is_read: boolean;
  created_at: string;
  sender_first_name: string;
  sender_last_name: string;
  sender_photo?: string;
}

export interface SendMessageData {
  content: string;
  message_type?: 'text' | 'image';
}

// Notification Types
export type NotificationType = 'booking' | 'payment' | 'review' | 'chat' | 'system';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  related_id?: number;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  booking_updates: boolean;
  payment_updates: boolean;
  chat_messages: boolean;
  marketing_emails: boolean;
}

// Payment Types
export interface Payment {
  id: number;
  booking_id: number;
  customer_id: number;
  amount: number;
  payment_method: string;
  external_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
  created_at: string;
  updated_at: string;
  scheduled_date: string;
  scheduled_time: string;
  service_title: string;
  other_user_name: string;
}

export interface PaymentIntent {
  payment_id: number;
  payment_url: string;
  external_id: string;
  amount: number;
}

export interface EarningsSummary {
  total_earnings: number;
  completed_payments: number;
  pending_payments: number;
  average_payment: number;
  monthly_breakdown: Array<{
    year: number;
    month: number;
    earnings: number;
    payments: number;
  }>;
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
    [key: string]: T[];
    pagination: PaginationInfo;
  };
}

// Search and Filter Types
export interface ServiceFilters {
  category?: ServiceCategory;
  latitude?: number;
  longitude?: number;
  radius?: number;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProviderFilters {
  category?: ServiceCategory;
  latitude?: number;
  longitude?: number;
  radius?: number;
  min_rating?: number;
  page?: number;
  limit?: number;
}

// Map Types
export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}

// Form Types
export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

// Category Types
export interface Category {
  value: ServiceCategory;
  label: string;
}

// Error Types
export interface FormError {
  field: string;
  message: string;
}