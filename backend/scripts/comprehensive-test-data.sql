-- ============================================================================
-- COMPREHENSIVE FIXIA MARKETPLACE TEST DATA
-- ============================================================================
-- Creates realistic test data showcasing the marketplace system at its best
-- Author: Senior Database Architect - Fixia Collaboration Team
-- Date: August 2, 2025
-- 
-- This script creates:
-- - 15 diverse professional profiles across key categories
-- - 50+ portfolio images with rich metadata
-- - Explorer favorites and engagement scenarios
-- - Featured professionals for different locations
-- - Realistic Spanish language content throughout
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ENSURE BASIC DATA EXISTS
-- ============================================================================

-- Insert essential categories if they don't exist
INSERT INTO categories (name, icon, group_name, description, is_active) VALUES
('Plomería', '🔧', 'Mantenimiento y reparaciones', 'Servicios de plomería, fontanería y destapes', true),
('Electricidad', '⚡', 'Mantenimiento y reparaciones', 'Instalaciones eléctricas, reparaciones y mantenimiento', true),
('Carpintería', '🔨', 'Mantenimiento y reparaciones', 'Trabajos en madera, muebles y estructuras', true),
('Construcción', '🏗️', 'Mantenimiento y reparaciones', 'Albañilería, refacciones y construcción', true),
('Jardinería', '🌱', 'Jardinería y espacios exteriores', 'Diseño, mantenimiento y cuidado de jardines', true),
('Pintura', '🎨', 'Mantenimiento y reparaciones', 'Pintura de interiores, exteriores y decorativa', true),
('Limpieza', '🧹', 'Servicios para el hogar y la familia', 'Limpieza doméstica y comercial profunda', true),
('Diseño Interior', '🏠', 'Diseño y decoración', 'Diseño de interiores y decoración', true),
('Soldadura', '🔥', 'Mantenimiento y reparaciones', 'Soldadura, herrería y trabajos en metal', true),
('Reparación PC', '💻', 'Tecnología y electrónicos', 'Reparación de computadoras y tecnología', true)
ON CONFLICT (name) DO UPDATE SET
  icon = EXCLUDED.icon,
  group_name = EXCLUDED.group_name,
  description = EXCLUDED.description;

-- Insert Chubut localities if they don't exist
INSERT INTO chubut_localities (name, region, is_active) VALUES
('Puerto Madryn', 'Península Valdés', true),
('Trelew', 'Valle del Chubut', true),
('Rawson', 'Valle del Chubut', true),
('Comodoro Rivadavia', 'Golfo San Jorge', true),
('Esquel', 'Cordillera', true),
('Gaiman', 'Valle del Chubut', true),
('Dolavon', 'Valle del Chubut', true),
('Rada Tilly', 'Golfo San Jorge', true),
('Trevelin', 'Cordillera', true),
('Puerto Pirámides', 'Península Valdés', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. PROFESSIONAL USERS (AS) - DIVERSE SPECIALTIES
-- ============================================================================

-- Professional 1: Master Plumber - Carlos Mendoza
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  is_identity_verified, created_at
) VALUES (
  'Carlos', 'Mendoza', 'carlos.mendoza@email.com', 
  '$2b$10$example_hashed_password', '+54 280 4123456', 'as',
  'Puerto Madryn', '1978-03-15', true, true, true, 
  CURRENT_TIMESTAMP - INTERVAL '2 years'
) ON CONFLICT (email) DO NOTHING;

-- Professional 2: Expert Electrician - María González
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  is_identity_verified, created_at
) VALUES (
  'María', 'González', 'maria.gonzalez@email.com', 
  '$2b$10$example_hashed_password', '+54 280 4234567', 'as',
  'Trelew', '1985-07-22', true, true, true, 
  CURRENT_TIMESTAMP - INTERVAL '18 months'
) ON CONFLICT (email) DO NOTHING;

-- Professional 3: Master Carpenter - Diego Fernández
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  is_identity_verified, created_at
) VALUES (
  'Diego', 'Fernández', 'diego.fernandez@email.com', 
  '$2b$10$example_hashed_password', '+54 280 4345678', 'as',
  'Rawson', '1982-11-08', true, true, true, 
  CURRENT_TIMESTAMP - INTERVAL '14 months'
) ON CONFLICT (email) DO NOTHING;

