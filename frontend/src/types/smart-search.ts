// Smart Search and Promotional System Types

export interface SmartSearchRequest {
  id: number;
  client_id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  title: string;
  description?: string;
  location_address?: string;
  location_lat?: number;
  location_lng?: number;
  required_date: string;
  required_time: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  max_budget?: number;
  currency: string;
  status: 'active' | 'matched' | 'cancelled' | 'expired';
  matched_provider_id?: number;
  expires_at: string;
  notifications_sent: number;
  responses_received: number;
  created_at: string;
  updated_at: string;
  // Additional fields from joins
  total_notifications?: number;
  read_notifications?: number;
  responses?: number;
}

export interface SmartSearchNotification {
  id: number;
  search_request_id: number;
  provider_id: number;
  notification_type: 'push' | 'sms' | 'email';
  sent_at: string;
  read_at?: string;
  responded_at?: string;
  response_type?: 'interested' | 'not_available' | 'ignored';
  created_at: string;
  // Additional fields from joins
  title?: string;
  description?: string;
  location_address?: string;
  required_date?: string;
  required_time?: string;
  urgency?: string;
  max_budget?: number;
  expires_at?: string;
  client_first_name?: string;
  client_last_name?: string;
  client_profile_image?: string;
}

export interface PromotionalCampaign {
  id: number;
  name: string;
  description?: string;
  user_type: 'provider' | 'client' | 'both';
  max_participants: number;
  current_participants: number;
  duration_months: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Calculated fields
  remaining_slots?: number;
}

export interface UserPromotionalSubscription {
  id: number;
  user_id: number;
  campaign_id: number;
  campaign_name: string;
  campaign_description?: string;
  duration_months: number;
  campaign_user_type: string;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  // Calculated fields
  days_left?: number;
  expires_soon?: boolean;
}

export interface AvailabilityStatus {
  id: number;
  user_id: number;
  is_available: boolean;
  availability_type: 'online' | 'busy' | 'offline';
  last_seen: string;
  location_lat?: number;
  location_lng?: number;
  location_updated_at?: string;
  push_notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface NearbyProvider {
  id: number;
  first_name: string;
  last_name: string;
  profile_image?: string;
  is_available: boolean;
  availability_type: string;
  last_seen: string;
  location_lat?: number;
  location_lng?: number;
  avg_rating?: number;
  total_reviews: number;
  subscription_type: string;
  verification_status: string;
  distance_km?: number;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  type: 'free' | 'basic' | 'premium';
  description: string;
  price_monthly: number;
  currency: string;
  billing_cycle: 'monthly';
  trial_days: number;
  max_services?: number;
  features: {
    [key: string]: any;
  };
  is_active: boolean;
  is_promotional?: boolean;
}

export interface AvailabilityStats {
  period: string;
  availability: {
    available_sessions: number;
    online_sessions: number;
    busy_sessions: number;
    availability_percentage: number;
  };
  notifications: {
    notifications_received: number;
  };
}

// API Response types
export interface SmartSearchApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Form data interfaces
export interface SmartSearchRequestForm {
  category_id: number;
  title: string;
  description?: string;
  location_address?: string;
  location_lat?: number;
  location_lng?: number;
  required_date: string;
  required_time: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  max_budget?: number;
  currency?: string;
}

export interface SmartSearchResponseForm {
  search_request_id: number;
  response_type: 'interested' | 'not_available';
  message?: string;
}

export interface AvailabilityUpdateForm {
  is_available?: boolean;
  availability_type?: 'online' | 'busy' | 'offline';
  location_lat?: number;
  location_lng?: number;
  push_notifications_enabled?: boolean;
}

// Socket.IO event types
export interface SmartSearchSocketEvents {
  smart_search_notification: {
    search_request_id: number;
    urgency: string;
    message: string;
  };
  new_service_response: {
    search_request_id: number;
    provider_id: number;
    provider_name: string;
    message: string;
  };
  availability_updated: {
    is_available: boolean;
    availability_type: string;
  };
  availability_toggled: {
    is_available: boolean;
    message: string;
  };
}

// Search filters and criteria
export interface NearbyProvidersSearch {
  category_id: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
}

export interface SmartSearchCriteria {
  category_id: number;
  latitude?: number;
  longitude?: number;
  urgency: 'normal' | 'urgent' | 'emergency';
  required_datetime: Date;
  max_budget?: number;
}

// Promotional eligibility
export interface PromotionalEligibility {
  eligible: boolean;
  campaign?: {
    id: number;
    name: string;
    description: string;
    duration_months: number;
    remaining_slots: number;
  };
  current_promotion?: UserPromotionalSubscription;
  message: string;
}

// Constants
export const URGENCY_LEVELS = {
  normal: { label: 'Normal', color: 'blue', icon: '📅' },
  urgent: { label: 'Urgente', color: 'orange', icon: '⚡' },
  emergency: { label: 'Emergencia', color: 'red', icon: '🚨' }
} as const;

export const AVAILABILITY_TYPES = {
  online: { label: 'Disponible', color: 'green', icon: '🟢' },
  busy: { label: 'Ocupado', color: 'yellow', icon: '🟡' },
  offline: { label: 'Desconectado', color: 'gray', icon: '⚫' }
} as const;

export type UrgencyLevel = keyof typeof URGENCY_LEVELS;
export type AvailabilityType = keyof typeof AVAILABILITY_TYPES;