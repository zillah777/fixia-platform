-- ============================================================================
-- FIXIA MARKETPLACE TEST DATA
-- ============================================================================
-- Comprehensive test data for marketplace and portfolio system
-- Created with agent collaboration for realistic showcase
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. PROFESSIONAL USERS (AS)
-- ============================================================================

-- Insert professional users with diverse specialties
INSERT INTO users (first_name, last_name, email, phone, user_type, locality, address, bio, verification_status, email_verified, is_active) VALUES
('María', 'González', 'maria.gonzalez@email.com', '+542974123456', 'provider', 'Comodoro Rivadavia', 'Belgrano 1250', 'Especialista en plomería residencial con más de 8 años de experiencia. Trabajo garantizado y materiales de primera calidad.', 'verified', true, true),
('Carlos', 'Rodríguez', 'carlos.rodriguez@email.com', '+542974234567', 'provider', 'Puerto Madryn', 'San Martín 850', 'Técnico electricista matriculado especializado en instalaciones domiciliarias y sistemas de seguridad.', 'verified', true, true),
('Ana', 'López', 'ana.lopez@email.com', '+542974345678', 'provider', 'Trelew', 'Rivadavia 650', 'Contratista general con experiencia en construcción y remodelación de viviendas. Proyectos llave en mano.', 'verified', true, true),
('Roberto', 'Martínez', 'roberto.martinez@email.com', '+542974456789', 'provider', 'Rawson', 'Moreno 420', 'Especialista en jardinería y paisajismo. Diseño y mantenimiento de espacios verdes residenciales y comerciales.', 'verified', true, true),
('Laura', 'Fernández', 'laura.fernandez@email.com', '+542974567890', 'provider', 'Esquel', 'Ameghino 380', 'Servicio de limpieza profesional para hogares y oficinas. Equipo capacitado y productos ecológicos.', 'verified', true, true),
('Diego', 'Pérez', 'diego.perez@email.com', '+542974678901', 'provider', 'Comodoro Rivadavia', 'Rivadavia 1180', 'Técnico en informática y reparación de dispositivos. Servicio a domicilio y soporte técnico.', 'verified', true, true),
('Claudia', 'Sánchez', 'claudia.sanchez@email.com', '+542974789012', 'provider', 'Puerto Madryn', 'Yrigoyen 720', 'Pintora profesional especializada en interiores y exteriores. Presupuestos sin cargo.', 'verified', true, true),
('Miguel', 'Torres', 'miguel.torres@email.com', '+542974890123', 'provider', 'Trelew', 'Belgrano 940', 'Soldador y herrero con taller propio. Especializado en rejas, portones y estructuras metálicas.', 'verified', true, true),
('Patricia', 'Ruiz', 'patricia.ruiz@email.com', '+542974901234', 'provider', 'Comodoro Rivadavia', 'San Martín 1450', 'Chef profesional para eventos y catering. Especialidad en comida patagónica y internacional.', 'verified', true, true),
('Fernando', 'Morales', 'fernando.morales@email.com', '+542975012345', 'provider', 'Puerto Madryn', 'Mitre 580', 'Técnico en aire acondicionado y refrigeración. Instalación, mantenimiento y reparación.', 'verified', true, true);

-- ============================================================================
-- 2. EXPLORER USERS (CUSTOMERS)
-- ============================================================================

-- Insert explorer users for testing favorites and interactions
INSERT INTO users (first_name, last_name, email, phone, user_type, locality, address, bio, verification_status, email_verified, is_active) VALUES
('Sofía', 'Castro', 'sofia.castro@email.com', '+542974111222', 'customer', 'Comodoro Rivadavia', 'Alem 850', 'Propietaria buscando profesionales confiables para mantenimiento del hogar.', 'verified', true, true),
('Juan', 'Mendoza', 'juan.mendoza@email.com', '+542974222333', 'customer', 'Puerto Madryn', 'Roca 420', 'Empresario local que necesita servicios para oficinas y locales comerciales.', 'verified', true, true),
('Elena', 'Vargas', 'elena.vargas@email.com', '+542974333444', 'customer', 'Trelew', 'Fontana 180', 'Madre de familia interesada en servicios de limpieza y jardinería.', 'verified', true, true);

