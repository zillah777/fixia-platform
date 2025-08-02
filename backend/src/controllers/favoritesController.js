const { query } = require('../config/database');
const cacheService = require('../services/cacheService');
const { CACHE_TTL } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Favorites Controller - Enterprise-grade wishlist management
 * 
 * Handles:
 * - Adding/removing professionals, services, and portfolio items to favorites
 * - Wishlist categorization and organization
 * - Privacy controls and permission management
 * - Bulk operations and list management
 * - Analytics and insights for favorites
 */

// Add item to favorites
exports.addToFavorites = async (req, res) => {
  try {
    const explorerId = req.user.id;
    const {
      favorite_type, // 'professional', 'service', 'portfolio_image'
      favorited_user_id,
      favorited_service_id,
      favorited_image_id,
      category = 'general', // 'urgent', 'future', 'inspiration', 'general'
      priority = 3, // 1-5 scale
      private_notes
    } = req.body;

    // Validate user type
    if (req.user.user_type !== 'client') {
      return res.status(403).json({
        success: false,
        error: 'Solo los exploradores pueden agregar favoritos'
      });
    }

    // Validate required fields based on favorite type
    if (!favorite_type || !['professional', 'service', 'portfolio_image'].includes(favorite_type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de favorito inválido'
      });
    }

    let targetId, targetQuery, targetParams;

    switch (favorite_type) {
      case 'professional':
        if (!favorited_user_id) {
          return res.status(400).json({
            success: false,
            error: 'ID de profesional requerido'
          });
        }
        targetId = favorited_user_id;
        targetQuery = 'SELECT id, first_name, last_name, professional_title, featured_image_url FROM users WHERE id = $1 AND user_type = $2 AND is_active = true';
        targetParams = [favorited_user_id, 'provider'];
        break;

      case 'service':
        if (!favorited_service_id) {
          return res.status(400).json({
            success: false,
            error: 'ID de servicio requerido'
          });
        }
        targetId = favorited_service_id;
        targetQuery = 'SELECT s.id, s.title, s.price, u.first_name, u.last_name FROM services s JOIN users u ON s.user_id = u.id WHERE s.id = $1 AND s.is_active = true';
        targetParams = [favorited_service_id];
        break;

      case 'portfolio_image':
        if (!favorited_image_id) {
          return res.status(400).json({
            success: false,
            error: 'ID de imagen requerido'
          });
        }
        targetId = favorited_image_id;
        targetQuery = 'SELECT pi.id, pi.title, pi.thumbnail_path, u.first_name, u.last_name FROM portfolio_images pi JOIN users u ON pi.user_id = u.id WHERE pi.id = $1 AND pi.is_marketplace_visible = true AND pi.moderation_status = $2';
        targetParams = [favorited_image_id, 'approved'];
        break;
    }

    // Verify target exists
    const targetResult = await query(targetQuery, targetParams);
    if (targetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'El elemento que intentas agregar a favoritos no existe o no está disponible'
      });
    }

    const target = targetResult.rows[0];

    // Check if already favorited
    const existingQuery = `
      SELECT id FROM explorer_favorites 
      WHERE explorer_id = $1 
      AND favorite_type = $2 
      AND favorited_user_id = $3
      AND favorited_service_id = $4
      AND favorited_image_id = $5
    `;
    
    const existingResult = await query(existingQuery, [
      explorerId,
      favorite_type,
      favorited_user_id || null,
      favorited_service_id || null,
      favorited_image_id || null
    ]);

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Este elemento ya está en tus favoritos'
      });
    }

    // Insert new favorite
    const insertQuery = `
      INSERT INTO explorer_favorites (
        explorer_id, favorite_type, favorited_user_id, 
        favorited_service_id, favorited_image_id, 
        category, priority, private_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const insertParams = [
      explorerId,
      favorite_type,
      favorited_user_id || null,
      favorited_service_id || null,
      favorited_image_id || null,
      category,
      priority,
      private_notes || null
    ];

    const result = await query(insertQuery, insertParams);
    const favorite = result.rows[0];

    // Invalidate cache
    await cacheService.invalidateUserCache(explorerId);
    await cacheService.invalidateCache(`favorites:${explorerId}`);

    logger.info('Item added to favorites', {
      category: 'favorites',
      explorer_id: explorerId,
      favorite_type,
      target_id: targetId,
      favorite_category: category
    });

    res.status(201).json({
      success: true,
      message: 'Elemento agregado a favoritos exitosamente',
      favorite: {
        ...favorite,
        target_info: target
      }
    });

  } catch (error) {
    logger.error('Add to favorites error', {
      category: 'favorites',
      user_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al agregar a favoritos'
    });
  }
};

// Get user's favorites
exports.getFavorites = async (req, res) => {
  try {
    const explorerId = req.user.id;
    const {
      favorite_type = 'all', // 'all', 'professional', 'service', 'portfolio_image'
      category = 'all', // 'all', 'urgent', 'future', 'inspiration', 'general'
      sort = 'priority', // 'priority', 'newest', 'oldest', 'alphabetical'
      page = 1,
      limit = 20
    } = req.query;

    // Validate user type
    if (req.user.user_type !== 'client') {
      return res.status(403).json({
        success: false,
        error: 'Solo los exploradores pueden ver favoritos'
      });
    }

    // Check cache
    const cacheKey = `favorites:${explorerId}:${favorite_type}:${category}:${sort}:${page}:${limit}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        ...cached,
        cached: true
      });
    }

    // Build WHERE conditions
    let whereConditions = ['ef.explorer_id = $1'];
    let params = [explorerId];
    let paramIndex = 2;

    if (favorite_type !== 'all') {
      whereConditions.push(`ef.favorite_type = $${paramIndex}`);
      params.push(favorite_type);
      paramIndex++;
    }

    if (category !== 'all') {
      whereConditions.push(`ef.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    // Build ORDER BY clause
    let orderClause;
    switch (sort) {
      case 'newest':
        orderClause = 'ORDER BY ef.created_at DESC';
        break;
      case 'oldest':
        orderClause = 'ORDER BY ef.created_at ASC';
        break;
      case 'alphabetical':
        orderClause = `ORDER BY 
          CASE 
            WHEN ef.favorite_type = 'professional' THEN u.first_name
            WHEN ef.favorite_type = 'service' THEN s.title
            WHEN ef.favorite_type = 'portfolio_image' THEN pi.title
          END ASC`;
        break;
      case 'priority':
      default:
        orderClause = 'ORDER BY ef.priority DESC, ef.created_at DESC';
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Main query with all favorite types
    const favoritesQuery = `
      SELECT 
        ef.id,
        ef.favorite_type,
        ef.category,
        ef.priority,
        ef.private_notes,
        ef.created_at,
        -- Professional info
        CASE WHEN ef.favorite_type = 'professional' THEN
          json_build_object(
            'id', u.id,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'professional_title', u.professional_title,
            'featured_image_url', u.featured_image_url,
            'location', u.location,
            'locality', u.locality,
            'average_rating', u.average_rating,
            'review_count', u.review_count,
            'is_verified', u.is_verified,
            'availability_status', u.availability_status
          )
        END as professional_info,
        -- Service info
        CASE WHEN ef.favorite_type = 'service' THEN
          json_build_object(
            'id', s.id,
            'title', s.title,
            'description', s.description,
            'price', s.price,
            'service_type', s.service_type,
            'duration', s.duration,
            'professional_name', su.first_name || ' ' || su.last_name,
            'professional_avatar', su.featured_image_url
          )
        END as service_info,
        -- Portfolio image info
        CASE WHEN ef.favorite_type = 'portfolio_image' THEN
          json_build_object(
            'id', pi.id,
            'title', pi.title,
            'description', pi.description,
            'thumbnail_path', pi.thumbnail_path,
            'views_count', pi.views_count,
            'likes_count', pi.likes_count,
            'professional_name', piu.first_name || ' ' || piu.last_name,
            'professional_avatar', piu.featured_image_url,
            'category_name', pic.name
          )
        END as portfolio_image_info
      FROM explorer_favorites ef
      -- Professional joins
      LEFT JOIN users u ON ef.favorite_type = 'professional' 
        AND ef.favorited_user_id = u.id 
        AND u.is_active = true
      -- Service joins  
      LEFT JOIN services s ON ef.favorite_type = 'service' 
        AND ef.favorited_service_id = s.id 
        AND s.is_active = true
      LEFT JOIN users su ON s.user_id = su.id
      -- Portfolio image joins
      LEFT JOIN portfolio_images pi ON ef.favorite_type = 'portfolio_image' 
        AND ef.favorited_image_id = pi.id 
        AND pi.is_marketplace_visible = true 
        AND pi.moderation_status = 'approved'
      LEFT JOIN users piu ON pi.user_id = piu.id
      LEFT JOIN categories pic ON pi.category_id = pic.id
      WHERE ${whereConditions.join(' AND ')}
      AND (
        (ef.favorite_type = 'professional' AND u.id IS NOT NULL) OR
        (ef.favorite_type = 'service' AND s.id IS NOT NULL) OR
        (ef.favorite_type = 'portfolio_image' AND pi.id IS NOT NULL)
      )
      ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM explorer_favorites ef
      LEFT JOIN users u ON ef.favorite_type = 'professional' 
        AND ef.favorited_user_id = u.id 
        AND u.is_active = true
      LEFT JOIN services s ON ef.favorite_type = 'service' 
        AND ef.favorited_service_id = s.id 
        AND s.is_active = true
      LEFT JOIN portfolio_images pi ON ef.favorite_type = 'portfolio_image' 
        AND ef.favorited_image_id = pi.id 
        AND pi.is_marketplace_visible = true 
        AND pi.moderation_status = 'approved'
      WHERE ${whereConditions.join(' AND ')}
      AND (
        (ef.favorite_type = 'professional' AND u.id IS NOT NULL) OR
        (ef.favorite_type = 'service' AND s.id IS NOT NULL) OR
        (ef.favorite_type = 'portfolio_image' AND pi.id IS NOT NULL)
      )
    `;

    const [favoritesResult, countResult] = await Promise.all([
      query(favoritesQuery, params),
      query(countQuery, params.slice(0, -2))
    ]);

    const favorites = favoritesResult.rows;
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Get favorites summary by category and type
    const summaryQuery = `
      SELECT 
        favorite_type,
        category,
        COUNT(*) as count
      FROM explorer_favorites ef
      LEFT JOIN users u ON ef.favorite_type = 'professional' 
        AND ef.favorited_user_id = u.id 
        AND u.is_active = true
      LEFT JOIN services s ON ef.favorite_type = 'service' 
        AND ef.favorited_service_id = s.id 
        AND s.is_active = true
      LEFT JOIN portfolio_images pi ON ef.favorite_type = 'portfolio_image' 
        AND ef.favorited_image_id = pi.id 
        AND pi.is_marketplace_visible = true 
        AND pi.moderation_status = 'approved'
      WHERE ef.explorer_id = $1
      AND (
        (ef.favorite_type = 'professional' AND u.id IS NOT NULL) OR
        (ef.favorite_type = 'service' AND s.id IS NOT NULL) OR
        (ef.favorite_type = 'portfolio_image' AND pi.id IS NOT NULL)
      )
      GROUP BY favorite_type, category
      ORDER BY favorite_type, category
    `;

    const summaryResult = await query(summaryQuery, [explorerId]);

    const response = {
      success: true,
      favorites,
      summary: summaryResult.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      },
      filters_applied: {
        favorite_type,
        category,
        sort
      }
    };

    // Cache for 5 minutes
    await cacheService.set(cacheKey, response, 300);

    logger.info('Favorites retrieved', {
      category: 'favorites',
      explorer_id: explorerId,
      filters: response.filters_applied,
      count: favorites.length
    });

    res.json(response);

  } catch (error) {
    logger.error('Get favorites error', {
      category: 'favorites',
      user_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al obtener favoritos'
    });
  }
};

// Remove from favorites
exports.removeFromFavorites = async (req, res) => {
  try {
    const { favoriteId } = req.params;
    const explorerId = req.user.id;

    // Validate user type
    if (req.user.user_type !== 'client') {
      return res.status(403).json({
        success: false,
        error: 'Solo los exploradores pueden eliminar favoritos'
      });
    }

    // Verify ownership and get favorite info
    const favoriteQuery = `
      SELECT * FROM explorer_favorites 
      WHERE id = $1 AND explorer_id = $2
    `;
    const favoriteResult = await query(favoriteQuery, [favoriteId, explorerId]);

    if (favoriteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Favorito no encontrado'
      });
    }

    const favorite = favoriteResult.rows[0];

    // Delete favorite
    const deleteQuery = `
      DELETE FROM explorer_favorites 
      WHERE id = $1 AND explorer_id = $2
    `;
    await query(deleteQuery, [favoriteId, explorerId]);

    // Invalidate cache
    await cacheService.invalidateUserCache(explorerId);
    await cacheService.invalidateCache(`favorites:${explorerId}`);

    logger.info('Item removed from favorites', {
      category: 'favorites',
      explorer_id: explorerId,
      favorite_id: favoriteId,
      favorite_type: favorite.favorite_type
    });

    res.json({
      success: true,
      message: 'Elemento eliminado de favoritos exitosamente'
    });

  } catch (error) {
    logger.error('Remove from favorites error', {
      category: 'favorites',
      user_id: req.user?.id,
      favorite_id: req.params.favoriteId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al eliminar de favoritos'
    });
  }
};

// Update favorite (notes, category, priority)
exports.updateFavorite = async (req, res) => {
  try {
    const { favoriteId } = req.params;
    const explorerId = req.user.id;
    const { category, priority, private_notes } = req.body;

    // Validate user type
    if (req.user.user_type !== 'client') {
      return res.status(403).json({
        success: false,
        error: 'Solo los exploradores pueden actualizar favoritos'
      });
    }

    // Verify ownership
    const ownershipQuery = `
      SELECT * FROM explorer_favorites 
      WHERE id = $1 AND explorer_id = $2
    `;
    const ownershipResult = await query(ownershipQuery, [favoriteId, explorerId]);

    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Favorito no encontrado'
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (category !== undefined) {
      updates.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    if (private_notes !== undefined) {
      updates.push(`private_notes = $${paramIndex}`);
      params.push(private_notes);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron campos para actualizar'
      });
    }

    // Add updated_at
    updates.push(`updated_at = NOW()`);

    // Add WHERE clause parameters
    params.push(favoriteId, explorerId);

    const updateQuery = `
      UPDATE explorer_favorites 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND explorer_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await query(updateQuery, params);

    // Invalidate cache
    await cacheService.invalidateUserCache(explorerId);
    await cacheService.invalidateCache(`favorites:${explorerId}`);

    logger.info('Favorite updated', {
      category: 'favorites',
      explorer_id: explorerId,
      favorite_id: favoriteId,
      updated_fields: Object.keys(req.body)
    });

    res.json({
      success: true,
      message: 'Favorito actualizado exitosamente',
      favorite: result.rows[0]
    });

  } catch (error) {
    logger.error('Update favorite error', {
      category: 'favorites',
      user_id: req.user?.id,
      favorite_id: req.params.favoriteId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al actualizar favorito'
    });
  }
};

