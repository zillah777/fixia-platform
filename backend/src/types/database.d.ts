/**
 * DATABASE QUERY RESULT TYPE DEFINITIONS
 * TypeScript interfaces for all SQL query results and database operations
 */

import { Pool, PoolClient, QueryResult } from 'pg';

// =====================================
// CORE DATABASE INTERFACES
// =====================================

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: any;
  max?: number;
  min?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export interface DatabaseConnection {
  pool: Pool;
  query: (text: string, params?: any[]) => Promise<QueryResult>;
  testConnection: () => Promise<boolean>;
  close: () => Promise<void>;
}

// =====================================
// USER QUERY RESULTS
// =====================================

export interface UserRecord {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone: string | null;
  user_type: 'client' | 'provider' | 'admin';
  profile_image: string | null;
  date_of_birth: string | null;
  gender: string | null;
  locality: string | null;
  address: string | null;
  bio: string | null;
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired';
  email_verified: boolean;
  email_verified_at: string | null;
  is_active: boolean;
  last_login: string | null;
  subscription_plan: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthQueryResult {
  user: UserRecord;
  token?: string;
  refresh_token?: string;
  expires_at?: string;
}

export interface UserStatsQueryResult {
  user_id: number;
  total_services: number;
  active_services: number;
  total_bookings: number;
  completed_bookings: number;
  average_rating: number;
  total_reviews: number;
  total_earnings: number;
  this_month_earnings: number;
  profile_completeness: number;
}

// =====================================
// SERVICE QUERY RESULTS
// =====================================

export interface ServiceRecord {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  duration_hours: number | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceWithDetailsQueryResult extends ServiceRecord {
  category_name: string | null;
  category_icon: string | null;
  provider_first_name: string;
  provider_last_name: string;
  provider_profile_image: string | null;
  provider_verification_status: string;
  average_rating: number | null;
  total_reviews: number;
  service_images: string[];
  is_featured: boolean;
  views_count: number;
}

export interface CategoryRecord {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  group_name: string | null;
  is_active: boolean;
  created_at: string;
  service_count?: number;
}

// =====================================
// BOOKING QUERY RESULTS
// =====================================

export interface BookingRecord {
  id: number;
  client_id: number;
  provider_id: number;
  service_id: number;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  total_amount: number | null;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetailsQueryResult extends BookingRecord {
  service_title: string;
  service_description: string;
  service_price: number | null;
  service_duration_hours: number | null;
  category_name: string | null;
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  client_phone: string | null;
  client_profile_image: string | null;
  provider_first_name: string;
  provider_last_name: string;
  provider_email: string;
  provider_phone: string | null;
  provider_profile_image: string | null;
  payment_status: string | null;
}

// =====================================
// CHAT QUERY RESULTS
// =====================================

export interface ChatRecord {
  id: number;
  customer_id: number;
  provider_id: number;
  booking_id: number | null;
  status: 'pending' | 'active' | 'rejected' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ChatWithDetailsQueryResult extends ChatRecord {
  other_user_first_name: string;
  other_user_last_name: string;
  other_user_profile_image: string | null;
  service_title: string | null;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
  requires_acceptance: boolean;
}

export interface MessageRecord {
  id: number;
  chat_id: number;
  sender_id: number;
  content: string;
  message_type: 'text' | 'image' | 'document' | 'file' | 'system';
  attachment_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface MessageWithSenderQueryResult extends MessageRecord {
  sender_first_name: string;
  sender_last_name: string;
  sender_profile_image: string | null;
}

// =====================================
// REVIEW QUERY RESULTS
// =====================================

export interface ReviewRecord {
  id: number;
  booking_id: number;
  reviewer_id: number;
  reviewed_id: number;
  service_id: number | null;
  rating: number;
  comment: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithDetailsQueryResult extends ReviewRecord {
  reviewer_first_name: string;
  reviewer_last_name: string;
  reviewer_profile_image: string | null;
  reviewed_first_name: string;
  reviewed_last_name: string;
  reviewed_profile_image: string | null;
  service_title: string | null;
  category_name: string | null;
  booking_date: string;
}

export interface ReviewStatsQueryResult {
  provider_id: number;
  average_rating: number;
  total_reviews: number;
  rating_1_count: number;
  rating_2_count: number;
  rating_3_count: number;
  rating_4_count: number;
  rating_5_count: number;
  latest_review_date: string | null;
}

// =====================================
// PAYMENT QUERY RESULTS
// =====================================

export interface PaymentRecord {
  id: number;
  booking_id: number;
  amount: number;
  currency: string;
  payment_method: string | null;
  payment_status: 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
  transaction_id: string | null;
  mercadopago_id: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface PaymentWithDetailsQueryResult extends PaymentRecord {
  booking_date: string;
  booking_time: string;
  service_title: string;
  provider_first_name: string;
  provider_last_name: string;
  client_first_name: string;
  client_last_name: string;
}

// =====================================
// NOTIFICATION QUERY RESULTS
// =====================================

export interface NotificationRecord {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'booking' | 'payment' | 'message' | 'review' | 'system';
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

// =====================================
// ANALYTICS QUERY RESULTS
// =====================================

export interface DashboardStatsQueryResult {
  total_users: number;
  total_providers: number;
  total_clients: number;
  total_services: number;
  active_services: number;
  total_bookings: number;
  pending_bookings: number;
  completed_bookings: number;
  total_payments: number;
  total_revenue: number;
  this_month_revenue: number;
  average_service_price: number;
}

export interface UserActivityQueryResult {
  user_id: number;
  action: string;
  resource_type: string;
  resource_id: number | null;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface SearchQueryResult {
  services: ServiceWithDetailsQueryResult[];
  total_count: number;
  facets: {
    categories: { name: string; count: number }[];
    price_ranges: { range: string; count: number }[];
    locations: { location: string; count: number }[];
    ratings: { rating: number; count: number }[];
  };
}

// =====================================
// MIGRATION AND SCHEMA TYPES
// =====================================

export interface MigrationRecord {
  id: number;
  name: string;
  executed_at: string;
  execution_time_ms: number;
  checksum: string;
}

export interface SchemaVersion {
  version: string;
  description: string;
  applied_at: string;
}

export interface TableInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  foreign_table: string | null;
  foreign_column: string | null;
}

// =====================================
// ERROR HANDLING TYPES
// =====================================

export interface DatabaseError extends Error {
  code?: string;
  detail?: string;
  hint?: string;
  position?: string;
  internalPosition?: string;
  internalQuery?: string;
  where?: string;
  schema?: string;
  table?: string;
  column?: string;
  dataType?: string;
  constraint?: string;
  file?: string;
  line?: string;
  routine?: string;
  severity?: string;
}

export interface QueryExecutionPlan {
  query: string;
  params: any[];
  execution_time_ms: number;
  rows_returned: number;
  plan_summary: string;
  warnings: string[];
}

// =====================================
// PAGINATION TYPES
// =====================================

export interface PaginationOptions {
  page: number;
  limit: number;
  offset?: number;
  sort_by?: string;
  sort_direction?: 'ASC' | 'DESC';
}

export interface PaginatedQueryResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}