const express = require('express');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { requireProvider } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for portfolio and education images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    if (file.fieldname === 'portfolio_image') {
      uploadPath += 'portfolio/';
    } else if (file.fieldname === 'certificate_image') {
      uploadPath += 'certificates/';
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF) y PDFs'));
    }
  }
});

// WORK LOCATIONS MANAGEMENT
// GET /api/as-premium/work-locations - Get AS work locations
router.get('/work-locations', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [locations] = await pool.execute(`
      SELECT * FROM as_work_locations 
      WHERE user_id = ? AND is_active = TRUE 
      ORDER BY locality ASC
    `, [req.user.id]);

    res.json(formatResponse(locations, 'Ubicaciones de trabajo obtenidas exitosamente'));
  } catch (error) {
    console.error('Get work locations error:', error);
    res.status(500).json(formatError('Error al obtener ubicaciones de trabajo'));
  }
});

// POST /api/as-premium/work-locations - Add work location
router.post('/work-locations', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { locality, province = 'Chubut', travel_radius = 0 } = req.body;

    if (!locality) {
      return res.status(400).json(formatError('La localidad es requerida'));
    }

    await pool.execute(`
      INSERT INTO as_work_locations (user_id, locality, province, travel_radius)
      VALUES (?, ?, ?, ?)
    `, [req.user.id, locality, province, travel_radius]);

    res.json(formatResponse(null, 'Ubicación de trabajo agregada exitosamente'));
  } catch (error) {
    console.error('Add work location error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json(formatError('Ya tienes esa ubicación de trabajo registrada'));
    } else {
      res.status(500).json(formatError('Error al agregar ubicación de trabajo'));
    }
  }
});

// DELETE /api/as-premium/work-locations/:id - Remove work location
router.delete('/work-locations/:id', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(`
      DELETE FROM as_work_locations 
      WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json(formatError('Ubicación no encontrada'));
    }

    res.json(formatResponse(null, 'Ubicación de trabajo eliminada exitosamente'));
  } catch (error) {
    console.error('Delete work location error:', error);
    res.status(500).json(formatError('Error al eliminar ubicación de trabajo'));
  }
});

// WORK CATEGORIES MANAGEMENT
// GET /api/as-premium/work-categories - Get AS work categories
router.get('/work-categories', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT awc.*, c.name as category_name, c.icon as category_icon
      FROM as_work_categories awc
      INNER JOIN categories c ON awc.category_id = c.id
      WHERE awc.user_id = ? AND awc.is_active = TRUE
      ORDER BY awc.is_featured DESC, c.name ASC
    `, [req.user.id]);

    res.json(formatResponse(categories, 'Categorías de trabajo obtenidas exitosamente'));
  } catch (error) {
    console.error('Get work categories error:', error);
    res.status(500).json(formatError('Error al obtener categorías de trabajo'));
  }
});

// POST /api/as-premium/work-categories - Add work category
router.post('/work-categories', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { category_id, subcategory, is_featured = false } = req.body;

    if (!category_id) {
      return res.status(400).json(formatError('La categoría es requerida'));
    }

    await pool.execute(`
      INSERT INTO as_work_categories (user_id, category_id, subcategory, is_featured)
      VALUES (?, ?, ?, ?)
    `, [req.user.id, category_id, subcategory, is_featured]);

    res.json(formatResponse(null, 'Categoría de trabajo agregada exitosamente'));
  } catch (error) {
    console.error('Add work category error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json(formatError('Ya tienes esa categoría registrada'));
    } else {
      res.status(500).json(formatError('Error al agregar categoría de trabajo'));
    }
  }
});

