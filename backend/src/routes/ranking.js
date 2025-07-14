const express = require('express');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { requireProvider } = require('../middleware/auth');
const { formatResponse, formatError, paginate } = require('../utils/helpers');
const { 
  calculateProfessionalRanking, 
  getTopProfessionals, 
  getRankingFactors 
} = require('../utils/ranking');

const router = express.Router();

// GET /api/ranking/top-professionals - Get top ranked professionals
router.get('/top-professionals', async (req, res) => {
  try {
    const { 
      category, 
      location, 
      limit = 20,
      subscription_only = false 
    } = req.query;

    let professionals = await getTopProfessionals(
      parseInt(limit), 
      category, 
      location
    );

    // Filter by subscription if requested
    if (subscription_only === 'true') {
      professionals = professionals.filter(prof => 
        prof.subscription_type === 'premium' || prof.subscription_type === 'basic'
      );
    }

    // Add ranking indicators
    professionals = professionals.map((prof, index) => ({
      ...prof,
      ranking_position: index + 1,
      is_top_rated: index < 5,
      is_rising_star: prof.total_reviews < 10 && prof.average_rating >= 4.5,
      trust_score: calculateTrustScore(prof)
    }));

    res.json(formatResponse({
      professionals,
      filters: {
        category,
        location,
        subscription_only
      }
    }, 'Profesionales top obtenidos exitosamente'));

  } catch (error) {
    console.error('Get top professionals error:', error);
    res.status(500).json(formatError('Error al obtener profesionales top'));
  }
});

// GET /api/ranking/my-ranking - Get current user's ranking info
router.get('/my-ranking', authMiddleware, requireProvider, async (req, res) => {
  try {
    // Recalculate user's ranking
    const newScore = await calculateProfessionalRanking(req.user.id);

    // Get ranking factors
    const factors = await getRankingFactors(req.user.id);

    // Get position among competitors
    const [position] = await pool.execute(
      `SELECT COUNT(*) + 1 as position
       FROM users 
       WHERE user_type = 'provider' 
         AND is_active = TRUE 
         AND verification_score > ?`,
      [newScore]
    );

    // Get total professionals count
    const [total] = await pool.execute(
      'SELECT COUNT(*) as total FROM users WHERE user_type = "provider" AND is_active = TRUE'
    );

    // Get category-specific ranking if user has services
    const [categoryRanking] = await pool.execute(
      `SELECT s.category, COUNT(*) + 1 as category_position
       FROM services s
       INNER JOIN users u ON s.provider_id = u.id
       WHERE s.is_active = TRUE 
         AND u.user_type = 'provider' 
         AND u.is_active = TRUE
         AND u.verification_score > ?
         AND s.category IN (
           SELECT DISTINCT category 
           FROM services 
           WHERE provider_id = ? AND is_active = TRUE
         )
       GROUP BY s.category`,
      [newScore, req.user.id]
    );

    const ranking = {
      current_score: newScore,
      overall_position: position[0].position,
      total_professionals: total[0].total,
      percentile: Math.round((1 - (position[0].position - 1) / total[0].total) * 100),
      category_rankings: categoryRanking,
      factors: factors,
      tier: getRankingTier(newScore),
      next_tier_requirements: getNextTierRequirements(newScore)
    };

    res.json(formatResponse(ranking, 'Información de ranking obtenida exitosamente'));

  } catch (error) {
    console.error('Get my ranking error:', error);
    res.status(500).json(formatError('Error al obtener información de ranking'));
  }
});

