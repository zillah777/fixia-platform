-- ============================================================================
-- COMPREHENSIVE FIXIA MARKETPLACE TEST DATA - PART 2
-- ============================================================================
-- Portfolio Images, Favorites, Analytics, and Featured Professionals
-- Author: Senior Database Architect - Fixia Collaboration Team
-- Date: August 2, 2025
-- ============================================================================

BEGIN;

-- ============================================================================
-- 5. PORTFOLIO IMAGES - SHOWCASE QUALITY WORK
-- ============================================================================

-- Get user and category IDs for portfolio creation
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
  
  sofia_id INT;
  martin_id INT;
  laura_id INT;
  miguel_id INT;
  carolina_id INT;
  
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
  -- Get professional user IDs
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
  
  -- Get explorer user IDs
  SELECT id INTO sofia_id FROM users WHERE email = 'sofia.garcia@email.com';
  SELECT id INTO martin_id FROM users WHERE email = 'martin.perez@email.com';
  SELECT id INTO laura_id FROM users WHERE email = 'laura.rodriguez@email.com';
  SELECT id INTO miguel_id FROM users WHERE email = 'miguel.vargas@email.com';
  SELECT id INTO carolina_id FROM users WHERE email = 'carolina.mendez@email.com';
  
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
  -- CARLOS MENDOZA - MASTER PLUMBER PORTFOLIO
  -- ========================================================================
  
  -- Featured profile image
  INSERT INTO portfolio_images (
    user_id, title, description, image_url, image_filename, 
    image_size_bytes, image_width, image_height, image_format,
    category_id, work_type, is_featured, is_profile_featured, 
    project_date, project_duration_hours, project_value, project_location,
    views_count, likes_count, alt_text, tags,
    created_at
  ) VALUES (
    carlos_id, 'Instalación Completa de Baño Moderno', 
    'Instalación completa de plomería para baño principal con grifería de alta gama, sanitarios modernos y sistema de calefacción por suelo radiante. Trabajo realizado en tiempo récord con garantía extendida.',
    '/uploads/portfolio/carlos_bathroom_modern.jpg', 'carlos_bathroom_modern.jpg',
    2450000, 1920, 1080, 'jpg',
    plomeria_cat_id, 'final_result', true, true,
    CURRENT_DATE - INTERVAL '3 months', 16.5, 85000.00, 'Puerto Madryn Centro',
    247, 31, 'Baño moderno con instalación de plomería completa', 'plomería,baño,moderno,instalación,grifería,sanitarios',
    CURRENT_TIMESTAMP - INTERVAL '3 months'
  );
  
  -- Additional portfolio pieces for Carlos
  INSERT INTO portfolio_images (
    user_id, title, description, image_url, image_filename, 
    image_size_bytes, image_width, image_height, image_format,
    category_id, work_type, is_featured, 
    project_date, project_duration_hours, project_value, project_location,
    views_count, likes_count, alt_text, tags,
    created_at
  ) VALUES 
  (
    carlos_id, 'Reparación de Cañería Principal - Antes/Después', 
    'Reparación urgente de rotura en cañería principal. Solución rápida y efectiva evitando inundaciones mayores. Trabajo de emergencia 24hs.',
    '/uploads/portfolio/carlos_pipe_repair_before_after.jpg', 'carlos_pipe_repair_before_after.jpg',
    1890000, 1600, 900, 'jpg',
    plomeria_cat_id, 'before_after', false,
    CURRENT_DATE - INTERVAL '2 months', 8.0, 35000.00, 'Puerto Madryn',
    156, 18, 'Reparación urgente de cañería principal', 'plomería,reparación,emergencia,cañería,urgente',
    CURRENT_TIMESTAMP - INTERVAL '2 months'
  ),
  (
    carlos_id, 'Sistema de Calefacción Central por Agua', 
    'Instalación completa de sistema de calefacción central por agua caliente para casa de 150m². Incluye caldera, radiadores y termostatos inteligentes.',
    '/uploads/portfolio/carlos_heating_system.jpg', 'carlos_heating_system.jpg',
    2680000, 1920, 1280, 'jpg',
    plomeria_cat_id, 'final_result', true,
    CURRENT_DATE - INTERVAL '6 months', 32.0, 180000.00, 'Puerto Madryn Residencial',
    198, 25, 'Sistema de calefacción central instalado', 'calefacción,sistema,agua,radiadores,instalación',
    CURRENT_TIMESTAMP - INTERVAL '6 months'
  ),
  (
    carlos_id, 'Destape de Cloacas - Herramientas Profesionales', 
    'Equipamiento profesional especializado para destapes complejos. Cámara de inspección y herramientas de última generación.',
    '/uploads/portfolio/carlos_tools_equipment.jpg', 'carlos_tools_equipment.jpg',
    1560000, 1400, 1050, 'jpg',
    plomeria_cat_id, 'tools', false,
    CURRENT_DATE - INTERVAL '1 month', 0.5, 0.00, 'Puerto Madryn',
    89, 12, 'Herramientas profesionales para plomería', 'herramientas,equipamiento,destape,cloacas,profesional',
    CURRENT_TIMESTAMP - INTERVAL '1 month'
  );

  -- ========================================================================
  -- MARÍA GONZÁLEZ - EXPERT ELECTRICIAN PORTFOLIO
  -- ========================================================================
  
  -- Featured profile image
  INSERT INTO portfolio_images (
    user_id, title, description, image_url, image_filename, 
    image_size_bytes, image_width, image_height, image_format,
    category_id, work_type, is_featured, is_profile_featured, 
    project_date, project_duration_hours, project_value, project_location,
    views_count, likes_count, alt_text, tags,
    created_at
  ) VALUES (
    maria_id, 'Instalación Eléctrica Domótica Completa', 
    'Sistema domótico completo con control de iluminación, climatización y seguridad. App móvil personalizada y programación de escenas automáticas.',
    '/uploads/portfolio/maria_smart_home.jpg', 'maria_smart_home.jpg',
    2890000, 1920, 1080, 'jpg',
    electricidad_cat_id, 'final_result', true, true,
    CURRENT_DATE - INTERVAL '2 months', 28.0, 120000.00, 'Trelew Premium',
    312, 47, 'Sistema domótico completo instalado', 'domótica,smart home,automatización,control,app móvil',
    CURRENT_TIMESTAMP - INTERVAL '2 months'
  );
  
  -- Additional portfolio for María
  INSERT INTO portfolio_images (
    user_id, title, description, image_url, image_filename, 
    image_size_bytes, image_width, image_height, image_format,
    category_id, work_type, is_featured, 
    project_date, project_duration_hours, project_value, project_location,
    views_count, likes_count, alt_text, tags,
    created_at
  ) VALUES 
  (
    maria_id, 'Tablero Eléctrico Industrial - Upgrade Completo', 
    'Modernización completa de tablero eléctrico para PyME local. Nuevas protecciones, medición digital y sistema de respaldo automático.',
    '/uploads/portfolio/maria_industrial_panel.jpg', 'maria_industrial_panel.jpg',
    2340000, 1600, 1200, 'jpg',
    electricidad_cat_id, 'final_result', true,
    CURRENT_DATE - INTERVAL '4 months', 18.5, 95000.00, 'Trelew Industrial',
    203, 28, 'Tablero eléctrico industrial modernizado', 'tablero,industrial,modernización,protecciones,respaldo',
    CURRENT_TIMESTAMP - INTERVAL '4 months'
  ),
  (
    maria_id, 'Iluminación LED Exterior - Diseño Arquitectónico', 
    'Proyecto de iluminación LED exterior con diseño arquitectónico. Resalta las características de la fachada con consumo mínimo.',
    '/uploads/portfolio/maria_led_exterior.jpg', 'maria_led_exterior.jpg',
    2120000, 1920, 1280, 'jpg',
    electricidad_cat_id, 'final_result', false,
    CURRENT_DATE - INTERVAL '1 month', 12.0, 55000.00, 'Trelew Centro',
    145, 22, 'Iluminación LED arquitectónica exterior', 'LED,exterior,arquitectónica,fachada,bajo consumo',
    CURRENT_TIMESTAMP - INTERVAL '1 month'
  );

  -- ========================================================================
  -- DIEGO FERNÁNDEZ - MASTER CARPENTER PORTFOLIO
  -- ========================================================================
  
  INSERT INTO portfolio_images (
    user_id, title, description, image_url, image_filename, 
    image_size_bytes, image_width, image_height, image_format,
    category_id, work_type, is_featured, is_profile_featured, 
    project_date, project_duration_hours, project_value, project_location,
    views_count, likes_count, alt_text, tags,
    created_at
  ) VALUES (
    diego_id, 'Cocina Integral en Madera Nativa', 
    'Cocina completa realizada en lenga patagónica con terminaciones de lujo. Diseño funcional que maximiza el espacio disponible.',
    '/uploads/portfolio/diego_kitchen_native_wood.jpg', 'diego_kitchen_native_wood.jpg',
    3120000, 1920, 1080, 'jpg',
    carpinteria_cat_id, 'final_result', true, true,
    CURRENT_DATE - INTERVAL '1 month', 45.0, 220000.00, 'Rawson Premium',
    398, 52, 'Cocina integral en madera nativa patagónica', 'cocina,madera nativa,lenga,patagónica,integral,lujo',
    CURRENT_TIMESTAMP - INTERVAL '1 month'
  );

  -- Additional carpenter portfolio
  INSERT INTO portfolio_images (
    user_id, title, description, image_url, image_filename, 
    image_size_bytes, image_width, image_height, image_format,
    category_id, work_type, is_featured, 
    project_date, project_duration_hours, project_value, project_location,
    views_count, likes_count, alt_text, tags,
    created_at
  ) VALUES 
  (
    diego_id, 'Deck de Madera Dura - Resistente al Clima', 
    'Deck de madera dura tratada especialmente para el clima patagónico. Sistema de drenaje y protección UV incorporados.',
    '/uploads/portfolio/diego_deck_hardwood.jpg', 'diego_deck_hardwood.jpg',
    2650000, 1600, 1200, 'jpg',
    carpinteria_cat_id, 'final_result', true,
    CURRENT_DATE - INTERVAL '3 months', 24.0, 85000.00, 'Rawson Costa',
    234, 31, 'Deck de madera dura resistente al clima', 'deck,madera dura,clima patagónico,drenaje,UV',
    CURRENT_TIMESTAMP - INTERVAL '3 months'
  ),
  (
    diego_id, 'Muebles a Medida - Dormitorio Principal', 
    'Placard completo, cómoda y mesa de luz diseñados a medida. Aprovechamiento máximo del espacio con estilo contemporáneo.',
    '/uploads/portfolio/diego_bedroom_furniture.jpg', 'diego_bedroom_furniture.jpg',
    2890000, 1920, 1280, 'jpg',
    carpinteria_cat_id, 'final_result', false,
    CURRENT_DATE - INTERVAL '2 months', 35.0, 140000.00, 'Rawson',
    187, 24, 'Muebles a medida para dormitorio', 'muebles,medida,placard,dormitorio,contemporáneo',
    CURRENT_TIMESTAMP - INTERVAL '2 months'
  );

  -- ========================================================================
  -- ANA LÓPEZ - GARDEN DESIGNER PORTFOLIO
  -- ========================================================================
  
  INSERT INTO portfolio_images (
    user_id, title, description, image_url, image_filename, 
    image_size_bytes, image_width, image_height, image_format,
    category_id, work_type, is_featured, is_profile_featured, 
    project_date, project_duration_hours, project_value, project_location,
    views_count, likes_count, alt_text, tags,
    created_at
  ) VALUES (
    ana_id, 'Jardín Patagónico con Especies Nativas', 
    'Diseño de jardín sustentable con flora nativa patagónica. Sistema de riego por goteo y compostaje integrado.',
    '/uploads/portfolio/ana_patagonian_garden.jpg', 'ana_patagonian_garden.jpg',
    3560000, 1920, 1080, 'jpg',
    jardineria_cat_id, 'final_result', true, true,
    CURRENT_DATE - INTERVAL '2 months', 52.0, 160000.00, 'Esquel Residencial',
    445, 68, 'Jardín patagónico con especies nativas', 'jardín,patagónico,especies nativas,sustentable,riego',
    CURRENT_TIMESTAMP - INTERVAL '2 months'
  );

  -- Additional garden portfolio
  INSERT INTO portfolio_images (
    user_id, title, description, image_url, image_filename, 
    image_size_bytes, image_width, image_height, image_format,
    category_id, work_type, is_featured, 
    project_date, project_duration_hours, project_value, project_location,
    views_count, likes_count, alt_text, tags,
    created_at
  ) VALUES 
  (
    ana_id, 'Huerta Orgánica Familiar - Antes/Después', 
    'Transformación completa de patio trasero en huerta orgánica productiva. Incluye invernadero compacto y sistema de compostaje.',
    '/uploads/portfolio/ana_organic_garden_transformation.jpg', 'ana_organic_garden_transformation.jpg',
    2890000, 1800, 1200, 'jpg',
    jardineria_cat_id, 'before_after', true,
    CURRENT_DATE - INTERVAL '1 month', 28.0, 45000.00, 'Esquel',
    312, 41, 'Transformación en huerta orgánica familiar', 'huerta,orgánica,transformación,invernadero,compostaje',
    CURRENT_TIMESTAMP - INTERVAL '1 month'
  ),
  (
    ana_id, 'Sistema de Riego Inteligente por Zonas', 
    'Instalación de sistema de riego automatizado con sensores de humedad y programación por zonas según tipo de plantas.',
    '/uploads/portfolio/ana_smart_irrigation.jpg', 'ana_smart_irrigation.jpg',
    1980000, 1600, 900, 'jpg',
    jardineria_cat_id, 'process', false,
    CURRENT_DATE - INTERVAL '3 weeks', 8.0, 28000.00, 'Esquel',
    156, 19, 'Sistema de riego inteligente por zonas', 'riego,inteligente,sensores,automatizado,zonas',
    CURRENT_TIMESTAMP - INTERVAL '3 weeks'
  );

  -- ========================================================================
  -- CONTINUE WITH OTHER PROFESSIONALS...
  -- (Adding key portfolio pieces for demonstration)
  -- ========================================================================

  -- Lucía Martín - Artistic Painter
  INSERT INTO portfolio_images (
    user_id, title, description, image_url, image_filename, 
    image_size_bytes, image_width, image_height, image_format,
    category_id, work_type, is_featured, is_profile_featured, 
    project_date, project_duration_hours, project_value, project_location,
    views_count, likes_count, alt_text, tags,
    created_at
  ) VALUES (
    lucia_id, 'Mural Artístico Patagónico - Pared Principal', 
    'Mural personalizado inspirado en paisajes patagónicos. Técnica mixta con pinturas ecológicas de larga duración.',
    '/uploads/portfolio/lucia_patagonian_mural.jpg', 'lucia_patagonian_mural.jpg',
    4120000, 1920, 1440, 'jpg',
    pintura_cat_id, 'final_result', true, true,
    CURRENT_DATE - INTERVAL '1 month', 18.0, 75000.00, 'Gaiman Centro',
    523, 89, 'Mural artístico patagónico personalizado', 'mural,artístico,patagónico,personalizado,ecológico',
    CURRENT_TIMESTAMP - INTERVAL '1 month'
  );

  -- Sebastián Ruiz - Interior Designer
  INSERT INTO portfolio_images (
    user_id, title, description, image_url, image_filename, 
    image_size_bytes, image_width, image_height, image_format,
    category_id, work_type, is_featured, is_profile_featured, 
    project_date, project_duration_hours, project_value, project_location,
    views_count, likes_counts, alt_text, tags,
    created_at
  ) VALUES (
    sebastian_id, 'Rediseño Completo de Living Moderno', 
    'Transformación total de living familiar con concepto minimalista. Integración de espacios y optimización de luz natural.',
    '/uploads/portfolio/sebastian_modern_living.jpg', 'sebastian_modern_living.jpg',
    3890000, 1920, 1080, 'jpg',
    diseno_cat_id, 'final_result', true, true,
    CURRENT_DATE - INTERVAL '2 months', 35.0, 185000.00, 'Rada Tilly',
    467, 73, 'Rediseño completo de living moderno', 'diseño interior,living,moderno,minimalista,luz natural',
    CURRENT_TIMESTAMP - INTERVAL '2 months'
  );

  -- Natalia Vega - Tech Repair Expert
  INSERT INTO portfolio_images (
    user_id, title, description, image_url, image_filename, 
    image_size_bytes, image_width, image_height, image_format,
    category_id, work_type, is_featured, is_profile_featured, 
    project_date, project_duration_hours, project_value, project_location,
    views_count, likes_count, alt_text, tags,
    created_at
  ) VALUES (
    natalia_id, 'Reparación Completa Laptop Gaming', 
    'Recuperación total de laptop gaming con daño por líquidos. Limpieza profunda, cambio de componentes y optimización.',
    '/uploads/portfolio/natalia_gaming_laptop_repair.jpg', 'natalia_gaming_laptop_repair.jpg',
    2340000, 1600, 1200, 'jpg',
    reparacion_cat_id, 'before_after', true, true,
    CURRENT_DATE - INTERVAL '2 weeks', 6.5, 25000.00, 'Puerto Pirámides',
    234, 32, 'Reparación completa de laptop gaming', 'reparación,laptop,gaming,recuperación,componentes',
    CURRENT_TIMESTAMP - INTERVAL '2 weeks'
  );

  -- ========================================================================
  -- 6. EXPLORER FAVORITES - REALISTIC WISHLIST SCENARIOS
  -- ========================================================================
  
  -- Sofía García favorites (family home owner)
  INSERT INTO explorer_favorites (
    explorer_id, favorited_user_id, favorite_type, wishlist_category, 
    notes, priority, created_at
  ) VALUES 
  (sofia_id, carlos_id, 'professional', 'urgent', 
   'Necesitamos urgente un plomero para el baño principal. Muy buenas referencias.', 5,
   CURRENT_TIMESTAMP - INTERVAL '2 weeks'),
  (sofia_id, ana_id, 'professional', 'future', 
   'Para el proyecto de jardín que queremos hacer en primavera. Me encanta su trabajo con plantas nativas.', 3,
   CURRENT_TIMESTAMP - INTERVAL '1 month'),
  (sofia_id, diego_id, 'professional', 'inspiration', 
   'Increíble trabajo en cocinas. Para cuando renovemos la cocina el año que viene.', 4,
   CURRENT_TIMESTAMP - INTERVAL '3 weeks');

  -- Martín Pérez favorites (young professional)
  INSERT INTO explorer_favorites (
    explorer_id, favorited_user_id, favorite_type, wishlist_category, 
    notes, priority, created_at
  ) VALUES 
  (martin_id, maria_id, 'professional', 'urgent', 
   'Necesito instalar sistema domótico en mi depto nuevo. Es exactamente lo que busco.', 5,
   CURRENT_TIMESTAMP - INTERVAL '1 week'),
  (martin_id, sebastian_id, 'professional', 'future', 
   'Su estilo de diseño interior es perfecto para espacios pequeños como el mío.', 4,
   CURRENT_TIMESTAMP - INTERVAL '2 weeks'),
  (martin_id, natalia_id, 'professional', 'inspiration', 
   'Buenas referencias para reparación de equipos. Por si necesito en el futuro.', 2,
   CURRENT_TIMESTAMP - INTERVAL '1 month');

  -- Laura Rodríguez favorites (business owner)
  INSERT INTO explorer_favorites (
    explorer_id, favorited_user_id, favorite_type, wishlist_category, 
    notes, priority, created_at
  ) VALUES 
  (laura_id, maria_id, 'professional', 'urgent', 
   'Para modernizar la instalación eléctrica del local. Trabajo muy profesional.', 5,
   CURRENT_TIMESTAMP - INTERVAL '3 days'),
  (laura_id, carmen_id, 'professional', 'urgent', 
   'Necesito servicio de limpieza profunda para el local regularmente.', 4,
   CURRENT_TIMESTAMP - INTERVAL '1 week'),
  (laura_id, pablo_id, 'professional', 'future', 
   'Para trabajos de soldadura y herrería en la ampliación del local.', 3,
   CURRENT_TIMESTAMP - INTERVAL '2 weeks');

  -- ========================================================================
  -- 7. FEATURED PROFESSIONALS - STRATEGIC POSITIONING
  -- ========================================================================
  
  -- Featured professionals for homepage
  INSERT INTO featured_professionals (
    user_id, feature_type, target_location, target_category, 
    start_date, end_date, priority_score, 
    impressions_count, clicks_count, conversions_count,
    created_at
  ) VALUES 
  (carlos_id, 'homepage', 'Puerto Madryn', NULL, 
   CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '2 months', 95,
   2347, 189, 23, CURRENT_TIMESTAMP - INTERVAL '1 month'),
  (maria_id, 'homepage', 'Trelew', NULL, 
   CURRENT_DATE - INTERVAL '3 weeks', CURRENT_DATE + INTERVAL '1 month', 92,
   1892, 156, 19, CURRENT_TIMESTAMP - INTERVAL '3 weeks'),
  (ana_id, 'trending', 'Esquel', 'jardineria', 
   CURRENT_DATE - INTERVAL '2 weeks', CURRENT_DATE + INTERVAL '6 weeks', 88,
   1456, 134, 16, CURRENT_TIMESTAMP - INTERVAL '2 weeks');

  -- Category-specific featured professionals
  INSERT INTO featured_professionals (
    user_id, feature_type, target_location, target_category, 
    start_date, end_date, priority_score, 
    impressions_count, clicks_count, conversions_count,
    created_at
  ) VALUES 
  (diego_id, 'category', 'Rawson', 'carpinteria', 
   CURRENT_DATE - INTERVAL '1 week', CURRENT_DATE + INTERVAL '5 weeks', 90,
   945, 87, 11, CURRENT_TIMESTAMP - INTERVAL '1 week'),
  (sebastian_id, 'premium', 'Rada Tilly', 'diseno', 
   CURRENT_DATE, CURRENT_DATE + INTERVAL '8 weeks', 96,
   234, 28, 5, CURRENT_TIMESTAMP),
  (fernando_id, 'location', 'Rawson', 'carpinteria', 
   CURRENT_DATE - INTERVAL '2 weeks', CURRENT_DATE + INTERVAL '4 weeks', 93,
   1234, 98, 14, CURRENT_TIMESTAMP - INTERVAL '2 weeks');

  -- ========================================================================
  -- 8. PROFESSIONAL MARKETPLACE METRICS - PERFORMANCE DATA
  -- ========================================================================
  
  -- Update professional metrics based on portfolio and engagement
  INSERT INTO professional_marketplace_metrics (
    user_id, profile_views_count, portfolio_views_count, contact_clicks_count,
    inquiries_received_count, bookings_completed_count, avg_response_time_hours,
    portfolio_images_count, portfolio_likes_total, featured_status_active,
    ranking_score, trending_score, conversion_rate_percentage,
    last_activity_date, metrics_updated_at
  ) VALUES 
  (carlos_id, 1247, 891, 156, 89, 23, 2.5, 4, 81, true, 95.8, 87.4, 25.84, CURRENT_DATE, CURRENT_TIMESTAMP),
  (maria_id, 1456, 1134, 203, 127, 19, 1.8, 3, 97, true, 98.2, 91.6, 14.96, CURRENT_DATE, CURRENT_TIMESTAMP),
  (diego_id, 1345, 819, 134, 78, 14, 3.2, 3, 107, true, 92.6, 84.3, 17.95, CURRENT_DATE - INTERVAL '1 day', CURRENT_TIMESTAMP),
  (ana_id, 1678, 1203, 187, 112, 16, 2.1, 3, 128, true, 94.1, 89.7, 14.29, CURRENT_DATE, CURRENT_TIMESTAMP),
  (sebastian_id, 987, 745, 98, 64, 8, 4.1, 1, 73, true, 89.3, 78.2, 12.50, CURRENT_DATE - INTERVAL '2 days', CURRENT_TIMESTAMP),
  (lucia_id, 1234, 892, 145, 89, 12, 2.8, 1, 89, false, 87.4, 92.1, 13.48, CURRENT_DATE, CURRENT_TIMESTAMP),
  (natalia_id, 567, 398, 67, 45, 7, 1.5, 1, 32, false, 82.1, 74.6, 15.56, CURRENT_DATE - INTERVAL '1 day', CURRENT_TIMESTAMP);

  -- ========================================================================
  -- 9. ANALYTICS DATA - ENGAGEMENT TRACKING
  -- ========================================================================
  
  -- Portfolio image views for analytics
  INSERT INTO portfolio_image_views (
    image_id, viewer_user_id, view_source, view_duration_seconds, 
    viewer_ip, viewer_location, created_at
  ) 
  SELECT 
    pi.id,
    CASE 
      WHEN random() < 0.3 THEN sofia_id
      WHEN random() < 0.6 THEN martin_id  
      WHEN random() < 0.8 THEN laura_id
      ELSE NULL
    END,
    CASE 
      WHEN random() < 0.4 THEN 'marketplace_browse'
      WHEN random() < 0.7 THEN 'professional_profile'
      WHEN random() < 0.9 THEN 'search_results'
      ELSE 'featured_section'
    END,
    (random() * 120 + 10)::INT,
    '192.168.' || (random() * 255)::INT || '.' || (random() * 255)::INT,
    CASE 
      WHEN random() < 0.3 THEN 'Puerto Madryn'
      WHEN random() < 0.6 THEN 'Trelew'
      WHEN random() < 0.8 THEN 'Rawson'
      ELSE 'Comodoro Rivadavia'
    END,
    CURRENT_TIMESTAMP - (random() * INTERVAL '30 days')
  FROM portfolio_images pi
  CROSS JOIN generate_series(1, (pi.views_count / 10)::INT) -- Generate proportional views
  LIMIT 500; -- Limit for performance

  -- Portfolio image likes
  INSERT INTO portfolio_image_likes (
    image_id, user_id, reaction_type, created_at
  )
  SELECT 
    pi.id,
    CASE 
      WHEN random() < 0.25 THEN sofia_id
      WHEN random() < 0.5 THEN martin_id  
      WHEN random() < 0.75 THEN laura_id
      ELSE miguel_id
    END,
    CASE 
      WHEN random() < 0.7 THEN 'like'
      WHEN random() < 0.9 THEN 'love'
      WHEN random() < 0.95 THEN 'wow'
      ELSE 'helpful'
    END,
    CURRENT_TIMESTAMP - (random() * INTERVAL '60 days')
  FROM portfolio_images pi
  CROSS JOIN generate_series(1, LEAST(pi.likes_count, 20)) -- Generate likes based on count
  ON CONFLICT (image_id, user_id) DO NOTHING; -- Prevent duplicates

END $$;

COMMIT;

-- ============================================================================
-- 10. VERIFICATION AND SUMMARY
-- ============================================================================

-- Display summary of created test data
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'FIXIA MARKETPLACE TEST DATA SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Professionals created: %', (SELECT COUNT(*) FROM users WHERE user_type = 'as');
  RAISE NOTICE 'Explorers created: %', (SELECT COUNT(*) FROM users WHERE user_type = 'explorador');
  RAISE NOTICE 'Portfolio images: %', (SELECT COUNT(*) FROM portfolio_images);
  RAISE NOTICE 'Favorites created: %', (SELECT COUNT(*) FROM explorer_favorites);
  RAISE NOTICE 'Featured professionals: %', (SELECT COUNT(*) FROM featured_professionals);
  RAISE NOTICE 'Analytics views tracked: %', (SELECT COUNT(*) FROM portfolio_image_views);
  RAISE NOTICE 'Analytics likes tracked: %', (SELECT COUNT(*) FROM portfolio_image_likes);
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST DATA CREATION COMPLETED!';
  RAISE NOTICE 'The marketplace is now ready for demo with realistic, high-quality content.';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- END OF COMPREHENSIVE TEST DATA CREATION
-- ============================================================================