// DELETE /api/as-premium/work-categories/:id - Remove work category
router.delete('/work-categories/:id', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(`
      DELETE FROM as_work_categories 
      WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json(formatError('Categoría no encontrada'));
    }

    res.json(formatResponse(null, 'Categoría de trabajo eliminada exitosamente'));
  } catch (error) {
    console.error('Delete work category error:', error);
    res.status(500).json(formatError('Error al eliminar categoría de trabajo'));
  }
});

// AVAILABILITY MANAGEMENT
// GET /api/as-premium/availability - Get AS availability
router.get('/availability', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [availability] = await pool.execute(`
      SELECT * FROM as_availability 
      WHERE user_id = ? AND is_active = TRUE 
      ORDER BY FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
               start_time ASC
    `, [req.user.id]);

    res.json(formatResponse(availability, 'Disponibilidad obtenida exitosamente'));
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json(formatError('Error al obtener disponibilidad'));
  }
});

// POST /api/as-premium/availability - Set availability
router.post('/availability', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { schedules } = req.body; // Array of {day_of_week, start_time, end_time}

    if (!Array.isArray(schedules)) {
      return res.status(400).json(formatError('Los horarios deben ser un array'));
    }

    // Delete existing availability
    await pool.execute('DELETE FROM as_availability WHERE user_id = ?', [req.user.id]);

    // Insert new availability
    for (const schedule of schedules) {
      const { day_of_week, start_time, end_time } = schedule;
      await pool.execute(`
        INSERT INTO as_availability (user_id, day_of_week, start_time, end_time)
        VALUES (?, ?, ?, ?)
      `, [req.user.id, day_of_week, start_time, end_time]);
    }

    res.json(formatResponse(null, 'Disponibilidad actualizada exitosamente'));
  } catch (error) {
    console.error('Set availability error:', error);
    res.status(500).json(formatError('Error al actualizar disponibilidad'));
  }
});

// PRICING MANAGEMENT
// GET /api/as-premium/pricing - Get AS pricing
router.get('/pricing', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [pricing] = await pool.execute(`
      SELECT ap.*, c.name as category_name, c.icon as category_icon
      FROM as_pricing ap
      INNER JOIN categories c ON ap.category_id = c.id
      WHERE ap.user_id = ? AND ap.is_active = TRUE
      ORDER BY c.name ASC
    `, [req.user.id]);

    res.json(formatResponse(pricing, 'Precios obtenidos exitosamente'));
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json(formatError('Error al obtener precios'));
  }
});

// POST /api/as-premium/pricing - Set pricing for category
router.post('/pricing', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { 
      category_id, 
      service_type, 
      base_price, 
      minimum_hours = 1.0, 
      travel_cost = 0, 
      emergency_surcharge = 0,
      is_negotiable = false 
    } = req.body;

    if (!category_id || !service_type || !base_price) {
      return res.status(400).json(formatError('Categoría, tipo de servicio y precio base son requeridos'));
    }

    await pool.execute(`
      INSERT INTO as_pricing (user_id, category_id, service_type, base_price, minimum_hours, travel_cost, emergency_surcharge, is_negotiable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      service_type = VALUES(service_type),
      base_price = VALUES(base_price),
      minimum_hours = VALUES(minimum_hours),
      travel_cost = VALUES(travel_cost),
      emergency_surcharge = VALUES(emergency_surcharge),
      is_negotiable = VALUES(is_negotiable),
      updated_at = CURRENT_TIMESTAMP
    `, [req.user.id, category_id, service_type, base_price, minimum_hours, travel_cost, emergency_surcharge, is_negotiable]);

    res.json(formatResponse(null, 'Precio actualizado exitosamente'));
  } catch (error) {
    console.error('Set pricing error:', error);
    res.status(500).json(formatError('Error al actualizar precio'));
  }
});

// PORTFOLIO MANAGEMENT
// GET /api/as-premium/portfolio - Get AS portfolio
router.get('/portfolio', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [portfolio] = await pool.execute(`
      SELECT ap.*, c.name as category_name
      FROM as_portfolio ap
      LEFT JOIN categories c ON ap.category_id = c.id
      WHERE ap.user_id = ? AND ap.is_visible = TRUE
      ORDER BY ap.is_featured DESC, ap.sort_order ASC, ap.created_at DESC
    `, [req.user.id]);

    res.json(formatResponse(portfolio, 'Portfolio obtenido exitosamente'));
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json(formatError('Error al obtener portfolio'));
  }
});

// POST /api/as-premium/portfolio - Add portfolio item
router.post('/portfolio', authMiddleware, requireProvider, upload.single('portfolio_image'), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category_id, 
      project_date, 
      client_name, 
      project_value,
      is_featured = false 
    } = req.body;

    if (!title) {
      return res.status(400).json(formatError('El título es requerido'));
    }

    const image_url = req.file ? `/uploads/portfolio/${req.file.filename}` : null;

    const [result] = await pool.execute(`
      INSERT INTO as_portfolio (user_id, title, description, category_id, image_url, project_date, client_name, project_value, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, title, description, category_id, image_url, project_date, client_name, project_value, is_featured]);

    res.json(formatResponse({ id: result.insertId }, 'Elemento del portfolio agregado exitosamente'));
  } catch (error) {
    console.error('Add portfolio error:', error);
    res.status(500).json(formatError('Error al agregar elemento del portfolio'));
  }
});

// DELETE /api/as-premium/portfolio/:id - Delete portfolio item
router.delete('/portfolio/:id', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(`
      DELETE FROM as_portfolio 
      WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json(formatError('Elemento del portfolio no encontrado'));
    }

    res.json(formatResponse(null, 'Elemento del portfolio eliminado exitosamente'));
  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json(formatError('Error al eliminar elemento del portfolio'));
  }
});

module.exports = router;