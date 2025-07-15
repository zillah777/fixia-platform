// Bridge types to migrate gradually from old types to database-aligned types
// This file helps maintain compatibility during the transition

import * as DB from './database';
import * as Legacy from './index';

// User Type Bridge - Maps 'customer' to 'client'
export interface UserTypeBridge {
  frontend: 'customer' | 'provider';
  database: 'client' | 'provider' | 'admin';
}

export const mapUserTypeToDatabase = (frontendType: 'customer' | 'provider'): 'client' | 'provider' => {
  return frontendType === 'customer' ? 'client' : 'provider';
};

export const mapUserTypeFromDatabase = (dbType: 'client' | 'provider' | 'admin'): 'customer' | 'provider' => {
  return dbType === 'client' ? 'customer' : 'provider';
};

// Service Type Bridge - Maps old service structure to new
export interface ServiceBridge extends Omit<Legacy.Service, 'provider_id' | 'category' | 'duration_minutes'> {
  // Map provider_id to user_id
  user_id: number;
  // Map duration_minutes to duration_hours  
  duration_hours?: number;
  // Map category string to category_id
  category_id?: number;
  // Add currency field
  currency: string;
  // Map address to location
  location?: string;
}

export const mapServiceToDatabase = (legacyService: Partial<Legacy.CreateServiceData>): Partial<DB.CreateServiceData> => {
  return {
    title: legacyService.title || '',
    description: legacyService.description || '',
    price: legacyService.price,
    duration_hours: legacyService.duration_minutes ? legacyService.duration_minutes / 60 : undefined,
    location: legacyService.address,
    currency: 'ARS' // Default currency
    // Note: category mapping would need a category lookup table
  };
};

// Booking Type Bridge - Maps old booking structure to new
export interface BookingBridge extends Omit<Legacy.Booking, 'customer_id' | 'provider_id' | 'scheduled_date' | 'scheduled_time'> {
  client_id: number;
  provider_id: number;
  booking_date: string;
  booking_time: string;
}

export const mapBookingToDatabase = (legacyBooking: Partial<Legacy.CreateBookingData>): Partial<DB.CreateBookingData> => {
  return {
    provider_id: legacyBooking.service_id || 0, // This needs to be mapped correctly
    service_id: legacyBooking.service_id || 0,
    booking_date: legacyBooking.scheduled_date || '',
    booking_time: legacyBooking.scheduled_time || '',
    total_amount: legacyBooking.notes ? undefined : undefined,
    notes: legacyBooking.notes
  };
};

// Review Type Bridge
export const mapReviewToDatabase = (legacyReview: Partial<Legacy.CreateReviewData>): Partial<DB.CreateReviewData> => {
  return {
    booking_id: legacyReview.booking_id || 0,
    reviewed_id: 0, // This needs to be determined from booking
    rating: legacyReview.rating || 1,
    comment: legacyReview.comment,
    is_public: true // Default to public
  };
};

// Helper functions for safe field mapping
export const safeMapUser = (user: any): DB.PublicUser => {
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    user_type: mapUserTypeToDatabase(user.user_type),
    profile_image: user.profile_photo_url || user.profile_image,
    locality: user.address || user.locality,
    verification_status: user.verification_status || 'pending',
    email_verified: user.email_verified || false,
    is_active: user.is_active !== false,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
};

// API Response type that works with both old and new types
export interface CompatibleApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
  details?: any;
}

// Form validation that matches database constraints
export const DatabaseValidations = {
  user: {
    first_name: { required: true, maxLength: 100 },
    last_name: { required: true, maxLength: 100 },
    email: { required: true, maxLength: 255, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone: { maxLength: 20 },
    user_type: { required: true },
    locality: { maxLength: 100 },
    verification_status: { maxLength: 20 }
  },
  service: {
    title: { required: true, maxLength: 200 },
    description: { required: true },
    price: { min: 0 },
    currency: { maxLength: 3 },
    duration_hours: { min: 0 },
    location: { maxLength: 200 }
  },
  category: {
    name: { required: true, maxLength: 100 },
    group_name: { maxLength: 100 },
    icon: { maxLength: 50 }
  },
  booking: {
    booking_date: { required: true },
    booking_time: { required: true },
    total_amount: { min: 0 },
    currency: { maxLength: 3 }
  },
  review: {
    rating: { required: true, min: 1, max: 5 },
    comment: { maxLength: 1000 }
  }
};

// Export bridge types that components can use during migration
export type MigrationUser = DB.PublicUser | Legacy.User;
export type MigrationService = DB.Service | Legacy.Service;
export type MigrationBooking = DB.Booking | Legacy.Booking;
export type MigrationReview = DB.Review | Legacy.Review;