-- ============================================================================
-- 3. PRIVACY SETTINGS FOR PROFESSIONALS
-- ============================================================================

-- Set up privacy settings for all professionals
INSERT INTO as_privacy_settings (user_id, show_phone, show_email, show_portfolio_in_marketplace, show_portfolio_project_values, portfolio_visibility)
SELECT id, true, false, true, true, 'public'
FROM users WHERE user_type = 'provider';

-- ============================================================================
-- 4. PROFESSIONAL MARKETPLACE METRICS
-- ============================================================================

-- Initialize marketplace metrics for all professionals
INSERT INTO professional_marketplace_metrics (
    user_id, profile_views_total, profile_views_week, portfolio_views_total, 
    contact_requests_total, favorites_count, marketplace_ranking_score, trending_score
)
SELECT 
    id,
    FLOOR(RANDOM() * 500 + 50)::INT, -- 50-550 total views
    FLOOR(RANDOM() * 50 + 5)::INT,   -- 5-55 weekly views
    FLOOR(RANDOM() * 300 + 20)::INT, -- 20-320 portfolio views
    FLOOR(RANDOM() * 25 + 2)::INT,   -- 2-27 contact requests
    FLOOR(RANDOM() * 15 + 1)::INT,   -- 1-16 favorites
    RANDOM() * 8 + 2,                -- 2-10 ranking score
    RANDOM() * 5 + 1                 -- 1-6 trending score
FROM users WHERE user_type = 'provider';

-- ============================================================================
-- 5. PORTFOLIO IMAGES
-- ============================================================================

-- María González (Plomería) - Portfolio images
DO $$
DECLARE
    maria_id INT;
BEGIN
    SELECT id INTO maria_id FROM users WHERE email = 'maria.gonzalez@email.com';
    
    INSERT INTO portfolio_images (
        user_id, title, description, image_url, image_filename, image_size_bytes,
        image_width, image_height, image_format, category_id, work_type,
        is_featured, is_profile_featured, project_date, project_duration_hours,
        project_value, project_location, tags, views_count, likes_count
    ) VALUES
    (maria_id, 'Instalación de Sistema de Calefacción Central', 
     'Instalación completa de sistema de calefacción central en vivienda familiar de 120m². Incluye radiadores, calderas y distribución de cañerías.', 
     '/images/portfolio/plomeria/calefaccion-central.jpg', 'calefaccion-central.jpg', 2457600,
     1920, 1080, 'jpg', 1, 'final_result', true, true, '2024-01-15', 72.5, 850000, 'Comodoro Rivadavia',
     'calefacción,radiadores,calderas,instalación', 156, 23),
     
    (maria_id, 'Reparación de Cañerías Principales', 
     'Reparación y reemplazo de cañería principal dañada por rotura. Trabajo de emergencia completado en tiempo récord con garantía extendida.', 
     '/images/portfolio/plomeria/reparacion-canerias.jpg', 'reparacion-canerias.jpg', 1843200,
     1600, 900, 'jpg', 1, 'before_after', false, false, '2024-01-10', 16.0, 125000, 'Comodoro Rivadavia',
     'reparación,cañerías,emergencia,garantía', 89, 12),
     
    (maria_id, 'Instalación de Baño Completo', 
     'Instalación completa de baño con sanitarios de primera marca, grifería moderna y revestimientos cerámicos.', 
     '/images/portfolio/plomeria/bano-completo.jpg', 'bano-completo.jpg', 3214400,
     2048, 1536, 'jpg', 1, 'final_result', true, false, '2023-12-20', 96.0, 420000, 'Comodoro Rivadavia',
     'baño,sanitarios,grifería,cerámicos', 234, 31),
     
    (maria_id, 'Sistema de Agua Caliente Solar', 
     'Instalación de sistema de calentamiento de agua solar sustentable. Ahorro energético del 70% garantizado.', 
     '/images/portfolio/plomeria/agua-solar.jpg', 'agua-solar.jpg', 1987600,
     1800, 1200, 'jpg', 1, 'process', true, false, '2023-11-28', 48.0, 380000, 'Comodoro Rivadavia',
     'solar,sustentable,ahorro,energía', 167, 28);
END $$;

-- Carlos Rodríguez (Electricidad) - Portfolio images
DO $$
DECLARE
    carlos_id INT;
