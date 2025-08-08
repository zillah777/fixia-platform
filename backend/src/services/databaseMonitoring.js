/**
 * Database Monitoring and Alerting Service
 * Monitors database health, performance, and connection stability
 * Provides real-time alerting for critical database issues
 */

const logger = require('../utils/logger');
const { testConnection, getPoolStats, dbStatus } = require('../config/database');

/**
 * Database monitoring configuration
 */
const MONITORING_CONFIG = {
  healthCheck: {
    intervalMs: 30000, // 30 seconds
    timeoutMs: 10000,  // 10 seconds
    failureThreshold: 3, // Alert after 3 consecutive failures
    recoveryThreshold: 2, // Require 2 consecutive successes to mark as recovered
  },
  performance: {
    intervalMs: 60000, // 1 minute
    slowQueryThresholdMs: 5000, // 5 seconds
    highConnectionThreshold: 20, // Alert if > 20 active connections
    lowCacheHitRatio: 0.8, // Alert if cache hit ratio < 80%
  },
  alerts: {
    retryIntervalMs: 300000, // 5 minutes between repeat alerts
    maxAlertsPerHour: 10,
  }
};

/**
 * Monitoring state
 */
let monitoringState = {
  isRunning: false,
  lastHealthCheck: null,
  consecutiveFailures: 0,
  consecutiveSuccesses: 0,
  alertHistory: [],
  performanceMetrics: [],
  intervals: []
};

/**
 * Alert severity levels
 */
const ALERT_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * Send alert (can be extended to integrate with external services)
 */
const sendAlert = async (level, title, message, metadata = {}) => {
  const alert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    level,
    title,
    message,
    metadata,
    timestamp: new Date().toISOString()
  };
  
  // Add to alert history
  monitoringState.alertHistory.unshift(alert);
  
  // Keep only last 100 alerts
  if (monitoringState.alertHistory.length > 100) {
    monitoringState.alertHistory = monitoringState.alertHistory.slice(0, 100);
  }
  
  // Log alert
  logger[level === ALERT_LEVELS.CRITICAL ? 'error' : level](
    `🚨 DATABASE ALERT: ${title}`, 
    { message, metadata, alertId: alert.id }
  );
  
  // Here you could integrate with external alerting services:
  // - Slack webhook
  // - Email notifications
  // - PagerDuty
  // - Discord webhook
  // - SMS alerts
  
  return alert;
};

/**
 * Check if we should throttle alerts
 */
const shouldThrottleAlert = (alertType) => {
  const now = Date.now();
  const recentAlerts = monitoringState.alertHistory.filter(
    alert => 
      alert.metadata.type === alertType &&
      (now - new Date(alert.timestamp).getTime()) < MONITORING_CONFIG.alerts.retryIntervalMs
  );
  
  return recentAlerts.length > 0;
};

/**
 * Perform comprehensive database health check
 */
const performHealthCheck = async () => {
  try {
    const startTime = Date.now();
    const healthResult = await testConnection();
    const duration = Date.now() - startTime;
    
    if (!healthResult.connected) {
      throw new Error(healthResult.error || 'Health check failed');
    }
    
    const poolStats = getPoolStats();
    const currentDbStatus = dbStatus();
    
    const healthData = {
      timestamp: new Date().toISOString(),
      connected: true,
      responseTime: duration,
      poolStats,
      dbStatus: currentDbStatus,
      serverTime: healthResult.serverTime,
      dbSize: healthResult.dbSize
    };
    
    // Update monitoring state
    monitoringState.lastHealthCheck = healthData;
    monitoringState.consecutiveFailures = 0;
    monitoringState.consecutiveSuccesses++;
    
    // Check for recovery after failures
    if (monitoringState.consecutiveSuccesses === MONITORING_CONFIG.healthCheck.recoveryThreshold) {
      await sendAlert(
        ALERT_LEVELS.INFO,
        'Database Connection Recovered',
        'Database connectivity has been restored after previous failures.',
        { type: 'recovery', healthData }
      );
    }
    
    // Performance alerts
    if (duration > MONITORING_CONFIG.performance.slowQueryThresholdMs) {
      if (!shouldThrottleAlert('slow_health_check')) {
        await sendAlert(
          ALERT_LEVELS.WARNING,
          'Slow Database Health Check',
          `Health check took ${duration}ms, which exceeds the ${MONITORING_CONFIG.performance.slowQueryThresholdMs}ms threshold.`,
          { type: 'slow_health_check', duration, threshold: MONITORING_CONFIG.performance.slowQueryThresholdMs }
        );
      }
    }
    
    // Connection pool alerts
    if (poolStats.totalCount > MONITORING_CONFIG.performance.highConnectionThreshold) {
      if (!shouldThrottleAlert('high_connection_count')) {
        await sendAlert(
          ALERT_LEVELS.WARNING,
          'High Database Connection Count',
          `Database pool has ${poolStats.totalCount} connections, which exceeds the ${MONITORING_CONFIG.performance.highConnectionThreshold} threshold.`,
          { type: 'high_connection_count', poolStats }
        );
      }
    }
    
    return healthData;
    
  } catch (error) {
    monitoringState.consecutiveFailures++;
    monitoringState.consecutiveSuccesses = 0;
    
    const failureData = {
      timestamp: new Date().toISOString(),
      connected: false,
      error: error.message,
      consecutiveFailures: monitoringState.consecutiveFailures,
      poolStats: getPoolStats(),
      dbStatus: dbStatus()
    };
    
    monitoringState.lastHealthCheck = failureData;
    
    // Send alerts based on failure threshold
    if (monitoringState.consecutiveFailures === 1) {
      await sendAlert(
        ALERT_LEVELS.WARNING,
        'Database Connection Issue',
        `Database health check failed: ${error.message}`,
        { type: 'connection_failure', error: error.message, failureData }
      );
    } else if (monitoringState.consecutiveFailures >= MONITORING_CONFIG.healthCheck.failureThreshold) {
      if (!shouldThrottleAlert('critical_failure')) {
        await sendAlert(
          ALERT_LEVELS.CRITICAL,
          'Database Connection Critical',
          `Database has failed ${monitoringState.consecutiveFailures} consecutive health checks. Service may be unavailable.`,
          { type: 'critical_failure', consecutiveFailures: monitoringState.consecutiveFailures, failureData }
        );
      }
    }
    
    throw error;
  }
};

