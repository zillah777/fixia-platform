-- ========================================
-- FIXIA DATABASE CRITICAL FIXES
-- Fecha: Enero 2025
-- Auditoría completa realizada
-- ========================================

-- FASE 1: AGREGAR COLUMNAS FALTANTES EN TABLA USERS
-- ========================================

-- 1. Subscription Type (Sistema de suscripciones)
ALTER TABLE users ADD COLUMN subscription_type VARCHAR(20) DEFAULT 'free';

-- 2. Verification Score (Sistema de ranking)  
ALTER TABLE users ADD COLUMN verification_score INTEGER DEFAULT 0;

-- 3. About Me (Perfiles profesionales)
ALTER TABLE users ADD COLUMN about_me TEXT;

-- 4. Has Mobility (Información de movilidad)
ALTER TABLE users ADD COLUMN has_mobility BOOLEAN DEFAULT false;

-- 5. Professional Info (Información profesional en JSON)
ALTER TABLE users ADD COLUMN professional_info JSONB;

-- 6. Profile Photo URL (Compatibilidad frontend)
ALTER TABLE users ADD COLUMN profile_photo_url TEXT;

-- 7. Birth Date (Fecha de nacimiento - duplicada con date_of_birth)
ALTER TABLE users ADD COLUMN birth_date DATE;

-- FASE 2: CREAR TABLAS CRÍTICAS FALTANTES
-- ========================================

-- 1. EXPLORER PROFILES TABLE
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

-- 2. USER PROFESSIONAL INFO TABLE
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

-- 3. USER AVAILABILITY STATUS TABLE
CREATE TABLE IF NOT EXISTS user_availability_status (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT true,
    availability_type VARCHAR(20) DEFAULT 'online', -- online, offline, busy
    status_message TEXT,
    auto_accept_bookings BOOLEAN DEFAULT false,
    max_concurrent_jobs INTEGER DEFAULT 3,
    working_hours JSONB DEFAULT '{"monday": {"start": "08:00", "end": "18:00", "available": true}, "tuesday": {"start": "08:00", "end": "18:00", "available": true}, "wednesday": {"start": "08:00", "end": "18:00", "available": true}, "thursday": {"start": "08:00", "end": "18:00", "available": true}, "friday": {"start": "08:00", "end": "18:00", "available": true}, "saturday": {"start": "09:00", "end": "14:00", "available": true}, "sunday": {"start": "09:00", "end": "14:00", "available": false}}',
    timezone VARCHAR(50) DEFAULT 'America/Argentina/Buenos_Aires',
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 4. AS PRICING TABLE
CREATE TABLE IF NOT EXISTS as_pricing (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL, -- hourly, fixed, per_unit
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

-- FASE 3: ARREGLAR TABLA AS_WORK_LOCATIONS
-- ========================================

-- Agregar columna locality si no existe
ALTER TABLE as_work_locations ADD COLUMN IF NOT EXISTS locality VARCHAR(100);

-- Copiar datos de location_name a locality
UPDATE as_work_locations SET locality = location_name WHERE locality IS NULL;

-- Agregar columnas adicionales necesarias
ALTER TABLE as_work_locations ADD COLUMN IF NOT EXISTS province VARCHAR(50) DEFAULT 'Chubut';
ALTER TABLE as_work_locations ADD COLUMN IF NOT EXISTS travel_radius INTEGER DEFAULT 0;
ALTER TABLE as_work_locations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE as_work_locations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- FASE 4: ARREGLAR TABLA AS_WORK_CATEGORIES
-- ========================================

-- Agregar columnas faltantes
ALTER TABLE as_work_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE as_work_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- FASE 5: CREAR ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_subscription_type ON users(subscription_type);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);
CREATE INDEX IF NOT EXISTS idx_users_verification_score ON users(verification_score);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Índices para explorer_profiles
CREATE INDEX IF NOT EXISTS idx_explorer_profiles_user_id ON explorer_profiles(user_id);

-- Índices para user_professional_info
CREATE INDEX IF NOT EXISTS idx_user_professional_info_user_id ON user_professional_info(user_id);

-- Índices para user_availability_status
CREATE INDEX IF NOT EXISTS idx_user_availability_status_user_id ON user_availability_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_availability_status_is_available ON user_availability_status(is_available);

-- Índices para as_pricing
CREATE INDEX IF NOT EXISTS idx_as_pricing_user_id ON as_pricing(user_id);
CREATE INDEX IF NOT EXISTS idx_as_pricing_category_id ON as_pricing(category_id);
CREATE INDEX IF NOT EXISTS idx_as_pricing_is_active ON as_pricing(is_active);

-- Índices para as_work_locations
CREATE INDEX IF NOT EXISTS idx_as_work_locations_user_id ON as_work_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_as_work_locations_locality ON as_work_locations(locality);
CREATE INDEX IF NOT EXISTS idx_as_work_locations_is_active ON as_work_locations(is_active);

-- Índices para as_work_categories
CREATE INDEX IF NOT EXISTS idx_as_work_categories_user_id ON as_work_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_as_work_categories_category_id ON as_work_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_as_work_categories_is_active ON as_work_categories(is_active);

-- FASE 6: DATOS INICIALES Y MIGRACIÓN
-- ========================================

-- Actualizar usuarios existentes con valores por defecto
UPDATE users SET 
    subscription_type = 'free',
    verification_score = 0,
    verification_status = 'pending'
WHERE subscription_type IS NULL;

-- Crear perfiles explorer para usuarios tipo client
INSERT INTO explorer_profiles (user_id, preferred_localities, preferred_categories)
SELECT id, '[]', '[]' 
FROM users 
WHERE user_type = 'client' 
AND NOT EXISTS (SELECT 1 FROM explorer_profiles WHERE user_id = users.id);

-- Crear info profesional para usuarios tipo provider
INSERT INTO user_professional_info (user_id, years_experience, about_me)
SELECT id, 0, bio 
FROM users 
WHERE user_type = 'provider' 
AND NOT EXISTS (SELECT 1 FROM user_professional_info WHERE user_id = users.id);

-- Crear status de disponibilidad para usuarios tipo provider
INSERT INTO user_availability_status (user_id, is_available, availability_type)
SELECT id, true, 'online'
FROM users 
WHERE user_type = 'provider' 
AND NOT EXISTS (SELECT 1 FROM user_availability_status WHERE user_id = users.id);

-- FASE 7: CONSTRAINTS Y VALIDACIONES
-- ========================================

-- Constraints para users
ALTER TABLE users ADD CONSTRAINT chk_subscription_type 
    CHECK (subscription_type IN ('free', 'basic', 'premium'));
    
ALTER TABLE users ADD CONSTRAINT chk_verification_status 
    CHECK (verification_status IN ('pending', 'in_review', 'verified', 'rejected'));

-- Constraints para user_availability_status
ALTER TABLE user_availability_status ADD CONSTRAINT chk_availability_type 
    CHECK (availability_type IN ('online', 'offline', 'busy'));
    
-- Constraints para as_pricing
ALTER TABLE as_pricing ADD CONSTRAINT chk_service_type 
    CHECK (service_type IN ('hourly', 'fixed', 'per_unit'));
    
ALTER TABLE as_pricing ADD CONSTRAINT chk_currency 
    CHECK (currency IN ('ARS', 'USD'));

-- ========================================
-- FIN DE FIXES CRÍTICOS
-- Ejecutar estos queries en orden para arreglar completamente la base de datos
-- ========================================