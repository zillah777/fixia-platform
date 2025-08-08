/**
 * Head Method Handler Middleware
 * Provides automatic HEAD request support for CORS preflight functionality
 * 
 * CORS Flow:
 * 1. Browser sends OPTIONS request (handled by main CORS middleware)
 * 2. Browser may send HEAD request to check endpoint availability
 * 3. Browser sends actual request (POST, GET, etc.)
 */

const logger = require('../utils/logger');

/**
 * Middleware to handle HEAD requests for CORS preflight
 * This ensures that HEAD requests return proper CORS headers without executing route logic
 */
const headMethodHandler = () => {
  return (req, res, next) => {
    if (req.method === 'HEAD') {
      logger.info('HEAD request received', {
        url: req.originalUrl,
        origin: req.headers.origin,
        userAgent: req.headers['user-agent']?.substring(0, 50),
        category: 'cors'
      });

      // Set the same headers as our main CORS middleware
      const origin = req.headers.origin;
      const allowedOrigins = [
        'https://fixia-platform.vercel.app',
        'https://fixia.com.ar',
        'http://localhost:3000',
        'http://localhost:3001'
      ];

      if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
      } else if (origin && origin.includes('fixia-platform') && origin.includes('vercel.app')) {
        res.header('Access-Control-Allow-Origin', origin);
      } else {
        res.header('Access-Control-Allow-Origin', 'https://fixia-platform.vercel.app');
      }

      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma,Expires,X-Custom-Header');
      res.header('Access-Control-Max-Age', '86400');

      // Return successful response without executing route logic
      return res.status(200).end();
    }

    next();
  };
};

/**
 * Router-level HEAD handler for specific routes
 * Use this for routes that need explicit HEAD method support
 */
const addHeadSupport = (router, routes) => {
  routes.forEach(route => {
    router.head(route, (req, res) => {
      logger.debug(`HEAD request handled for route: ${route}`, { category: 'cors' });
      res.status(200).end();
    });
  });
  
  return router;
};

module.exports = {
  headMethodHandler,
  addHeadSupport
};