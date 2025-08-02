const { query } = require('../config/database');
const cacheService = require('../services/cacheService');
const { CACHE_TTL } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Featured Controller - Enterprise-grade featured professionals management
 * 
 * Handles:
 * - Creating and managing featured professional placements
 * - Performance tracking for featured content
 * - Admin controls for featured system
 * - Analytics and ROI calculation for featured placements
 * - Geographic and category targeting
 */

// Create featured professional placement (Admin only)
exports.createFeaturedPlacement = async (req, res) => {
  try {
    const {
      user_id,
      feature_type, // 'homepage', 'category', 'location', 'premium', 'trending'
      feature_priority = 1, // 1-10, higher = more prominent
      target_category_id,
      target_location,
      start_date,
      end_date,
      cost = 0,
      description
    } = req.body;

    // Admin permission check
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo los administradores pueden crear destacados'
      });
    }

    // Validate required fields
    if (!user_id || !feature_type) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuario y tipo de destacado son requeridos'
      });
    }

    // Validate feature_type
    const validFeatureTypes = ['homepage', 'category', 'location', 'premium', 'trending'];
    if (!validFeatureTypes.includes(feature_type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de destacado inválido'
      });
    }

    // Verify user exists and is a provider
    const userQuery = `
      SELECT id, first_name, last_name, user_type, is_active 
      FROM users 
      WHERE id = $1
    `;
    const userResult = await query(userQuery, [user_id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const user = userResult.rows[0];

    if (user.user_type !== 'provider') {
      return res.status(400).json({
        success: false,
        error: 'Solo los proveedores pueden ser destacados'
      });
    }

    if (!user.is_active) {
      return res.status(400).json({
        success: false,
        error: 'El usuario debe estar activo para ser destacado'
      });
    }

    // Validate category if feature_type is 'category'
    if (feature_type === 'category' && target_category_id) {
      const categoryQuery = `SELECT id FROM categories WHERE id = $1`;
      const categoryResult = await query(categoryQuery, [target_category_id]);
      
      if (categoryResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Categoría no válida'
        });
      }
    }

    // Check for overlapping featured placements of same type
    const overlapQuery = `
      SELECT id FROM featured_professionals 
      WHERE user_id = $1 
      AND feature_type = $2
      AND is_active = true
      AND (
        (start_date IS NULL OR start_date <= COALESCE($3, NOW())) AND
        (end_date IS NULL OR end_date >= COALESCE($4, NOW()))
      )
    `;

    const overlapResult = await query(overlapQuery, [
      user_id, 
      feature_type, 
      end_date || null, 
      start_date || null
    ]);

    if (overlapResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Ya existe un destacado activo del mismo tipo para este usuario en el período especificado'
      });
    }

    // Insert featured placement
    const insertQuery = `
      INSERT INTO featured_professionals (
        user_id, feature_type, feature_priority, target_category_id,
        target_location, start_date, end_date, cost, description,
        created_by, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true
      ) RETURNING *
    `;

    const insertParams = [
      user_id,
      feature_type,
      feature_priority,
      target_category_id || null,
      target_location || null,
      start_date || null,
      end_date || null,
      cost,
      description || null,
      req.user.id
    ];

    const result = await query(insertQuery, insertParams);
    const featuredPlacement = result.rows[0];

    // Invalidate relevant caches
    await Promise.all([
      cacheService.invalidateCache(`marketplace:featured:${feature_type}`),
      cacheService.invalidateCache(`marketplace:featured:all`),
      cacheService.invalidateCache(`featured:admin:list`)
    ]);

    logger.info('Featured placement created', {
      category: 'featured',
      placement_id: featuredPlacement.id,
      user_id,
      feature_type,
      created_by: req.user.id,
      cost
    });

    res.status(201).json({
      success: true,
      message: 'Destacado creado exitosamente',
      featured_placement: featuredPlacement
    });

  } catch (error) {
    logger.error('Create featured placement error', {
      category: 'featured',
      admin_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al crear destacado'
    });
  }
};

