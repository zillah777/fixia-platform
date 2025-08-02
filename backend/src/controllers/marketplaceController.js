const { query } = require('../config/database');
const cacheService = require('../services/cacheService');
const { CACHE_TTL } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Marketplace Controller - Enterprise-grade marketplace discovery
 * 
 * Handles:
 * - Professional marketplace browsing with advanced filters
 * - Search functionality with location and category filtering
 * - Featured professionals promotion system
 * - Trending content discovery
 * - Performance optimization with caching
 */

// Browse professionals in marketplace
exports.browseProfessionals = async (req, res) => {
  try {
    const {
      category_id,
      location,
      locality,
      latitude,
      longitude,
      radius = 10,
      min_rating = 0,
      max_price,
      min_price,
      has_portfolio = false,
      is_verified = false,
      is_premium = false,
      availability = 'all', // 'available', 'busy', 'all'
      search,
      sort = 'ranking', // 'ranking', 'rating', 'price_low', 'price_high', 'newest', 'distance'
      page = 1,
      limit = 20
    } = req.query;

    // Create cache key
    const cacheKey = `marketplace:browse:${JSON.stringify({
      category_id, location, locality, latitude, longitude, radius,
      min_rating, max_price, min_price, has_portfolio, is_verified,
      is_premium, availability, search, sort, page, limit
    })}`;

    // Check cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        ...cached,
        cached: true
      });
    }

    // Build WHERE conditions
    let whereConditions = [
      'u.user_type = $1',
      'u.is_active = true',
      'pm.portfolio_images_count >= 0' // Include professionals with or without portfolio
    ];
    let params = ['provider'];
    let paramIndex = 2;

    // Category filter
    if (category_id && category_id !== 'all') {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM as_work_categories awc 
        WHERE awc.user_id = u.id AND awc.category_id = $${paramIndex}
      )`);
      params.push(category_id);
      paramIndex++;
    }

    // Location filters
    if (locality && locality !== 'all') {
      whereConditions.push(`u.locality ILIKE $${paramIndex}`);
      params.push(`%${locality}%`);
      paramIndex++;
    }

    if (location && location !== 'all') {
      whereConditions.push(`u.location ILIKE $${paramIndex}`);
      params.push(`%${location}%`);
      paramIndex++;
    }

    // Rating filter
    if (min_rating && min_rating > 0) {
      whereConditions.push(`COALESCE(u.average_rating, 0) >= $${paramIndex}`);
      params.push(parseFloat(min_rating));
      paramIndex++;
    }

    // Price filters (from services)
    if (min_price || max_price) {
      let priceCondition = 'EXISTS (SELECT 1 FROM services s WHERE s.user_id = u.id';
      if (min_price) {
        priceCondition += ` AND s.price >= $${paramIndex}`;
        params.push(parseFloat(min_price));
        paramIndex++;
      }
      if (max_price) {
        priceCondition += ` AND s.price <= $${paramIndex}`;
        params.push(parseFloat(max_price));
        paramIndex++;
      }
      priceCondition += ')';
      whereConditions.push(priceCondition);
    }

    // Portfolio filter
    if (has_portfolio === 'true' || has_portfolio === true) {
      whereConditions.push('pm.portfolio_images_count > 0');
    }

    // Verification filter
    if (is_verified === 'true' || is_verified === true) {
      whereConditions.push('u.is_verified = true');
    }

    // Premium filter
    if (is_premium === 'true' || is_premium === true) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM as_premium_subscriptions aps 
        WHERE aps.user_id = u.id 
        AND aps.status = 'active' 
        AND aps.end_date > NOW()
      )`);
    }

    // Availability filter
    if (availability === 'available') {
      whereConditions.push(`COALESCE(u.availability_status, 'available') = 'available'`);
    } else if (availability === 'busy') {
      whereConditions.push(`COALESCE(u.availability_status, 'available') = 'busy'`);
    }

    // Search filter
    if (search && search.trim()) {
      whereConditions.push(`(
        u.first_name ILIKE $${paramIndex} OR 
        u.last_name ILIKE $${paramIndex} OR
        u.bio ILIKE $${paramIndex} OR
        u.professional_title ILIKE $${paramIndex} OR
        EXISTS (
          SELECT 1 FROM services s 
          WHERE s.user_id = u.id 
          AND (s.title ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})
        ) OR
        EXISTS (
          SELECT 1 FROM portfolio_images pi 
          WHERE pi.user_id = u.id 
          AND (pi.title ILIKE $${paramIndex} OR pi.description ILIKE $${paramIndex})
        )
      )`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Distance calculation and filter
    let distanceSelect = '';
    let distanceJoin = '';
    let distanceOrder = '';

    if (latitude && longitude) {
      distanceSelect = `, 
        CASE 
          WHEN u.latitude IS NOT NULL AND u.longitude IS NOT NULL THEN
            6371 * acos(
              cos(radians($${paramIndex})) * cos(radians(u.latitude)) *
              cos(radians(u.longitude) - radians($${paramIndex + 1})) +
              sin(radians($${paramIndex})) * sin(radians(u.latitude))
            )
          ELSE NULL
        END as distance_km`;

      params.push(parseFloat(latitude), parseFloat(longitude));
      paramIndex += 2;

      // Add radius filter
      whereConditions.push(`(
        u.latitude IS NULL OR u.longitude IS NULL OR
        6371 * acos(
          cos(radians($${paramIndex})) * cos(radians(u.latitude)) *
          cos(radians(u.longitude) - radians($${paramIndex + 1})) +
          sin(radians($${paramIndex})) * sin(radians(u.latitude))
        ) <= $${paramIndex + 2}
      )`);

      params.push(parseFloat(latitude), parseFloat(longitude), parseFloat(radius));
      paramIndex += 3;

      distanceOrder = sort === 'distance' ? ', distance_km ASC' : '';
    }

    // Build ORDER BY clause
    let orderClause;
    switch (sort) {
      case 'rating':
        orderClause = 'ORDER BY u.average_rating DESC NULLS LAST, u.review_count DESC';
        break;
      case 'price_low':
        orderClause = `ORDER BY (
          SELECT MIN(s.price) FROM services s WHERE s.user_id = u.id AND s.is_active = true
        ) ASC NULLS LAST`;
        break;
      case 'price_high':
        orderClause = `ORDER BY (
          SELECT MAX(s.price) FROM services s WHERE s.user_id = u.id AND s.is_active = true
        ) DESC NULLS LAST`;
        break;
      case 'newest':
        orderClause = 'ORDER BY u.created_at DESC';
        break;
      case 'distance':
        orderClause = distanceOrder ? `ORDER BY distance_km ASC NULLS LAST` : 'ORDER BY u.created_at DESC';
        break;
      case 'ranking':
      default:
        orderClause = `ORDER BY 
          COALESCE(pm.ranking_score, 0) DESC,
          u.average_rating DESC NULLS LAST,
          pm.portfolio_views_total DESC NULLS LAST,
          u.review_count DESC${distanceOrder}`;
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Main query
    const mainQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.professional_title,
        u.bio,
        u.featured_image_url,
        u.location,
        u.locality,
        u.average_rating,
        u.review_count,
        u.is_verified,
        u.availability_status,
        u.created_at,
        pm.portfolio_images_count,
        pm.portfolio_views_total,
        pm.portfolio_likes_total,
        pm.ranking_score,
        pm.response_time_avg,
        pm.conversion_rate,
        -- Service info
        (SELECT COUNT(*) FROM services s WHERE s.user_id = u.id AND s.is_active = true) as active_services_count,
        (SELECT MIN(s.price) FROM services s WHERE s.user_id = u.id AND s.is_active = true) as min_price,
        (SELECT MAX(s.price) FROM services s WHERE s.user_id = u.id AND s.is_active = true) as max_price,
        -- Featured status
        CASE WHEN fp.id IS NOT NULL THEN true ELSE false END as is_featured,
        fp.feature_type,
        -- Categories
        (
          SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'icon', c.icon))
          FROM as_work_categories awc
          JOIN categories c ON awc.category_id = c.id
          WHERE awc.user_id = u.id
        ) as categories,
        -- Recent portfolio images
        (
          SELECT json_agg(json_build_object(
            'id', pi.id, 
            'thumbnail_path', pi.thumbnail_path,
            'title', pi.title,
            'views_count', pi.views_count,
            'likes_count', pi.likes_count
          ))
          FROM (
            SELECT * FROM portfolio_images pi2 
            WHERE pi2.user_id = u.id 
            AND pi2.is_marketplace_visible = true
            AND pi2.moderation_status = 'approved'
            ORDER BY pi2.is_featured DESC, pi2.views_count DESC
            LIMIT 6
          ) pi
        ) as portfolio_preview,
        -- Premium status
        CASE WHEN aps.id IS NOT NULL THEN true ELSE false END as is_premium,
        aps.plan_type as premium_plan${distanceSelect}
      FROM users u
      LEFT JOIN professional_marketplace_metrics pm ON u.id = pm.user_id
      LEFT JOIN featured_professionals fp ON u.id = fp.user_id 
        AND fp.is_active = true 
        AND (fp.start_date IS NULL OR fp.start_date <= NOW())
        AND (fp.end_date IS NULL OR fp.end_date > NOW())
      LEFT JOIN as_premium_subscriptions aps ON u.id = aps.user_id 
        AND aps.status = 'active' 
        AND aps.end_date > NOW()
      WHERE ${whereConditions.join(' AND ')}
      ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN professional_marketplace_metrics pm ON u.id = pm.user_id
      WHERE ${whereConditions.join(' AND ')}
    `;

    const [mainResult, countResult] = await Promise.all([
      query(mainQuery, params),
      query(countQuery, params.slice(0, -2)) // Remove limit and offset from count query
    ]);

    const professionals = mainResult.rows;
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const response = {
      success: true,
      professionals,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      },
      filters_applied: {
        category_id: category_id || null,
        location: location || null,
        locality: locality || null,
        has_location_filter: !!(latitude && longitude),
        radius: latitude && longitude ? radius : null,
        min_rating,
        price_range: min_price || max_price ? { min_price, max_price } : null,
        has_portfolio,
        is_verified,
        is_premium,
        availability,
        search: search || null,
        sort
      }
    };

    // Cache for 2 minutes (marketplace data changes frequently)
    await cacheService.set(cacheKey, response, 120);

    logger.info('Marketplace browse completed', {
      category: 'marketplace',
      user_id: req.user?.id,
      filters: response.filters_applied,
      results_count: professionals.length,
      total_available: total
    });

    res.json(response);

  } catch (error) {
    logger.error('Marketplace browse error', {
      category: 'marketplace',
      user_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al buscar profesionales en el marketplace'
    });
  }
};

// Get featured professionals
exports.getFeaturedProfessionals = async (req, res) => {
  try {
    const { 
      feature_type = 'all', // 'homepage', 'category', 'location', 'premium', 'trending'
      category_id,
      location,
      limit = 10
    } = req.query;

    const cacheKey = `marketplace:featured:${feature_type}:${category_id || 'all'}:${location || 'all'}:${limit}`;
    
    // Check cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        ...cached,
        cached: true
      });
    }

    let whereConditions = [
      'fp.is_active = true',
      '(fp.start_date IS NULL OR fp.start_date <= NOW())',
      '(fp.end_date IS NULL OR fp.end_date > NOW())',
      'u.is_active = true',
      'u.user_type = $1'
    ];
    let params = ['provider'];
    let paramIndex = 2;

    // Feature type filter
    if (feature_type !== 'all') {
      whereConditions.push(`fp.feature_type = $${paramIndex}`);
      params.push(feature_type);
      paramIndex++;
    }

    // Category filter for featured professionals
    if (category_id && feature_type === 'category') {
      whereConditions.push(`fp.target_category_id = $${paramIndex}`);
      params.push(category_id);
      paramIndex++;
    }

    // Location filter for featured professionals
    if (location && feature_type === 'location') {
      whereConditions.push(`fp.target_location ILIKE $${paramIndex}`);
      params.push(`%${location}%`);
      paramIndex++;
    }

    const featuredQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.professional_title,
        u.bio,
        u.featured_image_url,
        u.location,
        u.locality,
        u.average_rating,
        u.review_count,
        u.is_verified,
        u.availability_status,
        fp.feature_type,
        fp.feature_priority,
        fp.impressions_count,
        fp.clicks_count,
        fp.conversions_count,
        fp.cost,
        pm.portfolio_images_count,
        pm.ranking_score,
        -- Categories
        (
          SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'icon', c.icon))
          FROM as_work_categories awc
          JOIN categories c ON awc.category_id = c.id
          WHERE awc.user_id = u.id
        ) as categories,
        -- Portfolio preview
        (
          SELECT json_agg(json_build_object(
            'id', pi.id, 
            'thumbnail_path', pi.thumbnail_path,
            'title', pi.title
          ))
          FROM (
            SELECT * FROM portfolio_images pi2 
            WHERE pi2.user_id = u.id 
            AND pi2.is_marketplace_visible = true
            AND pi2.moderation_status = 'approved'
            ORDER BY pi2.is_featured DESC, pi2.views_count DESC
            LIMIT 3
          ) pi
        ) as portfolio_preview,
        -- Premium status
        CASE WHEN aps.id IS NOT NULL THEN true ELSE false END as is_premium
      FROM featured_professionals fp
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN professional_marketplace_metrics pm ON u.id = pm.user_id
      LEFT JOIN as_premium_subscriptions aps ON u.id = aps.user_id 
        AND aps.status = 'active' 
        AND aps.end_date > NOW()
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY 
        fp.feature_priority DESC,
        fp.clicks_count DESC,
        u.average_rating DESC,
        pm.ranking_score DESC
      LIMIT $${paramIndex}
    `;

    params.push(limit);

    const result = await query(featuredQuery, params);
    const featuredProfessionals = result.rows;

    // Track impressions for featured professionals
    if (featuredProfessionals.length > 0) {
      const professionalIds = featuredProfessionals.map(p => p.id);
      await query(`
        UPDATE featured_professionals 
        SET impressions_count = impressions_count + 1,
            last_impression_at = NOW()
        WHERE user_id = ANY($1) AND is_active = true
      `, [professionalIds]);
    }

    const response = {
      success: true,
      featured_professionals: featuredProfessionals,
      feature_type,
      total_count: featuredProfessionals.length
    };

    // Cache for 5 minutes
    await cacheService.set(cacheKey, response, 300);

    logger.info('Featured professionals retrieved', {
      category: 'marketplace',
      feature_type,
      count: featuredProfessionals.length
    });

    res.json(response);

  } catch (error) {
    logger.error('Get featured professionals error', {
      category: 'marketplace',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al obtener profesionales destacados'
    });
  }
};