BEGIN
    SELECT id INTO carlos_id FROM users WHERE email = 'carlos.rodriguez@email.com';
    
    INSERT INTO portfolio_images (
        user_id, title, description, image_url, image_filename, image_size_bytes,
        image_width, image_height, image_format, category_id, work_type,
        is_featured, is_profile_featured, project_date, project_duration_hours,
        project_value, project_location, tags, views_count, likes_count
    ) VALUES
    (carlos_id, 'Instalación Eléctrica Casa Nueva', 
     'Instalación eléctrica completa para vivienda de 180m². Incluye tablero principal, circuitos independientes y puesta a tierra.', 
     '/images/portfolio/electricidad/instalacion-completa.jpg', 'instalacion-completa.jpg', 2756800,
     1920, 1280, 'jpg', 2, 'final_result', true, true, '2024-01-08', 120.0, 650000, 'Puerto Madryn',
     'instalación,tablero,circuitos,tierra', 198, 35),
     
    (carlos_id, 'Sistema de Seguridad con Cámaras', 
     'Instalación de sistema de seguridad integral con cámaras IP, sensores de movimiento y control remoto.', 
     '/images/portfolio/electricidad/seguridad-camaras.jpg', 'seguridad-camaras.jpg', 2134400,
     1800, 1350, 'jpg', 2, 'final_result', true, false, '2023-12-15', 24.0, 320000, 'Puerto Madryn',
     'seguridad,cámaras,sensores,control', 145, 22),
     
    (carlos_id, 'Reparación de Cortocircuito Urgente', 
     'Reparación de emergencia por cortocircuito en cocina. Identificación y solución del problema en 2 horas.', 
     '/images/portfolio/electricidad/cortocircuito.jpg', 'cortocircuito.jpg', 1567200,
     1600, 1067, 'jpg', 2, 'process', false, false, '2024-01-05', 3.0, 45000, 'Puerto Madryn',
     'emergencia,cortocircuito,reparación,cocina', 76, 8);
END $$;

-- Ana López (Construcción) - Portfolio images
DO $$
DECLARE
    ana_id INT;
BEGIN
    SELECT id INTO ana_id FROM users WHERE email = 'ana.lopez@email.com';
    
    INSERT INTO portfolio_images (
        user_id, title, description, image_url, image_filename, image_size_bytes,
        image_width, image_height, image_format, category_id, work_type,
        is_featured, is_profile_featured, project_date, project_duration_hours,
        project_value, project_location, tags, views_count, likes_count
    ) VALUES
    (ana_id, 'Ampliación de Vivienda Familiar', 
     'Ampliación de 40m² para vivienda familiar. Incluye dormitorio, baño y estar integrado con la estructura existente.', 
     '/images/portfolio/construccion/ampliacion-vivienda.jpg', 'ampliacion-vivienda.jpg', 3456000,
     2048, 1536, 'jpg', 3, 'final_result', true, true, '2023-11-30', 480.0, 1200000, 'Trelew',
     'ampliación,dormitorio,baño,estar', 289, 42),
     
    (ana_id, 'Remodelación de Cocina Integral', 
     'Remodelación completa de cocina con muebles a medida, mesada de granito y electrodomésticos empotrados.', 
     '/images/portfolio/construccion/cocina-integral.jpg', 'cocina-integral.jpg', 2987600,
     1920, 1440, 'jpg', 3, 'before_after', true, false, '2023-10-20', 168.0, 780000, 'Trelew',
     'remodelación,cocina,muebles,granito', 198, 29);
END $$;

-- Roberto Martínez (Jardinería) - Portfolio images
DO $$
DECLARE
    roberto_id INT;