// Get featured placements (Admin view)
exports.getFeaturedPlacements = async (req, res) => {
  try {
    const {
      feature_type = 'all',
      status = 'active', // 'active', 'inactive', 'expired', 'scheduled', 'all'
      user_id,
      page = 1,
      limit = 20
    } = req.query;

    // Admin permission check
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo los administradores pueden ver los destacados'
      });
    }

    // Check cache
    const cacheKey = `featured:admin:list:${feature_type}:${status}:${user_id || 'all'}:${page}:${limit}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        ...cached,
        cached: true
      });
    }

    // Build WHERE conditions
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (feature_type !== 'all') {
      whereConditions.push(`fp.feature_type = $${paramIndex}`);
      params.push(feature_type);
      paramIndex++;
    }

    if (user_id) {
      whereConditions.push(`fp.user_id = $${paramIndex}`);
      params.push(user_id);
      paramIndex++;
    }

    // Status filters
    switch (status) {
      case 'active':
        whereConditions.push(`fp.is_active = true`);
        whereConditions.push(`(fp.start_date IS NULL OR fp.start_date <= NOW())`);
        whereConditions.push(`(fp.end_date IS NULL OR fp.end_date > NOW())`);
        break;
      case 'inactive':
        whereConditions.push(`fp.is_active = false`);
        break;
      case 'expired':
        whereConditions.push(`fp.end_date IS NOT NULL AND fp.end_date <= NOW()`);
        break;
      case 'scheduled':
        whereConditions.push(`fp.start_date IS NOT NULL AND fp.start_date > NOW()`);
        break;
      case 'all':
        // No additional conditions
        break;
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Main query
    const placementsQuery = `
      SELECT 
        fp.*,
        u.first_name,
        u.last_name,
        u.professional_title,
        u.featured_image_url,
        u.location,
        u.locality,
        u.average_rating,
        u.review_count,
        c.name as target_category_name,
        ca.first_name || ' ' || ca.last_name as created_by_name,
        -- Performance metrics
        COALESCE(fp.impressions_count, 0) as impressions,
        COALESCE(fp.clicks_count, 0) as clicks,
        COALESCE(fp.conversions_count, 0) as conversions,
        -- Calculate CTR and conversion rate
        CASE 
          WHEN fp.impressions_count > 0 THEN 
            ROUND((fp.clicks_count::decimal / fp.impressions_count::decimal) * 100, 2)
          ELSE 0 
        END as ctr_percentage,
        CASE 
          WHEN fp.clicks_count > 0 THEN 
            ROUND((fp.conversions_count::decimal / fp.clicks_count::decimal) * 100, 2)
          ELSE 0 
        END as conversion_rate_percentage,
        -- Calculate ROI
        CASE 
          WHEN fp.cost > 0 AND fp.conversions_count > 0 THEN
            ROUND((fp.conversions_count * 100.0 / fp.cost), 2) -- Assuming 100 ARS per conversion value
          ELSE 0
        END as roi_percentage
      FROM featured_professionals fp
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN categories c ON fp.target_category_id = c.id
      LEFT JOIN users ca ON fp.created_by = ca.id
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY 
        fp.is_active DESC,
        fp.feature_priority DESC,
        fp.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM featured_professionals fp
      JOIN users u ON fp.user_id = u.id
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
    `;

    const [placementsResult, countResult] = await Promise.all([
      query(placementsQuery, params),
      query(countQuery, params.slice(0, -2))
    ]);

    const placements = placementsResult.rows;
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_placements,
        COUNT(*) FILTER (WHERE fp.is_active = true 
          AND (fp.start_date IS NULL OR fp.start_date <= NOW())
          AND (fp.end_date IS NULL OR fp.end_date > NOW())) as active_placements,
        SUM(fp.impressions_count) as total_impressions,
        SUM(fp.clicks_count) as total_clicks,
        SUM(fp.conversions_count) as total_conversions,
        SUM(fp.cost) as total_cost
      FROM featured_professionals fp
      JOIN users u ON fp.user_id = u.id
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
    `;

    const summaryResult = await query(summaryQuery, params.slice(0, -2));
    const summary = summaryResult.rows[0];

    const response = {
      success: true,
      featured_placements: placements,
      summary: {
        total_placements: parseInt(summary.total_placements),
        active_placements: parseInt(summary.active_placements),
        total_impressions: parseInt(summary.total_impressions || 0),
        total_clicks: parseInt(summary.total_clicks || 0),
        total_conversions: parseInt(summary.total_conversions || 0),
        total_cost: parseFloat(summary.total_cost || 0),
        overall_ctr: summary.total_impressions > 0 
          ? ((summary.total_clicks / summary.total_impressions) * 100).toFixed(2)
          : 0,
        overall_conversion_rate: summary.total_clicks > 0
          ? ((summary.total_conversions / summary.total_clicks) * 100).toFixed(2)
          : 0
      },
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      },
      filters_applied: {
        feature_type,
        status,
        user_id: user_id || null
      }
    };

    // Cache for 5 minutes
    await cacheService.set(cacheKey, response, 300);

    logger.info('Featured placements retrieved', {
      category: 'featured',
      admin_id: req.user.id,
      filters: response.filters_applied,
      count: placements.length
    });

    res.json(response);

  } catch (error) {
    logger.error('Get featured placements error', {
      category: 'featured',
      admin_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al obtener destacados'
    });
  }
};

