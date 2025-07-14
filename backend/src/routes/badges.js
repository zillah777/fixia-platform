const express = require('express');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { requireProvider } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');

const router = express.Router();

// GET /api/badges/available - Get all available badges
router.get('/available', async (req, res) => {
  try {
    const { category } = req.query;

    let query = 'SELECT * FROM badges WHERE is_active = TRUE';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY category, sort_order';

    const [badges] = await pool.execute(query, params);

    // Group badges by category
    const groupedBadges = badges.reduce((acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      
      acc[badge.category].push({
        ...badge,
        criteria: JSON.parse(badge.criteria)
      });
      
      return acc;
    }, {});

    res.json(formatResponse({
      badges: groupedBadges,
      total: badges.length
    }, 'Badges disponibles obtenidos exitosamente'));

  } catch (error) {
    console.error('Get available badges error:', error);
    res.status(500).json(formatError('Error al obtener badges disponibles'));
  }
});

// GET /api/badges/my-badges - Get current user's badges
router.get('/my-badges', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [badges] = await pool.execute(`
      SELECT b.*, ub.earned_at, ub.is_visible, ub.progress_data
      FROM user_badges ub
      INNER JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = ? AND ub.is_visible = TRUE
      ORDER BY ub.earned_at DESC
    `, [req.user.id]);

    const processedBadges = badges.map(badge => ({
      ...badge,
      criteria: JSON.parse(badge.criteria),
      progress_data: badge.progress_data ? JSON.parse(badge.progress_data) : null
    }));

    res.json(formatResponse({
      badges: processedBadges,
      total: badges.length
    }, 'Mis badges obtenidos exitosamente'));

  } catch (error) {
    console.error('Get my badges error:', error);
    res.status(500).json(formatError('Error al obtener mis badges'));
  }
});

// GET /api/badges/progress - Get badge progress for current user
router.get('/progress', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [progress] = await pool.execute(`
      SELECT b.*, bp.current_progress, bp.target_progress, bp.progress_data, bp.last_updated,
             CASE WHEN ub.id IS NOT NULL THEN TRUE ELSE FALSE END as is_earned
      FROM badges b
      LEFT JOIN badge_progress bp ON b.id = bp.badge_id AND bp.user_id = ?
      LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = ?
      WHERE b.is_active = TRUE
      ORDER BY b.category, b.sort_order
    `, [req.user.id, req.user.id]);

    const progressData = progress.map(item => ({
      ...item,
      criteria: JSON.parse(item.criteria),
      progress_data: item.progress_data ? JSON.parse(item.progress_data) : null,
      progress_percentage: item.target_progress > 0 ? 
        Math.min(100, Math.round((item.current_progress / item.target_progress) * 100)) : 0
    }));

    // Group by category
    const groupedProgress = progressData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json(formatResponse({
      progress: groupedProgress,
      summary: {
        total_badges: progress.length,
        earned_badges: progress.filter(p => p.is_earned).length,
        in_progress: progress.filter(p => !p.is_earned && p.current_progress > 0).length
      }
    }, 'Progreso de badges obtenido exitosamente'));

  } catch (error) {
    console.error('Get badge progress error:', error);
    res.status(500).json(formatError('Error al obtener progreso de badges'));
  }
});

// GET /api/badges/user/:id - Get badges for a specific user (public)
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [badges] = await pool.execute(`
      SELECT b.name, b.slug, b.description, b.icon, b.color, b.category, ub.earned_at
      FROM user_badges ub
      INNER JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = ? AND ub.is_visible = TRUE AND b.is_active = TRUE
      ORDER BY b.category, ub.earned_at DESC
    `, [id]);

    // Group by category
    const groupedBadges = badges.reduce((acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push(badge);
      return acc;
    }, {});

    res.json(formatResponse({
      badges: groupedBadges,
      total: badges.length
    }, 'Badges del usuario obtenidos exitosamente'));

  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json(formatError('Error al obtener badges del usuario'));
  }
});

// POST /api/badges/check-eligibility - Check and award eligible badges
router.post('/check-eligibility', authMiddleware, requireProvider, async (req, res) => {
  try {
    const newBadges = await checkAndAwardBadges(req.user.id);

    res.json(formatResponse({
      new_badges: newBadges,
      count: newBadges.length
    }, newBadges.length > 0 ? 
      `¡Felicitaciones! Has obtenido ${newBadges.length} nuevo(s) badge(s)` : 
      'No hay nuevos badges disponibles en este momento'
    ));

  } catch (error) {
    console.error('Check badge eligibility error:', error);
    res.status(500).json(formatError('Error al verificar elegibilidad de badges'));
  }
});

