/**
 * SUBSCRIPTION SYSTEM TYPE DEFINITIONS
 * TypeScript interfaces for subscription middleware and related operations
 */

export interface SubscriptionPlan {
  id: number;
  plan_type: 'free' | 'basic' | 'professional' | 'premium' | 'plus';
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: string[];
  max_services: number;
  max_bookings_per_month: number;
  priority_support: boolean;
  featured_listings: boolean;
  analytics_access: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  plan_type: 'free' | 'basic' | 'professional' | 'premium' | 'plus';
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'suspended';
  started_at: string;
  expires_at: string | null;
  auto_renew: boolean;
  payment_method?: string;
  last_payment_date?: string;
  next_billing_date?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionFeature {
  id: number;
  plan_type: string;
  feature_name: string;
  feature_value: string | number | boolean;
  description: string;
  is_active: boolean;
}

export interface SubscriptionUsage {
  user_id: number;
  plan_type: string;
  services_count: number;
  bookings_this_month: number;
  featured_listings_used: number;
  storage_used_mb: number;
  api_calls_today: number;
  last_calculated: string;
}

export interface SubscriptionLimits {
  max_services: number;
  max_bookings_per_month: number;
  max_featured_listings: number;
  max_storage_mb: number;
  max_api_calls_per_day: number;
  priority_support: boolean;
  analytics_access: boolean;
  custom_branding: boolean;
}

export interface SubscriptionUpgradeRequest {
  user_id: number;
  current_plan: string;
  target_plan: string;
  payment_method: string;
  billing_cycle: 'monthly' | 'yearly';
  auto_renew: boolean;
  coupon_code?: string;
}

export interface SubscriptionDowngradeRequest {
  user_id: number;
  current_plan: string;
  target_plan: string;
  reason: string;
  downgrade_at: 'immediately' | 'billing_cycle_end';
}

// Request/Response interfaces for middleware
export interface SubscriptionMiddlewareRequest extends Request {
  user: {
    id: number;
    user_type: string;
    subscription?: UserSubscription;
  };
  subscription?: {
    plan: SubscriptionPlan;
    usage: SubscriptionUsage;
    limits: SubscriptionLimits;
  };
}

export interface SubscriptionCheckResult {
  allowed: boolean;
  reason?: string;
  current_usage?: number;
  limit?: number;
  upgrade_required?: boolean;
  suggested_plan?: string;
}

export interface SubscriptionValidationOptions {
  action: 'create_service' | 'book_service' | 'feature_listing' | 'access_analytics' | 'api_call';
  resource_count?: number;
  required_feature?: string;
}

// Database query result types for subscriptions
export interface SubscriptionQueryResult {
  user_id: number;
  plan_type: string;
  status: string;
  started_at: Date;
  expires_at: Date | null;
  auto_renew: boolean;
  features: string[];
  limits: SubscriptionLimits;
  usage: SubscriptionUsage;
}

export interface SubscriptionMetrics {
  total_subscribers: number;
  active_subscriptions: number;
  plan_distribution: {
    [planType: string]: number;
  };
  monthly_revenue: number;
  churn_rate: number;
  upgrade_conversion_rate: number;
}

export interface SubscriptionNotification {
  type: 'expiry_warning' | 'payment_failed' | 'upgrade_available' | 'limit_exceeded';
  user_id: number;
  plan_type: string;
  message: string;
  action_required: boolean;
  action_url?: string;
  expires_at?: string;
}