// Get trending portfolio content
exports.getTrendingPortfolio = async (req, res) => {
  try {
    const { 
      category_id,
      location,
      time_period = '7', // days
      limit = 20
    } = req.query;

    const cacheKey = `marketplace:trending:${category_id || 'all'}:${location || 'all'}:${time_period}:${limit}`;
    
    // Check cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        ...cached,
        cached: true
      });
    }

    let whereConditions = [
      'pi.is_marketplace_visible = true',
      'pi.moderation_status = $1',
      'u.is_active = true',
      'u.user_type = $2',
      'pi.created_at >= CURRENT_DATE - INTERVAL \'' + parseInt(time_period) + ' days\''
    ];
    let params = ['approved', 'provider'];
    let paramIndex = 3;

    // Category filter
    if (category_id && category_id !== 'all') {
      whereConditions.push(`pi.category_id = $${paramIndex}`);
      params.push(category_id);
      paramIndex++;
    }

    // Location filter
    if (location && location !== 'all') {
      whereConditions.push(`u.locality ILIKE $${paramIndex}`);
      params.push(`%${location}%`);
      paramIndex++;
    }

    const trendingQuery = `
      SELECT 
        pi.id,
        pi.title,
        pi.description,
        pi.thumbnail_path,
        pi.views_count,
        pi.likes_count,
        pi.created_at,
        u.id as professional_id,
        u.first_name,
        u.last_name,
        u.professional_title,
        u.featured_image_url,
        u.average_rating,
        u.review_count,
        c.name as category_name,
        c.icon as category_icon,
        -- Calculate trending score (more weight on recent engagement)
        (
          (pi.views_count * 0.3) + 
          (pi.likes_count * 0.7) + 
          (EXTRACT(EPOCH FROM (NOW() - pi.created_at)) / -3600 * 0.1) -- Recency bonus
        ) as trending_score,
        -- Daily engagement metrics
        (
          SELECT COUNT(*) FROM portfolio_image_views piv 
          WHERE piv.image_id = pi.id 
          AND piv.viewed_at >= CURRENT_DATE
        ) as today_views,
        (
          SELECT COUNT(*) FROM portfolio_image_likes pil 
          WHERE pil.image_id = pi.id 
          AND pil.created_at >= CURRENT_DATE
        ) as today_likes
      FROM portfolio_images pi
      JOIN users u ON pi.user_id = u.id
      LEFT JOIN categories c ON pi.category_id = c.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY trending_score DESC, pi.created_at DESC
      LIMIT $${paramIndex}
    `;

    params.push(limit);

    const result = await query(trendingQuery, params);
    const trendingContent = result.rows;

    const response = {
      success: true,
      trending_portfolio: trendingContent,
      time_period: `${time_period} days`,
      total_count: trendingContent.length
    };

    // Cache for 30 minutes
    await cacheService.set(cacheKey, response, 1800);

    logger.info('Trending portfolio retrieved', {
      category: 'marketplace',
      time_period,
      count: trendingContent.length
    });

    res.json(response);

  } catch (error) {
    logger.error('Get trending portfolio error', {
      category: 'marketplace',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al obtener contenido trending del portafolio'
    });
  }
};

