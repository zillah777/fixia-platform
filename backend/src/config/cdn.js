const path = require('path');
const logger = require('../utils/logger');

// CDN Configuration for different environments
const cdnConfig = {
  production: {
    baseUrl: process.env.CDN_BASE_URL || 'https://cdn.fixia.com.ar',
    cloudflareDomain: process.env.CLOUDFLARE_DOMAIN || 'fixia.com.ar',
    imageOptimization: true,
    staticAssets: true,
    cacheHeaders: {
      images: 'public, max-age=31536000, immutable', // 1 year
      assets: 'public, max-age=2592000', // 30 days
      api: 'public, max-age=300' // 5 minutes
    }
  },
  staging: {
    baseUrl: process.env.CDN_BASE_URL || 'https://staging-cdn.fixia.com.ar',
    cloudflareDomain: process.env.CLOUDFLARE_DOMAIN || 'staging.fixia.com.ar',
    imageOptimization: true,
    staticAssets: true,
    cacheHeaders: {
      images: 'public, max-age=86400', // 1 day
      assets: 'public, max-age=3600', // 1 hour
      api: 'public, max-age=60' // 1 minute
    }
  },
  development: {
    baseUrl: 'http://localhost:5000',
    cloudflareDomain: null,
    imageOptimization: false,
    staticAssets: false,
    cacheHeaders: {
      images: 'no-cache',
      assets: 'no-cache',
      api: 'no-cache'
    }
  }
};

const currentEnv = process.env.NODE_ENV || 'development';
const config = cdnConfig[currentEnv] || cdnConfig.development;

// Image optimization settings
const imageOptimization = {
  quality: {
    jpeg: 85,
    webp: 80,
    png: 90
  },
  formats: ['webp', 'jpeg', 'png'],
  sizes: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
    original: null // Keep original size
  },
  progressive: true,
  stripMetadata: true
};

// Asset versioning for cache busting
const getAssetVersion = () => {
  return process.env.ASSET_VERSION || Date.now().toString();
};

// Generate CDN URL for assets
const getCdnUrl = (assetPath, options = {}) => {
  if (!config.staticAssets) {
    return assetPath;
  }

  const { version = true, optimize = false } = options;
  let url = `${config.baseUrl}${assetPath}`;
  
  if (version) {
    const separator = assetPath.includes('?') ? '&' : '?';
    url += `${separator}v=${getAssetVersion()}`;
  }

  if (optimize && config.imageOptimization) {
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}auto=compress,format`;
  }

  return url;
};

// Generate responsive image URLs
const getResponsiveImageUrls = (imagePath, options = {}) => {
  if (!config.imageOptimization) {
    return { original: imagePath };
  }

  const { formats = ['webp', 'jpeg'], sizes = ['thumbnail', 'small', 'medium', 'large'] } = options;
  const urls = {};

  // Generate URLs for different sizes and formats
  sizes.forEach(size => {
    urls[size] = {};
    formats.forEach(format => {
      const sizeConfig = imageOptimization.sizes[size];
      if (sizeConfig) {
        const params = new URLSearchParams({
          w: sizeConfig.width,
          h: sizeConfig.height,
          q: imageOptimization.quality[format] || 80,
          f: format,
          auto: 'compress'
        });
        urls[size][format] = `${config.baseUrl}${imagePath}?${params.toString()}`;
      }
    });
  });

  // Add original
  urls.original = getCdnUrl(imagePath, { optimize: true });

  return urls;
};

// Cache headers middleware
const setCacheHeaders = (type = 'api') => {
  return (req, res, next) => {
    const cacheHeader = config.cacheHeaders[type] || config.cacheHeaders.api;
    res.set('Cache-Control', cacheHeader);
    
    // Add CDN-specific headers
    if (config.cloudflareDomain) {
      res.set('CF-Cache-Level', 'aggressive');
      res.set('CF-Tiered-Cache', 'on');
      
      if (type === 'images') {
        res.set('CF-Polish', 'lossy');
        res.set('CF-Mirage', 'on');
      }
    }

    // Security headers for assets
    if (type === 'images' || type === 'assets') {
      res.set('X-Content-Type-Options', 'nosniff');
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.set('Access-Control-Max-Age', '86400');
    }

    next();
  };
};

// Preload critical resources
const getPreloadHeaders = (criticalAssets = []) => {
  return criticalAssets.map(asset => {
    const { url, as, type } = asset;
    let preloadUrl = getCdnUrl(url);
    
    let header = `<${preloadUrl}>; rel=preload; as=${as}`;
    if (type) {
      header += `; type=${type}`;
    }
    
    return header;
  }).join(', ');
};

// Cloudflare Page Rules Configuration (for documentation)
const cloudflarePRConfig = {
  rules: [
    {
      url: `${config.cloudflareDomain}/uploads/*`,
      settings: {
        'cache_level': 'cache_everything',
        'edge_cache_ttl': 31536000, // 1 year
        'browser_cache_ttl': 31536000,
        'always_online': 'on',
        'security_level': 'medium'
      }
    },
    {
      url: `${config.cloudflareDomain}/api/*`,
      settings: {
        'cache_level': 'bypass',
        'security_level': 'high',
        'bot_fight_mode': 'on'
      }
    },
    {
      url: `${config.cloudflareDomain}/*`,
      settings: {
        'cache_level': 'aggressive',
        'edge_cache_ttl': 86400, // 1 day
        'browser_cache_ttl': 3600, // 1 hour
        'always_online': 'on',
        'minify': {
          'css': 'on',
          'js': 'on',
          'html': 'on'
        }
      }
    }
  ]
};

logger.info('CDN configuration loaded', {
  environment: currentEnv,
  baseUrl: config.baseUrl,
  cloudflare: !!config.cloudflareDomain,
  imageOptimization: config.imageOptimization
});

module.exports = {
  config,
  imageOptimization,
  getCdnUrl,
  getResponsiveImageUrls,
  setCacheHeaders,
  getPreloadHeaders,
  cloudflarePRConfig,
  getAssetVersion
};