// Update featured placement
exports.updateFeaturedPlacement = async (req, res) => {
  try {
    const { placementId } = req.params;
    const {
      feature_priority,
      target_category_id,
      target_location,
      start_date,
      end_date,
      cost,
      description,
      is_active
    } = req.body;

    // Admin permission check
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo los administradores pueden modificar destacados'
      });
    }

    // Verify placement exists
    const placementQuery = `
      SELECT * FROM featured_professionals 
      WHERE id = $1
    `;
    const placementResult = await query(placementQuery, [placementId]);

    if (placementResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Destacado no encontrado'
      });
    }

    const placement = placementResult.rows[0];

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (feature_priority !== undefined) {
      updates.push(`feature_priority = $${paramIndex}`);
      params.push(feature_priority);
      paramIndex++;
    }

    if (target_category_id !== undefined) {
      updates.push(`target_category_id = $${paramIndex}`);
      params.push(target_category_id);
      paramIndex++;
    }

    if (target_location !== undefined) {
      updates.push(`target_location = $${paramIndex}`);
      params.push(target_location);
      paramIndex++;
    }

    if (start_date !== undefined) {
      updates.push(`start_date = $${paramIndex}`);
      params.push(start_date);
      paramIndex++;
    }

    if (end_date !== undefined) {
      updates.push(`end_date = $${paramIndex}`);
      params.push(end_date);
      paramIndex++;
    }

    if (cost !== undefined) {
      updates.push(`cost = $${paramIndex}`);
      params.push(cost);
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(description);
      paramIndex++;
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(is_active);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron campos para actualizar'
      });
    }

    // Add updated fields
    updates.push(`updated_at = NOW()`);
    updates.push(`updated_by = $${paramIndex}`);
    params.push(req.user.id);
    paramIndex++;

    // Add WHERE clause
    params.push(placementId);

    const updateQuery = `
      UPDATE featured_professionals 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, params);
    const updatedPlacement = result.rows[0];

    // Invalidate relevant caches
    await Promise.all([
      cacheService.invalidateCache(`marketplace:featured:${placement.feature_type}`),
      cacheService.invalidateCache(`marketplace:featured:all`),
      cacheService.invalidateCache(`featured:admin:list`)
    ]);

    logger.info('Featured placement updated', {
      category: 'featured',
      placement_id: placementId,
      updated_by: req.user.id,
      updated_fields: Object.keys(req.body)
    });

    res.json({
      success: true,
      message: 'Destacado actualizado exitosamente',
      featured_placement: updatedPlacement
    });

  } catch (error) {
    logger.error('Update featured placement error', {
      category: 'featured',
      placement_id: req.params.placementId,
      admin_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al actualizar destacado'
    });
  }
};

// Track featured professional click
exports.trackFeaturedClick = async (req, res) => {
  try {
    const { placementId } = req.params;
    const clickerId = req.user?.id;
    const {
      click_source = 'unknown', // 'homepage', 'search', 'category', 'direct'
      session_id,
      referrer_url
    } = req.body;

    // Verify placement exists and is active
    const placementQuery = `
      SELECT 
        fp.*,
        u.first_name,
        u.last_name
      FROM featured_professionals fp
      JOIN users u ON fp.user_id = u.id
      WHERE fp.id = $1 
      AND fp.is_active = true
      AND (fp.start_date IS NULL OR fp.start_date <= NOW())
      AND (fp.end_date IS NULL OR fp.end_date > NOW())
    `;

    const placementResult = await query(placementQuery, [placementId]);

    if (placementResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Destacado no encontrado o no activo'
      });
    }

    const placement = placementResult.rows[0];

    // Update click count
    await query(`
      UPDATE featured_professionals 
      SET clicks_count = clicks_count + 1,
          last_click_at = NOW()
      WHERE id = $1
    `, [placementId]);

    // Track click details (for analytics)
    await query(`
      INSERT INTO featured_professional_clicks (
        placement_id, clicker_id, click_source, session_id, 
        referrer_url, clicked_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      placementId,
      clickerId || null,
      click_source,
      session_id || null,
      referrer_url || null
    ]);

    // Invalidate cache
    await cacheService.invalidateCache(`featured:admin:list`);

    logger.info('Featured professional click tracked', {
      category: 'featured',
      placement_id: placementId,
      professional_id: placement.user_id,
      clicker_id: clickerId,
      click_source
    });

    res.json({
      success: true,
      message: 'Click registrado',
      professional: {
        id: placement.user_id,
        name: `${placement.first_name} ${placement.last_name}`
      }
    });

  } catch (error) {
    logger.error('Track featured click error', {
      category: 'featured',
      placement_id: req.params.placementId,
      clicker_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al registrar click'
    });
  }
};

