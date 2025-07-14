// AS Premium Features Types

export interface WorkLocation {
  id: number;
  user_id: number;
  locality: string;
  province: string;
  travel_radius: number;
  is_active: boolean;
  created_at: string;
}

export interface WorkCategory {
  id: number;
  user_id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  subcategory?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ASAvailability {
  id: number;
  user_id: number;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ASPricing {
  id: number;
  user_id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  service_type: 'hourly' | 'fixed' | 'negotiable';
  base_price: number;
  currency: string;
  minimum_hours: number;
  travel_cost: number;
  emergency_surcharge: number;
  is_negotiable: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  category_id?: number;
  category_name?: string;
  image_url?: string;
  project_date?: string;
  client_name?: string;
  project_value?: number;
  is_featured: boolean;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ASEducation {
  id: number;
  user_id: number;
  education_type: 'formal' | 'course' | 'certification' | 'workshop';
  institution_name: string;
  degree_title: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  certificate_image?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ValidationProgress {
  progress_percentage: number;
  items: ValidationItem[];
  completed_items: number;
  total_items: number;
}

export interface ValidationItem {
  name: string;
  completed: boolean;
  required: boolean;
  weight: number;
  count?: number;
}

export interface PrivacySettings {
  id: number;
  user_id: number;
  show_profile_photo: boolean;
  show_full_name: boolean;
  show_phone: boolean;
  show_whatsapp: boolean;
  show_email: boolean;
  show_address: boolean;
  show_exact_location: boolean;
  show_years_experience: boolean;
  show_education: boolean;
  show_certifications: boolean;
  show_portfolio: boolean;
  show_reviews: boolean;
  show_response_time: boolean;
  allow_direct_contact: boolean;
  allow_public_reviews: boolean;
  updated_at: string;
}

export interface NotificationSettings {
  id: number;
  user_id: number;
  email_new_requests: boolean;
  email_messages: boolean;
  email_reviews: boolean;
  email_payment_updates: boolean;
  email_marketing: boolean;
  push_new_requests: boolean;
  push_messages: boolean;
  push_reviews: boolean;
  push_reminders: boolean;
  push_marketing: boolean;
  sms_urgent_requests: boolean;
  sms_confirmations: boolean;
  notification_radius: number;
  quiet_hours_start: string;
  quiet_hours_end: string;
  updated_at: string;
}

export interface ServiceAnnouncement {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category_id: number;
  category_name: string;
  category_icon: string;
  subcategory?: string;
  service_type: 'hourly' | 'fixed' | 'negotiable';
  base_price?: number;
  currency: string;
  location_type: 'client_location' | 'my_location' | 'both';
  requires_materials: boolean;
  estimated_duration?: string;
  availability_note?: string;
  is_featured: boolean;
  is_active: boolean;
  views_count: number;
  inquiries_count: number;
  created_at: string;
  updated_at: string;
}

export interface ExplorerReport {
  id: number;
  reporter_id: number;
  reported_user_id: number;
  booking_id?: number;
  report_type: 'suspicious_behavior' | 'malicious_intent' | 'non_compliance' | 'fraud' | 'harassment' | 'other';
  description: string;
  evidence_urls: string[];
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  admin_notes?: string;
  resolution_date?: string;
  created_at: string;
  updated_at: string;
  // Additional fields from join
  first_name: string;
  last_name: string;
  email: string;
}

export interface ServiceRequest {
  id: number;
  client_id: number;
  provider_id: number;
  announcement_id?: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  title: string;
  description: string;
  location_address?: string;
  location_lat?: number;
  location_lng?: number;
  preferred_date?: string;
  preferred_time?: string;
  budget_min?: number;
  budget_max?: number;
  currency: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  provider_response?: string;
  response_date?: string;
  expiry_date: string;
  created_at: string;
  updated_at: string;
  // Additional fields from joins
  client_first_name: string;
  client_last_name: string;
  client_profile_image?: string;
  client_phone?: string;
  client_email?: string;
  client_member_since?: string;
  client_rating?: number;
  client_reviews_count?: number;
  client_completed_bookings?: number;
  client_recent_reviews?: ClientReview[];
}

export interface ClientReview {
  id: number;
  rating: number;
  comment?: string;
  provider_name: string;
  created_at: string;
}

export interface ASDashboard {
  pending_requests: number;
  active_announcements: number;
  monthly_bookings: number;
  average_rating?: string;
  total_reviews: number;
  recent_activity: DashboardActivity[];
}

export interface DashboardActivity {
  type: 'request' | 'booking' | 'review';
  created_at: string;
  description: string;
}

// API Response types
export interface ASPremiumApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Form data interfaces
export interface WorkLocationForm {
  locality: string;
  province: string;
  travel_radius: number;
}

export interface WorkCategoryForm {
  category_id: number;
  subcategory?: string;
  is_featured: boolean;
}

export interface AvailabilityForm {
  schedules: {
    day_of_week: string;
    start_time: string;
    end_time: string;
  }[];
}

export interface PricingForm {
  category_id: number;
  service_type: 'hourly' | 'fixed' | 'negotiable';
  base_price: number;
  minimum_hours: number;
  travel_cost: number;
  emergency_surcharge: number;
  is_negotiable: boolean;
}

export interface PortfolioForm {
  title: string;
  description?: string;
  category_id?: number;
  project_date?: string;
  client_name?: string;
  project_value?: number;
  is_featured: boolean;
  portfolio_image?: File;
}

export interface EducationForm {
  education_type: 'formal' | 'course' | 'certification' | 'workshop';
  institution_name: string;
  degree_title: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  certificate_image?: File;
}

export interface ServiceAnnouncementForm {
  title: string;
  description: string;
  category_id: number;
  subcategory?: string;
  service_type: 'hourly' | 'fixed' | 'negotiable';
  base_price?: number;
  location_type: 'client_location' | 'my_location' | 'both';
  requires_materials: boolean;
  estimated_duration?: string;
  availability_note?: string;
  is_featured: boolean;
}

export interface ExplorerReportForm {
  reported_user_id: number;
  booking_id?: number;
  report_type: 'suspicious_behavior' | 'malicious_intent' | 'non_compliance' | 'fraud' | 'harassment' | 'other';
  description: string;
  evidence_urls?: string[];
}

export interface ServiceRequestResponse {
  action: 'accept' | 'reject';
  response_message?: string;
}