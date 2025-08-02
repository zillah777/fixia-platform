const { query } = require('../config/database');
const cacheService = require('../services/cacheService');
const { CACHE_TTL } = require('../config/redis');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

/**
 * Portfolio Controller - Enterprise-grade portfolio management
 * 
 * Handles:
 * - Portfolio image uploads with validation and optimization
 * - Portfolio management (CRUD operations)
 * - Performance tracking and analytics
 * - Featured image management
 * - Privacy controls integration
 */

// Configure multer for portfolio uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/portfolios');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `portfolio-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

const uploadConfig = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 10 // Maximum 10 files per upload
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG y WebP.'));
    }
  }
});

// Upload portfolio images endpoint
exports.uploadPortfolioImages = [
  uploadConfig.array('images', 10),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        category_id, 
        title, 
        description, 
        alt_text,
        tags = '[]',
        project_duration,
        project_value,
        project_location,
        is_featured = false,
        is_marketplace_visible = true,
        is_profile_visible = true
      } = req.body;

      // Validate required fields
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Al menos una imagen es requerida'
        });
      }

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          error: 'Título y descripción son requeridos'
        });
      }

      // Check if user is provider
      if (req.user.user_type !== 'provider') {
        return res.status(403).json({
          success: false,
          error: 'Solo los proveedores pueden subir imágenes al portafolio'
        });
      }

      // Parse tags safely
      let parsedTags;
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = [];
      }

      const uploadedImages = [];

      // Process each uploaded file
      for (const file of req.files) {
        try {
          // Get image metadata
          const metadata = await sharp(file.path).metadata();
          
          // Generate optimized versions
          const optimizedPath = file.path.replace(/\.(jpg|jpeg|png)$/i, '-optimized.webp');
          const thumbnailPath = file.path.replace(/\.(jpg|jpeg|png)$/i, '-thumb.webp');

          // Create optimized version (max 1920px width)
          await sharp(file.path)
            .resize(1920, null, { 
              withoutEnlargement: true,
              fit: 'inside'
            })
            .webp({ quality: 85 })
            .toFile(optimizedPath);

          // Create thumbnail (300px width)
          await sharp(file.path)
            .resize(300, 300, { 
              fit: 'cover',
              position: 'center'
            })
            .webp({ quality: 80 })
            .toFile(thumbnailPath);

          // Insert into database
          const insertQuery = `
            INSERT INTO portfolio_images (
              user_id, category_id, title, description, alt_text,
              original_filename, file_path, file_size, mime_type,
              image_width, image_height, tags, project_duration,
              project_value, project_location, is_featured,
              is_marketplace_visible, is_profile_visible,
              optimized_path, thumbnail_path, moderation_status
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
            ) RETURNING *
          `;

          const insertParams = [
            userId,
            category_id || null,
            title,
            description,
            alt_text || title,
            file.originalname,
            file.path,
            file.size,
            file.mimetype,
            metadata.width,
            metadata.height,
            JSON.stringify(parsedTags),
            project_duration || null,
            project_value ? parseFloat(project_value) : null,
            project_location || null,
            is_featured === 'true' || is_featured === true,
            is_marketplace_visible === 'true' || is_marketplace_visible === true,
            is_profile_visible === 'true' || is_profile_visible === true,
            optimizedPath,
            thumbnailPath,
            'approved' // Auto-approve for now, can implement moderation later
          ];

          const result = await query(insertQuery, insertParams);
          uploadedImages.push(result.rows[0]);

          logger.info('Portfolio image uploaded successfully', {
            category: 'portfolio',
            user_id: userId,
            image_id: result.rows[0].id,
            filename: file.originalname,
            size: file.size
          });

        } catch (imageError) {
          logger.error('Error processing portfolio image', {
            category: 'portfolio',
            user_id: userId,
            filename: file.originalname,
            error: imageError.message
          });
          
          // Clean up file on error
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            logger.error('Error cleaning up failed upload', { error: unlinkError.message });
          }
        }
      }

      // Invalidate cache
      await cacheService.invalidateUserCache(userId);
      await cacheService.invalidateCache(`portfolio:${userId}`);

      // Update professional metrics
      await query(`
        INSERT INTO professional_marketplace_metrics (
          user_id, portfolio_images_count, portfolio_views_total,
          portfolio_likes_total, last_portfolio_update
        ) VALUES ($1, $2, 0, 0, NOW())
        ON CONFLICT (user_id) DO UPDATE SET 
          portfolio_images_count = portfolio_images_count + $2,
          last_portfolio_update = NOW()
      `, [userId, uploadedImages.length]);

      res.status(201).json({
        success: true,
        message: `${uploadedImages.length} imágenes subidas exitosamente`,
        images: uploadedImages,
        uploaded_count: uploadedImages.length,
        failed_count: req.files.length - uploadedImages.length
      });

    } catch (error) {
      logger.error('Portfolio upload error', {
        category: 'portfolio',
        user_id: req.user?.id,
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor al subir imágenes'
      });
    }
  }
];