BEGIN
    SELECT id INTO roberto_id FROM users WHERE email = 'roberto.martinez@email.com';
    
    INSERT INTO portfolio_images (
        user_id, title, description, image_url, image_filename, image_size_bytes,
        image_width, image_height, image_format, category_id, work_type,
        is_featured, is_profile_featured, project_date, project_duration_hours,
        project_value, project_location, tags, views_count, likes_count
    ) VALUES
    (roberto_id, 'Diseño de Jardín Patagónico', 
     'Diseño y ejecución de jardín patagónico con plantas nativas. Incluye sistema de riego automatizado y senderos de piedra.', 
     '/images/portfolio/jardineria/jardin-patagonico.jpg', 'jardin-patagonico.jpg', 3234500,
     2048, 1365, 'jpg', 4, 'final_result', true, true, '2023-12-10', 96.0, 450000, 'Rawson',
     'diseño,patagónico,nativas,riego', 234, 38),
     
    (roberto_id, 'Mantenimiento de Parque Empresarial', 
     'Mantenimiento mensual de espacios verdes de complejo empresarial. Incluye poda, fertilización y control de plagas.', 
     '/images/portfolio/jardineria/parque-empresarial.jpg', 'parque-empresarial.jpg', 2765400,
     1920, 1280, 'jpg', 4, 'process', false, false, '2024-01-12', 24.0, 85000, 'Rawson',
     'mantenimiento,empresarial,poda,fertilización', 156, 18);
END $$;

-- ============================================================================
-- 6. EXPLORER FAVORITES
-- ============================================================================

-- Create realistic favorite patterns for explorers
DO $$
DECLARE
    sofia_id INT;
    juan_id INT;
    elena_id INT;
    maria_id INT;
    carlos_id INT;
    ana_id INT;
    roberto_id INT;
    laura_id INT;
BEGIN
    -- Get explorer IDs
    SELECT id INTO sofia_id FROM users WHERE email = 'sofia.castro@email.com';
    SELECT id INTO juan_id FROM users WHERE email = 'juan.mendoza@email.com';
    SELECT id INTO elena_id FROM users WHERE email = 'elena.vargas@email.com';
    
    -- Get professional IDs
    SELECT id INTO maria_id FROM users WHERE email = 'maria.gonzalez@email.com';
    SELECT id INTO carlos_id FROM users WHERE email = 'carlos.rodriguez@email.com';
    SELECT id INTO ana_id FROM users WHERE email = 'ana.lopez@email.com';
    SELECT id INTO roberto_id FROM users WHERE email = 'roberto.martinez@email.com';
    SELECT id INTO laura_id FROM users WHERE email = 'laura.fernandez@email.com';
    
    -- Sofía's favorites (home maintenance focused)
    INSERT INTO explorer_favorites (explorer_id, favorited_user_id, favorite_type, wishlist_category, notes, priority) VALUES
    (sofia_id, maria_id, 'professional', 'urgent', 'Necesito arreglar la calefacción antes del invierno', 5),
    (sofia_id, carlos_id, 'professional', 'future', 'Para instalar aire acondicionado en verano', 3),
    (sofia_id, laura_id, 'professional', 'comparison', 'Comparando servicios de limpieza mensual', 4);
    
    -- Juan's favorites (business/commercial focused)
    INSERT INTO explorer_favorites (explorer_id, favorited_user_id, favorite_type, wishlist_category, notes, priority) VALUES
    (juan_id, carlos_id, 'professional', 'urgent', 'Instalación eléctrica para nuevo local', 5),
    (juan_id, ana_id, 'professional', 'future', 'Remodelación de oficinas el próximo año', 2),
    (juan_id, laura_id, 'professional', 'urgent', 'Limpieza diaria para oficinas', 4);
    
    -- Elena's favorites (family home focused)
    INSERT INTO explorer_favorites (explorer_id, favorited_user_id, favorite_type, wishlist_category, notes, priority) VALUES
    (elena_id, roberto_id, 'professional', 'inspiration', 'Me encanta su trabajo en jardines patagónicos', 3),
    (elena_id, laura_id, 'professional', 'urgent', 'Limpieza semanal para casa con niños', 5),
    (elena_id, maria_id, 'professional', 'backup', 'Opción alternativa para plomería', 2);
END $$;

-- ============================================================================
-- 7. FEATURED PROFESSIONALS
-- ============================================================================

-- Create featured professional placements
DO $$
DECLARE
    maria_id INT;
    carlos_id INT;
    ana_id INT;
