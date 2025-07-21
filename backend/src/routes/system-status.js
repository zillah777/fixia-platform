const express = require('express');
const { query } = require('../config/database');
const jobQueue = require('../services/jobQueue');
const cacheService = require('../services/cacheService');
const { getStaticFileMetrics } = require('../middleware/assetOptimization');
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

// Get database performance metrics
const getDatabaseMetrics = async () => {
  try {
    const startTime = Date.now();
    
    // Simple query to test database performance
    await query('SELECT 1');
    const latency = Date.now() - startTime;

    // Get basic table stats
    const tableStats = await query(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_rows
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC
      LIMIT 5
    `);

    // Get index usage
    const indexStats = await query(`
      SELECT 
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public' AND idx_tup_read > 0
      ORDER BY idx_tup_read DESC
      LIMIT 5
    `);

    return {
      available: true,
      latency,
      tables: tableStats.rows,
      indexes: indexStats.rows,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      available: false,
      error: error.message
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
    // Quick health checks
    const [dbHealth, redisHealth] = await Promise.all([
      query('SELECT 1').then(() => true).catch(() => false),
      getRedisStatus().then(status => status.available)
    ]);

    const allHealthy = dbHealth && redisHealth;
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        redis: redisHealth,
        jobQueue: jobQueue.isAvailable()
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

module.exports = router;