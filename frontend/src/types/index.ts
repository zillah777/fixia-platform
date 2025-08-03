// Updated types that align with database structure
// These types use the exact field names and constraints from PostgreSQL

// User Types - Aligned with users table
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
  status: string; // VARCHAR(20) DEFAULT 'pending'
  total_amount?: number; // DECIMAL(10,2)
  currency?: string; // VARCHAR(3) DEFAULT 'ARS'
  notes?: string; // TEXT
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  // Additional fields for compatibility
  payment_status?: string;
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
  message_type: string; // VARCHAR(20) DEFAULT 'text'
  attachment_url?: string; // TEXT
  is_read: boolean; // BOOLEAN DEFAULT false
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

export interface SendMessageData {
  chat_room_id: string; // Required
  message: string; // Required
  message_type?: string; // Optional, defaults to 'text'
  attachment_url?: string; // Optional
}

// Notification Types - Aligned with notifications table
export interface Notification {
  id: number;
  user_id: number; // INTEGER REFERENCES users(id)
  title: string; // VARCHAR(200) NOT NULL
  message: string; // TEXT NOT NULL
  type: string; // VARCHAR(50) DEFAULT 'info'
  is_read: boolean; // BOOLEAN DEFAULT false
  action_url?: string; // TEXT
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

// Payment Types - Aligned with payments table
export interface Payment {
  id: number;
  booking_id: number; // INTEGER REFERENCES bookings(id)
  amount: number; // DECIMAL(10,2) NOT NULL
  currency: string; // VARCHAR(3) DEFAULT 'ARS'
  payment_method?: string; // VARCHAR(50)
  payment_status: string; // VARCHAR(20) DEFAULT 'pending'
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

// Legacy compatibility types (deprecated, use updated types above)
export type ServiceCategory = string; // Now dynamic from categories table
export type BookingStatus = string; // Now flexible from database
export type PaymentStatus = string; // Now flexible from database  
export type NotificationType = string; // Now flexible from database

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