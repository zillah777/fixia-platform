/**
 * Debug Routes - Development and troubleshooting endpoints
 * @fileoverview Contains debug endpoints that should only be available in development/staging
 */
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { comparePassword } = require('../utils/helpers');

// Middleware to restrict debug routes to non-production environments
const debugOnly = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Debug endpoints not available in production' });
  }
  next();
};

// Apply debug restriction to all routes in this router
router.use(debugOnly);

/**
 * @swagger
 * /debug/user/{email}:
 *   get:
 *     tags: [Debug]
 *     summary: Get user information by email (Development only)
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User information
 *       404:
 *         description: User not found
 */
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const result = await query(`
      SELECT * FROM users WHERE email = $1
    `, [email]);
    
    if (result.rows.length === 0) {
      return res.json({ found: false, message: 'User not found' });
    }
    
    const user = result.rows[0];
    // Remove sensitive data
    delete user.password_hash;
    
    res.json({
      found: true,
      user: user,
      columns: Object.keys(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /debug/tables:
 *   get:
 *     tags: [Debug]
 *     summary: List all database tables (Development only)
 *     responses:
 *       200:
 *         description: List of database tables
 */
router.get('/tables', async (req, res) => {
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = result.rows.map(row => row.table_name);
    
    res.json({
      tables: tables,
      count: tables.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /debug/service-data:
 *   get:
 *     tags: [Debug]
 *     summary: Check service requests and interests data (Development only)
 *     responses:
 *       200:
 *         description: Service data overview
 */
router.get('/service-data', async (req, res) => {
  try {
    console.log('🔍 Checking service requests...');
    const requests = await query('SELECT id, title, explorer_id, status FROM explorer_service_requests LIMIT 5');
    console.log('✅ Service requests found:', requests.rows.length);
    
    console.log('🔍 Checking service interests...');
    const interests = await query('SELECT id, request_id, as_id, status FROM as_service_interests LIMIT 5');
    console.log('✅ Service interests found:', interests.rows.length);
    
    console.log('🔍 Checking for request ID 1...');
    const request1 = await query('SELECT * FROM explorer_service_requests WHERE id = 1');
    console.log('✅ Request 1 found:', request1.rows.length > 0);
    
    let interests1 = { rows: [] };
    if (request1.rows.length > 0) {
      console.log('🔍 Checking interests for request 1...');
      interests1 = await query('SELECT * FROM as_service_interests WHERE request_id = 1');
      console.log('✅ Interests for request 1:', interests1.rows.length);
    }
    
    res.json({
      service_requests: requests.rows,
      service_interests: interests.rows,
      request_1: request1.rows,
      request_1_interests: interests1.rows
    });
  } catch (error) {
    console.error('❌ Debug service data error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

/**
 * @swagger
 * /debug/table-structure/{tableName}:
 *   get:
 *     tags: [Debug]
 *     summary: Get table structure information (Development only)
 *     parameters:
 *       - in: path
 *         name: tableName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Table structure information
 */
router.get('/table-structure/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Validate table name to prevent SQL injection
    const validTables = [
      'users', 'explorer_profiles', 'as_service_interests', 'explorer_service_requests',
      'explorer_as_connections', 'explorer_as_reviews', 'explorer_review_obligations',
      'as_review_obligations', 'as_work_categories', 'as_work_locations', 'as_pricing',
      'as_portfolio', 'bookings', 'categories', 'chat_messages', 'chat_rooms',
      'chubut_localities', 'notifications', 'payments', 'reviews', 'services',
      'user_professional_info', 'user_availability_status'
    ];
    
    if (!validTables.includes(tableName)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }
    
    console.log(`🔍 Getting structure for table: ${tableName}`);
    
    // Get column information
    const columns = await query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);
    
    // Check if table exists
    if (columns.rows.length === 0) {
      return res.json({
        table_name: tableName,
        exists: false,
        columns: []
      });
    }
    
    // Get a sample row to see actual data structure
    let sampleData = { rows: [] };
    try {
      sampleData = await query(`SELECT * FROM ${tableName} LIMIT 1`);
    } catch (sampleError) {
      console.log(`⚠️ Could not get sample data from ${tableName}:`, sampleError.message);
    }
    
    res.json({
      table_name: tableName,
      exists: true,
      columns: columns.rows,
      sample_data: sampleData.rows[0] || null,
      total_columns: columns.rows.length
    });
    
  } catch (error) {
    console.error(`❌ Table structure debug error for ${req.params.tableName}:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /debug/login:
 *   post:
 *     tags: [Debug]
 *     summary: Debug login process (Development only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login debug information
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔍 Debug login attempt:', { email, hasPassword: !!password });
    
    if (!email || !password) {
      return res.json({ error: 'Email and password required', step: 'validation' });
    }
    
    // Find user
    const result = await query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
    console.log('🔍 User found:', result.rows.length > 0);
    
    if (result.rows.length === 0) {
      return res.json({ error: 'User not found', step: 'user_lookup' });
    }

    const user = result.rows[0];
    console.log('🔍 User details:', { 
      id: user.id, 
      email: user.email, 
      email_verified: user.email_verified,
      user_type: user.user_type 
    });

    // Check password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    console.log('🔍 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.json({ error: 'Invalid password', step: 'password_check' });
    }

    // Check email verification
    if (!user.email_verified && process.env.NODE_ENV === 'production') {
      return res.json({ error: 'Email not verified', step: 'email_verification' });
    }

    res.json({ 
      success: true, 
      message: 'Login would succeed',
      user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type
      }
    });

  } catch (error) {
    console.error('🔍 Debug login error:', error);
    res.status(500).json({ error: error.message, step: 'server_error' });
  }
});

/**
 * @swagger
 * /debug/full-audit:
 *   get:
 *     tags: [Debug]
 *     summary: Comprehensive database audit (Development only)
 *     responses:
 *       200:
 *         description: Complete database audit results
 */
router.get('/full-audit', async (req, res) => {
  try {
    console.log('🔍 AUDITORÍA COMPLETA DE BASE DE DATOS - INICIANDO...');
    
    const auditResults = {
      users_table: {},
      missing_columns: [],
      existing_columns: [],
      critical_tables: {},
      sql_fixes: []
    };

    // 1. Estructura de tabla users
    console.log('📋 1. Analizando estructura de tabla users...');
    const usersColumns = await query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    auditResults.users_table = {
      exists: usersColumns.rows.length > 0,
      columns: usersColumns.rows,
      total_columns: usersColumns.rows.length
    };

    // 2. Verificar columnas específicas que se usan en el código
    const columnsToCheck = [
      'profile_photo_url', 'profile_image', 'verification_status', 
      'subscription_type', 'verification_score', 'about_me', 
      'has_mobility', 'professional_info', 'bio', 'date_of_birth',
      'gender', 'locality', 'birth_date'
    ];
    
    console.log('🔍 2. Verificando columnas específicas...');
    const existingColumns = usersColumns.rows.map(row => row.column_name);
    
    columnsToCheck.forEach(colName => {
      if (existingColumns.includes(colName)) {
        auditResults.existing_columns.push(colName);
      } else {
        auditResults.missing_columns.push(colName);
      }
    });

    // 3. Verificar tablas críticas
    const criticalTables = [
      'explorer_profiles', 'as_service_interests', 'explorer_service_requests',
      'as_work_locations', 'as_work_categories', 'user_professional_info',
      'user_availability_status', 'as_pricing'
    ];

    console.log('📋 3. Verificando tablas críticas...');
    for (const tableName of criticalTables) {
      try {
        const tableColumns = await query(`
          SELECT column_name, data_type
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
        `, [tableName]);
        
        auditResults.critical_tables[tableName] = {
          exists: tableColumns.rows.length > 0,
          columns: tableColumns.rows,
          total_columns: tableColumns.rows.length
        };
      } catch (error) {
        auditResults.critical_tables[tableName] = {
          exists: false,
          error: error.message
        };
      }
    }

    console.log('✅ AUDITORÍA COMPLETA FINALIZADA');
    
    res.json({
      success: true,
      message: 'Auditoría completa realizada',
      data: auditResults,
      summary: {
        total_missing_columns: auditResults.missing_columns.length,
        total_existing_columns: auditResults.existing_columns.length,
        sql_fixes_needed: auditResults.sql_fixes.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error en auditoría completa:', error);
    res.status(500).json({ 
      success: false,
      error: error.message, 
      stack: error.stack 
    });
  }
});

module.exports = router;