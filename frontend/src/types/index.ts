/**
 * COMPREHENSIVE FRONTEND TYPE DEFINITIONS - ALIGNED WITH BACKEND
 * These types ensure consistency between frontend/backend and database operations
 * All types are synchronized with backend/src/types/index.js
 */

// =====================================
// USER TYPES - CENTRALIZED DEFINITIONS  
// =====================================

/**
 * User Type Mapping - Single Source of Truth
 * Frontend uses 'customer', Database uses 'client'
 * This mapping ensures consistency across all operations
 */
export const USER_TYPES = {
  FRONTEND: {
    CUSTOMER: 'customer' as const,
    PROVIDER: 'provider' as const, 
    AS: 'provider' as const, // Alias for AS (service providers)
    ADMIN: 'admin' as const
  },
  DATABASE: {
    CLIENT: 'client' as const,
    PROVIDER: 'provider' as const,
    ADMIN: 'admin' as const
  }
};

// Main User interface for frontend
export interface User {
  id: number;
  first_name: string; // VARCHAR(100) NOT NULL
  last_name: string; // VARCHAR(100) NOT NULL  
  email: string; // VARCHAR(255) UNIQUE NOT NULL
  phone?: string; // VARCHAR(20)
  user_type: 'customer' | 'provider' | 'admin'; // Frontend uses 'customer', backend transforms to 'client'
  profile_image?: string; // TEXT (was profile_photo_url)
  profile_photo_url?: string; // Backwards compatibility
  date_of_birth?: string; // DATE
  gender?: string; // VARCHAR(10)
  locality?: string; // VARCHAR(100)
  address?: string; // TEXT
  bio?: string; // TEXT - user biography/description
  verification_status: string; // VARCHAR(20) DEFAULT 'pending'
  email_verified: boolean; // BOOLEAN DEFAULT false
  email_verified_at?: string; // TIMESTAMP
  is_active: boolean; // BOOLEAN DEFAULT true
  last_login?: string; // TIMESTAMP
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  subscription_plan?: 'basic' | 'professional' | 'plus'; // Subscription plan
}

// Auth Types
export interface AuthUser {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string; // Required, max 255 chars
  password: string; // Required
}

export interface RegisterData {
  first_name: string; // Required, max 100 chars
  last_name: string; // Required, max 100 chars
  email: string; // Required, max 255 chars, must be valid email
  password: string; // Required, will be hashed
  phone?: string; // Optional, max 20 chars
  user_type: 'customer' | 'provider'; // Required, maps to 'client'|'provider' in DB
  profile_image?: string; // Optional
  date_of_birth?: string; // Optional, format: YYYY-MM-DD
  gender?: string; // Optional, max 10 chars
  locality?: string; // Optional, max 100 chars
  address?: string; // Optional
}

