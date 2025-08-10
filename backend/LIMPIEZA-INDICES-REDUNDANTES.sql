-- 🧹 LIMPIEZA DE ÍNDICES REDUNDANTES - FIXIA.COM.AR
-- Análisis de índices duplicados y innecesarios
-- ⚠️ EJECUTAR CON CUIDADO - HACER BACKUP PRIMERO

-- ===================================================================
-- PASO 1: ANÁLISIS DE REDUNDANCIAS DETECTADAS
-- ===================================================================

-- 📊 Ver índices que pueden ser redundantes
SELECT 
    i.indexname,
    i.tablename,
    pg_size_pretty(pg_relation_size(i.indexname::text)) as size,
    CASE 
        WHEN i.indexname LIKE '%_pkey' THEN 'PRIMARY_KEY'
        WHEN i.indexname LIKE '%_key' THEN 'UNIQUE_CONSTRAINT' 
        WHEN i.indexname LIKE 'idx_%' THEN 'CUSTOM_INDEX'
        ELSE 'OTHER'
    END as index_type
FROM pg_indexes i
WHERE i.schemaname = 'public'
ORDER BY pg_relation_size(i.indexname::text) DESC;

-- ===================================================================
-- PASO 2: ÍNDICES POTENCIALMENTE REDUNDANTES
-- ===================================================================

-- 🔍 ANÁLISIS portfolio_categories:
-- Tiene 5 índices en una tabla pequeña - posible over-indexing
-- Revisar si todos son necesarios:

-- Ver estructura de portfolio_categories
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'portfolio_categories';

-- 🔍 ANÁLISIS email_verification_tokens:
-- 3 índices en tabla de tokens temporales - revisar necesidad
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'email_verification_tokens';

-- ===================================================================
-- PASO 3: RECOMENDACIONES DE LIMPIEZA (NO EJECUTAR AÚN)
-- ===================================================================

/*
⚠️ POSIBLES ÍNDICES A REVISAR (NO ELIMINAR SIN ANÁLISIS):

1. portfolio_categories - 5 índices para tabla pequeña:
   - Mantener: portfolio_categories_pkey (PRIMARY KEY)
   - Mantener: portfolio_categories_name_key (UNIQUE)
   - Revisar necesidad: idx_portfolio_categories_parent_id
   - Revisar necesidad: idx_portfolio_categories_active  
   - Revisar necesidad: idx_portfolio_categories_sort_order

2. email_verification_tokens - 3 índices para tabla temporal:
   - Mantener: email_verification_tokens_pkey (PRIMARY KEY)
   - Mantener: email_verification_tokens_token_key (UNIQUE)
   - Revisar: email_verification_tokens_user_id_type_key

3. Índices pequeños en tablas activas:
   - Muchos índices de 8KB sugieren poca data o uso limitado
   - Evaluar si todos son necesarios para las queries actuales
*/

-- ===================================================================
-- PASO 4: COMANDO PARA VER USAGE DE ÍNDICES (SOLO ANÁLISIS)
-- ===================================================================

-- 📊 Ver estadísticas de uso de índices (requiere activar pg_stat_statements)
-- SOLO para análisis - no eliminar índices sin datos de uso
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_tup_read DESC;

-- ===================================================================
-- PASO 5: ANÁLISIS DE TAMAÑO DE TABLAS VS ÍNDICES
-- ===================================================================

-- Ver relación entre tamaño de tabla e índices
SELECT 
    t.tablename,
    pg_size_pretty(pg_total_relation_size(t.tablename::text)) as table_size,
    COUNT(i.indexname) as index_count,
    STRING_AGG(i.indexname, ', ') as indexes
FROM pg_tables t
LEFT JOIN pg_indexes i ON t.tablename = i.tablename AND i.schemaname = 'public'
WHERE t.schemaname = 'public'
GROUP BY t.tablename
ORDER BY pg_total_relation_size(t.tablename::text) DESC;

-- ===================================================================
-- RECOMENDACIÓN FINAL:
-- ===================================================================
/*
🎯 ESTRATEGIA RECOMENDADA:
1. PRIMERO: Ejecutar OPTIMIZACION-INDICES-CRITICOS.sql
2. Monitorear performance por 1-2 semanas
3. Usar pg_stat_user_indexes para ver qué índices no se usan
4. LUEGO considerar eliminar índices redundantes con datos reales

⚠️ NO ELIMINAR ÍNDICES SIN:
- Backup completo de la DB
- Análisis de uso con pg_stat_user_indexes  
- Testing en entorno de desarrollo
- Ventana de mantenimiento planificada

📈 PRIORIDAD:
- ALTA: Crear índices críticos faltantes
- MEDIA: Optimizar índices existentes
- BAJA: Eliminar redundancias (solo con análisis detallado)
*/