-- Professional 4: Construction Expert - Roberto Silva
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  is_identity_verified, created_at
) VALUES (
  'Roberto', 'Silva', 'roberto.silva@email.com', 
  '$2b$10$example_hashed_password', '+54 297 4456789', 'as',
  'Comodoro Rivadavia', '1975-09-12', true, true, true, 
  CURRENT_TIMESTAMP - INTERVAL '3 years'
) ON CONFLICT (email) DO NOTHING;

-- Professional 5: Garden Designer - Ana López
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  is_identity_verified, created_at
) VALUES (
  'Ana', 'López', 'ana.lopez@email.com', 
  '$2b$10$example_hashed_password', '+54 2945 567890', 'as',
  'Esquel', '1988-05-18', true, true, true, 
  CURRENT_TIMESTAMP - INTERVAL '10 months'
) ON CONFLICT (email) DO NOTHING;

-- Professional 6: Artistic Painter - Lucía Martín
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  is_identity_verified, created_at
) VALUES (
  'Lucía', 'Martín', 'lucia.martin@email.com', 
  '$2b$10$example_hashed_password', '+54 280 4678901', 'as',
  'Gaiman', '1991-01-25', true, true, true, 
  CURRENT_TIMESTAMP - INTERVAL '8 months'
) ON CONFLICT (email) DO NOTHING;

-- Professional 7: Deep Cleaning Expert - Carmen Torres
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  is_identity_verified, created_at
) VALUES (
  'Carmen', 'Torres', 'carmen.torres@email.com', 
  '$2b$10$example_hashed_password', '+54 280 4789012', 'as',
  'Dolavon', '1979-12-03', true, true, true, 
  CURRENT_TIMESTAMP - INTERVAL '15 months'
) ON CONFLICT (email) DO NOTHING;

-- Professional 8: Interior Designer - Sebastián Ruiz
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  is_identity_verified, created_at
) VALUES (
  'Sebastián', 'Ruiz', 'sebastian.ruiz@email.com', 
  '$2b$10$example_hashed_password', '+54 297 4890123', 'as',
  'Rada Tilly', '1987-04-14', true, true, true, 
  CURRENT_TIMESTAMP - INTERVAL '12 months'
) ON CONFLICT (email) DO NOTHING;

-- Professional 9: Welder/Metalworker - Pablo Herrera
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  is_identity_verified, created_at
) VALUES (
  'Pablo', 'Herrera', 'pablo.herrera@email.com', 
  '$2b$10$example_hashed_password', '+54 2945 901234', 'as',
  'Trevelin', '1983-08-07', true, true, true, 
  CURRENT_TIMESTAMP - INTERVAL '16 months'
) ON CONFLICT (email) DO NOTHING;

-- Professional 10: Tech Repair Expert - Natalia Vega
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  is_identity_verified, created_at
) VALUES (
  'Natalia', 'Vega', 'natalia.vega@email.com', 
  '$2b$10$example_hashed_password', '+54 280 5012345', 'as',
  'Puerto Pirámides', '1990-06-30', true, true, true, 
  CURRENT_TIMESTAMP - INTERVAL '7 months'
) ON CONFLICT (email) DO NOTHING;

-- Add 5 more professionals for diversity
-- Professional 11: Young Ambitious Electrician - Mateo Sánchez
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  is_identity_verified, created_at
) VALUES (
  'Mateo', 'Sánchez', 'mateo.sanchez@email.com', 
  '$2b$10$example_hashed_password', '+54 280 5123456', 'as',
  'Puerto Madryn', '1995-02-10', true, true, true, 
  CURRENT_TIMESTAMP - INTERVAL '4 months'
) ON CONFLICT (email) DO NOTHING;

