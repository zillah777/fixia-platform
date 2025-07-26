/**
 * Common Types - Strongly typed interfaces
 * @fileoverview Replaces 'any' types with proper TypeScript interfaces
 */

// Base API Response Structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search and Filtering
export interface SearchParams {
  query?: string;
  filters?: Record<string, string | number | boolean>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

// User Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'client' | 'provider' | 'customer';
  is_active: boolean;
  email_verified: boolean;
  profile_photo_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  about_me?: string;
  date_of_birth?: string;
  gender?: string;
  locality?: string;
  subscription_type?: 'free' | 'premium';
  verification_score?: number;
}

// Service Related Types
export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category?: ServiceCategory;
  user_id: number;
  provider?: UserProfile;
  price_range?: string;
  location?: string;
  is_active: boolean;
  images?: string[];
  created_at: string;
  updated_at: string;
}

// Chat and Communication
export interface ChatMessage {
  id: number;
  chat_room_id: number;
  sender_id: number;
  sender?: Pick<User, 'id' | 'first_name' | 'last_name' | 'profile_photo_url'>;
  message: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: number;
  participants: User[];
  last_message?: ChatMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

// Reviews and Ratings
export interface Review {
  id: number;
  rating: number;
  comment?: string;
  reviewer_id: number;
  reviewer?: Pick<User, 'id' | 'first_name' | 'last_name' | 'profile_photo_url'>;
  reviewee_id: number;
  reviewee?: Pick<User, 'id' | 'first_name' | 'last_name'>;
  service_id?: number;
  service?: Pick<Service, 'id' | 'title'>;
  is_verified: boolean;
  created_at: string;
}

// Bookings and Requests
export interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category?: ServiceCategory;
  explorer_id: number;
  explorer?: UserProfile;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  budget_range?: string;
  preferred_date?: string;
  location: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface ServiceInterest {
  id: number;
  request_id: number;
  request?: ServiceRequest;
  as_id: number;
  professional?: UserProfile;
  status: 'interested' | 'proposal_sent' | 'accepted' | 'rejected';
  proposal_message?: string;
  proposed_price?: number;
  created_at: string;
}

// Notifications
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Form and UI States
export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  error?: string;
}

// Component Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface IconProps extends BaseComponentProps {
  size?: number | string;
  color?: string;
}

// Event Handlers
export type EventHandler<T = HTMLElement> = (event: React.SyntheticEvent<T>) => void;
export type ChangeHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;
export type ClickHandler<T = HTMLButtonElement> = (event: React.MouseEvent<T>) => void;

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// API Error Types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  validationErrors?: ValidationError[];
}