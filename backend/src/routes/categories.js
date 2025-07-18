const express = require('express');
const { query } = require('../config/database');
const { formatResponse, formatError } = require('../utils/helpers');

const router = express.Router();

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const { grouped = false } = req.query;

    if (grouped === 'true') {
      // Get categories grouped by group_name
      const result = await query(`
        SELECT * FROM categories 
        WHERE is_active = TRUE
        ORDER BY group_name ASC, name ASC
      `);

      // Group categories by group_name
      const groupedCategories = result.rows.reduce((acc, category) => {
        const groupName = category.group_name || 'Sin categoría';
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(category);
        return acc;
      }, {});

      res.json(formatResponse(groupedCategories, 'Categorías agrupadas obtenidas exitosamente'));
    } else {
      // Get all categories in a flat list
      const result = await query(`
        SELECT * FROM categories 
        WHERE is_active = TRUE
        ORDER BY name ASC
      `);

      res.json(formatResponse(result.rows, 'Categorías obtenidas exitosamente'));
    }
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json(formatError('Error al obtener categorías'));
  }
});

// GET /api/categories/parent-groups - Get unique parent category groups
router.get('/parent-groups', async (req, res) => {
  try {
    const [parentGroups] = await pool.execute(`
      SELECT DISTINCT parent_category, COUNT(*) as count
      FROM categories 
      WHERE parent_category IS NOT NULL
      GROUP BY parent_category
      ORDER BY parent_category ASC
    `);

    const groups = parentGroups.map(group => ({
      name: group.parent_category,
      count: group.count,
      slug: group.parent_category.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
    }));

    res.json(formatResponse(groups, 'Grupos de categorías obtenidos exitosamente'));
  } catch (error) {
    console.error('Get parent groups error:', error);
    res.status(500).json(formatError('Error al obtener grupos de categorías'));
  }
});

// GET /api/categories/by-parent/:parentName - Get categories by parent group
router.get('/by-parent/:parentName', async (req, res) => {
  try {
    const { parentName } = req.params;
    
    // Decode URI component to handle special characters
    const decodedParentName = decodeURIComponent(parentName);

    const [categories] = await pool.execute(`
      SELECT * FROM categories 
      WHERE parent_category = ?
      ORDER BY sort_order ASC, name ASC
    `, [decodedParentName]);

    res.json(formatResponse(categories, `Categorías de "${decodedParentName}" obtenidas exitosamente`));
  } catch (error) {
    console.error('Get categories by parent error:', error);
    res.status(500).json(formatError('Error al obtener categorías por grupo'));
  }
});

// GET /api/categories/search - Search categories
router.get('/search', async (req, res) => {
  try {
    const { q, parent_category } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json(formatError('Query debe tener al menos 2 caracteres'));
    }

    let query = `
      SELECT * FROM categories 
      WHERE (name LIKE ? OR description LIKE ?)
    `;
    
    const params = [`%${q}%`, `%${q}%`];

    if (parent_category) {
      query += ' AND parent_category = ?';
      params.push(parent_category);
    }

    query += ' ORDER BY sort_order ASC, name ASC LIMIT 20';

    const [categories] = await pool.execute(query, params);

    res.json(formatResponse(categories, `${categories.length} categorías encontradas`));
  } catch (error) {
    console.error('Search categories error:', error);
    res.status(500).json(formatError('Error al buscar categorías'));
  }
});

// GET /api/categories/:id - Get specific category
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [categories] = await pool.execute(`
      SELECT * FROM categories WHERE id = ?
    `, [id]);

    if (categories.length === 0) {
      return res.status(404).json(formatError('Categoría no encontrada'));
    }

    res.json(formatResponse(categories[0], 'Categoría obtenida exitosamente'));
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json(formatError('Error al obtener categoría'));
  }
});

// GET /api/categories/stats/popular - Get most popular categories (based on service announcements)
router.get('/stats/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [popularCategories] = await pool.execute(`
      SELECT c.*, COUNT(asa.id) as announcements_count
      FROM categories c
      LEFT JOIN as_service_announcements asa ON c.id = asa.category_id AND asa.is_active = TRUE
      GROUP BY c.id
      ORDER BY announcements_count DESC, c.name ASC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json(formatResponse(popularCategories, 'Categorías populares obtenidas exitosamente'));
  } catch (error) {
    console.error('Get popular categories error:', error);
    res.status(500).json(formatError('Error al obtener categorías populares'));
  }
});

module.exports = router;