-- Professional 12: Experienced Garden Expert - Elena Morales
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  is_identity_verified, created_at
) VALUES (
  'Elena', 'Morales', 'elena.morales@email.com', 
  '$2b$10$example_hashed_password', '+54 280 5234567', 'as',
  'Trelew', '1981-10-16', true, true, true, 
  CURRENT_TIMESTAMP - INTERVAL '20 months'
) ON CONFLICT (email) DO NOTHING;

-- Professional 13: Premium Carpenter - Fernando Castro
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  is_identity_verified, created_at
) VALUES (
  'Fernando', 'Castro', 'fernando.castro@email.com', 
  '$2b$10$example_hashed_password', '+54 280 5345678', 'as',
  'Rawson', '1977-12-22', true, true, true, 
  CURRENT_TIMESTAMP - INTERVAL '3.5 years'
) ON CONFLICT (email) DO NOTHING;

-- Professional 14: Specialty Painter - Valentina Romero
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  is_identity_verified, created_at
) VALUES (
  'Valentina', 'Romero', 'valentina.romero@email.com', 
  '$2b$10$example_hashed_password', '+54 297 5456789', 'as',
  'Comodoro Rivadavia', '1993-03-28', true, true, true, 
  CURRENT_TIMESTAMP - INTERVAL '6 months'
) ON CONFLICT (email) DO NOTHING;

-- Professional 15: Multi-skilled Handyman - Andrés Jiménez
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  is_identity_verified, created_at
) VALUES (
  'Andrés', 'Jiménez', 'andres.jimenez@email.com', 
  '$2b$10$example_hashed_password', '+54 2945 567890', 'as',
  'Esquel', '1986-09-05', true, true, true, 
  CURRENT_TIMESTAMP - INTERVAL '11 months'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 3. EXPLORER USERS - DIVERSE CLIENT BASE
-- ============================================================================

-- Explorer 1: Family Home Owner
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  created_at
) VALUES (
  'Sofía', 'García', 'sofia.garcia@email.com', 
  '$2b$10$example_hashed_password', '+54 280 6123456', 'explorador',
  'Puerto Madryn', '1984-06-15', true, true, 
  CURRENT_TIMESTAMP - INTERVAL '1 year'
) ON CONFLICT (email) DO NOTHING;

-- Explorer 2: Young Professional
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  created_at
) VALUES (
  'Martín', 'Pérez', 'martin.perez@email.com', 
  '$2b$10$example_hashed_password', '+54 280 6234567', 'explorador',
  'Trelew', '1992-11-20', true, true, 
  CURRENT_TIMESTAMP - INTERVAL '8 months'
) ON CONFLICT (email) DO NOTHING;

-- Explorer 3: Small Business Owner
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  created_at
) VALUES (
  'Laura', 'Rodríguez', 'laura.rodriguez@email.com', 
  '$2b$10$example_hashed_password', '+54 297 6345678', 'explorador',
  'Comodoro Rivadavia', '1979-08-08', true, true, 
  CURRENT_TIMESTAMP - INTERVAL '15 months'
) ON CONFLICT (email) DO NOTHING;

-- Explorer 4: Retiree with Time for Projects
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  created_at
) VALUES (
  'Miguel', 'Vargas', 'miguel.vargas@email.com', 
  '$2b$10$example_hashed_password', '+54 2945 6456789', 'explorador',
  'Esquel', '1968-04-12', true, true, 
  CURRENT_TIMESTAMP - INTERVAL '2 years'
) ON CONFLICT (email) DO NOTHING;