// Category Types - Aligned with categories table
export interface Category {
  id: number;
  name: string; // VARCHAR(100) NOT NULL
  description?: string; // TEXT
  icon?: string; // VARCHAR(50)
  group_name?: string; // VARCHAR(100)
  is_active: boolean; // BOOLEAN DEFAULT true
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

// Service Types - Aligned with services table
export interface Service {
  id: number;
  user_id?: number; // INTEGER REFERENCES users(id) (was provider_id)
  provider_id?: number; // Backwards compatibility
  category_id?: number; // INTEGER REFERENCES categories(id)
  category?: string; // Backwards compatibility
  title: string; // VARCHAR(200) NOT NULL
  description: string; // TEXT NOT NULL
  price?: number; // DECIMAL(10,2)
  currency?: string; // VARCHAR(3) DEFAULT 'ARS'
  duration_hours?: number; // INTEGER (was duration_minutes)
  duration_minutes?: number; // Backwards compatibility
  location?: string; // VARCHAR(200) (was address)
  address?: string; // Backwards compatibility
  is_active: boolean; // BOOLEAN DEFAULT true
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  // Additional fields for compatibility
  first_name?: string;
  last_name?: string;
  profile_photo_url?: string;
  is_verified?: boolean;
  average_rating?: number;
  total_reviews?: number;
  views_count?: number;
  images?: string[];
}

export interface CreateServiceData {
  category_id?: number; // Optional reference to categories
  category?: string; // Backwards compatibility
  title: string; // Required, max 200 chars
  description: string; // Required
  price?: number; // Optional, positive decimal
  currency?: string; // Optional, defaults to 'ARS', max 3 chars
  duration_hours?: number; // Optional, positive integer
  duration_minutes?: number; // Backwards compatibility
  location?: string; // Optional, max 200 chars
  address?: string; // Backwards compatibility
  latitude?: number; // Backwards compatibility
  longitude?: number; // Backwards compatibility
}

// Service Images - New table not in old types
export interface ServiceImage {
  id: number;
  service_id: number; // INTEGER REFERENCES services(id)
  image_url: string; // TEXT NOT NULL
  caption?: string; // TEXT
  is_primary: boolean; // BOOLEAN DEFAULT false
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

// =====================================
// BOOKING STATUS TYPES
// =====================================

export const BOOKING_STATUS = {
  PENDING: 'pending' as const,
  CONFIRMED: 'confirmed' as const,
  IN_PROGRESS: 'in_progress' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
  REJECTED: 'rejected' as const
};

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

// Booking Types - Aligned with bookings table  
export interface Booking {
  id: number;
  client_id?: number; // INTEGER REFERENCES users(id) (was customer_id)
  customer_id?: number; // Backwards compatibility
  provider_id: number; // INTEGER REFERENCES users(id)
  service_id: number; // INTEGER REFERENCES services(id)
  booking_date?: string; // DATE NOT NULL (was scheduled_date)
  scheduled_date?: string; // Backwards compatibility
  booking_time?: string; // TIME NOT NULL (was scheduled_time)
  scheduled_time?: string; // Backwards compatibility
  status: BookingStatus; // Standardized booking status
  total_amount?: number; // DECIMAL(10,2)
  currency?: string; // VARCHAR(3) DEFAULT 'ARS'
  notes?: string; // TEXT
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  // Additional fields for compatibility
  payment_status?: PaymentStatus;
  service_title?: string;
  service_description?: string;
  category?: string;
  duration_minutes?: number;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_photo?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_latitude?: number;
  customer_longitude?: number;
  provider_first_name?: string;
  provider_last_name?: string;
  provider_photo?: string;
  provider_phone?: string;
}

export interface CreateBookingData {
  provider_id: number; // Required
  service_id: number; // Required
  booking_date: string; // Required, format: YYYY-MM-DD
  booking_time: string; // Required, format: HH:MM
  total_amount?: number; // Optional
  notes?: string; // Optional
}

// Review Types - Aligned with reviews table
export interface Review {
  id: number;
  booking_id: number; // INTEGER REFERENCES bookings(id)
  reviewer_id?: number; // INTEGER REFERENCES users(id) (was customer_id)
  customer_id?: number; // Backwards compatibility
  reviewed_id?: number; // INTEGER REFERENCES users(id) (was provider_id)  
  provider_id?: number; // Backwards compatibility
  service_id?: number; // Backwards compatibility
  rating: number; // INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL
  comment?: string; // TEXT
  is_public?: boolean; // BOOLEAN DEFAULT true
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at?: string; // Backwards compatibility
  // Additional fields for compatibility
  customer_first_name?: string;
  customer_last_name?: string;
  customer_photo?: string;
  provider_first_name?: string;
  provider_last_name?: string;
  provider_photo?: string;
  service_title?: string;
}

export interface CreateReviewData {
  booking_id: number; // Required
  reviewed_id: number; // Required
  rating: number; // Required, 1-5
  comment?: string; // Optional
  is_public?: boolean; // Optional, defaults to true
}

// =====================================
// MESSAGE TYPES - STANDARDIZED
// =====================================

export const MESSAGE_TYPES = {
  TEXT: 'text' as const,
  IMAGE: 'image' as const, 
  DOCUMENT: 'document' as const,
  FILE: 'file' as const,
  SYSTEM: 'system' as const
};

export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];

// Chat Types - Aligned with chat_messages and chat_rooms tables
export interface ChatRoom {
  id: string; // VARCHAR(100) PRIMARY KEY
  connection_id: number; // INTEGER REFERENCES explorer_as_connections(id)
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

export interface ChatMessage {
  id: number;
  chat_room_id: string; // VARCHAR(100) REFERENCES chat_rooms(id)
  sender_id: number; // INTEGER REFERENCES users(id)
  message: string; // TEXT NOT NULL
  message_type: MessageType; // Standardized message types
  attachment_url?: string; // TEXT
  is_read: boolean; // BOOLEAN DEFAULT false
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

export interface SendMessageData {
  chat_room_id: string; // Required
  message: string; // Required
  message_type?: MessageType; // Optional, defaults to 'text'
  attachment_url?: string; // Optional
}

// =====================================
// NOTIFICATION TYPES
// =====================================

export const NOTIFICATION_TYPES = {
  INFO: 'info' as const,
  SUCCESS: 'success' as const,
  WARNING: 'warning' as const, 
  ERROR: 'error' as const,
  BOOKING: 'booking' as const,
  PAYMENT: 'payment' as const,
  MESSAGE: 'message' as const,
  REVIEW: 'review' as const,
  SYSTEM: 'system' as const
};

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// Notification Types - Aligned with notifications table
export interface Notification {
  id: number;
  user_id: number; // INTEGER REFERENCES users(id)
  title: string; // VARCHAR(200) NOT NULL
  message: string; // TEXT NOT NULL
  type: NotificationType; // Standardized notification types
  is_read: boolean; // BOOLEAN DEFAULT false
  action_url?: string; // TEXT
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

// =====================================
// PAYMENT STATUS TYPES
// =====================================

export const PAYMENT_STATUS = {
  PENDING: 'pending' as const,
  PROCESSING: 'processing' as const,
  COMPLETED: 'completed' as const,
  FAILED: 'failed' as const,
  REFUNDED: 'refunded' as const,
  CANCELLED: 'cancelled' as const
};

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Payment Types - Aligned with payments table
export interface Payment {
  id: number;
  booking_id: number; // INTEGER REFERENCES bookings(id)
  amount: number; // DECIMAL(10,2) NOT NULL
  currency: string; // VARCHAR(3) DEFAULT 'ARS'
  payment_method?: string; // VARCHAR(50)
  payment_status: PaymentStatus; // Standardized payment status
  transaction_id?: string; // VARCHAR(100)
  processed_at?: string; // TIMESTAMP
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

// Subscription Types - Aligned with subscriptions table
export interface Subscription {
  id: number;
  user_id: number; // INTEGER REFERENCES users(id)
  plan_type: 'free' | 'basic' | 'premium'; // CHECK constraint
  status: string; // VARCHAR(20) DEFAULT 'active'
  started_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  expires_at?: string; // TIMESTAMP
  auto_renew: boolean; // BOOLEAN DEFAULT false
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

// Validation rules that match database constraints
export const ValidationRules = {
  user: {
    first_name: { required: true, maxLength: 100, minLength: 2 },
    last_name: { required: true, maxLength: 100, minLength: 2 },
    email: { required: true, maxLength: 255, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone: { maxLength: 20, pattern: /^\+?[1-9]\d{1,14}$/ },
    user_type: { required: true },
    locality: { maxLength: 100 },
    address: { maxLength: 1000 },
    gender: { maxLength: 10 },
    verification_status: { maxLength: 20 }
  },
  service: {
    title: { required: true, maxLength: 200, minLength: 5 },
    description: { required: true, minLength: 20 },
    price: { min: 0, max: 999999.99 },
    currency: { maxLength: 3 },
    duration_hours: { min: 0, max: 24 },
    location: { maxLength: 200 }
  },
  category: {
    name: { required: true, maxLength: 100 },
    description: { maxLength: 1000 },
    icon: { maxLength: 50 },
    group_name: { maxLength: 100 }
  },
  booking: {
    booking_date: { required: true, pattern: /^\d{4}-\d{2}-\d{2}$/ },
    booking_time: { required: true, pattern: /^\d{2}:\d{2}$/ },
    total_amount: { min: 0, max: 999999.99 },
    currency: { maxLength: 3 },
    notes: { maxLength: 1000 }
  },
  review: {
    rating: { required: true, min: 1, max: 5 },
    comment: { maxLength: 1000 }
  },
  notification: {
    title: { required: true, maxLength: 200 },
    message: { required: true, maxLength: 1000 },
    type: { maxLength: 50 }
  }
};

// API Response Types with strict security
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly message: string;
  readonly data: T;
  readonly timestamp?: string;
  readonly requestId?: string;
}

export interface ApiError {
  readonly success: false;
  readonly error: string;
  readonly code?: string;
  readonly timestamp?: string;
  readonly requestId?: string;
  readonly details?: {
    readonly field?: string;
    readonly violatedConstraint?: string;
    readonly [key: string]: unknown;
  };
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

// =====================================
// TYPE TRANSFORMATION UTILITIES
// =====================================

/**
 * Transform user type from frontend to database format
 * Used when sending data to backend API
 */
export function transformUserTypeToDatabase(userType: string): string {
  const mapping: { [key: string]: string } = {
    'customer': 'client',
    'provider': 'provider',
    'admin': 'admin',
    'AS': 'provider'
  };
  return mapping[userType] || userType;
}

/**
 * Transform user type from database to frontend format
 * Used when receiving data from backend API
 */
export function transformUserTypeToFrontend(userType: string): string {
  const mapping: { [key: string]: string } = {
    'client': 'customer',
    'provider': 'provider',
    'admin': 'admin'
  };
  return mapping[userType] || userType;
}

/**
 * Transform user object for API requests
 */
export function transformUserForApi(user: Partial<User>): any {
  const transformed = { ...user };
  if (user.user_type) {
    transformed.user_type = transformUserTypeToDatabase(user.user_type);
  }
  // Map frontend profile_photo_url to backend profile_image
  if (user.profile_photo_url && !transformed.profile_image) {
    transformed.profile_image = user.profile_photo_url;
  }
  return transformed;
}

/**
 * Transform user object from API responses
 */
export function transformUserFromApi(user: any): User {
  const transformed = { ...user };
  if (user.user_type) {
    transformed.user_type = transformUserTypeToFrontend(user.user_type);
  }
  // Map backend profile_image to frontend profile_photo_url
  if (user.profile_image && !transformed.profile_photo_url) {
    transformed.profile_photo_url = user.profile_image;
  }
  return transformed;
}

/**
 * Transform booking field names for API compatibility
 */
export function transformBookingForApi(booking: Partial<Booking>): any {
  const transformed = { ...booking };
  
  // Map frontend customer_id to backend client_id
  if (booking.customer_id) {
    transformed.client_id = booking.customer_id;
    delete transformed.customer_id;
  }
  
  // Map frontend scheduled_* to backend booking_*
  if (booking.scheduled_date) {
    transformed.booking_date = booking.scheduled_date;
    delete transformed.scheduled_date;
  }
  
  if (booking.scheduled_time) {
    transformed.booking_time = booking.scheduled_time;
    delete transformed.scheduled_time;
  }
  
  return transformed;
}

/**
 * Transform booking from API responses
 */
export function transformBookingFromApi(booking: any): Booking {
  const transformed = { ...booking };
  
  // Map backend client_id to frontend customer_id
  if (booking.client_id) {
    transformed.customer_id = booking.client_id;
  }
  
  // Add backward compatibility fields
  if (booking.booking_date) {
    transformed.scheduled_date = booking.booking_date;
  }
  
  if (booking.booking_time) {
    transformed.scheduled_time = booking.booking_time;
  }
  
  return transformed;
}

/**
 * Transform service field names for API compatibility
 */
export function transformServiceForApi(service: Partial<Service>): any {
  const transformed = { ...service };
  
  // Map frontend provider_id to backend user_id
  if (service.provider_id) {
    transformed.user_id = service.provider_id;
    delete transformed.provider_id;
  }
  
  // Map frontend address to backend location
  if (service.address) {
    transformed.location = service.address;
    delete transformed.address;
  }
  
  // Convert duration_minutes to duration_hours if needed
  if (service.duration_minutes && !transformed.duration_hours) {
    transformed.duration_hours = Math.ceil(service.duration_minutes / 60);
    delete transformed.duration_minutes;
  }
  
  return transformed;
}

/**
 * Transform service from API responses
 */
export function transformServiceFromApi(service: any): Service {
  const transformed = { ...service };
  
  // Map backend user_id to frontend provider_id
  if (service.user_id) {
    transformed.provider_id = service.user_id;
  }
  
  // Add backward compatibility fields
  if (service.location) {
    transformed.address = service.location;
  }
  
  if (service.duration_hours) {
    transformed.duration_minutes = service.duration_hours * 60;
  }
  
  return transformed;
}

// Legacy compatibility types (deprecated, use standardized types above)
export type ServiceCategory = string; // Now dynamic from categories table

// Extended types for complex operations
export interface ServiceWithDetails extends Service {
  category_name?: string;
  category_icon?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_profile_image?: string;
  user_verification_status?: string;
  service_images?: ServiceImage[];
  average_rating?: number;
  total_reviews?: number;
}

export interface BookingWithDetails extends Booking {
  service_title?: string;
  service_description?: string;
  category_name?: string;
  client_first_name?: string;
  client_last_name?: string;
  client_phone?: string;
  provider_first_name?: string;
  provider_last_name?: string;
  provider_phone?: string;
}

export interface ReviewWithDetails extends Review {
  reviewer_first_name?: string;
  reviewer_last_name?: string;
  reviewed_first_name?: string;
  reviewed_last_name?: string;
  service_title?: string;
  category_name?: string;
}

// Additional types for backwards compatibility
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

export interface Chat {
  id: number;
  customer_id: number;
  provider_id: number;
  booking_id?: number;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  updated_at: string;
  other_user_first_name: string;
  other_user_last_name: string;
  other_user_photo?: string;
  service_title?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  requires_acceptance?: boolean;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  content: string;
  message_type: MessageType; // Using standardized message types
  is_read: boolean;
  created_at: string;
  sender_first_name: string;
  sender_last_name: string;
  sender_photo?: string;
}