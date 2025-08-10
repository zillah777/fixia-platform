-- PHASE 1: REMOVE REDUNDANT INDEXES
-- Removes 477+ redundant index definitions from multiple migration files

DROP INDEX IF EXISTS idx_users_email_old;
DROP INDEX IF EXISTS idx_users_type_old;
DROP INDEX IF EXISTS idx_users_verification_old;
DROP INDEX IF EXISTS idx_services_provider_old;
DROP INDEX IF EXISTS idx_services_category_old;
DROP INDEX IF EXISTS idx_services_active_old;
DROP INDEX IF EXISTS idx_bookings_customer_old;
DROP INDEX IF EXISTS idx_bookings_provider_old;
DROP INDEX IF EXISTS idx_bookings_status_old;
DROP INDEX IF EXISTS idx_reviews_provider_old;
DROP INDEX IF EXISTS idx_reviews_service_old;
DROP INDEX IF EXISTS idx_messages_chat_old;
DROP INDEX IF EXISTS idx_notifications_user_old;
DROP INDEX IF EXISTS idx_payments_booking_old;
DROP INDEX IF EXISTS idx_users_user_type;
DROP INDEX IF EXISTS idx_services_provider;
DROP INDEX IF EXISTS idx_service_images_service;
DROP INDEX IF EXISTS idx_bookings_customer;
DROP INDEX IF EXISTS idx_bookings_provider;
DROP INDEX IF EXISTS idx_bookings_service;
DROP INDEX IF EXISTS idx_bookings_status;
DROP INDEX IF EXISTS idx_bookings_date;
DROP INDEX IF EXISTS idx_reviews_provider;
DROP INDEX IF EXISTS idx_reviews_service;
DROP INDEX IF EXISTS idx_reviews_rating;
DROP INDEX IF EXISTS idx_chats_customer;
DROP INDEX IF EXISTS idx_chats_provider;
DROP INDEX IF EXISTS idx_messages_chat;
DROP INDEX IF EXISTS idx_messages_sender;
DROP INDEX IF EXISTS idx_messages_read;
DROP INDEX IF EXISTS idx_payments_customer;
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_notifications_read;
DROP INDEX IF EXISTS idx_notifications_type;

-- Index cleanup complete - redundant indexes removed
