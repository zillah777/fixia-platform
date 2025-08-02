const { query } = require('../config/database');
const cacheService = require('../services/cacheService');
const { CACHE_TTL } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Analytics Controller - Enterprise-grade analytics and tracking
 * 
 * Handles:
 * - Portfolio image view tracking with detailed context
 * - Like/unlike functionality with reaction types
 * - Professional profile analytics and insights
 * - Marketplace performance metrics
 * - Real-time engagement tracking
 * - Business intelligence for professionals
 */

// Track portfolio image view
exports.trackPortfolioView = async (req, res) => {
  try {
    const { imageId } = req.params;
    const viewerId = req.user?.id;
    const {
      view_source = 'direct', // 'portfolio', 'marketplace', 'search', 'direct', 'trending'
      session_id,
      referrer_url,
      user_agent
    } = req.body;

    // Get user's IP (considering proxies)
    const clientIp = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // Verify image exists and is viewable
    const imageQuery = `
      SELECT 
        pi.id, 
        pi.user_id, 
        pi.title,
        pi.is_marketplace_visible,
        pi.moderation_status,
        u.user_type,
        aps.show_portfolio_in_marketplace,
        aps.portfolio_visibility
      FROM portfolio_images pi
      JOIN users u ON pi.user_id = u.id
      LEFT JOIN as_privacy_settings aps ON u.id = aps.user_id
      WHERE pi.id = $1
    `;
    
    const imageResult = await query(imageQuery, [imageId]);
    
    if (imageResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Imagen no encontrada'
      });
    }

    const image = imageResult.rows[0];

    // Check privacy permissions
    if (!viewerId || viewerId !== image.user_id) {
      // Not the owner, check privacy settings
      if (image.moderation_status !== 'approved') {
        return res.status(403).json({
          success: false,
          error: 'Imagen no disponible'
        });
      }

      if (!image.is_marketplace_visible && view_source === 'marketplace') {
        return res.status(403).json({
          success: false,
          error: 'Imagen no visible en marketplace'
        });
      }

      if (image.portfolio_visibility === 'private') {
        return res.status(403).json({
          success: false,
          error: 'Portafolio privado'
        });
      }

      if (image.portfolio_visibility === 'clients_only' && viewerId) {
        // Check if viewer is a client
        const clientCheck = await query(`
          SELECT 1 FROM bookings 
          WHERE professional_id = $1 AND client_id = $2 
          AND status IN ('completed', 'confirmed')
          LIMIT 1
        `, [image.user_id, viewerId]);
        
        if (clientCheck.rows.length === 0) {
          return res.status(403).json({
            success: false,
            error: 'Solo clientes pueden ver este portafolio'
          });
        }
      }
    }

    // Check for duplicate views (prevent spam)
    const duplicateCheck = await query(`
      SELECT id FROM portfolio_image_views 
      WHERE image_id = $1 
      AND (
        (viewer_id IS NOT NULL AND viewer_id = $2) OR
        (viewer_id IS NULL AND viewer_ip = $3)
      )
      AND viewed_at > NOW() - INTERVAL '5 minutes'
      LIMIT 1
    `, [imageId, viewerId, clientIp]);

    if (duplicateCheck.rows.length > 0) {
      // Don't track duplicate view, but return success
      return res.json({
        success: true,
        message: 'Vista registrada',
        is_duplicate: true
      });
    }

    // Insert view tracking
    const insertViewQuery = `
      INSERT INTO portfolio_image_views (
        image_id, viewer_id, viewer_ip, view_source, 
        session_id, referrer_url, user_agent, viewed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id
    `;

    const viewParams = [
      imageId,
      viewerId || null,
      clientIp,
      view_source,
      session_id || null,
      referrer_url || null,
      user_agent || req.headers['user-agent'] || null
    ];

    const viewResult = await query(insertViewQuery, viewParams);

    // Update image view count (atomic increment)
    await query(`
      UPDATE portfolio_images 
      SET views_count = views_count + 1,
          last_viewed_at = NOW()
      WHERE id = $1
    `, [imageId]);

    // Update professional metrics
    await query(`
      INSERT INTO professional_marketplace_metrics (
        user_id, portfolio_views_total
      ) VALUES ($1, 1)
      ON CONFLICT (user_id) DO UPDATE SET 
        portfolio_views_total = professional_marketplace_metrics.portfolio_views_total + 1,
        last_portfolio_view = NOW()
    `, [image.user_id]);

    // Invalidate relevant caches
    await Promise.all([
      cacheService.invalidateCache(`portfolio:${image.user_id}`),
      cacheService.invalidateCache(`analytics:portfolio:${imageId}`),
      cacheService.invalidateCache(`analytics:professional:${image.user_id}`)
    ]);

    logger.info('Portfolio view tracked', {
      category: 'analytics',
      image_id: imageId,
      viewer_id: viewerId,
      view_source,
      professional_id: image.user_id
    });

    res.json({
      success: true,
      message: 'Vista registrada exitosamente',
      view_id: viewResult.rows[0].id
    });

  } catch (error) {
    logger.error('Track portfolio view error', {
      category: 'analytics',
      image_id: req.params.imageId,
      viewer_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al registrar vista'
    });
  }
};

