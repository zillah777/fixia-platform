const express = require('express');
const multer = require('multer');
const path = require('path');
const servicesController = require('../controllers/servicesController');
const { authMiddleware, requireProvider } = require('../middleware/auth');
const { cacheResponse, invalidateCache } = require('../middleware/redisCache');
const { CACHE_TTL } = require('../config/redis');

const router = express.Router();

// Configure multer for service images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/services/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'service-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, WebP)'));
    }
  }
});

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get list of services with optional filters
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by service category
 *         example: Limpieza
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *         example: Comodoro Rivadavia
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *         example: 1000
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *         example: 5000
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *         example: limpieza hogar
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 services:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *                 cached:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', 
  cacheResponse({ 
    ttl: CACHE_TTL.MEDIUM,
    keyGenerator: (req) => `services:list:${JSON.stringify(req.query)}`
  }), 
  servicesController.getServices
);

// GET /api/services/:id - Get service details (cached)
router.get('/:id', 
  cacheResponse({ 
    ttl: CACHE_TTL.LONG,
    keyGenerator: (req) => `service:${req.params.id}`
  }), 
  servicesController.getServiceById
);

// POST /api/services - Create service (providers only) with cache invalidation
router.post('/', 
  authMiddleware, 
  invalidateCache({ serviceSpecific: true, userSpecific: true }),
  servicesController.createService
);

// PUT /api/services/:id - Update service with cache invalidation
router.put('/:id', 
  authMiddleware, 
  invalidateCache({ serviceSpecific: true, userSpecific: true }),
  servicesController.updateService
);

// DELETE /api/services/:id - Delete service with cache invalidation
router.delete('/:id', 
  authMiddleware, 
  invalidateCache({ serviceSpecific: true, userSpecific: true }),
  servicesController.deleteService
);

// GET /api/services/provider/:providerId - Get services by provider
router.get('/provider/:providerId', servicesController.getServicesByProvider);

// POST /api/services/:id/images - Upload service images
router.post('/:id/images', authMiddleware, requireProvider, upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service belongs to current user
    const [existingService] = await pool.execute(
      'SELECT id FROM services WHERE id = ? AND provider_id = ?',
      [id, req.user.id]
    );

    if (existingService.length === 0) {
      return res.status(404).json(formatError('Servicio no encontrado o no autorizado'));
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json(formatError('No se proporcionaron imágenes'));
    }

    const imagePromises = req.files.map((file, index) => {
      const imageUrl = `/uploads/services/${file.filename}`;
      return pool.execute(
        'INSERT INTO service_images (service_id, image_url, sort_order) VALUES (?, ?, ?)',
        [id, imageUrl, index]
      );
    });

    await Promise.all(imagePromises);

    const images = req.files.map((file, index) => ({
      image_url: `/uploads/services/${file.filename}`,
      sort_order: index
    }));

    res.status(201).json(formatResponse(images, 'Imágenes subidas exitosamente'));

  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json(formatError('Error al subir imágenes'));
  }
});

// GET /api/services/categories/list - Get available categories (cached)
router.get('/categories/list', 
  cacheResponse({ 
    ttl: CACHE_TTL.VERY_LONG,
    keyGenerator: () => 'categories:list'
  }),
  servicesController.getCategories
);

module.exports = router;