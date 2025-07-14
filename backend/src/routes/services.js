const express = require('express');
const multer = require('multer');
const path = require('path');
const servicesController = require('../controllers/servicesController');
const { authMiddleware } = require('../middleware/auth');

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

// GET /api/services - List services with filters
router.get('/', servicesController.getServices);

// GET /api/services/:id - Get service details
router.get('/:id', servicesController.getServiceById);

// POST /api/services - Create service (providers only)
router.post('/', authMiddleware, servicesController.createService);

// PUT /api/services/:id - Update service
router.put('/:id', authMiddleware, servicesController.updateService);

// DELETE /api/services/:id - Delete service
router.delete('/:id', authMiddleware, servicesController.deleteService);

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

// GET /api/services/categories/list - Get available categories
router.get('/categories/list', servicesController.getCategories);

module.exports = router;