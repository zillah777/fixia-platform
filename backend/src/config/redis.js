const Redis = require('ioredis');
const logger = require('../utils/logger');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  // Connection pool
  family: 4,
  // Retry strategy
  retryDelayOnClusterDown: 300,
  enableReadyCheck: true,
  maxLoadingTimeout: 1000
};

// Create Redis instance
let redisClient = null;
let isConnected = false;

const createRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  // Skip Redis in test environment unless explicitly enabled
  if (process.env.NODE_ENV === 'test' && !process.env.ENABLE_REDIS_IN_TESTS) {
    logger.info('Redis disabled in test environment');
    return createMockRedis();
  }

  // Skip Redis if explicitly disabled
  if (process.env.DISABLE_REDIS === 'true') {
    logger.info('Redis disabled by DISABLE_REDIS flag');
    return createMockRedis();
  }

  try {
    redisClient = new Redis(redisConfig);

    // Connection event handlers
    redisClient.on('connect', () => {
      logger.info('Redis client connected', {
        category: 'database',
        host: redisConfig.host,
        port: redisConfig.port
      });
    });

    redisClient.on('ready', () => {
      isConnected = true;
      logger.info('Redis client ready for commands', {
        category: 'database'
      });
    });

    redisClient.on('error', (error) => {
      isConnected = false;
      logger.error('Redis client error', error, {
        category: 'database',
        host: redisConfig.host,
        port: redisConfig.port
      });
    });

    redisClient.on('close', () => {
      isConnected = false;
      logger.warn('Redis client connection closed', {
        category: 'database'
      });
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting...', {
        category: 'database'
      });
    });

    redisClient.on('end', () => {
      isConnected = false;
      logger.info('Redis client connection ended', {
        category: 'database'
      });
    });

    return redisClient;
  } catch (error) {
    logger.error('Failed to create Redis client', error, {
      category: 'database'
    });
    return createMockRedis();
  }
};

// Mock Redis for development/testing when Redis is not available
const createMockRedis = () => {
  const mockRedis = {
    isConnected: false,
    isMock: true,
    
    // Basic Redis commands with mock implementations
    async get(key) {
      logger.debug(`Mock Redis GET: ${key}`, { category: 'cache' });
      return null;
    },
    
    async set(key, value, ...args) {
      logger.debug(`Mock Redis SET: ${key}`, { category: 'cache' });
      return 'OK';
    },
    
    async del(key) {
      logger.debug(`Mock Redis DEL: ${key}`, { category: 'cache' });
      return 1;
    },
    
    async exists(key) {
      logger.debug(`Mock Redis EXISTS: ${key}`, { category: 'cache' });
      return 0;
    },
    
    async expire(key, seconds) {
      logger.debug(`Mock Redis EXPIRE: ${key} (${seconds}s)`, { category: 'cache' });
      return 1;
    },
    
    async ttl(key) {
      logger.debug(`Mock Redis TTL: ${key}`, { category: 'cache' });
      return -1;
    },
    
    async hget(key, field) {
      logger.debug(`Mock Redis HGET: ${key}.${field}`, { category: 'cache' });
      return null;
    },
    
    async hset(key, field, value) {
      logger.debug(`Mock Redis HSET: ${key}.${field}`, { category: 'cache' });
      return 1;
    },
    
    async hdel(key, field) {
      logger.debug(`Mock Redis HDEL: ${key}.${field}`, { category: 'cache' });
      return 1;
    },
    
    async sadd(key, ...members) {
      logger.debug(`Mock Redis SADD: ${key}`, { category: 'cache' });
      return members.length;
    },
    
    async smembers(key) {
      logger.debug(`Mock Redis SMEMBERS: ${key}`, { category: 'cache' });
      return [];
    },
    
    async srem(key, ...members) {
      logger.debug(`Mock Redis SREM: ${key}`, { category: 'cache' });
      return members.length;
    },
    
    async flushdb() {
      logger.debug('Mock Redis FLUSHDB', { category: 'cache' });
      return 'OK';
    },
    
    async ping() {
      logger.debug('Mock Redis PING', { category: 'cache' });
      return 'PONG';
    },
    
    async quit() {
      logger.debug('Mock Redis QUIT', { category: 'cache' });
      return 'OK';
    },
    
    async disconnect() {
      logger.debug('Mock Redis DISCONNECT', { category: 'cache' });
      return 'OK';
    }
  };
  
  logger.warn('Using mock Redis client (Redis not available)', {
    category: 'cache'
  });
  
  return mockRedis;
};

// Get Redis client instance
const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
};

// Check if Redis is connected
const isRedisConnected = () => {
  return isConnected && redisClient && !redisClient.isMock;
};

// Test Redis connection
const testRedisConnection = async () => {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    
    if (result === 'PONG') {
      logger.info('Redis connection test successful', {
        category: 'database'
      });
      return true;
    } else {
      logger.warn('Redis connection test failed - unexpected response', {
        category: 'database',
        response: result
      });
      return false;
    }
  } catch (error) {
    logger.error('Redis connection test failed', error, {
      category: 'database'
    });
    return false;
  }
};

// Graceful shutdown
const disconnectRedis = async () => {
  if (redisClient && !redisClient.isMock) {
    try {
      await redisClient.quit();
      logger.info('Redis client disconnected gracefully', {
        category: 'database'
      });
    } catch (error) {
      logger.error('Error disconnecting Redis client', error, {
        category: 'database'
      });
    }
  }
};

// Cache key generators
const generateCacheKey = (prefix, ...parts) => {
  return `fixia:${prefix}:${parts.join(':')}`;
};

// Common cache keys
const CACHE_KEYS = {
  USER: (userId) => generateCacheKey('user', userId),
  SERVICE: (serviceId) => generateCacheKey('service', serviceId),
  SERVICES_LIST: (filters) => generateCacheKey('services', 'list', JSON.stringify(filters)),
  USER_SERVICES: (userId) => generateCacheKey('user', userId, 'services'),
  CATEGORIES: () => generateCacheKey('categories'),
  USER_SESSION: (userId) => generateCacheKey('session', userId),
  RATE_LIMIT: (ip, endpoint) => generateCacheKey('rate_limit', ip, endpoint),
  EMAIL_VERIFICATION: (token) => generateCacheKey('email_verification', token),
  PASSWORD_RESET: (token) => generateCacheKey('password_reset', token),
  SEARCH_RESULTS: (query, filters) => generateCacheKey('search', query, JSON.stringify(filters))
};

// Default cache TTL values (in seconds)
const CACHE_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes  
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400 // 24 hours
};

module.exports = {
  getRedisClient,
  isRedisConnected,
  testRedisConnection,
  disconnectRedis,
  generateCacheKey,
  CACHE_KEYS,
  CACHE_TTL,
  createRedisClient
};