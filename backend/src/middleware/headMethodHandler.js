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

      // CORS headers are already handled by the main CORS middleware
      // No need to manually set CORS headers here - just return successful HEAD response

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