// Like/unlike portfolio image
exports.togglePortfolioLike = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.user.id;
    const { reaction_type = 'like' } = req.body; // 'like', 'love', 'wow', 'helpful'

    // Validate reaction type
    const validReactions = ['like', 'love', 'wow', 'helpful'];
    if (!validReactions.includes(reaction_type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de reacción inválido'
      });
    }

    // Verify image exists and is viewable
    const imageQuery = `
      SELECT 
        pi.id, 
        pi.user_id, 
        pi.title,
        pi.is_marketplace_visible,
        pi.moderation_status
      FROM portfolio_images pi
      WHERE pi.id = $1 AND pi.moderation_status = 'approved'
    `;
    
    const imageResult = await query(imageQuery, [imageId]);
    
    if (imageResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Imagen no encontrada'
      });
    }

    const image = imageResult.rows[0];

    // Check if already liked
    const existingLikeQuery = `
      SELECT id, reaction_type FROM portfolio_image_likes 
      WHERE image_id = $1 AND user_id = $2
    `;
    const existingLike = await query(existingLikeQuery, [imageId, userId]);

    let action, message;
    
    if (existingLike.rows.length > 0) {
      const currentReaction = existingLike.rows[0].reaction_type;
      
      if (currentReaction === reaction_type) {
        // Same reaction - remove like
        await query(`
          DELETE FROM portfolio_image_likes 
          WHERE image_id = $1 AND user_id = $2
        `, [imageId, userId]);
        
        // Update count
        await query(`
          UPDATE portfolio_images 
          SET likes_count = GREATEST(likes_count - 1, 0)
          WHERE id = $1
        `, [imageId]);
        
        action = 'unliked';
        message = 'Reacción eliminada';
      } else {
        // Different reaction - update
        await query(`
          UPDATE portfolio_image_likes 
          SET reaction_type = $1, updated_at = NOW()
          WHERE image_id = $2 AND user_id = $3
        `, [reaction_type, imageId, userId]);
        
        action = 'updated';
        message = 'Reacción actualizada';
      }
    } else {
      // New like
      await query(`
        INSERT INTO portfolio_image_likes (
          image_id, user_id, reaction_type
        ) VALUES ($1, $2, $3)
      `, [imageId, userId, reaction_type]);
      
      // Update count
      await query(`
        UPDATE portfolio_images 
        SET likes_count = likes_count + 1
        WHERE id = $1
      `, [imageId]);
      
      action = 'liked';
      message = 'Reacción agregada';
    }

    // Update professional metrics
    if (action === 'liked') {
      await query(`
        INSERT INTO professional_marketplace_metrics (
          user_id, portfolio_likes_total
        ) VALUES ($1, 1)
        ON CONFLICT (user_id) DO UPDATE SET 
          portfolio_likes_total = professional_marketplace_metrics.portfolio_likes_total + 1,
          last_portfolio_like = NOW()
      `, [image.user_id]);
    } else if (action === 'unliked') {
      await query(`
        UPDATE professional_marketplace_metrics 
        SET portfolio_likes_total = GREATEST(portfolio_likes_total - 1, 0)
        WHERE user_id = $1
      `, [image.user_id]);
    }

    // Get updated like count and user's current reaction
    const updatedQuery = `
      SELECT 
        pi.likes_count,
        pil.reaction_type as user_reaction
      FROM portfolio_images pi
      LEFT JOIN portfolio_image_likes pil ON pi.id = pil.image_id AND pil.user_id = $2
      WHERE pi.id = $1
    `;
    const updatedResult = await query(updatedQuery, [imageId, userId]);
    const updated = updatedResult.rows[0];

    // Invalidate caches
    await Promise.all([
      cacheService.invalidateCache(`portfolio:${image.user_id}`),
      cacheService.invalidateCache(`analytics:portfolio:${imageId}`),
      cacheService.invalidateCache(`analytics:professional:${image.user_id}`)
    ]);

    logger.info('Portfolio like toggled', {
      category: 'analytics',
      image_id: imageId,
      user_id: userId,
      action,
      reaction_type,
      professional_id: image.user_id
    });

    res.json({
      success: true,
      message,
      action,
      reaction_type: updated.user_reaction,
      likes_count: parseInt(updated.likes_count)
    });

  } catch (error) {
    logger.error('Toggle portfolio like error', {
      category: 'analytics',
      image_id: req.params.imageId,
      user_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al procesar reacción'
    });
  }
};

