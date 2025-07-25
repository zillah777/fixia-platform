const { pool } = require('../config/database');

// Calculate professional ranking score
const calculateProfessionalRanking = async (providerId) => {
  try {
    // Get user data
    const [users] = await pool.execute(
      `SELECT u.*, upi.years_experience 
       FROM users u
       LEFT JOIN user_professional_info upi ON u.id = upi.user_id
       WHERE u.id = ?`,
      [providerId]
    );

    if (users.length === 0) return 0;

    const user = users[0];
    let totalScore = 0;
    const weights = {
      reviews: 40,           // 40% weight for reviews
      subscription: 20,      // 20% weight for subscription
      verification: 15,      // 15% weight for verification
      completedBookings: 10, // 10% weight for completed bookings
      profile: 10,           // 10% weight for profile completion
      experience: 5          // 5% weight for experience
    };

    // 1. Reviews Score (40% weight)
    const [reviewStats] = await pool.execute(
      `SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_reviews,
        SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as positive_reviews
       FROM reviews WHERE provider_id = ?`,
      [providerId]
    );

    const avgRating = parseFloat(reviewStats[0].avg_rating) || 0;
    const totalReviews = reviewStats[0].total_reviews;
    const positiveReviews = reviewStats[0].positive_reviews;

    let reviewScore = 0;
    if (totalReviews > 0) {
      // Base score from average rating (0-100)
      reviewScore = (avgRating / 5) * 100;
      
      // Bonus for high number of reviews (logarithmic scale)
      const reviewCountBonus = Math.min(20, Math.log10(totalReviews + 1) * 10);
      reviewScore += reviewCountBonus;
      
      // Bonus for high percentage of positive reviews
      const positiveRatio = positiveReviews / totalReviews;
      reviewScore += positiveRatio * 10;
      
      reviewScore = Math.min(100, reviewScore);
    }

    totalScore += (reviewScore * weights.reviews) / 100;

    // 2. Subscription Score (20% weight)
    let subscriptionScore = 0;
    switch (user.subscription_type) {
      case 'premium':
        subscriptionScore = 100;
        break;
      case 'basic':
        subscriptionScore = 60;
        break;
      case 'free':
        subscriptionScore = 20;
        break;
    }

    // Check if subscription is active
    if (user.subscription_expires_at && new Date(user.subscription_expires_at) < new Date()) {
      subscriptionScore = Math.max(20, subscriptionScore - 30); // Penalty for expired subscription
    }

    totalScore += (subscriptionScore * weights.subscription) / 100;

    // 3. Verification Score (15% weight)
    let verificationScore = user.verification_score || 0;
    verificationScore = Math.max(0, Math.min(100, verificationScore));

    totalScore += (verificationScore * weights.verification) / 100;

    // 4. Completed Bookings Score (10% weight)
    const [bookingStats] = await pool.execute(
      `SELECT 
        COUNT(*) as completed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings
       FROM bookings WHERE provider_id = ? AND status = 'completed'`,
      [providerId]
    );

    const completedBookings = bookingStats[0].completed_bookings;
    let bookingScore = Math.min(100, completedBookings * 2); // 2 points per completed booking

    // Penalty for high cancellation rate
    const [totalBookings] = await pool.execute(
      'SELECT COUNT(*) as total FROM bookings WHERE provider_id = ?',
      [providerId]
    );

    if (totalBookings[0].total > 0) {
      const cancellationRate = bookingStats[0].cancelled_bookings / totalBookings[0].total;
      if (cancellationRate > 0.1) { // More than 10% cancellation rate
        bookingScore *= (1 - cancellationRate);
      }
    }

    totalScore += (bookingScore * weights.completedBookings) / 100;

    // 5. Profile Completion Score (10% weight)
    const profileScore = user.profile_completion_percentage || 0;
    totalScore += (profileScore * weights.profile) / 100;

    // 6. Experience Score (5% weight)
    const yearsExperience = user.years_experience || 0;
    const experienceScore = Math.min(100, yearsExperience * 10); // 10 points per year, max 100
    totalScore += (experienceScore * weights.experience) / 100;

    // Bonus factors
    let bonusMultiplier = 1;

    // Verified users get 10% bonus
    if (user.verification_status === 'verified') {
      bonusMultiplier += 0.1;
    }

    // Premium users get additional 5% bonus
    if (user.subscription_type === 'premium') {
      bonusMultiplier += 0.05;
    }

    // Recent activity bonus (active in last 30 days)
    const [recentActivity] = await pool.execute(
      `SELECT COUNT(*) as recent_activity 
       FROM bookings 
       WHERE provider_id = ? AND updated_at > DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [providerId]
    );

    if (recentActivity[0].recent_activity > 0) {
      bonusMultiplier += 0.05;
    }

    totalScore *= bonusMultiplier;
    totalScore = Math.min(100, Math.max(0, totalScore));

    // Update user's ranking score in database
    await pool.execute(
      'UPDATE users SET verification_score = ? WHERE id = ?',
      [Math.round(totalScore), providerId]
    );

    return Math.round(totalScore);

  } catch (error) {
    console.error('Error calculating ranking:', error);
    return 0;
  }
};

// Recalculate rankings for all providers
const recalculateAllRankings = async () => {
  try {
    console.log('🔄 Recalculating rankings for all providers...');

    const [providers] = await pool.execute(
      'SELECT id FROM users WHERE user_type = "provider" AND is_active = TRUE'
    );

    const rankingPromises = providers.map(provider => 
      calculateProfessionalRanking(provider.id)
    );

    await Promise.all(rankingPromises);

    console.log(`✅ Recalculated rankings for ${providers.length} providers`);

  } catch (error) {
    console.error('Error recalculating all rankings:', error);
  }
};

// Get top professionals by ranking
const getTopProfessionals = async (limit = 10, category = null, location = null) => {
  try {
    let query = `
      SELECT u.id, u.first_name, u.last_name, u.profile_image, 
             u.verification_score, u.verification_status, u.subscription_type,
             u.city, u.is_verified,
             AVG(r.rating) as average_rating,
             COUNT(DISTINCT r.id) as total_reviews,
             COUNT(DISTINCT b.id) as completed_bookings,
             upi.profession, upi.specialization
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

    if (location) {
      query += ` AND (u.city LIKE ? OR EXISTS (
        SELECT 1 FROM user_work_locations uwl 
        WHERE uwl.user_id = u.id AND uwl.city LIKE ?
      ))`;
      params.push(`%${location}%`, `%${location}%`);
    }

    query += `
      GROUP BY u.id
      ORDER BY 
        u.verification_score DESC,
        u.subscription_type = 'premium' DESC,
        u.subscription_type = 'basic' DESC,
        average_rating DESC,
        total_reviews DESC
      LIMIT ?
    `;

    params.push(limit);

    const [professionals] = await pool.execute(query, params);

    return professionals.map(prof => ({
      ...prof,
      average_rating: parseFloat(prof.average_rating) || 0,
      ranking_score: prof.verification_score,
      is_premium: prof.subscription_type === 'premium',
      is_featured: prof.subscription_type === 'premium' || prof.subscription_type === 'basic'
    }));

  } catch (error) {
    console.error('Error getting top professionals:', error);
    return [];
  }
};

// Calculate ranking factors for a provider (for displaying to user)
const getRankingFactors = async (providerId) => {
  try {
    const [user] = await pool.execute(
      `SELECT u.*, upi.years_experience 
       FROM users u
       LEFT JOIN user_professional_info upi ON u.id = upi.user_id
       WHERE u.id = ?`,
      [providerId]
    );

    if (user.length === 0) return null;

    const userData = user[0];

    // Get review stats
    const [reviewStats] = await pool.execute(
      `SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_reviews
       FROM reviews WHERE provider_id = ?`,
      [providerId]
    );

    // Get booking stats
    const [bookingStats] = await pool.execute(
      `SELECT 
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(*) as total_bookings
       FROM bookings WHERE provider_id = ?`,
      [providerId]
    );

    const factors = {
      current_score: userData.verification_score || 0,
      reviews: {
        average_rating: parseFloat(reviewStats[0].avg_rating) || 0,
        total_reviews: reviewStats[0].total_reviews,
        impact: 'Alto'
      },
      subscription: {
        type: userData.subscription_type,
        is_active: !userData.subscription_expires_at || new Date(userData.subscription_expires_at) > new Date(),
        impact: 'Alto'
      },
      verification: {
        status: userData.verification_status,
        is_verified: userData.verification_status === 'verified',
        impact: 'Medio'
      },
      bookings: {
        completed: bookingStats[0].completed_bookings,
        total: bookingStats[0].total_bookings,
        completion_rate: bookingStats[0].total_bookings > 0 ? 
          (bookingStats[0].completed_bookings / bookingStats[0].total_bookings * 100).toFixed(1) : 0,
        impact: 'Medio'
      },
      profile: {
        completion_percentage: userData.profile_completion_percentage || 0,
        impact: 'Bajo'
      },
      experience: {
        years: userData.years_experience || 0,
        impact: 'Bajo'
      }
    };

    // Recommendations for improvement
    const recommendations = [];

    if (factors.reviews.average_rating < 4.5) {
      recommendations.push('Mejora la calidad de tus servicios para obtener mejores reseñas');
    }

    if (factors.subscription.type === 'free') {
      recommendations.push('Considera actualizar a un plan premium para mayor visibilidad');
    }

    if (factors.verification.status !== 'verified') {
      recommendations.push('Completa el proceso de verificación para ganar confianza');
    }

    if (factors.profile.completion_percentage < 90) {
      recommendations.push('Completa tu perfil profesional al 100%');
    }

    factors.recommendations = recommendations;

    return factors;

  } catch (error) {
    console.error('Error getting ranking factors:', error);
    return null;
  }
};

module.exports = {
  calculateProfessionalRanking,
  recalculateAllRankings,
  getTopProfessionals,
  getRankingFactors
};