BEGIN
    SELECT id INTO maria_id FROM users WHERE email = 'maria.gonzalez@email.com';
    SELECT id INTO carlos_id FROM users WHERE email = 'carlos.rodriguez@email.com';
    SELECT id INTO ana_id FROM users WHERE email = 'ana.lopez@email.com';
    
    INSERT INTO featured_professionals (
        user_id, featured_type, featured_position, target_location, target_category_id,
        start_date, end_date, is_active, impressions_count, clicks_count, conversion_count
    ) VALUES
    (maria_id, 'homepage', 1, 'Comodoro Rivadavia', 1, '2024-01-01', '2024-03-01', true, 2340, 156, 12),
    (carlos_id, 'category', 1, 'Puerto Madryn', 2, '2024-01-15', '2024-02-15', true, 1890, 134, 8),
    (ana_id, 'premium', 1, 'Trelew', 3, '2024-01-01', NULL, true, 3456, 234, 18);
END $$;

-- ============================================================================
-- 8. PORTFOLIO ANALYTICS
-- ============================================================================

-- Create realistic view patterns for portfolio images
DO $$
DECLARE
    img_record RECORD;
BEGIN
    FOR img_record IN SELECT id FROM portfolio_images LOOP
        -- Insert random views for each image
        INSERT INTO portfolio_image_views (
            portfolio_image_id, viewer_id, view_source, view_duration_seconds, is_bounce
        )
        SELECT 
            img_record.id,
            CASE WHEN RANDOM() < 0.7 THEN (SELECT id FROM users WHERE user_type = 'customer' ORDER BY RANDOM() LIMIT 1) ELSE NULL END,
            (ARRAY['marketplace', 'profile', 'search', 'direct'])[floor(random() * 4 + 1)],
            floor(random() * 300 + 30)::INT,
            RANDOM() < 0.2
        FROM generate_series(1, floor(random() * 50 + 10)::INT);
    END LOOP;
END $$;

-- Create likes for portfolio images
DO $$
DECLARE
    img_record RECORD;
    user_record RECORD;
BEGIN
    FOR img_record IN SELECT id FROM portfolio_images LOOP
        -- Each image gets 0-15 likes from random users
        FOR user_record IN 
            SELECT id FROM users WHERE user_type = 'customer' 
            ORDER BY RANDOM() 
            LIMIT floor(random() * 15)::INT
        LOOP
            INSERT INTO portfolio_image_likes (portfolio_image_id, user_id, reaction_type)
            VALUES (
                img_record.id, 
                user_record.id, 
                (ARRAY['like', 'love', 'wow', 'helpful'])[floor(random() * 4 + 1)]
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- ============================================================================
-- 9. DEFAULT PORTFOLIO CATEGORIES (if not already inserted)
-- ============================================================================

INSERT INTO portfolio_categories (name, description, icon, sort_order) VALUES
('Trabajos Completados', 'Proyectos finalizados y entregados', '✅', 1),
('Antes y Después', 'Comparaciones del estado inicial vs final', '🔄', 2),
('Proceso de Trabajo', 'Imágenes del proceso durante la ejecución', '⚙️', 3),
('Herramientas y Equipos', 'Herramientas profesionales utilizadas', '🔧', 4),
('Materiales Utilizados', 'Materiales y productos empleados', '🧱', 5),
('Certificados y Credenciales', 'Certificaciones y acreditaciones', '🏆', 6),
('Testimonios Visuales', 'Fotos con clientes satisfechos', '💬', 7),
('Proyectos Destacados', 'Trabajos más importantes y complejos', '⭐', 8)
ON CONFLICT (name) DO NOTHING;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify test data creation
SELECT 'Professionals created:' as info, COUNT(*) as count FROM users WHERE user_type = 'provider';
SELECT 'Explorers created:' as info, COUNT(*) as count FROM users WHERE user_type = 'customer';
SELECT 'Portfolio images created:' as info, COUNT(*) as count FROM portfolio_images;
SELECT 'Favorites created:' as info, COUNT(*) as count FROM explorer_favorites;
SELECT 'Featured professionals:' as info, COUNT(*) as count FROM featured_professionals;
SELECT 'Portfolio views generated:' as info, COUNT(*) as count FROM portfolio_image_views;
SELECT 'Portfolio likes generated:' as info, COUNT(*) as count FROM portfolio_image_likes;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT '🎉 MARKETPLACE TEST DATA CREATED SUCCESSFULLY! 🎉' as status;
SELECT 'Ready to showcase the Airbnb-style marketplace with realistic data!' as message;