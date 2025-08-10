const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Starting Fixia Production Server...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('📍 Port:', process.env.PORT || 8080);

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
};

ensureDirectoryExists('uploads');
ensureDirectoryExists('uploads/profiles');
ensureDirectoryExists('uploads/services');
ensureDirectoryExists('uploads/documents');

const { testConnection } = require('./src/config/database');
const { authMiddleware } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 8080;

// Trust proxy for Railway
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Basic security
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Demasiadas solicitudes desde esta IP' }
});
app.use(limiter);

// Debug middleware FIRST - before CORS
app.use((req, res, next) => {
  if (req.url.includes('/profile/photo')) {
    console.log('🔍 EARLY DEBUG - Photo upload request:', {
      method: req.method,
      url: req.url,
      contentType: req.headers['content-type'],
      hasAuth: !!req.headers.authorization,
      authHeader: req.headers.authorization ? req.headers.authorization.substring(0, 30) + '...' : 'none',
      origin: req.headers.origin,
      userAgent: req.headers['user-agent']?.substring(0, 50)
    });
  }
  next();
});

// CORS middleware - use secure configured CORS from middleware.js
const { corsMiddleware } = require('./src/config/middleware');
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Response debug middleware - capture ALL responses
app.use((req, res, next) => {
  const originalJson = res.json;
  const originalStatus = res.status;
  
  res.json = function(data) {
    if (req.url.includes('/profile/photo') && (res.statusCode >= 400 || !data.success)) {
      console.log('🚨 PHOTO UPLOAD ERROR RESPONSE:', {
        url: req.url,
        method: req.method,
        statusCode: res.statusCode,
        responseData: data,
        hasUser: !!req.user,
        userId: req.user?.id
      });
    }
    return originalJson.call(this, data);
  };
  
  res.status = function(code) {
    if (req.url.includes('/profile/photo') && code >= 400) {
      console.log('🚨 PHOTO UPLOAD STATUS ERROR:', {
        url: req.url,
        method: req.method,
        statusCode: code,
        hasUser: !!req.user
      });
    }
    return originalStatus.call(this, code);
  };
  
  next();
});

// Static file serving moved to AFTER API routes but BEFORE 404 handler

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: 'production-v1.0'
  });
});

