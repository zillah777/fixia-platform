const { getRedisClient, CACHE_KEYS, CACHE_TTL } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Cache Service - High-level caching abstraction for Fixia platform
 * Provides convenient methods for common caching patterns
 */
class CacheService {
  constructor() {
    this.redis = getRedisClient();
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached value or null
   */
  async get(key) {
    try {
      const start = Date.now();
      const value = await this.redis.get(key);
      const duration = Date.now() - start;
      
      logger.performance('cache_get', duration, 100, {
        key,
        hit: value !== null,
        category: 'cache'
      });
      
      if (value) {
        try {
          return JSON.parse(value);
        } catch (error) {
          logger.warn('Failed to parse cached JSON value', {
            category: 'cache',
            key,
            error: error.message
          });
          return value;
        }
      }
      
      return null;
    } catch (error) {
      logger.error('Cache get operation failed', error, {
        category: 'cache',
        key
      });
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttl = CACHE_TTL.MEDIUM) {
    try {
      const start = Date.now();
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      let result;
      if (ttl > 0) {
        result = await this.redis.set(key, serializedValue, 'EX', ttl);
      } else {
        result = await this.redis.set(key, serializedValue);
      }
      
      const duration = Date.now() - start;
      
      logger.performance('cache_set', duration, 100, {
        key,
        ttl,
        size: serializedValue.length,
        category: 'cache'
      });
      
      return result === 'OK';
    } catch (error) {
      logger.error('Cache set operation failed', error, {
        category: 'cache',
        key,
        ttl
      });
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async del(key) {
    try {
      const result = await this.redis.del(key);
      
      logger.debug('Cache delete operation', {
        category: 'cache',
        key,
        deleted: result > 0
      });
      
      return result > 0;
    } catch (error) {
      logger.error('Cache delete operation failed', error, {
        category: 'cache',
        key
      });
      return false;
    }
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Existence status
   */
  async exists(key) {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists operation failed', error, {
        category: 'cache',
        key
      });
      return false;
    }
  }

  /**
   * Get time to live for a key
   * @param {string} key - Cache key
   * @returns {Promise<number>} - TTL in seconds (-1 if no expiry, -2 if key doesn't exist)
   */
  async ttl(key) {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      logger.error('Cache TTL operation failed', error, {
        category: 'cache',
        key
      });
      return -2;
    }
  }

  /**
   * Set expiry for a key
   * @param {string} key - Cache key
   * @param {number} seconds - Expiry time in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async expire(key, seconds) {
    try {
      const result = await this.redis.expire(key, seconds);
      return result === 1;
    } catch (error) {
      logger.error('Cache expire operation failed', error, {
        category: 'cache',
        key,
        seconds
      });
      return false;
    }
  }

  /**
   * Get or set pattern - fetch from cache or execute function and cache result
   * @param {string} key - Cache key
   * @param {Function} fetchFunction - Function to execute if cache miss
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} - Cached or fetched value
   */
  async getOrSet(key, fetchFunction, ttl = CACHE_TTL.MEDIUM) {
    try {
      // Try to get from cache first
      const cachedValue = await this.get(key);
      if (cachedValue !== null) {
        logger.debug('Cache hit', {
          category: 'cache',
          key
        });
        return cachedValue;
      }

      // Cache miss - execute function
      logger.debug('Cache miss - executing fetch function', {
        category: 'cache',
        key
      });
      
      const start = Date.now();
      const value = await fetchFunction();
      const fetchDuration = Date.now() - start;
      
      logger.performance('cache_fetch_function', fetchDuration, 1000, {
        key,
        category: 'cache'
      });

      // Cache the result if it's not null/undefined
      if (value !== null && value !== undefined) {
        await this.set(key, value, ttl);
      }

      return value;
    } catch (error) {
      logger.error('Cache getOrSet operation failed', error, {
        category: 'cache',
        key
      });
      
      // If caching fails, still try to execute the fetch function
      try {
        return await fetchFunction();
      } catch (fetchError) {
        logger.error('Fetch function also failed after cache error', fetchError, {
          category: 'cache',
          key
        });
        throw fetchError;
      }
    }
  }

  /**
   * Cache user data
   * @param {Object} user - User object
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async cacheUser(user, ttl = CACHE_TTL.LONG) {
    if (!user || !user.id) {
      return false;
    }
    
    const key = CACHE_KEYS.USER(user.id);
    return await this.set(key, user, ttl);
  }

  /**
   * Get cached user data
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} - User object or null
   */
  async getCachedUser(userId) {
    const key = CACHE_KEYS.USER(userId);
    return await this.get(key);
  }

  /**
   * Invalidate user cache
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async invalidateUser(userId) {
    const keys = [
      CACHE_KEYS.USER(userId),
      CACHE_KEYS.USER_SERVICES(userId),
      CACHE_KEYS.USER_SESSION(userId)
    ];
    
    const results = await Promise.all(keys.map(key => this.del(key)));
    return results.some(result => result);
  }

  /**
   * Cache service data
   * @param {Object} service - Service object
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async cacheService(service, ttl = CACHE_TTL.LONG) {
    if (!service || !service.id) {
      return false;
    }
    
    const key = CACHE_KEYS.SERVICE(service.id);
    return await this.set(key, service, ttl);
  }

  /**
   * Get cached service data
   * @param {number} serviceId - Service ID
   * @returns {Promise<Object|null>} - Service object or null
   */
  async getCachedService(serviceId) {
    const key = CACHE_KEYS.SERVICE(serviceId);
    return await this.get(key);
  }

  /**
   * Cache services list
   * @param {Object} filters - Filter parameters
   * @param {Array} services - Services array
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async cacheServicesList(filters, services, ttl = CACHE_TTL.MEDIUM) {
    const key = CACHE_KEYS.SERVICES_LIST(filters);
    return await this.set(key, services, ttl);
  }

  /**
   * Get cached services list
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array|null>} - Services array or null
   */
  async getCachedServicesList(filters) {
    const key = CACHE_KEYS.SERVICES_LIST(filters);
    return await this.get(key);
  }

  /**
   * Cache categories
   * @param {Array} categories - Categories array
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async cacheCategories(categories, ttl = CACHE_TTL.VERY_LONG) {
    const key = CACHE_KEYS.CATEGORIES();
    return await this.set(key, categories, ttl);
  }

  /**
   * Get cached categories
   * @returns {Promise<Array|null>} - Categories array or null
   */
  async getCachedCategories() {
    const key = CACHE_KEYS.CATEGORIES();
    return await this.get(key);
  }

  /**
   * Invalidate services cache (when service is created/updated/deleted)
   * @param {number} serviceId - Service ID (optional)
   * @param {number} userId - User ID (optional)
   * @returns {Promise<void>}
   */
  async invalidateServicesCache(serviceId = null, userId = null) {
    const patterns = ['fixia:services:list:*'];
    
    if (serviceId) {
      await this.del(CACHE_KEYS.SERVICE(serviceId));
    }
    
    if (userId) {
      await this.del(CACHE_KEYS.USER_SERVICES(userId));
    }

    // Note: In a real Redis deployment, you might want to use SCAN to find and delete pattern matches
    // For now, we'll just clear the categories cache as services changes might affect category counts
    await this.del(CACHE_KEYS.CATEGORIES());
    
    logger.info('Services cache invalidated', {
      category: 'cache',
      serviceId,
      userId
    });
  }

  /**
   * Rate limiting using Redis
   * @param {string} key - Rate limit key (usually IP + endpoint)
   * @param {number} limit - Request limit
   * @param {number} windowSeconds - Time window in seconds
   * @returns {Promise<{allowed: boolean, remaining: number, resetTime: number}>}
   */
  async rateLimit(key, limit, windowSeconds) {
    try {
      const current = await this.redis.get(key);
      const now = Math.floor(Date.now() / 1000);
      
      if (!current) {
        // First request
        await this.redis.set(key, 1, 'EX', windowSeconds);
        return {
          allowed: true,
          remaining: limit - 1,
          resetTime: now + windowSeconds
        };
      }
      
      const currentCount = parseInt(current);
      if (currentCount >= limit) {
        const ttl = await this.redis.ttl(key);
        return {
          allowed: false,
          remaining: 0,
          resetTime: now + ttl
        };
      }
      
      // Increment counter
      const newCount = await this.redis.incr(key);
      
      return {
        allowed: true,
        remaining: Math.max(0, limit - newCount),
        resetTime: now + (await this.redis.ttl(key))
      };
    } catch (error) {
      logger.error('Rate limit operation failed', error, {
        category: 'cache',
        key,
        limit,
        windowSeconds
      });
      
      // Fail open - allow request if Redis fails
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: Math.floor(Date.now() / 1000) + windowSeconds
      };
    }
  }

  /**
   * Clear all cache (use with caution!)
   * @returns {Promise<boolean>} - Success status
   */
  async clearAll() {
    try {
      const result = await this.redis.flushdb();
      logger.warn('All cache cleared', {
        category: 'cache'
      });
      return result === 'OK';
    } catch (error) {
      logger.error('Failed to clear all cache', error, {
        category: 'cache'
      });
      return false;
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;