// Get professional detail for marketplace
exports.getProfessionalDetail = async (req, res) => {
  try {
    const { professionalId } = req.params;
    const viewerUserId = req.user?.id;

    const cacheKey = `marketplace:professional:${professionalId}:${viewerUserId || 'anonymous'}`;
    
    // Check cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        ...cached,
        cached: true
      });
    }

    // Main professional query
    const professionalQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.professional_title,
        u.bio,
        u.featured_image_url,
        u.location,
        u.locality,
        u.average_rating,
        u.review_count,
        u.is_verified,
        u.availability_status,
        u.created_at,
        u.last_active_at,
        pm.portfolio_images_count,
        pm.portfolio_views_total,
        pm.portfolio_likes_total,
        pm.ranking_score,
        pm.response_time_avg,
        pm.conversion_rate,
        pm.last_portfolio_update,
        -- Privacy settings
        aps_priv.show_portfolio_in_marketplace,
        aps_priv.show_portfolio_before_after,
        aps_priv.show_portfolio_project_values,
        aps_priv.portfolio_visibility,
        -- Premium status
        CASE WHEN aps.id IS NOT NULL THEN true ELSE false END as is_premium,
        aps.plan_type as premium_plan,
        -- Featured status
        CASE WHEN fp.id IS NOT NULL THEN true ELSE false END as is_featured,
        fp.feature_type
      FROM users u
      LEFT JOIN professional_marketplace_metrics pm ON u.id = pm.user_id
      LEFT JOIN as_privacy_settings aps_priv ON u.id = aps_priv.user_id
      LEFT JOIN as_premium_subscriptions aps ON u.id = aps.user_id 
        AND aps.status = 'active' 
        AND aps.end_date > NOW()
      LEFT JOIN featured_professionals fp ON u.id = fp.user_id 
        AND fp.is_active = true 
        AND (fp.start_date IS NULL OR fp.start_date <= NOW())
        AND (fp.end_date IS NULL OR fp.end_date > NOW())
      WHERE u.id = $1 AND u.user_type = 'provider' AND u.is_active = true
    `;

    const professionalResult = await query(professionalQuery, [professionalId]);

    if (professionalResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profesional no encontrado'
      });
    }

    const professional = professionalResult.rows[0];

    // Get categories
    const categoriesQuery = `
      SELECT c.id, c.name, c.icon
      FROM as_work_categories awc
      JOIN categories c ON awc.category_id = c.id
      WHERE awc.user_id = $1
    `;
    const categoriesResult = await query(categoriesQuery, [professionalId]);

    // Get active services
    const servicesQuery = `
      SELECT id, title, description, price, service_type, duration
      FROM services 
      WHERE user_id = $1 AND is_active = true
      ORDER BY price ASC
      LIMIT 10
    `;
    const servicesResult = await query(servicesQuery, [professionalId]);

    // Get recent reviews
    const reviewsQuery = `
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.first_name as client_name,
        u.featured_image_url as client_avatar,
        s.title as service_title
      FROM reviews r
      JOIN users u ON r.client_id = u.id
      LEFT JOIN services s ON r.service_id = s.id
      WHERE r.professional_id = $1 AND r.status = 'published'
      ORDER BY r.created_at DESC
      LIMIT 5
    `;
    const reviewsResult = await query(reviewsQuery, [professionalId]);

    // Check if viewer has favorited this professional
    let isFavorited = false;
    if (viewerUserId) {
      const favoriteQuery = `
        SELECT 1 FROM explorer_favorites 
        WHERE explorer_id = $1 AND favorited_user_id = $2 AND favorite_type = 'professional'
      `;
      const favoriteResult = await query(favoriteQuery, [viewerUserId, professionalId]);
      isFavorited = favoriteResult.rows.length > 0;
    }

    const response = {
      success: true,
      professional: {
        ...professional,
        categories: categoriesResult.rows,
        services: servicesResult.rows,
        recent_reviews: reviewsResult.rows,
        is_favorited: isFavorited
      }
    };

    // Cache for 5 minutes
    await cacheService.set(cacheKey, response, 300);

    // Track profile view
    if (viewerUserId && viewerUserId !== parseInt(professionalId)) {
      // Insert view tracking (async, don't await)
      query(`
        INSERT INTO professional_profile_views (
          professional_id, viewer_id, view_source, viewed_at
        ) VALUES ($1, $2, 'marketplace', NOW())
        ON CONFLICT DO NOTHING
      `, [professionalId, viewerUserId]).catch(err => {
        logger.warn('Failed to track profile view', { error: err.message });
      });
    }

    logger.info('Professional detail viewed', {
      category: 'marketplace',
      professional_id: professionalId,
      viewer_id: viewerUserId
    });

    res.json(response);

  } catch (error) {
    logger.error('Get professional detail error', {
      category: 'marketplace',
      professional_id: req.params.professionalId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al obtener detalles del profesional'
    });
  }
};

module.exports = exports;