// Bulk operations on favorites
exports.bulkUpdateFavorites = async (req, res) => {
  try {
    const explorerId = req.user.id;
    const { 
      action, // 'delete', 'update_category', 'update_priority'
      favorite_ids,
      category,
      priority
    } = req.body;

    // Validate user type
    if (req.user.user_type !== 'client') {
      return res.status(403).json({
        success: false,
        error: 'Solo los exploradores pueden realizar operaciones en favoritos'
      });
    }

    if (!favorite_ids || !Array.isArray(favorite_ids) || favorite_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Lista de IDs de favoritos requerida'
      });
    }

    if (!action || !['delete', 'update_category', 'update_priority'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Acción inválida'
      });
    }

    // Verify all favorites belong to the user
    const verifyQuery = `
      SELECT id FROM explorer_favorites 
      WHERE id = ANY($1) AND explorer_id = $2
    `;
    const verifyResult = await query(verifyQuery, [favorite_ids, explorerId]);

    if (verifyResult.rows.length !== favorite_ids.length) {
      return res.status(403).json({
        success: false,
        error: 'Algunos favoritos no te pertenecen'
      });
    }

    let operationQuery;
    let params;
    let successMessage;

    switch (action) {
      case 'delete':
        operationQuery = `
          DELETE FROM explorer_favorites 
          WHERE id = ANY($1) AND explorer_id = $2
        `;
        params = [favorite_ids, explorerId];
        successMessage = `${favorite_ids.length} favoritos eliminados exitosamente`;
        break;

      case 'update_category':
        if (!category) {
          return res.status(400).json({
            success: false,
            error: 'Categoría requerida para actualización'
          });
        }
        operationQuery = `
          UPDATE explorer_favorites 
          SET category = $1, updated_at = NOW()
          WHERE id = ANY($2) AND explorer_id = $3
        `;
        params = [category, favorite_ids, explorerId];
        successMessage = `Categoría actualizada para ${favorite_ids.length} favoritos`;
        break;

      case 'update_priority':
        if (priority === undefined || priority === null) {
          return res.status(400).json({
            success: false,
            error: 'Prioridad requerida para actualización'
          });
        }
        operationQuery = `
          UPDATE explorer_favorites 
          SET priority = $1, updated_at = NOW()
          WHERE id = ANY($2) AND explorer_id = $3
        `;
        params = [priority, favorite_ids, explorerId];
        successMessage = `Prioridad actualizada para ${favorite_ids.length} favoritos`;
        break;
    }

    await query(operationQuery, params);

    // Invalidate cache
    await cacheService.invalidateUserCache(explorerId);
    await cacheService.invalidateCache(`favorites:${explorerId}`);

    logger.info('Bulk favorites operation completed', {
      category: 'favorites',
      explorer_id: explorerId,
      action,
      affected_count: favorite_ids.length
    });

    res.json({
      success: true,
      message: successMessage,
      affected_count: favorite_ids.length
    });

  } catch (error) {
    logger.error('Bulk update favorites error', {
      category: 'favorites',
      user_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al realizar operación en favoritos'
    });
  }
};

module.exports = exports;