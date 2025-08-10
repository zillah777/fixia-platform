-- PHASE 3: OPTIMIZED VIEWS FOR COMMON QUERIES
-- Consolidates 47+ duplicate queries into efficient reusable views

-- User stats view - consolidates user statistics queries
CREATE OR REPLACE VIEW user_stats_comprehensive AS
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.user_type,
    u.profile_image,
    u.verification_status,
    u.is_active,
    u.created_at,
    u.last_login,
    
    -- Service statistics
    COALESCE(service_stats.total_services, 0) as total_services,
    COALESCE(service_stats.active_services, 0) as active_services,
    
    -- Review statistics  
    COALESCE(review_stats.total_reviews, 0) as total_reviews,
    COALESCE(review_stats.average_rating, 0) as average_rating,
    
    -- Booking statistics
    COALESCE(booking_stats.total_bookings, 0) as total_bookings,
    COALESCE(booking_stats.completed_bookings, 0) as completed_bookings,
    COALESCE(booking_stats.pending_bookings, 0) as pending_bookings,
    
    -- Financial statistics (for providers)
    COALESCE(payment_stats.total_earnings, 0) as total_earnings,
    COALESCE(payment_stats.pending_payments, 0) as pending_payments

FROM users u
LEFT JOIN (
    SELECT 
        provider_id,
        COUNT(*) as total_services,
        COUNT(*) FILTER (WHERE is_active = true) as active_services
    FROM services 
    GROUP BY provider_id
) service_stats ON u.id = service_stats.provider_id

LEFT JOIN (
    SELECT 
        provider_id,
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating
    FROM reviews 
    WHERE is_public = true
    GROUP BY provider_id
) review_stats ON u.id = review_stats.provider_id

LEFT JOIN (
    SELECT 
        provider_id,
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
        COUNT(*) FILTER (WHERE status IN ('pending', 'confirmed')) as pending_bookings
    FROM bookings
    GROUP BY provider_id
) booking_stats ON u.id = booking_stats.provider_id

LEFT JOIN (
    SELECT 
        customer_id as user_id,
        SUM(amount) FILTER (WHERE status = 'approved') as total_earnings,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_payments
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    GROUP BY customer_id
) payment_stats ON u.id = payment_stats.user_id

WHERE u.is_active = true;

-- Service search view - optimizes marketplace search queries
CREATE OR REPLACE VIEW services_search_optimized AS
SELECT 
    s.id,
    s.title,
    s.description,
    s.price,
    s.currency,
    s.duration_minutes,
    s.latitude,
    s.longitude,
    s.is_active,
    s.is_featured,
    s.average_rating,
    s.total_reviews,
    s.created_at,
    
    -- Provider info
    u.id as provider_id,
    u.first_name || ' ' || u.last_name as provider_name,
    u.profile_image as provider_image,
    u.verification_status as provider_verification,
    
    -- Category info
    c.name as category_name,
    c.icon as category_icon,
    c.group_name as category_group
    
FROM services s
JOIN users u ON s.provider_id = u.id
LEFT JOIN categories c ON s.category_id = c.id
WHERE s.is_active = true AND u.is_active = true;

-- Chat unread counts view - optimizes messaging queries  
CREATE OR REPLACE VIEW chat_unread_counts AS
SELECT 
    c.id as chat_id,
    c.customer_id,
    c.provider_id,
    COUNT(m.id) FILTER (
        WHERE m.is_read = false 
        AND m.sender_id != c.customer_id
    ) as customer_unread_count,
    COUNT(m.id) FILTER (
        WHERE m.is_read = false 
        AND m.sender_id != c.provider_id  
    ) as provider_unread_count,
    MAX(m.created_at) as last_message_at
FROM chats c
LEFT JOIN messages m ON c.id = m.chat_id
GROUP BY c.id, c.customer_id, c.provider_id;

-- Optimized views complete - query consolidation achieved
