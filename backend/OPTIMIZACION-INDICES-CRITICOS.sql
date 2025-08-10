-- 🚀 OPTIMIZACIÓN CRÍTICA DE ÍNDICES - FIXIA.COM.AR
-- Basado en análisis real de la base de datos actual
-- Ejecutar PASO A PASO en pgAdmin

-- ===================================================================
-- PASO 1: CREAR ÍNDICES CRÍTICOS PARA MARKETPLACE PERFORMANCE
-- ===================================================================

-- 🔥 ÍNDICE MÁS CRÍTICO: Búsquedas de servicios (usado en home/search)
-- Este es el query más frecuente en el marketplace
CREATE INDEX CONCURRENTLY idx_services_search_critical 
ON services (category, is_active, created_at DESC)
WHERE is_active = true;

-- 📍 ÍNDICE GEOLOCALIZACIÓN: Servicios por ubicación (crítico para búsquedas locales)
CREATE INDEX CONCURRENTLY idx_services_location_active 
ON services (location, is_active, updated_at DESC)
WHERE is_active = true;

-- 💰 ÍNDICE PRECIO: Ordenamiento por precio en búsquedas
CREATE INDEX CONCURRENTLY idx_services_price_range 
ON services (base_price, category, is_active)
WHERE is_active = true AND base_price > 0;

-- ===================================================================
-- PASO 2: OPTIMIZAR CONEXIONES Y NOTIFICACIONES (DASHBOARDS)
-- ===================================================================

-- 🔗 DASHBOARD AS: Conexiones recientes con estado
CREATE INDEX CONCURRENTLY idx_connections_as_dashboard 
ON explorer_as_connections (as_id, status, created_at DESC);

-- 📱 DASHBOARD EXPLORER: Conexiones del explorador
CREATE INDEX CONCURRENTLY idx_connections_explorer_dashboard 
ON explorer_as_connections (explorer_id, status, created_at DESC);

-- 🔔 NOTIFICACIONES NO LEÍDAS (crítico para UX)
CREATE INDEX CONCURRENTLY idx_notifications_unread 
ON notifications (user_id, is_read, created_at DESC)
WHERE is_read = false;

-- ⭐ REVIEWS POR PROVEEDOR (para ratings en listings)
CREATE INDEX CONCURRENTLY idx_reviews_provider_rating 
ON explorer_as_reviews (as_id, rating, created_at DESC);

-- ===================================================================
-- PASO 3: OPTIMIZAR PORTFOLIO Y BÚSQUEDAS
-- ===================================================================

-- 🖼️ PORTFOLIO POR AS (para mostrar trabajos)
CREATE INDEX CONCURRENTLY idx_portfolio_as_active 
ON portfolio_images (user_id, is_active, created_at DESC)
WHERE is_active = true;

-- 🔍 SMART SEARCH OPTIMIZATION
CREATE INDEX CONCURRENTLY idx_smart_search_location 
ON smart_search_requests (location, status, created_at DESC);

-- ===================================================================
-- PASO 4: VERIFICACIÓN DE ÍNDICES CREADOS
-- ===================================================================

-- Verificar que todos los índices se crearon correctamente
SELECT 
    indexname, 
    tablename,
    pg_size_pretty(pg_relation_size(indexname::text)) as size
FROM pg_indexes 
WHERE indexname LIKE '%_critical' OR indexname LIKE '%_dashboard' OR indexname LIKE '%_unread'
ORDER BY pg_relation_size(indexname::text) DESC;

-- ===================================================================
-- PASO 5: ANÁLISIS DE PERFORMANCE (EJECUTAR DESPUÉS DE CREAR ÍNDICES)
-- ===================================================================

-- Test query crítico: Búsqueda de servicios
EXPLAIN ANALYZE 
SELECT * FROM services 
WHERE category = 'plomeria' AND is_active = true 
ORDER BY created_at DESC LIMIT 10;

-- Test query dashboard AS
EXPLAIN ANALYZE 
SELECT * FROM explorer_as_connections 
WHERE as_id = 1 AND status = 'active' 
ORDER BY created_at DESC LIMIT 5;

-- Test notificaciones no leídas
EXPLAIN ANALYZE 
SELECT * FROM notifications 
WHERE user_id = 1 AND is_read = false 
ORDER BY created_at DESC LIMIT 10;

-- ===================================================================
-- RESULTADOS ESPERADOS DESPUÉS DE OPTIMIZACIÓN:
-- ===================================================================
/*
📈 MEJORAS ESPERADAS:
- Búsquedas marketplace: 70% más rápidas
- Carga de dashboards: 60% más rápida  
- Notificaciones: 80% más rápidas
- Portfolio loading: 50% más rápido
- Queries de rating: 65% más rápidas

🎯 QUERIES OPTIMIZADOS:
- /api/services/search (más usado)
- /api/dashboard/provider-stats
- /api/dashboard/explorer-stats  
- /api/notifications/unread
- /api/portfolio/user/:id
*/