// GET /api/ranking/leaderboard - Get leaderboard by category
router.get('/leaderboard', async (req, res) => {
  try {
    const { category, city, page = 1, limit = 10 } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    let query = `
      SELECT u.id, u.first_name, u.last_name, u.profile_photo_url,
             u.verification_score, u.verification_status, u.subscription_type,
             u.city, u.is_verified,
             AVG(r.rating) as average_rating,
             COUNT(DISTINCT r.id) as total_reviews,
             COUNT(DISTINCT b.id) as completed_bookings,
             upi.profession,
             ROW_NUMBER() OVER (ORDER BY u.verification_score DESC) as ranking_position
      FROM users u
      LEFT JOIN reviews r ON u.id = r.provider_id
      LEFT JOIN bookings b ON u.id = b.provider_id AND b.status = 'completed'
      LEFT JOIN user_professional_info upi ON u.id = upi.user_id
      WHERE u.user_type = 'provider' AND u.is_active = TRUE
    `;

    const params = [];

    if (category) {
      query += ` AND EXISTS (
        SELECT 1 FROM services s 
        WHERE s.provider_id = u.id AND s.category = ? AND s.is_active = TRUE
      )`;
      params.push(category);
    }

    if (city) {
      query += ` AND u.city LIKE ?`;
      params.push(`%${city}%`);
    }

    query += `
      GROUP BY u.id
      ORDER BY u.verification_score DESC, average_rating DESC
      LIMIT ? OFFSET ?
    `;

    params.push(queryLimit, offset);

    const [leaderboard] = await pool.execute(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      WHERE u.user_type = 'provider' AND u.is_active = TRUE
    `;

    const countParams = [];

    if (category) {
      countQuery += ` AND EXISTS (
        SELECT 1 FROM services s 
        WHERE s.provider_id = u.id AND s.category = ? AND s.is_active = TRUE
      )`;
      countParams.push(category);
    }

    if (city) {
      countQuery += ` AND u.city LIKE ?`;
      countParams.push(`%${city}%`);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    // Add tier information and format data
    const formattedLeaderboard = leaderboard.map((prof, index) => ({
      ...prof,
      average_rating: parseFloat(prof.average_rating) || 0,
      ranking_position: offset + index + 1,
      tier: getRankingTier(prof.verification_score),
      is_premium: prof.subscription_type === 'premium',
      trust_score: calculateTrustScore(prof)
    }));

    res.json(formatResponse({
      leaderboard: formattedLeaderboard,
      pagination: {
        page: parseInt(page),
        limit: queryLimit,
        total,
        pages: Math.ceil(total / queryLimit)
      },
      filters: { category, city }
    }, 'Leaderboard obtenido exitosamente'));

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json(formatError('Error al obtener leaderboard'));
  }
});

// POST /api/ranking/recalculate - Recalculate user's ranking (manual trigger)
router.post('/recalculate', authMiddleware, requireProvider, async (req, res) => {
  try {
    const newScore = await calculateProfessionalRanking(req.user.id);

    res.json(formatResponse({
      new_score: newScore,
      tier: getRankingTier(newScore)
    }, 'Ranking recalculado exitosamente'));

  } catch (error) {
    console.error('Recalculate ranking error:', error);
    res.status(500).json(formatError('Error al recalcular ranking'));
  }
});

// GET /api/ranking/trending - Get trending professionals (rising stars)
router.get('/trending', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;

    let query = `
      SELECT u.id, u.first_name, u.last_name, u.profile_photo_url,
             u.verification_score, u.verification_status, u.subscription_type,
             u.city, u.created_at,
             AVG(r.rating) as average_rating,
             COUNT(DISTINCT r.id) as total_reviews,
             COUNT(DISTINCT CASE WHEN r.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN r.id END) as recent_reviews,
             COUNT(DISTINCT b.id) as completed_bookings,
             upi.profession
      FROM users u
      LEFT JOIN reviews r ON u.id = r.provider_id
      LEFT JOIN bookings b ON u.id = b.provider_id AND b.status = 'completed'
      LEFT JOIN user_professional_info upi ON u.id = upi.user_id
      WHERE u.user_type = 'provider' 
        AND u.is_active = TRUE
        AND u.created_at > DATE_SUB(NOW(), INTERVAL 6 MONTH)
    `;

    const params = [];

    if (category) {
      query += ` AND EXISTS (
        SELECT 1 FROM services s 
        WHERE s.provider_id = u.id AND s.category = ? AND s.is_active = TRUE
      )`;
      params.push(category);
    }

    query += `
      GROUP BY u.id
      HAVING average_rating >= 4.5 AND recent_reviews >= 2
      ORDER BY 
        (recent_reviews * average_rating) DESC,
        u.verification_score DESC
      LIMIT ?
    `;

    params.push(parseInt(limit));

    const [trending] = await pool.execute(query, params);

    const formattedTrending = trending.map((prof, index) => ({
      ...prof,
      average_rating: parseFloat(prof.average_rating) || 0,
      trending_position: index + 1,
      momentum_score: (prof.recent_reviews * prof.average_rating),
      is_new: new Date(prof.created_at) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // New in last 90 days
      growth_indicator: 'Ascendente'
    }));

    res.json(formatResponse({
      trending_professionals: formattedTrending,
      filter: { category }
    }, 'Profesionales en tendencia obtenidos exitosamente'));

  } catch (error) {
    console.error('Get trending professionals error:', error);
    res.status(500).json(formatError('Error al obtener profesionales en tendencia'));
  }
});

// GET /api/ranking/statistics - Get overall ranking statistics
router.get('/statistics', async (req, res) => {
  try {
    // Get overall statistics
    const [totalStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_professionals,
        AVG(verification_score) as average_score,
        COUNT(CASE WHEN verification_score >= 80 THEN 1 END) as elite_count,
        COUNT(CASE WHEN verification_score >= 60 THEN 1 END) as expert_count,
        COUNT(CASE WHEN verification_score >= 40 THEN 1 END) as professional_count,
        COUNT(CASE WHEN subscription_type = 'premium' THEN 1 END) as premium_count,
        COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_count
      FROM users 
      WHERE user_type = 'provider' AND is_active = TRUE
    `);

    // Get category distribution
    const [categoryStats] = await pool.execute(`
      SELECT 
        s.category,
        COUNT(DISTINCT s.provider_id) as professional_count,
        AVG(u.verification_score) as average_score
      FROM services s
      INNER JOIN users u ON s.provider_id = u.id
      WHERE s.is_active = TRUE AND u.is_active = TRUE
      GROUP BY s.category
      ORDER BY professional_count DESC
    `);

    // Get city distribution
    const [cityStats] = await pool.execute(`
      SELECT 
        u.city,
        COUNT(*) as professional_count,
        AVG(u.verification_score) as average_score
      FROM users u
      WHERE u.user_type = 'provider' AND u.is_active = TRUE AND u.city IS NOT NULL
      GROUP BY u.city
      ORDER BY professional_count DESC
      LIMIT 10
    `);

    const statistics = {
      overview: {
        ...totalStats[0],
        average_score: parseFloat(totalStats[0].average_score).toFixed(1)
      },
      tier_distribution: {
        elite: totalStats[0].elite_count,
        expert: totalStats[0].expert_count,
        professional: totalStats[0].professional_count,
        starter: totalStats[0].total_professionals - totalStats[0].professional_count
      },
      category_breakdown: categoryStats.map(cat => ({
        ...cat,
        average_score: parseFloat(cat.average_score).toFixed(1)
      })),
      city_breakdown: cityStats.map(city => ({
        ...city,
        average_score: parseFloat(city.average_score).toFixed(1)
      }))
    };

    res.json(formatResponse(statistics, 'Estadísticas de ranking obtenidas exitosamente'));

  } catch (error) {
    console.error('Get ranking statistics error:', error);
    res.status(500).json(formatError('Error al obtener estadísticas de ranking'));
  }
});