// Get portfolio for a professional
exports.getPortfolio = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id;
    const { 
      category_id, 
      page = 1, 
      limit = 20,
      include_private = false,
      sort = 'featured_first'
    } = req.query;

    // Check cache first
    const cacheKey = `portfolio:${userId}:${category_id || 'all'}:${page}:${limit}:${sort}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        ...cached,
        cached: true
      });
    }

    // Check privacy settings
    const privacyQuery = `
      SELECT * FROM as_privacy_settings 
      WHERE user_id = $1
    `;
    const privacyResult = await query(privacyQuery, [userId]);
    const privacy = privacyResult.rows[0];

    // Build WHERE conditions based on privacy and requesting user
    let whereConditions = ['pi.user_id = $1', 'pi.moderation_status = $2'];
    let params = [userId, 'approved'];
    let paramIndex = 3;

    // Privacy enforcement
    if (requestingUserId !== parseInt(userId)) {
      // Not the owner, apply privacy restrictions
      if (privacy?.portfolio_visibility === 'private') {
        return res.status(403).json({
          success: false,
          error: 'El portafolio de este profesional es privado'
        });
      }

      if (privacy?.portfolio_visibility === 'clients_only') {
        // Check if requester is a client of this professional
        const clientCheckQuery = `
          SELECT 1 FROM bookings 
          WHERE professional_id = $1 AND client_id = $2 
          AND status IN ('completed', 'confirmed')
          LIMIT 1
        `;
        const clientCheck = await query(clientCheckQuery, [userId, requestingUserId]);
        
        if (clientCheck.rows.length === 0) {
          return res.status(403).json({
            success: false,
            error: 'Solo los clientes de este profesional pueden ver su portafolio'
          });
        }
      }

      // Apply marketplace visibility
      if (!include_private || include_private === 'false') {
        whereConditions.push('pi.is_marketplace_visible = true');
      }
    }

    // Category filter
    if (category_id && category_id !== 'all') {
      whereConditions.push(`pi.category_id = $${paramIndex}`);
      params.push(category_id);
      paramIndex++;
    }

    // Build ORDER BY clause
    let orderClause;
    switch (sort) {
      case 'featured_first':
        orderClause = 'ORDER BY pi.is_featured DESC, pi.views_count DESC, pi.created_at DESC';
        break;
      case 'most_viewed':
        orderClause = 'ORDER BY pi.views_count DESC, pi.created_at DESC';
        break;
      case 'most_liked':
        orderClause = 'ORDER BY pi.likes_count DESC, pi.created_at DESC';
        break;
      case 'newest':
        orderClause = 'ORDER BY pi.created_at DESC';
        break;
      case 'oldest':
        orderClause = 'ORDER BY pi.created_at ASC';
        break;
      default:
        orderClause = 'ORDER BY pi.is_featured DESC, pi.views_count DESC, pi.created_at DESC';
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Main query with joins
    const portfolioQuery = `
      SELECT 
        pi.*,
        c.name as category_name,
        c.icon as category_icon,
        u.first_name || ' ' || u.last_name as professional_name,
        u.featured_image_url as professional_avatar,
        CASE WHEN pil.user_id IS NOT NULL THEN true ELSE false END as is_liked_by_user
      FROM portfolio_images pi
      LEFT JOIN categories c ON pi.category_id = c.id
      LEFT JOIN users u ON pi.user_id = u.id
      LEFT JOIN portfolio_image_likes pil ON pi.id = pil.image_id AND pil.user_id = $${paramIndex}
      WHERE ${whereConditions.join(' AND ')}
      ${orderClause}
      LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}
    `;

    params.push(requestingUserId || null, limit, offset);

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM portfolio_images pi
      WHERE ${whereConditions.join(' AND ')}
    `;

    const [portfolioResult, countResult] = await Promise.all([
      query(portfolioQuery, params),
      query(countQuery, params.slice(0, paramIndex - 1))
    ]);

    const images = portfolioResult.rows;
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Get portfolio statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_images,
        SUM(views_count) as total_views,
        SUM(likes_count) as total_likes,
        COUNT(*) FILTER (WHERE is_featured = true) as featured_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_uploads
      FROM portfolio_images
      WHERE user_id = $1 AND moderation_status = 'approved'
    `;

    const statsResult = await query(statsQuery, [userId]);
    const stats = statsResult.rows[0];

    const response = {
      success: true,
      images,
      stats: {
        total_images: parseInt(stats.total_images),
        total_views: parseInt(stats.total_views),
        total_likes: parseInt(stats.total_likes),
        featured_count: parseInt(stats.featured_count),
        recent_uploads: parseInt(stats.recent_uploads)
      },
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      }
    };

    // Cache the response for 5 minutes
    await cacheService.set(cacheKey, response, 300);

    res.json(response);

  } catch (error) {
    logger.error('Get portfolio error', {
      category: 'portfolio',
      user_id: req.params.userId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al obtener el portafolio'
    });
  }
};

// Update portfolio image
exports.updatePortfolioImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.user.id;
    const {
      title,
      description,
      alt_text,
      tags,
      category_id,
      project_duration,
      project_value,
      project_location,
      is_featured,
      is_marketplace_visible,
      is_profile_visible
    } = req.body;

    // Verify ownership
    const ownershipQuery = `
      SELECT * FROM portfolio_images 
      WHERE id = $1 AND user_id = $2
    `;
    const ownershipResult = await query(ownershipQuery, [imageId, userId]);

    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Imagen no encontrada o no tienes permisos para editarla'
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      params.push(title);
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(description);
      paramIndex++;
    }

    if (alt_text !== undefined) {
      updates.push(`alt_text = $${paramIndex}`);
      params.push(alt_text);
      paramIndex++;
    }

    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex}`);
      params.push(JSON.stringify(tags));
      paramIndex++;
    }

    if (category_id !== undefined) {
      updates.push(`category_id = $${paramIndex}`);
      params.push(category_id);
      paramIndex++;
    }

    if (project_duration !== undefined) {
      updates.push(`project_duration = $${paramIndex}`);
      params.push(project_duration);
      paramIndex++;
    }

    if (project_value !== undefined) {
      updates.push(`project_value = $${paramIndex}`);
      params.push(project_value ? parseFloat(project_value) : null);
      paramIndex++;
    }

    if (project_location !== undefined) {
      updates.push(`project_location = $${paramIndex}`);
      params.push(project_location);
      paramIndex++;
    }

    if (is_featured !== undefined) {
      updates.push(`is_featured = $${paramIndex}`);
      params.push(is_featured);
      paramIndex++;
    }

    if (is_marketplace_visible !== undefined) {
      updates.push(`is_marketplace_visible = $${paramIndex}`);
      params.push(is_marketplace_visible);
      paramIndex++;
    }

    if (is_profile_visible !== undefined) {
      updates.push(`is_profile_visible = $${paramIndex}`);
      params.push(is_profile_visible);
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
    params.push(imageId, userId);

    const updateQuery = `
      UPDATE portfolio_images 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await query(updateQuery, params);

    // Invalidate cache
    await cacheService.invalidateUserCache(userId);
    await cacheService.invalidateCache(`portfolio:${userId}`);

    logger.info('Portfolio image updated', {
      category: 'portfolio',
      user_id: userId,
      image_id: imageId,
      updated_fields: Object.keys(req.body)
    });

    res.json({
      success: true,
      message: 'Imagen actualizada exitosamente',
      image: result.rows[0]
    });

  } catch (error) {
    logger.error('Update portfolio image error', {
      category: 'portfolio',
      user_id: req.user?.id,
      image_id: req.params.imageId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al actualizar la imagen'
    });
  }
};

// Delete portfolio image
exports.deletePortfolioImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.user.id;

    // Get image info and verify ownership
    const imageQuery = `
      SELECT * FROM portfolio_images 
      WHERE id = $1 AND user_id = $2
    `;
    const imageResult = await query(imageQuery, [imageId, userId]);

    if (imageResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Imagen no encontrada o no tienes permisos para eliminarla'
      });
    }

    const image = imageResult.rows[0];

    // Delete from database first
    const deleteQuery = `
      DELETE FROM portfolio_images 
      WHERE id = $1 AND user_id = $2
    `;
    await query(deleteQuery, [imageId, userId]);

    // Clean up files
    try {
      if (image.file_path) await fs.unlink(image.file_path);
      if (image.optimized_path) await fs.unlink(image.optimized_path);
      if (image.thumbnail_path) await fs.unlink(image.thumbnail_path);
    } catch (fileError) {
      logger.warn('Could not delete portfolio image files', {
        category: 'portfolio',
        image_id: imageId,
        error: fileError.message
      });
    }

    // Update professional metrics
    await query(`
      UPDATE professional_marketplace_metrics 
      SET portfolio_images_count = GREATEST(portfolio_images_count - 1, 0)
      WHERE user_id = $1
    `, [userId]);

    // Invalidate cache
    await cacheService.invalidateUserCache(userId);
    await cacheService.invalidateCache(`portfolio:${userId}`);

    logger.info('Portfolio image deleted', {
      category: 'portfolio',
      user_id: userId,
      image_id: imageId,
      filename: image.original_filename
    });

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });

  } catch (error) {
    logger.error('Delete portfolio image error', {
      category: 'portfolio',
      user_id: req.user?.id,
      image_id: req.params.imageId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al eliminar la imagen'
    });
  }
};

// Set featured image
exports.setFeaturedImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.user.id;
    const { type = 'portfolio' } = req.body; // 'profile' or 'portfolio'

    // Verify ownership
    const ownershipQuery = `
      SELECT * FROM portfolio_images 
      WHERE id = $1 AND user_id = $2
    `;
    const ownershipResult = await query(ownershipQuery, [imageId, userId]);

    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Imagen no encontrada o no tienes permisos para modificarla'
      });
    }

    if (type === 'profile') {
      // Unset current profile featured image
      await query(`
        UPDATE portfolio_images 
        SET is_profile_featured = false 
        WHERE user_id = $1 AND is_profile_featured = true
      `, [userId]);

      // Set new profile featured image
      await query(`
        UPDATE portfolio_images 
        SET is_profile_featured = true 
        WHERE id = $1 AND user_id = $2
      `, [imageId, userId]);

    } else {
      // Toggle portfolio featured status
      await query(`
        UPDATE portfolio_images 
        SET is_featured = NOT is_featured 
        WHERE id = $1 AND user_id = $2
      `, [imageId, userId]);
    }

    // Get updated image
    const updatedResult = await query(ownershipQuery, [imageId, userId]);

    // Invalidate cache
    await cacheService.invalidateUserCache(userId);
    await cacheService.invalidateCache(`portfolio:${userId}`);

    logger.info('Portfolio featured image updated', {
      category: 'portfolio',
      user_id: userId,
      image_id: imageId,
      feature_type: type
    });

    res.json({
      success: true,
      message: `Imagen ${type === 'profile' ? 'de perfil' : 'destacada'} actualizada`,
      image: updatedResult.rows[0]
    });

  } catch (error) {
    logger.error('Set featured image error', {
      category: 'portfolio',
      user_id: req.user?.id,
      image_id: req.params.imageId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al actualizar imagen destacada'
    });
  }
};

module.exports = exports;