// PUT /api/badges/:id/visibility - Toggle badge visibility
router.put('/:id/visibility', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_visible } = req.body;

    // Check if user owns this badge
    const [badge] = await pool.execute(
      'SELECT id FROM user_badges WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (badge.length === 0) {
      return res.status(404).json(formatError('Badge no encontrado'));
    }

    await pool.execute(
      'UPDATE user_badges SET is_visible = ? WHERE id = ?',
      [is_visible, id]
    );

    res.json(formatResponse(null, 'Visibilidad del badge actualizada exitosamente'));

  } catch (error) {
    console.error('Update badge visibility error:', error);
    res.status(500).json(formatError('Error al actualizar visibilidad del badge'));
  }
});

// GET /api/badges/categories - Get badge categories
router.get('/categories', (req, res) => {
  const categories = [
    {
      value: 'verification',
      label: 'Verificación',
      description: 'Badges relacionados con la verificación de identidad y perfil',
      icon: '✅'
    },
    {
      value: 'experience',
      label: 'Experiencia',
      description: 'Badges basados en tiempo y experiencia en la plataforma',
      icon: '📅'
    },
    {
      value: 'performance',
      label: 'Rendimiento',
      description: 'Badges por excelente desempeño y calidad de servicio',
      icon: '⭐'
    },
    {
      value: 'milestone',
      label: 'Hitos',
      description: 'Badges por alcanzar metas específicas de servicios',
      icon: '🎯'
    },
    {
      value: 'special',
      label: 'Especiales',
      description: 'Badges exclusivos y reconocimientos especiales',
      icon: '👑'
    }
  ];

  res.json(formatResponse(categories, 'Categorías de badges obtenidas exitosamente'));
});

// Helper function to check and award badges
const checkAndAwardBadges = async (userId) => {
  try {
    const newBadges = [];

    // Get user data
    const [users] = await pool.execute(`
      SELECT u.*, upi.years_experience,
             DATEDIFF(NOW(), u.created_at) as account_age_days
      FROM users u
      LEFT JOIN user_professional_info upi ON u.id = upi.user_id
      WHERE u.id = ?
    `, [userId]);

    if (users.length === 0) return newBadges;

    const user = users[0];

    // Get user stats
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
        COUNT(DISTINCT b.id) as total_bookings,
        AVG(r.rating) as average_rating,
        COUNT(DISTINCT r.id) as total_reviews
      FROM users u
      LEFT JOIN bookings b ON u.id = b.provider_id
      LEFT JOIN reviews r ON u.id = r.provider_id
      WHERE u.id = ?
    `, [userId]);

    const userStats = stats[0];

    // Get all available badges that user doesn't have
    const [availableBadges] = await pool.execute(`
      SELECT b.*
      FROM badges b
      WHERE b.is_active = TRUE
        AND b.id NOT IN (
          SELECT ub.badge_id 
          FROM user_badges ub 
          WHERE ub.user_id = ?
        )
    `, [userId]);

    // Check each badge criteria
    for (const badge of availableBadges) {
      const criteria = JSON.parse(badge.criteria);
      let eligible = false;

      switch (criteria.type) {
        case 'verification_status':
          eligible = user.verification_status === criteria.value;
          break;

        case 'profile_completion':
          eligible = user.profile_completion_percentage >= criteria.value;
          break;

        case 'account_age':
          if (criteria.min_days) {
            eligible = user.account_age_days >= criteria.min_days;
          } else if (criteria.max_days) {
            eligible = user.account_age_days <= criteria.max_days;
          }
          break;

        case 'completed_bookings':
          eligible = userStats.completed_bookings >= criteria.value;
          break;

        case 'average_rating':
          eligible = userStats.average_rating >= criteria.min_rating && 
                    userStats.total_reviews >= (criteria.min_reviews || 1);
          break;

        case 'subscription_type':
          eligible = user.subscription_type === criteria.value;
          break;

        case 'completion_rate':
          const completionRate = userStats.total_bookings > 0 ? 
            userStats.completed_bookings / userStats.total_bookings : 0;
          eligible = completionRate >= criteria.min_rate && 
                    userStats.total_bookings >= (criteria.min_bookings || 1);
          break;

        // Add more criteria types as needed
      }

      if (eligible) {
        try {
          // Award the badge
          await pool.execute(
            'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
            [userId, badge.id]
          );

          newBadges.push({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            color: badge.color,
            category: badge.category
          });
        } catch (error) {
          // Badge might already exist due to race condition, ignore
          console.log(`Badge ${badge.id} already exists for user ${userId}`);
        }
      }
    }

    return newBadges;

  } catch (error) {
    console.error('Error checking badge eligibility:', error);
    return [];
  }
};

module.exports = router;
module.exports.checkAndAwardBadges = checkAndAwardBadges;