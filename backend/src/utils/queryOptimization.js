const { query } = require('../config/database');
const logger = require('./logger');

/**
 * Query Optimization Utilities - Enterprise-grade database performance
 * 
 * Provides:
 * - Automatic query plan analysis
 * - Index usage optimization suggestions
 * - Query performance monitoring
 * - Caching strategy recommendations
 * - Connection pool optimization
 */

// Query performance monitoring
const queryMetrics = new Map();

/**
 * Execute query with performance monitoring
 * @param {string} sql - SQL query
 * @param {array} params - Query parameters
 * @param {object} options - Execution options
 * @returns {object} Query result with performance metrics
 */
const executeOptimizedQuery = async (sql, params = [], options = {}) => {
  const startTime = Date.now();
  const queryId = generateQueryId(sql);
  
  try {
    // Add query plan analysis for slow queries
    let queryPlan = null;
    if (options.analyzePerformance) {
      queryPlan = await analyzeQueryPlan(sql, params);
    }
    
    const result = await query(sql, params);
    const executionTime = Date.now() - startTime;
    
    // Track metrics
    trackQueryMetrics(queryId, executionTime, result.rowCount || 0);
    
    // Log slow queries
    if (executionTime > (options.slowQueryThreshold || 1000)) {
      logger.warn('Slow query detected', {
        category: 'performance',
        query_id: queryId,
        execution_time: executionTime,
        sql_preview: sql.substring(0, 100),
        params_count: params.length,
        row_count: result.rowCount || 0,
        query_plan: queryPlan
      });
    }
    
    return {
      ...result,
      performance: {
        execution_time: executionTime,
        query_id: queryId,
        query_plan: queryPlan
      }
    };
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    logger.error('Query execution failed', {
      category: 'database',
      query_id: queryId,
      execution_time: executionTime,
      error: error.message,
      sql_preview: sql.substring(0, 100),
      params_count: params.length
    });
    
    throw error;
  }
};

/**
 * Analyze query execution plan
 * @param {string} sql - SQL query
 * @param {array} params - Query parameters
 * @returns {object} Query plan analysis
 */
