-- PHASE 4: OPTIMIZED FUNCTIONS FOR COMPLEX QUERIES
-- Creates reusable functions for complex marketplace operations

-- Location-based service search function
CREATE OR REPLACE FUNCTION search_services_by_location(
    search_lat DECIMAL(10,8),
    search_lng DECIMAL(11,8),
    search_radius_km INTEGER DEFAULT 10,
    search_category INTEGER DEFAULT NULL,
    min_rating DECIMAL(3,2) DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    service_id INTEGER,
    title VARCHAR(200),
    description TEXT,
    price DECIMAL(10,2),
    provider_name TEXT,
    provider_verification VARCHAR(20),
    average_rating DECIMAL(3,2),
    total_reviews INTEGER,
    distance_km DECIMAL(8,2),
    is_featured BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as service_id,
        s.title,
        s.description,
        s.price,
        s.provider_name,
        s.provider_verification,
        s.average_rating,
        s.total_reviews,
        ROUND(
            CAST(
                6371 * acos(
                    cos(radians(search_lat)) * cos(radians(s.latitude)) * 
                    cos(radians(s.longitude) - radians(search_lng)) + 
                    sin(radians(search_lat)) * sin(radians(s.latitude))
                ) AS DECIMAL(8,2)
            ), 2
        ) as distance_km,
        s.is_featured
    FROM services_search_optimized s
    WHERE s.latitude IS NOT NULL 
    AND s.longitude IS NOT NULL
    AND (search_category IS NULL OR s.category_id = search_category)
    AND (min_rating IS NULL OR s.average_rating >= min_rating)
    AND (
        6371 * acos(
            cos(radians(search_lat)) * cos(radians(s.latitude)) * 
            cos(radians(s.longitude) - radians(search_lng)) + 
            sin(radians(search_lat)) * sin(radians(s.latitude))
        )
    ) <= search_radius_km
    ORDER BY s.is_featured DESC, distance_km ASC, s.average_rating DESC
    LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- User dashboard data function
CREATE OR REPLACE FUNCTION get_user_dashboard_data(target_user_id INTEGER, target_user_type VARCHAR(20))
RETURNS TABLE(
    user_info JSON,
    statistics JSON,
    recent_activity JSON
) AS $$
DECLARE
    user_data JSON;
    stats_data JSON;
    activity_data JSON;
BEGIN
    -- Get user information
    SELECT to_json(u.*) INTO user_data
    FROM user_stats_comprehensive u
    WHERE u.user_id = target_user_id;
    
    -- Get type-specific statistics
    IF target_user_type = 'provider' THEN
        SELECT json_build_object(
            'total_services', total_services,
            'active_services', active_services,
            'average_rating', average_rating,
            'total_reviews', total_reviews,
            'completed_bookings', completed_bookings,
            'total_earnings', total_earnings
        ) INTO stats_data
        FROM user_stats_comprehensive
        WHERE user_id = target_user_id;
    ELSE
        SELECT json_build_object(
            'total_bookings', total_bookings,
            'completed_bookings', completed_bookings,
            'pending_bookings', pending_bookings
        ) INTO stats_data
        FROM user_stats_comprehensive  
        WHERE user_id = target_user_id;
    END IF;
    
    -- Get recent activity (last 30 days)
    SELECT json_agg(
        json_build_object(
            'type', 'booking',
            'date', b.created_at,
            'service_title', s.title,
            'status', b.status,
            'amount', b.total_amount
        )
    ) INTO activity_data
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE (b.customer_id = target_user_id OR b.provider_id = target_user_id)
    AND b.created_at >= CURRENT_DATE - INTERVAL '30 days'
    ORDER BY b.created_at DESC
    LIMIT 10;
    
    RETURN QUERY SELECT user_data, stats_data, activity_data;
END;
$$ LANGUAGE plpgsql;

-- Marketplace analytics function
CREATE OR REPLACE FUNCTION get_marketplace_analytics(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
    total_users INTEGER,
    active_providers INTEGER,
    total_services INTEGER,
    total_bookings INTEGER,
    completed_bookings INTEGER,
    average_rating DECIMAL(3,2),
    total_revenue DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM users WHERE is_active = true) as total_users,
        (SELECT COUNT(*)::INTEGER FROM users WHERE user_type = 'provider' AND is_active = true) as active_providers,
        (SELECT COUNT(*)::INTEGER FROM services WHERE is_active = true) as total_services,
        (SELECT COUNT(*)::INTEGER FROM bookings WHERE created_at >= CURRENT_DATE - days_back * INTERVAL '1 day') as total_bookings,
        (SELECT COUNT(*)::INTEGER FROM bookings WHERE status = 'completed' AND created_at >= CURRENT_DATE - days_back * INTERVAL '1 day') as completed_bookings,
        (SELECT AVG(rating) FROM reviews WHERE created_at >= CURRENT_DATE - days_back * INTERVAL '1 day') as average_rating,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'approved' AND created_at >= CURRENT_DATE - days_back * INTERVAL '1 day') as total_revenue;
END;
$$ LANGUAGE plpgsql;

-- Optimized functions complete - complex query consolidation achieved
