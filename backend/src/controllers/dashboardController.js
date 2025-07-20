const { query } = require('../config/database');

// GET /api/dashboard/explorer-stats
exports.getExplorerStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get basic stats for explorer
    const stats = await query(`
      SELECT 
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed') as completed_bookings,
        COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'pending') as pending_bookings,
        COUNT(DISTINCT r.id) as total_reviews_given,
        COALESCE(AVG(r.rating), 0) as average_rating_given
      FROM users u
      LEFT JOIN bookings b ON u.id = b.client_id
      LEFT JOIN reviews r ON u.id = r.reviewer_id
      WHERE u.id = $1
      GROUP BY u.id
    `, [userId]);

    // Get recent activity
    const recentBookings = await query(`
      SELECT 
        b.id,
        b.status,
        b.scheduled_date,
        b.total_amount,
        s.title as service_title,
        u.first_name || ' ' || u.last_name as provider_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.provider_id = u.id
      WHERE b.client_id = $1
      ORDER BY b.created_at DESC
      LIMIT 5
    `, [userId]);

    const result = stats.rows[0] || {
      total_bookings: 0,
      completed_bookings: 0,
      pending_bookings: 0,
      total_reviews_given: 0,
      average_rating_given: 0
    };

    res.json({
      success: true,
      data: {
        stats: {
          total_bookings: parseInt(result.total_bookings) || 0,
          completed_bookings: parseInt(result.completed_bookings) || 0,
          pending_bookings: parseInt(result.pending_bookings) || 0,
          total_reviews_given: parseInt(result.total_reviews_given) || 0,
          average_rating_given: parseFloat(result.average_rating_given) || 0
        },
        recent_bookings: recentBookings.rows || []
      }
    });

  } catch (error) {
    console.error('Explorer stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas del explorador'
    });
  }
};

// GET /api/dashboard/provider-stats
exports.getProviderStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get provider stats
    const stats = await query(`
      SELECT 
        COUNT(DISTINCT s.id) as total_services,
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed') as completed_bookings,
        COUNT(DISTINCT r.id) as total_reviews,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.status = 'completed'), 0) as total_earnings
      FROM users u
      LEFT JOIN services s ON u.id = s.provider_id AND s.is_active = true
      LEFT JOIN bookings b ON u.id = b.provider_id
      LEFT JOIN reviews r ON u.id = r.provider_id
      WHERE u.id = $1
      GROUP BY u.id
    `, [userId]);

    // Get recent bookings
    const recentBookings = await query(`
      SELECT 
        b.id,
        b.status,
        b.scheduled_date,
        b.total_amount,
        s.title as service_title,
        u.first_name || ' ' || u.last_name as client_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.client_id = u.id
      WHERE b.provider_id = $1
      ORDER BY b.created_at DESC
      LIMIT 5
    `, [userId]);

    // Get popular services
    const popularServices = await query(`
      SELECT 
        s.id,
        s.title,
        s.base_price,
        COUNT(b.id) as booking_count,
        COALESCE(AVG(r.rating), 0) as average_rating
      FROM services s
      LEFT JOIN bookings b ON s.id = b.service_id
      LEFT JOIN reviews r ON s.id = r.booking_id
      WHERE s.provider_id = $1 AND s.is_active = true
      GROUP BY s.id, s.title, s.base_price
      ORDER BY booking_count DESC
      LIMIT 3
    `, [userId]);

    const result = stats.rows[0] || {
      total_services: 0,
      total_bookings: 0,
      completed_bookings: 0,
      total_reviews: 0,
      average_rating: 0,
      total_earnings: 0
    };

    res.json({
      success: true,
      data: {
        stats: {
          total_services: parseInt(result.total_services) || 0,
          total_bookings: parseInt(result.total_bookings) || 0,
          completed_bookings: parseInt(result.completed_bookings) || 0,
          total_reviews: parseInt(result.total_reviews) || 0,
          average_rating: parseFloat(result.average_rating) || 0,
          total_earnings: parseFloat(result.total_earnings) || 0
        },
        recent_bookings: recentBookings.rows || [],
        popular_services: popularServices.rows || []
      }
    });

  } catch (error) {
    console.error('Provider stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas del proveedor'
    });
  }
};

// GET /api/dashboard/general-stats
exports.getGeneralStats = async (req, res) => {
  try {
    // OPTIMIZED: Cache dashboard stats (5min TTL) - expensive aggregation queries
    const { getCachedDashboardStats } = require('../utils/cache');
    
    const platformStatsData = await getCachedDashboardStats(async () => {
      // CRITICAL FIX: Replace cartesian product with independent efficient queries
      // Previous query caused exponential performance degradation (users × services × bookings × reviews)
      const platformStats = await query(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE user_type = 'client' AND is_active = true) as total_clients,
          (SELECT COUNT(*) FROM users WHERE user_type = 'provider' AND is_active = true) as total_providers,
          (SELECT COUNT(*) FROM services WHERE is_active = true) as total_services,
          (SELECT COUNT(*) FROM bookings) as total_bookings,
          (SELECT COALESCE(ROUND(AVG(rating), 2), 0) FROM reviews) as platform_rating
      `);
      return platformStats.rows[0];
    });

    const result = platformStatsData || {
      total_clients: 0,
      total_providers: 0,
      total_services: 0,
      total_bookings: 0,
      platform_rating: 0
    };

    res.json({
      success: true,
      data: {
        total_clients: parseInt(result.total_clients) || 0,
        total_providers: parseInt(result.total_providers) || 0,
        total_services: parseInt(result.total_services) || 0,
        total_bookings: parseInt(result.total_bookings) || 0,
        platform_rating: parseFloat(result.platform_rating) || 0
      }
    });

  } catch (error) {
    console.error('General stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas generales'
    });
  }
};