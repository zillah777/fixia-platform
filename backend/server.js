const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Initialize Sentry first
const { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } = require('./src/config/sentry');
const logger = require('./src/utils/logger');
const { requestLogger, errorLogger, rateLimitLogger } = require('./src/middleware/logging');

// Initialize Redis and Cache
const { testRedisConnection, disconnectRedis } = require('./src/config/redis');
const { cacheResponse, cacheUserData, warmCache } = require('./src/middleware/redisCache');

// Background Job Queue (optional, with graceful fallback)
const jobQueue = require('./src/services/jobQueue');

// Initialize Swagger (optional)
const swaggerConfig = require('./src/config/swagger');

// Asset optimization middleware (optional, non-breaking)
const { assetOptimization } = require('./src/middleware/assetOptimization');

const { testConnection } = require('./src/config/database');
const { authMiddleware } = require('./src/middleware/auth');
const { securityHeaders, validateContentType, validateBodySize, securityLogger } = require('./src/middleware/security');

const app = express();

// Initialize Sentry
initSentry(app);

// Trust proxy for Railway deployment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Sentry request handler (must be first middleware)
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8080;

// Environment-based rate limiting
const rateLimitConfig = process.env.NODE_ENV === 'production' ? {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.url === '/health';
  }
} : {
  windowMs: 15 * 60 * 1000,
  max: 1000, // More permissive in development
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
};

const limiter = rateLimit(rateLimitConfig);

// Request logging middleware
app.use(requestLogger);
app.use(rateLimitLogger);

// Cache warming middleware
app.use(warmCache());

// Middleware to inject Socket.IO
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Production-grade security headers
const helmetConfig = process.env.NODE_ENV === 'production' ? {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "*.vercel.app", "*.railway.app"],
      connectSrc: ["'self'", "*.vercel.app", "*.railway.app"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
} : {
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
};

app.use(helmet(helmetConfig));
app.use(compression());
app.use(securityHeaders);
app.use(securityLogger);
app.use(validateBodySize);

// CORS middleware - direct implementation for better control
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  console.log('🌐 CORS Request:', {
    origin: origin,
    method: req.method,
    url: req.url,
    headers: Object.keys(req.headers)
  });
  
  // Set CORS headers
  if (origin && origin.includes('fixia-platform.vercel.app')) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log('✅ CORS: Allowed fixia-platform.vercel.app');
  } else if (origin && (
    origin.includes('fixia.com.ar') ||
    origin.includes('localhost:3000')
  )) {
    res.header('Access-Control-Allow-Origin', origin);  
    console.log('✅ CORS: Allowed approved origin');
  } else {
    res.header('Access-Control-Allow-Origin', 'https://fixia-platform.vercel.app');
    console.log('✅ CORS: Using default origin');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS: Handling OPTIONS preflight');
    return res.status(200).end();
  }
  
  next();
});
app.use(limiter);
app.use(validateContentType);
app.use(express.json({ limit: '5mb' })); // Reduced from 10mb
app.use(express.urlencoded({ extended: true }));

// Asset optimization middleware (enhances existing static file serving)
app.use('/uploads', assetOptimization({
  enableCompression: true,
  enablePerformanceMonitoring: process.env.NODE_ENV !== 'production', // Only in dev/staging
  enableSmartCaching: false, // Disabled to avoid conflicts with existing cache headers
  enablePreloadHints: false
}));

// CORS-enabled static file serving with security headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for static files
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours cache
  
  // Security headers for uploaded files
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('Content-Security-Policy', "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'");
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Add cache control for images
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    res.header('Cache-Control', 'public, max-age=31536000'); // 1 year
  }
  
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  // Express.static options for security and performance
  dotfiles: 'deny',
  index: false,
  redirect: false,
  setHeaders: (res, path) => {
    // Additional security for specific file types
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.webp')) {
      res.set('Content-Type', 'image/' + path.split('.').pop());
    }
  }
}));

// API Documentation with Swagger (if available)
if (swaggerConfig.isAvailable) {
  app.use('/api-docs', swaggerConfig.swaggerUi.serve, swaggerConfig.swaggerUi.setup(swaggerConfig.specs, swaggerConfig.swaggerOptions));
} else {
  // Fallback endpoint when Swagger is not available
  app.get('/api-docs', (req, res) => {
    res.json({
      message: 'API Documentation not available',
      reason: 'Swagger modules not installed',
      alternative: 'See README-API.md for API documentation'
    });
  });
}

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-07-21T12:00:00.000Z
 *                 uptime:
 *                   type: number
 *                   example: 3600.5
 *                   description: Server uptime in seconds
 *                 version:
 *                   type: string
 *                   example: v1.0.1-auth-fix
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: 'v1.0.1-auth-fix' // Force Railway redeploy
  });
});

