/**
 * Routes Configuration - Centralized route management
 * @fileoverview Manages all API routes with proper error handling and middleware
 */
const { authMiddleware } = require('../middleware/auth');

/**
 * Route configuration object
 * Each route has: path, module, middleware (optional), and error handling
 */
const routeConfig = [
  // Public routes (no authentication required)
  { path: '/api/auth', module: './routes/auth', public: true },
  { path: '/api/categories', module: './routes/categories', public: true },
  { path: '/api/services', module: './routes/services', public: true },
  { path: '/api/professionals', module: './routes/professionals', public: true },
  { path: '/api/localities', module: './routes/localities', public: true },
  { path: '/api/email-verification', module: './routes/email-verification', public: true },
  { path: '/api/subscriptions', module: './routes/subscriptions', public: true },
  { path: '/api/reports', module: './routes/reports', public: true },
  { path: '/api/ranking', module: './routes/ranking', public: true },
  { path: '/api/badges', module: './routes/badges', public: true },
  { path: '/api/smart-search', module: './routes/smart-search', public: true },
  { path: '/api/system', module: './routes/system-status', public: true },
  
  // Development/testing routes
  ...(process.env.NODE_ENV !== 'production' ? [
    { path: '/api/test-email', module: './routes/test-email', public: true }
  ] : []),

  // Protected routes (authentication required)
  { path: '/api/users', module: './routes/users', middleware: [authMiddleware] },
  { path: '/api/dashboard', module: './routes/dashboard', middleware: [authMiddleware] },
  { path: '/api/bookings', module: './routes/bookings', middleware: [authMiddleware] },
  { path: '/api/reviews', module: './routes/reviews', middleware: [authMiddleware] },
  { path: '/api/chat', module: './routes/chat', middleware: [authMiddleware] },
  { path: '/api/payments', module: './routes/payments', middleware: [authMiddleware] },
  { path: '/api/notifications', module: './routes/notifications', middleware: [authMiddleware] },
  
  // AS (Asistente de Servicios) specific routes
  { path: '/api/as-premium', module: './routes/as-premium', middleware: [authMiddleware] },
  { path: '/api/as-settings', module: './routes/as-settings', middleware: [authMiddleware] },
  { path: '/api/as-interests', module: './routes/as-interests', middleware: [authMiddleware] },
  { path: '/api/as-reviews', module: './routes/as-reviews', middleware: [authMiddleware] },
  { path: '/api/service-management', module: './routes/service-management', middleware: [authMiddleware] },
  { path: '/api/availability-status', module: './routes/availability-status', middleware: [authMiddleware] },
  
  // Explorer specific routes
  { path: '/api/explorer', module: './routes/explorer', middleware: [authMiddleware] },
  { path: '/api/explorer-chat', module: './routes/explorer-chat', middleware: [authMiddleware] },
  { path: '/api/explorer-reviews', module: './routes/explorer-reviews', middleware: [authMiddleware] },
  
  // Premium features
  { path: '/api/promotional-subscriptions', module: './routes/promotional-subscriptions', middleware: [authMiddleware] },
  { path: '/api/mutual-confirmation', module: './routes/mutual-confirmation', middleware: [authMiddleware] },
  { path: '/api/role-switching', module: './routes/role-switching', middleware: [authMiddleware] },
  { path: '/api/verification', module: './routes/verification', middleware: [authMiddleware] }
];

/**
 * Load and configure all routes with proper error handling
 * @param {Express} app - Express application instance
 */
const configureRoutes = (app) => {
  let routesLoaded = 0;
  let routesFailed = 0;

  console.log('🔧 Configuring API routes...');

  routeConfig.forEach(({ path, module, middleware = [], public: isPublic }) => {
    try {
      const routeModule = require(module);
      
      // Apply middleware if specified
      if (middleware.length > 0) {
        app.use(path, ...middleware, routeModule);
      } else {
        app.use(path, routeModule);
      }
      
      routesLoaded++;
      console.log(`✅ ${path} ${isPublic ? '(public)' : '(protected)'}`);
      
    } catch (error) {
      routesFailed++;
      console.error(`❌ Failed to load ${path}:`, error.message);
      
      // In production, fail gracefully but log the error
      if (process.env.NODE_ENV === 'production') {
        // Create a fallback route that returns a 503 Service Unavailable
        app.use(path, (req, res) => {
          res.status(503).json({
            error: 'Service temporarily unavailable',
            path: path,
            timestamp: new Date().toISOString()
          });
        });
      }
    }
  });

  console.log(`🎯 Route configuration completed: ${routesLoaded} loaded, ${routesFailed} failed`);
  
  return {
    loaded: routesLoaded,
    failed: routesFailed,
    total: routeConfig.length
  };
};

/**
 * Get route statistics for monitoring
 */
const getRouteStats = () => ({
  total: routeConfig.length,
  public: routeConfig.filter(r => r.public).length,
  protected: routeConfig.filter(r => !r.public).length,
  routes: routeConfig.map(({ path, public: isPublic }) => ({ path, public: isPublic }))
});

module.exports = {
  configureRoutes,
  getRouteStats,
  routeConfig
};