// Debug endpoint to check user status
app.get('/debug/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { query } = require('./src/config/database');
    
    const result = await query(`
      SELECT * FROM users WHERE email = $1
    `, [email]);
    
    if (result.rows.length === 0) {
      return res.json({ found: false, message: 'User not found' });
    }
    
    const user = result.rows[0];
    res.json({
      found: true,
      user: user,
      columns: Object.keys(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check database tables
app.get('/debug/tables', async (req, res) => {
  try {
    const { query } = require('./src/config/database');
    
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

// Debug endpoint to check service requests and interests
app.get('/debug/service-data', async (req, res) => {
  try {
    const { query } = require('./src/config/database');
    
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

// Debug endpoint to check table structure
app.get('/debug/table-structure/:tableName', async (req, res) => {
  try {
    const { query } = require('./src/config/database');
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

// DATABASE FIXES EXECUTION ENDPOINT
app.post('/debug/execute-fixes', async (req, res) => {
  try {
    const { query } = require('./src/config/database');
    
    console.log('🔧 EJECUTANDO CORRECCIONES CRÍTICAS DE BASE DE DATOS...');
    
    const fixes = [];
    const errors = [];
    
    // FASE 1: Agregar columnas faltantes en users
    const userColumnFixes = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'free';",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_score INTEGER DEFAULT 0;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS about_me TEXT;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS has_mobility BOOLEAN DEFAULT false;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_info JSONB;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;"
    ];
    
    console.log('🔧 1. Agregando columnas faltantes en users...');
    for (const fix of userColumnFixes) {
      try {
        await query(fix);
        fixes.push(`✅ ${fix.split(' ')[5]} - Columna agregada`);
      } catch (error) {
        console.error(`❌ Error en: ${fix}`, error.message);
        errors.push(`❌ ${fix} - ${error.message}`);
      }
    }
    
    // FASE 2: Crear tabla explorer_profiles
    console.log('🔧 2. Creando tabla explorer_profiles...');
    const explorerProfilesTable = `
      CREATE TABLE IF NOT EXISTS explorer_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        preferred_localities JSONB DEFAULT '[]',
        preferred_categories JSONB DEFAULT '[]',
        average_budget_range VARCHAR(50),
        communication_preference VARCHAR(20) DEFAULT 'phone',
        preferred_payment_method VARCHAR(20) DEFAULT 'cash',
        special_requirements TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
    `;
    
    try {
      await query(explorerProfilesTable);
      fixes.push('✅ explorer_profiles - Tabla creada');
    } catch (error) {
      errors.push(`❌ explorer_profiles - ${error.message}`);
    }
    
    // FASE 3: Crear tabla user_professional_info
    console.log('🔧 3. Creando tabla user_professional_info...');
    const userProfessionalInfoTable = `
      CREATE TABLE IF NOT EXISTS user_professional_info (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        years_experience INTEGER DEFAULT 0,
        certifications JSONB DEFAULT '[]',
        education_level VARCHAR(50),
        specializations JSONB DEFAULT '[]',
        about_me TEXT,
        portfolio_url TEXT,
        linkedin_url TEXT,
        website_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
    `;
    
    try {
      await query(userProfessionalInfoTable);
      fixes.push('✅ user_professional_info - Tabla creada');
    } catch (error) {
      errors.push(`❌ user_professional_info - ${error.message}`);
    }
    
    // FASE 4: Crear tabla user_availability_status
    console.log('🔧 4. Creando tabla user_availability_status...');
    const userAvailabilityStatusTable = `
      CREATE TABLE IF NOT EXISTS user_availability_status (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_available BOOLEAN DEFAULT true,
        availability_type VARCHAR(20) DEFAULT 'online',
        status_message TEXT,
        auto_accept_bookings BOOLEAN DEFAULT false,
        max_concurrent_jobs INTEGER DEFAULT 3,
        working_hours JSONB DEFAULT '{"monday": {"start": "08:00", "end": "18:00", "available": true}}',
        timezone VARCHAR(50) DEFAULT 'America/Argentina/Buenos_Aires',
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
    `;
    
    try {
      await query(userAvailabilityStatusTable);
      fixes.push('✅ user_availability_status - Tabla creada');
    } catch (error) {
      errors.push(`❌ user_availability_status - ${error.message}`);
    }
    
    // FASE 5: Crear tabla as_pricing
    console.log('🔧 5. Creando tabla as_pricing...');
    const asPricingTable = `
      CREATE TABLE IF NOT EXISTS as_pricing (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        service_type VARCHAR(50) NOT NULL,
        base_price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'ARS',
        min_price DECIMAL(10,2),
        max_price DECIMAL(10,2),
        price_per_hour DECIMAL(10,2),
        price_description TEXT,
        emergency_multiplier DECIMAL(3,2) DEFAULT 1.5,
        weekend_multiplier DECIMAL(3,2) DEFAULT 1.2,
        travel_cost_per_km DECIMAL(8,2) DEFAULT 0,
        minimum_service_fee DECIMAL(8,2) DEFAULT 0,
        is_negotiable BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, category_id)
      );
    `;
    
    try {
      await query(asPricingTable);
      fixes.push('✅ as_pricing - Tabla creada');
    } catch (error) {
      errors.push(`❌ as_pricing - ${error.message}`);
    }
    
    // FASE 6: Arreglar as_work_locations
    console.log('🔧 6. Arreglando tabla as_work_locations...');
    const workLocationsFixes = [
      "ALTER TABLE as_work_locations ADD COLUMN IF NOT EXISTS locality VARCHAR(100);",
      "UPDATE as_work_locations SET locality = location_name WHERE locality IS NULL;",
      "ALTER TABLE as_work_locations ADD COLUMN IF NOT EXISTS province VARCHAR(50) DEFAULT 'Chubut';",
      "ALTER TABLE as_work_locations ADD COLUMN IF NOT EXISTS travel_radius INTEGER DEFAULT 0;",
      "ALTER TABLE as_work_locations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;"
    ];
    
    for (const fix of workLocationsFixes) {
      try {
        await query(fix);
        fixes.push(`✅ as_work_locations - ${fix.includes('ADD COLUMN') ? 'Columna agregada' : 'Datos actualizados'}`);
      } catch (error) {
        errors.push(`❌ as_work_locations - ${error.message}`);
      }
    }
    
    // FASE 7: Migrar datos existentes
    console.log('🔧 7. Migrando datos existentes...');
    
    // Actualizar usuarios con valores por defecto
    try {
      await query(`
        UPDATE users SET 
          subscription_type = COALESCE(subscription_type, 'free'),
          verification_score = COALESCE(verification_score, 0)
        WHERE subscription_type IS NULL OR verification_score IS NULL;
      `);
      fixes.push('✅ users - Valores por defecto actualizados');
    } catch (error) {
      errors.push(`❌ users migration - ${error.message}`);
    }
    
    // Crear perfiles explorer para usuarios client
    try {
      await query(`
        INSERT INTO explorer_profiles (user_id, preferred_localities, preferred_categories)
        SELECT id, '[]', '[]' 
        FROM users 
        WHERE user_type = 'client' 
        AND NOT EXISTS (SELECT 1 FROM explorer_profiles WHERE user_id = users.id);
      `);
      fixes.push('✅ explorer_profiles - Perfiles creados para usuarios client');
    } catch (error) {
      errors.push(`❌ explorer_profiles migration - ${error.message}`);
    }
    
    console.log('✅ CORRECCIONES DE BASE DE DATOS COMPLETADAS');
    
    res.json({
      success: true,
      message: 'Correcciones de base de datos ejecutadas',
      fixes_applied: fixes.length,
      errors_found: errors.length,
      fixes: fixes,
      errors: errors
    });
    
  } catch (error) {
    console.error('❌ Error crítico en correcciones:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// COMPREHENSIVE DATABASE AUDIT ENDPOINT
app.get('/debug/full-audit', async (req, res) => {
  try {
    const { query } = require('./src/config/database');
    
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

    // 4. Generar queries para columnas faltantes
    console.log('🛠️ 4. Generando queries para columnas faltantes...');
    const columnQueries = {
      'profile_photo_url': 'ALTER TABLE users ADD COLUMN profile_photo_url TEXT;',
      'verification_status': "ALTER TABLE users ADD COLUMN verification_status VARCHAR(20) DEFAULT 'pending';",
      'subscription_type': "ALTER TABLE users ADD COLUMN subscription_type VARCHAR(20) DEFAULT 'free';",
      'verification_score': 'ALTER TABLE users ADD COLUMN verification_score INTEGER DEFAULT 0;',
      'about_me': 'ALTER TABLE users ADD COLUMN about_me TEXT;',
      'has_mobility': 'ALTER TABLE users ADD COLUMN has_mobility BOOLEAN DEFAULT false;',
      'professional_info': 'ALTER TABLE users ADD COLUMN professional_info JSONB;',
      'bio': 'ALTER TABLE users ADD COLUMN bio TEXT;',
      'date_of_birth': 'ALTER TABLE users ADD COLUMN date_of_birth DATE;',
      'gender': 'ALTER TABLE users ADD COLUMN gender VARCHAR(10);',
      'locality': 'ALTER TABLE users ADD COLUMN locality VARCHAR(100);',
      'birth_date': 'ALTER TABLE users ADD COLUMN birth_date DATE;'
    };

    auditResults.missing_columns.forEach(colName => {
      if (columnQueries[colName]) {
        auditResults.sql_fixes.push(columnQueries[colName]);
      }
    });

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

// Debug login endpoint to see detailed errors
app.post('/debug/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔍 Debug login attempt:', { email, hasPassword: !!password });
    
    if (!email || !password) {
      return res.json({ error: 'Email and password required', step: 'validation' });
    }

    const { query } = require('./src/config/database');
    const { comparePassword } = require('./src/utils/helpers');
    
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

// API Routes - only the working ones
try {
  app.use('/api/auth', require('./src/routes/auth'));
  console.log('✅ Auth routes loaded');
} catch (e) {
  console.error('❌ Auth routes failed:', e.message);
}

try {
  app.use('/api/users', authMiddleware, require('./src/routes/users'));
  console.log('✅ Users routes loaded');
} catch (e) {
  console.error('❌ Users routes failed:', e.message);
}

try {
  app.use('/api/categories', require('./src/routes/categories'));
  console.log('✅ Categories routes loaded');
} catch (e) {
  console.error('❌ Categories routes failed:', e.message);
}

try {
  app.use('/api/services', require('./src/routes/services'));
  console.log('✅ Services routes loaded');
} catch (e) {
  console.error('❌ Services routes failed:', e.message);
}

try {
  app.use('/api/dashboard', require('./src/routes/dashboard'));
  console.log('✅ Dashboard routes loaded');
} catch (e) {
  console.error('❌ Dashboard routes failed:', e.message);
}

try {
  app.use('/api/email-verification', require('./src/routes/email-verification'));
  console.log('✅ Email verification routes loaded');
} catch (e) {
  console.error('❌ Email verification routes failed:', e.message);
}

// MISSING ROUTES - Adding all the routes from server.js
try {
  app.use('/api/test-email', require('./src/routes/test-email'));
  console.log('✅ Test email routes loaded');
} catch (e) {
  console.error('❌ Test email routes failed:', e.message);
}

try {
  app.use('/api/localities', require('./src/routes/localities'));
  console.log('✅ Localities routes loaded');
} catch (e) {
  console.error('❌ Localities routes failed:', e.message);
}

try {
  app.use('/api/bookings', authMiddleware, require('./src/routes/bookings'));
  console.log('✅ Bookings routes loaded');
} catch (e) {
  console.error('❌ Bookings routes failed:', e.message);
}

try {
  app.use('/api/reviews', authMiddleware, require('./src/routes/reviews'));
  console.log('✅ Reviews routes loaded');
} catch (e) {
  console.error('❌ Reviews routes failed:', e.message);
}

try {
  app.use('/api/chat', authMiddleware, require('./src/routes/chat'));
  console.log('✅ Chat routes loaded');
} catch (e) {
  console.error('❌ Chat routes failed:', e.message);
}

try {
  app.use('/api/payments', authMiddleware, require('./src/routes/payments'));
  console.log('✅ Payments routes loaded');
} catch (e) {
  console.error('❌ Payments routes failed:', e.message);
}

try {
  app.use('/api/notifications', authMiddleware, require('./src/routes/notifications'));
  console.log('✅ Notifications routes loaded');
} catch (e) {
  console.error('❌ Notifications routes failed:', e.message);
}

try {
  app.use('/api/professionals', require('./src/routes/professionals'));
  console.log('✅ Professionals routes loaded');
} catch (e) {
  console.error('❌ Professionals routes failed:', e.message);
}

try {
  app.use('/api/subscriptions', require('./src/routes/subscriptions'));
  console.log('✅ Subscriptions routes loaded');
} catch (e) {
  console.error('❌ Subscriptions routes failed:', e.message);
}

try {
  app.use('/api/reports', require('./src/routes/reports'));
  console.log('✅ Reports routes loaded');
} catch (e) {
  console.error('❌ Reports routes failed:', e.message);
}

try {
  app.use('/api/ranking', require('./src/routes/ranking'));
  console.log('✅ Ranking routes loaded');
} catch (e) {
  console.error('❌ Ranking routes failed:', e.message);
}

try {
  app.use('/api/badges', require('./src/routes/badges'));
  console.log('✅ Badges routes loaded');
} catch (e) {
  console.error('❌ Badges routes failed:', e.message);
}

try {
  app.use('/api/as-premium', require('./src/routes/as-premium'));
  console.log('✅ AS Premium routes loaded');
} catch (e) {
  console.error('❌ AS Premium routes failed:', e.message);
}

try {
  app.use('/api/as-settings', require('./src/routes/as-settings'));
  console.log('✅ AS Settings routes loaded');
} catch (e) {
  console.error('❌ AS Settings routes failed:', e.message);
}

try {
  app.use('/api/service-management', require('./src/routes/service-management'));
  console.log('✅ Service Management routes loaded');
} catch (e) {
  console.error('❌ Service Management routes failed:', e.message);
}

try {
  app.use('/api/smart-search', require('./src/routes/smart-search'));
  console.log('✅ Smart Search routes loaded');
} catch (e) {
  console.error('❌ Smart Search routes failed:', e.message);
}

try {
  app.use('/api/promotional-subscriptions', require('./src/routes/promotional-subscriptions'));
  console.log('✅ Promotional Subscriptions routes loaded');
} catch (e) {
  console.error('❌ Promotional Subscriptions routes failed:', e.message);
}

try {
  app.use('/api/availability-status', require('./src/routes/availability-status'));
  console.log('✅ Availability Status routes loaded');
} catch (e) {
  console.error('❌ Availability Status routes failed:', e.message);
}

try {
  app.use('/api/explorer', require('./src/routes/explorer'));
  console.log('✅ Explorer routes loaded');
} catch (e) {
  console.error('❌ Explorer routes failed:', e.message);
}

try {
  app.use('/api/as-interests', require('./src/routes/as-interests'));
  console.log('✅ AS Interests routes loaded');
} catch (e) {
  console.error('❌ AS Interests routes failed:', e.message);
}

try {
  app.use('/api/explorer-chat', require('./src/routes/explorer-chat'));
  console.log('✅ Explorer Chat routes loaded');
} catch (e) {
  console.error('❌ Explorer Chat routes failed:', e.message);
}

try {
  app.use('/api/explorer-reviews', require('./src/routes/explorer-reviews'));
  console.log('✅ Explorer Reviews routes loaded');
} catch (e) {
  console.error('❌ Explorer Reviews routes failed:', e.message);
}

try {
  app.use('/api/as-reviews', require('./src/routes/as-reviews'));
  console.log('✅ AS Reviews routes loaded');
} catch (e) {
  console.error('❌ AS Reviews routes failed:', e.message);
}

try {
  app.use('/api/mutual-confirmation', require('./src/routes/mutual-confirmation'));
  console.log('✅ Mutual Confirmation routes loaded');
} catch (e) {
  console.error('❌ Mutual Confirmation routes failed:', e.message);
}

try {
  app.use('/api/role-switching', require('./src/routes/role-switching'));
  console.log('✅ Role Switching routes loaded');
} catch (e) {
  console.error('❌ Role Switching routes failed:', e.message);
}

try {
  app.use('/api/verification', require('./src/routes/verification'));
  console.log('✅ Verification routes loaded');
} catch (e) {
  console.error('❌ Verification routes failed:', e.message);
}

try {
  app.use('/api/system', require('./src/routes/system-status'));
  console.log('✅ System Status routes loaded');
} catch (e) {
  console.error('❌ System Status routes failed:', e.message);
}

// Email verification endpoint (for direct links) - redirect to frontend
app.get('/verificar-email', async (req, res) => {
  const { token, type } = req.query;
  
  if (!token) {
    return res.redirect('https://fixia-platform.vercel.app/auth/login?error=token-missing');
  }
  
  // Redirect to the beautiful frontend verification page that already exists
  res.redirect(`https://fixia-platform.vercel.app/verificar-email?token=${token}&type=${type || 'customer'}`);
});

// Password reset endpoint (for direct links) - redirect to frontend
app.get('/recuperar-password', async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.redirect('https://fixia-platform.vercel.app/auth/login?error=token-missing');
  }
  
  // Redirect to the frontend password reset page
  res.redirect(`https://fixia-platform.vercel.app/recuperar-password?token=${token}`);
});

// Also handle the API endpoint with GET (BEFORE 404 handler)
app.get('/api/email-verification/verify', async (req, res) => {
  try {
    console.log('📧 API verification requested:', req.query);
    const { token, type } = req.query;
    
    if (!token) {
      return res.status(400).json({
        error: 'Token de verificación requerido'
      });
    }

    // Direct verification implementation (same as /verificar-email)
    const { query } = require('./src/config/database');
    
    // Verify token and update user
    const result = await query(`
      UPDATE users 
      SET email_verified = true, email_verified_at = CURRENT_TIMESTAMP 
      WHERE id = (
        SELECT user_id FROM email_verification_tokens 
        WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP
      )
      RETURNING id, email, first_name, last_name
    `, [token]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({
        error: 'Token inválido o expirado'
      });
    }
    
    const user = result.rows[0];
    
    // Delete used token
    await query('DELETE FROM email_verification_tokens WHERE token = $1', [token]);
    
    console.log('✅ Email verified for user:', user.email);
    
    // Return success response
    res.json({
      success: true,
      message: `¡Email verificado exitosamente! Bienvenido ${user.first_name}`,
      data: {
        email: user.email,
        verified: true,
        redirect_url: 'https://fixia-platform.vercel.app/auth/login'
      }
    });
    
  } catch (error) {
    console.error('❌ API Email verification error:', error);
    res.status(500).json({
      error: 'Error en la verificación de email',
      details: error.message
    });
  }
});

// Static files MUST be before 404 handler
console.log('📁 Setting up static file serving for uploads...');

// MOVED: Static file serving for uploads with CORS (moved here to be before 404)
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  
  console.log('📁 Static file request:', {
    url: req.url,
    originalUrl: req.originalUrl,
    origin: origin,
    referer: req.headers.referer,
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });
  
  // Always allow CORS for images (since origin might be undefined for direct requests)
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires, X-Custom-Header');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('📁 Static file OPTIONS handled');
    return res.status(200).end();
  }
  
  // Add cache control for images
  if (req.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    res.header('Cache-Control', 'public, max-age=31536000'); // 1 year
  }
  
  next();
}, express.static('uploads', {
  // Express.static options for security
  dotfiles: 'deny',
  index: false,
  redirect: false
}));

// 404 handler
app.use('*', (req, res) => {
  console.log('❓ Unknown route:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Endpoint no encontrado',
    method: req.method,
    url: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err.message);
  res.status(500).json({
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log('✅ Database connected');
    } else {
      console.warn('⚠️ Database not connected');
    }
    
    app.listen(PORT, () => {
      console.log(`✅ Production server running on port ${PORT}`);
      console.log(`🌐 Health: http://localhost:${PORT}/health`);
      console.log(`🔗 Ready for production traffic`);
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;