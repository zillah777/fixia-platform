/**
 * Middleware Configuration - Centralized middleware setup
 * @fileoverview Configures all Express middleware in the correct order
 */
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

/**
 * Security middleware configuration
 */
const securityConfig = {
  helmet: {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Demasiadas solicitudes desde esta IP' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  }
};

/**
 * ENTERPRISE-GRADE CORS CONFIGURATION
 * Unified CORS configuration with security-first approach
 */
const corsConfig = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, direct server calls)
    if (!origin) return callback(null, true);
    
    // Production and development allowed origins
    const allowedOrigins = [
      // Production domains
      'https://fixia-platform.vercel.app',
      'https://fixia.com.ar',
      'https://www.fixia.com.ar',
      // Development domains
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    // Check exact match first (most secure)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow Vercel preview deployments (only for fixia-platform)
    if (origin.includes('fixia-platform') && origin.includes('vercel.app') && origin.startsWith('https://')) {
      return callback(null, true);
    }
    
    // Block all other origins
    console.warn('🚫 CORS BLOCKED - Unauthorized origin:', origin);
    callback(new Error('CORS: Origin not allowed'));
  },
  
  // Enable credentials for authenticated requests
  credentials: true,
  
  // Allowed HTTP methods
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  
  // Allowed headers (including Cache-Control which was causing the error)
  allowedHeaders: [
    'Origin', 
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization',
    'Cache-Control',      // ✅ CRITICAL: Frontend sends this header
    'Pragma',
    'Expires',
    'X-Custom-Header',
    'X-CSRF-Token',
    'X-API-Version'
  ],
  
  // Headers exposed to the client (for rate limiting and pagination)
  exposedHeaders: [
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset', 
    'Content-Range',
    'X-Content-Range'
  ],
  
  // Preflight cache duration (24 hours)
  maxAge: 86400,
  
  // Handle preflight for all routes
  preflightContinue: false,
  optionsSuccessStatus: 200
};

/**
 * Configure security middleware
 * @param {Express} app - Express application instance
 */
const configureSecurity = (app) => {
  console.log('🔒 Configuring security middleware...');
  
  // Trust proxy for Railway/Vercel deployments
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    console.log('✅ Proxy trust enabled for production');
  }
  
  // Security headers
  app.use(helmet(securityConfig.helmet));
  console.log('✅ Security headers configured');
  
  // Compression
  app.use(compression());
  console.log('✅ Response compression enabled');
  
  // Rate limiting
  app.use(rateLimit(securityConfig.rateLimit));
  console.log('✅ Rate limiting configured');
  
  // CORS - Use proper cors middleware instead of custom headers
  if (process.env.NODE_ENV === 'production') {
    app.use(cors(corsConfig));
    console.log('✅ CORS configured for production');
  } else {
    // Development - allow all origins
    app.use(cors({
      origin: true,
      credentials: true
    }));
    console.log('✅ CORS configured for development (permissive)');
  }
};

/**
 * Configure body parsing middleware
 * @param {Express} app - Express application instance
 */
const configureBodyParsing = (app) => {
  console.log('📝 Configuring body parsing...');
  
  // JSON parsing with size limit
  app.use(express.json({ 
    limit: '5mb',
    type: ['application/json', 'text/plain']
  }));
  
  // URL-encoded parsing
  app.use(express.urlencoded({ 
    extended: true,
    limit: '5mb'
  }));
  
  console.log('✅ Body parsing configured');
};

/**
 * Configure static file serving with proper security
 * @param {Express} app - Express application instance
 */
const configureStaticFiles = (app) => {
  console.log('📁 Configuring static file serving...');
  
  // Static files with security headers (CORS handled by main middleware)
  app.use('/uploads', (req, res, next) => {
    // Log static file requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📁 Static file request:', req.url);
    }
    
    // Security headers for static files (CORS already handled by main middleware)
    res.header('X-Content-Type-Options', 'nosniff');
    
    // Cache control for different file types
    if (req.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      res.header('Cache-Control', 'public, max-age=31536000'); // 1 year for images
    } else if (req.url.match(/\.(pdf|doc|docx)$/i)) {
      res.header('Cache-Control', 'public, max-age=86400'); // 1 day for documents
    }
    
    next();
  }, express.static('uploads', {
    dotfiles: 'deny',
    index: false,
    redirect: false,
    maxAge: '1d'
  }));
  
  console.log('✅ Static file serving configured');
};

/**
 * Configure request logging for development
 * @param {Express} app - Express application instance
 */
const configureLogging = (app) => {
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${req.method} ${req.url}`);
      next();
    });
    console.log('✅ Development logging enabled');
  }
};

/**
 * Apply all middleware in the correct order
 * @param {Express} app - Express application instance
 */
const configureMiddleware = (app) => {
  console.log('⚙️ Configuring Express middleware...');
  
  // Order is important!
  configureLogging(app);        // 1. Logging (first to catch everything)
  configureSecurity(app);       // 2. Security (helmet, rate limiting, CORS)
  configureBodyParsing(app);    // 3. Body parsing
  configureStaticFiles(app);    // 4. Static files (after security, before routes)
  
  console.log('✅ All middleware configured successfully');
};

/**
 * Standalone CORS middleware for secure usage
 */
const corsMiddleware = cors(corsConfig);

module.exports = {
  configureMiddleware,
  securityConfig,
  corsConfig,
  corsMiddleware
};