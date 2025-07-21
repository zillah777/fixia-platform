const cacheService = require('../services/cacheService');
const { CACHE_TTL } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Response caching middleware
 * Caches API responses to improve performance
 */
const cacheResponse = (options = {}) => {
  const {
    ttl = CACHE_TTL.MEDIUM,
    keyGenerator = null,
    condition = null,
    skipIfAuthenticated = false
  } = options;

  return async (req, res, next) => {
    // Skip caching if condition is not met
    if (condition && !condition(req)) {
      return next();
    }

    // Skip caching for authenticated users if specified
    if (skipIfAuthenticated && req.user) {
      return next();
    }

    // Generate cache key
    let cacheKey;
    if (keyGenerator) {
      cacheKey = keyGenerator(req);
    } else {
      const keyParts = [
        req.method,
        req.originalUrl,
        req.user ? req.user.id : 'anonymous'
      ];
      cacheKey = `response:${keyParts.join(':')}`;
    }

    try {
      // Try to get cached response
      const cachedResponse = await cacheService.get(cacheKey);
      
      if (cachedResponse) {
        logger.debug('Cache hit for response', {
          category: 'cache',
          key: cacheKey,
          url: req.originalUrl
        });
        
        // Set cache headers
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        
        return res.status(cachedResponse.statusCode).json(cachedResponse.data);
      }

      // Cache miss - intercept response
      const originalSend = res.send;
      const originalJson = res.json;
      
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const responseData = {
            statusCode: res.statusCode,
            data: data
          };
          
          // Cache the response asynchronously
          cacheService.set(cacheKey, responseData, ttl)
            .then(() => {
              logger.debug('Response cached', {
                category: 'cache',
                key: cacheKey,
                url: req.originalUrl,
                statusCode: res.statusCode
              });
            })
            .catch(error => {
              logger.error('Failed to cache response', error, {
                category: 'cache',
                key: cacheKey,
                url: req.originalUrl
              });
            });
        }
        
        // Set cache headers
        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', cacheKey);
        
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', error, {
        category: 'cache',
        url: req.originalUrl
      });
      
      // Continue without caching if error occurs
      next();
    }
  };
};

/**
 * User data caching middleware
 * Caches user data after authentication
 */
const cacheUserData = () => {
  return async (req, res, next) => {
    if (!req.user) {
      return next();
    }

    try {
      // Check if user data is already cached
      const cachedUser = await cacheService.getCachedUser(req.user.id);
      
      if (cachedUser) {
        logger.debug('Using cached user data', {
          category: 'cache',
          userId: req.user.id
        });
        
        // Update req.user with cached data (might have more fields)
        req.user = { ...req.user, ...cachedUser };
      } else {
        // Cache user data for future requests
        await cacheService.cacheUser(req.user);
        
        logger.debug('User data cached', {
          category: 'cache',
          userId: req.user.id
        });
      }
    } catch (error) {
      logger.error('User caching middleware error', error, {
        category: 'cache',
        userId: req.user?.id
      });
    }

    next();
  };
};

/**
 * Cache invalidation middleware
 * Invalidates cache when data is modified
 */
const invalidateCache = (options = {}) => {
  const {
    patterns = [],
    keys = [],
    userSpecific = false,
    serviceSpecific = false
  } = options;

  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Only invalidate cache for successful operations
      if (data.success && res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate cache asynchronously
        setTimeout(async () => {
          try {
            // Invalidate specific keys
            for (const key of keys) {
              await cacheService.del(key);
            }
            
            // Invalidate user-specific cache
            if (userSpecific && req.user) {
              await cacheService.invalidateUser(req.user.id);
            }
            
            // Invalidate service-specific cache
            if (serviceSpecific) {
              const serviceId = req.params.id || req.params.serviceId || data.service?.id;
              const userId = req.user?.id;
              await cacheService.invalidateServicesCache(serviceId, userId);
            }
            
            logger.debug('Cache invalidated', {
              category: 'cache',
              patterns,
              keys,
              userSpecific,
              serviceSpecific,
              url: req.originalUrl
            });
          } catch (error) {
            logger.error('Cache invalidation error', error, {
              category: 'cache',
              url: req.originalUrl
            });
          }
        }, 0);
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Rate limiting middleware using Redis
 */
const redisRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // requests per window
    keyGenerator = null,
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return async (req, res, next) => {
    try {
      // Generate rate limit key
      let key;
      if (keyGenerator) {
        key = keyGenerator(req);
      } else {
        const identifier = req.user?.id || req.ip;
        const endpoint = req.route?.path || req.originalUrl;
        key = `rate_limit:${identifier}:${endpoint}`;
      }

      const windowSeconds = Math.floor(windowMs / 1000);
      
      // Check rate limit
      const result = await cacheService.rateLimit(key, max, windowSeconds);
      
      // Set rate limit headers
      res.set('X-RateLimit-Limit', max);
      res.set('X-RateLimit-Remaining', result.remaining);
      res.set('X-RateLimit-Reset', result.resetTime);
      
      if (!result.allowed) {
        logger.security('rate_limit_exceeded', {
          key,
          limit: max,
          windowMs
        }, req, req.user);
        
        return res.status(429).json({
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter: result.resetTime
        });
      }
      
      next();
    } catch (error) {
      logger.error('Redis rate limit middleware error', error, {
        category: 'cache',
        url: req.originalUrl
      });
      
      // Fail open - allow request if Redis fails
      next();
    }
  };
};

/**
 * Cache warming middleware
 * Pre-loads commonly accessed data into cache
 */
const warmCache = () => {
  return async (req, res, next) => {
    if (req.method === 'GET' && req.originalUrl === '/api/categories') {
      try {
        // Warm categories cache if empty
        const cachedCategories = await cacheService.getCachedCategories();
        if (!cachedCategories) {
          logger.debug('Warming categories cache', {
            category: 'cache'
          });
        }
      } catch (error) {
        logger.error('Cache warming error', error, {
          category: 'cache'
        });
      }
    }
    
    next();
  };
};

module.exports = {
  cacheResponse,
  cacheUserData,
  invalidateCache,
  redisRateLimit,
  warmCache
};