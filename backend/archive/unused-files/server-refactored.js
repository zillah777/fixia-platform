/**
 * Fixia Production Server - Refactored Architecture
 * @fileoverview Clean, maintainable production server with proper separation of concerns
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import configuration modules
const { testConnection } = require('./src/config/database');
const { configureMiddleware } = require('./src/config/middleware');
const { configureRoutes, getRouteStats } = require('./src/config/routes');

console.log('🚀 Starting Fixia Production Server (Refactored)...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('📍 Port:', process.env.PORT || 8080);

/**
 * Ensure required directories exist
 */
const ensureDirectories = () => {
  const directories = [
    'uploads',
    'uploads/profiles', 
    'uploads/services',
    'uploads/documents',
    'uploads/certificates',
    'uploads/portfolio',
    'uploads/portfolios',
    'uploads/verifications'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

/**
 * Configure core endpoints
 */
const configureCoreEndpoints = (app) => {
  console.log('⚙️ Configuring core endpoints...');

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      version: 'production-refactored-v2.0',
      environment: process.env.NODE_ENV
    });
  });

  // Server statistics endpoint
  app.get('/stats', (req, res) => {
    const routeStats = getRouteStats();
    res.json({
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: 'refactored-v2.0'
      },
      routes: routeStats,
      timestamp: new Date().toISOString()
    });
  });

  // Email verification redirect (compatibility)
  app.get('/verificar-email', (req, res) => {
    const { token, type } = req.query;
    
    if (!token) {
      return res.redirect('https://fixia-platform.vercel.app/auth/login?error=token-missing');
    }
    
    res.redirect(`https://fixia-platform.vercel.app/verificar-email?token=${token}&type=${type || 'customer'}`);
  });

  // Password reset redirect (compatibility)
  app.get('/recuperar-password', (req, res) => {
    const { token } = req.query;
    
    if (!token) {
      return res.redirect('https://fixia-platform.vercel.app/auth/login?error=token-missing');
    }
    
    res.redirect(`https://fixia-platform.vercel.app/recuperar-password?token=${token}`);
  });

  console.log('✅ Core endpoints configured');
};

/**
 * Configure specialized route modules
 */
const configureSpecializedRoutes = (app) => {
  console.log('🔧 Configuring specialized routes...');

  // Debug routes (development/staging only)
  if (process.env.NODE_ENV !== 'production') {
    try {
      app.use('/debug', require('./src/routes/debug'));
      console.log('✅ Debug routes loaded');
    } catch (error) {
      console.error('❌ Debug routes failed:', error.message);
    }
  }

  // Database fixes routes (admin only)
  try {
    app.use('/database-fixes', require('./src/routes/database-fixes'));
    console.log('✅ Database fixes routes loaded');
  } catch (error) {
    console.error('❌ Database fixes routes failed:', error.message);
  }

  console.log('✅ Specialized routes configured');
};

/**
 * Configure error handling
 */
const configureErrorHandling = (app) => {
  console.log('🛡️ Configuring error handling...');

  // 404 handler
  app.use('*', (req, res) => {
    console.log('❓ Unknown route:', req.method, req.originalUrl);
    res.status(404).json({
      error: 'Endpoint no encontrado',
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date().toISOString()
    });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('💥 Server error:', err.message);
    
    // Log full error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error stack:', err.stack);
    }

    res.status(err.status || 500).json({
      error: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { 
        details: err.message,
        stack: err.stack 
      })
    });
  });

  console.log('✅ Error handling configured');
};

/**
 * Start the Express server
 */
const startServer = async () => {
  try {
    const app = express();
    const PORT = process.env.PORT || 8080;

    // 1. Ensure directories exist
    ensureDirectories();

    // 2. Test database connection
    console.log('🔌 Testing database connection...');
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log('✅ Database connected successfully');
    } else {
      console.warn('⚠️ Database connection failed - server will continue but may not function properly');
    }

    // 3. Configure middleware (security, CORS, body parsing, static files)
    configureMiddleware(app);

    // 4. Configure core endpoints
    configureCoreEndpoints(app);

    // 5. Configure specialized routes
    configureSpecializedRoutes(app);

    // 6. Configure main API routes
    const routeStats = configureRoutes(app);
    console.log(`🎯 API routes configured: ${routeStats.loaded}/${routeStats.total} loaded`);

    // 7. Configure error handling (must be last)
    configureErrorHandling(app);

    // 8. Start listening
    app.listen(PORT, () => {
      console.log('🎉 ═══════════════════════════════════════');
      console.log(`✅ Fixia Production Server is running!`);
      console.log(`🌐 Port: ${PORT}`);
      console.log(`🔗 Health: http://localhost:${PORT}/health`);
      console.log(`📊 Stats: http://localhost:${PORT}/stats`);
      console.log(`🛠️ Environment: ${process.env.NODE_ENV}`);
      console.log(`📈 Routes loaded: ${routeStats.loaded}/${routeStats.total}`);
      console.log('🎉 ═══════════════════════════════════════');
    });

    return app;

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { startServer };