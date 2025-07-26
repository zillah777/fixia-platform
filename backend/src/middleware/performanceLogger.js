/**
 * Performance Logger - Monitor API performance and database queries
 * @fileoverview Tracks response times and identifies performance bottlenecks
 */
const { logger } = require('../utils/smartLogger');

// Performance thresholds (ms)
const THRESHOLDS = {
  FAST: 100,      // Green zone
  MODERATE: 500,  // Yellow zone
  SLOW: 1000,     // Orange zone
  CRITICAL: 2000  // Red zone
};

// Track slow endpoints
const slowEndpoints = new Map();

/**
 * Performance monitoring middleware
 */
const performanceLogger = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  // Track request metadata
  const requestId = req.headers['x-request-id'] || Math.random().toString(36).substr(2, 9);
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.headers['user-agent'];
  const contentLength = req.headers['content-length'];
  
  // Log incoming request in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`🔄 ${method} ${url}`, {
      requestId,
      userAgent: userAgent?.substring(0, 50),
      contentLength
    });
  }

  // Override res.send to capture response time
  res.send = function(body) {
    const end = Date.now();
    const duration = end - start;
    const statusCode = res.statusCode;
    const responseSize = Buffer.isBuffer(body) ? body.length : JSON.stringify(body).length;
    
    // Determine performance level
    let performanceLevel = 'FAST';
    if (duration > THRESHOLDS.CRITICAL) performanceLevel = 'CRITICAL';
    else if (duration > THRESHOLDS.SLOW) performanceLevel = 'SLOW';
    else if (duration > THRESHOLDS.MODERATE) performanceLevel = 'MODERATE';
    
    // Log performance data
    const logData = {
      requestId,
      duration,
      statusCode,
      responseSize,
      level: performanceLevel
    };

    // Choose log level based on performance and status
    if (statusCode >= 500 || duration > THRESHOLDS.CRITICAL) {
      logger.error(`🚨 ${method} ${url} - ${statusCode} (${duration}ms)`, logData);
    } else if (statusCode >= 400 || duration > THRESHOLDS.SLOW) {
      logger.warn(`⚠️ ${method} ${url} - ${statusCode} (${duration}ms)`, logData);
    } else if (duration > THRESHOLDS.MODERATE) {
      logger.info(`⏱️ ${method} ${url} - ${statusCode} (${duration}ms)`, logData);
    } else if (process.env.NODE_ENV === 'development') {
      logger.debug(`✅ ${method} ${url} - ${statusCode} (${duration}ms)`, logData);
    }

    // Track slow endpoints for analysis
    if (duration > THRESHOLDS.MODERATE) {
      const endpoint = `${method} ${url}`;
      if (!slowEndpoints.has(endpoint)) {
        slowEndpoints.set(endpoint, []);
      }
      slowEndpoints.get(endpoint).push({
        duration,
        timestamp: new Date().toISOString(),
        statusCode
      });
      
      // Keep only last 10 slow requests per endpoint
      const requests = slowEndpoints.get(endpoint);
      if (requests.length > 10) {
        requests.shift();
      }
    }

    // Add performance headers
    res.setHeader('X-Response-Time', `${duration}ms`);
    res.setHeader('X-Performance-Level', performanceLevel);
    res.setHeader('X-Request-ID', requestId);
    
    // Call original send
    originalSend.call(this, body);
  };

  next();
};

/**
 * Get performance statistics
 */
const getPerformanceStats = () => {
  const stats = {
    slowEndpoints: {},
    totalSlowRequests: 0,
    summary: {
      endpoints: slowEndpoints.size,
      avgDuration: 0,
      maxDuration: 0
    }
  };
  
  let totalDuration = 0;
  let maxDuration = 0;
  let totalRequests = 0;
  
  for (const [endpoint, requests] of slowEndpoints.entries()) {
    const durations = requests.map(r => r.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const max = Math.max(...durations);
    
    stats.slowEndpoints[endpoint] = {
      count: requests.length,
      avgDuration: Math.round(avgDuration),
      maxDuration: max,
      lastOccurrence: requests[requests.length - 1].timestamp
    };
    
    totalDuration += durations.reduce((a, b) => a + b, 0);
    totalRequests += requests.length;
    maxDuration = Math.max(maxDuration, max);
  }
  
  stats.totalSlowRequests = totalRequests;
  stats.summary.avgDuration = totalRequests > 0 ? Math.round(totalDuration / totalRequests) : 0;
  stats.summary.maxDuration = maxDuration;
  
  return stats;
};

/**
 * Clear performance statistics
 */
const clearPerformanceStats = () => {
  slowEndpoints.clear();
  logger.info('Performance statistics cleared');
};

module.exports = {
  performanceLogger,
  getPerformanceStats,
  clearPerformanceStats,
  THRESHOLDS
};