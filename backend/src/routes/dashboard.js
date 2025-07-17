const express = require('express');
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

// GET /api/dashboard/explorer-stats
router.get('/explorer-stats', authMiddleware, cacheMiddleware(120), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get explorer statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT b.id) FILTER (WHERE b.status IN ('pending', 'confirmed', 'in_progress')) as active_bookings,
        COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed') as completed_bookings,
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.status = 'completed'), 0) as total_spent,
        0 as favorite_services,
        0 as unread_messages
      FROM users u
      LEFT JOIN bookings b ON u.id = b.client_id
      WHERE u.id = $1
      GROUP BY u.id
    `;

    const result = await query(statsQuery, [userId]);
    const stats = result.rows[0] || {
      active_bookings: 0,
      completed_bookings: 0,
      total_spent: 0,
      favorite_services: 0,
      unread_messages: 0
    };

    // Get recent bookings for activity feed
    const recentBookingsQuery = `
      SELECT 
        b.id,
        b.status,
        b.booking_date as scheduled_date,
        b.booking_time as scheduled_time,
        b.total_amount,
        COALESCE(s.title, 'Servicio') as service_title,
        COALESCE(u.first_name, 'Proveedor') as provider_name,
        COALESCE(u.last_name, '') as provider_last_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.provider_id = u.id
      WHERE b.client_id = $1
      ORDER BY b.created_at DESC
      LIMIT 5
    `;

    const recentBookings = await query(recentBookingsQuery, [userId]);

    res.json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: {
        stats: {
          activeBookings: parseInt(stats.active_bookings) || 0,
          completedBookings: parseInt(stats.completed_bookings) || 0,
          totalSpent: parseFloat(stats.total_spent) || 0,
          favoriteServices: parseInt(stats.favorite_services) || 0,
          unreadMessages: parseInt(stats.unread_messages) || 0
        },
        recentBookings: recentBookings.rows
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
              (CASE WHEN u.profile_photo_url IS NOT NULL THEN 20 ELSE 0 END) +
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
      GROUP BY u.id, u.profile_photo_url, u.about_me, u.phone, u.address
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