// Get professional analytics dashboard
exports.getProfessionalAnalytics = async (req, res) => {
  try {
    const professionalId = req.params.professionalId || req.user.id;
    const requestingUserId = req.user.id;
    const {
      time_period = '30', // days
      include_detailed = false
    } = req.query;

    // Verify permissions
    if (professionalId !== requestingUserId.toString() && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para ver estas métricas'
      });
    }

    // Check cache
    const cacheKey = `analytics:professional:${professionalId}:${time_period}:${include_detailed}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        ...cached,
        cached: true
      });
    }

    const timePeriodClause = `AND created_at >= CURRENT_DATE - INTERVAL '${parseInt(time_period)} days'`;

    // Portfolio performance metrics
    const portfolioMetricsQuery = `
      SELECT 
        COUNT(*) as total_images,
        SUM(views_count) as total_views,
        SUM(likes_count) as total_likes,
        AVG(views_count) as avg_views_per_image,
        COUNT(*) FILTER (WHERE is_featured = true) as featured_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '${parseInt(time_period)} days') as recent_uploads,
        COUNT(*) FILTER (WHERE views_count > 0) as viewed_images,
        COUNT(*) FILTER (WHERE likes_count > 0) as liked_images
      FROM portfolio_images 
      WHERE user_id = $1 AND moderation_status = 'approved'
    `;

    // View trends over time
    const viewTrendsQuery = `
      SELECT 
        DATE_TRUNC('day', viewed_at) as date,
        COUNT(*) as views,
        COUNT(DISTINCT viewer_id) as unique_viewers,
        COUNT(DISTINCT image_id) as images_viewed
      FROM portfolio_image_views piv
      JOIN portfolio_images pi ON piv.image_id = pi.id
      WHERE pi.user_id = $1 
      AND piv.viewed_at >= CURRENT_DATE - INTERVAL '${parseInt(time_period)} days'
      GROUP BY DATE_TRUNC('day', viewed_at)
      ORDER BY date DESC
    `;

    // Like trends over time
    const likeTrendsQuery = `
      SELECT 
        DATE_TRUNC('day', pil.created_at) as date,
        COUNT(*) as likes,
        COUNT(DISTINCT pil.user_id) as unique_likers,
        json_object_agg(pil.reaction_type, reaction_count) as reaction_breakdown
      FROM portfolio_image_likes pil
      JOIN portfolio_images pi ON pil.image_id = pi.id
      JOIN (
        SELECT 
          DATE_TRUNC('day', created_at) as day,
          reaction_type,
          COUNT(*) as reaction_count
        FROM portfolio_image_likes pil2
        JOIN portfolio_images pi2 ON pil2.image_id = pi2.id
        WHERE pi2.user_id = $1
        AND pil2.created_at >= CURRENT_DATE - INTERVAL '${parseInt(time_period)} days'
        GROUP BY day, reaction_type
      ) reactions ON DATE_TRUNC('day', pil.created_at) = reactions.day
      WHERE pi.user_id = $1 
      AND pil.created_at >= CURRENT_DATE - INTERVAL '${parseInt(time_period)} days'
      GROUP BY DATE_TRUNC('day', pil.created_at)
      ORDER BY date DESC
    `;

    // Top performing images
    const topImagesQuery = `
      SELECT 
        pi.id,
        pi.title,
        pi.thumbnail_path,
        pi.views_count,
        pi.likes_count,
        pi.created_at,
        (pi.views_count * 0.3 + pi.likes_count * 0.7) as engagement_score,
        c.name as category_name
      FROM portfolio_images pi
      LEFT JOIN categories c ON pi.category_id = c.id
      WHERE pi.user_id = $1 AND pi.moderation_status = 'approved'
      ORDER BY engagement_score DESC
      LIMIT 10
    `;

    // Source breakdown
    const sourceBreakdownQuery = `
      SELECT 
        view_source,
        COUNT(*) as views,
        COUNT(DISTINCT viewer_id) as unique_viewers
      FROM portfolio_image_views piv
      JOIN portfolio_images pi ON piv.image_id = pi.id
      WHERE pi.user_id = $1 
      AND piv.viewed_at >= CURRENT_DATE - INTERVAL '${parseInt(time_period)} days'
      GROUP BY view_source
      ORDER BY views DESC
    `;

    // Professional marketplace metrics
    const marketplaceMetricsQuery = `
      SELECT * FROM professional_marketplace_metrics 
      WHERE user_id = $1
    `;

    const [
      portfolioMetrics,
      viewTrends,
      likeTrends,
      topImages,
      sourceBreakdown,
      marketplaceMetrics
    ] = await Promise.all([
      query(portfolioMetricsQuery, [professionalId]),
      query(viewTrendsQuery, [professionalId]),
      query(likeTrendsQuery, [professionalId]),
      query(topImagesQuery, [professionalId]),
      query(sourceBreakdownQuery, [professionalId]),
      query(marketplaceMetricsQuery, [professionalId])
    ]);

    // Calculate engagement rate
    const portfolio = portfolioMetrics.rows[0];
    const engagementRate = portfolio.total_views > 0 
      ? (parseFloat(portfolio.total_likes) / parseFloat(portfolio.total_views)) * 100 
      : 0;

    // Calculate trends (compare to previous period)
    const previousPeriodQuery = `
      SELECT 
        COUNT(*) as prev_views,
        COUNT(DISTINCT viewer_id) as prev_unique_viewers
      FROM portfolio_image_views piv
      JOIN portfolio_images pi ON piv.image_id = pi.id
      WHERE pi.user_id = $1 
      AND piv.viewed_at >= CURRENT_DATE - INTERVAL '${parseInt(time_period) * 2} days'
      AND piv.viewed_at < CURRENT_DATE - INTERVAL '${parseInt(time_period)} days'
    `;

    const previousPeriod = await query(previousPeriodQuery, [professionalId]);
    const currentViews = viewTrends.rows.reduce((sum, day) => sum + parseInt(day.views), 0);
    const previousViews = parseInt(previousPeriod.rows[0]?.prev_views || 0);
    const viewsGrowth = previousViews > 0 
      ? ((currentViews - previousViews) / previousViews * 100).toFixed(1)
      : currentViews > 0 ? 100 : 0;

    const response = {
      success: true,
      analytics: {
        overview: {
          total_images: parseInt(portfolio.total_images),
          total_views: parseInt(portfolio.total_views),
          total_likes: parseInt(portfolio.total_likes),
          engagement_rate: parseFloat(engagementRate.toFixed(2)),
          avg_views_per_image: parseFloat(parseFloat(portfolio.avg_views_per_image || 0).toFixed(2)),
          featured_count: parseInt(portfolio.featured_count),
          recent_uploads: parseInt(portfolio.recent_uploads),
          performance_score: marketplaceMetrics.rows[0]?.ranking_score || 0
        },
        trends: {
          views_growth: parseFloat(viewsGrowth),
          daily_views: viewTrends.rows,
          daily_likes: likeTrends.rows,
          source_breakdown: sourceBreakdown.rows
        },
        top_performing: topImages.rows,
        marketplace_metrics: marketplaceMetrics.rows[0] || null,
        time_period: `${time_period} days`
      }
    };

    // Add detailed analytics if requested
    if (include_detailed === 'true') {
      // Additional detailed queries would go here
      // For now, we'll include basic detailed info
      response.analytics.detailed = {
        image_performance: topImages.rows,
        viewer_demographics: [], // Could be implemented with location data
        conversion_funnel: {} // Could track view -> contact -> booking flow
      };
    }

    // Cache for 1 hour
    await cacheService.set(cacheKey, response, 3600);

    logger.info('Professional analytics retrieved', {
      category: 'analytics',
      professional_id: professionalId,
      requesting_user: requestingUserId,
      time_period
    });

    res.json(response);

  } catch (error) {
    logger.error('Get professional analytics error', {
      category: 'analytics',
      professional_id: req.params.professionalId,
      user_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al obtener métricas del profesional'
    });
  }
};

// Get portfolio image analytics
exports.getPortfolioImageAnalytics = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const ownershipQuery = `
      SELECT user_id FROM portfolio_images 
      WHERE id = $1
    `;
    const ownershipResult = await query(ownershipQuery, [imageId]);

    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Imagen no encontrada'
      });
    }

    if (ownershipResult.rows[0].user_id !== userId && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para ver estas métricas'
      });
    }

    // Check cache
    const cacheKey = `analytics:portfolio:${imageId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        ...cached,
        cached: true
      });
    }

    // Image analytics query
    const analyticsQuery = `
      SELECT 
        pi.id,
        pi.title,
        pi.views_count,
        pi.likes_count,
        pi.created_at,
        pi.last_viewed_at,
        -- View breakdown by source
        (
          SELECT json_object_agg(view_source, view_count)
          FROM (
            SELECT view_source, COUNT(*) as view_count
            FROM portfolio_image_views 
            WHERE image_id = pi.id
            GROUP BY view_source
          ) source_stats
        ) as view_sources,
        -- Like breakdown by reaction type
        (
          SELECT json_object_agg(reaction_type, reaction_count)
          FROM (
            SELECT reaction_type, COUNT(*) as reaction_count
            FROM portfolio_image_likes 
            WHERE image_id = pi.id
            GROUP BY reaction_type
          ) reaction_stats
        ) as reaction_breakdown,
        -- Daily view trends (last 30 days)
        (
          SELECT json_agg(json_build_object('date', view_date, 'views', view_count))
          FROM (
            SELECT 
              DATE_TRUNC('day', viewed_at) as view_date,
              COUNT(*) as view_count
            FROM portfolio_image_views 
            WHERE image_id = pi.id
            AND viewed_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE_TRUNC('day', viewed_at)
            ORDER BY view_date DESC
          ) daily_views
        ) as daily_view_trends
      FROM portfolio_images pi
      WHERE pi.id = $1
    `;

    const result = await query(analyticsQuery, [imageId]);
    const analytics = result.rows[0];

    const response = {
      success: true,
      image_analytics: analytics
    };

    // Cache for 30 minutes
    await cacheService.set(cacheKey, response, 1800);

    logger.info('Portfolio image analytics retrieved', {
      category: 'analytics',
      image_id: imageId,
      user_id: userId
    });

    res.json(response);

  } catch (error) {
    logger.error('Get portfolio image analytics error', {
      category: 'analytics',
      image_id: req.params.imageId,
      user_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al obtener métricas de la imagen'
    });
  }
};

module.exports = exports;