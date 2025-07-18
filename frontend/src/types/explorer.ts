// Explorer System Types for Fixia.com.ar

export interface ExplorerProfile {
  id: number;
  user_id: number;
  preferred_localities: string[];
  preferred_categories: number[];
  average_budget_range: string;
  communication_preference: 'chat' | 'whatsapp' | 'phone' | 'email';
  is_reliable_client: boolean;
  total_services_hired: number;
  total_amount_spent: number;
  preferred_payment_method: string;
  special_requirements: string;
  created_at: string;
  updated_at: string;
  // User data from join
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image?: string;
  avg_rating: number;
  total_reviews: number;
}

export interface ExplorerServiceRequest {
  id: number;
  explorer_id: number;
  category_id: number;
  title: string;
  description: string;
  locality: string;
  specific_address?: string;
  location_lat?: number;
  location_lng?: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  budget_min?: number;
  budget_max?: number;
  currency: string;
  preferred_date?: string;
  preferred_time?: string;
  flexible_timing: boolean;
  status: 'active' | 'in_progress' | 'completed' | 'cancelled';
  selected_as_id?: number;
  expires_at: string;
  views_count: number;
  interested_as_count: number;
  created_at: string;
  updated_at: string;
  // Additional fields from joins
  category_name?: string;
  category_icon?: string;
  pending_interests?: number;
}

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
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  viewed_by_explorer: boolean;
  created_at: string;
  updated_at: string;
  // AS data from joins
  first_name: string;
  last_name: string;
  profile_image?: string;
  verification_status: string;
  avg_rating?: number;
  total_reviews: number;
  subscription_type: string;
}

export interface ExplorerASConnection {
  id: number;
  explorer_id: number;
  as_id: number;
  request_id?: number;
  connection_type: 'service_request' | 'direct_contact' | 'chat_initiated';
  chat_room_id: string;
  status: 'active' | 'service_in_progress' | 'completed' | 'cancelled';
  service_started_at?: string;
  service_completed_at?: string;
  final_agreed_price?: number;
  currency: string;
  // Mutual confirmation fields
  explorer_confirmed_completion?: boolean;
  as_confirmed_completion?: boolean;
  explorer_confirmed_at?: string;
  as_confirmed_at?: string;
  requires_mutual_confirmation?: boolean;
  created_at: string;
  updated_at: string;
  // Additional data from joins
  as_name?: string;
  as_last_name?: string;
  as_profile_image?: string;
  verification_status?: string;
  service_title?: string;
  category_name?: string;
  unread_messages?: number;
  last_message?: string;
  last_message_time?: string;
}

export interface ExplorerASReview {
  id: number;
  connection_id: number;
  explorer_id: number;
  as_id: number;
  request_id?: number;
  rating: number;
  comment: string;
  service_quality_rating?: number;
  punctuality_rating?: number;
  communication_rating?: number;
  value_for_money_rating?: number;
  would_hire_again: boolean;
  recommend_to_others: boolean;
  review_photos?: string[];
  is_verified_review: boolean;
  helpful_votes: number;
  created_at: string;
  updated_at: string;
  // Additional data from joins
  as_name?: string;
  as_last_name?: string;
  as_profile_image?: string;
  service_title?: string;
  category_name?: string;
}

export interface ASExplorerReview {
  id: number;
  connection_id: number;
  as_id: number;
  explorer_id: number;
  request_id?: number;
  rating: number;
  comment: string;
  payment_reliability_rating?: number;
  communication_rating?: number;
  clarity_of_requirements_rating?: number;
  respect_rating?: number;
  would_work_again: boolean;
  recommend_to_others: boolean;
  created_at: string;
  updated_at: string;
  // Additional data from joins
  explorer_name?: string;
  service_title?: string;
  category_name?: string;
}

export interface ExplorerReviewObligation {
  id: number;
  explorer_id: number;
  connection_id: number;
  as_id: number;
  service_completed_at: string;
  review_due_date: string;
  is_reviewed: boolean;
  review_id?: number;
  reminder_sent_count: number;
  last_reminder_sent?: string;
  is_blocking_new_services: boolean;
  created_at: string;
  updated_at: string;
  // Additional data from joins
  chat_room_id?: string;
  final_agreed_price?: number;
  as_name?: string;
  as_last_name?: string;
  as_profile_image?: string;
  verification_status?: string;
  service_title?: string;
  category_name?: string;
  days_remaining?: number;
}

export interface ChubutLocality {
  id: number;
  name: string;
  department: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  population?: number;
  is_active: boolean;
  created_at: string;
}

export interface UserRoleSwitch {
  id: number;
  user_id: number;
  from_role: 'client' | 'provider';
  to_role: 'client' | 'provider';
  switch_reason?: string;
  switched_at: string;
  is_active: boolean;
}

export interface ChatMessage {
  id: number;
  chat_room_id: string;
  sender_id: number;
  message: string;
  message_type: 'text' | 'image' | 'document' | 'location' | 'service_update';
  attachment_url?: string;
  is_read: boolean;
  is_system_message: boolean;
  reply_to_message_id?: number;
  created_at: string;
  updated_at: string;
  // Sender data from joins
  first_name: string;
  last_name: string;
  profile_image?: string;
}