// Get featured professional performance analytics
exports.getFeaturedAnalytics = async (req, res) => {
  try {
    const { placementId } = req.params;
    const {
      time_period = '30' // days
    } = req.query;

    // Admin permission check
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo los administradores pueden ver métricas de destacados'
      });
    }

    // Check cache
    const cacheKey = `featured:analytics:${placementId}:${time_period}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        ...cached,
        cached: true
      });
    }

    // Get placement info
    const placementQuery = `
      SELECT 
        fp.*,
        u.first_name,
        u.last_name,
        u.professional_title
      FROM featured_professionals fp
      JOIN users u ON fp.user_id = u.id
      WHERE fp.id = $1
    `;

    const placementResult = await query(placementQuery, [placementId]);

    if (placementResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Destacado no encontrado'
      });
    }

    const placement = placementResult.rows[0];

    // Get click analytics
    const clickAnalyticsQuery = `
      SELECT 
        DATE_TRUNC('day', clicked_at) as date,
        COUNT(*) as clicks,
        COUNT(DISTINCT clicker_id) as unique_clickers,
        json_object_agg(click_source, source_count) as source_breakdown
      FROM featured_professional_clicks fpc
      JOIN (
        SELECT 
          DATE_TRUNC('day', clicked_at) as day,
          click_source,
          COUNT(*) as source_count
        FROM featured_professional_clicks
        WHERE placement_id = $1
        AND clicked_at >= CURRENT_DATE - INTERVAL '${parseInt(time_period)} days'
        GROUP BY day, click_source
      ) source_stats ON DATE_TRUNC('day', fpc.clicked_at) = source_stats.day
      WHERE fpc.placement_id = $1
      AND fpc.clicked_at >= CURRENT_DATE - INTERVAL '${parseInt(time_period)} days'
      GROUP BY DATE_TRUNC('day', clicked_at)
      ORDER BY date DESC
    `;

    const clickAnalytics = await query(clickAnalyticsQuery, [placementId]);

    // Calculate performance metrics
    const performanceQuery = `
      SELECT 
        COUNT(*) as total_clicks,
        COUNT(DISTINCT clicker_id) as unique_clickers,
        COUNT(*) FILTER (WHERE clicked_at >= CURRENT_DATE - INTERVAL '7 days') as clicks_last_7_days,
        COUNT(*) FILTER (WHERE clicked_at >= CURRENT_DATE - INTERVAL '1 day') as clicks_today,
        -- Calculate hourly distribution
        json_object_agg(click_hour, hour_count) as hourly_distribution
      FROM featured_professional_clicks fpc
      JOIN (
        SELECT 
          EXTRACT(HOUR FROM clicked_at) as click_hour,
          COUNT(*) as hour_count
        FROM featured_professional_clicks
        WHERE placement_id = $1
        AND clicked_at >= CURRENT_DATE - INTERVAL '${parseInt(time_period)} days'
        GROUP BY EXTRACT(HOUR FROM clicked_at)
      ) hour_stats ON EXTRACT(HOUR FROM fpc.clicked_at) = hour_stats.click_hour
      WHERE fpc.placement_id = $1
      AND fpc.clicked_at >= CURRENT_DATE - INTERVAL '${parseInt(time_period)} days'
    `;

    const performance = await query(performanceQuery, [placementId]);

    // Calculate ROI and conversion metrics
    const conversionQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE b.status IN ('confirmed', 'completed')) as conversions,
        AVG(b.total_amount) as avg_booking_value,
        SUM(b.total_amount) FILTER (WHERE b.status IN ('confirmed', 'completed')) as total_revenue
      FROM featured_professional_clicks fpc
      LEFT JOIN bookings b ON b.professional_id = $2 
        AND b.client_id = fpc.clicker_id
        AND b.created_at >= fpc.clicked_at
        AND b.created_at <= fpc.clicked_at + INTERVAL '7 days'
      WHERE fpc.placement_id = $1
      AND fpc.clicked_at >= CURRENT_DATE - INTERVAL '${parseInt(time_period)} days'
    `;

    const conversions = await query(conversionQuery, [placementId, placement.user_id]);

    const analytics = {
      placement_info: placement,
      performance_summary: {
        total_impressions: placement.impressions_count || 0,
        total_clicks: placement.clicks_count || 0,
        total_conversions: placement.conversions_count || 0,
        total_cost: placement.cost || 0,
        ctr: placement.impressions_count > 0 
          ? ((placement.clicks_count / placement.impressions_count) * 100).toFixed(2)
          : 0,
        conversion_rate: placement.clicks_count > 0
          ? ((placement.conversions_count / placement.clicks_count) * 100).toFixed(2)
          : 0,
        cost_per_click: placement.clicks_count > 0 && placement.cost > 0
          ? (placement.cost / placement.clicks_count).toFixed(2)
          : 0,
        roi_percentage: placement.cost > 0 && conversions.rows[0]?.total_revenue
          ? (((conversions.rows[0].total_revenue - placement.cost) / placement.cost) * 100).toFixed(2)
          : 0
      },
      time_period_analytics: {
        daily_clicks: clickAnalytics.rows,
        period_performance: performance.rows[0] || {},
        conversions: conversions.rows[0] || {}
      },
      time_period: `${time_period} days`
    };

    const response = {
      success: true,
      analytics
    };

    // Cache for 1 hour
    await cacheService.set(cacheKey, response, 3600);

    logger.info('Featured analytics retrieved', {
      category: 'featured',
      placement_id: placementId,
      admin_id: req.user.id,
      time_period
    });

    res.json(response);

  } catch (error) {
    logger.error('Get featured analytics error', {
      category: 'featured',
      placement_id: req.params.placementId,
      admin_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al obtener métricas de destacado'
    });
  }
};

module.exports = exports;