// Helper functions
const getRankingTier = (score) => {
  if (score >= 80) return { name: 'Elite', color: '#FFD700', icon: '👑' };
  if (score >= 60) return { name: 'Experto', color: '#C0C0C0', icon: '⭐' };
  if (score >= 40) return { name: 'Profesional', color: '#CD7F32', icon: '🔥' };
  return { name: 'Iniciante', color: '#87CEEB', icon: '🌟' };
};

const getNextTierRequirements = (currentScore) => {
  if (currentScore >= 80) return null; // Already at top tier
  
  const nextTier = currentScore >= 60 ? 80 : currentScore >= 40 ? 60 : 40;
  const pointsNeeded = nextTier - currentScore;
  
  return {
    next_tier: getRankingTier(nextTier).name,
    points_needed: pointsNeeded,
    suggestions: getImprovementSuggestions(currentScore)
  };
};

const getImprovementSuggestions = (score) => {
  const suggestions = [];
  
  if (score < 40) {
    suggestions.push('Completa tu perfil profesional al 100%');
    suggestions.push('Verifica tu identidad con documentos');
    suggestions.push('Considera actualizar a un plan premium');
  } else if (score < 60) {
    suggestions.push('Mejora la calidad de tus servicios para obtener mejores reseñas');
    suggestions.push('Completa más trabajos exitosamente');
    suggestions.push('Mantén una comunicación excelente con los clientes');
  } else {
    suggestions.push('Mantén consistencia en la calidad del servicio');
    suggestions.push('Busca obtener más reseñas de 5 estrellas');
    suggestions.push('Expande tu portafolio de servicios');
  }
  
  return suggestions;
};

const calculateTrustScore = (professional) => {
  let trustScore = 0;
  
  // Base score from verification
  if (professional.verification_status === 'verified') trustScore += 30;
  
  // Subscription bonus
  if (professional.subscription_type === 'premium') trustScore += 25;
  else if (professional.subscription_type === 'basic') trustScore += 15;
  
  // Reviews contribution
  if (professional.total_reviews > 0) {
    trustScore += Math.min(25, professional.average_rating * 5);
    trustScore += Math.min(10, professional.total_reviews);
  }
  
  // Experience bonus
  if (professional.completed_bookings > 0) {
    trustScore += Math.min(10, professional.completed_bookings);
  }
  
  return Math.min(100, Math.round(trustScore));
};

module.exports = router;