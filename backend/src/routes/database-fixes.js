/**
 * Database Fixes Routes - Critical database repair endpoints
 * @fileoverview Contains endpoints for executing database fixes and migrations
 */
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Middleware to restrict database fixes to authorized users only
const adminOnly = (req, res, next) => {
  // In production, you should add proper admin authentication here
  if (process.env.NODE_ENV === 'production') {
    const authKey = req.headers['x-admin-key'];
    if (!authKey || authKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: 'Unauthorized - Admin access required' });
    }
  }
  next();
};

/**
 * @swagger
 * /database-fixes/execute-fixes:
 *   post:
 *     tags: [Database Fixes]
 *     summary: Execute critical database fixes
 *     security:
 *       - AdminKey: []
 *     responses:
 *       200:
 *         description: Database fixes executed successfully
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Database fix execution failed
 */
router.post('/execute-fixes', adminOnly, async (req, res) => {
  try {
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

module.exports = router;