-- Explorer 5: New Homeowner
INSERT INTO users (
  first_name, last_name, email, password, phone, user_type, 
  locality, date_of_birth, is_email_verified, is_phone_verified,
  created_at
) VALUES (
  'Carolina', 'Mendez', 'carolina.mendez@email.com', 
  '$2b$10$example_hashed_password', '+54 280 6567890', 'explorador',
  'Rawson', '1989-12-25', true, true, 
  CURRENT_TIMESTAMP - INTERVAL '5 months'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 4. PROFESSIONAL PROFILES & SPECIALIZATIONS
-- ============================================================================

-- Get user IDs for creating services and work categories
DO $$
DECLARE
  carlos_id INT;
  maria_id INT;
  diego_id INT;
  roberto_id INT;
  ana_id INT;
  lucia_id INT;
  carmen_id INT;
  sebastian_id INT;
  pablo_id INT;
  natalia_id INT;
  mateo_id INT;
  elena_id INT;
  fernando_id INT;
  valentina_id INT;
  andres_id INT;
  
  plomeria_cat_id INT;
  electricidad_cat_id INT;
  carpinteria_cat_id INT;
  construccion_cat_id INT;
  jardineria_cat_id INT;
  pintura_cat_id INT;
  limpieza_cat_id INT;
  diseno_cat_id INT;
  soldadura_cat_id INT;
  reparacion_cat_id INT;
BEGIN
  -- Get user IDs
  SELECT id INTO carlos_id FROM users WHERE email = 'carlos.mendoza@email.com';
  SELECT id INTO maria_id FROM users WHERE email = 'maria.gonzalez@email.com';
  SELECT id INTO diego_id FROM users WHERE email = 'diego.fernandez@email.com';
  SELECT id INTO roberto_id FROM users WHERE email = 'roberto.silva@email.com';
  SELECT id INTO ana_id FROM users WHERE email = 'ana.lopez@email.com';
  SELECT id INTO lucia_id FROM users WHERE email = 'lucia.martin@email.com';
  SELECT id INTO carmen_id FROM users WHERE email = 'carmen.torres@email.com';
  SELECT id INTO sebastian_id FROM users WHERE email = 'sebastian.ruiz@email.com';
  SELECT id INTO pablo_id FROM users WHERE email = 'pablo.herrera@email.com';
  SELECT id INTO natalia_id FROM users WHERE email = 'natalia.vega@email.com';
  SELECT id INTO mateo_id FROM users WHERE email = 'mateo.sanchez@email.com';
  SELECT id INTO elena_id FROM users WHERE email = 'elena.morales@email.com';
  SELECT id INTO fernando_id FROM users WHERE email = 'fernando.castro@email.com';
  SELECT id INTO valentina_id FROM users WHERE email = 'valentina.romero@email.com';
  SELECT id INTO andres_id FROM users WHERE email = 'andres.jimenez@email.com';
  
  -- Get category IDs
  SELECT id INTO plomeria_cat_id FROM categories WHERE name = 'Plomería';
  SELECT id INTO electricidad_cat_id FROM categories WHERE name = 'Electricidad';
  SELECT id INTO carpinteria_cat_id FROM categories WHERE name = 'Carpintería';
  SELECT id INTO construccion_cat_id FROM categories WHERE name = 'Construcción';
  SELECT id INTO jardineria_cat_id FROM categories WHERE name = 'Jardinería';
  SELECT id INTO pintura_cat_id FROM categories WHERE name = 'Pintura';
  SELECT id INTO limpieza_cat_id FROM categories WHERE name = 'Limpieza';
  SELECT id INTO diseno_cat_id FROM categories WHERE name = 'Diseño Interior';
  SELECT id INTO soldadura_cat_id FROM categories WHERE name = 'Soldadura';
  SELECT id INTO reparacion_cat_id FROM categories WHERE name = 'Reparación PC';

  -- ========================================================================
  -- CREATE PROFESSIONAL WORK CATEGORIES
  -- ========================================================================
  
  -- Carlos Mendoza - Master Plumber
  INSERT INTO as_work_categories (user_id, category_id, experience_years, is_primary, created_at) VALUES
  (carlos_id, plomeria_cat_id, 15, true, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, category_id) DO NOTHING;
  
  -- María González - Expert Electrician
  INSERT INTO as_work_categories (user_id, category_id, experience_years, is_primary, created_at) VALUES
  (maria_id, electricidad_cat_id, 12, true, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, category_id) DO NOTHING;
  
  -- Diego Fernández - Master Carpenter
  INSERT INTO as_work_categories (user_id, category_id, experience_years, is_primary, created_at) VALUES
  (diego_id, carpinteria_cat_id, 18, true, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, category_id) DO NOTHING;
  
  -- Roberto Silva - Construction Expert (multi-skilled)
  INSERT INTO as_work_categories (user_id, category_id, experience_years, is_primary, created_at) VALUES
  (roberto_id, construccion_cat_id, 20, true, CURRENT_TIMESTAMP),
  (roberto_id, plomeria_cat_id, 8, false, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, category_id) DO NOTHING;
  
  -- Ana López - Garden Designer
  INSERT INTO as_work_categories (user_id, category_id, experience_years, is_primary, created_at) VALUES
  (ana_id, jardineria_cat_id, 7, true, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, category_id) DO NOTHING;
  
  -- Lucía Martín - Artistic Painter
  INSERT INTO as_work_categories (user_id, category_id, experience_years, is_primary, created_at) VALUES
  (lucia_id, pintura_cat_id, 6, true, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, category_id) DO NOTHING;
  
  -- Carmen Torres - Deep Cleaning Expert
  INSERT INTO as_work_categories (user_id, category_id, experience_years, is_primary, created_at) VALUES
  (carmen_id, limpieza_cat_id, 10, true, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, category_id) DO NOTHING;
  
  -- Sebastián Ruiz - Interior Designer
  INSERT INTO as_work_categories (user_id, category_id, experience_years, is_primary, created_at) VALUES
  (sebastian_id, diseno_cat_id, 8, true, CURRENT_TIMESTAMP),
  (sebastian_id, pintura_cat_id, 5, false, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, category_id) DO NOTHING;
  
  -- Pablo Herrera - Welder/Metalworker
  INSERT INTO as_work_categories (user_id, category_id, experience_years, is_primary, created_at) VALUES
  (pablo_id, soldadura_cat_id, 11, true, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, category_id) DO NOTHING;
  
  -- Natalia Vega - Tech Repair Expert
  INSERT INTO as_work_categories (user_id, category_id, experience_years, is_primary, created_at) VALUES
  (natalia_id, reparacion_cat_id, 5, true, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, category_id) DO NOTHING;
  
  -- Mateo Sánchez - Young Ambitious Electrician
  INSERT INTO as_work_categories (user_id, category_id, experience_years, is_primary, created_at) VALUES
  (mateo_id, electricidad_cat_id, 3, true, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, category_id) DO NOTHING;
  
  -- Elena Morales - Experienced Garden Expert
  INSERT INTO as_work_categories (user_id, category_id, experience_years, is_primary, created_at) VALUES
  (elena_id, jardineria_cat_id, 14, true, CURRENT_TIMESTAMP),
  (elena_id, diseno_cat_id, 4, false, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, category_id) DO NOTHING;
  
  -- Fernando Castro - Premium Carpenter
  INSERT INTO as_work_categories (user_id, category_id, experience_years, is_primary, created_at) VALUES
  (fernando_id, carpinteria_cat_id, 22, true, CURRENT_TIMESTAMP),
  (fernando_id, construccion_cat_id, 15, false, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, category_id) DO NOTHING;
  
  -- Valentina Romero - Specialty Painter
  INSERT INTO as_work_categories (user_id, category_id, experience_years, is_primary, created_at) VALUES
  (valentina_id, pintura_cat_id, 4, true, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, category_id) DO NOTHING;
  
  -- Andrés Jiménez - Multi-skilled Handyman
  INSERT INTO as_work_categories (user_id, category_id, experience_years, is_primary, created_at) VALUES
  (andres_id, carpinteria_cat_id, 8, true, CURRENT_TIMESTAMP),
  (andres_id, electricidad_cat_id, 6, false, CURRENT_TIMESTAMP),
  (andres_id, plomeria_cat_id, 5, false, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, category_id) DO NOTHING;

END $$;

-- ============================================================================
-- 5. PORTFOLIO IMAGES - SHOWCASE QUALITY WORK
-- ============================================================================

-- This section will be continued in the next part due to length...
-- The portfolio images section will create 50+ realistic portfolio entries
-- with rich metadata, proper categorization, and engagement metrics

COMMIT;

-- ============================================================================
-- END OF PART 1
-- ============================================================================
-- This script continues with portfolio images, favorites, and analytics data
-- Run this script first, then run comprehensive-test-data-part2.sql
-- ============================================================================