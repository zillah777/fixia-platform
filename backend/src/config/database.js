const { Pool } = require('pg');
const winston = require('winston');
require('dotenv').config();

// Configure logger for database operations
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Database connection configuration with enterprise-grade settings
const dbConfig = {
  // Connection parameters with fallbacks
  host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.PGPORT || '5432'),
  user: process.env.DB_USER || process.env.PGUSER || 'postgres',
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
  database: process.env.DB_NAME || process.env.PGDATABASE || 'fixia_db',
  
  // Enterprise connection pooling settings
  max: 25, // Maximum number of clients in the pool (increased for production)
  min: 2, // Minimum number of clients in the pool
  idleTimeoutMillis: 60000, // 60 seconds idle timeout
  connectionTimeoutMillis: 10000, // 10 seconds connection timeout (increased)
  maxUses: 7500, // Maximum uses per connection before replacement
  
  // SSL configuration
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : process.env.DB_SSL === 'true' 
      ? { rejectUnauthorized: false } 
      : false,
  
  // Connection reliability settings
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  
  // Query timeouts
  statement_timeout: 45000, // 45 seconds for complex queries
  query_timeout: 45000,
  idle_in_transaction_session_timeout: 30000,
  
  // Connection retry configuration
  application_name: 'fixia_marketplace',
  
  // Additional reliability options
  acquireTimeoutMillis: 60000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200
};

// Create connection pool with enhanced error handling
let pool;
let isConnected = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000; // 5 seconds

// Database connection state
let dbStatus = {
  connected: false,
  lastError: null,
  connectionCount: 0,
  lastConnectionAttempt: null,
  pool: null
};

// Initialize database pool with retry logic
const initializePool = async (retryCount = 0) => {
  try {
    if (pool) {
      await pool.end();
    }
    
    logger.info('🔗 Initializing PostgreSQL connection pool...', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      attempt: retryCount + 1
    });
    
    pool = new Pool(dbConfig);
    dbStatus.pool = pool;
    
    // Enhanced pool event handlers
    pool.on('connect', (client) => {
      logger.info('✅ New database client connected', {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
      });
      dbStatus.connectionCount++;
    });
    
    pool.on('acquire', (client) => {
      logger.debug('🔒 Client acquired from pool');
    });
    
    pool.on('release', (client) => {
      logger.debug('🔓 Client released back to pool');
    });
    
    pool.on('remove', (client) => {
      logger.info('🗑️ Client removed from pool');
      dbStatus.connectionCount--;
    });
    
    pool.on('error', async (err, client) => {
      logger.error('💥 Unexpected error on idle client', {
        error: err.message,
        code: err.code,
        totalCount: pool.totalCount,
        idleCount: pool.idleCount
      });
      
      dbStatus.lastError = err;
      dbStatus.connected = false;
      
      // Don't exit process - attempt reconnection instead
      if (retryCount < MAX_CONNECTION_ATTEMPTS) {
        logger.warn(`🔄 Attempting to reconnect in ${RECONNECT_INTERVAL/1000}s...`);
        setTimeout(() => {
          initializePool(retryCount + 1);
        }, RECONNECT_INTERVAL);
      } else {
        logger.error('❌ Max connection attempts reached. Database connection failed.');
      }
    });
    
    // Test initial connection
    const testClient = await pool.connect();
    const result = await testClient.query('SELECT NOW(), version() as version');
    testClient.release();
    
    isConnected = true;
    dbStatus.connected = true;
    dbStatus.lastError = null;
    dbStatus.lastConnectionAttempt = new Date();
    connectionAttempts = 0;
    
    logger.info('🎉 PostgreSQL Database connected successfully', {
      serverTime: result.rows[0].now,
      version: result.rows[0].version.split(' ')[0],
      poolStats: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      }
    });
    
    return pool;
    
  } catch (error) {
    connectionAttempts++;
    dbStatus.lastError = error;
    dbStatus.connected = false;
    dbStatus.lastConnectionAttempt = new Date();
    
    logger.error('❌ Database connection failed', {
      attempt: retryCount + 1,
      maxAttempts: MAX_CONNECTION_ATTEMPTS,
      error: error.message,
      code: error.code
    });
    
    if (retryCount < MAX_CONNECTION_ATTEMPTS) {
      logger.warn(`🔄 Retrying connection in ${RECONNECT_INTERVAL/1000}s... (${retryCount + 1}/${MAX_CONNECTION_ATTEMPTS})`);
      await new Promise(resolve => setTimeout(resolve, RECONNECT_INTERVAL));
      return initializePool(retryCount + 1);
    } else {
      logger.error('💀 Maximum connection attempts exceeded. Database unavailable.');
      throw error;
    }
  }
};

// Initialize pool immediately
initializePool().catch(err => {
  logger.error('🚨 Critical: Failed to initialize database pool', { error: err.message });
});

