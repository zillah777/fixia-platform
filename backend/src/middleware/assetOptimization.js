const path = require('path');
const logger = require('../utils/logger');

/**
 * Asset Optimization Middleware - Backward Compatible
 * Enhances existing static file serving without breaking current functionality
 */

// Enhanced cache headers based on file type
const getCacheHeaders = (filePath, environment = process.env.NODE_ENV) => {
  const ext = path.extname(filePath).toLowerCase();
  
  // Different cache strategies based on environment
  const cacheStrategies = {
    production: {
      images: 'public, max-age=31536000, immutable', // 1 year
      assets: 'public, max-age=2592000', // 30 days  
      documents: 'public, max-age=86400' // 1 day
    },
    staging: {
      images: 'public, max-age=86400', // 1 day
      assets: 'public, max-age=3600', // 1 hour
      documents: 'public, max-age=1800' // 30 minutes
    },
    development: {
      images: 'public, max-age=300', // 5 minutes
      assets: 'public, max-age=300',
      documents: 'public, max-age=300'
    }
  };

  const currentStrategy = cacheStrategies[environment] || cacheStrategies.development;

  // Categorize file types
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'].includes(ext)) {
    return currentStrategy.images;
  }
  
  if (['.css', '.js', '.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
    return currentStrategy.assets;
  }
  
  if (['.pdf', '.doc', '.docx', '.txt'].includes(ext)) {
    return currentStrategy.documents;
  }

  // Default cache for other files
  return 'public, max-age=3600';
};

// Compression recommendations middleware
const compressionHeaders = (req, res, next) => {
  const filePath = req.path;
  const ext = path.extname(filePath).toLowerCase();
  
  // Add compression hints for CDN/proxy
  if (['.css', '.js', '.json', '.svg', '.txt'].includes(ext)) {
    res.set('Vary', 'Accept-Encoding');
    
    // Suggest compression to upstream proxies
    if (!res.get('Content-Encoding')) {
      res.set('X-Compress-Hint', 'gzip,br');
    }
  }
  
  next();
};

// Enhanced security headers for different file types
const enhancedSecurityHeaders = (req, res, next) => {
  const filePath = req.path;
  const ext = path.extname(filePath).toLowerCase();
  
  // File-specific security headers
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
    // Already handled by existing middleware, don't override
    next();
    return;
  }
  
  if (ext === '.svg') {
    res.set('Content-Type', 'image/svg+xml');
    res.set('X-Content-Type-Options', 'nosniff');
  }
  
  if (['.css', '.js'].includes(ext)) {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  
  next();
};

// Performance monitoring for static files
const performanceMonitoring = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to measure response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    // Log slow static file requests
    if (duration > 1000) { // More than 1 second
      logger.warn('Slow static file request', {
        path: req.path,
        duration,
        size: res.get('content-length'),
        userAgent: req.get('user-agent')
      });
    }
    
    // Add performance headers for debugging
    if (process.env.NODE_ENV === 'development') {
      res.set('X-Response-Time', `${duration}ms`);
    }
    
    originalEnd.apply(this, args);
  };
  
  next();
};

// Smart cache headers based on file content and type
const smartCacheHeaders = (req, res, next) => {
  const filePath = req.path;
  
  // Don't override existing cache headers
  if (res.get('Cache-Control')) {
    next();
    return;
  }
  
  const cacheHeader = getCacheHeaders(filePath);
  res.set('Cache-Control', cacheHeader);
  
  // Add ETag for better caching (express.static handles this, but ensure it's there)
  if (!res.get('ETag')) {
    res.set('ETag', `"${Date.now()}"`);
  }
  
  next();
};

// Preload hints for critical resources
const addPreloadHints = (req, res, next) => {
  // Only for HTML requests that might benefit from preloading
  if (req.accepts('html') && req.path === '/') {
    const criticalAssets = [
      '</uploads/logo.png>; rel=preload; as=image',
      '</api/services>; rel=prefetch; as=fetch'
    ];
    
    res.set('Link', criticalAssets.join(', '));
  }
  
  next();
};

// Combined optimization middleware - NON-BREAKING
const assetOptimization = (options = {}) => {
  const {
    enableCompression = true,
    enablePerformanceMonitoring = true,
    enableSmartCaching = true,
    enablePreloadHints = false // Conservative default
  } = options;
  
  return (req, res, next) => {
    // Performance monitoring (if enabled)
    if (enablePerformanceMonitoring) {
      performanceMonitoring(req, res, () => {
        
        // Compression headers (if enabled)
        if (enableCompression) {
          compressionHeaders(req, res, () => {
            
            // Enhanced security headers
            enhancedSecurityHeaders(req, res, () => {
              
              // Smart cache headers (if enabled and not already set)
              if (enableSmartCaching) {
                smartCacheHeaders(req, res, () => {
                  
                  // Preload hints (if enabled)
                  if (enablePreloadHints) {
                    addPreloadHints(req, res, next);
                  } else {
                    next();
                  }
                });
              } else {
                next();
              }
            });
          });
        } else {
          next();
        }
      });
    } else {
      next();
    }
  };
};

// Health check for static file performance
const getStaticFileMetrics = () => {
  return {
    cacheStrategy: process.env.NODE_ENV,
    compressionEnabled: true,
    optimizationLevel: 'conservative',
    lastOptimized: new Date().toISOString()
  };
};

module.exports = {
  assetOptimization,
  getCacheHeaders,
  compressionHeaders,
  enhancedSecurityHeaders,
  performanceMonitoring,
  smartCacheHeaders,
  addPreloadHints,
  getStaticFileMetrics
};