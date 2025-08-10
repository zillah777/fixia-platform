-- PHASE 2: COMPOSITE INDEXES FOR MARKETPLACE OPTIMIZATION
-- Creates optimized composite indexes for Fixia marketplace performance

-- Users: Search and filtering optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_type_location_active 
       ON users (user_type, latitude, longitude, is_active)
       WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_verification_type_active 
       ON users (verification_status, user_type, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active 
       ON users (email, is_active);
-- Services: Core marketplace search queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_category_location_active 
       ON services (category_id, latitude, longitude, is_active)
       WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_provider_active_featured 
       ON services (provider_id, is_active, is_featured)
       WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_rating_price_active 
       ON services (average_rating DESC, price ASC, is_active)
       WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_featured_rating 
       ON services (is_featured DESC, average_rating DESC, created_at DESC)
       WHERE is_active = true;
-- Bookings: Status and user management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_provider_status_date 
       ON bookings (provider_id, status, scheduled_date)
       WHERE status IN ('pending', 'confirmed', 'in_progress');
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_customer_status_date 
       ON bookings (customer_id, status, scheduled_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_payment_status_created 
       ON bookings (payment_status, status, created_at DESC)
       WHERE payment_status IN ('pending', 'paid');
-- Reviews: Rating calculations and displays
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_provider_rating_public 
       ON reviews (provider_id, rating, is_public, created_at DESC)
       WHERE is_public = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_service_rating_verified 
       ON reviews (service_id, rating, created_at DESC)
       WHERE is_public = true;
-- Messages/Chat: Real-time messaging optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_chat_created_read 
       ON messages (chat_id, created_at DESC, is_read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_recipient_unread 
       ON messages (chat_id, is_read, created_at DESC)
       WHERE is_read = false;
-- Notifications: User notification management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read_type_created 
       ON notifications (user_id, is_read, type, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread 
       ON notifications (user_id, created_at DESC)
       WHERE is_read = false;
-- Payments: Financial tracking and reconciliation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status_created_amount 
       ON payments (status, created_at DESC, amount)
       WHERE status IN ('pending', 'approved', 'failed');
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_booking_status 
       ON payments (booking_id, status, created_at DESC);
-- Full-text search indexes for marketplace
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_fulltext_search 
       ON services USING gin(to_tsvector('spanish', title || ' ' || description))
       WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_fulltext_search 
       ON users USING gin(to_tsvector('spanish', first_name || ' ' || last_name || ' ' || COALESCE(about_me, '')))
       WHERE is_active = true;

-- Composite indexes complete - marketplace performance optimized
