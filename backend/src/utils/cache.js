/**
 * BASIC CACHING SYSTEM
 * In-memory cache with TTL for frequently accessed static data
 * Designed for Railway deployment - no external dependencies
 * 
 * Engineering approach: Simple, effective, with fallback to database
 */

class BasicCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or null if not found/expired
   */
  get(key) {
    if (this.cache.has(key)) {
      this.stats.hits++;
      return this.cache.get(key);
    }
    this.stats.misses++;
    return null;
  }

  /**
   * Set value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds
   */
  set(key, value, ttlSeconds = 300) { // Default 5 minutes
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set value
    this.cache.set(key, value);
    this.stats.sets++;

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttlSeconds * 1000);

    this.timers.set(key, timer);
  }

  /**
   * Delete from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.stats.deletes++;
    }
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.cache.clear();
    this.timers.clear();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : 0;
    
    return {
      ...this.stats,
      total_requests: total,
      hit_rate_percentage: hitRate,
      cached_items: this.cache.size,
      memory_usage: this.getMemoryEstimate()
    };
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  getMemoryEstimate() {
    let size = 0;
    for (const [key, value] of this.cache.entries()) {
      size += key.length * 2; // 2 bytes per character (UTF-16)
      size += JSON.stringify(value).length * 2;
    }
    return `${(size / 1024).toFixed(2)} KB`;
  }

  /**
   * Get or set pattern - fetch from database if not cached
   * @param {string} key - Cache key
   * @param {Function} fetchFunction - Function to fetch data if not cached
   * @param {number} ttlSeconds - TTL in seconds
   */
  async getOrSet(key, fetchFunction, ttlSeconds = 300) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const data = await fetchFunction();
      this.set(key, data, ttlSeconds);
      return data;
    } catch (error) {
      console.error(`Cache fetch error for key ${key}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const cache = new BasicCache();

/**
 * CACHE CONFIGURATIONS FOR DIFFERENT DATA TYPES
 */
const CACHE_CONFIG = {
  // Static data - cache for 24 hours
  CATEGORIES: { ttl: 86400, key: 'categories' },
  LOCALITIES: { ttl: 86400, key: 'localities:' }, // + province
  
  // Semi-static data - cache for 1 hour  
  USER_STATS: { ttl: 3600, key: 'user_stats:' }, // + user_id
  DASHBOARD_STATS: { ttl: 300, key: 'dashboard_stats' }, // 5 minutes
  
  // Dynamic data - cache for 5 minutes
  SEARCH_RESULTS: { ttl: 300, key: 'search:' }, // + query_hash
  EXPLORER_BROWSE: { ttl: 300, key: 'explorer_browse:' }, // + params_hash
  
  // Profile data - cache for 10 minutes
  AS_PROFILE: { ttl: 600, key: 'as_profile:' }, // + user_id
  EXPLORER_PROFILE: { ttl: 600, key: 'explorer_profile:' } // + user_id
};

/**
 * HELPER FUNCTIONS FOR COMMON CACHING PATTERNS
 */

/**
 * Cache categories data
 */
async function getCachedCategories(fetchFunction) {
  return cache.getOrSet(
    CACHE_CONFIG.CATEGORIES.key,
    fetchFunction,
    CACHE_CONFIG.CATEGORIES.ttl
  );
}

/**
 * Cache localities data by province
 */
async function getCachedLocalities(province, fetchFunction) {
  return cache.getOrSet(
    CACHE_CONFIG.LOCALITIES.key + province,
    fetchFunction,
    CACHE_CONFIG.LOCALITIES.ttl
  );
}

/**
 * Cache user statistics
 */
async function getCachedUserStats(userId, fetchFunction) {
  return cache.getOrSet(
    CACHE_CONFIG.USER_STATS.key + userId,
    fetchFunction,
    CACHE_CONFIG.USER_STATS.ttl
  );
}

/**
 * Cache dashboard statistics
 */
async function getCachedDashboardStats(fetchFunction) {
  return cache.getOrSet(
    CACHE_CONFIG.DASHBOARD_STATS.key,
    fetchFunction,
    CACHE_CONFIG.DASHBOARD_STATS.ttl
  );
}

/**
 * Invalidate cache for specific patterns
 */
function invalidateUserCache(userId) {
  cache.delete(CACHE_CONFIG.USER_STATS.key + userId);
  cache.delete(CACHE_CONFIG.AS_PROFILE.key + userId);
  cache.delete(CACHE_CONFIG.EXPLORER_PROFILE.key + userId);
}

function invalidateStaticCache() {
  cache.delete(CACHE_CONFIG.CATEGORIES.key);
  // Invalidate all localities (would need pattern matching in production)
  cache.clear(); // For now, clear all since we can't pattern match
}

/**
 * Cache middleware for Express routes
 */
function cacheMiddleware(cacheKey, ttlSeconds = 300) {
  return (req, res, next) => {
    const key = typeof cacheKey === 'function' ? cacheKey(req) : cacheKey;
    const cached = cache.get(key);
    
    if (cached !== null) {
      return res.json(cached);
    }
    
    // Store original res.json to intercept and cache response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cache.set(key, data, ttlSeconds);
      return originalJson(data);
    };
    
    next();
  };
}

module.exports = {
  cache,
  CACHE_CONFIG,
  getCachedCategories,
  getCachedLocalities,
  getCachedUserStats,
  getCachedDashboardStats,
  invalidateUserCache,
  invalidateStaticCache,
  cacheMiddleware
};