const analyzeQueryPlan = async (sql, params) => {
  try {
    const explainSql = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sql}`;
    const result = await query(explainSql, params);
    
    const plan = result.rows[0]['QUERY PLAN'][0];
    
    return {
      total_cost: plan['Total Cost'],
      execution_time: plan['Execution Time'],
      planning_time: plan['Planning Time'],
      uses_index: checkIndexUsage(plan),
      suggestions: generateOptimizationSuggestions(plan)
    };
  } catch (error) {
    logger.warn('Query plan analysis failed', {
      category: 'performance',
      error: error.message
    });
    return null;
  }
};

/**
 * Check if query uses indexes efficiently
 * @param {object} plan - Query execution plan
 * @returns {boolean} Whether indexes are used
 */
const checkIndexUsage = (plan) => {
  const planStr = JSON.stringify(plan);
  return !planStr.includes('Seq Scan') || planStr.includes('Index');
};

/**
 * Generate optimization suggestions based on query plan
 * @param {object} plan - Query execution plan
 * @returns {array} Optimization suggestions
 */
const generateOptimizationSuggestions = (plan) => {
  const suggestions = [];
  const planStr = JSON.stringify(plan);
  
  // Check for sequential scans
  if (planStr.includes('Seq Scan')) {
    suggestions.push({
      type: 'index',
      message: 'Consider adding indexes for sequential scans',
      impact: 'high'
    });
  }
  
  // Check for sorts
  if (planStr.includes('Sort')) {
    suggestions.push({
      type: 'index',
      message: 'Consider adding indexes for ORDER BY clauses',
      impact: 'medium'
    });
  }
  
  // Check for nested loops
  if (planStr.includes('Nested Loop')) {
    suggestions.push({
      type: 'join',
      message: 'Consider optimizing JOIN conditions or adding indexes',
      impact: 'high'
    });
  }
  
  // Check for hash joins on large datasets
  if (planStr.includes('Hash Join') && plan['Total Cost'] > 10000) {
    suggestions.push({
      type: 'join',
      message: 'Large hash join detected, consider query restructuring',
      impact: 'medium'
    });
  }
  
  return suggestions;
};

/**
 * Generate unique query ID for tracking
 * @param {string} sql - SQL query
 * @returns {string} Query ID
 */
const generateQueryId = (sql) => {
  // Remove parameters and normalize whitespace for consistent ID
  const normalized = sql
    .replace(/\$\d+/g, '?')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  
  // Create hash of normalized query
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `query_${Math.abs(hash)}`;
};

/**
 * Track query performance metrics
 * @param {string} queryId - Query identifier
 * @param {number} executionTime - Execution time in ms
 * @param {number} rowCount - Number of rows returned
 */
const trackQueryMetrics = (queryId, executionTime, rowCount) => {
  if (!queryMetrics.has(queryId)) {
    queryMetrics.set(queryId, {
      total_executions: 0,
      total_time: 0,
      avg_time: 0,
      min_time: Infinity,
      max_time: 0,
      total_rows: 0,
      avg_rows: 0,
      last_executed: null
    });
  }
  
  const metrics = queryMetrics.get(queryId);
  metrics.total_executions++;
  metrics.total_time += executionTime;
  metrics.avg_time = metrics.total_time / metrics.total_executions;
  metrics.min_time = Math.min(metrics.min_time, executionTime);
  metrics.max_time = Math.max(metrics.max_time, executionTime);
  metrics.total_rows += rowCount;
  metrics.avg_rows = metrics.total_rows / metrics.total_executions;
  metrics.last_executed = new Date();
  
  queryMetrics.set(queryId, metrics);
};

/**
 * Get query performance statistics
 * @param {number} limit - Number of queries to return
 * @returns {array} Query performance statistics
 */
const getQueryStats = (limit = 10) => {
  const stats = Array.from(queryMetrics.entries())
    .map(([queryId, metrics]) => ({
      query_id: queryId,
      ...metrics
    }))
    .sort((a, b) => b.avg_time - a.avg_time)
    .slice(0, limit);
  
  return stats;
};

/**
 * Get slow queries that need optimization
 * @param {number} threshold - Time threshold in ms
 * @returns {array} Slow queries
 */
const getSlowQueries = (threshold = 1000) => {
  return Array.from(queryMetrics.entries())
    .filter(([_, metrics]) => metrics.avg_time > threshold)
    .map(([queryId, metrics]) => ({
      query_id: queryId,
      avg_time: metrics.avg_time,
      max_time: metrics.max_time,
      total_executions: metrics.total_executions,
      needs_optimization: true
    }))
    .sort((a, b) => b.avg_time - a.avg_time);
};

/**
 * Optimization recommendations for portfolio/marketplace queries
 */
const PORTFOLIO_OPTIMIZATIONS = {
  // Portfolio browsing optimization
  portfolioBrowse: {
    indexes: [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_images_marketplace_browse ON portfolio_images (user_id, is_marketplace_visible, moderation_status) WHERE is_marketplace_visible = true AND moderation_status = \'approved\'',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_images_featured_views ON portfolio_images (is_featured DESC, views_count DESC, created_at DESC) WHERE moderation_status = \'approved\'',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_images_category_visible ON portfolio_images (category_id, is_marketplace_visible, moderation_status)'
    ],
    partitioning: 'Consider partitioning portfolio_images by created_at for large datasets',
    caching: 'Cache portfolio listings for 5 minutes, invalidate on updates'
  },
  
  // Marketplace browsing optimization
  marketplaceBrowse: {
    indexes: [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_professionals_ranking ON users (user_type, is_active) INCLUDE (average_rating, review_count) WHERE user_type = \'provider\'',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_professionals_location ON users (locality, location, user_type) WHERE user_type = \'provider\' AND is_active = true',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_professionals_rating ON users (average_rating DESC, review_count DESC) WHERE user_type = \'provider\' AND is_active = true'
    ],
    materialized_views: 'CREATE MATERIALIZED VIEW marketplace_professionals_summary AS SELECT u.*, pm.* FROM users u LEFT JOIN professional_marketplace_metrics pm ON u.id = pm.user_id WHERE u.user_type = \'provider\' AND u.is_active = true',
    caching: 'Cache marketplace browse results for 2 minutes'
  },
  
  // Analytics optimization
  analytics: {
    indexes: [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_image_views_analytics ON portfolio_image_views (image_id, viewed_at DESC)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_image_views_daily ON portfolio_image_views (DATE_TRUNC(\'day\', viewed_at), image_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_image_likes_daily ON portfolio_image_likes (DATE_TRUNC(\'day\', created_at), image_id)'
    ],
    partitioning: 'Partition analytics tables by month for better performance',
    aggregation: 'Use materialized views for daily/weekly aggregations'
  }
};

/**
 * Apply recommended optimizations
 * @param {string} category - Optimization category
 * @returns {object} Application results
 */
const applyOptimizations = async (category) => {
  const optimizations = PORTFOLIO_OPTIMIZATIONS[category];
  if (!optimizations) {
    throw new Error(`Unknown optimization category: ${category}`);
  }
  
  const results = {
    indexes_created: 0,
    indexes_failed: 0,
    errors: []
  };
  
  // Apply indexes
  if (optimizations.indexes) {
    for (const indexSql of optimizations.indexes) {
      try {
        await query(indexSql);
        results.indexes_created++;
        logger.info('Index created successfully', {
          category: 'optimization',
          sql: indexSql.substring(0, 100)
        });
      } catch (error) {
        results.indexes_failed++;
        results.errors.push({
          type: 'index',
          sql: indexSql,
          error: error.message
        });
        logger.error('Index creation failed', {
          category: 'optimization',
          sql: indexSql,
          error: error.message
        });
      }
    }
  }
  
  return results;
};

/**
 * Check database health and performance
 * @returns {object} Health report
 */
const checkDatabaseHealth = async () => {
  try {
    const healthChecks = await Promise.all([
      // Connection count
      query('SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = \'active\''),
      
      // Table sizes
      query(`
        SELECT schemaname, tablename, 
               pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
               pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables 
        WHERE tablename IN ('portfolio_images', 'portfolio_image_views', 'users', 'professional_marketplace_metrics')
        ORDER BY size_bytes DESC
      `),
      
      // Index usage
      query(`
        SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
        FROM pg_stat_user_indexes 
        WHERE schemaname = 'public'
        ORDER BY idx_tup_read DESC
        LIMIT 10
      `),
      
      // Slow queries from pg_stat_statements (if available)
      query(`
        SELECT query, calls, total_time, mean_time, rows
        FROM pg_stat_statements 
        WHERE query LIKE '%portfolio%' OR query LIKE '%marketplace%'
        ORDER BY mean_time DESC
        LIMIT 5
      `).catch(() => ({ rows: [] })) // Ignore if extension not available
    ]);
    
    return {
      status: 'healthy',
      active_connections: parseInt(healthChecks[0].rows[0].active_connections),
      table_sizes: healthChecks[1].rows,
      index_usage: healthChecks[2].rows,
      slow_queries: healthChecks[3].rows,
      query_metrics: getQueryStats(5),
      slow_query_count: getSlowQueries().length,
      recommendations: generateHealthRecommendations(healthChecks)
    };
    
  } catch (error) {
    logger.error('Database health check failed', {
      category: 'database',
      error: error.message
    });
    
    return {
      status: 'error',
      error: error.message
    };
  }
};

/**
 * Generate health recommendations
 * @param {array} healthChecks - Health check results
 * @returns {array} Recommendations
 */
const generateHealthRecommendations = (healthChecks) => {
  const recommendations = [];
  
  const connections = parseInt(healthChecks[0].rows[0].active_connections);
  if (connections > 50) {
    recommendations.push({
      type: 'connection_pool',
      message: `High connection count (${connections}). Consider connection pooling.`,
      priority: 'high'
    });
  }
  
  const largeTables = healthChecks[1].rows.filter(table => table.size_bytes > 100 * 1024 * 1024); // > 100MB
  if (largeTables.length > 0) {
    recommendations.push({
      type: 'table_size',
      message: `Large tables detected: ${largeTables.map(t => t.tablename).join(', ')}. Consider archiving or partitioning.`,
      priority: 'medium'
    });
  }
  
  const slowQueries = getSlowQueries().length;
  if (slowQueries > 0) {
    recommendations.push({
      type: 'performance',
      message: `${slowQueries} slow queries detected. Review and optimize.`,
      priority: 'high'
    });
  }
  
  return recommendations;
};

module.exports = {
  executeOptimizedQuery,
  analyzeQueryPlan,
  getQueryStats,
  getSlowQueries,
  applyOptimizations,
  checkDatabaseHealth,
  PORTFOLIO_OPTIMIZATIONS
};