export interface ChatRoom {
  id: string;
  room_type: 'explorer_as' | 'group' | 'support';
  room_name?: string;
  created_by: number;
  last_activity: string;
  is_active: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface ASProfileForExplorer {
  basic_info: {
    id: number;
    first_name: string;
    last_name: string;
    profile_image?: string;
    verification_status: string;
    subscription_type: string;
    created_at: string;
    avg_rating?: number;
    total_reviews: number;
    years_experience?: number;
    about_me?: string;
  };
  categories: Array<{
    id: number;
    category_id: number;
    category_name: string;
    category_icon: string;
    is_active: boolean;
  }>;
  locations: Array<{
    id: number;
    locality: string;
    service_radius: number;
    is_active: boolean;
  }>;
  pricing: Array<{
    id: number;
    category_id: number;
    category_name: string;
    base_price: number;
    currency: string;
    service_type: string;
    is_active: boolean;
  }>;
  portfolio: Array<{
    id: number;
    title: string;
    description: string;
    image_url?: string;
    is_featured: boolean;
    is_visible: boolean;
    sort_order: number;
  }>;
  recent_reviews: ExplorerASReview[];
}

// Form Types
export interface ExplorerServiceRequestForm {
  category_id: number | string;
  title: string;
  description: string;
  locality: string;
  specific_address?: string;
  location_lat?: number;
  location_lng?: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  budget_min?: number;
  budget_max?: number;
  preferred_date?: string;
  preferred_time?: string;
  flexible_timing: boolean;
}

export interface ExplorerProfileUpdateForm {
  preferred_localities?: string[];
  preferred_categories?: number[];
  average_budget_range?: string;
  communication_preference?: 'chat' | 'whatsapp' | 'phone' | 'email';
  preferred_payment_method?: string;
  special_requirements?: string;
}

export interface ExplorerReviewForm {
  connection_id: number;
  rating: number;
  comment: string;
  service_quality_rating?: number;
  punctuality_rating?: number;
  communication_rating?: number;
  value_for_money_rating?: number;
  would_hire_again?: boolean;
  recommend_to_others?: boolean;
  review_photos?: string[];
}

export interface ChatMessageForm {
  message: string;
  message_type?: 'text' | 'image' | 'document' | 'location';
  attachment_url?: string;
  reply_to_message_id?: number;
}

export interface RoleSwitchForm {
  switch_reason?: string;
}

// API Response Types
export interface ExplorerApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ExplorerBrowseParams {
  category_id?: number;
  locality?: string;
  min_rating?: number;
  subscription_type?: string;
  sort_by?: 'rating' | 'price' | 'newest';
  limit?: number;
  offset?: number;
}

export interface ExplorerSearchFilters {
  category_id?: number;
  locality?: string;
  urgency?: 'low' | 'medium' | 'high' | 'emergency';
  min_budget?: number;
  max_budget?: number;
  flexible_timing?: boolean;
}

// Socket.IO Events for Explorer
export interface ExplorerSocketEvents {
  new_as_interest: {
    request_id: number;
    as_id: number;
    as_name: string;
    proposed_price?: number;
    message: string;
  };
  service_accepted: {
    connection_id: number;
    chat_room_id: string;
    explorer_name: string;
    message: string;
  };
  new_chat_message: {
    chat_room_id: string;
    message: ChatMessage;
    sender_name: string;
  };
  service_completed: {
    connection_id: number;
    completed_by: number;
    message: string;
  };
  new_review_received: {
    review_id: number;
    explorer_name: string;
    rating: number;
    message: string;
  };
  review_reminder: {
    obligation_id: number;
    as_name: string;
    days_remaining: number;
    message: string;
  };
}

// Constants
export const URGENCY_LEVELS = {
  low: { label: 'Baja', color: 'gray', icon: '⏰', expiryHours: 168 },
  medium: { label: 'Media', color: 'blue', icon: '📅', expiryHours: 120 },
  high: { label: 'Alta', color: 'orange', icon: '⚡', expiryHours: 72 },
  emergency: { label: 'Emergencia', color: 'red', icon: '🚨', expiryHours: 24 }
} as const;

export const CONNECTION_STATUS = {
  active: { label: 'Activo', color: 'blue', icon: '🔵' },
  service_in_progress: { label: 'En Progreso', color: 'orange', icon: '🟠' },
  completed: { label: 'Completado', color: 'green', icon: '🟢' },
  cancelled: { label: 'Cancelado', color: 'red', icon: '🔴' }
} as const;

export const COMMUNICATION_PREFERENCES = {
  chat: { label: 'Chat en la app', icon: '💬' },
  whatsapp: { label: 'WhatsApp', icon: '📱' },
  phone: { label: 'Teléfono', icon: '📞' },
  email: { label: 'Email', icon: '📧' }
} as const;

export const MESSAGE_TYPES = {
  text: { label: 'Texto', icon: '💬' },
  image: { label: 'Imagen', icon: '🖼️' },
  document: { label: 'Documento', icon: '📄' },
  location: { label: 'Ubicación', icon: '📍' },
  service_update: { label: 'Actualización', icon: '🔄' }
} as const;

export type UrgencyLevel = keyof typeof URGENCY_LEVELS;
export type ConnectionStatus = keyof typeof CONNECTION_STATUS;
export type CommunicationPreference = keyof typeof COMMUNICATION_PREFERENCES;
export type MessageType = keyof typeof MESSAGE_TYPES;