/**
 * Debug middleware for user routes
 * Logs request details to help identify photo upload issues
 */

const { logger } = require('../utils/smartLogger');

const debugUserRoutes = (req, res, next) => {
  const routeInfo = {
    method: req.method,
    url: req.originalUrl,
    route: req.route?.path || 'unknown',
    hasToken: !!req.headers.authorization,
    tokenPrefix: req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'none',
    contentType: req.headers['content-type'],
    hasFile: !!req.file,
    bodyKeys: req.body ? Object.keys(req.body) : [],
    hasUser: !!req.user,
    userId: req.user?.id || 'not-set',
    userAgent: req.headers['user-agent']
  };

  logger.info('🔍 User route debug', routeInfo);

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    logger.info('📤 User route response', {
      url: req.originalUrl,
      status: res.statusCode,
      success: data?.success,
      error: data?.error,
      hasUser: !!req.user
    });
    return originalJson.call(this, data);
  };

  next();
};

module.exports = { debugUserRoutes };