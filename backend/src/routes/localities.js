const express = require('express');
const { query } = require('../config/database');
const { formatResponse, formatError } = require('../utils/helpers');

const router = express.Router();

// GET /api/localities/chubut - Get all active Chubut localities
router.get('/chubut', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, name, region 
      FROM chubut_localities 
      WHERE is_active = TRUE 
      ORDER BY name ASC
    `);

    res.json(formatResponse(result.rows, 'Localidades de Chubut obtenidas exitosamente'));
  } catch (error) {
    console.error('Get Chubut localities error:', error);
    res.status(500).json(formatError('Error al obtener localidades de Chubut'));
  }
});

// GET /api/localities/chubut/by-region - Get localities grouped by region
router.get('/chubut/by-region', async (req, res) => {
  try {
    const result = await query(`
      SELECT region, name 
      FROM chubut_localities 
      WHERE is_active = TRUE 
      ORDER BY region ASC, name ASC
    `);

    // Group localities by region
    const groupedLocalities = result.rows.reduce((acc, locality) => {
      const region = locality.region || 'Sin región';
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(locality.name);
      return acc;
    }, {});

    res.json(formatResponse(groupedLocalities, 'Localidades de Chubut agrupadas por región obtenidas exitosamente'));
  } catch (error) {
    console.error('Get Chubut localities by region error:', error);
    res.status(500).json(formatError('Error al obtener localidades por región'));
  }
});

// GET /api/localities/chubut/search - Search localities
router.get('/chubut/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json(formatError('Query debe tener al menos 2 caracteres'));
    }

    const result = await query(`
      SELECT id, name, region 
      FROM chubut_localities 
      WHERE is_active = TRUE AND name ILIKE $1
      ORDER BY name ASC
      LIMIT 10
    `, [`%${q}%`]);

    res.json(formatResponse(result.rows, `${result.rows.length} localidades encontradas`));
  } catch (error) {
    console.error('Search Chubut localities error:', error);
    res.status(500).json(formatError('Error al buscar localidades'));
  }
});

// GET /api/localities/chubut/validate/:name - Validate if locality exists
router.get('/chubut/validate/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const decodedName = decodeURIComponent(name);

    const result = await query(`
      SELECT id, name, region 
      FROM chubut_localities 
      WHERE is_active = TRUE AND name = $1
    `, [decodedName]);

    const isValid = result.rows.length > 0;

    res.json(formatResponse({
      is_valid: isValid,
      locality: isValid ? result.rows[0] : null,
      message: isValid 
        ? `${decodedName} es una localidad válida de Chubut`
        : `${decodedName} no es una localidad reconocida de Chubut`
    }, 'Validación de localidad completada'));

  } catch (error) {
    console.error('Validate locality error:', error);
    res.status(500).json(formatError('Error al validar localidad'));
  }
});

module.exports = router;