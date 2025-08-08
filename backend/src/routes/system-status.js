const express = require('express');
const { query, testConnection, getPoolStats, dbStatus } = require('../config/database');
const jobQueue = require('../services/jobQueue');
const cacheService = require('../services/cacheService');
const { getStaticFileMetrics } = require('../middleware/assetOptimization');
const { 
  getMonitoringStatus, 
  getPerformanceHistory, 
  triggerHealthCheck,
  startMonitoring,
  stopMonitoring
} = require('../services/databaseMonitoring');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * System Status and Performance Monitoring Endpoint
 * Provides comprehensive status of all optimization systems
 */

// Get Redis status
const getRedisStatus = async () => {
  try {
    const testResult = await cacheService.set('health_check', 'ok', 10);
    const getValue = await cacheService.get('health_check');
    
    return {
      available: testResult && getValue === 'ok',
      type: 'redis',
      latency: null // Could be enhanced with timing
    };
  } catch (error) {
    return {
      available: false,
      type: 'mock',
      error: error.message
    };
  }
};

// Enhanced database metrics with comprehensive connection monitoring
const getDatabaseMetrics = async () => {
  try {
    // Use enhanced connection testing
    const connectionTest = await testConnection();
    if (!connectionTest.connected) {
      return {
        available: false,
        error: connectionTest.error || 'Connection test failed',
        code: connectionTest.code
      };
    }

    const startTime = Date.now();
    
    // Test various database operations
    const healthQueries = await Promise.all([
      // Basic connectivity test
      query('SELECT NOW() as current_time, version() as version'),
      
      // Connection pool test
      query('SELECT current_database() as database, current_user as user'),
      
      // Performance test
      query('SELECT pg_database_size(current_database()) as db_size, pg_stat_get_db_xact_commit(oid) as commits FROM pg_database WHERE datname = current_database()')
    ]);
    
    const basicLatency = Date.now() - startTime;

    // Get comprehensive table statistics
    const tableStats = await query(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_rows,
        n_dead_tup as dead_rows,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC
      LIMIT 10
    `);

    // Get index usage and efficiency
    const indexStats = await query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch,
        idx_blks_read,
        idx_blks_hit,
        CASE WHEN idx_blks_hit + idx_blks_read = 0 THEN 0 
             ELSE round((idx_blks_hit::numeric / (idx_blks_hit + idx_blks_read)) * 100, 2) 
        END as cache_hit_ratio
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public' AND (idx_tup_read > 0 OR idx_tup_fetch > 0)
      ORDER BY idx_tup_read DESC
      LIMIT 10
    `);

    // Get connection pool statistics
    const poolStats = getPoolStats();
    
    // Get database connection statistics
    const connectionStats = await query(`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections,
        max(backend_start) as oldest_connection
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);

    return {
      available: true,
      latency: basicLatency,
      connectionTest: {
        responseTime: connectionTest.responseTime,
        serverTime: connectionTest.serverTime,
        dbSize: connectionTest.dbSize
      },
      pool: poolStats,
      connections: connectionStats.rows[0],
      tables: tableStats.rows,
      indexes: indexStats.rows,
      database: {
        version: healthQueries[0].rows[0].version,
        name: healthQueries[1].rows[0].database,
        user: healthQueries[1].rows[0].user,
        size: healthQueries[2].rows[0].db_size,
        commits: healthQueries[2].rows[0].commits
      },
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Database metrics collection failed', {
      error: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return {
      available: false,
      error: error.message,
      code: error.code,
      pool: getPoolStats(),
      dbStatus: dbStatus()
    };
  }
};

// Get system performance overview
const getSystemOverview = () => {
  const memoryUsage = process.memoryUsage();
  
  return {
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    },
    cpu: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version
    },
    environment: process.env.NODE_ENV || 'development'
  };
};

/**
 * @swagger
 * /api/system/status:
 *   get:
 *     summary: Get comprehensive system status and performance metrics
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System status overview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 system:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: number
 *                     memory:
 *                       type: object
 *                     environment:
 *                       type: string
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                     redis:
 *                       type: object
 *                     jobQueue:
 *                       type: object
 *                     assetOptimization:
 *                       type: object
 *       500:
 *         description: Server error
 */
router.get('/status', async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    
    // Get all system status in parallel for faster response
    const [
      systemOverview,
      redisStatus,
      databaseMetrics,
      jobQueueStatus,
      assetMetrics
    ] = await Promise.all([
      getSystemOverview(),
      getRedisStatus(),
      getDatabaseMetrics(),
      jobQueue.getQueueStatus(),
      getStaticFileMetrics()
    ]);

    const response = {
      success: true,
      timestamp,
      system: systemOverview,
      services: {
        database: databaseMetrics,
        redis: redisStatus,
        jobQueue: jobQueueStatus,
        assetOptimization: assetMetrics
      },
      optimizations: {
        caching: {
          enabled: redisStatus.available,
          type: redisStatus.type
        },
        backgroundJobs: {
          enabled: jobQueue.isAvailable(),
          mode: jobQueue.isAvailable() ? 'async' : 'sync'
        },
        assetOptimization: {
          enabled: true,
          compressionHints: true,
          smartCaching: false // Conservative setting
        },
        databaseIndexes: {
          optimized: true,
          note: 'Run npm run db:stats for detailed metrics'
        }
      }
    };

    // Log system status for monitoring
    logger.info('System status requested', {
      dbLatency: databaseMetrics.latency,
      redisAvailable: redisStatus.available,
      jobQueueAvailable: jobQueue.isAvailable(),
      memoryUsed: systemOverview.memory.heapUsed
    });

    res.json(response);

  } catch (error) {
    logger.error('Error getting system status', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system status',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/system/health:
 *   get:
 *     summary: Simple health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: boolean
 *                     redis:
 *                       type: boolean
 *                     jobQueue:
 *                       type: boolean
 */
router.get('/health', async (req, res) => {
  try {
    // Enhanced health checks with detailed status
    const [dbHealth, redisHealth] = await Promise.all([
      testConnection().then(result => ({ 
        healthy: result.connected, 
        responseTime: result.responseTime,
        error: result.error 
      })).catch(err => ({ 
        healthy: false, 
        error: err.message 
      })),
      getRedisStatus().then(status => ({ 
        healthy: status.available, 
        type: status.type,
        error: status.error 
      }))
    ]);

    const allHealthy = dbHealth.healthy && redisHealth.healthy;
    const poolStats = getPoolStats();
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          healthy: dbHealth.healthy,
          responseTime: dbHealth.responseTime,
          pool: poolStats,
          error: dbHealth.error
        },
        redis: {
          healthy: redisHealth.healthy,
          type: redisHealth.type,
          error: redisHealth.error
        },
        jobQueue: {
          healthy: jobQueue.isAvailable()
        }
      },
      details: {
        databasePool: poolStats,
        criticalServices: {
          database: dbHealth.healthy,
          cache: redisHealth.healthy
        }
      }
    });

  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/system/performance:
 *   get:
 *     summary: Get detailed performance metrics
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Performance metrics
 */
router.get('/performance', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      server: getSystemOverview(),
      database: await getDatabaseMetrics(),
      cache: await getRedisStatus()
    };

    res.json({
      success: true,
      metrics
    });

  } catch (error) {
    logger.error('Error getting performance metrics', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance metrics'
    });
  }
});

/**
 * @swagger
 * /api/system/database/monitoring:
 *   get:
 *     summary: Get database monitoring status and metrics
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Database monitoring status
 */
router.get('/database/monitoring', async (req, res) => {
  try {
    const monitoringStatus = getMonitoringStatus();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      monitoring: monitoringStatus
    });
    
  } catch (error) {
    logger.error('Error getting database monitoring status', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get monitoring status'
    });
  }
});

/**
 * @swagger
 * /api/system/database/performance:
 *   get:
 *     summary: Get database performance history
 *     tags: [System]
 *     parameters:
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Hours of history to retrieve
 *     responses:
 *       200:
 *         description: Database performance history
 */
router.get('/database/performance', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 1;
    const performanceHistory = getPerformanceHistory(hours);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      hours,
      metrics: performanceHistory,
      summary: {
        totalDataPoints: performanceHistory.length,
        timeRange: {
          from: performanceHistory[performanceHistory.length - 1]?.timestamp,
          to: performanceHistory[0]?.timestamp
        }
      }
    });
    
  } catch (error) {
    logger.error('Error getting database performance history', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance history'
    });
  }
});

/**
 * @swagger
 * /api/system/database/health-check:
 *   post:
 *     summary: Trigger manual database health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Health check results
 */
router.post('/database/health-check', async (req, res) => {
  try {
    const healthResult = await triggerHealthCheck();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      healthCheck: healthResult
    });
    
  } catch (error) {
    logger.error('Manual health check failed', error);
    res.status(503).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message,
      healthCheck: {
        connected: false,
        error: error.message
      }
    });
  }
});

/**
 * @swagger
 * /api/system/database/monitoring/start:
 *   post:
 *     summary: Start database monitoring service
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Monitoring service started
 */
router.post('/database/monitoring/start', async (req, res) => {
  try {
    startMonitoring();
    
    res.json({
      success: true,
      message: 'Database monitoring service started',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error starting database monitoring', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start monitoring service'
    });
  }
});

/**
 * @swagger
 * /api/system/database/monitoring/stop:
 *   post:
 *     summary: Stop database monitoring service
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Monitoring service stopped
 */
router.post('/database/monitoring/stop', async (req, res) => {
  try {
    stopMonitoring();
    
    res.json({
      success: true,
      message: 'Database monitoring service stopped',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error stopping database monitoring', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop monitoring service'
    });
  }
});

module.exports = router;