/**
 * Collect performance metrics
 */
const collectPerformanceMetrics = async () => {
  try {
    const poolStats = getPoolStats();
    const currentDbStatus = dbStatus();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      pool: poolStats,
      dbStatus: currentDbStatus,
      system: {
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
    
    // Store metrics (keep last 60 entries = 1 hour of data)
    monitoringState.performanceMetrics.unshift(metrics);
    if (monitoringState.performanceMetrics.length > 60) {
      monitoringState.performanceMetrics = monitoringState.performanceMetrics.slice(0, 60);
    }
    
    return metrics;
    
  } catch (error) {
    logger.error('Failed to collect performance metrics', { error: error.message });
    return null;
  }
};

/**
 * Start database monitoring
 */
const startMonitoring = () => {
  if (monitoringState.isRunning) {
    logger.warn('Database monitoring is already running');
    return;
  }
  
  logger.info('🔍 Starting database monitoring service', {
    healthCheckInterval: MONITORING_CONFIG.healthCheck.intervalMs,
    performanceInterval: MONITORING_CONFIG.performance.intervalMs
  });
  
  // Health check interval
  const healthInterval = setInterval(async () => {
    try {
      await performHealthCheck();
    } catch (error) {
      // Error already handled in performHealthCheck
    }
  }, MONITORING_CONFIG.healthCheck.intervalMs);
  
  // Performance metrics interval
  const performanceInterval = setInterval(async () => {
    await collectPerformanceMetrics();
  }, MONITORING_CONFIG.performance.intervalMs);
  
  monitoringState.intervals = [healthInterval, performanceInterval];
  monitoringState.isRunning = true;
  
  // Perform initial health check
  performHealthCheck().catch(() => {
    // Initial check failure is already handled
  });
  
  logger.info('✅ Database monitoring service started successfully');
};

/**
 * Stop database monitoring
 */
const stopMonitoring = () => {
  if (!monitoringState.isRunning) {
    logger.warn('Database monitoring is not running');
    return;
  }
  
  logger.info('🛑 Stopping database monitoring service');
  
  // Clear intervals
  monitoringState.intervals.forEach(interval => clearInterval(interval));
  monitoringState.intervals = [];
  monitoringState.isRunning = false;
  
  logger.info('✅ Database monitoring service stopped');
};

/**
 * Get monitoring status and recent data
 */
const getMonitoringStatus = () => {
  return {
    isRunning: monitoringState.isRunning,
    lastHealthCheck: monitoringState.lastHealthCheck,
    consecutiveFailures: monitoringState.consecutiveFailures,
    consecutiveSuccesses: monitoringState.consecutiveSuccesses,
    recentAlerts: monitoringState.alertHistory.slice(0, 10), // Last 10 alerts
    recentMetrics: monitoringState.performanceMetrics.slice(0, 5), // Last 5 metric collections
    configuration: MONITORING_CONFIG
  };
};

/**
 * Get historical performance data
 */
const getPerformanceHistory = (hours = 1) => {
  const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
  
  return monitoringState.performanceMetrics.filter(metric => 
    new Date(metric.timestamp).getTime() > cutoffTime
  );
};

/**
 * Manual trigger for health check (useful for testing)
 */
const triggerHealthCheck = async () => {
  logger.info('🔍 Manual health check triggered');
  return await performHealthCheck();
};

// Auto-start monitoring in production
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DB_MONITORING === 'true') {
  // Start after a short delay to ensure database is initialized
  setTimeout(() => {
    startMonitoring();
  }, 5000);
}

// Graceful shutdown
process.on('SIGINT', () => {
  stopMonitoring();
});

process.on('SIGTERM', () => {
  stopMonitoring();
});

module.exports = {
  startMonitoring,
  stopMonitoring,
  getMonitoringStatus,
  getPerformanceHistory,
  triggerHealthCheck,
  performHealthCheck,
  collectPerformanceMetrics,
  sendAlert,
  ALERT_LEVELS,
  MONITORING_CONFIG
};