// API Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/email-verification', require('./src/routes/email-verification'));
app.use('/api/test-email', require('./src/routes/test-email'));
app.use('/api/users', authMiddleware, require('./src/routes/users'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/localities', require('./src/routes/localities'));
app.use('/api/services', require('./src/routes/services'));
app.use('/api/bookings', authMiddleware, require('./src/routes/bookings'));
app.use('/api/reviews', authMiddleware, require('./src/routes/reviews'));
app.use('/api/chat', authMiddleware, require('./src/routes/chat'));
app.use('/api/payments', authMiddleware, require('./src/routes/payments'));
app.use('/api/notifications', authMiddleware, require('./src/routes/notifications'));
app.use('/api/professionals', require('./src/routes/professionals'));
app.use('/api/subscriptions', require('./src/routes/subscriptions'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/ranking', require('./src/routes/ranking'));
app.use('/api/badges', require('./src/routes/badges'));
app.use('/api/as-premium', require('./src/routes/as-premium'));
app.use('/api/as-settings', require('./src/routes/as-settings'));
app.use('/api/service-management', require('./src/routes/service-management'));
app.use('/api/smart-search', require('./src/routes/smart-search'));
app.use('/api/promotional-subscriptions', require('./src/routes/promotional-subscriptions'));
app.use('/api/availability-status', require('./src/routes/availability-status'));
app.use('/api/explorer', require('./src/routes/explorer'));
app.use('/api/as-interests', require('./src/routes/as-interests'));
app.use('/api/explorer-chat', require('./src/routes/explorer-chat'));
app.use('/api/explorer-reviews', require('./src/routes/explorer-reviews'));
app.use('/api/as-reviews', require('./src/routes/as-reviews'));
app.use('/api/mutual-confirmation', require('./src/routes/mutual-confirmation'));
app.use('/api/role-switching', require('./src/routes/role-switching'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/verification', require('./src/routes/verification'));
app.use('/api/system', require('./src/routes/system-status'));

// Socket.IO connection handling
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  socket.join(`user_${socket.userId}`);
  
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
  });
  
  socket.on('send_message', (data) => {
    socket.to(`chat_${data.chatId}`).emit('new_message', data);
  });
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Error handling middleware
app.use(errorLogger);
app.use(sentryErrorHandler());
app.use((err, req, res, next) => {
  // Log error (already logged by errorLogger, but this is fallback)
  logger.error('Unhandled error in request', err, {
    request: {
      method: req.method,
      originalUrl: req.originalUrl,
      ip: req.ip
    },
    user: req.user
  });
  
  res.status(err.statusCode || 500).json({
    error: 'Algo salió mal en el servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado'
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection but don't fail if it's not available
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️  Database not connected, but starting server anyway');
      console.warn('⚠️  Some endpoints may not work until database is available');
    }

    // Test Redis connection but don't fail if it's not available
    const redisConnected = await testRedisConnection();
    if (!redisConnected) {
      console.warn('⚠️  Redis not connected, falling back to in-memory cache');
      console.warn('⚠️  Performance may be reduced without Redis');
    } else {
      console.log('✅ Redis connected successfully');
    }

    // Initialize background job queue (optional, graceful fallback)
    const jobQueueInitialized = jobQueue.initialize();
    if (jobQueueInitialized) {
      console.log('✅ Background job queue system initialized');
    } else {
      console.warn('⚠️  Job queue not available, jobs will run synchronously');
    }
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      
      if (!dbConnected) {
        console.log('🔄 Will retry database connection on first API request');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully...`, {
    category: 'server'
  });

  // Close server
  server.close(() => {
    logger.info('HTTP server closed', { category: 'server' });
  });

  // Disconnect Redis
  await disconnectRedis();

  // Close job queues
  await jobQueue.closeQueues();

  // Exit process
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error, { category: 'server' });
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', new Error(reason), {
    category: 'server',
    promise: promise.toString()
  });
  gracefulShutdown('unhandledRejection');
});

startServer();

module.exports = { app, io };