// Enhanced connection testing with comprehensive health checks
const testConnection = async () => {
  try {
    if (!pool) {
      await initializePool();
    }
    
    const client = await pool.connect();
    const startTime = Date.now();
    
    // Test basic connectivity
    const result = await client.query('SELECT NOW(), pg_database_size(current_database()) as db_size');
    
    // Test write capability
    await client.query('SELECT 1 as write_test');
    
    const responseTime = Date.now() - startTime;
    
    client.release();
    
    dbStatus.connected = true;
    dbStatus.lastError = null;
    
    logger.info('✅ Database health check passed', {
      serverTime: result.rows[0].now,
      dbSize: result.rows[0].db_size,
      responseTime: `${responseTime}ms`,
      poolStats: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      }
    });
    
    return {
      connected: true,
      responseTime,
      serverTime: result.rows[0].now,
      dbSize: result.rows[0].db_size,
      poolStats: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      }
    };
  } catch (error) {
    dbStatus.connected = false;
    dbStatus.lastError = error;
    
    logger.error('❌ Database health check failed', {
      error: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return {
      connected: false,
      error: error.message,
      code: error.code
    };
  }
};

// Enhanced query function with comprehensive retry logic and circuit breaker
const query = async (text, params = [], options = {}) => {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    logQueries = process.env.NODE_ENV === 'development'
  } = options;
  
  const start = Date.now();
  let client;
  let lastError;
  
  // Check if pool is available
  if (!pool || !dbStatus.connected) {
    logger.warn('🔄 Pool not connected, attempting to initialize...');
    try {
      await initializePool();
    } catch (error) {
      throw new Error(`Database pool initialization failed: ${error.message}`);
    }
  }
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Get client with timeout
      const clientPromise = pool.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Client acquisition timeout')), timeout)
      );
      
      client = await Promise.race([clientPromise, timeoutPromise]);
      
      // Execute query with timeout
      const queryPromise = client.query(text, params);
      const queryTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query execution timeout')), timeout)
      );
      
      const res = await Promise.race([queryPromise, queryTimeoutPromise]);
      const duration = Date.now() - start;
      
      // Log successful queries in development
      if (logQueries) {
        logger.debug('📊 Query executed successfully', {
          text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          duration: `${duration}ms`,
          rows: res.rowCount,
          params: params?.length || 0,
          attempt
        });
      }
      
      return res;
      
    } catch (error) {
      lastError = error;
      
      // Determine if error is retryable
      const isRetryableError = (
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNREFUSED' ||
        error.message.includes('Connection terminated') ||
        error.message.includes('timeout') ||
        error.message.includes('Client acquisition timeout') ||
        error.message.includes('Query execution timeout') ||
        error.message.includes('connection is closed')
      );
      
      if (isRetryableError && attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        
        logger.warn(`🔄 Query attempt ${attempt}/${retries} failed, retrying in ${delay}ms...`, {
          error: error.message,
          code: error.code,
          query: text.substring(0, 50) + '...',
          nextDelay: `${delay}ms`
        });
        
        // Mark connection as potentially problematic
        if (error.code === 'ECONNRESET' || error.message.includes('Connection terminated')) {
          dbStatus.connected = false;
          dbStatus.lastError = error;
          
          // Try to reinitialize pool if connection issues persist
          if (attempt === Math.floor(retries / 2)) {
            logger.info('🔄 Attempting pool reinitialization...');
            try {
              await initializePool();
            } catch (initError) {
              logger.error('❌ Pool reinitialization failed', { error: initError.message });
            }
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Log final error
      logger.error('❌ Query failed after all attempts', {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        params: params?.length || 0,
        error: error.message,
        code: error.code,
        finalAttempt: attempt,
        totalRetries: retries,
        duration: `${Date.now() - start}ms`
      });
      
      throw error;
      
    } finally {
      if (client) {
        try {
          client.release();
        } catch (releaseError) {
          logger.warn('⚠️ Error releasing client', { error: releaseError.message });
        }
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError || new Error('Database query failed after all retries');
};

// Database health monitoring function
const getPoolStats = () => {
  if (!pool) {
    return {
      connected: false,
      error: 'Pool not initialized'
    };
  }
  
  return {
    connected: dbStatus.connected,
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    connectionCount: dbStatus.connectionCount,
    lastError: dbStatus.lastError ? {
      message: dbStatus.lastError.message,
      code: dbStatus.lastError.code
    } : null,
    lastConnectionAttempt: dbStatus.lastConnectionAttempt
  };
};

// Graceful shutdown function
const closePool = async () => {
  if (pool) {
    logger.info('🔒 Closing database pool...');
    try {
      await pool.end();
      logger.info('✅ Database pool closed successfully');
    } catch (error) {
      logger.error('❌ Error closing database pool', { error: error.message });
    }
  }
};

// Periodic health check (every 30 seconds)
let healthCheckInterval;
if (process.env.NODE_ENV !== 'test') {
  healthCheckInterval = setInterval(async () => {
    try {
      const health = await testConnection();
      if (!health.connected) {
        logger.warn('🚨 Periodic health check failed - attempting reconnection');
        await initializePool();
      }
    } catch (error) {
      logger.error('❌ Periodic health check error', { error: error.message });
    }
  }, 30000);
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  logger.info('👋 Received SIGINT, closing database connections...');
  if (healthCheckInterval) clearInterval(healthCheckInterval);
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('👋 Received SIGTERM, closing database connections...');
  if (healthCheckInterval) clearInterval(healthCheckInterval);
  await closePool();
  process.exit(0);
});

module.exports = {
  pool: () => pool, // Return pool as function to ensure it's always current
  query,
  testConnection,
  getPoolStats,
  closePool,
  initializePool,
  dbStatus: () => ({ ...dbStatus }) // Return copy of status
};