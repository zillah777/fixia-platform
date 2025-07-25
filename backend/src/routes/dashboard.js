const express = require('express');
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

// GET /api/dashboard/explorer-stats
router.get('/explorer-stats', authMiddleware, cacheMiddleware(120), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get explorer statistics from real Fixia tables (PostgreSQL syntax)
    const statsQuery = `
      SELECT 
        COALESCE(COUNT(DISTINCT esr.id) FILTER (WHERE esr.status = 'active'), 0) as active_service_requests,
        COALESCE(COUNT(DISTINCT eac.id) FILTER (WHERE eac.status = 'service_in_progress'), 0) as active_connections,
        COALESCE(COUNT(DISTINCT eac.id) FILTER (WHERE eac.status = 'completed'), 0) as completed_services,
        COALESCE(SUM(eac.final_agreed_price) FILTER (WHERE eac.status = 'completed'), 0) as total_spent,
        COALESCE(COUNT(DISTINCT esr.id), 0) as total_requests,
        COALESCE((
          SELECT COUNT(*) 
          FROM chat_messages cm 
          INNER JOIN explorer_as_connections eac2 ON cm.chat_room_id = eac2.chat_room_id 
          WHERE eac2.explorer_id = $1 AND cm.is_read = false AND cm.sender_id != $1
        ), 0) as unread_messages
      FROM users u
      LEFT JOIN explorer_service_requests esr ON u.id = esr.explorer_id
      LEFT JOIN explorer_as_connections eac ON u.id = eac.explorer_id
      WHERE u.id = $1
    `;

    const result = await query(statsQuery, [userId]);
    const stats = result.rows[0] || {
      active_service_requests: 0,
      active_connections: 0,
      completed_services: 0,
      total_spent: 0,
      total_requests: 0,
      unread_messages: 0
    };

    // Get recent activity from real Fixia data (PostgreSQL syntax)
    const recentActivityQuery = `
      SELECT 
        'service_request' as activity_type,
        esr.id,
        esr.title as service_title,
        esr.status,
        esr.created_at,
        esr.urgency,
        c.name as category_name,
        (SELECT COUNT(*) FROM as_service_interests asi WHERE asi.request_id = esr.id) as interest_count
      FROM explorer_service_requests esr
      LEFT JOIN categories c ON esr.category_id = c.id
      WHERE esr.explorer_id = $1
      
      UNION ALL
      
      SELECT 
        'connection' as activity_type,
        eac.id,
        CONCAT('Conexión con ', u.first_name, ' ', u.last_name) as service_title,
        eac.status,
        eac.created_at,
        'medium' as urgency,
        'Conexión AS' as category_name,
        0 as interest_count
      FROM explorer_as_connections eac
      LEFT JOIN users u ON eac.as_id = u.id
      WHERE eac.explorer_id = $1
      
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const recentActivity = await query(recentActivityQuery, [userId]);

    res.json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: {
        stats: {
          activeBookings: parseInt(stats.active_service_requests) + parseInt(stats.active_connections) || 0,
          completedBookings: parseInt(stats.completed_services) || 0,
          totalSpent: parseFloat(stats.total_spent) || 0,
          favoriteServices: parseInt(stats.total_requests) || 0,
          unreadMessages: parseInt(stats.unread_messages) || 0
        },
        recentActivity: recentActivity.rows,
        recentBookings: recentActivity.rows // Keep for compatibility
      }
    });

  } catch (error) {
    console.error('Get explorer stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/dashboard/as-stats
router.get('/as-stats', authMiddleware, cacheMiddleware(120), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get AS statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT s.id) as total_services,
        COUNT(DISTINCT s.id) FILTER (WHERE s.is_active = true) as active_services,
        COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'pending') as pending_requests,
        COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed') as completed_bookings,
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.status = 'completed'), 0) as total_earnings,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as total_reviews,
        CASE 
          WHEN COUNT(DISTINCT s.id) > 0 THEN 
            LEAST(100, 
              (CASE WHEN u.profile_image IS NOT NULL THEN 20 ELSE 0 END) +
              (CASE WHEN u.about_me IS NOT NULL THEN 20 ELSE 0 END) +
              (CASE WHEN u.phone IS NOT NULL THEN 20 ELSE 0 END) +
              (CASE WHEN u.address IS NOT NULL THEN 20 ELSE 0 END) +
              (CASE WHEN COUNT(DISTINCT s.id) >= 3 THEN 20 ELSE 0 END)
            )
          ELSE 0
        END as profile_completion
      FROM users u
      LEFT JOIN services s ON u.id = s.provider_id
      LEFT JOIN bookings b ON u.id = b.provider_id
      LEFT JOIN reviews r ON u.id = r.provider_id
      WHERE u.id = $1
      GROUP BY u.id, u.profile_image, u.about_me, u.phone, u.address
    `;

    const result = await query(statsQuery, [userId]);
    const stats = result.rows[0] || {
      total_services: 0,
      active_services: 0,
      pending_requests: 0,
      completed_bookings: 0,
      total_earnings: 0,
      average_rating: 0,
      total_reviews: 0,
      profile_completion: 0
    };

    res.json({
      success: true,
      message: 'Estadísticas AS obtenidas exitosamente',
      data: {
        stats: {
          total_services: parseInt(stats.total_services) || 0,
          active_services: parseInt(stats.active_services) || 0,
          pending_requests: parseInt(stats.pending_requests) || 0,
          completed_bookings: parseInt(stats.completed_bookings) || 0,
          total_earnings: parseFloat(stats.total_earnings) || 0,
          average_rating: parseFloat(stats.average_rating) || 0,
          total_reviews: parseInt(stats.total_reviews) || 0,
          profile_completion: parseInt(stats.profile_completion) || 0
        }
      }
    });

  } catch (error) {
    console.error('Get AS stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;